import React, { useState, useEffect } from 'react';
import { Realtor, RealtorActivity, FunnelStage, ProductionLevel, TeamSize, TechAdoption, AIInterest } from '../types';
import { SpinnerIcon } from './Icons';
import { EMPTY_REALTOR } from '../constants';
import { supabase, parseSupabaseError } from '../lib/supabaseClient';

interface RealtorFormProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Update onSave prop to allow pain_point_tags to be a string, matching form state.
  onSave: (realtor: Partial<Realtor> & { pain_point_tags?: string | string[] | null }) => Promise<boolean>;
  realtor?: Realtor;
}

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />;
const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />;
const FormTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />;
const FormLabel = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props} className="block text-sm font-medium text-slate-400 mb-1" />;
const FormSectionTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold text-brand-400 md:col-span-2 mt-6 mb-2 border-b border-slate-700 pb-2">{children}</h3>

const RealtorForm: React.FC<RealtorFormProps> = ({ isOpen, onClose, onSave, realtor }) => {
  // FIX: Update formData state to allow pain_point_tags to be a string from the text input.
  const [formData, setFormData] = useState<Partial<Realtor> & { pain_point_tags?: string | string[] | null }>(realtor || EMPTY_REALTOR);
  const [activities, setActivities] = useState<RealtorActivity[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(realtor || EMPTY_REALTOR);
    setActivitiesError(null);
    
    // Fetch activities if editing an existing realtor
    if (realtor?.id && isOpen) {
        const fetchActivities = async () => {
            setLoadingActivities(true);
            try {
                const { data, error } = await supabase
                    .from('realtor_activities')
                    .select('*')
                    .eq('realtor_id', realtor.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setActivities(data as RealtorActivity[]);
            } catch (error) {
                const parsedError = parseSupabaseError(error);
                console.error("Error fetching activities:", parsedError);
                setActivitiesError(parsedError);
            } finally {
                setLoadingActivities(false);
            }
        };
        fetchActivities();
    } else {
        setActivities([]); // Clear activities for new realtors
    }
  }, [realtor, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? null : Number(value);
    // Prevent non-numeric text from being processed, but allow null
    if (value !== '' && isNaN(Number(value))) {
        return;
    }
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };
  
  const formTitle = realtor ? 'Editar Realtor' : 'Añadir Nuevo Realtor';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{formTitle}</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" disabled={isSaving}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormSectionTitle>Información Básica</FormSectionTitle>
                  <div><FormLabel htmlFor="full_name">Nombre Completo <span className="text-red-500">*</span></FormLabel><FormInput id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} required /></div>
                  <div><FormLabel htmlFor="email">Correo Electrónico</FormLabel><FormInput id="email" type="email" name="email" value={formData.email || ''} onChange={handleChange} /></div>
                  <div><FormLabel htmlFor="agency">Agencia Inmobiliaria</FormLabel><FormInput id="agency" name="agency" value={formData.agency || ''} onChange={handleChange} /></div>
                  <div><FormLabel htmlFor="role">Cargo</FormLabel><FormInput id="role" name="role" value={formData.role || ''} onChange={handleChange} /></div>
                  <div><FormLabel htmlFor="phone">Número de Teléfono</FormLabel><FormInput id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
                  <div><FormLabel htmlFor="location">Ubicación</FormLabel><FormInput id="location" name="location" value={formData.location || ''} onChange={handleChange} /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="instagram_profile_url">URL de perfil de Instagram</FormLabel><FormInput id="instagram_profile_url" name="instagram_profile_url" value={formData.instagram_profile_url || ''} onChange={handleChange} placeholder="https://instagram.com/usuario" /></div>

                  <FormSectionTitle>Perfil del Negocio</FormSectionTitle>
                  <div><FormLabel htmlFor="production_level">Nivel de Producción</FormLabel><FormSelect id="production_level" name="production_level" value={formData.production_level} onChange={handleChange}>
                      {Object.values(ProductionLevel).map(level => <option key={level} value={level}>{level}</option>)}
                  </FormSelect></div>
                  <div><FormLabel htmlFor="team_size">Tamaño del Equipo</FormLabel><FormSelect id="team_size" name="team_size" value={formData.team_size} onChange={handleChange}>
                      {Object.values(TeamSize).map(size => <option key={size} value={size}>{size}</option>)}
                  </FormSelect></div>
                  <div><FormLabel htmlFor="experience_years">Años de Experiencia</FormLabel><FormInput id="experience_years" type="number" name="experience_years" value={formData.experience_years ?? ''} onChange={handleNumericChange} /></div>
                  <div><FormLabel htmlFor="annual_transactions">Volumen de Transacciones Anuales</FormLabel><FormInput id="annual_transactions" type="number" name="annual_transactions" value={formData.annual_transactions ?? ''} onChange={handleNumericChange} /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="specialization">Especialización</FormLabel><FormInput id="specialization" name="specialization" value={formData.specialization || ''} onChange={handleChange} placeholder="Residencial, Comercial, Lujo..." /></div>
                  
                  <FormSectionTitle>Tecnología y Necesidades</FormSectionTitle>
                  <div><FormLabel htmlFor="tech_adoption">Nivel de Adopción Tecnológica</FormLabel><FormSelect id="tech_adoption" name="tech_adoption" value={formData.tech_adoption} onChange={handleChange}>
                      {Object.values(TechAdoption).map(level => <option key={level} value={level}>{level}</option>)}
                  </FormSelect></div>
                  <div><FormLabel htmlFor="ai_interest">Interés en Soluciones de IA</FormLabel><FormSelect id="ai_interest" name="ai_interest" value={formData.ai_interest} onChange={handleChange}>
                      {Object.values(AIInterest).map(level => <option key={level} value={level}>{level}</option>)}
                  </FormSelect></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="pain_points">Puntos de Dolor (Notas detalladas)</FormLabel><FormTextArea id="pain_points" name="pain_points" value={formData.pain_points || ''} onChange={handleChange} rows={5} placeholder="Describe los desafíos y frustraciones que enfrenta el realtor en su día a día. Puedes usar múltiples líneas." /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="pain_point_tags">Etiquetas de Puntos de Dolor (separadas por comas)</FormLabel><FormInput id="pain_point_tags" name="pain_point_tags" value={Array.isArray(formData.pain_point_tags) ? formData.pain_point_tags.join(', ') : (formData.pain_point_tags || '')} onChange={handleChange} placeholder="Generación de Leads, Baja Tasa de Cierre, Gestión del Tiempo..." /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="current_tools">Herramientas Actuales</FormLabel><FormTextArea id="current_tools" name="current_tools" value={formData.current_tools || ''} onChange={handleChange} rows={5} placeholder="Lista las herramientas, software o sistemas que el realtor utiliza actualmente. Puedes usar múltiples líneas." /></div>
                  
                  <FormSectionTitle>Funnel y Seguimiento</FormSectionTitle>
                  <div><FormLabel htmlFor="funnel_stage">Etapa del Funnel</FormLabel><FormSelect id="funnel_stage" name="funnel_stage" value={formData.funnel_stage} onChange={handleChange}>
                      {Object.values(FunnelStage).map(stage => <option key={stage} value={stage}>{stage}</option>)}
                  </FormSelect></div>
                  <div><FormLabel htmlFor="potential_contract_value">Valor Potencial del Contrato ($)</FormLabel><FormInput id="potential_contract_value" type="number" name="potential_contract_value" value={formData.potential_contract_value ?? ''} onChange={handleNumericChange} /></div>
                  <div><FormLabel htmlFor="lead_source">Fuente del Lead</FormLabel><FormInput id="lead_source" name="lead_source" value={formData.lead_source || ''} onChange={handleChange} placeholder="Referido, LinkedIn, Evento..." /></div>
                  <div><FormLabel htmlFor="first_contact_date">Fecha de Primer Contacto</FormLabel><FormInput id="first_contact_date" type="date" name="first_contact_date" value={formData.first_contact_date || ''} onChange={handleChange} /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="next_action">Próxima Acción Programada</FormLabel><FormInput id="next_action" name="next_action" value={formData.next_action || ''} onChange={handleChange} /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="proposed_solution">Solución de IA Propuesta</FormLabel><FormInput id="proposed_solution" name="proposed_solution" value={formData.proposed_solution || ''} onChange={handleChange} /></div>
                  <div className="md:col-span-2"><FormLabel htmlFor="notes">Notas y Comentarios</FormLabel><FormTextArea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4}></FormTextArea></div>
                 
                  {realtor?.id && (
                    <>
                        <FormSectionTitle>Historial de Actividad</FormSectionTitle>
                        <div className="md:col-span-2 bg-slate-800/50 p-4 rounded-md max-h-60 overflow-y-auto">
                            {loadingActivities ? <p className="text-slate-400">Cargando historial...</p> : 
                                activitiesError ? <div className="text-red-400 text-sm"><p className="font-bold">No se pudo cargar el historial:</p><p className="font-mono mt-1">{activitiesError}</p></div> :
                                activities.length > 0 ? (
                                    <ul className="space-y-3">
                                        {activities.map(activity => (
                                            <li key={activity.id} className="text-sm">
                                                <p className="font-semibold text-slate-300">
                                                    {activity.activity_type} - <span className="font-normal text-slate-400">{new Date(activity.created_at).toLocaleString()}</span>
                                                </p>
                                                <p className="text-slate-400 pl-2 border-l-2 border-slate-700 ml-1 mt-1">{activity.details}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-500">No hay actividades registradas para este realtor.</p>
                                )
                            }
                        </div>
                    </>
                  )}
              </div>
            </div>
            <div className="p-4 flex justify-end gap-4 border-t border-slate-800 bg-slate-900/50">
                <button type="button" onClick={onClose} disabled={isSaving} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center w-36 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? <><SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Guardando...</> : 'Guardar Cambios'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RealtorForm;