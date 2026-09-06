import React, { useState, useMemo } from "react";
import { useStore, getClientActiveRoutines, getDiaSemanaNombre, getDiaSemanaCorto } from "@/store";
import { NeuCard } from "./ui/NeuCard";
import { NeuButton } from "./ui/NeuButton";
import { 
  Check, 
  ChevronDown, 
  TrendingUp, 
  Dumbbell, 
  Calendar, 
  Activity, 
  ArrowLeft, 
  Sparkles, 
  Scale, 
  Award, 
  ChevronRight,
  Clock
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Usuario, Rutina, EjercicioRutina } from "@/types";
import { FichaEstadisticasUsoModal } from "./FichaEstadisticasUsoModal";
import { RegistroEjerciciosRealizadosModal } from "./RegistroEjerciciosRealizadosModal";


interface Props {
  athleteId?: string;
  isTrainerView?: boolean;
  onBack?: () => void;
  onOpenPhysicalFicha?: () => void;
}

// Chart data for different exercises
const FREQUENCY_DATA_MAP: Record<string, { name: string; value: number }[]> = {
  deadlift: [
    { name: "Mon", value: 20 },
    { name: "Tue", value: 100 },
    { name: "Mer", value: 50 },
    { name: "Em", value: 140 },
    { name: "Fri", value: 100 },
    { name: "Sat", value: 170 },
    { name: "Sun", value: 190 },
  ],
  squat: [
    { name: "Mon", value: 40 },
    { name: "Tue", value: 80 },
    { name: "Mer", value: 65 },
    { name: "Em", value: 120 },
    { name: "Fri", value: 140 },
    { name: "Sat", value: 160 },
    { name: "Sun", value: 180 },
  ],
  bench: [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 60 },
    { name: "Mer", value: 90 },
    { name: "Em", value: 75 },
    { name: "Fri", value: 110 },
    { name: "Sat", value: 130 },
    { name: "Sun", value: 155 },
  ],
  general: [
    { name: "Mon", value: 25 },
    { name: "Tue", value: 95 },
    { name: "Mer", value: 60 },
    { name: "Em", value: 135 },
    { name: "Fri", value: 115 },
    { name: "Sat", value: 175 },
    { name: "Sun", value: 195 },
  ],
};

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function AthleteProgressView({ 
  athleteId, 
  isTrainerView = false, 
  onBack,
  onOpenPhysicalFicha 
}: Props) {
  const { currentUser, usuarios, rutinas, ejerciciosRutina, ejercicios } = useStore();

  // Find target athlete
  const athlete: Usuario | undefined = useMemo(() => {
    if (athleteId) {
      return usuarios.find((u) => u.id === athleteId);
    }
    return currentUser || undefined;
  }, [athleteId, usuarios, currentUser]);

  // Active routines (recommended days, rest days filtered out)
  const activeRoutines = useMemo(() => {
    return getClientActiveRoutines(rutinas, athlete);
  }, [rutinas, athlete]);

  // Selected exercise for frequency chart
  const [selectedLift, setSelectedLift] = useState<string>("deadlift");
  const [isLiftSelectorOpen, setIsLiftSelectorOpen] = useState(false);

  // Modals for statistics sheet and exercise logs
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Month selector state
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[currentMonthIdx] || "Octubre");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Selected routine/day from the recommended days row
  // Default to today if today has a routine, otherwise first active routine
  const todayDay = new Date().getDay();
  const initialRoutineId = useMemo(() => {
    const todayRoutine = activeRoutines.find((r) => r.dia_semana === todayDay);
    return todayRoutine ? todayRoutine.id : (activeRoutines[0]?.id || "");
  }, [activeRoutines, todayDay]);

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(initialRoutineId);

  // Completion tracking state for items (exercise/routine id -> completed boolean or completed count)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    // initialize some with true like in the screenshot
    return {
      er_d1_1: true,
      er_d1_2: true,
      er_d2_1: true,
      er_d2_2: true,
      er_d2_3: true,
    };
  });

  const toggleItemCompletion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Selected routine object
  const currentRoutine = useMemo(() => {
    return activeRoutines.find((r) => r.id === selectedRoutineId) || activeRoutines[0];
  }, [activeRoutines, selectedRoutineId]);

  // Exercises for the selected routine
  const currentExercises = useMemo(() => {
    if (!currentRoutine) return [];
    return ejerciciosRutina.filter((er) => er.id_rutina === currentRoutine.id);
  }, [ejerciciosRutina, currentRoutine]);

  const chartData = FREQUENCY_DATA_MAP[selectedLift] || FREQUENCY_DATA_MAP.deadlift;

  return (
    <div className="flex flex-col gap-4 h-full pb-10">
      {/* Header */}
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          {isTrainerView && onBack && (
            <NeuButton
              variant="circle"
              className="w-10 h-10 shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              onClick={onBack}
              title="Volver a gestión de atletas"
            >
              <ArrowLeft className="w-5 h-5" />
            </NeuButton>
          )}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">Tu Progreso</h2>
            {isTrainerView && athlete && (
              <p className="text-xs text-[var(--color-accent-blue)] font-semibold mt-0.5">
                Atleta: {athlete.nombre}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <NeuButton
            className="text-xs font-bold text-[var(--color-accent-green)] px-2.5 py-1.5 flex items-center gap-1 shadow-neu-flat"
            onClick={() => setIsLogModalOpen(true)}
            title="Ver registro de ejercicios realizados"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Ejercicios</span>
            <span>Realizados</span>
          </NeuButton>

          <NeuButton
            className="text-xs font-bold text-[var(--color-accent-blue)] px-2.5 py-1.5 flex items-center gap-1 shadow-neu-flat"
            onClick={() => setIsUsageModalOpen(true)}
            title="Ver tiempos de uso"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tiempos de Uso</span>
          </NeuButton>

          {/* Optional quick access to physical evaluation sheet */}
          {onOpenPhysicalFicha && (
            <NeuButton
              className="text-xs font-bold text-[var(--color-text-muted)] px-2.5 py-1.5 flex items-center gap-1 shadow-neu-flat"
              onClick={onOpenPhysicalFicha}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Ficha Física</span>
            </NeuButton>
          )}
        </div>
      </div>

      {/* Card: Frecuencia (deadlift o lift) with smooth chart */}
      <NeuCard className="p-4 flex flex-col gap-2 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat">
        <div className="flex justify-between items-center relative">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-[var(--color-text-main)]">
              Frecuencia ({selectedLift === "deadlift" ? "deadlift o lift" : selectedLift})
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsLiftSelectorOpen(!isLiftSelectorOpen)}
              className="text-[11px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] px-2 py-0.5 rounded-lg bg-[var(--color-bg-base)] shadow-neu-flat flex items-center gap-1"
            >
              <span className="capitalize">{selectedLift}</span>
              <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>

            <AnimatePresence>
              {isLiftSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  className="absolute right-0 top-full mt-1.5 z-30 bg-[var(--color-bg-base)] shadow-neu-flat rounded-xl p-1 w-36 border border-white/40 flex flex-col gap-0.5"
                >
                  {[
                    { id: "deadlift", label: "Deadlift" },
                    { id: "squat", label: "Sentadilla (Squat)" },
                    { id: "bench", label: "Press Banca" },
                    { id: "general", label: "Volumen Total" },
                  ].map((lift) => (
                    <button
                      key={lift.id}
                      onClick={() => {
                        setSelectedLift(lift.id);
                        setIsLiftSelectorOpen(false);
                      }}
                      className={`text-left px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        selectedLift === lift.id
                          ? "bg-[var(--color-accent-blue)] text-white font-bold"
                          : "text-[var(--color-text-main)] hover:bg-black/5"
                      }`}
                    >
                      {lift.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chart */}
        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-blue)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-accent-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-text-muted)" strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis 
                ticks={[0, 50, 100, 150, 200]} 
                domain={[0, 200]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius: "14px",
                  border: "none",
                  backgroundColor: "var(--color-bg-base)",
                  boxShadow: "var(--neu-flat)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "var(--color-text-main)",
                }}
                formatter={(value: any) => [`${value} kg / reps`, "Volumen"]}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-accent-blue)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ r: 3.5, fill: "var(--color-accent-blue)", strokeWidth: 1, stroke: "var(--color-bg-base)" }}
                activeDot={{ r: 6, fill: "var(--color-accent-blue)", stroke: "var(--color-bg-base)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </NeuCard>

      {/* Mes: Selector row */}
      <div className="flex justify-between items-center px-1">
        <span className="font-bold text-base text-[var(--color-text-main)]">Mes:</span>

        <div className="relative">
          <button
            id="btn-select-month"
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat text-xs font-bold text-[var(--color-text-main)] hover:shadow-neu-pressed active:shadow-neu-pressed transition-all"
          >
            <span>{selectedMonth}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </button>

          <AnimatePresence>
            {isMonthPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 z-30 bg-[var(--color-bg-base)] shadow-neu-flat rounded-2xl p-2 w-40 max-h-56 overflow-y-auto border border-white/50 flex flex-col gap-1"
              >
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setIsMonthPickerOpen(false);
                    }}
                    className={`text-left px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                      selectedMonth === m
                        ? "bg-[var(--color-accent-blue)] text-white font-bold shadow-sm"
                        : "text-[var(--color-text-main)] hover:bg-black/5"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 
        CRITICAL USER REQUIREMENT:
        "Verifica que se vean todos los dias que tienen rutina recomendadas, en una misma fila ocupando todo el ancho de la pantalla movil"
        We display all active recommended routine days in a single horizontal row occupying the full width (w-full).
      */}
      <div className="w-full">
        {activeRoutines.length === 0 ? (
          <div className="w-full p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed text-center text-xs text-[var(--color-text-muted)]">
            No hay rutinas recomendadas programadas para este atleta.
          </div>
        ) : (
          <div 
            className="w-full grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${activeRoutines.length}, minmax(0, 1fr))`,
            }}
          >
            {activeRoutines.map((routine, idx) => {
              const isSelected = routine.id === currentRoutine?.id;
              // Two digit day number representation (like in screenshot: 01, 02, 03...)
              const formattedNumber = String(idx + 1).padStart(2, "0");
              const dayShort = getDiaSemanaCorto(routine.dia_semana);
              const isToday = routine.dia_semana === todayDay;

              return (
                <button
                  key={routine.id}
                  id={`progress-day-${routine.id}`}
                  onClick={() => setSelectedRoutineId(routine.id)}
                  title={`${getDiaSemanaNombre(routine.dia_semana)}: ${routine.nombre_sesion}`}
                  className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 select-none ${
                    isSelected
                      ? "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-2 ring-[var(--color-accent-blue)]/30"
                      : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-main)] hover:text-[var(--color-accent-blue)] active:shadow-neu-pressed"
                  }`}
                >
                  {/* Two digit day number as in screenshot */}
                  <span className={`text-xs font-bold leading-tight ${isSelected ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-main)]"}`}>
                    {formattedNumber}
                  </span>

                  {/* Day short name for clarity */}
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${
                    isSelected ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-muted)]"
                  }`}>
                    {dayShort}
                  </span>

                  {/* Blue dot indicator for active recommended routine day (exact pattern from screenshot) */}
                  <div className="mt-1 flex items-center justify-center h-2">
                    <span 
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isSelected 
                          ? "bg-[var(--color-accent-blue)] ring-2 ring-[var(--color-accent-blue)]/40" 
                          : "bg-[var(--color-accent-blue)]"
                      }`} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Routines & Exercises for the selected day */}
      <div className="flex flex-col gap-3">
        {currentRoutine ? (
          <>
            {/* Header info of current selected day */}
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-blue)]">
                  {getDiaSemanaNombre(currentRoutine.dia_semana)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">• {currentRoutine.nombre_sesion}</span>
              </div>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded-md shadow-neu-pressed">
                {currentExercises.length} ejercicios
              </span>
            </div>

            {/* List of routine cards with checkmark buttons */}
            {currentExercises.length === 0 ? (
              <NeuCard inset className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                Esta sesión aún no tiene ejercicios asignados por el entrenador.
              </NeuCard>
            ) : (
              currentExercises.map((er, index) => {
                const exercise = ejercicios.find((e) => e.id === er.id_ejercicio);
                const isCompleted = !!completedItems[er.id];
                const seriesTarget = er.series_objetivo || 4;
                // Calculate completion display matching screenshot e.g. "4 series 3 completar" or "4 series completadas"
                const completedSetsCount = isCompleted ? seriesTarget : Math.max(1, seriesTarget - 1);
                const subtitleText = isCompleted 
                  ? `${seriesTarget} series completadas`
                  : `${seriesTarget} series ${seriesTarget - completedSetsCount} por completar`;

                return (
                  <NeuCard
                    key={er.id}
                    className="p-3.5 flex items-center justify-between rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat transition-all hover:shadow-neu-pressed cursor-pointer"
                    onClick={(e) => toggleItemCompletion(er.id, e)}
                  >
                    <div className="flex flex-col pr-2">
                      <span className="font-bold text-[var(--color-text-main)] text-sm leading-tight">
                        {exercise?.nombre || `Rutina ${currentRoutine.nombre_sesion}`}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                        {subtitleText} • {er.reps_objetivo || "10-12"} reps
                      </span>
                    </div>

                    {/* Circular blue checkmark button matching screenshot */}
                    <button
                      type="button"
                      onClick={(e) => toggleItemCompletion(er.id, e)}
                      title={isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all transform active:scale-95 ${
                        isCompleted
                          ? "bg-[var(--color-accent-blue)] text-white shadow-md ring-2 ring-[var(--color-accent-blue)]/30"
                          : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)]"
                      }`}
                    >
                      <Check className={`w-4 h-4 stroke-[2.5] ${isCompleted ? "text-white" : "text-[var(--color-text-muted)]/50"}`} />
                    </button>
                  </NeuCard>
                );
              })
            )}
          </>
        ) : (
          <NeuCard inset className="p-6 text-center text-xs text-[var(--color-text-muted)]">
            Selecciona un día para ver las rutinas recomendadas.
          </NeuCard>
        )}
      </div>

      <FichaEstadisticasUsoModal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        initialUserId={athlete?.id}
      />

      <RegistroEjerciciosRealizadosModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        initialAthleteId={athlete?.id}
      />
    </div>
  );
}
