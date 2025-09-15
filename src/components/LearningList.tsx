"use client";
import { useMemo, useState } from 'react';
import { LearningContentCard } from './LearningContentCard';

type Content = {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ai_topics_text?: string | null;
};

type Progress = {
  content_id: string;
  completion_rate: string | number;
  status: string;
  skill_points: number;
};

export function LearningList({ contents, progress, skills = [] as any[] }: { contents: (Content & { estimated_time?: number | null })[]; progress: Progress[]; skills?: { area: string; level: number; xp?: number }[] }) {
  const [rows, setRows] = useState(progress);
  const map = useMemo(() => new Map(rows.map((p) => [p.content_id, p])), [rows]);

  const recommendation = useMemo(() => {
    // スコア: 未着手 + 所要時間短 + 難易度低 + スキルギャップ大
    const order: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
    const levelByArea = new Map(skills.map((s) => [s.area, s.level]));
    const notStarted = contents.filter((c) => !map.get(c.id) || map.get(c.id)?.status === 'not-started');
    const score = (c: any) => {
      const diff = order[String(c.difficulty)] ?? 1;
      const time = Number(c.estimated_time ?? 60);
      const topics = String((c as any).ai_topics_text || '')
        .split(/[,、\s]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      const gap = topics.reduce((sum: number, t: string) => sum + Math.max(0, 2 - (levelByArea.get(t) ?? 0)), 0);
      // 低いほど優先: diff + time/120 - gap(重み)
      return diff + time / 120 - gap * 0.5;
    };
    return notStarted.sort((a, b) => score(a) - score(b))[0];
  }, [contents, map, skills]);

  async function updateProgress(contentId: string, patch: Partial<Progress>) {
    const res = await fetch('/api/learning/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId, ...normalizePatch(patch) }),
    });
    if (!res.ok) return;
    const json = await res.json();
    setRows((prev) => {
      const others = prev.filter((p) => p.content_id !== contentId);
      return [...others, json.data];
    });
  }

  function normalizePatch(p: Partial<Progress>) {
    const out: any = { ...p };
    if (typeof out.completion_rate === 'string') {
      out.completionRate = Number(out.completion_rate);
      delete out.completion_rate;
    }
    if (typeof out.completionRate === 'string') out.completionRate = Number(out.completionRate);
    if (out.status) out.status = out.status as any;
    if (typeof out.skill_points === 'number') {
      out.skillPoints = out.skill_points;
      delete out.skill_points;
    }
    return out;
  }

  return (
    <div className="space-y-6">
      {recommendation && (
        <div className="rounded border p-4">
          <div className="font-semibold mb-1">おすすめの次のステップ</div>
          <div className="text-sm text-slate-700">{recommendation.title}（難易度: {recommendation.difficulty}）</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contents.map((c) => {
          const p = map.get(c.id);
          const progressValue = p ? Number(p.completion_rate) : 0;
          return (
            <div key={c.id} className="space-y-2">
              <LearningContentCard
                title={c.title}
                difficulty={c.difficulty}
                aiTopics={(c.ai_topics_text || '').split(',').filter(Boolean)}
                progress={progressValue}
              />
              <div className="flex items-center gap-2">
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => updateProgress(c.id, { status: 'in-progress', completion_rate: 10 })}
                >
                  始める
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => updateProgress(c.id, { status: 'completed', completion_rate: 100, skill_points: 10 })}
                >
                  完了
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
