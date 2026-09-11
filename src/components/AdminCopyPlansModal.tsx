import React, { useState, useMemo } from "react";
import { Usuario, PlanSuscripcion } from "@/types";
import { NeuCard } from "@/components/ui/NeuCard";
import { Copy, X, Check, ArrowRight, Layers, AlertCircle, Sparkles } from "lucide-react";
import { formatPEN, isPlanOfTrainer } from "@/utils/subscriptionUtils";
import { motion, AnimatePresence } from "motion/react";

interface AdminCopyPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainers: Usuario[];
  planesSuscripcion: PlanSuscripcion[];
  onCopyPlans: (selectedPlans: PlanSuscripcion[], targetTrainerId: string) => Promise<void>;
}

export function AdminCopyPlansModal({
  isOpen,
  onClose,
  trainers,
  planesSuscripcion,
  onCopyPlans,
}: AdminCopyPlansModalProps) {
  // Entrenador origen y destino
  const [sourceTrainerId, setSourceTrainerId] = useState<string>(trainers[0]?.id || "");
  const [targetTrainerId, setTargetTrainerId] = useState<string>(
    trainers.find((t) => t.id !== trainers[0]?.id)?.id || ""
  );

  // Planes del entrenador origen
  const sourcePlans = useMemo(() => {
    return planesSuscripcion.filter((p) => isPlanOfTrainer(p, sourceTrainerId));
  }, [planesSuscripcion, sourceTrainerId]);

  // Selección de planes a copiar
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cuando cambia el entrenador origen, seleccionar todos sus planes por defecto
  React.useEffect(() => {
    if (sourcePlans.length > 0) {
      setSelectedPlanIds(sourcePlans.map((p) => p.id));
    } else {
      setSelectedPlanIds([]);
    }
  }, [sourceTrainerId, sourcePlans.length]);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedPlanIds.length === sourcePlans.length) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(sourcePlans.map((p) => p.id));
    }
  };

  const handleTogglePlan = (planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const handleExecuteCopy = async () => {
    if (!sourceTrainerId || !targetTrainerId || selectedPlanIds.length === 0) return;
    if (sourceTrainerId === targetTrainerId) {
      alert("El entrenador origen y destino no pueden ser el mismo.");
      return;
    }

    const plansToCopy = sourcePlans.filter((p) => selectedPlanIds.includes(p.id));
    if (plansToCopy.length === 0) return;

    setIsSubmitting(true);
    try {
      await onCopyPlans(plansToCopy, targetTrainerId);
      const targetTrainer = trainers.find((t) => t.id === targetTrainerId);
      setSuccessMessage(
        `¡Se copiaron ${plansToCopy.length} plan(es) exitosamente a ${
          targetTrainer?.nombre || "el entrenador seleccionado"
        }!`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error al copiar planes:", err);
      alert("Ocurrió un error al copiar los planes. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceTrainer = trainers.find((t) => t.id === sourceTrainerId);
  const targetTrainer = trainers.find((t) => t.id === targetTrainerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[var(--color-bg-base)] rounded-3xl p-4 sm:p-6 shadow-2xl border border-[var(--color-text-muted)]/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-text-muted)]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--color-text-main)]">
                Copiar Planes entre Entrenadores
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Acción exclusiva de Administrador
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full shadow-neu-flat hover:shadow-neu-pressed text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1">
          {successMessage ? (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {successMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Selectores de Origen y Destino */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Entrenador Origen */}
                <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">
                    Copiar Desde (Origen)
                  </label>
                  <select
                    value={sourceTrainerId}
                    onChange={(e) => setSourceTrainerId(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/20 text-xs font-bold text-[var(--color-text-main)] outline-none"
                  >
                    {trainers.map((t) => {
                      const count = planesSuscripcion.filter((p) => isPlanOfTrainer(p, t.id)).length;
                      return (
                        <option key={t.id} value={t.id}>
                          {t.nombre} ({count} planes)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Entrenador Destino */}
                <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">
                    Copiar Hacia (Destino)
                  </label>
                  <select
                    value={targetTrainerId}
                    onChange={(e) => setTargetTrainerId(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/20 text-xs font-bold text-[var(--color-text-main)] outline-none"
                  >
                    {trainers
                      .filter((t) => t.id !== sourceTrainerId)
                      .map((t) => {
                        const count = planesSuscripcion.filter((p) => isPlanOfTrainer(p, t.id)).length;
                        return (
                          <option key={t.id} value={t.id}>
                            {t.nombre} ({count} planes actuales)
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Lista de planes a seleccionar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                    Planes disponibles de {sourceTrainer?.nombre || "origen"} ({sourcePlans.length})
                  </span>
                  {sourcePlans.length > 0 && (
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-[11px] font-bold text-[var(--color-accent-blue)] hover:underline"
                    >
                      {selectedPlanIds.length === sourcePlans.length
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </button>
                  )}
                </div>

                {sourcePlans.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/15 text-center space-y-1">
                    <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-[var(--color-text-main)]">
                      Este entrenador aún no tiene planes registrados.
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Selecciona otro entrenador de origen que contenga planes configurados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {sourcePlans.map((plan) => {
                      const isSelected = selectedPlanIds.includes(plan.id);

                      return (
                        <div
                          key={plan.id}
                          onClick={() => handleTogglePlan(plan.id)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-[var(--color-accent-blue)]/10 border-[var(--color-accent-blue)]/40 shadow-sm"
                              : "bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed border-[var(--color-text-muted)]/10"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold border transition-colors shrink-0 ${
                                isSelected
                                  ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)]"
                                  : "border-[var(--color-text-muted)]/30 bg-[var(--color-bg-base)]"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[var(--color-text-main)] block truncate">
                                {plan.nombre}
                              </span>
                              <span className="text-[10px] text-[var(--color-text-muted)] block">
                                {plan.duracion_meses} {plan.duracion_meses === 1 ? "mes" : "meses"}
                                {plan.descripcion ? ` • ${plan.descripcion}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs font-black text-[var(--color-accent-blue)] shrink-0">
                            {formatPEN(plan.precio_pen)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resumen */}
              {selectedPlanIds.length > 0 && targetTrainer && (
                <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 text-[11px] text-[var(--color-text-muted)] flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-[var(--color-accent-blue)] shrink-0" />
                  <span>
                    Se crearán <strong>{selectedPlanIds.length}</strong> copias de planes para el catálogo exclusivo de{" "}
                    <strong>{targetTrainer.nombre}</strong>.
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!successMessage && (
          <div className="pt-3 border-t border-[var(--color-text-muted)]/15 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed text-xs font-bold text-[var(--color-text-muted)] transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting || selectedPlanIds.length === 0 || !targetTrainerId}
              onClick={handleExecuteCopy}
              className="px-5 py-2 rounded-xl bg-[var(--color-accent-blue)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Copiando..." : `Copiar ${selectedPlanIds.length} Plan(es)`}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
