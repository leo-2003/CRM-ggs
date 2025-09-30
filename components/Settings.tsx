import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import Avatar from './Avatar';
import { SpinnerIcon } from './Icons';

interface SettingsProps {
    session: Session;
    onLogoUpdate: () => void;
    onProfileUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ session, onLogoUpdate, onProfileUpdate }) => {
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [loadingName, setLoadingName] = useState(false);

    useEffect(() => {
        // Set initial full name from user metadata
        setFullName(session.user?.user_metadata?.full_name || '');

        // Fetch existing logo to show as current
        const { data } = supabase.storage.from('logos').getPublicUrl('app-logo');
        
        // Check if it exists before setting it
        const checkLogoExists = async () => {
            const { error } = await supabase.storage.from('logos').download('app-logo');
            if (!error) {
                setLogoPreview(data.publicUrl);
            }
        };
        checkLogoExists();

    }, [session]);

    const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingLogo(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen para subir.');
            }

            const file = event.target.files[0];
            const filePath = `app-logo`;

            // Use upsert to overwrite the existing logo if it exists
            // FIX: Explicitly set the contentType to ensure the browser can render the image.
            // Supabase storage relies on file extensions to infer this, but our file path 'app-logo' has none.
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, { 
                    upsert: true,
                    contentType: file.type,
                    cacheControl: '0' // FIX: Force revalidation to bypass CDN cache on overwrite.
                });

            if (uploadError) {
                throw uploadError;
            }
            
            // Invalidate local preview cache and trigger parent update
            const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
            setLogoPreview(`${data.publicUrl}?t=${new Date().getTime()}`);
            onLogoUpdate();

        } catch (error: any) {
            alert(`Error al subir el logo: ${error.message}`);
        } finally {
            setUploadingLogo(false);
        }
    };
    
    const handleNameUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoadingName(true);
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            if (error) throw error;
            onProfileUpdate(); // This will re-fetch user data in CrmLayout
            alert('Nombre actualizado con éxito!');
        } catch (error: any) {
            alert(`Error al actualizar el nombre: ${error.message}`);
        } finally {
            setLoadingName(false);
        }
    }
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Ajustes</h2>
            
            {/* Profile Settings */}
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Ajustes de Perfil</h3>
                <p className="text-slate-400 mb-6">Actualiza tu foto de perfil y detalles de la cuenta.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex justify-center md:justify-start">
                        <Avatar
                            uid={session.user.id}
                            onUpload={onProfileUpdate}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <p className="font-medium text-white">{session.user.email}</p>
                            <p className="text-slate-400 text-sm">Usuario Administrador</p>
                        </div>
                        <form onSubmit={handleNameUpdate} className="space-y-3">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-400 mb-1">Nombre de Usuario</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full max-w-sm bg-slate-800 border border-slate-700 p-2 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center w-40"
                                disabled={loadingName}
                            >
                                {loadingName ? <><SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" /> Guardando...</> : 'Guardar Nombre'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

             {/* Brand Settings */}
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Personalización de Marca</h3>
                <p className="text-slate-400 mb-6">Sube el logo de tu agencia. Se mostrará en el inicio de sesión y en el panel.</p>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2"/>
                        ) : (
                            <span className="text-xs text-slate-500">Sin logo</span>
                        )}
                    </div>
                    <div>
                        <label htmlFor="logoUpload" className="cursor-pointer bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center w-40">
                            {uploadingLogo ? <><SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" /> Subiendo...</> : 'Cambiar Logo'}
                        </label>
                        <input
                            type="file"
                            id="logoUpload"
                            className="hidden"
                            accept="image/*"
                            onChange={uploadLogo}
                            disabled={uploadingLogo}
                        />
                        <p className="text-xs text-slate-500 mt-2">Recomendado: PNG con fondo transparente.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;