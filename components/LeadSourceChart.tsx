import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Realtor } from '../types';

interface LeadSourceChartProps {
  realtors: Realtor[];
}

// Greatly expanded color library for better visual distinction across many lead sources.
const COLORS = [
    '#38bdf8', // Light Blue
    '#4ade80', // Green
    '#facc15', // Yellow
    '#a78bfa', // Purple
    '#f472b6', // Pink
    '#2dd4bf', // Teal
    '#fb923c', // Orange
    '#f87171', // Red
    '#818cf8', // Indigo
    '#c084fc', // Fuchsia
    '#34d399', // Emerald
    '#fbbf24', // Amber
    '#a3e635', // Lime
    '#67e8f9', // Cyan
    '#e879f9', // Violet
];

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ realtors }) => {
  const chartData = useMemo(() => {
    const sourceCounts: { [key: string]: number } = {};
    realtors.forEach(realtor => {
      const source = realtor.lead_source || "Unknown";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    return Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
  }, [realtors]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: '#334155',
            color: '#cbd5e1',
          }}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={110}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          // FIX: Use `any` for the props type to resolve a complex type incompatibility with Recharts.
          // The library's provided types are not specific enough for the properties injected into the label renderer.
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ color: '#fff' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LeadSourceChart;