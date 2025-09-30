
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

    return FUNNEL_STAGES_ORDER
        .filter(stage => stage !== FunnelStage.Lost && stage !== FunnelStage.Nurturing) // Exclude from main funnel viz
        .map(stage => ({
            value: stageCounts[stage] || 0,
            name: stage,
            fill: FUNNEL_STAGE_COLORS[stage],
    }));
  }, [realtors]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsFunnelChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: '#334155',
            color: '#cbd5e1',
          }}
        />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
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
