import { useStore } from "@/store";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { Users, Activity, Settings, Database, Server } from "lucide-react";
import { useState } from "react";
import { ProfileModal } from "@/components/ProfileModal";

export function AdminView({ tab }: { tab: number }) {
  if (tab === 0) return <AdminDashboard />;
  if (tab === 1) return <AccountManagement />;
  if (tab === 2) return <MasterLibrary />;
  return null;
}

function AdminDashboard() {
  const { usuarios } = useStore();
  const clientsCount = usuarios.filter(u => u.rol === 'cliente').length;
  const trainersCount = usuarios.filter(u => u.rol === 'entrenador').length;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#2D3748] mb-1">Panel General</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <NeuCard className="flex flex-col items-center justify-center gap-2 py-4">
          <Users className="w-6 h-6 text-[#4D7CFE]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2D3748]">{clientsCount}</div>
            <div className="text-[10px] text-[#718096] mt-1">Usuarios Activos</div>
          </div>
        </NeuCard>
        
        <NeuCard className="flex flex-col items-center justify-center gap-2 py-4">
          <Activity className="w-6 h-6 text-[#00C9A7]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2D3748]">{trainersCount}</div>
            <div className="text-[10px] text-[#718096] mt-1">Entrenadores</div>
          </div>
        </NeuCard>
      </div>

      <NeuCard className="mt-2">
        <h3 className="font-bold text-[#2D3748] mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#718096]" />
          Estado del Sistema
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#718096]">Base de Datos</span>
            <span className="text-[#00C9A7] font-bold text-xs">Operativa</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#718096]">Última Copia de Seg.</span>
            <span className="text-[#2D3748] font-bold text-xs">Hace 2 horas</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#718096]">Carga de Servidor</span>
            <span className="text-[#2D3748] font-bold text-xs">24%</span>
          </div>
        </div>
      </NeuCard>
    </div>
  );
}

function AccountManagement() {
  const { usuarios } = useStore();
  const [filterRole, setFilterRole] = useState<'cliente' | 'entrenador'>('cliente');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const filteredUsers = usuarios.filter(u => u.rol === filterRole);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#2D3748]">Cuentas</h2>
      
      <div className="flex gap-3">
        <NeuButton 
          isActive={filterRole === 'cliente'} 
          onClick={() => setFilterRole('cliente')}
          className="flex-1 text-sm py-2"
        >
          Clientes
        </NeuButton>
        <NeuButton 
          isActive={filterRole === 'entrenador'} 
          onClick={() => setFilterRole('entrenador')}
          className="flex-1 text-sm py-2"
        >
          Entrenadores
        </NeuButton>
      </div>

      <div className="flex flex-col gap-3">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-[#718096] my-4 text-sm">No hay usuarios en esta categoría.</p>
        ) : (
          filteredUsers.map((u) => (
            <NeuCard key={u.id} className="flex justify-between items-center p-3">
              <div>
                <div className="font-bold text-[#2D3748] text-sm">{u.nombre}</div>
                <div className="flex items-center gap-2 text-[10px] text-[#718096]">
                  <span>DNI: {u.dni}</span>
                  <span className={`px-1.5 py-0.5 rounded-md ${u.estado_suscripcion === 'inactivo' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {u.estado_suscripcion === 'inactivo' ? 'Inactivo' : 'Activo'}
                  </span>
                </div>
              </div>
              <NeuButton className="px-3 py-1.5 text-xs" onClick={() => setSelectedUserId(u.id)}>Gestionar</NeuButton>
            </NeuCard>
          ))
        )}
      </div>

      <ProfileModal 
        isOpen={!!selectedUserId} 
        onClose={() => setSelectedUserId(null)} 
        userId={selectedUserId || undefined} 
      />
    </div>
  );
}

function MasterLibrary() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#2D3748]">Biblioteca Maestra</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <NeuCard className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center">
              <Database className="w-4 h-4 text-[#4D7CFE]" />
            </div>
            <div>
              <div className="font-bold text-[#2D3748] text-base">Ejercicios</div>
              <div className="text-xs text-[#718096]">245 registros</div>
            </div>
          </div>
          <NeuButton variant="circle" className="w-8 h-8 shadow-neu-pressed text-[#4D7CFE] !p-0 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </NeuButton>
        </NeuCard>

        <NeuCard className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center">
              <Database className="w-4 h-4 text-[#00C9A7]" />
            </div>
            <div>
              <div className="font-bold text-[#2D3748] text-base">Alimentos</div>
              <div className="text-xs text-[#718096]">1200 registros</div>
            </div>
          </div>
          <NeuButton variant="circle" className="w-8 h-8 shadow-neu-pressed text-[#4D7CFE] !p-0 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </NeuButton>
        </NeuCard>
      </div>
    </div>
  );
}
