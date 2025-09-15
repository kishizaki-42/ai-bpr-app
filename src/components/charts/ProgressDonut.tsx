"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function ProgressDonut({ completed, total }: { completed: number; total: number }) {
  const done = Math.max(0, Math.min(completed, total));
  const remaining = Math.max(0, total - done);
  const data = [
    { name: '完了', value: done },
    { name: '未完了', value: remaining },
  ];
  const COLORS = ['#2563eb', '#e5e7eb'];
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} stroke="#fff">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

