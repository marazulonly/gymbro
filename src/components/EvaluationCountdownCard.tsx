import { useState, useEffect } from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Timer, Calendar, FileText, Clock, AlertTriangle } from "lucide-react";

interface EvaluationCountdownCardProps {
  fechaChequeo?: string;
  fechaInicio?: string;
  uiStyle?: string;
}

export function EvaluationCountdownCard({
  fechaChequeo,
  fechaInicio,
  uiStyle,
}: EvaluationCountdownCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // refresh every minute
    return () => clearInterval(timer);
  }, []);

  if (!fechaChequeo) {
    return (
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center gap-2 ml-1">
          <Timer className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold text-[var(--color-text-main)] text-sm">
            Próxima Evaluación Física
          </h4>
        </div>
        <NeuCard className="p-4 sm:p-5 flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 shadow-neu-flat">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-neu-flat">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
              Ficha Inicial Pendiente
            </span>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
              Tu entrenador debe crear tu <strong>Ficha Inicial</strong> antes de iniciar el entrenamiento para registrar tus medidas de referencia y programar la fecha de tu próxima evaluación.
            </p>
          </div>
        </NeuCard>
      </div>
    );
  }

  // Parse target date (target day at 09:00 AM)
  const parts = fechaChequeo.split("-").map(Number);
  const targetDate = new Date(parts[0], parts[1] - 1, parts[2], 9, 0, 0);
  const diffMs = targetDate.getTime() - now.getTime();

  const isToday =
    now.getFullYear() === targetDate.getFullYear() &&
    now.getMonth() === targetDate.getMonth() &&
    now.getDate() === targetDate.getDate();

  const isPast = diffMs < 0 && !isToday;

  const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const formattedDate = targetDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-2.5 mt-1">
      <div className="flex justify-between items-center ml-1">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[var(--color-accent-blue)]" />
          <h4 className="font-bold text-[var(--color-text-main)] text-sm">
            Próxima Evaluación Física
          </h4>
        </div>
        {!isPast && !isToday && (
          <span className="text-[10px] font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-2.5 py-0.5 rounded-full shadow-neu-flat">
            Medición de Indicadores
          </span>
        )}
      </div>

      <NeuCard className="p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">
              Fecha Programada de Evaluación
            </span>
            <span className="text-xs sm:text-sm font-bold text-[var(--color-text-main)] capitalize">
              {formattedDate}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {isToday ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center">
            <span className="text-sm font-black block">¡Hoy es el día de tu Evaluación!</span>
            <p className="text-xs mt-1 text-emerald-600/90 dark:text-emerald-400">
              Tu entrenador medirá tus indicadores físicos comparándolos con tu Ficha Inicial.
            </p>
          </div>
        ) : isPast ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-center">
            <span className="text-xs font-bold block">Fecha de evaluación cumplida</span>
            <p className="text-[11px] mt-1 text-amber-700 dark:text-amber-400">
              Comunícate con tu entrenador para registrar tu nuevo chequeo físico y medir tus avances.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Días */}
            <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--color-accent-blue)] tracking-tight">
                {days}
              </span>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mt-0.5 uppercase">
                {days === 1 ? "Día" : "Días"}
              </span>
            </div>

            {/* Horas */}
            <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--color-text-main)] tracking-tight">
                {hours}
              </span>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mt-0.5 uppercase">
                {hours === 1 ? "Hora" : "Horas"}
              </span>
            </div>
          </div>
        )}

        {fechaInicio && (
          <div className="pt-2 border-t border-[var(--color-text-muted)]/20 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
            <span>Ficha Inicial de referencia:</span>
            <span className="font-semibold text-[var(--color-text-main)]">{fechaInicio}</span>
          </div>
        )}
      </NeuCard>
    </div>
  );
}
