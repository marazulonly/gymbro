import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { SolicitudEntrenador } from "@/types";
import { Dumbbell, Check, X, ShieldCheck, UserCheck, Sparkles, Clock, MessageSquare } from "lucide-react";

interface AthleteInvitationModalProps {
  solicitudes: SolicitudEntrenador[];
  onAccept: (solicitudId: string) => Promise<void>;
  onReject: (solicitudId: string) => Promise<void>;
}

export function AthleteInvitationModal({
  solicitudes,
  onAccept,
  onReject,
}: AthleteInvitationModalProps) {
  const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);

  // Take the most recent pending invitation
  const currentSolicitud = solicitudes[0];

  if (!currentSolicitud) return null;

  const handleAccept = async () => {
    setLoadingAction("accept");
    try {
      await onAccept(currentSolicitud.id);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    try {
      await onReject(currentSolicitud.id);
    } finally {
      setLoadingAction(null);
    }
  };

  const formattedDate = new Date(currentSolicitud.fecha_solicitud).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          <NeuCard className="p-6 md:p-8 relative border border-[var(--color-accent-blue)]/30 shadow-2xl overflow-hidden">
            {/* Ambient accent background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-accent-blue)]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Badge header */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NUEVA SOLICITUD DE ENTRENAMIENTO</span>
              </div>
              {solicitudes.length > 1 && (
                <span className="text-xs text-[var(--color-text-muted)] font-bold">
                  1 de {solicitudes.length} solicitudes
                </span>
              )}
            </div>

            {/* Icon + Trainer Identity */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-blue)]/20 border border-[var(--color-accent-blue)]/30 flex items-center justify-center text-[var(--color-accent-blue)] shadow-neu-pressed shrink-0">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-main)] leading-tight">
                  {currentSolicitud.nombre_entrenador}
                </h2>
                <p className="text-xs text-[var(--color-accent-blue)] font-bold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Entrenador Certificado GymBro
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Enviada: {formattedDate}
                </p>
              </div>
            </div>

            {/* Message bubble from trainer */}
            <div className="p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 mb-5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                <span>Mensaje de la invitación:</span>
              </div>
              <p className="text-sm text-[var(--color-text-main)] italic font-medium leading-relaxed">
                "{currentSolicitud.mensaje || "Te invito a formar parte de mis atletas en GymBro para gestionar tu plan y tus rutinas personalizadas."}"
              </p>
            </div>

            {/* Explanatory benefit card */}
            <div className="p-3.5 rounded-2xl bg-[var(--color-accent-blue)]/5 border border-[var(--color-accent-blue)]/15 mb-6">
              <p className="text-xs text-[var(--color-text-main)] font-medium leading-relaxed">
                Al aceptar esta solicitud, <strong className="text-[var(--color-accent-blue)]">{currentSolicitud.nombre_entrenador}</strong> será asignado como tu entrenador personal y podrá diseñar tus sesiones, estructurar tus cargas de entrenamiento y supervisar tus avances.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <NeuButton
                type="button"
                className="h-12 text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-2"
                onClick={handleReject}
                disabled={loadingAction !== null}
              >
                <X className="w-4 h-4" />
                <span>{loadingAction === "reject" ? "Rechazando..." : "Rechazar Invitación"}</span>
              </NeuButton>

              <NeuButton
                type="button"
                className="h-12 text-xs font-bold text-[var(--color-accent-blue)] flex items-center justify-center gap-2 shadow-neu-flat"
                onClick={handleAccept}
                disabled={loadingAction !== null}
              >
                <Check className="w-4 h-4" />
                <span>{loadingAction === "accept" ? "Aceptando..." : "Aceptar Invitación"}</span>
              </NeuButton>
            </div>
          </NeuCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
