import type { CoachContext, HintLevel } from './types';

export const HINT_LEVEL_NAMES: Record<HintLevel, { title: string; description: string }> = {
  0: {
    title: 'Level 0: Understanding Check',
    description: 'Checks your mental model and clarifies the problem statement.',
  },
  1: {
    title: 'Level 1: Conceptual Nudge',
    description: 'Reminds you of the underlying physical concept without revealing values.',
  },
  2: {
    title: 'Level 2: Point to the Issue',
    description: 'Highlights the specific component, pin, or formula where the discrepancy lies.',
  },
  3: {
    title: 'Level 3: Concrete Next Step',
    description: 'Suggests a specific experiment or action to try on your breadboard.',
  },
  4: {
    title: 'Level 4: Full Explanation',
    description: 'Walks through the complete mathematical solution and principles step-by-step.',
  },
};

/**
 * Builds system prompt enforcing the Socratic method tailored to the selected hint level.
 */
export function buildSystemPrompt(hintLevel: HintLevel = 1): string {
  const levelDirectives: Record<HintLevel, string> = {
    0: 'STRICT RULE FOR LEVEL 0: Do NOT offer technical advice or formula hints yet. Instead, ask the learner 1-2 friendly questions to assess their mental model and what they observe happening.',
    1: "STRICT RULE FOR LEVEL 1: Give a conceptual nudge based on physical principles (like Ohm's law, closed loops, or polarity). Do NOT mention specific component numbers, target resistor values, or calculations.",
    2: 'STRICT RULE FOR LEVEL 2: Point the learner directly toward where the issue or mismatch is occurring in their circuit (e.g. "Notice the current reading on your LED compared to its maximum rating"). Do NOT provide the final calculation or answer.',
    3: 'STRICT RULE FOR LEVEL 3: Give an actionable, concrete next step to try on the breadboard (e.g. "Try adding a resistor in series between the battery positive terminal and the LED anode"). Leave the computation to them.',
    4: 'LEVEL 4 (REVEAL): Provide the full step-by-step mathematical explanation, formula derivation, and worked solution with encouraging reinforcement.',
  };

  return `You are the RoboForge Socratic AI Coach — a patient, warm, and expert robotics mentor teaching school students (ages 12 to 18).

CORE PEDAGOGICAL RULES:
1. Socratic Mentorship: Never spoil answers or give away the solution on Levels 0 through 2. Lead the learner to their own discovery through guiding questions.
2. Positive Reinforcement: Validate effort, normalize mistakes ("That is a classic mistake all roboticists make!"), and encourage active experimentation.
3. Hardware Reality: Relate simulations to physical components (e.g. breadboard holes, resistor color bands, LED flat edge/cathode).
4. Tone: Enthusiastic, accessible, concise (max 3-4 short paragraphs per response), and jargon-free unless explaining a new term.
5. Safety First: Always remind learners of safe low-voltage lab practices.

CURRENT HINT LEVEL: ${hintLevel} (${HINT_LEVEL_NAMES[hintLevel].title})
${levelDirectives[hintLevel]}`;
}

/**
 * Serializes transparent context that the learner can inspect under "What the Coach Can See".
 */
export function buildContextSummary(context: CoachContext): string {
  const parts: string[] = [];

  if (context.lessonTitle) {
    parts.push(`Current Lesson: "${context.lessonTitle}" (ID: ${context.lessonId || 'unknown'})`);
  }
  if (context.lessonObjectives && context.lessonObjectives.length > 0) {
    parts.push(`Objectives:\n${context.lessonObjectives.map(o => `  • ${o}`).join('\n')}`);
  }

  if (context.circuitNetlist) {
    const comps = context.circuitNetlist.components.map(c => {
      const state = context.simulationResult?.componentStates[c.id];
      const stateStr = state
        ? ` -> ${state.status.toUpperCase()}, V=${state.voltage_V}V, I=${state.current_mA}mA`
        : '';
      return `  - ${c.type.toUpperCase()} "${c.label || c.id}" (pins: ${c.pins.map(p => p.nodeId || 'open').join(', ')})${stateStr}`;
    });
    parts.push(
      `Circuit Components (${context.circuitNetlist.components.length}):\n${comps.join('\n')}`,
    );

    if (context.simulationResult?.ercIssues && context.simulationResult.ercIssues.length > 0) {
      const ercStr = context.simulationResult.ercIssues
        .map(i => `  ! [${i.code}] ${i.message}`)
        .join('\n');
      parts.push(`Electrical Rules Check:\n${ercStr}`);
    }
  }

  return parts.join('\n\n');
}

/**
 * Pre-authored hints for AI-off mode when Ollama is unavailable or disabled.
 */
export function getAuthoredHints(topic: string, level: HintLevel): string {
  const fallbackTopic = topic.toLowerCase();

  if (fallbackTopic.includes('led') || fallbackTopic.includes('burnout')) {
    switch (level) {
      case 0:
        return 'What do you notice about the brightness and status of your LED when you close the switch? Does current have an unobstructed path?';
      case 1:
        return 'Recall that LEDs are diodes with almost zero resistance once conducting. What law connects voltage, current, and resistance?';
      case 2:
        return 'Look at the multimeter current reading. If your LED has an absolute maximum rating of 25 mA, is the current within safe bounds?';
      case 3:
        return 'To protect the LED, place a resistor in series between the voltage source and the LED anode. What happens when you insert a 330Ω resistor?';
      case 4:
        return "Solution: Use Ohm's Law: R = (V_source - V_forward) / I_target. For a 9V battery and 2V LED at 20 mA: R = (9 - 2) / 0.02 = 350 Ω. A standard 330Ω or 470Ω resistor keeps the LED bright and completely safe!";
    }
  }

  // Default fallback
  switch (level) {
    case 0:
      return 'What are you trying to accomplish in this step? What did you expect to happen versus what you observed?';
    case 1:
      return 'Remember that electric charges need a continuous closed loop from the positive terminal back to the negative terminal.';
    case 2:
      return 'Inspect the connection points on your breadboard. Are all component pins connected to complete rows without any open gaps?';
    case 3:
      return 'Try measuring the voltage across each component using the Virtual Multimeter to find where voltage is dropping.';
    case 4:
      return 'Check the lesson objectives above. Review each terminal connection step-by-step to complete the circuit loop.';
  }
}
