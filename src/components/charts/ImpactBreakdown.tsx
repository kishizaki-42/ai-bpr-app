"use client";
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';

export function ImpactBreakdown({ data }: { data: { timeReduction: number; costSaving: number; qualityImprovement: number; customerSatisfaction: number } }) {
  const rows = [
    { name: '時間短縮', value: data.timeReduction },
    { name: 'コスト削減', value: data.costSaving },
    { name: '品質向上', value: data.qualityImprovement },
    { name: '顧客満足', value: data.customerSatisfaction },
  ];
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ left: 12, right: 12, bottom: 8 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

