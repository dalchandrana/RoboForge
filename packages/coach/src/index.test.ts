import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkHardwareSafety,
  buildSystemPrompt,
  buildContextSummary,
  getAuthoredHints,
  checkOllamaHealth,
  streamCoachChat,
  HINT_LEVEL_NAMES,
  type CoachContext,
} from './index';

describe('packages/coach', () => {
  describe('Safety Guardrails (checkHardwareSafety)', () => {
    it('intercepts mains electricity and wall outlet queries', () => {
      const result = checkHardwareSafety('Can I plug my Arduino directly into the wall socket?');
      expect(result.isSafe).toBe(false);
      expect(result.hazardDetected).toBe('MAINS_HIGH_VOLTAGE');
      expect(result.safetyGuidance).toContain('High-Voltage Hazard');
      expect(result.requiresAdult).toBe(true);
    });

    it('intercepts dangerous LiPo battery handling', () => {
      const result = checkHardwareSafety('How do I short a lipo battery to discharge it quickly?');
      expect(result.isSafe).toBe(false);
      expect(result.hazardDetected).toBe('LIPO_CHARGING_HAZARD');
      expect(result.safetyGuidance).toContain('Lithium Polymer');
      expect(result.requiresAdult).toBe(true);
    });

    it('intercepts bypassing fuses or circuit protection', () => {
      const result = checkHardwareSafety('Can I bypass the fuse with a wire?');
      expect(result.isSafe).toBe(false);
      expect(result.hazardDetected).toBe('BYPASS_PROTECTION');
      expect(result.safetyGuidance).toContain('Circuit Protection Rule');
    });

    it('allows safe educational low-voltage questions', () => {
      const result = checkHardwareSafety(
        'Why does my 9V battery circuit need a 330 ohm resistor for the red LED?',
      );
      expect(result.isSafe).toBe(true);
      expect(result.requiresAdult).toBe(false);
    });
  });

  describe('Prompt Builder & Hint Ladder', () => {
    it('defines distinct pedagogical directives for all 5 hint levels', () => {
      expect(HINT_LEVEL_NAMES[0].title).toContain('Understanding Check');
      expect(HINT_LEVEL_NAMES[4].title).toContain('Full Explanation');

      const p0 = buildSystemPrompt(0);
      expect(p0).toContain('LEVEL 0');
      expect(p0).toContain('Do NOT offer technical advice or formula hints');

      const p1 = buildSystemPrompt(1);
      expect(p1).toContain('LEVEL 1');
      expect(p1).toContain('conceptual nudge');

      const p2 = buildSystemPrompt(2);
      expect(p2).toContain('LEVEL 2');
      expect(p2).toContain('Point the learner directly toward where the issue');

      const p3 = buildSystemPrompt(3);
      expect(p3).toContain('LEVEL 3');
      expect(p3).toContain('actionable, concrete next step');

      const p4 = buildSystemPrompt(4);
      expect(p4).toContain('LEVEL 4');
      expect(p4).toContain('step-by-step mathematical explanation');
    });

    it('builds transparent context summary from circuit and lesson state', () => {
      const context: CoachContext = {
        lessonId: 'm01-l01',
        lessonTitle: 'What is Electricity?',
        lessonObjectives: ['Understand charge', 'Identify closed loops'],
        circuitNetlist: {
          id: 'c1',
          version: 1,
          components: [
            {
              id: 'V1',
              type: 'battery',
              label: '9V Battery',
              position: { x: 0, y: 0 },
              rotation: 0,
              properties: { voltage_V: 9 },
              pins: [{ id: 'p1', name: '+', nodeId: 'VCC' }],
            },
          ],
        },
      };

      const summary = buildContextSummary(context);
      expect(summary).toContain('What is Electricity?');
      expect(summary).toContain('Understand charge');
      expect(summary).toContain('BATTERY "9V Battery"');
    });

    it('provides authored hints for AI-off mode', () => {
      const ledHint0 = getAuthoredHints('LED burnout', 0);
      expect(ledHint0).toContain('What do you notice about the brightness');

      const ledHint4 = getAuthoredHints('LED burnout', 4);
      expect(ledHint4).toContain("Ohm's Law");
      expect(ledHint4).toContain('350 Ω');

      const genericHint1 = getAuthoredHints('General circuit', 1);
      expect(genericHint1).toContain('continuous closed loop');
    });
  });

  describe('Ollama Client (Localhost only)', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('reports unavailable when connection is refused or server is down', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      const status = await checkOllamaHealth('http://127.0.0.1:11434');
      expect(status.available).toBe(false);
      expect(status.error).toContain('ECONNREFUSED');
    });

    it('reports installed models when Ollama is running', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          models: [{ name: 'llama3.2:3b' }, { name: 'gemma2:2b' }],
        }),
      });

      const status = await checkOllamaHealth('http://127.0.0.1:11434');
      expect(status.available).toBe(true);
      expect(status.installedModels).toContain('llama3.2:3b');
      expect(status.recommendedModelInstalled).toBe(true);
    });

    it('streams NDJSON tokens from Ollama chat API', async () => {
      const mockChunks = [
        JSON.stringify({ message: { content: 'Remember ' }, done: false }) + '\n',
        JSON.stringify({ message: { content: "Ohm's " }, done: false }) + '\n',
        JSON.stringify({ message: { content: 'Law!' }, done: true }) + '\n',
      ];

      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          for (const chunk of mockChunks) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        },
      });

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const tokens: string[] = [];
      const fullResponse = await streamCoachChat(
        {
          messages: [{ id: '1', role: 'user', content: 'Help me', timestamp: 1 }],
          onToken: t => tokens.push(t),
        },
        'http://127.0.0.1:11434',
      );

      expect(tokens).toEqual(['Remember ', "Ohm's ", 'Law!']);
      expect(fullResponse).toBe("Remember Ohm's Law!");
    });
  });
});
