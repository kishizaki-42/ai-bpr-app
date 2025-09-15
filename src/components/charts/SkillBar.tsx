"use client";
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';

type Item = { area: string; level: number; xp?: number };

export function SkillBar({ items }: { items: Item[] }) {
  const data = items.map((s) => ({ name: s.area, レベル: s.level }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 12, right: 12, bottom: 8 }}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="レベル" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

