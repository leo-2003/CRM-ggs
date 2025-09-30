import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GGSLogo, SpinnerIcon } from './Icons';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the app logo to display on the login screen
    const getLogo = async () => {
       try {
          const { data } = supabase.storage.from('logos').getPublicUrl('app-logo');
          // Check if the file exists by trying to fetch its metadata
          const { error: headError } = await supabase.storage.from('logos').download('app-logo');
          if (!headError) {
              setLogoUrl(data.publicUrl);
          }
       } catch (error: any) {
           console.error("Could not fetch logo for auth screen:", error.message);
       }
    };
    getLogo();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('El usuario ya existe. Por favor, inicia sesión.');
    } else {
      setMessage('¡Revisa tu correo para el enlace de confirmación!');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-lg shadow-xl border border-slate-800">
        <div className="text-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Agencia GGS Logo" className="w-16 h-16 object-contain mx-auto" />
            ) : (
              <GGSLogo className="w-16 h-16 text-brand-500 mx-auto" />
            )}
            <h1 className="mt-4 text-3xl font-bold text-white">Agencia GGS</h1>
            <p className="mt-2 text-slate-400">Accede a tu panel de control</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400">
              Correo Electrónico
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-400">
              Contraseña
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          {message && <p className="text-sm text-green-400 text-center">{message}</p>}

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Iniciar Sesión'}
            </button>
             <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;