import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { AlertTriangle, Clock, Save, ShieldAlert, PlusCircle } from "lucide-react";

interface WorkoutTimeExpiredModalProps {
  isOpen: boolean;
  trainerName: string;
  onExtendFiveMinutes?: () => void;
  onSaveAndClose?: () => void;
  onExtend?: () => void;
  onSaveAndExit?: () => void;
}

export function WorkoutTimeExpiredModal({
  isOpen,
  trainerName,
  onExtendFiveMinutes,
  onSaveAndClose,
  onExtend,
  onSaveAndExit,
}: WorkoutTimeExpiredModalProps) {
  if (!isOpen) return null;

  const handleExtend = onExtend || onExtendFiveMinutes || (() => {});
  const handleSaveAndClose = onSaveAndExit || onSaveAndClose || (() => {});

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <NeuCard className="w-full max-w-md p-6 flex flex-col items-center text-center gap-4 bg-[var(--color-bg-base)] animate-fadeIn">
        {/* Pulsating Alert Icon */}
        <div className="w-16 h-16 rounded-3xl shadow-neu-pressed flex items-center justify-center text-amber-500 bg-[var(--color-bg-base)]">
          <AlertTriangle className="w-8 h-8 stroke-[2.2] animate-bounce" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full mx-auto">
            Tiempo de entrenamiento expirado
          </span>
          <h3 className="text-xl font-black text-[var(--color-text-main)] mt-1">
            Horario de acceso finalizado
          </h3>
        </div>

        {/* Informative text */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 text-xs text-[var(--color-text-muted)] leading-relaxed">
          <p>
            Tu tiempo permitido para entrenar ha concluido según las reglas de acceso configuradas por{" "}
            <strong className="text-[var(--color-text-main)]">{trainerName}</strong>.
          </p>
          <p className="mt-2 font-medium text-[var(--color-text-main)]">
            Puedes aumentar <strong className="text-[var(--color-accent-blue)]">hasta 5 minutos</strong> de gracia para culminar tu serie actual, o cerrar y guardar inmediatamente todos tus ejercicios realizados.
          </p>
          <p className="mt-2 text-[11px] text-[var(--color-text-muted)] italic">
            * Tu sesión no se cerrará; tus progresos quedarán asegurados.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
          <NeuButton
            type="button"
            onClick={handleExtend}
            className="flex-1 h-12 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Aumentar 5 minutos</span>
          </NeuButton>

          <NeuButton
            type="button"
            onClick={handleSaveAndClose}
            className="flex-1 h-12 text-xs font-bold text-[var(--color-accent-blue)] flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar y Cerrar</span>
          </NeuButton>
        </div>
      </NeuCard>
    </div>
  );
}
