import { useState } from 'react';
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
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 -mt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full shadow-neu-flat flex items-center justify-center bg-[#E0E5EC] overflow-hidden p-3">
          <img src="/gymbro.svg" alt="GymBro Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-[#2D3748]">GymBro</h1>
        <p className="text-[#718096] text-sm">Tu compañero de entrenamiento</p>
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
          
          <NeuButton type="submit" className="w-full h-12 text-[#4D7CFE] font-bold mt-2">
            Ingresar
          </NeuButton>
        </form>
      </NeuCard>

      <p className="text-xs text-[#718096] text-center px-4">
        Por defecto, la contraseña para todos los usuarios de prueba es <span className="font-bold">0000</span>
      </p>
    </div>
  );
}
