import { useState, useEffect, useRef } from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { Dumbbell, Check, Play, Pause, RotateCcw, Droplets, Calendar, Scale, Ruler, Target, Clock, Activity, ChevronRight, Coffee, Sparkles, ArrowLeft, BarChart2, MoreVertical, Plus, ChevronDown, Lock } from "lucide-react";
import { useStore, getClientRoutines, getClientActiveRoutines, getDiaSemanaNombre, getDiaSemanaCorto, SerieLograda, EjercicioRealizadoLog } from "@/store";
import { playLogradoSound } from "@/utils/audio";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AthleteProgressView } from "@/components/AthleteProgressView";
import { FichaEstadisticasUsoModal } from "@/components/FichaEstadisticasUsoModal";
import { RegistroEjerciciosRealizadosModal } from "@/components/RegistroEjerciciosRealizadosModal";
import { MuscleIcon } from "@/components/ui/MuscleIcon";
import { getRoutineThumbnail, getRoutineCategoryName } from "@/utils/routineAssets";
import { checkAthleteRoutineAccess, RoutineAccessStatus } from "@/utils/routineAccess";
import { RoutineAccessBlockedCard } from "@/components/RoutineAccessBlockedCard";
import { WorkoutTimeExpiredModal } from "@/components/WorkoutTimeExpiredModal";

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
  const { currentUser, usuarios, rutinas, planNutricion, ejerciciosRutina, ejercicios, uiStyle } = useStore();
  const activeRoutines = getClientActiveRoutines(rutinas, currentUser);
  const todayDay = new Date().getDay();
  const todayRoutine = activeRoutines.find((r) => r.dia_semana === todayDay);
  
  const [homeUsageModalOpen, setHomeUsageModalOpen] = useState(false);
  const [homeLogModalOpen, setHomeLogModalOpen] = useState(false);
  const [blockedStatus, setBlockedStatus] = useState<RoutineAccessStatus | null>(null);

  // General routine access status
  const generalAccess = checkAthleteRoutineAccess(currentUser, usuarios);

  const handleTryStartWorkout = (routineId: string) => {
    const routine = rutinas.find((r) => r.id === routineId);
    const targetDay = routine?.dia_semana;
    const access = checkAthleteRoutineAccess(currentUser, usuarios, targetDay);
    if (!access.allowed) {
      setBlockedStatus(access);
      return;
    }
    onStartWorkout(routineId);
  };

  // Modern Gold view matching the user's uploaded photo exactly
  if (uiStyle === 'modern_gold') {
    const displayRoutine = todayRoutine || activeRoutines[0] || rutinas[0];
    const routineExercises = displayRoutine ? ejerciciosRutina.filter(er => er.id_rutina === displayRoutine.id) : [];

    return (
      <div className="flex flex-col h-full -mx-4">
        {/* Top Organic Golden Curved Banner */}
        <div className="bg-amber-400 dark:bg-amber-500 rounded-b-[40px] px-4 pt-3 pb-6 text-slate-950 shadow-md">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Rutinas de Entrenamiento
            </h2>
            <button
              type="button"
              onClick={() => {
                if (displayRoutine) {
                  handleTryStartWorkout(displayRoutine.id);
                }
              }}
              className="bg-white hover:bg-slate-50 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Añadir</span>
            </button>
          </div>

          {/* Horizontal Carousel of Routine Cards */}
          <div className="flex gap-3 overflow-x-auto pb-1 pt-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
            {(activeRoutines.length > 0 ? activeRoutines : rutinas.slice(0, 3)).map((routine) => {
              const routineErs = ejerciciosRutina.filter(er => er.id_rutina === routine.id);
              const isToday = routine.dia_semana === todayDay;
              const thumbImg = getRoutineThumbnail(routine.nombre_sesion);
              const categoryTitle = getRoutineCategoryName(routine.nombre_sesion);
              const routineAccess = checkAthleteRoutineAccess(currentUser, usuarios, routine.dia_semana);

              return (
                <div
                  key={routine.id}
                  className="w-[155px] shrink-0 bg-white dark:bg-slate-900 rounded-[28px] p-3 shadow-sm flex flex-col justify-between snap-start border border-amber-200/60 dark:border-slate-800"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2.5 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={thumbImg}
                      alt={routine.nombre_sesion}
                      className="w-full h-full object-cover"
                    />
                    {isToday && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                        Hoy
                      </span>
                    )}
                    {!routineAccess.allowed && (
                      <span className="absolute top-2 right-2 bg-slate-900/80 text-amber-300 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{routineAccess.modo === 'solo_hoy' ? 'Solo hoy' : 'Pausado'}</span>
                      </span>
                    )}
                    {routineAccess.allowed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTryStartWorkout(routine.id);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="px-1 mb-2.5">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white leading-tight truncate">
                      {categoryTitle}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {getDiaSemanaNombre(routine.dia_semana)} • {routineErs.length} ej.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTryStartWorkout(routine.id)}
                    className="w-full bg-black hover:bg-slate-800 text-white dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 text-[11px] font-bold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    {!routineAccess.allowed ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Acceso Restringido</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Reproducir</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Access Block Notice in Modern Gold */}
        {!generalAccess.allowed && generalAccess.modo !== 'solo_hoy' && (
          <div className="px-4 pt-4">
            <RoutineAccessBlockedCard status={generalAccess} />
          </div>
        )}

        {/* Section Entrenamientos & Exercise Cards */}
        <div className="px-4 pt-5 pb-6 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Entrenamientos
            </h2>
            <button
              type="button"
              onClick={() => {
                if (displayRoutine) {
                  handleTryStartWorkout(displayRoutine.id);
                }
              }}
              className="bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir</span>
            </button>
          </div>

          {/* Quick Access Badges (Uso Web & Realizados) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setHomeUsageModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2.5 text-left hover:border-amber-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                  Uso Web
                </span>
                <span className="text-[10px] text-slate-500">
                  Estadísticas y tiempo
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHomeLogModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2.5 text-left hover:border-emerald-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                  Realizados
                </span>
                <span className="text-[10px] text-slate-500">
                  Historial de series
                </span>
              </div>
            </button>
          </div>

          {/* List of Exercise Cards matching the photo exactly */}
          <div className="flex flex-col gap-3">
            {routineExercises.length === 0 ? (
              <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 text-center text-slate-500">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Sin ejercicios programados para hoy</p>
                <p className="text-[11px] mt-1">Toca en reproducir en cualquier rutina superior para iniciar.</p>
              </div>
            ) : (
              routineExercises.map((er) => {
                const ex = ejercicios.find((e) => e.id === er.id_ejercicio);
                const targetKg1 = er.series_objetivo * 5;
                const targetKg2 = er.series_objetivo * 5 + 5;

                return (
                  <div
                    key={er.id}
                    onClick={() => handleTryStartWorkout(displayRoutine.id)}
                    className="bg-[#F1F5F9] dark:bg-[#1E293B] rounded-[26px] p-4 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-amber-400/60 active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shrink-0 shadow-sm">
                          <MuscleIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {ex?.nombre || 'Ejercicio de Fuerza'}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {ex?.grupo_muscular || 'Músculo Principal'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTryStartWorkout(displayRoutine.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 2-column bulleted reps & weights matching the photo */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium pl-14">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                        <span>{er.reps_objetivo || 8} Reps {targetKg1} kg</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                        <span>{er.reps_objetivo || 8} Reps {targetKg1} kg</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                        <span>{Math.max(Number(er.reps_objetivo || 8) + 2, 10)} Reps {targetKg2} kg</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                        <span>{Math.max(Number(er.reps_objetivo || 8) + 2, 10)} Reps {targetKg2} kg</span>
                      </div>
                    </div>

                    {/* Centered Chevron Down */}
                    <div className="flex justify-center text-slate-400 pt-0.5">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal when athlete tries to access a restricted routine */}
        {blockedStatus && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <RoutineAccessBlockedCard
                status={blockedStatus}
                onRetry={() => setBlockedStatus(null)}
              />
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setBlockedStatus(null)}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 hover:bg-white px-5 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <FichaEstadisticasUsoModal
          isOpen={homeUsageModalOpen}
          onClose={() => setHomeUsageModalOpen(false)}
        />

        <RegistroEjerciciosRealizadosModal
          isOpen={homeLogModalOpen}
          onClose={() => setHomeLogModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-light text-[var(--color-text-main)]">Hola,</h2>
          <h3 className="text-3xl font-bold text-[var(--color-accent-blue)]">{currentUser?.nombre || 'Atleta'}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
            {activeRoutines.length} días de entrenamiento programados por tu entrenador
          </p>
        </div>

        <div className="flex gap-1.5 pt-1">
          <NeuButton
            variant="circle"
            className="w-9 h-9 text-[var(--color-accent-blue)]"
            onClick={() => setHomeUsageModalOpen(true)}
            title="Ver tu ficha de estadísticas de uso web"
          >
            <Clock className="w-4 h-4" />
          </NeuButton>
          <NeuButton
            variant="circle"
            className="w-9 h-9 text-[#00C9A7]"
            onClick={() => setHomeLogModalOpen(true)}
            title="Ver registro de ejercicios realizados"
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </NeuButton>
        </div>
      </div>

      {/* Global Access Block Notice in Neumorphic mode */}
      {!generalAccess.allowed && generalAccess.modo !== 'solo_hoy' && (
        <RoutineAccessBlockedCard status={generalAccess} />
      )}

      {/* Quick Action Cards: Ficha de Uso Web & Ejercicios Realizados */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setHomeUsageModalOpen(true)}
          className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed transition-all flex items-center gap-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--color-text-main)] block leading-tight">
              Ficha de Uso Web
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Tiempos y estadísticas
            </span>
          </div>
        </button>

        <button
          onClick={() => setHomeLogModalOpen(true)}
          className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed transition-all flex items-center gap-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[#00C9A7] shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--color-text-main)] block leading-tight">
              Realizados
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Historial de series
            </span>
          </div>
        </button>
      </div>

      {todayRoutine ? (
        <NeuCard className="flex items-center justify-between py-3 px-4">
          <div className="flex flex-col max-w-[75%]">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[var(--color-accent-blue)] text-xs font-bold uppercase tracking-wider">
                Rutina de Hoy • {getDiaSemanaNombre(todayRoutine.dia_semana)}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--color-accent-blue)] text-white px-1.5 py-0.2 rounded shadow-sm">
                Hoy
              </span>
            </div>
            <span className="text-[var(--color-text-main)] text-lg font-bold truncate">{todayRoutine.nombre_sesion}</span>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {ejerciciosRutina.filter(er => er.id_rutina === todayRoutine.id).length} ejercicios recomendados
            </span>
          </div>
          <NeuButton 
            variant="circle" 
            className="w-12 h-12 text-[var(--color-accent-blue)] shrink-0" 
            onClick={() => handleTryStartWorkout(todayRoutine.id)}
          >
            <Play className="w-5 h-5 ml-1" />
          </NeuButton>
        </NeuCard>
      ) : (
        <NeuCard className="flex items-center justify-between py-3.5 px-4 bg-[var(--color-bg-base)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--color-accent-blue)] uppercase tracking-wider">
                Día de Descanso Recomendado
              </span>
              <span className="text-sm font-bold text-[var(--color-text-main)]">
                Recuperación activa y descanso
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {activeRoutines.length > 0 ? `Próxima sesión: ${getDiaSemanaNombre(activeRoutines[0].dia_semana)}` : 'Sin sesiones activas'}
              </span>
            </div>
          </div>
          {activeRoutines.length > 0 && (
            <NeuButton
              className="px-3 py-1.5 text-xs font-bold text-[var(--color-accent-blue)] h-8 flex items-center gap-1"
              onClick={() => handleTryStartWorkout(activeRoutines[0].id)}
            >
              <span>Ver Plan</span>
            </NeuButton>
          )}
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
            <span className="text-base font-bold text-[var(--color-accent-blue)]">{activeRoutines.length}/7</span>
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] text-center">
            Días de Entrenamiento<br/>Programados
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

      {/* Weekly Routine Roadmap (Only active workout days) */}
      <div className="flex flex-col gap-2.5 mt-1">
        <div className="flex justify-between items-center ml-1">
          <h4 className="font-bold text-[var(--color-text-main)] text-sm">Plan Semanal de Entrenamiento</h4>
          <span className="text-[10px] font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded-full shadow-neu-flat">
            {activeRoutines.length} Días Activos
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {activeRoutines.map((routine) => {
            const routineErs = ejerciciosRutina.filter(er => er.id_rutina === routine.id);
            const dayName = getDiaSemanaNombre(routine.dia_semana);
            const isToday = routine.dia_semana === todayDay;
            const routineAccess = checkAthleteRoutineAccess(currentUser, usuarios, routine.dia_semana);

            return (
              <NeuCard 
                key={routine.id} 
                className={`p-3.5 flex flex-col gap-2 cursor-pointer hover:shadow-neu-pressed transition-all ${
                  isToday ? 'ring-2 ring-[var(--color-accent-blue)]/30' : ''
                }`}
                onClick={() => handleTryStartWorkout(routine.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      isToday 
                        ? 'bg-[var(--color-accent-blue)] text-white shadow-sm' 
                        : 'shadow-neu-pressed text-[var(--color-accent-blue)]'
                    }`}>
                      {dayName}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-black uppercase text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-1.5 py-0.2 rounded shadow-neu-pressed">
                        Hoy
                      </span>
                    )}
                    {!routineAccess.allowed && (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-neu-pressed">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{routineAccess.modo === 'solo_hoy' ? 'Solo hoy' : 'Pausado'}</span>
                      </span>
                    )}
                    <span className="font-bold text-xs text-[var(--color-text-main)]">{routine.nombre_sesion}</span>
                  </div>
                  <NeuButton 
                    className="px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-blue)] h-7 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTryStartWorkout(routine.id);
                    }}
                  >
                    {!routineAccess.allowed ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>Restringido</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Ver</span>
                      </>
                    )}
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
                          {ex?.nombre || 'Ejercicio'} ({er.series_objetivo}×{er.reps_objetivo})
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

      {/* Modal dialog when trying to access locked routine in Neumorphic mode */}
      {blockedStatus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <RoutineAccessBlockedCard
              status={blockedStatus}
              onRetry={() => setBlockedStatus(null)}
            />
            <div className="mt-3 text-center">
              <NeuButton
                onClick={() => setBlockedStatus(null)}
                className="px-6 py-2 text-xs font-bold text-[var(--color-text-main)]"
              >
                Cerrar
              </NeuButton>
            </div>
          </div>
        </div>
      )}

      <FichaEstadisticasUsoModal
        isOpen={homeUsageModalOpen}
        onClose={() => setHomeUsageModalOpen(false)}
      />

      <RegistroEjerciciosRealizadosModal
        isOpen={homeLogModalOpen}
        onClose={() => setHomeLogModalOpen(false)}
      />
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
  const { 
    currentUser, 
    usuarios,
    rutinas, 
    ejerciciosRutina, 
    ejercicios,
    ejerciciosRealizados,
    progresosParciales,
    guardarProgresoParcial,
    registrarEjercicioCompleto,
    reabrirEjercicioRealizado,
    uiStyle
  } = useStore();

  const activeRoutines = getClientActiveRoutines(rutinas, currentUser);
  const todayDay = new Date().getDay();

  // Find routine matching today's day of week, or fallback to first active routine
  const todayRoutine = activeRoutines.find((r) => r.dia_semana === todayDay);
  const defaultRoutineId = initialRoutineId || todayRoutine?.id || activeRoutines[0]?.id || 'r1';

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(defaultRoutineId);
  const [activeListTab, setActiveListTab] = useState<'pendientes' | 'realizados'>('pendientes');
  const daysContainerRef = useRef<HTMLDivElement>(null);

  // Routine Access and Timeout States
  const [isTimeExpiredModalOpen, setIsTimeExpiredModalOpen] = useState(false);
  const [hasExtendedTime, setHasExtendedTime] = useState(false);
  const [gracePeriodEnd, setGracePeriodEnd] = useState<number | null>(null);

  const scrollToDay = (diaSemana: number, smooth = true) => {
    if (!daysContainerRef.current) return;
    const container = daysContainerRef.current;
    const dayBtn = container.querySelector<HTMLElement>(`#btn-day-${diaSemana}`);
    if (dayBtn) {
      const scrollTarget = dayBtn.offsetLeft - (container.clientWidth / 2) + (dayBtn.clientWidth / 2);
      container.scrollTo({
        left: scrollTarget,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Keep today centered on load and whenever active routines change
  useEffect(() => {
    const targetDay = todayRoutine ? todayRoutine.dia_semana : (currentRoutine ? currentRoutine.dia_semana : todayDay);
    scrollToDay(targetDay, false);
    const t = setTimeout(() => {
      scrollToDay(targetDay, false);
    }, 60);
    return () => clearTimeout(t);
  }, [todayDay, activeRoutines.length]);

  useEffect(() => {
    if (initialRoutineId) {
      setSelectedRoutineId(initialRoutineId);
      if (onClearInitialRoutine) onClearInitialRoutine();
    }
  }, [initialRoutineId, onClearInitialRoutine]);

  // Keep selectedRoutineId valid among active routines
  useEffect(() => {
    if (activeRoutines.length > 0 && !activeRoutines.some((r) => r.id === selectedRoutineId)) {
      const matchToday = activeRoutines.find((r) => r.dia_semana === todayDay);
      setSelectedRoutineId(matchToday ? matchToday.id : activeRoutines[0].id);
    }
  }, [activeRoutines, selectedRoutineId, todayDay]);

  const currentRoutine = activeRoutines.find((r) => r.id === selectedRoutineId) || activeRoutines[0];
  const routineExercises = ejerciciosRutina.filter((er) => er.id_rutina === currentRoutine?.id);

  // Real-time access check for currently selected routine
  const currentAccess = checkAthleteRoutineAccess(currentUser, usuarios, currentRoutine?.dia_semana);

  // Status helpers for routine exercises
  const isErCompleted = (erId: string) => {
    return ejerciciosRealizados.some(
      (log) => log.id_rutina === currentRoutine?.id && log.id_ejercicio_rutina === erId && log.completado
    );
  };

  const getCompletedLog = (erId: string) => {
    return ejerciciosRealizados.find(
      (log) => log.id_rutina === currentRoutine?.id && log.id_ejercicio_rutina === erId && log.completado
    );
  };

  const getPartialProgress = (erId: string) => {
    return progresosParciales[erId];
  };

  const pendingExercises = routineExercises.filter((er) => !isErCompleted(er.id));
  const completedExercises = routineExercises.filter((er) => isErCompleted(er.id));

  // Active workout state
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentErId, setCurrentErId] = useState<string | null>(null);
  const [isExerciseFinished, setIsExerciseFinished] = useState(false);
  
  // Exercise duration & timing states
  const [exerciseStartTime, setExerciseStartTime] = useState<string>('');
  const [exerciseStartTimestamp, setExerciseStartTimestamp] = useState<number>(0);

  // Modals for statistics and performed exercise logs
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isExerciseLogModalOpen, setIsExerciseLogModalOpen] = useState(false);

  const currentEr = routineExercises.find((er) => er.id === currentErId) || pendingExercises[0];
  const currentEx = ejercicios.find((e) => e.id === currentEr?.id_ejercicio);

  const [currentSet, setCurrentSet] = useState(1);
  const [loggedSeries, setLoggedSeries] = useState<SerieLograda[]>([]);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [rpe, setRpe] = useState("8");

  // Timer countdown
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

  // Periodic access control check during an active workout session
  useEffect(() => {
    if (!isWorkoutStarted) {
      setIsTimeExpiredModalOpen(false);
      setHasExtendedTime(false);
      setGracePeriodEnd(null);
      return;
    }

    const checkInterval = setInterval(() => {
      const access = checkAthleteRoutineAccess(currentUser, usuarios, currentRoutine?.dia_semana);
      if (!access.allowed) {
        if (hasExtendedTime) {
          if (gracePeriodEnd && Date.now() > gracePeriodEnd) {
            // Grace period ended! Gracefully interrupt and save partial progress
            setIsTimeExpiredModalOpen(false);
            handleInterruptAndReturn();
          }
        } else {
          // Trigger timeout warning modal
          setIsTimeExpiredModalOpen(true);
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isWorkoutStarted, currentUser, usuarios, currentRoutine?.dia_semana, hasExtendedTime, gracePeriodEnd]);

  // Handle athlete requesting 5-minute extension when access times out during exercise
  const handleExtendWorkout = () => {
    setHasExtendedTime(true);
    setGracePeriodEnd(Date.now() + 5 * 60 * 1000); // 5 minutes grace period
    setIsTimeExpiredModalOpen(false);
  };

  // Handle athlete clicking save and exit on expiration modal
  const handleSaveAndExitWorkout = () => {
    setIsTimeExpiredModalOpen(false);
    handleInterruptAndReturn();
  };

  // Start training a specific exercise (either fresh or resuming from partial)
  const handleStartExercise = (er: typeof routineExercises[0]) => {
    // Check access permission before starting
    const access = checkAthleteRoutineAccess(currentUser, usuarios, currentRoutine?.dia_semana);
    if (!access.allowed) {
      return;
    }

    setCurrentErId(er.id);
    const partial = getPartialProgress(er.id);
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const nowTs = Date.now();

    if (partial && partial.series.length > 0) {
      // Resume from partial progress
      setLoggedSeries([...partial.series]);
      const nextSetNum = Math.min(partial.series.length + 1, er.series_objetivo);
      setCurrentSet(nextSetNum);
      const last = partial.series[partial.series.length - 1];
      setWeight(last.peso_kg > 0 ? String(last.peso_kg) : "");
      setReps(String(last.reps || er.reps_objetivo.split('-')[0] || 10));
      setRpe(String(last.rpe || er.rpe_objetivo || 8));
      setExerciseStartTime(partial.hora_inicio || nowTimeStr);
      setExerciseStartTimestamp(partial.inicio_timestamp || nowTs);
    } else {
      // Fresh start
      setLoggedSeries([]);
      setCurrentSet(1);
      setWeight("");
      setReps(er.reps_objetivo?.split('-')[0] || "10");
      setRpe(er.rpe_objetivo?.toString() || "8");
      setExerciseStartTime(nowTimeStr);
      setExerciseStartTimestamp(nowTs);
    }
    setIsWorkoutStarted(true);
    setIsExerciseFinished(false);
    setIsResting(false);
  };

  // Button "LOGRADO!" - emits sound, logs set, advances or finishes
  const handleLogradoClick = () => {
    if (!currentEr || !currentEx || !currentRoutine) return;

    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const parsedWeight = Number(weight) || 0;
    const parsedReps = Number(reps) || Number(currentEr.reps_objetivo?.split('-')[0]) || 10;
    const parsedRpe = Number(rpe) || currentEr.rpe_objetivo || 8;

    const newSerie: SerieLograda = {
      numero_serie: currentSet,
      peso_kg: parsedWeight,
      reps: parsedReps,
      rpe: parsedRpe,
      timestamp: nowTimeStr,
    };

    const updatedSeries = [...loggedSeries, newSerie];
    setLoggedSeries(updatedSeries);

    const isLastSet = currentSet >= currentEr.series_objetivo;

    if (isLastSet) {
      // Final set completed! Emit celebratory sound and mark exercise as completed
      playLogradoSound(true);

      const finishTimestamp = Date.now();
      const startTs = exerciseStartTimestamp || finishTimestamp;
      const durSecs = Math.max(1, Math.round((finishTimestamp - startTs) / 1000));

      const completedLog: EjercicioRealizadoLog = {
        id: `log_${currentEr.id}_${Date.now()}`,
        id_cliente: currentUser?.id || 'u1',
        id_rutina: currentRoutine.id,
        id_ejercicio_rutina: currentEr.id,
        id_ejercicio: currentEx.id,
        nombre_ejercicio: currentEx.nombre,
        grupo_muscular: currentEx.grupo_muscular,
        fecha: new Date().toISOString().split('T')[0],
        series: updatedSeries,
        total_series_objetivo: currentEr.series_objetivo,
        completado: true,
        completado_at: nowTimeStr,
        hora_inicio: exerciseStartTime || nowTimeStr,
        hora_fin: nowTimeStr,
        duracion_segundos: durSecs,
        inicio_timestamp: startTs,
        fin_timestamp: finishTimestamp,
      };

      registrarEjercicioCompleto(completedLog);
      setIsResting(false);
      setIsExerciseFinished(true);
    } else {
      // Intermediate set completed! Emit pleasant sound, save partial progress, start rest
      playLogradoSound(false);
      guardarProgresoParcial(currentEr.id, updatedSeries, exerciseStartTime, exerciseStartTimestamp);

      setIsResting(true);
      setTimer(currentEr.descanso_segundos || 90);
      setCurrentSet((prev) => prev + 1);
    }
  };

  // Button "Regresar" - interrupts active exercise, saves progress registered so far, does NOT mark complete, remains in list
  const handleInterruptAndReturn = () => {
    if (currentEr && loggedSeries.length > 0) {
      guardarProgresoParcial(currentEr.id, loggedSeries, exerciseStartTime, exerciseStartTimestamp);
    }
    setIsWorkoutStarted(false);
    setIsExerciseFinished(false);
    setIsResting(false);
  };

  // Next pending exercise flow
  const handleGoToNextPending = () => {
    // Re-evaluate pending exercises
    const remainingPending = routineExercises.filter(
      (er) => er.id !== currentEr?.id && !isErCompleted(er.id)
    );

    if (remainingPending.length > 0) {
      handleStartExercise(remainingPending[0]);
    } else {
      // All exercises in this routine are now completed!
      setIsWorkoutStarted(false);
      setIsExerciseFinished(false);
      setActiveListTab('realizados');
    }
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
        <p>No hay rutinas activas programadas.</p>
      </div>
    );
  }

  // ==========================================
  // VIEW: Exercise Finished / Completed Dialog
  // ==========================================
  if (isWorkoutStarted && isExerciseFinished) {
    const remainingPending = routineExercises.filter(
      (er) => er.id !== currentEr?.id && !isErCompleted(er.id)
    );

    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 pb-8 px-2">
        <div className="w-24 h-24 rounded-full shadow-neu-flat flex items-center justify-center text-[#00C9A7] bg-[var(--color-bg-base)]">
          <Check className="w-14 h-14 stroke-[3]" />
        </div>
        <div className="text-center">
          <span className="text-xs font-bold text-[#00C9A7] uppercase tracking-widest bg-[#00C9A7]/10 px-3 py-1 rounded-full">
            ¡Ejercicio Logrado!
          </span>
          <h2 className="text-2xl font-bold text-[var(--color-text-main)] mt-2">{currentEx?.nombre}</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs">
            Completaste con éxito las {currentEr?.series_objetivo} series programadas. Este ejercicio ha quedado registrado con su check en la ventana de <strong>"Realizados"</strong>.
          </p>
        </div>

        {/* Series Summary */}
        <NeuCard inset className="w-full max-w-sm p-3 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Series registradas ({loggedSeries.length})
          </span>
          <div className="grid grid-cols-2 gap-2">
            {loggedSeries.map((s) => (
              <div key={s.numero_serie} className="text-xs bg-[var(--color-bg-base)] shadow-neu-flat p-2 rounded-xl flex flex-col">
                <span className="font-bold text-[var(--color-text-main)]">Serie {s.numero_serie}</span>
                <span className="text-[11px] text-[var(--color-accent-blue)] font-medium">
                  {s.reps} reps × {s.peso_kg} kg
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">RPE {s.rpe}</span>
              </div>
            ))}
          </div>
        </NeuCard>

        <div className="flex flex-col w-full max-w-sm gap-3 mt-2">
          {remainingPending.length > 0 ? (
            <NeuButton 
              className="w-full text-[var(--color-accent-blue)] font-bold h-12 text-base flex items-center justify-center gap-2"
              onClick={handleGoToNextPending}
            >
              <span>Siguiente Ejercicio Pendiente</span>
              <ChevronRight className="w-5 h-5" />
            </NeuButton>
          ) : (
            <div className="text-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-sm">
              🎉 ¡Felicidades! Completaste todos los ejercicios de la sesión de hoy.
            </div>
          )}

          <NeuButton 
            className="w-full text-[#00C9A7] font-bold h-12 text-base flex items-center justify-center gap-2"
            onClick={() => {
              setIsWorkoutStarted(false);
              setIsExerciseFinished(false);
              setActiveListTab('realizados');
            }}
          >
            <Check className="w-5 h-5" />
            <span>Ver en 'Realizados'</span>
          </NeuButton>

          <NeuButton 
            className="w-full text-[var(--color-text-muted)] font-bold h-11 text-sm flex items-center justify-center gap-1.5"
            onClick={() => {
              setIsWorkoutStarted(false);
              setIsExerciseFinished(false);
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Regresar a la Lista</span>
          </NeuButton>
        </div>

        {/* Workout Time Expired Modal for finished view */}
        <WorkoutTimeExpiredModal
          isOpen={isTimeExpiredModalOpen}
          onExtend={handleExtendWorkout}
          onSaveAndExit={handleSaveAndExitWorkout}
          trainerName={currentAccess.trainerName}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: Active Exercise In Progress Screen
  // ==========================================
  if (isWorkoutStarted && currentEx && currentEr) {
    return (
      <div className="flex flex-col gap-3 h-full pb-8">
        {/* Top Header with Regresar Button */}
        <div className="flex justify-between items-center">
          <NeuButton
            onClick={handleInterruptAndReturn}
            className="px-3 py-1.5 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center gap-1.5"
            title="Interrumpir ejercicio y regresar a la lista guardando el avance registrado"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--color-accent-blue)]" />
            <span>Regresar</span>
          </NeuButton>

          <NeuCard inset className="px-3 py-1.5 !rounded-xl whitespace-nowrap">
            <span className="text-[var(--color-accent-blue)] font-bold text-xs">
              Serie {currentSet}/{currentEr.series_objetivo}
            </span>
          </NeuCard>
        </div>

        {/* Exercise Info Card */}
        <NeuCard className="py-3 px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-text-main)] leading-tight">{currentEx.nombre}</h2>
            {currentEx.grupo_muscular && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] font-bold">
                {currentEx.grupo_muscular}
              </span>
            )}
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] font-medium mt-1.5">
            <span>Tempo: <strong>{currentEr.tempo}</strong></span>
            <span>Objetivo: <strong>{currentEr.reps_objetivo} reps @ RPE {currentEr.rpe_objetivo}</strong></span>
          </div>
          {currentEx.instrucciones && (
            <p className="mt-2 text-xs italic text-[var(--color-accent-blue)]">{currentEx.instrucciones}</p>
          )}
        </NeuCard>

        {/* Recorded Series So Far In This Session */}
        {loggedSeries.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase shrink-0">
              Hechas:
            </span>
            {loggedSeries.map((s) => (
              <span
                key={s.numero_serie}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-main)] font-semibold shrink-0"
              >
                S{s.numero_serie}: {s.reps} reps × {s.peso_kg} kg
              </span>
            ))}
          </div>
        )}

        {/* Resting or Working Screen */}
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div
              key="resting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 py-8"
            >
              <div className="relative w-40 h-40 rounded-full shadow-neu-flat flex flex-col items-center justify-center">
                <div className="absolute inset-2 rounded-full shadow-neu-pressed pointer-events-none"></div>
                <span className="text-5xl font-bold text-[var(--color-accent-blue)]">{formatTime(timer)}</span>
                <span className="text-xs text-[var(--color-text-muted)] font-bold mt-2 uppercase tracking-wider">
                  Descanso
                </span>
              </div>
              
              <div className="flex gap-4">
                <NeuButton variant="circle" onClick={() => setTimer((t) => t + 30)} className="font-bold text-xs">
                  +30s
                </NeuButton>
                <NeuButton 
                  variant="circle" 
                  onClick={() => setIsResting(false)} 
                  className="text-[#00C9A7]"
                  title="Saltar descanso"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </NeuButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="working"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3 mt-1"
            >
              <div className="grid grid-cols-2 gap-3">
                <NeuInput 
                  label="Peso (kg)" 
                  type="number" 
                  step="0.5"
                  value={weight} 
                  placeholder="ej. 15"
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
                  min="1"
                  max="10"
                  value={rpe} 
                  onChange={(e) => setRpe(e.target.value)} 
                  className="text-center text-lg font-bold h-12"
                />
              </div>

              {/* Requirement: Cambia el botón "COMPLETAR SERIE" por "LOGRADO!" y debe emitir un sonido */}
              <NeuButton 
                className="mt-3 h-14 text-lg text-[#00C9A7] font-extrabold flex items-center justify-center gap-2 shadow-neu-flat active:shadow-neu-pressed tracking-wide"
                onClick={handleLogradoClick}
              >
                <Check className="w-7 h-7 stroke-[3]" />
                <span>LOGRADO!</span>
              </NeuButton>

              <p className="text-[11px] text-center text-[var(--color-text-muted)] mt-1">
                Presiona <strong>"Regresar"</strong> arriba si necesitas pausar o interrumpir. Tu progreso quedará guardado.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workout Time Expired Modal for active exercise */}
        <WorkoutTimeExpiredModal
          isOpen={isTimeExpiredModalOpen}
          onExtend={handleExtendWorkout}
          onSaveAndExit={handleSaveAndExitWorkout}
          trainerName={currentAccess.trainerName}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: Main Routine List with Pendientes & Realizados Tabs
  // ==========================================
  const isCurrentDayToday = currentRoutine.dia_semana === todayDay;

  return (
    <div className="flex flex-col gap-3 h-full pb-4">
      {/* Day Selector Navigation Bar - Max 7 days, no duplicate days */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center px-1">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Días de Entrenamiento
          </span>
        </div>

        <div 
          ref={daysContainerRef}
          className="-mx-4 px-[calc(50%-44px)] flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
        >
          {activeRoutines.map((r) => {
            const isSelected = r.id === currentRoutine?.id;
            const dayName = getDiaSemanaNombre(r.dia_semana);
            const isToday = r.dia_semana === todayDay;
            const rAccess = checkAthleteRoutineAccess(currentUser, usuarios, r.dia_semana);

            return (
              <button
                key={r.id}
                id={`btn-day-${r.dia_semana}`}
                data-is-today={isToday ? "true" : "false"}
                onClick={() => {
                  setSelectedRoutineId(r.id);
                  scrollToDay(r.dia_semana, true);
                }}
                className={`w-[88px] min-w-[88px] shrink-0 py-2.5 px-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-1 snap-center ${
                  isSelected
                    ? 'bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-2 ring-[var(--color-accent-blue)]/40 font-bold'
                    : 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] font-medium active:shadow-neu-pressed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold leading-tight capitalize">{dayName}</span>
                  {!rAccess.allowed && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                  )}
                </div>
                {isToday && (
                  <span className="text-[8px] font-black uppercase tracking-wider bg-[var(--color-accent-blue)] text-white px-1.5 py-0.5 rounded-full shadow-sm">
                    Hoy
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice if today is rest day */}
      {!todayRoutine && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed text-xs text-[var(--color-text-muted)] border border-[#c5cad1]/20">
          <Coffee className="w-4 h-4 text-[var(--color-accent-blue)] flex-shrink-0" />
          <span>
            <strong>Hoy es día de descanso recomendado.</strong> Mostrando sesión de <strong>{getDiaSemanaNombre(currentRoutine.dia_semana)}</strong>.
          </span>
        </div>
      )}

      {/* Routine Title */}
      <div className="flex flex-col mt-0.5 px-1">
        <h2 className="text-lg font-bold text-[var(--color-text-main)] leading-snug">{currentRoutine.nombre_sesion}</h2>
      </div>

      {/* Access Control Guard for this day */}
      {!currentAccess.allowed ? (
        <div className="mt-2">
          <RoutineAccessBlockedCard status={currentAccess} />
        </div>
      ) : (
        <>
          {/* Sub-tabs: Pendientes vs Realizados */}
          <div className="flex bg-[var(--color-bg-base)] p-1 rounded-2xl shadow-neu-pressed mt-1">
            <button
              onClick={() => setActiveListTab('pendientes')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeListTab === 'pendientes'
                  ? 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({pendingExercises.length})</span>
            </button>
            <button
              onClick={() => setActiveListTab('realizados')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeListTab === 'realizados'
                  ? 'bg-[var(--color-bg-base)] shadow-neu-flat text-[#00C9A7]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Realizados ({completedExercises.length})</span>
            </button>
          </div>

      {/* TAB CONTENT: PENDIENTES */}
      {activeListTab === 'pendientes' && (
        <div className="flex-1 flex flex-col gap-2.5 -mx-4 px-4 overflow-y-visible">
          {pendingExercises.length === 0 ? (
            <NeuCard className="p-6 flex flex-col items-center justify-center gap-3 text-center my-auto">
              {routineExercises.length === 0 ? (
                <>
                  <Dumbbell className="w-10 h-10 text-[var(--color-accent-blue)] opacity-60" />
                  <h3 className="font-bold text-[var(--color-text-main)] text-base">Cargando ejercicios de la sesión...</h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
                    Sincronizando los ejercicios recomendados para este día de entrenamiento.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full shadow-neu-flat flex items-center justify-center text-[#00C9A7]">
                    <Check className="w-9 h-9 stroke-[3]" />
                  </div>
                  <h3 className="font-bold text-[var(--color-text-main)] text-base">¡Sesión completada!</h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
                    Has completado todos los ejercicios programados para este día. Puedes ver el registro detallado de cada ejercicio en la pestaña de <strong>"Realizados"</strong>.
                  </p>
                  <NeuButton 
                    className="mt-2 text-[#00C9A7] font-bold text-xs px-4 py-2"
                    onClick={() => setActiveListTab('realizados')}
                  >
                    Ver Ejercicios Realizados
                  </NeuButton>
                </>
              )}
            </NeuCard>
          ) : (
            <>
              {pendingExercises.map((er, idx) => {
                const ex = ejercicios.find((e) => e.id === er.id_ejercicio);
                const partial = getPartialProgress(er.id);
                const hasPartial = partial && partial.series.length > 0;

                if (uiStyle === 'modern_gold') {
                  const targetKg1 = er.series_objetivo * 5;
                  const targetKg2 = er.series_objetivo * 5 + 5;

                  return (
                    <div
                      key={er.id}
                      onClick={() => handleStartExercise(er)}
                      className="bg-[#F1F5F9] dark:bg-[#1E293B] rounded-[24px] p-4 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-amber-400/60 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white shrink-0 shadow-sm">
                            <MuscleIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                              {ex?.nombre}
                            </h4>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {ex?.grupo_muscular || 'Fuerza'}
                            </span>
                          </div>
                        </div>

                        <span className="bg-black hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Play className="w-3 h-3 fill-current" />
                          <span>Iniciar</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium pl-14">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                          <span>{er.reps_objetivo || 8} Reps {targetKg1} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                          <span>{er.reps_objetivo || 8} Reps {targetKg1} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                          <span>{Math.max(Number(er.reps_objetivo || 8) + 2, 10)} Reps {targetKg2} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 dark:text-white text-base leading-none">•</span>
                          <span>{Math.max(Number(er.reps_objetivo || 8) + 2, 10)} Reps {targetKg2} kg</span>
                        </div>
                      </div>

                      {hasPartial && (
                        <div className="pl-14 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Avance guardado: {partial.series.length}/{er.series_objetivo} series logradas (Toca para continuar)</span>
                        </div>
                      )}

                      <div className="flex justify-center text-slate-400 pt-0.5">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  );
                }

                return (
                  <NeuCard 
                    key={er.id} 
                    className="p-3.5 flex items-center justify-between cursor-pointer active:shadow-neu-pressed transition-all"
                    onClick={() => handleStartExercise(er)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 min-w-[2.25rem] rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-sm text-[var(--color-accent-blue)]">
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

                        {/* Partial progress badge if athlete previously clicked Regresar */}
                        {hasPartial && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Avance guardado: {partial.series.length}/{er.series_objetivo} series logradas (Toca para continuar)
                          </span>
                        )}

                        {ex?.instrucciones && (
                          <span className="text-[11px] text-[var(--color-accent-blue)] italic line-clamp-1 mt-0.5">
                            {ex.instrucciones}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[var(--color-accent-blue)] font-bold text-xs pl-2">
                      <Play className="w-4 h-4 ml-1" />
                    </div>
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
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: REALIZADOS */}
      {activeListTab === 'realizados' && (
        <div className="flex-1 flex flex-col gap-2.5 -mx-4 px-4 overflow-y-visible">
          {completedExercises.length === 0 ? (
            <NeuCard className="p-6 flex flex-col items-center justify-center gap-3 text-center my-auto">
              <Clock className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />
              <h3 className="font-bold text-[var(--color-text-main)] text-base">Aún no hay ejercicios realizados</h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
                Completa todas las series de un ejercicio pulsando <strong>"LOGRADO!"</strong> para que se marque con un check y se registre automáticamente aquí.
              </p>
              <NeuButton 
                className="mt-2 text-[var(--color-accent-blue)] font-bold text-xs px-4 py-2"
                onClick={() => setActiveListTab('pendientes')}
              >
                Ir a Ejercicios Pendientes
              </NeuButton>
            </NeuCard>
          ) : (
            <>
              {completedExercises.map((er) => {
                const ex = ejercicios.find((e) => e.id === er.id_ejercicio);
                const log = getCompletedLog(er.id);

                return (
                  <NeuCard key={er.id} className="p-3.5 flex flex-col gap-2 border border-emerald-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 min-w-[2.25rem] rounded-full shadow-neu-pressed flex items-center justify-center text-[#00C9A7]">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--color-text-main)] text-sm leading-tight">
                              {ex?.nombre}
                            </span>
                            {ex?.grupo_muscular && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-muted)] font-medium">
                                {ex.grupo_muscular}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#00C9A7] mt-0.5">
                            ✓ {er.series_objetivo} series completadas • {log?.completado_at ? `Registrado a las ${log.completado_at}` : 'Completado'}
                          </span>

                          {/* Exercise execution time breakdown */}
                          {log && (
                            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
                              {log.duracion_segundos ? (
                                <span className="text-[var(--color-text-main)] font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[var(--color-accent-blue)]" />
                                  Duración: {log.duracion_segundos < 60 ? `${log.duracion_segundos}s` : `${Math.floor(log.duracion_segundos / 60)}m ${log.duracion_segundos % 60}s`}
                                </span>
                              ) : null}
                              {log.hora_inicio && log.hora_fin ? (
                                <span>({log.hora_inicio} ➔ {log.hora_fin})</span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => reabrirEjercicioRealizado(er.id)}
                        className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] font-bold px-2 py-1 rounded-lg bg-[var(--color-bg-base)] shadow-neu-flat active:shadow-neu-pressed"
                        title="Reabrir ejercicio para volver a entrenarlo"
                      >
                        Repetir
                      </button>
                    </div>

                    {/* Series breakdown pills */}
                    {log?.series && log.series.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#c5cad1]/20">
                        {log.series.map((s) => (
                          <span
                            key={s.numero_serie}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-main)] font-semibold"
                          >
                            Serie {s.numero_serie}: <strong>{s.reps} reps</strong> × {s.peso_kg} kg (RPE {s.rpe}) {s.timestamp ? `• ${s.timestamp}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </NeuCard>
                );
              })}

              {/* Action buttons to open comprehensive log and usage sheet */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <NeuButton
                  className="flex-1 py-2 text-xs font-bold text-[#00C9A7] flex items-center justify-center gap-1.5 shadow-neu-flat"
                  onClick={() => setIsExerciseLogModalOpen(true)}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ver Registro Completo de Ejercicios</span>
                </NeuButton>
                <NeuButton
                  className="py-2 px-3 text-xs font-bold text-[var(--color-accent-blue)] flex items-center justify-center gap-1.5 shadow-neu-flat"
                  onClick={() => setIsUsageModalOpen(true)}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ficha de Uso Web</span>
                </NeuButton>
              </div>
            </>
          )}
        </div>
      )}
      </>
      )}

      {/* Modals for Web Usage and Performed Exercises */}
      <FichaEstadisticasUsoModal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
      />

      <RegistroEjerciciosRealizadosModal
        isOpen={isExerciseLogModalOpen}
        onClose={() => setIsExerciseLogModalOpen(false)}
      />
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
  const [subTab, setSubTab] = useState<"progreso" | "ficha">("progreso");
  const ficha = fichasProgreso.find((f) => f.id_cliente === currentUser?.id);

  let diasRestantes: number | null = null;
  if (ficha?.fecha_chequeo) {
    const target = new Date(ficha.fecha_chequeo).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    diasRestantes = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  if (subTab === "progreso") {
    return (
      <div className="flex flex-col gap-3">
        {/* Toggle sub-view pill */}
        <div className="flex bg-[#E0E5EC] p-1 rounded-2xl shadow-neu-pressed">
          <button
            onClick={() => setSubTab("progreso")}
            className="flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-[#E0E5EC] shadow-neu-flat text-[#4D7CFE]"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Tu Progreso</span>
          </button>
          <button
            onClick={() => setSubTab("ficha")}
            className="flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-[#718096] hover:text-[#2D3748]"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Control Físico & Medidas</span>
          </button>
        </div>

        <AthleteProgressView onOpenPhysicalFicha={() => setSubTab("ficha")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full pb-10">
      {/* Toggle sub-view pill */}
      <div className="flex bg-[#E0E5EC] p-1 rounded-2xl shadow-neu-pressed">
        <button
          onClick={() => setSubTab("progreso")}
          className="flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-[#718096] hover:text-[#2D3748]"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Tu Progreso</span>
        </button>
        <button
          onClick={() => setSubTab("ficha")}
          className="flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-[#E0E5EC] shadow-neu-flat text-[#4D7CFE]"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Control Físico & Medidas</span>
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#2D3748]">Control Físico & Medidas</h2>
        <span className="text-xs text-[#718096]">Evaluaciones antropométricas y control de chequeos</span>
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
