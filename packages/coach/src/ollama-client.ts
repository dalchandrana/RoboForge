import type { OllamaStatus, OllamaModelTier, CoachMessage, HintLevel } from './types';
import { buildSystemPrompt, buildContextSummary } from './prompt-builder';
import type { CoachContext } from './types';

const OLLAMA_HOST = 'http://127.0.0.1:11434';

/**
 * Checks if Ollama is running locally on port 11434 and lists installed models.
 */
export async function checkOllamaHealth(
  host: string = OLLAMA_HOST,
  signal?: AbortSignal,
): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${host}/api/tags`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) {
      return {
        available: false,
        installedModels: [],
        recommendedModelInstalled: false,
        error: `Ollama returned HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const models = (data.models || []).map(m => m.name);
    const hasRecommended = models.some(
      m => m.includes('gemma2') || m.includes('llama3.2') || m.includes('qwen2.5'),
    );

    return {
      available: true,
      installedModels: models,
      recommendedModelInstalled: hasRecommended,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection refused';
    return {
      available: false,
      installedModels: [],
      recommendedModelInstalled: false,
      error: `Ollama is not running on ${host} (${message}). Run 'ollama serve' in your terminal or use AI-Off mode.`,
    };
  }
}

interface StreamOptions {
  model?: OllamaModelTier | string;
  hintLevel?: HintLevel;
  context?: CoachContext;
  messages: CoachMessage[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

/**
 * Streams chat responses from local Ollama via Server-Sent / NDJSON stream.
 */
export async function streamCoachChat(
  options: StreamOptions,
  host: string = OLLAMA_HOST,
): Promise<string> {
  const { model = 'llama3.2:3b', hintLevel = 1, context, messages, signal, onToken } = options;

  // Build system message
  const systemPrompt = buildSystemPrompt(hintLevel);
  const contextSummary = context ? buildContextSummary(context) : '';

  const fullSystemContent = contextSummary
    ? `${systemPrompt}\n\nWHAT I CAN SEE IN THE CURRENT LESSON & CIRCUIT:\n${contextSummary}`
    : systemPrompt;

  const ollamaMessages = [
    { role: 'system', content: fullSystemContent },
    ...messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: ollamaMessages,
      stream: true,
      options: {
        temperature: 0.6,
        top_p: 0.9,
      },
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed with HTTP ${res.status}: ${res.statusText}`);
  }

  if (!res.body) {
    throw new Error('Ollama response body is empty');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as { message?: { content?: string }; done?: boolean };
        const chunk = parsed.message?.content || '';
        if (chunk) {
          accumulated += chunk;
          onToken(chunk);
        }
      } catch {
        // Partial JSON chunk in stream
      }
    }
  }

  return accumulated;
}
