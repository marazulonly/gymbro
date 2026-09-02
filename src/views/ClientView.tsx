import { useState, useEffect } from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { Dumbbell, Check, Play, Pause, RotateCcw, Droplets, Calendar, Scale, Ruler, Target, Clock, Activity, ChevronRight } from "lucide-react";
import { useStore, getClientRoutines } from "@/store";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ClientView({ tab, onNavigateTab }: { tab: number; onNavigateTab?: (tab: number) => void }) {
  const [selectedDayRoutineId, setSelectedDayRoutineId] = useState<string | null>(null);

  const handleStartWorkout = (routineId: string) => {
    setSelectedDayRoutineId(routineId);
    if (onNavigateTab) {
      onNavigateTab(1); // switch to LiveWorkout tab
    }
  };

  if (tab === 0) return <ClientHome onStartWorkout={handleStartWorkout} />;
  if (tab === 1) return <LiveWorkout initialRoutineId={selectedDayRoutineId} onClearInitialRoutine={() => setSelectedDayRoutineId(null)} />;
  if (tab === 2) return <ClientProgress />;
  return null;
}

function ClientHome({ onStartWorkout }: { onStartWorkout: (routineId: string) => void }) {
  const { currentUser, rutinas, planNutricion, ejerciciosRutina, ejercicios } = useStore();
  const clientRoutines = getClientRoutines(rutinas, currentUser);
  const todayRoutine = clientRoutines[0] || rutinas[0];
  
  return (
    <div className="flex flex-col gap-4 h-full pb-6">
      <div>
        <h2 className="text-2xl font-light text-[var(--color-text-main)]">Hola,</h2>
        <h3 className="text-3xl font-bold text-[var(--color-accent-blue)]">{currentUser?.nombre || 'Atleta'}</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">Plan personalizado de 5 días activo</p>
      </div>

      {todayRoutine && (
        <NeuCard className="flex items-center justify-between py-3 px-4">
          <div className="flex flex-col max-w-[75%]">
            <span className="text-[var(--color-accent-blue)] text-xs font-bold uppercase tracking-wider">Rutina de hoy</span>
            <span className="text-[var(--color-text-main)] text-lg font-bold truncate">{todayRoutine.nombre_sesion}</span>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {ejerciciosRutina.filter(er => er.id_rutina === todayRoutine.id).length} ejercicios programados
            </span>
          </div>
          <NeuButton 
            variant="circle" 
            className="w-12 h-12 text-[var(--color-accent-blue)] shrink-0" 
            onClick={() => onStartWorkout(todayRoutine.id)}
          >
            <Play className="w-5 h-5 ml-1" />
          </NeuButton>
        </NeuCard>
      )}

      <div className="grid grid-cols-2 gap-3">
        <NeuCard className="flex flex-col items-center justify-center gap-1.5 py-4">
          <Droplets className="w-7 h-7 text-[#00C9A7]" />
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--color-text-main)]">{planNutricion?.agua_litros || 2.5} L</div>
            <div className="text-[11px] text-[var(--color-text-muted)]">de {planNutricion?.agua_litros || 2.5} L agua</div>
          </div>
        </NeuCard>
        
        <NeuCard className="flex flex-col items-center justify-center gap-1.5 py-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-full shadow-neu-pressed">
            <span className="text-base font-bold text-[var(--color-accent-blue)]">5/5</span>
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] text-center">
            Días del Plan<br/>Registrados
          </div>
        </NeuCard>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-[var(--color-text-main)] text-sm ml-1">Macros Diarios</h4>
        <NeuCard inset className="p-3.5">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[var(--color-text-muted)] font-medium">Calorías</span>
            <span className="font-bold text-[var(--color-text-main)]">1250 / {planNutricion?.calorias_meta || 1600} kcal</span>
          </div>
          <div className="h-2.5 w-full bg-[var(--color-bg-base)] rounded-full shadow-neu-pressed overflow-hidden">
            <div className="h-full bg-[var(--color-accent-blue)] rounded-full w-[78%]"></div>
          </div>
          <div className="flex justify-between mt-2.5 text-[11px] font-semibold text-[var(--color-text-muted)]">
            <span>Pro: {planNutricion?.proteinas_g || 120}g</span>
            <span>Car: {planNutricion?.carbohidratos_g || 160}g</span>
            <span>Gra: {planNutricion?.grasas_g || 53}g</span>
          </div>
        </NeuCard>
      </div>

      {/* 5-Day Weekly Routine Roadmap */}
      <div className="flex flex-col gap-2.5 mt-1">
        <div className="flex justify-between items-center ml-1">
          <h4 className="font-bold text-[var(--color-text-main)] text-sm">Plan Semanal Completo (5 Días)</h4>
          <span className="text-[10px] font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded-full shadow-neu-flat">
            {clientRoutines.length} Días
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {clientRoutines.map((routine, idx) => {
            const routineErs = ejerciciosRutina.filter(er => er.id_rutina === routine.id);
            return (
              <NeuCard 
                key={routine.id} 
                className="p-3.5 flex flex-col gap-2 cursor-pointer hover:shadow-neu-pressed transition-all"
                onClick={() => onStartWorkout(routine.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full shadow-neu-pressed flex items-center justify-center text-xs font-bold text-[var(--color-accent-blue)]">
                      {routine.dia_semana || idx + 1}
                    </span>
                    <span className="font-bold text-xs text-[var(--color-text-main)]">{routine.nombre_sesion}</span>
                  </div>
                  <NeuButton 
                    className="px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-blue)] h-7 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkout(routine.id);
                    }}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Ver</span>
                  </NeuButton>
                </div>

                {routineErs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {routineErs.map((er) => {
                      const ex = ejercicios.find(e => e.id === er.id_ejercicio);
                      return (
                        <span 
                          key={er.id} 
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] font-medium"
                        >
                          {ex?.nombre || 'Ejercicio'} ({er.series_objetivo}x{er.reps_objetivo})
                        </span>
                      );
                    })}
                  </div>
                )}
              </NeuCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LiveWorkout({ 
  initialRoutineId, 
  onClearInitialRoutine 
}: { 
  initialRoutineId?: string | null; 
  onClearInitialRoutine?: () => void; 
}) {
  const { currentUser, rutinas, ejerciciosRutina, ejercicios } = useStore();
  const clientRoutines = getClientRoutines(rutinas, currentUser);

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    initialRoutineId || clientRoutines[0]?.id || rutinas[0]?.id || 'r1'
  );

  useEffect(() => {
    if (initialRoutineId) {
      setSelectedRoutineId(initialRoutineId);
      if (onClearInitialRoutine) onClearInitialRoutine();
    }
  }, [initialRoutineId, onClearInitialRoutine]);

  // Keep selectedRoutineId valid
  const currentRoutine = clientRoutines.find(r => r.id === selectedRoutineId) || clientRoutines[0] || rutinas[0];
  const routineExercises = ejerciciosRutina.filter(er => er.id_rutina === currentRoutine?.id);
  
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isExerciseFinished, setIsExerciseFinished] = useState(false);
  
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const currentEr = routineExercises[currentExerciseIdx];
  const currentEx = ejercicios.find(e => e.id === currentEr?.id_ejercicio);

  const [currentSet, setCurrentSet] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [reps, setReps] = useState(currentEr?.reps_objetivo?.split('-')[0] || "10");
  const [weight, setWeight] = useState("12.5");
  const [rpe, setRpe] = useState(currentEr?.rpe_objetivo?.toString() || "8");

  // Reset exercise index when routine changes
  useEffect(() => {
    if (clientRoutines.length > 0 && !clientRoutines.some(r => r.id === selectedRoutineId)) {
      setSelectedRoutineId(clientRoutines[0].id);
    }
  }, [clientRoutines, selectedRoutineId]);

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

  if (!currentRoutine) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#718096]">
        <Dumbbell className="w-12 h-12 mb-2 opacity-50" />
        <p>No hay rutina programada.</p>
      </div>
    );
  }

  if (!isWorkoutStarted) {
    return (
      <div className="flex flex-col gap-3 h-full pb-4">
        {/* Day Selector Navigation Bar (5 Days) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Seleccionar Día de Entrenamiento
            </span>
            <span className="text-[10px] font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded-full shadow-neu-pressed">
              5 Sesiones
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {clientRoutines.map((r, i) => {
              const isSelected = r.id === currentRoutine?.id;
              const exercisesCount = ejerciciosRutina.filter(er => er.id_rutina === r.id).length;
              return (
                <button
                  key={r.id}
                  id={`btn-day-${r.dia_semana || i + 1}`}
                  onClick={() => {
                    setSelectedRoutineId(r.id);
                    setCompletedExercises(new Set());
                  }}
                  className={`py-2 px-1 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-2 ring-[var(--color-accent-blue)]/30 font-bold'
                      : 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] font-medium active:shadow-neu-pressed'
                  }`}
                >
                  <span className="text-xs leading-none">Día {r.dia_semana || i + 1}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md mt-0.5 font-bold ${isSelected ? 'bg-[var(--color-accent-blue)] text-white shadow-sm' : 'bg-[#c5cad1]/40 text-[var(--color-text-muted)]'}`}>
                    {exercisesCount > 0 ? `${exercisesCount} ej.` : 'Sesión'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col mt-1">
          <span className="text-[var(--color-accent-blue)] font-bold text-xs tracking-widest uppercase">Plan Semanal Activo</span>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] leading-snug">{currentRoutine.nombre_sesion}</h2>
        </div>
        
        {routineExercises.length === 0 ? (
          <NeuCard className="p-6 flex flex-col items-center justify-center gap-3 text-center my-auto">
            <Dumbbell className="w-10 h-10 text-[var(--color-accent-blue)] opacity-60" />
            <h3 className="font-bold text-[var(--color-text-main)] text-base">Cargando ejercicios de la sesión...</h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
              Sincronizando los ejercicios recomendados para este día de entrenamiento.
            </p>
          </NeuCard>
        ) : (
          <div className="flex-1 flex flex-col gap-2.5 -mx-4 px-4 overflow-y-visible">
            {routineExercises.map((er, idx) => {
              const ex = ejercicios.find(e => e.id === er.id_ejercicio);
              const isCompleted = completedExercises.has(idx);
              
              return (
                <NeuCard 
                  key={er.id} 
                  className={`p-3.5 flex items-center justify-between cursor-pointer active:shadow-neu-pressed transition-all ${isCompleted ? 'opacity-60' : ''}`}
                  onClick={() => {
                    setCurrentExerciseIdx(idx);
                    setCurrentSet(1);
                    setIsWorkoutStarted(true);
                    setIsExerciseFinished(false);
                    setIsResting(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 min-w-[2.25rem] rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-sm ${isCompleted ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-accent-blue)]'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text-main)] text-sm leading-tight">{ex?.nombre}</span>
                        {ex?.grupo_muscular && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-muted)] font-medium">
                            {ex.grupo_muscular}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-muted)] mt-0.5">
                        {er.series_objetivo} series × {er.reps_objetivo} reps • {er.descanso_segundos}s desc. • RPE {er.rpe_objetivo}
                      </span>
                      {ex?.instrucciones && (
                        <span className="text-[11px] text-[var(--color-accent-blue)] italic line-clamp-1 mt-0.5">
                          {ex.instrucciones}
                        </span>
                      )}
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="w-6 h-6 rounded-full shadow-neu-pressed flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#00C9A7]" />
                    </div>
                  )}
                </NeuCard>
              );
            })}

            {/* Cardio Post-Sesión Info */}
            <NeuCard inset className="p-3 mt-1">
              <span className="text-[11px] font-bold text-[var(--color-accent-blue)] uppercase tracking-wider block mb-1">
                Cardio Post-Sesión Opcional
              </span>
              <p className="text-xs text-[var(--color-text-muted)] leading-snug mb-1">
                <strong className="text-[var(--color-text-main)]">HIIT:</strong> 10-12 min (8 ciclos 20s sprint / 40s suave).
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-snug">
                <strong className="text-[var(--color-text-main)]">LISS:</strong> 20-30 min caminando (5-6 km/h) inclinación 8-12%.
              </p>
            </NeuCard>
          </div>
        )}
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
  const { currentUser, fichasProgreso } = useStore();
  const ficha = fichasProgreso.find((f) => f.id_cliente === currentUser?.id);

  let diasRestantes: number | null = null;
  if (ficha?.fecha_chequeo) {
    const target = new Date(ficha.fecha_chequeo).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    diasRestantes = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="flex flex-col gap-4 h-full pb-10">
      <div>
        <h2 className="text-2xl font-bold text-[#2D3748]">Mi Progreso</h2>
        <span className="text-xs text-[#718096]">Evaluaciones físicas y control de avances</span>
      </div>

      {/* Ficha de Evaluación del Entrenador */}
      {ficha && (
        <NeuCard className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[#c5cad1]/30 pb-2">
            <div className="flex items-center gap-2 text-[#4D7CFE] font-bold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Control Físico & Chequeos</span>
            </div>
            {diasRestantes !== null && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  diasRestantes < 0
                    ? "bg-red-100 text-red-600"
                    : diasRestantes <= 3
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {diasRestantes < 0
                  ? `Chequeo vencido (${Math.abs(diasRestantes)}d)`
                  : diasRestantes === 0
                  ? "¡Chequeo Hoy!"
                  : `Próx. Chequeo en ${diasRestantes} días`}
              </span>
            )}
          </div>

          {/* Dates row */}
          <div className="flex justify-between text-xs text-[#718096] bg-[#E0E5EC] px-3 py-2 rounded-xl shadow-neu-pressed">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4D7CFE]" />
              <span>Inicio: <strong className="text-[#2D3748]">{ficha.fecha_inicio}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00C9A7]" />
              <span>Revisión: <strong className="text-[#2D3748]">{ficha.fecha_chequeo}</strong></span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1">
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
              <span className="text-[9px] text-[#718096]">Peso</span>
              <span className="font-bold text-[#2D3748] text-xs">{ficha.peso_kg} kg</span>
            </div>
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
              <span className="text-[9px] text-[#718096]">Grasa</span>
              <span className="font-bold text-[#2D3748] text-xs">
                {ficha.grasa_porcentaje ? `${ficha.grasa_porcentaje}%` : "--"}
              </span>
            </div>
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
              <span className="text-[9px] text-[#718096]">Músculo</span>
              <span className="font-bold text-[#2D3748] text-xs">
                {ficha.musculo_porcentaje ? `${ficha.musculo_porcentaje}%` : "--"}
              </span>
            </div>
            <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
              <span className="text-[9px] text-[#718096]">Cintura</span>
              <span className="font-bold text-[#2D3748] text-xs">
                {ficha.cintura_cm ? `${ficha.cintura_cm} cm` : "--"}
              </span>
            </div>
          </div>

          {/* Anthropometrics Detail */}
          {(ficha.cadera_cm || ficha.pecho_cm || ficha.brazo_cm || ficha.muslo_cm) && (
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              {ficha.cadera_cm && (
                <div className="bg-[#E0E5EC] shadow-neu-pressed p-1.5 rounded-lg text-[#718096]">
                  Cadera: <strong className="text-[#2D3748]">{ficha.cadera_cm}cm</strong>
                </div>
              )}
              {ficha.pecho_cm && (
                <div className="bg-[#E0E5EC] shadow-neu-pressed p-1.5 rounded-lg text-[#718096]">
                  Pecho: <strong className="text-[#2D3748]">{ficha.pecho_cm}cm</strong>
                </div>
              )}
              {ficha.brazo_cm && (
                <div className="bg-[#E0E5EC] shadow-neu-pressed p-1.5 rounded-lg text-[#718096]">
                  Brazo: <strong className="text-[#2D3748]">{ficha.brazo_cm}cm</strong>
                </div>
              )}
              {ficha.muslo_cm && (
                <div className="bg-[#E0E5EC] shadow-neu-pressed p-1.5 rounded-lg text-[#718096]">
                  Muslo: <strong className="text-[#2D3748]">{ficha.muslo_cm}cm</strong>
                </div>
              )}
            </div>
          )}

          {/* Coach Notes */}
          {ficha.notas_entrenador && (
            <div className="bg-[#E0E5EC] p-3 rounded-xl shadow-neu-pressed text-xs">
              <span className="font-bold text-[#4D7CFE] block mb-1 text-[11px] uppercase tracking-wider">
                Pauta del Entrenador:
              </span>
              <p className="text-[#2D3748] leading-relaxed">{ficha.notas_entrenador}</p>
            </div>
          )}
        </NeuCard>
      )}

      {/* Fuerza y Rendimiento */}
      <NeuCard className="p-4">
        <h3 className="text-[#718096] font-medium mb-4 text-sm">Progresión de Cargas Estimada (kg)</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 12 }} />
              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#718096", fontSize: 12 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  backgroundColor: "#E0E5EC",
                  boxShadow: "8px 8px 16px #c5cad1, -8px -8px 16px #ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="rm"
                stroke="#4D7CFE"
                strokeWidth={4}
                dot={{ r: 6, fill: "#E0E5EC", strokeWidth: 3 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </NeuCard>

      <h3 className="font-bold text-[#2D3748] ml-1 mt-1 text-sm">Bienestar y Adherencia</h3>
      <div className="flex flex-col gap-3">
        {["Nivel de Fatiga", "Calidad de Sueño", "Estrés"].map((item, i) => (
          <NeuCard inset key={i} className="flex justify-between items-center py-2.5 px-4 !rounded-2xl">
            <span className="text-[#718096] text-xs font-medium">{item}</span>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full shadow-neu-flat flex items-center justify-center text-xs font-bold text-[#2D3748]">
                {8 - i}
              </div>
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
}
