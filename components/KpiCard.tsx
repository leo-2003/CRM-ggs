
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
  return (
    <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg hover:bg-slate-800/60 transition-colors duration-200">
      <h4 className="text-sm font-medium text-slate-400 mb-1">{title}</h4>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
};

export default KpiCard;
