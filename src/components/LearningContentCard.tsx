import { DifficultyBadge } from './DifficultyBadge';
import { ProgressBar } from './ProgressBar';

type Props = {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aiTopics: string[];
  progress?: number;
};

export function LearningContentCard({ title, difficulty, aiTopics, progress = 0 }: Props) {
  return (
    <div className="rounded border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <DifficultyBadge level={difficulty} />
      </div>
      <div className="text-xs text-slate-600">AIトピック: {aiTopics.join(', ') || '—'}</div>
      <ProgressBar value={progress} />
    </div>
  );
}

