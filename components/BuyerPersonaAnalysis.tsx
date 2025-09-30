import React, { useMemo } from 'react';
import { Realtor, FunnelStage } from '../types';
import { UsersIcon } from './Icons'; // Assuming you have an icon for this

interface BuyerPersonaAnalysisProps {
  realtors: Realtor[];
}

// Helper to find the most common item in an array of strings
const getMostCommon = (arr: (string | null | undefined)[]) => {
  if (arr.length === 0) return 'N/A';
  const counts = arr.reduce((acc, value) => {
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'N/A');
};

const StatCard = ({ title, value }: { title: string, value: string }) => (
    <div className="bg-slate-800/50 p-4 rounded-md">
        <h5 className="text-sm text-slate-400">{title}</h5>
        <p className="text-lg font-bold text-brand-400">{value}</p>
    </div>
);

const BuyerPersonaAnalysis: React.FC<BuyerPersonaAnalysisProps> = ({ realtors }) => {
    const analysis = useMemo(() => {
        const wonRealtors = realtors.filter(r => r.funnel_stage === FunnelStage.Won);
        
        if (wonRealtors.length === 0) return null;

        const totalWon = wonRealtors.length;
        const mostCommonProduction = getMostCommon(wonRealtors.map(r => r.production_level));
        const mostCommonTeamSize = getMostCommon(wonRealtors.map(r => r.team_size));
        const mostCommonTechAdoption = getMostCommon(wonRealtors.map(r => r.tech_adoption));
        const mostCommonLeadSource = getMostCommon(wonRealtors.map(r => r.lead_source));
        
        return {
            totalWon,
            mostCommonProduction,
            mostCommonTeamSize,
            mostCommonTechAdoption,
            mostCommonLeadSource,
        };
    }, [realtors]);

    if (!analysis) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <UsersIcon className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white">Análisis del Perfil de Cliente Ganado</h3>
                <p className="text-slate-500 mt-2 text-center">Aún no hay clientes cerrados para analizar. ¡Sigue trabajando en ese funnel!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Análisis del Perfil de Cliente Ganado</h3>
            <p className="text-slate-400 mb-6">Basado en <span className="font-bold text-white">{analysis.totalWon}</span> cliente(s) cerrado(s).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Nivel de Producción Más Común" value={analysis.mostCommonProduction} />
                <StatCard title="Tamaño de Equipo Más Común" value={analysis.mostCommonTeamSize} />
                <StatCard title="Adopción Tecnológica Más Común" value={analysis.mostCommonTechAdoption} />
                <StatCard title="Fuente de Lead Más Exitosa" value={analysis.mostCommonLeadSource} />
            </div>
        </div>
    );
};

export default BuyerPersonaAnalysis;
