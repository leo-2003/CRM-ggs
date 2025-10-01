
import React, { useMemo } from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer, Cell } from 'recharts';
import { Realtor, FunnelStage } from '../types';
import { FUNNEL_STAGES_ORDER, FUNNEL_STAGE_COLORS } from '../constants';

interface FunnelChartProps {
  realtors: Realtor[];
}

// Helper function to determine the best contrasting color (dark or light) for a given background hex color.
const getContrastColor = (hex: string) => {
    // If the hex is not provided, default to a dark color.
    if (!hex) return '#0c192e';
    
    // Strip '#' if it exists.
    const hexcolor = hex.startsWith("#") ? hex.substring(1) : hex;
    
    // Parse the R, G, B values.
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    
    // Calculate YIQ value to determine brightness.
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return dark color for light backgrounds, and white for dark backgrounds.
    // A threshold of 150 is often more balanced than the standard 128.
    return (yiq >= 150) ? '#0c192e' : '#ffffff';
};


// A custom label component for the funnel chart values (the numbers).
// It dynamically sets the text color to ensure it contrasts with the segment's background color.
const CustomizedValueLabel = (props: any) => {
    const { x, y, width, height, value, fill } = props;
    
    // Do not render a label for a value of 0.
    if (value === 0 || value === null || value === undefined) return null;

    // Determine the best text color for the given segment fill.
    const textColor = getContrastColor(fill);

    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill={textColor}
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
            fontSize="16px"
        >
            {value}
        </text>
    );
};


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
          {/* Label for the count, using a custom component to ensure contrast */}
          <LabelList 
            dataKey="value" 
            position="center"
            content={<CustomizedValueLabel />}
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
