import { z } from 'zod';

export const ContentLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type ContentLevel = z.infer<typeof ContentLevelSchema>;

export const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
});

export const LessonFrontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Lesson ID must be kebab-case'),
  title: z.string().min(3),
  path: z.string().min(1),
  module: z.string().min(1),
  order: z.number().int().positive(),
  level: ContentLevelSchema,
  minutes: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
  objectives: z.array(z.string()).min(1).max(4),
  keyIdeas: z.array(z.string()).min(1).max(5),
  tags: z.array(z.string()).default([]),
  glossary: z.array(z.string()).default([]),
  needsHumanVerification: z.boolean().default(false),
  verified: z.boolean().default(false),
  sources: z.array(SourceSchema).default([]),
  license: z.string().default('CC-BY-SA-4.0'),
  authors: z.array(z.string()).min(1),
  locale: z.string().default('en'),
});
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;

// Quiz Schemas
export const QuizChoiceSchema = z.object({
  text: z.string().min(1),
  correct: z.boolean(),
});

export const SingleChoiceQuizItemSchema = z.object({
  type: z.literal('single'),
  prompt: z.string().min(1),
  choices: z.array(QuizChoiceSchema).min(2),
  explanation: z.string().min(1),
});

export const MultiChoiceQuizItemSchema = z.object({
  type: z.literal('multi'),
  prompt: z.string().min(1),
  choices: z.array(QuizChoiceSchema).min(2),
  explanation: z.string().min(1),
});

export const NumericQuizItemSchema = z.object({
  type: z.literal('numeric'),
  prompt: z.string().min(1),
  unit: z.string().min(1),
  answer: z.number(),
  tolerance: z.number().nonnegative(),
  explanation: z.string().min(1),
});

export const OrderQuizItemSchema = z.object({
  type: z.literal('order'),
  prompt: z.string().min(1),
  items: z.array(z.string()).min(2),
  correctOrder: z.array(z.number().int().nonnegative()),
  explanation: z.string().min(1),
});

export const QuizItemSchema = z.discriminatedUnion('type', [
  SingleChoiceQuizItemSchema,
  MultiChoiceQuizItemSchema,
  NumericQuizItemSchema,
  OrderQuizItemSchema,
]);
export type QuizItem = z.infer<typeof QuizItemSchema>;

export const QuizSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  items: z.array(QuizItemSchema).min(1),
});
export type Quiz = z.infer<typeof QuizSchema>;

// Exercise Schemas
export const ExerciseAssertPartSchema = z.object({
  part: z.string().min(1),
  status: z.string().optional(),
  current_mA: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  voltage_V: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
});

export const ExerciseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(['numeric', 'circuit-state', 'arduino-output', 'code-tests']),
  prompt: z.string().min(1),
  start: z.string().optional(),
  assert: z.array(ExerciseAssertPartSchema).optional(),
  tolerance: z.number().optional(),
  targetValue: z.number().optional(),
  hints: z.array(z.string()).min(3, 'Each exercise requires at least 3 staged authored hints'),
  explanation: z.string().min(1),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// Module and Path Schemas
export const ModuleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  lessons: z.array(z.string()).min(1),
});
export type Module = z.infer<typeof ModuleSchema>;

export const PathSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  modules: z.array(z.string()).min(1),
});
export type Path = z.infer<typeof PathSchema>;

// Project & BOM
export const BomItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  spec: z.string().min(1),
  costUSD: z.object({ min: z.number(), max: z.number() }).optional(),
  alternatives: z.array(z.string()).min(1),
  notes: z.string().optional(),
  affiliate: z.boolean().default(false),
});
export type BomItem = z.infer<typeof BomItemSchema>;

export const ProjectFrontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  difficulty: z.number().min(1).max(5),
  minutes: z.number().int().positive(),
  costUSD: z.object({ min: z.number(), max: z.number() }),
  skills: z.array(z.string()),
  kit: z.enum(['starter', 'builder', 'advanced']),
  simulatedTwin: z.string(),
  needsHumanVerification: z.boolean().default(true),
  verifyChecklist: z.array(z.string()).min(1),
});
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

// Validation functions
export function validateLessonFrontmatter(data: unknown): LessonFrontmatter {
  return LessonFrontmatterSchema.parse(data);
}

export function validateQuiz(data: unknown): Quiz {
  return QuizSchema.parse(data);
}

export function validateExercise(data: unknown): Exercise {
  return ExerciseSchema.parse(data);
}

export function validateModule(data: unknown): Module {
  return ModuleSchema.parse(data);
}

export function validatePath(data: unknown): Path {
  return PathSchema.parse(data);
}
