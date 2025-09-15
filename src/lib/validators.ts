import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255),
});

export const learningProgressSchema = z.object({
  contentId: z.string().uuid(),
  status: z.enum(['not-started', 'in-progress', 'completed']).optional(),
  completionRate: z.number().min(0).max(100).optional(),
  skillPoints: z.number().int().min(0).optional(),
});

export const projectCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  currentProcess: z.any().optional(),
});

export const projectUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['planning', 'analysis', 'design', 'implementation', 'evaluation']).optional(),
  targetProcess: z.any().optional(),
  metrics: z.any().optional(),
});

export const processAnalyzeSchema = z.object({
  projectId: z.string().uuid(),
  process: z.any(),
  goals: z.array(z.string()).default([]),
});

// Community & others
export const caseCreateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const caseUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const questionCreateSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const answerCreateSchema = z.object({
  body: z.string().min(1),
});
