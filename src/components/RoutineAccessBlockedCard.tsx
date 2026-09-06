import React from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { Lock, ShieldAlert, PhoneCall, MessageCircle, Clock, Calendar } from "lucide-react";
import { RoutineAccessStatus } from "@/utils/routineAccess";

interface RoutineAccessBlockedCardProps {
  status: RoutineAccessStatus;
  onRefresh?: () => void;
  onRetry?: () => void;
}

export function RoutineAccessBlockedCard({
  status,
  onRefresh,
  onRetry,
}: RoutineAccessBlockedCardProps) {
  const handleRefresh = onRefresh || onRetry;
  const whatsappUrl = status.trainerWhatsapp
    ? `https://wa.me/51${status.trainerWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola ${status.trainerName}, te escribo desde la app GymBro para consultar sobre el acceso a mis rutinas de entrenamiento.`
      )}`
    : undefined;

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <NeuCard className="p-6 sm:p-8 max-w-md w-full flex flex-col items-center gap-4 bg-[var(--color-bg-base)]">
        {/* Animated Lock Icon */}
        <div className="w-16 h-16 rounded-3xl shadow-neu-pressed flex items-center justify-center text-amber-500 bg-[var(--color-bg-base)]">
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full mx-auto">
            {status.modo === "horario_manual"
              ? "Rutina Pausada"
              : status.modo === "solo_hoy"
              ? "Disponible Solo el Día Programado"
              : "Fuera de Horario"}
          </span>
        </div>

        {/* Required Message */}
        <div className="p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 text-xs text-[var(--color-text-main)] leading-relaxed flex flex-col gap-2">
          <p className="font-medium text-[var(--color-text-muted)]">
            {status.reasonMessage || "El acceso a las rutinas está restringido actualmente."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-2.5 pt-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[var(--color-accent-blue)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Contactar a {status.trainerName}</span>
            </a>
          )}

          {handleRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              className="py-2.5 px-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed text-xs font-semibold text-[var(--color-text-muted)] transition-all"
            >
              Comprobar acceso nuevamente
            </button>
          )}
        </div>
      </NeuCard>
    </div>
  );
}
