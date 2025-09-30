import React, { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { FunnelStage, Realtor } from '../types';
import { supabase, Database } from '../lib/supabaseClient';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import RealtorList from './RealtorList';
import { GGSLogo, SignOutIcon } from './Icons';
import RealtorForm from './RealtorForm';
import Toast from './Toast';
import { EMPTY_REALTOR } from '../constants';
import Settings from './Settings';

type View = 'dashboard' | 'realtors' | 'settings';
type RealtorInsert = Database['public']['Tables']['realtors']['Insert'];
type RealtorUpdate = Database['public']['Tables']['realtors']['Update'];
type RealtorActivityInsert = Database['public']['Tables']['realtor_activities']['Insert'];


interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const parseSupabaseError = (error: any): string => {
  if (typeof error === 'object' && error !== null) {
    let message = error.message || 'An unknown error occurred.';
    if (error.details) message += ` Details: ${error.details}`;
    if (error.hint) message += ` Hint: ${error.hint}`;
    return message;
  }
  return String(error);
}

interface CrmLayoutProps {
    session: Session;
}

const CrmLayout: React.FC<CrmLayoutProps> = ({ session }) => {
  const [view, setView] = useState<View>('dashboard');
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRealtor, setEditingRealtor] = useState<Realtor | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('Usuario');

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  const getProfile = useCallback(async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        // Update Avatar
        if (user?.user_metadata.avatar_url) {
            setAvatarUrl(`${user.user_metadata.avatar_url}?t=${new Date().getTime()}`);
        }

        // Update User Name
        if (user?.user_metadata.full_name) {
            setUserName(user.user_metadata.full_name);
        } else if (user?.email) {
            const namePart = user.email.split('@')[0];
            const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            setUserName(capitalizedName);
        }

    } catch (error: any) {
        addToast(`Error al cargar el perfil: ${error.message}`, 'error');
    }
  }, []);

  const getLogo = useCallback(async () => {
     try {
        const { data } = supabase.storage.from('logos').getPublicUrl('app-logo');
        // Check if the file exists by trying to fetch its metadata
        const { error: headError } = await supabase.storage.from('logos').download('app-logo');
        
        if (headError && headError.message !== 'The resource was not found') {
            // An actual error occurred other than not found
             throw headError;
        }

        if (!headError) {
             // Add a timestamp to bypass browser cache
            setLogoUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
        } else {
            setLogoUrl(null); // Explicitly set to null if not found
        }
     } catch (error: any) {
         console.error("Error fetching logo:", error.message);
         // Don't show a toast for a missing logo, it's not a critical error.
     }
  }, []);

  const fetchRealtors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('realtors').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      setRealtors(data as Realtor[]);
    } catch (err: any) {
      const friendlyError = parseSupabaseError(err);
      setError(friendlyError);
      console.error("Error fetching realtors:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtors();
    getProfile();
    getLogo();
  }, [fetchRealtors, getProfile, getLogo]);

  const handleSetView = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleAddRealtorClick = () => {
    setEditingRealtor(undefined);
    setIsFormOpen(true);
  };
  
  const handleEditRealtor = (realtor: Realtor) => {
    setEditingRealtor(realtor);
    setIsFormOpen(true);
  };
  
  const handleSaveRealtor = async (realtorData: Partial<Realtor>): Promise<boolean> => {
    // FIX: Cast to `any` to handle form data which may temporarily have incorrect types (e.g. pain_point_tags as a string instead of string[]).
    const processedData: any = { ...realtorData };
    if (processedData.first_contact_date === '') processedData.first_contact_date = null;
    if (processedData.last_activity_date === '') processedData.last_activity_date = null;

    // Convert comma-separated string of tags into an array
    if (typeof processedData.pain_point_tags === 'string') {
        processedData.pain_point_tags = processedData.pain_point_tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }

    try {
      if (processedData.id) { // UPDATE
        const { id, created_at, user_id, ...updateData } = processedData;
        const originalRealtor = realtors.find(r => r.id === id);

        const { error } = await supabase.from('realtors').update(updateData as RealtorUpdate).eq('id', id);
        if (error) throw error;
        
        if (originalRealtor && originalRealtor.funnel_stage !== updateData.funnel_stage) {
            const activity: RealtorActivityInsert = {
                realtor_id: id,
                activity_type: 'CAMBIO DE ETAPA',
                details: `La etapa cambió de '${originalRealtor.funnel_stage}' a '${updateData.funnel_stage}'.`
            };
            // FIX: The `insert` method expects an array of records.
            await supabase.from('realtor_activities').insert([activity]);
        }
        
        addToast('Realtor actualizado con éxito!', 'success');
      } else { // INSERT
        const { id, created_at, user_id, ...insertPayload } = processedData;
        const insertDataWithDefaults = { ...EMPTY_REALTOR, ...insertPayload };
        const { user_id: _uid, ...finalInsertData } = insertDataWithDefaults;
        
        const { data: newRealtorData, error } = await supabase.from('realtors').insert([finalInsertData as RealtorInsert]).select().single();
        if (error) throw error;
        
        // FIX: Add a null check, as .single() can return null.
        if (!newRealtorData) {
          throw new Error('Failed to create realtor, no data returned.');
        }

        const activity: RealtorActivityInsert = {
            realtor_id: newRealtorData.id,
            activity_type: 'REALTOR CREADO',
            details: `El realtor "${newRealtorData.full_name}" fue añadido al CRM.`
        };
        // FIX: The `insert` method expects an array of records.
        await supabase.from('realtor_activities').insert([activity]);

        addToast('Realtor añadido con éxito!', 'success');
      }
      setIsFormOpen(false);
      await fetchRealtors();
      return true;
    } catch (err: any) {
        const friendlyError = parseSupabaseError(err);
        addToast(`Error al guardar: ${friendlyError}`, 'error');
        console.error("Error saving realtor:", err);
        return false;
    }
  };

  const handleUpdateRealtorStage = async (realtorId: string, newStage: FunnelStage) => {
    try {
      const originalRealtor = realtors.find(r => r.id === realtorId);
      if (!originalRealtor) throw new Error('Realtor no encontrado para registrar actividad.');

      const { error } = await supabase
        .from('realtors')
        .update({ funnel_stage: newStage, last_activity_date: new Date().toISOString() })
        .eq('id', realtorId);
      if (error) throw error;

      const activity: RealtorActivityInsert = {
          realtor_id: realtorId,
          activity_type: 'CAMBIO DE ETAPA',
          details: `La etapa cambió de '${originalRealtor.funnel_stage}' a '${newStage}'.`
      };
      // FIX: The `insert` method expects an array of records.
      await supabase.from('realtor_activities').insert([activity]);

      // Optimistic UI update
      setRealtors(prevRealtors =>
        prevRealtors.map(r =>
          r.id === realtorId ? { ...r, funnel_stage: newStage } : r
        )
      );
      addToast('Etapa del funnel actualizada.', 'success');
    } catch (err: any) {
      const friendlyError = parseSupabaseError(err);
      addToast(`Error al actualizar: ${friendlyError}`, 'error');
      console.error("Error updating funnel stage:", err);
    }
  };

  const handleDeleteRealtor = async (realtorId: string) => {
    try {
        const { error } = await supabase.from('realtors').delete().eq('id', realtorId);
        if (error) throw error;
        addToast('Realtor eliminado con éxito.', 'success');
        await fetchRealtors();
    // FIX: Added curly braces to the catch block to fix a syntax error that was causing numerous compilation issues.
    } catch (err: any) {
        const friendlyError = parseSupabaseError(err);
        addToast(`Error al eliminar: ${friendlyError}`, 'error');
        console.error("Error deleting realtor:", err);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }
  
  const onLogoUpdate = () => {
      getLogo(); // Re-fetch the logo URL
      addToast('Logo actualizado correctamente.', 'success');
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><p className="text-xl text-slate-400 animate-pulse">Cargando datos del CRM...</p></div>;
    }
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900/50 rounded-lg border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error de Conexión con Supabase</h2>
            <p className="text-slate-300 mb-6 bg-slate-800 p-3 rounded-md font-mono text-sm max-w-3xl w-full">
                <strong>Mensaje de Error:</strong> {error}
            </p>
             <p className="text-slate-400">Por favor, asegúrate de que has ejecutado el último script SQL para configurar la seguridad de la base de datos.</p>
        </div>
       );
    }
    switch(view) {
        case 'dashboard':
            return <Dashboard realtors={realtors} />;
        case 'realtors':
            return <RealtorList realtors={realtors} onAddRealtor={handleAddRealtorClick} onEditRealtor={handleEditRealtor} onDeleteRealtor={handleDeleteRealtor} onUpdateRealtorStage={handleUpdateRealtorStage} />;
        case 'settings':
            return <Settings session={session} onLogoUpdate={onLogoUpdate} onProfileUpdate={getProfile} />;
        default:
            return null;
    }
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 font-sans">
      <Sidebar currentView={view} setView={handleSetView} userName={userName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="relative bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-end">
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {logoUrl ? (
                <img src={logoUrl} alt="Agencia GGS Logo" className="w-8 h-8 object-contain" />
            ) : (
                <GGSLogo className="w-8 h-8 text-brand-500" />
            )}
            <span className="text-lg font-semibold text-white hidden sm:block">Agencia GGS</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-400 hidden sm:inline">{session.user.email}</span>
             {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-9 h-9 rounded-full border-2 border-slate-700 object-cover" />
             ) : (
                <div className="w-9 h-9 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    {session.user.email?.charAt(0).toUpperCase()}
                </div>
             )}
             <button onClick={handleSignOut} title="Cerrar sesión" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                <SignOutIcon className="w-5 h-5" />
             </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950/50">
          {renderContent()}
        </main>
      </div>
       <RealtorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRealtor}
        realtor={editingRealtor}
      />
       <div aria-live="assertive" aria-atomic="true" className="fixed bottom-5 right-5 z-50 space-y-3 w-full max-w-xs">
          {toasts.map(toast => (
              <Toast
                  key={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onDismiss={() => removeToast(toast.id)}
              />
          ))}
       </div>
    </div>
  );
};

export default CrmLayout;