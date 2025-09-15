type Props = {
  title: string;
  description?: string;
  status: string;
  metrics?: Record<string, unknown> | null;
};

export function ProjectDetail({ title, description, status, metrics }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-sm text-slate-600">ステータス: {status}</div>
      {description && <p>{description}</p>}
      {metrics && (
        <pre className="rounded bg-slate-50 p-3 text-xs overflow-x-auto">{JSON.stringify(metrics, null, 2)}</pre>
      )}
    </div>
  );
}

