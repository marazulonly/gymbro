import { useState, useEffect } from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { Dumbbell, Check, Play, Pause, RotateCcw, Droplets } from "lucide-react";
import { useStore } from "@/store";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ClientView({ tab }: { tab: number }) {
  if (tab === 0) return <ClientHome />;
  if (tab === 1) return <LiveWorkout />;
  if (tab === 2) return <ClientProgress />;
  return null;
}

function ClientHome() {
  const { currentUser, rutinas, planNutricion } = useStore();
  const todayRoutine = rutinas[0];
  
  return (
    <div className="flex flex-col gap-4 h-full pb-2">
      <div>
        <h2 className="text-2xl font-light text-[#2D3748]">Hola,</h2>
        <h3 className="text-3xl font-bold text-[#4D7CFE]">{currentUser.nombre}</h3>
      </div>

      <NeuCard className="flex items-center justify-between py-3 px-4">
        <div className="flex flex-col">
          <span className="text-[#718096] text-sm font-medium">Rutina de hoy</span>
          <span className="text-[#2D3748] text-xl font-bold">{todayRoutine?.nombre_sesion || 'Descanso'}</span>
        </div>
        <NeuButton variant="circle" className="w-12 h-12">
          <Play className="w-5 h-5 ml-1" />
        </NeuButton>
      </NeuCard>

      <div className="grid grid-cols-2 gap-4">
        <NeuCard className="flex flex-col items-center justify-center gap-2 py-6">
          <Droplets className="w-8 h-8 text-[#00C9A7]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2D3748]">1.5 L</div>
            <div className="text-xs text-[#718096]">de {planNutricion?.agua_litros || 3.0} L</div>
          </div>
        </NeuCard>
        
        <NeuCard className="flex flex-col items-center justify-center gap-2 py-6">
          <div className="relative w-14 h-14 flex items-center justify-center rounded-full shadow-neu-pressed">
            <span className="text-lg font-bold text-[#2D3748]">85%</span>
          </div>
          <div className="text-xs text-[#718096] text-center mt-2">
            Adherencia<br/>Semanal
          </div>
        </NeuCard>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-bold text-[#2D3748] ml-2">Macros Diarios</h4>
        <NeuCard inset className="p-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-[#718096]">Calorías</span>
            <span className="font-bold text-[#2D3748]">1250 / {planNutricion?.calorias_meta || 2200} kcal</span>
          </div>
          <div className="h-3 w-full bg-[#E0E5EC] rounded-full shadow-neu-pressed overflow-hidden">
            <div className="h-full bg-[#4D7CFE] rounded-full w-[78%]"></div>
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium text-[#718096]">
            <span>Pro: {planNutricion?.proteinas_g || 120}g</span>
            <span>Car: {planNutricion?.carbohidratos_g || 180}g</span>
            <span>Gra: {planNutricion?.grasas_g || 55}g</span>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}

function LiveWorkout() {
  const { rutinas, ejerciciosRutina, ejercicios } = useStore();
  const todayRoutine = rutinas[0];
  const routineExercises = ejerciciosRutina.filter(er => er.id_rutina === todayRoutine.id);
  
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isExerciseFinished, setIsExerciseFinished] = useState(false);
  
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const currentEr = routineExercises[currentExerciseIdx];
  const currentEx = ejercicios.find(e => e.id === currentEr?.id_ejercicio);

  const [currentSet, setCurrentSet] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [reps, setReps] = useState(currentEr?.reps_objetivo.split('-')[0] || "10");
  const [weight, setWeight] = useState("12.5");
  const [rpe, setRpe] = useState(currentEr?.rpe_objetivo.toString() || "8");

  // Update inputs when exercise changes
  useEffect(() => {
    if (currentEr) {
      setReps(currentEr.reps_objetivo.split('-')[0] || "10");
      setRpe(currentEr.rpe_objetivo.toString() || "8");
      setWeight(""); // Clear weight for new exercise
    }
  }, [currentExerciseIdx, currentEr]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isResting) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, timer]);

  const handleCompleteSet = () => {
    setIsResting(true);
    setTimer(currentEr?.descanso_segundos || 90);
    
    if (currentSet < (currentEr?.series_objetivo || 4)) {
      setCurrentSet(c => c + 1);
    } else {
      // Finished the exercise
      setIsResting(false);
      setCompletedExercises(prev => new Set(prev).add(currentExerciseIdx));
      setIsExerciseFinished(true);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIdx < routineExercises.length - 1) {
      setCurrentExerciseIdx(c => c + 1);
      setCurrentSet(1);
      setIsExerciseFinished(false);
      setIsResting(false);
    } else {
      // Workout finished entirely
      setIsWorkoutStarted(false);
      setIsExerciseFinished(false);
      setCurrentExerciseIdx(0);
      setCurrentSet(1);
    }
  };

  const handleReturnToList = () => {
    setIsWorkoutStarted(false);
    setIsExerciseFinished(false);
    setCurrentSet(1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!todayRoutine || routineExercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#718096]">
        <Dumbbell className="w-12 h-12 mb-2 opacity-50" />
        <p>No hay rutina programada para hoy.</p>
      </div>
    );
  }

  if (!isWorkoutStarted) {
    return (
      <div className="flex flex-col gap-3 h-full pb-2">
        <div className="flex flex-col">
          <span className="text-[#4D7CFE] font-bold text-sm tracking-widest uppercase">Plan de Hoy</span>
          <h2 className="text-xl font-bold text-[#2D3748]">{todayRoutine.nombre_sesion}</h2>
        </div>
        
        {/* Full width container using -mx-4 */}
        <div className="flex-1 flex flex-col gap-4 -mx-4 px-4 overflow-y-visible">
          {routineExercises.map((er, idx) => {
            const ex = ejercicios.find(e => e.id === er.id_ejercicio);
            const isCompleted = completedExercises.has(idx);
            
            return (
              <NeuCard 
                key={er.id} 
                className={`p-4 flex items-center justify-between cursor-pointer active:shadow-neu-pressed transition-all ${isCompleted ? 'opacity-60' : ''}`}
                onClick={() => {
                  setCurrentExerciseIdx(idx);
                  setCurrentSet(1);
                  setIsWorkoutStarted(true);
                  setIsExerciseFinished(false);
                  setIsResting(false);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 min-w-[2.5rem] rounded-full shadow-neu-pressed flex items-center justify-center font-bold ${isCompleted ? 'text-[#718096]' : 'text-[#4D7CFE]'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#2D3748] leading-tight mb-1">{ex?.nombre}</span>
                    <span className="text-xs font-medium text-[#718096]">
                      {er.series_objetivo} series × {er.reps_objetivo} reps
                    </span>
                  </div>
                </div>
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full shadow-neu-pressed flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#718096]" />
                  </div>
                )}
              </NeuCard>
            );
          })}
        </div>
      </div>
    );
  }

  if (!currentEx || !currentEr) return null;

  if (isExerciseFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 pb-10">
        <div className="w-24 h-24 rounded-full shadow-neu-flat flex items-center justify-center text-[#00C9A7]">
          <Check className="w-12 h-12" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2D3748]">¡Completado!</h2>
          <p className="text-[#718096] mt-2">¿Qué deseas hacer ahora?</p>
        </div>
        <div className="flex flex-col w-full gap-4 mt-6">
          <NeuButton 
            className="w-full text-[#4D7CFE] font-bold h-14 text-lg"
            onClick={handleNextExercise}
          >
            Siguiente Ejercicio
          </NeuButton>
          <NeuButton 
            className="w-full text-[#718096] font-bold h-14 text-lg"
            onClick={handleReturnToList}
          >
            Regresar
          </NeuButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[#4D7CFE] font-bold text-sm tracking-widest uppercase">En curso</span>
          <h2 className="text-xl font-bold text-[#2D3748] leading-tight">{currentEx.nombre}</h2>
        </div>
        <NeuCard inset className="px-4 py-2 !rounded-xl whitespace-nowrap ml-4">
          <span className="text-[#718096] font-bold text-sm">Serie {currentSet}/{currentEr.series_objetivo}</span>
        </NeuCard>
      </div>

      <NeuCard className="py-3 px-4">
        <div className="flex justify-between text-sm text-[#718096] font-medium">
          <span>Tempo: {currentEr.tempo}</span>
          <span>Objetivo: {currentEr.reps_objetivo} reps @ RPE {currentEr.rpe_objetivo}</span>
        </div>
        {currentEx.instrucciones && (
          <p className="mt-2 text-xs italic text-[#4D7CFE]">{currentEx.instrucciones}</p>
        )}
      </NeuCard>

      <AnimatePresence mode="wait">
        {isResting ? (
          <motion.div
            key="resting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center gap-8 py-10"
          >
            <div className="relative w-40 h-40 rounded-full shadow-neu-flat flex flex-col items-center justify-center">
              <div className="absolute inset-2 rounded-full shadow-neu-pressed pointer-events-none"></div>
              <span className="text-5xl font-bold text-[#4D7CFE]">{formatTime(timer)}</span>
              <span className="text-sm text-[#718096] mt-2">Descanso</span>
            </div>
            
            <div className="flex gap-6">
              <NeuButton variant="circle" onClick={() => setTimer(t => t + 30)}>+30s</NeuButton>
              <NeuButton variant="circle" onClick={() => setIsResting(false)} className="text-[#00C9A7]">
                <Play className="w-5 h-5 ml-1" />
              </NeuButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="working"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <NeuInput 
                label="Peso (kg)" 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                className="text-center text-lg font-bold h-12"
              />
              <NeuInput 
                label="Repeticiones" 
                type="text" 
                value={reps} 
                onChange={(e) => setReps(e.target.value)} 
                className="text-center text-lg font-bold h-12"
              />
            </div>
            
            <div className="w-1/2 mx-auto">
              <NeuInput 
                label="RPE (1-10)" 
                type="number" 
                value={rpe} 
                onChange={(e) => setRpe(e.target.value)} 
                className="text-center text-lg font-bold h-12"
              />
            </div>

            <NeuButton 
              className="mt-4 h-12 text-base text-[#00C9A7] font-bold flex gap-2"
              onClick={handleCompleteSet}
            >
              <Check className="w-6 h-6" />
              COMPLETAR SERIE
            </NeuButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const mockData = [
  { name: 'S1', rm: 80 },
  { name: 'S2', rm: 82.5 },
  { name: 'S3', rm: 85 },
  { name: 'S4', rm: 87.5 },
  { name: 'S5', rm: 90 },
];

function ClientProgress() {
  return (
    <div className="flex flex-col gap-4 h-full pb-2">
      <h2 className="text-2xl font-bold text-[#2D3748] mb-1">Mi Progreso</h2>
      
      <NeuCard className="p-4">
        <h3 className="text-[#718096] font-medium mb-4">1RM Estimado - Sentadilla (kg)</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} width={30} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#E0E5EC', boxShadow: '8px 8px 16px #c5cad1, -8px -8px 16px #ffffff' }}
              />
              <Line type="monotone" dataKey="rm" stroke="#4D7CFE" strokeWidth={4} dot={{r: 6, fill: '#E0E5EC', strokeWidth: 3}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </NeuCard>

      <h3 className="font-bold text-[#2D3748] ml-2 mt-4">Bienestar Diario</h3>
      <div className="flex flex-col gap-4">
        {['Nivel de Fatiga', 'Calidad de Sueño', 'Estrés'].map((item, i) => (
          <NeuCard inset key={i} className="flex justify-between items-center py-3 px-5 !rounded-2xl">
            <span className="text-[#718096] font-medium">{item}</span>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full shadow-neu-flat flex items-center justify-center text-sm font-bold text-[#2D3748]">
                {8 - i}
              </div>
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
}
