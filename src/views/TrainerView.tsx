import { useState } from "react";
import { useStore } from "@/store";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { Plus, Search, ChevronRight, MessageCircle, AlertCircle, Save, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "@/components/ProfileModal";

export function TrainerView({ tab }: { tab: number }) {
  if (tab === 0) return <AthletesList />;
  if (tab === 1) return <RoutineBuilder />;
  if (tab === 2) return <Checkins />;
  return null;
}

function AthletesList() {
  const { currentUser, usuarios, addUsuario } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'femenino' | 'otro'>('masculino');

  const athletes = usuarios.filter(u => u.rol === 'cliente' && u.id_entrenador === currentUser?.id);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !dni) return;
    
    addUsuario({
      id: `u${Date.now()}`,
      nombre,
      dni,
      whatsapp,
      fecha_nacimiento: fecha,
      sexo,
      contrasena: '0000',
      rol: 'cliente',
      id_entrenador: currentUser?.id
    });
    
    setIsAdding(false);
    setNombre('');
    setDni('');
    setWhatsapp('');
    setFecha('');
  };

  if (isAdding) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={() => setIsAdding(false)}>
            <ArrowLeft className="w-5 h-5 text-[#718096]" />
          </NeuButton>
          <h2 className="text-xl font-bold text-[#2D3748]">Nuevo Atleta</h2>
        </div>
        
        <NeuCard className="p-4">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <NeuInput label="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
            <NeuInput label="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <NeuInput label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <NeuInput label="Fecha de Nacimiento" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            
            <div className="flex flex-col gap-1 w-full">
              <span className="text-sm font-medium text-[#718096] pl-2">Sexo</span>
              <select 
                className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-2 text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20"
                value={sexo}
                onChange={(e) => setSexo(e.target.value as any)}
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <p className="text-xs text-[#718096] px-2 text-center mt-2">La contraseña inicial será <span className="font-bold">0000</span></p>

            <NeuButton type="submit" className="mt-2 h-12 text-[#4D7CFE] font-bold">
              Guardar Atleta
            </NeuButton>
          </form>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-bold text-[#2D3748]">Mis Atletas</h2>
        <NeuButton variant="circle" className="w-10 h-10" onClick={() => setIsAdding(true)}>
          <Plus className="w-5 h-5 text-[#4D7CFE]" />
        </NeuButton>
      </div>

      <div className="flex flex-col gap-3">
        {athletes.length === 0 ? (
          <p className="text-center text-[#718096] my-4 text-sm">No tienes atletas asignados.</p>
        ) : (
          athletes.map((athlete) => (
            <NeuCard key={athlete.id} className="flex justify-between items-center py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[#718096]">
                  {athlete.nombre.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#2D3748] text-sm">{athlete.nombre}</span>
                  <div className="flex items-center gap-2 text-[10px] text-[#718096]">
                    <span>DNI: {athlete.dni}</span>
                    <span className={`px-1.5 py-0.5 rounded-md ${athlete.estado_suscripcion === 'inactivo' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {athlete.estado_suscripcion === 'inactivo' ? 'Inactivo' : 'Activo'}
                    </span>
                  </div>
                </div>
              </div>
              <NeuButton 
                variant="circle" 
                className="w-8 h-8 shadow-neu-pressed text-[#4D7CFE] !p-0 flex items-center justify-center"
                onClick={() => setSelectedUserId(athlete.id)}
              >
                <ChevronRight className="w-4 h-4" />
              </NeuButton>
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

function RoutineBuilder() {
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Sentadilla Libre', sets: '4', reps: '8-10', weight: '80', rpe: '8' }
  ]);

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: 'Nuevo Ejercicio', sets: '3', reps: '10', weight: '0', rpe: '7' }]);
  };

  const updateExercise = (id: number, field: string, value: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2D3748]">Constructor</h2>
        <NeuButton className="px-3 py-1.5 text-sm text-[#00C9A7]">
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </NeuButton>
      </div>

      <NeuCard inset className="p-3 flex flex-col gap-2">
        <NeuInput label="Nombre del Bloque/Sesión" defaultValue="Día de Piernas - Fase 1" />
        <div className="flex gap-3">
          <NeuInput label="Día" defaultValue="Lunes" />
          <NeuInput label="Fase" defaultValue="1" />
        </div>
      </NeuCard>

      <div className="flex flex-col gap-4 mt-1">
        <AnimatePresence>
          {exercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <div className="flex justify-between items-end">
                <h3 className="font-bold text-[#4D7CFE] uppercase tracking-wider text-[10px]">
                  {String.fromCharCode(65 + i)}1. {ex.name}
                </h3>
              </div>
              <NeuCard className="p-3 grid grid-cols-4 gap-2">
                <NeuInput label="Series" value={ex.sets} onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)} className="text-center h-10 text-sm" />
                <NeuInput label="Reps" value={ex.reps} onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)} className="text-center h-10 text-sm" />
                <NeuInput label="RPE" value={ex.rpe} onChange={(e) => updateExercise(ex.id, 'rpe', e.target.value)} className="text-center h-10 text-sm" />
                <NeuInput label="Carga" value={ex.weight} onChange={(e) => updateExercise(ex.id, 'weight', e.target.value)} className="text-center h-10 text-sm" />
              </NeuCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <NeuButton onClick={addExercise} className="mt-2 flex gap-2 w-full justify-center border-dashed border-2 border-[#c5cad1] !shadow-none bg-transparent">
        <Plus className="w-4 h-4" />
        Añadir Ejercicio
      </NeuButton>
    </div>
  );
}

function Checkins() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#2D3748] mb-1">Revisiones Pendientes</h2>
      
      {[1, 2].map((i) => (
        <NeuCard key={i} className="flex flex-col gap-3 p-4">
          <div className="flex justify-between items-center border-b-2 border-[#E0E5EC] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[#718096]">
                A
              </div>
              <div>
                <div className="font-bold text-[#2D3748] text-sm">Ana García</div>
                <div className="text-[10px] text-[#718096]">Semana 4 - Hace 2h</div>
              </div>
            </div>
            <span className="bg-[#E0E5EC] shadow-neu-pressed px-2 py-1 rounded-lg text-[10px] font-bold text-[#00C9A7]">
              +0.5 kg
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl text-center flex flex-col">
              <span className="text-[9px] text-[#718096]">Fatiga</span>
              <span className="font-bold text-[#2D3748] text-sm">7/10</span>
            </div>
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl text-center flex flex-col">
              <span className="text-[9px] text-[#718096]">Sueño</span>
              <span className="font-bold text-[#2D3748] text-sm">6/10</span>
            </div>
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl text-center flex flex-col">
              <span className="text-[9px] text-[#718096]">Adherencia</span>
              <span className="font-bold text-[#2D3748] text-sm">95%</span>
            </div>
          </div>

          <NeuButton className="w-full flex gap-2 justify-center text-[#4D7CFE] text-sm h-10">
            <MessageCircle className="w-4 h-4" />
            Enviar Devolución
          </NeuButton>
        </NeuCard>
      ))}
    </div>
  );
}
