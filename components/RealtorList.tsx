import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Realtor, FunnelStage } from '../types';
import { FUNNEL_STAGE_COLORS, FUNNEL_STAGES_ORDER } from '../constants';
import { EditIcon, TrashIcon, DownloadIcon, PlusIcon, InstagramIcon, UsersIcon } from './Icons';

interface RealtorListProps {
  realtors: Realtor[];
  onAddRealtor: () => void;
  onEditRealtor: (realtor: Realtor) => void;
  onDeleteRealtor: (realtorId: string) => void;
  onUpdateRealtorStage: (realtorId: string, newStage: FunnelStage) => void;
}

const RealtorList: React.FC<RealtorListProps> = ({ realtors, onAddRealtor, onEditRealtor, onDeleteRealtor, onUpdateRealtorStage }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Realtor; direction: 'asc' | 'desc' } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredRealtors = useMemo(() => {
    return realtors.filter(realtor =>
      realtor.full_name.toLowerCase().includes(filter.toLowerCase()) ||
      (realtor.agency || '').toLowerCase().includes(filter.toLowerCase()) ||
      (realtor.email || '').toLowerCase().includes(filter.toLowerCase()) ||
      (realtor.instagram_profile_url || '').toLowerCase().includes(filter.toLowerCase())
    );
  }, [realtors, filter]);

  const sortedRealtors = useMemo(() => {
    let sortableItems = [...filteredRealtors];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRealtors, sortConfig]);

  const requestSort = (key: keyof Realtor) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Realtor) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };
  
  const exportToCSV = () => {
    if (realtors.length === 0) return;
    const headers = Object.keys(realtors[0]).join(',');
    const rows = realtors.map(realtor =>
      Object.values(realtor).map(value => {
        const strValue = value === null || value === undefined ? '' : String(value);
        if (/[",\n]/.test(strValue)) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "realtors_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (realtor: Realtor) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${realtor.full_name}? Esta acción no se puede deshacer.`)) {
      onDeleteRealtor(realtor.id);
    }
  }

  const handleStageChange = (realtorId: string, newStage: FunnelStage) => {
    onUpdateRealtorStage(realtorId, newStage);
    setOpenDropdownId(null);
  };
  
  if (realtors.length === 0) {
    return (
        <div className="text-center py-20 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
            <UsersIcon className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-lg font-medium text-white">Tu CRM está vacío</h3>
            <p className="mt-1 text-sm text-slate-400">Comienza por añadir tu primer contacto.</p>
            <div className="mt-6">
                <button
                    onClick={onAddRealtor}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Añadir tu primer Realtor
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Realtors CRM ({realtors.length})</h2>
        <div className="flex gap-2">
            <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
              <DownloadIcon className="w-4 h-4" />
              Exportar a CSV
            </button>
            <button onClick={onAddRealtor} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                <PlusIcon className="w-4 h-4" />
                Añadir Realtor
            </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Filtrar por nombre, agencia o email..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 mb-4 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-300 uppercase bg-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('full_name')}>Nombre Completo{getSortIndicator('full_name')}</th>
              <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('agency')}>Agencia{getSortIndicator('agency')}</th>
              <th scope="col" className="px-4 py-3 text-center">Instagram</th>
              <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('funnel_stage')}>Etapa del Funnel{getSortIndicator('funnel_stage')}</th>
              <th scope="col" className="px-4 py-3 cursor-pointer text-right" onClick={() => requestSort('potential_contract_value')}>Valor Potencial{getSortIndicator('potential_contract_value')}</th>
              <th scope="col" className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedRealtors.map((realtor) => (
              <tr key={realtor.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-white">{realtor.full_name}</td>
                <td className="px-4 py-3">{realtor.agency}</td>
                <td className="px-4 py-3 text-center">
                  {realtor.instagram_profile_url ? (
                    <a href={realtor.instagram_profile_url} target="_blank" rel="noopener noreferrer" className="inline-block text-slate-400 hover:text-pink-500 transition-colors">
                      <InstagramIcon className="w-5 h-5" />
                    </a>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="relative" ref={openDropdownId === realtor.id ? dropdownRef : null}>
                    <button
                        onClick={() => setOpenDropdownId(openDropdownId === realtor.id ? null : realtor.id)}
                        className="px-2 py-1 text-xs font-semibold rounded-full w-36 text-center transition-transform hover:scale-105"
                        style={{ backgroundColor: FUNNEL_STAGE_COLORS[realtor.funnel_stage], color: '#000' }}
                    >
                        {realtor.funnel_stage}
                    </button>
                    {openDropdownId === realtor.id && (
                        <div className="absolute z-10 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-700">
                            <ul className="py-1">
                                {FUNNEL_STAGES_ORDER.map(stage => (
                                    <li key={stage}>
                                        <button
                                            onClick={() => handleStageChange(realtor.id, stage)}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-brand-600 hover:text-white"
                                        >
                                            {stage}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                </td>
                {/* FIX: Handle null potential_contract_value to prevent crash */}
                <td className="px-4 py-3 text-right font-semibold text-brand-400">${(realtor.potential_contract_value ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                        onClick={() => onEditRealtor(realtor)} 
                        className="p-2 rounded-full text-slate-400 hover:bg-brand-500/20 hover:text-brand-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        aria-label={`Editar a ${realtor.full_name}`}
                        title={`Editar a ${realtor.full_name}`}
                    >
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => handleDeleteClick(realtor)} 
                        className="p-2 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        aria-label={`Eliminar a ${realtor.full_name}`}
                        title={`Eliminar a ${realtor.full_name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RealtorList;