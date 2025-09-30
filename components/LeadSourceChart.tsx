import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Realtor } from '../types';

interface LeadSourceChartProps {
  realtors: Realtor[];
}

// FIX: Renamed type to `CustomPieLabelRenderProps` to avoid potential naming conflicts with
// the `recharts` library's internal types, which was causing a complex type error.
interface CustomPieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    // FIX: Add index signature to allow for additional properties passed by recharts,
    // which resolves the complex type incompatibility error.
    [x: string]: any;
}

const COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

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
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomPieLabelRenderProps) => {
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