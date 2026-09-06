import { motion, AnimatePresence } from "motion/react";
import { FileText, AlertCircle, X } from "lucide-react";
import { NeuButton } from "@/components/ui/NeuButton";

interface MissingFichaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MissingFichaModal({ isOpen, onClose }: MissingFichaModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-sm rounded-3xl bg-[var(--color-bg-base)] p-5 shadow-2xl border border-amber-500/30 text-center flex flex-col items-center gap-3 relative"
          >
            <NeuButton
              variant="circle"
              className="absolute top-3 right-3 w-8 h-8 text-[var(--color-text-muted)]"
              onClick={onClose}
            >
              <X className="w-3.5 h-3.5" />
            </NeuButton>

            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-neu-flat mt-1">
              <FileText className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1.5 px-1">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                Ficha Inicial Requerida
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Antes de iniciar el entrenamiento de los atletas, el entrenador debe crear una <strong>Ficha Inicial</strong> (con los mismos datos de la Ficha de Progreso) para usarlos como referencia cuando se evalúe al atleta en la fecha correspondiente para medir sus indicadores.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 text-left flex items-start gap-2 w-full">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Comunícate con tu entrenador para que registre tu Ficha Inicial y se habilite el inicio de tus entrenamientos.
              </span>
            </div>

            <div className="w-full pt-1">
              <NeuButton
                className="w-full h-11 font-bold text-xs text-[var(--color-accent-blue)] flex items-center justify-center shadow-neu-flat"
                onClick={onClose}
              >
                Entendido
              </NeuButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
