export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LearningContent {
  id: string;
  title: string;
  type: 'video' | 'article' | 'exercise' | 'case-study';
  difficulty: Difficulty;
  aiTopics: string[];
  estimatedTime?: number;
  prerequisites?: string[];
}

export interface UserProgress {
  userId: string;
  contentId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completionRate: number;
  skillPoints: number;
  lastAccessed?: Date;
}

export interface BPRProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  currentProcess?: unknown;
  targetProcess?: unknown;
  status: 'planning' | 'analysis' | 'design' | 'implementation' | 'evaluation';
  metrics?: ProjectMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMetrics {
  timeReduction?: number;
  costSaving?: number;
  qualityImprovement?: number;
  customerSatisfaction?: number;
}

export interface ProcessAnalysisResult {
  processId?: string;
  bottlenecks: Array<{ id: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  inefficiencies: Array<{ id: string; description: string; impact: 'low' | 'medium' | 'high' }>;
  improvementSuggestions: ImprovementSuggestion[];
  aiConfidenceScore: number;
}

export interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  expectedImpact: 'low' | 'medium' | 'high';
  implementationComplexity: 'low' | 'medium' | 'high';
  aiTools: string[];
  estimatedROI?: number;
}

