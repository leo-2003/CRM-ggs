
import React, { useMemo } from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer, Cell } from 'recharts';
import { Realtor, FunnelStage } from '../types';
import { FUNNEL_STAGES_ORDER, FUNNEL_STAGE_COLORS } from '../constants';

interface FunnelChartProps {
  realtors: Realtor[];
}

const FunnelChart: React.FC<FunnelChartProps> = ({ realtors }) => {
  const funnelData = useMemo(() => {
    const stageCounts: { [key in FunnelStage]?: number } = {};
    realtors.forEach(realtor => {
      stageCounts[realtor.funnel_stage] = (stageCounts[realtor.funnel_stage] || 0) + 1;
    });

    // Create the full funnel data, filtering out stages not relevant for the main visualization
    return FUNNEL_STAGES_ORDER
        .filter(stage => stage !== FunnelStage.Lost && stage !== FunnelStage.Nurturing)
        .map(stage => ({
            value: stageCounts[stage] || 0,
            name: stage,
            fill: FUNNEL_STAGE_COLORS[stage],
    }));
  }, [realtors]);

  if (funnelData.every(item => item.value === 0)) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">No hay datos en el funnel para mostrar. Empieza a asignar etapas a tus realtors.</p>
        </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsFunnelChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#334155',
            color: '#cbd5e1',
            borderRadius: '0.5rem',
          }}
        />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          {/* Label for the stage name, placed on the right */}
          <LabelList 
            position="right" 
            fill="#cbd5e1" 
            stroke="none" 
            dataKey="name"
            style={{ fontSize: '14px' }}
          />
          {/* Label for the count, placed in the center of the segment */}
          <LabelList 
            dataKey="value" 
            position="center" 
            stroke="none" 
            fill="#0c192e" // Dark text for contrast on light segments
            fontWeight="bold"
            formatter={(value: number) => (value > 0 ? value : '')} // Don't show '0'
            style={{ fontSize: '16px' }}
           />
          {
            funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))
          }
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );
};

export default FunnelChart;