"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Item = { period: string; projectsCreated: number; projectsCompleted: number; learningCompleted: number };

export function TimelineChart({ data }: { data: Item[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 12, right: 12, bottom: 8 }}>
          <XAxis dataKey="period" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="projectsCreated" name="PJ開始" stroke="#2563eb" fill="#93c5fd" />
          <Area type="monotone" dataKey="projectsCompleted" name="PJ完了" stroke="#16a34a" fill="#86efac" />
          <Area type="monotone" dataKey="learningCompleted" name="学習完了" stroke="#f59e0b" fill="#fde68a" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

