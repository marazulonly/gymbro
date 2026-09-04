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

        {/* Quick login helpers */}
        <div className="mt-5 pt-4 border-t border-[#c5cad1]/20 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider text-center">
            Acceso Rápido / Demo
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDni('00000000');
                setPassword('0000');
              }}
              className="flex-1 py-2 px-2 text-[11px] font-bold rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat hover:text-[var(--color-accent-blue)] transition-all active:shadow-neu-pressed text-center"
            >
              Coach Roberto <br/>
              <span className="text-[9px] text-[var(--color-text-muted)] font-mono font-normal">
                Clave: 0000
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDni('11111111');
                setPassword('1234');
              }}
              className="flex-1 py-2 px-2 text-[11px] font-bold rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat hover:text-[var(--color-accent-blue)] transition-all active:shadow-neu-pressed text-center"
            >
              Atleta Xiomara <br/>
              <span className="text-[9px] text-[var(--color-text-muted)] font-mono font-normal">
                Clave: 1234
              </span>
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-1">
            Nota: La contraseña para todos los entrenadores es <strong className="text-[var(--color-text-main)] font-mono">0000</strong>.
          </p>
        </div>
      </NeuCard>

    </div>
  );
}
