'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canAccess } from '@/lib/api/auth';
import { authStorage } from '@/lib/storage';
import { Key, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Verificar si ya hay un API key guardado al cargar
  useEffect(() => {
    const storedKey = authStorage.Get();
    if (storedKey) {
      // Verificar si el API key guardado aún es válido
      verifyAccess(storedKey);
    }
  }, []);

  const verifyAccess = async (key: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await canAccess(key);
      
      if (response.can_access) {
        // Guardar API key si es válido
        authStorage.Set(key);
        console.log('✅ API key guardado en localStorage:', key.substring(0, 4) + '...');
        console.log('✅ Verificación de almacenamiento:', authStorage.Get() ? 'OK' : 'ERROR');
        setSuccess(true);
        
        // Redirigir a la página principal después de un breve delay
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(response.message || 'Acceso denegado. Verifica tu API key.');
        authStorage.Remove(); // Limpiar API key inválido
      }
    } catch (err) {
      console.error('Error verificando acceso:', err);
      setError('Error al conectar con el servidor. Verifica tu conexión.');
      authStorage.Remove();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Por favor ingresa un API key');
      return;
    }

    await verifyAccess(apiKey.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sleek-black via-bg-primary to-sleek-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-accent-red/20 to-accent-red/10 rounded-lg border border-accent-red/30">
              <Key className="w-8 h-8 text-accent-red" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-white font-display">
                DOOR KNOCKER
              </h1>
              <p className="text-xs uppercase tracking-wider text-text-secondary font-display">
                SAPIENS LABORATORIES
              </p>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            Ingresa tu API key para acceder al sistema
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-br from-sleek-black via-bg-card to-sleek-black-light rounded-lg border border-border-dark/50 p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Key Input */}
            <div>
              <label htmlFor="apiKey" className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-display">
                API Key
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  placeholder="Ingresa tu API key"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-sleek-black-light to-sleek-black border border-border-dark rounded-lg text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-red/50 focus:ring-2 focus:ring-accent-red/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                />
                <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary/50 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Acceso concedido. Redirigiendo...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="w-full py-3.5 bg-accent-red text-white font-bold uppercase tracking-wider rounded-lg glow-red hover:glow-red-strong transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] font-display flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Acceder</span>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-border-dark/50">
            <p className="text-xs text-text-secondary/70 text-center">
              Si no tienes un API key, contacta al administrador del sistema.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary/50">
            © {new Date().getFullYear()} Sapiens Laboratories. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

