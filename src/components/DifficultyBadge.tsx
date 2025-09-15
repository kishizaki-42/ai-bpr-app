import clsx from 'classnames';

export function DifficultyBadge({ level }: { level: 'beginner' | 'intermediate' | 'advanced' }) {
  const color =
    level === 'beginner' ? 'bg-green-100 text-green-800' : level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const label = level === 'beginner' ? '初級' : level === 'intermediate' ? '中級' : '上級';
  return <span className={clsx('inline-block px-2 py-0.5 text-xs rounded', color)}>{label}</span>;
}

