import React, { useState } from 'react';
import { useStore } from '../store';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuCard } from '../components/ui/NeuCard';


export function LoginView() {
  const login = useStore((state) => state.login);
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!dni || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const result = login(dni, password);
    if (!result.success) {
      setError(result.error || 'Credenciales incorrectas');
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
          />
          <NeuInput 
            label="Contraseña" 
            type="password" 
            placeholder="••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}
          
          <NeuButton type="submit" className="w-full h-12 text-[var(--color-accent-blue)] font-bold mt-2">
            Ingresar
          </NeuButton>
        </form>
      </NeuCard>

    </div>
  );
}
