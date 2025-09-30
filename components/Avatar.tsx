import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SpinnerIcon } from './Icons';

interface AvatarProps {
  uid: string;
  onUpload: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ uid, onUpload }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch the user's current avatar URL from their metadata
    const getAvatarUrl = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error fetching user for avatar", error);
            return;
        }
        if (data.user?.user_metadata?.avatar_url) {
            setAvatarUrl(data.user.user_metadata.avatar_url);
        }
    };
    getAvatarUrl();
  }, [uid]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Use the user's ID to create a unique folder for their avatar
      const filePath = `${uid}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update the user's metadata to store the new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Update the state to show the new avatar immediately
      setAvatarUrl(publicUrl);
      onUpload(); // Notify parent component of the update

    } catch (error: any) {
      alert(`Error al subir el avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {avatarUrl ? (
        <img
          src={`${avatarUrl}?t=${new Date().getTime()}`} // Add timestamp to break cache
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-slate-700"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-slate-500">
            Sin foto
        </div>
      )}
      <div className="absolute bottom-0 right-0">
         <label htmlFor="single" className="cursor-pointer bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold p-2 rounded-full border-2 border-slate-900 inline-block">
             {uploading ? <SpinnerIcon className="animate-spin h-4 w-4" /> : 'Editar'}
         </label>
         <input
            style={{
                visibility: 'hidden',
                position: 'absolute',
            }}
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
        />
      </div>
    </div>
  );
};

export default Avatar;
