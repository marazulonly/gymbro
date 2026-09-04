import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Usuario, EjercicioRealizadoLog } from '../types';
import { NeuCard } from './ui/NeuCard';
import { NeuButton } from './ui/NeuButton';
import { NeuInput } from './ui/NeuInput';
import { 
  Dumbbell, 
  Check, 
  Clock, 
  Calendar, 
  Search, 
  User, 
  X, 
  Filter, 
  Flame, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistroEjerciciosRealizadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAthleteId?: string;
}

export function RegistroEjerciciosRealizadosModal({
  isOpen,
  onClose,
  initialAthleteId,
}: RegistroEjerciciosRealizadosModalProps) {
  const { currentUser, usuarios, ejerciciosRealizados, rutinas, reabrirEjercicioRealizado } = useStore();
  const isTrainer = currentUser?.rol === 'entrenador';

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    initialAthleteId || (isTrainer ? 'todos' : (currentUser?.id || ''))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | '7dias'>('todos');

  // Synchronize when initialAthleteId changes
  React.useEffect(() => {
    if (initialAthleteId) {
      setSelectedAthleteId(initialAthleteId);
    } else if (!isTrainer && currentUser) {
      setSelectedAthleteId(currentUser.id);
    }
  }, [initialAthleteId, isTrainer, currentUser]);

  const athletes = useMemo(() => {
    return usuarios.filter((u) => u.rol === 'cliente');
  }, [usuarios]);

  const filteredLogs = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

    return ejerciciosRealizados.filter((log) => {
      // Filter by athlete
      if (selectedAthleteId !== 'todos' && log.id_cliente !== selectedAthleteId) {
        return false;
      }
      // If athlete viewing, strictly keep only their logs
      if (!isTrainer && currentUser && log.id_cliente !== currentUser.id) {
        return false;
      }

      // Filter by date
      if (dateFilter === 'hoy' && log.fecha !== todayStr) {
        return false;
      }
      if (dateFilter === '7dias' && log.fecha < sevenDaysStr) {
        return false;
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = log.nombre_ejercicio?.toLowerCase().includes(term);
        const matchGroup = log.grupo_muscular?.toLowerCase().includes(term);
        if (!matchName && !matchGroup) return false;
      }

      return true;
    });
  }, [ejerciciosRealizados, selectedAthleteId, isTrainer, currentUser, dateFilter, searchTerm]);

  // Total metrics
  const metrics = useMemo(() => {
    const totalExercises = filteredLogs.length;
    const totalSeconds = filteredLogs.reduce((acc, l) => acc + (l.duracion_segundos || 0), 0);
    const totalSeries = filteredLogs.reduce((acc, l) => acc + (l.series?.length || 0), 0);
    return {
      totalExercises,
      totalSeconds,
      totalSeries,
    };
  }, [filteredLogs]);

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return '0s';
    if (sec < 60) return `${sec} seg`;
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSec = sec % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSec}s`;
    }
    return `${minutes}m ${remainingSec}s`;
  };

  const getAthleteName = (clientId: string) => {
    const athlete = usuarios.find((u) => u.id === clientId);
    return athlete ? athlete.nombre : 'Atleta';
  };

  const getRoutineName = (routineId: string) => {
    const r = rutinas.find((item) => item.id === routineId);
    return r ? r.nombre_sesion : 'Rutina';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--color-bg-base)] shadow-2xl overflow-hidden border border-[#c5cad1]/20"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#c5cad1]/20 bg-[var(--color-bg-base)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl shadow-neu-flat flex items-center justify-center text-[#00C9A7]">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-main)] leading-tight">
                  Registro de Ejercicios Realizados
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Historial de ejercicios completados con series, pesos y tiempos exactos
                </p>
              </div>
            </div>
            <NeuButton
              variant="circle"
              className="w-9 h-9 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </NeuButton>
          </div>

          {/* Filters Bar */}
          <div className="p-3 sm:p-4 bg-[var(--color-bg-base)] flex flex-col gap-2.5 border-b border-[#c5cad1]/15">
            {/* Athlete selector if trainer */}
            {isTrainer && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] whitespace-nowrap">
                  Atleta:
                </span>
                <button
                  onClick={() => setSelectedAthleteId('todos')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedAthleteId === 'todos'
                      ? 'bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/40'
                      : 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  Todos los atletas ({ejerciciosRealizados.length})
                </button>
                {athletes.map((a) => {
                  const isSelected = a.id === selectedAthleteId;
                  const count = ejerciciosRealizados.filter((l) => l.id_cliente === a.id).length;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAthleteId(a.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/40'
                          : 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{a.nombre}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ejercicio o grupo muscular..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-3.5 pl-9 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed text-xs text-[var(--color-text-main)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
                />
                <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-3" />
              </div>

              <div className="flex bg-[var(--color-bg-base)] p-1 rounded-xl shadow-neu-pressed">
                <button
                  onClick={() => setDateFilter('todos')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    dateFilter === 'todos'
                      ? 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  Todas las fechas
                </button>
                <button
                  onClick={() => setDateFilter('hoy')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    dateFilter === 'hoy'
                      ? 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setDateFilter('7dias')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    dateFilter === '7dias'
                      ? 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  7 días
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 px-4 sm:px-5 py-2.5 bg-[var(--color-bg-base)]">
            <div className="p-2.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Ejercicios Logrados
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#00C9A7]">
                {metrics.totalExercises}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Tiempo de Trabajo
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[var(--color-accent-blue)]">
                {formatSeconds(metrics.totalSeconds)}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Series Logradas
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[var(--color-text-main)]">
                {metrics.totalSeries}
              </span>
            </div>
          </div>

          {/* Logs List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3 scrollbar-thin">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-base)] rounded-3xl shadow-neu-pressed my-4">
                <Dumbbell className="w-12 h-12 text-[var(--color-text-muted)] opacity-50" />
                <h4 className="font-bold text-[var(--color-text-main)] text-sm">
                  No hay ejercicios registrados con los filtros seleccionados
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
                  Los ejercicios que marques como "LOGRADO!" en la rutina activa se guardarán y aparecerán aquí automáticamente para el atleta y el entrenador.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const athleteName = getAthleteName(log.id_cliente);
                const routineName = getRoutineName(log.id_rutina);
                const seriesCount = log.series?.length || 0;

                return (
                  <NeuCard
                    key={log.id}
                    className="p-3.5 sm:p-4 flex flex-col gap-2.5 border border-emerald-500/20"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl shadow-neu-pressed flex items-center justify-center text-[#00C9A7] shrink-0">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-[var(--color-text-main)] text-sm sm:text-base leading-tight">
                              {log.nombre_ejercicio}
                            </h3>
                            {log.grupo_muscular && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-muted)]">
                                {log.grupo_muscular}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5 flex-wrap">
                            {isTrainer && (
                              <span className="font-bold text-[var(--color-accent-blue)]">
                                Atleta: {athleteName}
                              </span>
                            )}
                            <span>• {routineName}</span>
                            <span>• {log.fecha}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reopen button */}
                      <button
                        onClick={() => reabrirEjercicioRealizado(log.id_ejercicio_rutina)}
                        className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] font-bold px-2 py-1 rounded-lg bg-[var(--color-bg-base)] shadow-neu-flat active:shadow-neu-pressed whitespace-nowrap flex items-center gap-1"
                        title="Reabrir ejercicio para volver a entrenarlo"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reabrir</span>
                      </button>
                    </div>

                    {/* Exercise execution times bar */}
                    <div className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-[var(--color-text-main)] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                        <span>
                          Duración: <strong className="text-[var(--color-accent-blue)] font-mono">{formatSeconds(log.duracion_segundos || 0)}</strong>
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                        {log.hora_inicio && log.hora_fin ? (
                          <span>
                            {log.hora_inicio} ➔ {log.hora_fin}
                          </span>
                        ) : log.completado_at ? (
                          <span>Completado a las {log.completado_at}</span>
                        ) : (
                          <span>Completado</span>
                        )}
                      </div>
                    </div>

                    {/* Series breakdown */}
                    {log.series && log.series.length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-1 border-t border-[#c5cad1]/20">
                        <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-wider">
                          Detalle de Series Logradas ({seriesCount} series):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {log.series.map((s) => (
                            <div
                              key={s.numero_serie}
                              className="p-2 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat flex flex-col text-[11px]"
                            >
                              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                                <span className="font-bold text-[var(--color-accent-blue)]">
                                  Serie {s.numero_serie}
                                </span>
                                {s.timestamp && (
                                  <span className="font-mono text-[9px]">
                                    {s.timestamp}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-[var(--color-text-main)] mt-0.5">
                                {s.reps} reps × {s.peso_kg} kg
                              </span>
                              <span className="text-[10px] text-[var(--color-text-muted)]">
                                RPE {s.rpe}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </NeuCard>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-[#c5cad1]/20 flex items-center justify-between bg-[var(--color-bg-base)]">
            <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Accesible en tiempo real por el Atleta y el Entrenador
            </span>
            <NeuButton
              className="px-4 py-1.5 text-xs font-bold text-[var(--color-accent-blue)]"
              onClick={onClose}
            >
              Cerrar Registro
            </NeuButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
