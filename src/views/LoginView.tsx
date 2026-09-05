import React, { useState } from 'react';
import { useStore } from '../store';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuCard } from '../components/ui/NeuCard';


export function LoginView() {
  const login = useStore((state) => state.login);
  const isCloudReady = useStore((state) => state.isCloudReady);
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!dni || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(dni, password);
      if (!result.success) {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al verificar credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 -mt-10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 rounded-full shadow-neu-flat flex items-center justify-center bg-[var(--color-bg-base)] overflow-hidden p-5">
          <img src="/gymbro.svg" alt="GymBro Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text-main)]">GymBro</h1>
        <p className="text-[var(--color-text-muted)] text-sm font-medium text-center">
          Tu guía de entrenamiento
        </p>
      </div>

      <NeuCard className="w-full p-6">
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <NeuInput 
            label="DNI" 
            placeholder="Ingresa tu DNI" 
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            disabled={isLoading}
          />
          <NeuInput 
            label="Contraseña" 
            type="password" 
            placeholder="••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          
          {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}
          
          <NeuButton 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 text-[var(--color-accent-blue)] font-bold mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin"></span>
                <span>Verificando en la nube...</span>
              </>
            ) : (
              'Ingresar'
            )}
          </NeuButton>
        </form>
      </NeuCard>

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span className={`w-2 h-2 rounded-full ${isCloudReady ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-400 animate-pulse'}`}></span>
        <span>{isCloudReady ? 'Sincronizado con la nube' : 'Conectando con la base de datos...'}</span>
      </div>
    </div>
  );
}
