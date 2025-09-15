type Props = { value: number };

export function ProgressBar({ value }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full h-2 bg-slate-200 rounded">
      <div className="h-2 bg-blue-600 rounded" style={{ width: `${v}%` }} />
    </div>
  );
}

