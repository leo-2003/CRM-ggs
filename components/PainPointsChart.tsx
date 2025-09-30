import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Realtor } from '../types';

interface PainPointsChartProps {
  realtors: Realtor[];
}

const PainPointsChart: React.FC<PainPointsChartProps> = ({ realtors }) => {
  const chartData = useMemo(() => {
    const painPointCounts: { [key: string]: number } = {};
    
    realtors.forEach(realtor => {
      if (realtor.pain_point_tags && Array.isArray(realtor.pain_point_tags)) {
        realtor.pain_point_tags.forEach(tag => {
          const trimmedTag = tag.trim();
          if (trimmedTag) {
            painPointCounts[trimmedTag] = (painPointCounts[trimmedTag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(painPointCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 pain points
  }, [realtors]);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">No hay datos de puntos de dolor para mostrar. Empieza a añadir etiquetas a tus realtors.</p>
        </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        layout="vertical" 
        data={chartData} 
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis type="number" stroke="#9ca3af" />
        <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#9ca3af" 
            width={120} 
            tick={{ fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#334155',
            color: '#cbd5e1',
          }}
        />
        <Bar dataKey="count" fill="#0ea5e9" barSize={20}>
            <LabelList dataKey="count" position="right" style={{ fill: '#fff' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PainPointsChart;
