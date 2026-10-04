import type { CircuitNetlist, SimulationResult } from '@roboforge/sim-circuit';

export type HintLevel = 0 | 1 | 2 | 3 | 4;

export type OllamaModelTier = 'gemma2:2b' | 'llama3.2:3b' | 'qwen2.5-coder:7b';

export interface CoachMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'safety_alert';
  content: string;
  timestamp: number;
  hintLevel?: HintLevel;
  modelUsed?: string;
  isStreaming?: boolean;
}

export interface CoachContext {
  lessonId?: string;
  lessonTitle?: string;
  lessonObjectives?: string[];
  currentExerciseId?: string;
  circuitNetlist?: CircuitNetlist;
  simulationResult?: SimulationResult;
  recentActions?: string[];
}

export interface SafetyCheckResult {
  isSafe: boolean;
  hazardDetected?: string;
  safetyGuidance?: string;
  requiresAdult: boolean;
}

export interface OllamaStatus {
  available: boolean;
  installedModels: string[];
  recommendedModelInstalled: boolean;
  error?: string;
}
