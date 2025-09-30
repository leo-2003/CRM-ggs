import React, { useMemo } from 'react';
import { Realtor, FunnelStage } from '../types';
import KpiCard from './KpiCard';
import FunnelChart from './FunnelChart';
import LeadSourceChart from './LeadSourceChart';
import PainPointsChart from './PainPointsChart';
import BuyerPersonaAnalysis from './BuyerPersonaAnalysis';
import { FUNNEL_STAGES_ORDER } from '../constants';

interface DashboardProps {
  realtors: Realtor[];
}

const Dashboard: React.FC<DashboardProps> = ({ realtors }) => {

  const dashboardData = useMemo(() => {
    const wonRealtors = realtors.filter(r => r.funnel_stage === FunnelStage.Won);
    
    // FIX: Handle null potential_contract_value using `?? 0` to prevent NaN results.
    const mrr = wonRealtors.reduce((acc, r) => acc + (r.potential_contract_value ?? 0) / 12, 0);
    
    const newClientsThisMonth = wonRealtors.filter(r => {
        // FIX: Add guard to prevent crash if last_activity_date is null
        if (!r.last_activity_date) return false;
        const wonDate = new Date(r.last_activity_date);
        const now = new Date();
        return wonDate.getMonth() === now.getMonth() && wonDate.getFullYear() === now.getFullYear();
    }).length;

    const qualifiedLeads = realtors.filter(r => FUNNEL_STAGES_ORDER.indexOf(r.funnel_stage) >= FUNNEL_STAGES_ORDER.indexOf(FunnelStage.Qualified)).length;

    // FIX: Handle null potential_contract_value using `?? 0`.
    const totalPipelineValue = realtors
        .filter(r => r.funnel_stage !== FunnelStage.Won && r.funnel_stage !== FunnelStage.Lost)
        .reduce((sum, r) => sum + (r.potential_contract_value ?? 0), 0);

    // FIX: Handle null potential_contract_value in sorting to prevent incorrect order.
    const topOpportunities = [...realtors]
        .filter(r => r.funnel_stage !== FunnelStage.Won && r.funnel_stage !== FunnelStage.Lost)
        .sort((a, b) => (b.potential_contract_value ?? 0) - (a.potential_contract_value ?? 0))
        .slice(0, 5);

    return {
        mrr,
        newClientsThisMonth,
        qualifiedLeads,
        totalPipelineValue,
        topOpportunities,
    };
  }, [realtors]);

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Dashboard de Agencia GGS</h2>
        
        {/* North Star Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Ingresos Mensuales Recurrentes (MRR)" value={`$${dashboardData.mrr.toFixed(2)}`} />
            <KpiCard title="Nuevos Clientes (Mes Actual)" value={dashboardData.newClientsThisMonth.toString()} />
            <KpiCard title="Leads Calificados" value={dashboardData.qualifiedLeads.toString()} />
            <KpiCard title="Valor Total del Pipeline" value={`$${dashboardData.totalPipelineValue.toLocaleString()}`} />
        </div>
        
        {/* Pipeline and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Funnel de Ventas en Vivo</h3>
                <div className="h-96">
                    <FunnelChart realtors={realtors} />
                </div>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Fuentes de Leads más Efectivas</h3>
                <div className="h-96">
                    <LeadSourceChart realtors={realtors} />
                </div>
            </div>
        </div>
        
        {/* NEW: Pain Points and Buyer Persona Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Puntos de Dolor Más Frecuentes</h3>
                <div className="h-96">
                    <PainPointsChart realtors={realtors} />
                </div>
            </div>
             <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
                <BuyerPersonaAnalysis realtors={realtors} />
            </div>
        </div>

        {/* Top Opportunities */}
        <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 Oportunidades Abiertas</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-3">Nombre Completo</th>
                            <th scope="col" className="px-4 py-3">Agencia</th>
                            <th scope="col" className="px-4 py-3">Etapa del Funnel</th>
                            <th scope="col" className="px-4 py-3 text-right">Valor Potencial</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.topOpportunities.map(realtor => (
                            <tr key={realtor.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium text-white">{realtor.full_name}</td>
                                <td className="px-4 py-3">{realtor.agency}</td>
                                <td className="px-4 py-3">{realtor.funnel_stage}</td>
                                 {/* FIX: Handle null potential_contract_value to prevent crash */}
                                <td className="px-4 py-3 text-right font-semibold text-brand-400">${(realtor.potential_contract_value ?? 0).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;