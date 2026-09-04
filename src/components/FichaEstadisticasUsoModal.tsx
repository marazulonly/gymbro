import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Usuario, SesionUsoWeb } from '../types';
import { NeuCard } from './ui/NeuCard';
import { NeuButton } from './ui/NeuButton';
import { 
  Clock, 
  Calendar, 
  Monitor, 
  Smartphone, 
  X, 
  Activity, 
  User, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FichaEstadisticasUsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserId?: string;
}

export function FichaEstadisticasUsoModal({
  isOpen,
  onClose,
  initialUserId,
}: FichaEstadisticasUsoModalProps) {
  const { currentUser, usuarios, sesionesUso } = useStore();
  
  // If entrenador, allow switching user; otherwise lock to current user
  const isTrainer = currentUser?.rol === 'entrenador';
  const defaultSelectedId = initialUserId || currentUser?.id || (usuarios[0]?.id ?? '');
  const [selectedUserId, setSelectedUserId] = useState<string>(defaultSelectedId);

  // Sync when initialUserId changes
  React.useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    } else if (currentUser) {
      setSelectedUserId(currentUser.id);
    }
  }, [initialUserId, currentUser]);

  const targetUser = usuarios.find((u) => u.id === selectedUserId) || currentUser;

  // Filter sessions for selected user
  const userSessions = useMemo(() => {
    if (!targetUser) return [];
    return sesionesUso
      .filter((s) => s.id_usuario === targetUser.id)
      .sort((a, b) => (b.inicio_timestamp || 0) - (a.inicio_timestamp || 0));
  }, [sesionesUso, targetUser]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (userSessions.length === 0) {
      return {
        totalSeconds: 0,
        totalSessions: 0,
        avgSeconds: 0,
        lastSessionDate: 'Sin registros',
        lastSessionHour: '',
        isCurrentlyActive: false,
        dailyBreakdown: [] as { date: string; seconds: number; count: number }[],
      };
    }

    const totalSecs = userSessions.reduce((acc, s) => acc + (s.duracion_segundos || 0), 0);
    const totalCount = userSessions.length;
    const avgSecs = totalCount > 0 ? Math.round(totalSecs / totalCount) : 0;

    const latest = userSessions[0];
    const isNow = latest.inicio_timestamp && (Date.now() - latest.ultima_actividad_timestamp) < 60000;

    // Daily breakdown for past 7 days
    const daysMap: Record<string, { seconds: number; count: number }> = {};
    userSessions.forEach((s) => {
      const d = s.fecha || 'Hoy';
      if (!daysMap[d]) {
        daysMap[d] = { seconds: 0, count: 0 };
      }
      daysMap[d].seconds += s.duracion_segundos || 0;
      daysMap[d].count += 1;
    });

    const dailyList = Object.entries(daysMap)
      .map(([date, val]) => ({ date, seconds: val.seconds, count: val.count }))
      .slice(0, 7);

    return {
      totalSeconds: totalSecs,
      totalSessions: totalCount,
      avgSeconds: avgSecs,
      lastSessionDate: latest.fecha,
      lastSessionHour: `${latest.hora_inicio} - ${latest.hora_fin}`,
      isCurrentlyActive: isNow,
      dailyBreakdown: dailyList,
    };
  }, [userSessions]);

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSec = sec % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSec}s`;
    }
    return `${minutes}m ${remainingSec}s`;
  };

  const formatShortDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--color-bg-base)] shadow-2xl overflow-hidden border border-[#c5cad1]/20"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#c5cad1]/20 bg-[var(--color-bg-base)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl shadow-neu-flat flex items-center justify-center text-[var(--color-accent-blue)]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-main)] leading-tight">
                  Ficha de Estadísticas de Uso Web
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Registro de fechas, horas de conexión y tiempos de permanencia
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

          {/* User selector (trainer only) or user profile badge */}
          <div className="px-4 sm:px-5 pt-3 pb-2 bg-[var(--color-bg-base)]">
            {isTrainer ? (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Seleccionar Ficha de Atleta o Entrenador:
                </label>
                <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
                  {usuarios.map((u) => {
                    const isSelected = u.id === targetUser?.id;
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/50'
                            : 'bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{u.nombre}</span>
                        {isSelf && (
                          <span className="text-[9px] px-1 rounded bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)]">
                            Tú
                          </span>
                        )}
                        <span className="text-[9px] uppercase font-mono text-[var(--color-text-muted)]">
                          ({u.rol})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full shadow-neu-flat flex items-center justify-center text-[var(--color-accent-blue)] font-bold text-xs">
                    {targetUser?.nombre.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-main)] block leading-tight">
                      {targetUser?.nombre}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      DNI: {targetUser?.dni} • Rol: {targetUser?.rol}
                    </span>
                  </div>
                </div>
                {stats.isCurrentlyActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    En línea ahora
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-4 scrollbar-thin">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <NeuCard className="p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Tiempo Total Web
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-[var(--color-accent-blue)] mt-0.5">
                  {formatShortDuration(stats.totalSeconds)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {stats.totalSeconds} segundos
                </span>
              </NeuCard>

              <NeuCard className="p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Sesiones Totales
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-[var(--color-text-main)] mt-0.5">
                  {stats.totalSessions}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  conexiones registradas
                </span>
              </NeuCard>

              <NeuCard className="p-3 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Promedio por Sesión
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatShortDuration(stats.avgSeconds)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  duración media
                </span>
              </NeuCard>
            </div>

            {/* Daily Usage Visual Breakdown */}
            {stats.dailyBreakdown.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                    Uso por Día (Últimas Fechas Registradas)
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {stats.dailyBreakdown.length} días activos
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed flex flex-col gap-2">
                  {stats.dailyBreakdown.map((day) => {
                    const maxSecs = Math.max(...stats.dailyBreakdown.map((d) => d.seconds), 1);
                    const percent = Math.min(100, Math.round((day.seconds / maxSecs) * 100));

                    return (
                      <div key={day.date} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-[var(--color-accent-blue)]" />
                            {day.date}
                          </span>
                          <span className="font-semibold text-[var(--color-text-muted)]">
                            {formatShortDuration(day.seconds)} ({day.count} {day.count === 1 ? 'sesión' : 'sesiones'})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--color-bg-base)] shadow-neu-pressed overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent-blue)] transition-all duration-500"
                            style={{ width: `${Math.max(8, percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sessions History List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                  Historial Detallado de Fechas y Tiempos de Uso
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {userSessions.length} registros guardados
                </span>
              </div>

              {userSessions.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-base)] rounded-2xl shadow-neu-pressed">
                  No hay sesiones de uso web registradas todavía para este usuario.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {userSessions.map((session, index) => {
                    const isMobile = session.dispositivo === 'Móvil';
                    const isLatest = index === 0;

                    return (
                      <div
                        key={session.id}
                        className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat flex items-center justify-between border border-[#c5cad1]/15"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-text-muted)]">
                            {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[var(--color-text-main)]">
                                {session.fecha}
                              </span>
                              {isLatest && stats.isCurrentlyActive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                                  Activa
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[var(--color-text-muted)] font-mono mt-0.5">
                              {session.hora_inicio} ➔ {session.hora_fin}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-xs font-extrabold text-[var(--color-accent-blue)] font-mono">
                            {formatSeconds(session.duracion_segundos)}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {session.dispositivo}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-[#c5cad1]/20 flex items-center justify-between bg-[var(--color-bg-base)]">
            <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Sincronizado en tiempo real con Firestore
            </span>
            <NeuButton
              className="px-4 py-1.5 text-xs font-bold text-[var(--color-accent-blue)]"
              onClick={onClose}
            >
              Cerrar Ficha
            </NeuButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
