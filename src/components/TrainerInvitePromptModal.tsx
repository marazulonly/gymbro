import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { Usuario } from "@/types";
import { UserPlus, UserCheck, Clock, Send, X, AlertCircle } from "lucide-react";

interface TrainerInvitePromptModalProps {
  isOpen: boolean;
  athlete: Usuario | null;
  onClose: () => void;
  onSend: (customMessage?: string) => Promise<void>;
  isSending: boolean;
  alreadyAssigned?: boolean;
  alreadyPending?: boolean;
  pendingDate?: string;
}

export function TrainerInvitePromptModal({
  isOpen,
  athlete,
  onClose,
  onSend,
  isSending,
  alreadyAssigned = false,
  alreadyPending = false,
  pendingDate,
}: TrainerInvitePromptModalProps) {
  const [message, setMessage] = useState("");

  if (!isOpen || !athlete) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <NeuCard className="p-6 relative border border-[var(--color-text-muted)]/15 shadow-2xl">
            <button
              onClick={onClose}
              disabled={isSending}
              className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-base)] transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-blue)]/15 flex items-center justify-center text-[var(--color-accent-blue)] shadow-neu-pressed shrink-0">
                {alreadyAssigned ? (
                  <UserCheck className="w-6 h-6" />
                ) : alreadyPending ? (
                  <Clock className="w-6 h-6 text-amber-500" />
                ) : (
                  <UserPlus className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--color-text-main)] leading-tight">
                  {alreadyAssigned
                    ? "Atleta Ya Asignado"
                    : alreadyPending
                    ? "Solicitud Pendiente"
                    : "Atleta Ya Registrado"}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] font-medium">
                  {alreadyAssigned
                    ? "Este atleta ya está en tu lista de entrenamiento"
                    : alreadyPending
                    ? "Ya existe una invitación en espera de respuesta"
                    : "DNI encontrado en la base de datos de GymBro"}
                </p>
              </div>
            </div>

            {/* Body */}
            {alreadyAssigned ? (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10">
                  <p className="text-sm text-[var(--color-text-main)] font-semibold mb-1">
                    {athlete.nombre}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    DNI: <span className="font-mono">{athlete.dni}</span>
                  </p>
                  <p className="text-xs text-[var(--color-accent-blue)] font-medium mt-2">
                    ✓ Ya formas parte del equipo de entrenamiento de este atleta. Puedes gestionarlo directamente desde tu lista de atletas.
                  </p>
                </div>
                <NeuButton className="w-full h-11 font-bold text-[var(--color-text-main)]" onClick={onClose}>
                  Cerrar
                </NeuButton>
              </div>
            ) : alreadyPending ? (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--color-text-main)] font-bold">
                        {athlete.nombre}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        DNI: <span className="font-mono">{athlete.dni}</span>
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                        Ya enviaste una solicitud de entrenamiento a este atleta{pendingDate ? ` el ${new Date(pendingDate).toLocaleDateString()}` : ""}. El atleta debe aceptarla o rechazarla desde su cuenta.
                      </p>
                    </div>
                  </div>
                </div>
                <NeuButton className="w-full h-11 font-bold text-[var(--color-text-main)]" onClick={onClose}>
                  Entendido
                </NeuButton>
              </div>
            ) : (
              <div className="space-y-4 mb-2">
                <div className="p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10">
                  <p className="text-sm font-bold text-[var(--color-text-main)]">
                    {athlete.nombre}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">
                    DNI: <span className="font-mono font-bold text-[var(--color-accent-blue)]">{athlete.dni}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    El DNI ingresado corresponde a un atleta que ya tiene cuenta en GymBro. ¿Deseas invitarlo para ser su entrenador y diseñar sus rutinas?
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] pl-1">
                    Mensaje personalizado para el atleta (opcional):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hola, te invito a entrenar conmigo en GymBro para gestionar tu plan y tus rutinas..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--color-bg-base)] p-3 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/25 resize-none placeholder:text-[var(--color-text-muted)]/50"
                  />
                  <p className="text-[11px] text-[var(--color-text-muted)] pl-1">
                    El atleta recibirá una notificación inmediata en su pantalla si está conectado, o al ingresar a la plataforma.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <NeuButton
                    type="button"
                    className="px-4 h-11 text-xs font-semibold text-[var(--color-text-muted)]"
                    onClick={onClose}
                    disabled={isSending}
                  >
                    Cancelar
                  </NeuButton>

                  <NeuButton
                    type="button"
                    className="px-5 h-11 font-bold text-xs text-[var(--color-accent-blue)] flex items-center gap-2"
                    onClick={() => onSend(message)}
                    disabled={isSending}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? "Enviando Solicitud..." : "Enviar Invitación de Entrenamiento"}</span>
                  </NeuButton>
                </div>
              </div>
            )}
          </NeuCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
