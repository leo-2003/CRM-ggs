import React, { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { FunnelStage, Realtor } from '../types';
import { supabase, Database, parseSupabaseError } from '../lib/supabaseClient';
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
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email || 'Usuario');
          setAvatarUrl(user.user_metadata?.avatar_url);
        }
    } catch (error: any) {
        addToast(`No se pudo cargar el perfil: ${error.message}`, 'error');
    }
  }, []);

  const getLogo = useCallback(async () => {
    try {
        const { data } = supabase.storage.from('logos').getPublicUrl('app-logo');
        const { error } = await supabase.storage.from('logos').download('app-logo');
        if (!error) {
            setLogoUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
        } else {
            setLogoUrl(null);
        }
    } catch (error: any) {
        console.error("Error fetching logo:", error.message);
    }
  }, []);

  const fetchRealtors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('realtors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw fetchError;
      }
      setRealtors(data as Realtor[]);
    } catch (error: any) {
      // FIX: Handle authentication errors gracefully by signing the user out.
      // This catches errors like "Invalid Refresh Token" or expired JWTs.
      const isAuthError = (error?.message?.includes('Invalid Refresh Token') || 
                           error?.message?.includes('JWT expired') ||
                           error?.status === 401);

      if (isAuthError) {
        console.error("Authentication error detected. Signing out.", error);
        // Force a sign-out. This will trigger the onAuthStateChange listener in App.tsx,
        // which will then set the session to null and redirect to the Auth component.
        await supabase.auth.signOut();
      } else {
        // For all other errors (e.g., network issues), show a toast.
        const parsedError = parseSupabaseError(error);
        setError(parsedError);
        addToast(parsedError, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfile();
    getLogo();
    fetchRealtors();
  }, [getProfile, getLogo, fetchRealtors]);

  const handleSignOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
        addToast(`Error al cerrar sesión: ${signOutError.message}`, 'error');
    }
  };

  const handleSaveRealtor = async (realtorData: Partial<Realtor> & { pain_point_tags?: string | string[] | null }): Promise<boolean> => {
    try {
        if (typeof realtorData.pain_point_tags === 'string') {
            realtorData.pain_point_tags = realtorData.pain_point_tags.split(',').map(tag => tag.trim()).filter(Boolean);
        } else if (!realtorData.pain_point_tags) {
            realtorData.pain_point_tags = null;
        }

        if (editingRealtor) {
            const { id, created_at, user_id, ...updateData } = realtorData as Partial<Realtor>;
            const { data, error: updateError } = await supabase
                .from('realtors')
                .update(updateData as RealtorUpdate)
                .eq('id', editingRealtor.id)
                .select()
                .single();

            if (updateError) throw updateError;
            if (data) {
              setRealtors(realtors.map(r => r.id === data.id ? data : r));
            }
            addToast('Realtor actualizado con éxito.', 'success');
        } else {
            const insertData: RealtorInsert = { ...EMPTY_REALTOR, ...(realtorData as Partial<Realtor>) };
            const { data, error: insertError } = await supabase
                .from('realtors')
                .insert(insertData)
                .select()
                .single();

            if (insertError) throw insertError;
            if (data) {
              setRealtors([data, ...realtors]);
            }
            addToast('Realtor añadido con éxito.', 'success');
        }
        setIsFormOpen(false);
        setEditingRealtor(undefined);
        return true;
    } catch (error: any) {
        addToast(parseSupabaseError(error), 'error');
        return false;
    }
  };

  const handleDeleteRealtor = async (realtorId: string) => {
    try {
        // --- PRE-FLIGHT OWNERSHIP CHECK ---
        const realtorToDelete = realtors.find(r => r.id === realtorId);
        const { data: { user } } = await supabase.auth.getUser();

        // Check if we have the necessary info to perform the pre-flight check.
        if (realtorToDelete && user && realtorToDelete.user_id) {
            // If we can verify, and the user is not the owner, throw a specific error.
            if (realtorToDelete.user_id !== user.id) {
                console.error(`RLS PRE-FLIGHT CHECK FAILED: User ID (${user.id}) does not match Realtor's user_id (${realtorToDelete.user_id}).`);
                throw new Error('No tienes permiso para eliminar este realtor porque no te pertenece.');
            }
        }
        // --- END OF PRE-FLIGHT CHECK ---

        const { data: deletedRealtors, error: deleteError } = await supabase
            .from('realtors')
            .delete()
            .eq('id', realtorId)
            .select();
        
        if (deleteError) {
            throw deleteError;
        }

        if (!deletedRealtors || deletedRealtors.length === 0) {
            throw new Error('No se pudo eliminar el realtor. La base de datos rechazó la operación (posiblemente por permisos RLS).');
        }

        setRealtors(realtors.filter(r => r.id !== realtorId));
        addToast('Realtor eliminado con éxito.', 'success');
    } catch (error: any) {
        addToast(parseSupabaseError(error), 'error');
    }
  };
  
  const handleUpdateRealtorStage = async (realtorId: string, newStage: FunnelStage) => {
    const originalRealtors = [...realtors];
    try {
        const updatedRealtors = realtors.map(r => r.id === realtorId ? { ...r, funnel_stage: newStage } : r);
        setRealtors(updatedRealtors);
        
        const { error: updateError } = await supabase
            .from('realtors')
            .update({ funnel_stage: newStage, last_activity_date: new Date().toISOString() })
            .eq('id', realtorId);
        
        if (updateError) throw updateError;

        const activity: RealtorActivityInsert = {
            realtor_id: realtorId,
            activity_type: 'Cambio de Etapa',
            details: `La etapa del funnel se cambió a: ${newStage}.`,
        };
        const { error: activityError } = await supabase.from('realtor_activities').insert(activity);
        if (activityError) console.error("Failed to log activity:", activityError);

        addToast('Etapa del funnel actualizada.', 'success');
    } catch (error: any) {
        setRealtors(originalRealtors);
        addToast(parseSupabaseError(error), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-xl text-slate-400">
        Cargando CRM...
      </div>
    );
  }

  if (error && realtors.length === 0) {
      return (
          <div className="flex justify-center items-center h-screen bg-slate-900 text-xl text-red-400 p-8 text-center">
              <div>
                  <p>Ocurrió un error al cargar los datos:</p>
                  <p className="mt-2 text-sm font-mono bg-slate-800 p-4 rounded-md">{error}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <Sidebar currentView={view} setView={setView} userName={userName} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <GGSLogo className="h-8 w-8 text-brand-500" />
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block">{session.user.email}</span>
            {avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Cerrar sesión"
            >
              <SignOutIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {view === 'dashboard' && <Dashboard realtors={realtors} />}
          {view === 'realtors' && (
            <RealtorList
              realtors={realtors}
              onAddRealtor={() => {
                setEditingRealtor(undefined);
                setIsFormOpen(true);
              }}
              onEditRealtor={(realtor) => {
                setEditingRealtor(realtor);
                setIsFormOpen(true);
              }}
              onDeleteRealtor={handleDeleteRealtor}
              onUpdateRealtorStage={handleUpdateRealtorStage}
            />
          )}
          {view === 'settings' && <Settings session={session} onLogoUpdate={getLogo} onProfileUpdate={getProfile} />}
        </div>
      </main>

      <RealtorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRealtor}
        realtor={editingRealtor}
      />

      <div className="fixed top-5 right-5 z-50 space-y-2 w-full max-w-sm">
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