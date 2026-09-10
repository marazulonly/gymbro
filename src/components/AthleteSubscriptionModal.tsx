import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CreditCard,
  Calendar,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Ban,
  Clock,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  Receipt,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Usuario, PlanSuscripcion, PagoSuscripcion, SuscripcionAtleta } from "@/types";
import { useStore } from "@/store";
import {
  calcularSemaforoPago,
  calculateSubscriptionEndDate,
  formatPEN,
  DEFAULT_PLANES_SUSCRIPCION,
} from "@/utils/subscriptionUtils";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";

interface AthleteSubscriptionModalProps {
  athlete: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AthleteSubscriptionModal({
  athlete,
  isOpen,
  onClose,
}: AthleteSubscriptionModalProps) {
  const {
    planesSuscripcion,
    updateUsuarioSuscripcion,
    registrarPagoSuscripcion,
    eliminarPagoSuscripcion,
    updatePlanSuscripcion,
    addPlanSuscripcion,
    deletePlanSuscripcion,
    resetPlanesSuscripcionDefaults,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"suscripcion" | "planes" | "semaforo">("suscripcion");

  // Form states for Athlete Subscription
  const existingSub = athlete?.suscripcion;
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(existingSub?.id_plan || "plan_1m");
  const [nombrePlan, setNombrePlan] = useState<string>(existingSub?.nombre_plan || "Plan 1 mes");
  const [duracionMeses, setDuracionMeses] = useState<number>(existingSub?.duracion_meses || 1);
  const [precioPen, setPrecioPen] = useState<number>(existingSub?.precio_pen ?? 300);
  const [fechaInicio, setFechaInicio] = useState<string>(existingSub?.fecha_inicio || todayStr);
  const [fechaFin, setFechaFin] = useState<string>(
    existingSub?.fecha_fin || calculateSubscriptionEndDate(todayStr, 1)
  );
  const [notasSub, setNotasSub] = useState<string>(existingSub?.notas || "");
  const [isSavingSub, setIsSavingSub] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Form states for New Payment Registration
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentFecha, setPaymentFecha] = useState<string>(todayStr);
  const [paymentMonto, setPaymentMonto] = useState<number>(precioPen || 300);
  const [paymentMetodo, setPaymentMetodo] = useState<string>("Yape/Plin");
  const [paymentEstado, setPaymentEstado] = useState<"completado" | "pendiente" | "anulado">("completado");
  const [paymentReferencia, setPaymentReferencia] = useState<string>("");
  const [paymentNotas, setPaymentNotas] = useState<string>("");
  const [paymentSuggestedPlanId, setPaymentSuggestedPlanId] = useState<string | null>(null);
  const [paymentSuggestedPlanName, setPaymentSuggestedPlanName] = useState<string>("");
  const [paymentProjectedEnd, setPaymentProjectedEnd] = useState<string>(
    calculateSubscriptionEndDate(existingSub?.fecha_fin || todayStr, 1)
  );
  const [paymentAutoUpdateEnd, setPaymentAutoUpdateEnd] = useState<boolean>(true);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // States for Plan Catalog editing
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanNombre, setEditPlanNombre] = useState<string>("");
  const [editPlanMeses, setEditPlanMeses] = useState<number>(1);
  const [editPlanPrecio, setEditPlanPrecio] = useState<number>(300);
  const [editPlanDesc, setEditPlanDesc] = useState<string>("");
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);

  // Sync state when athlete changes or modal opens
  useEffect(() => {
    if (!athlete) return;
    if (athlete.suscripcion) {
      setSelectedPlanId(athlete.suscripcion.id_plan || "");
      setNombrePlan(athlete.suscripcion.nombre_plan || "Plan 1 mes");
      setDuracionMeses(athlete.suscripcion.duracion_meses || 1);
      setPrecioPen(athlete.suscripcion.precio_pen ?? 300);
      setFechaInicio(athlete.suscripcion.fecha_inicio || todayStr);
      setFechaFin(athlete.suscripcion.fecha_fin || calculateSubscriptionEndDate(todayStr, 1));
      setNotasSub(athlete.suscripcion.notas || "");
    } else {
      setSelectedPlanId("plan_1m");
      setNombrePlan("Plan 1 mes");
      setDuracionMeses(1);
      setPrecioPen(300);
      setFechaInicio(todayStr);
      setFechaFin(calculateSubscriptionEndDate(todayStr, 1));
      setNotasSub("");
    }
  }, [athlete, todayStr, isOpen]);

  // Live calculation of Semaphore based on the current fechaFin in the form
  const semaforoInfo = useMemo(() => {
    return calcularSemaforoPago(fechaFin);
  }, [fechaFin]);

  // Handle plan pick from list
  const handleSelectPlan = (plan: PlanSuscripcion) => {
    setSelectedPlanId(plan.id);
    setNombrePlan(plan.nombre);
    setDuracionMeses(plan.duracion_meses);
    setPrecioPen(plan.precio_pen);
    setPaymentMonto(plan.precio_pen);

    const calculatedEnd = calculateSubscriptionEndDate(fechaInicio || todayStr, plan.duracion_meses);
    if (calculatedEnd) {
      setFechaFin(calculatedEnd);
    }
  };

  // Handle start date change and recalculate end date
  const handleStartDateChange = (newStartDate: string) => {
    setFechaInicio(newStartDate);
    if (duracionMeses > 0) {
      const calculated = calculateSubscriptionEndDate(newStartDate, duracionMeses);
      if (calculated) {
        setFechaFin(calculated);
      }
    }
  };

  // Save athlete subscription changes
  const handleSaveSubscription = async () => {
    if (!athlete) return;
    setIsSavingSub(true);
    setSaveSuccessMessage(null);
    try {
      const subData: SuscripcionAtleta = {
        id_plan: selectedPlanId,
        nombre_plan: nombrePlan,
        duracion_meses: duracionMeses,
        precio_pen: Number(precioPen),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        notas: notasSub,
        historial_pagos: athlete.suscripcion?.historial_pagos || [],
      };
      await updateUsuarioSuscripcion(athlete.id, subData);
      setSaveSuccessMessage("Suscripción y fechas actualizadas correctamente.");
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving subscription:", err);
    } finally {
      setIsSavingSub(false);
    }
  };

  // Add new payment
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete || !paymentMonto || paymentMonto <= 0) return;

    setIsSavingPayment(true);
    try {
      const newPayment: PagoSuscripcion = {
        id: `pay_${Date.now()}`,
        fecha_pago: paymentFecha,
        monto_pen: Number(paymentMonto),
        metodo_pago: paymentMetodo,
        estado: paymentEstado,
        referencia: paymentReferencia.trim(),
        notas: paymentNotas.trim(),
        registrado_at: new Date().toISOString(),
      };
      await registrarPagoSuscripcion(athlete.id, newPayment);

      // Auto update athlete subscription end date if requested and completed
      if (paymentEstado === "completado" && paymentAutoUpdateEnd && paymentProjectedEnd) {
        await updateUsuarioSuscripcion(athlete.id, {
          ...(athlete.suscripcion || {
            id_plan: paymentSuggestedPlanId || selectedPlanId,
            nombre_plan: paymentSuggestedPlanName || nombrePlan,
            duracion_meses: duracionMeses,
            precio_pen: Number(paymentMonto),
            fecha_inicio: fechaInicio,
            fecha_fin: paymentProjectedEnd,
            historial_pagos: [],
          }),
          fecha_fin: paymentProjectedEnd,
          nombre_plan: paymentSuggestedPlanName || athlete.suscripcion?.nombre_plan || nombrePlan,
        });
        setFechaFin(paymentProjectedEnd);
      }

      setShowAddPayment(false);
      setPaymentReferencia("");
      setPaymentNotas("");
    } catch (err) {
      console.error("Error adding payment:", err);
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!athlete) return;
    if (!confirm("¿Deseas eliminar este registro de pago?")) return;
    await eliminarPagoSuscripcion(athlete.id, paymentId);
  };

  // Plan catalog editing handlers
  const startEditPlan = (plan: PlanSuscripcion) => {
    setEditingPlanId(plan.id);
    setEditPlanNombre(plan.nombre);
    setEditPlanMeses(plan.duracion_meses);
    setEditPlanPrecio(plan.precio_pen);
    setEditPlanDesc(plan.descripcion || "");
    setIsCreatingNewPlan(false);
  };

  const handleSaveEditedPlan = async () => {
    if (!editingPlanId) return;
    await updatePlanSuscripcion({
      id: editingPlanId,
      nombre: editPlanNombre.trim() || "Plan",
      duracion_meses: Number(editPlanMeses) || 1,
      precio_pen: Number(editPlanPrecio) || 0,
      descripcion: editPlanDesc.trim(),
      activo: true,
    });
    setEditingPlanId(null);
  };

  const handleCreateNewPlan = async () => {
    const newId = `plan_${Date.now()}`;
    await addPlanSuscripcion({
      id: newId,
      nombre: editPlanNombre.trim() || "Nuevo Plan",
      duracion_meses: Number(editPlanMeses) || 1,
      precio_pen: Number(editPlanPrecio) || 100,
      descripcion: editPlanDesc.trim(),
      activo: true,
    });
    setIsCreatingNewPlan(false);
    setEditingPlanId(null);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("¿Deseas eliminar este plan del catálogo?")) return;
    await deletePlanSuscripcion(planId);
  };

  const handleResetDefaultPlans = async () => {
    if (!confirm("¿Restablecer los 5 planes predeterminados (1 mes, 3 meses, 6 meses, Anual, Minero)?")) return;
    await resetPlanesSuscripcionDefaults();
  };

  if (!isOpen || !athlete) return null;

  const pagosHistorial = athlete.suscripcion?.historial_pagos || [];
  const totalPagado = pagosHistorial
    .filter((p) => p.estado === "completado")
    .reduce((sum, p) => sum + (p.monto_pen || 0), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-[var(--color-bg-base)] text-[var(--color-text-main)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--color-text-muted)]/20 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--color-text-muted)]/20 flex items-center justify-between bg-[var(--color-bg-base)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] shrink-0">
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <span>Control de Membresía</span>
                  <span className="text-xs font-normal text-[var(--color-text-muted)]">• {athlete.nombre}</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>DNI: {athlete.dni}</span>
                  <span>•</span>
                  <span>Plan actual: <strong className="text-[var(--color-text-main)]">{nombrePlan}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] active:scale-95 transition-all"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-5 pt-3 border-b border-[var(--color-text-muted)]/15 bg-[var(--color-bg-base)]/50 shrink-0 flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("suscripcion")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "suscripcion"
                  ? "border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Suscripción y Pagos del Atleta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("planes")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "planes"
                  ? "border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Catálogo de Planes ({planesSuscripcion.length})</span>
            </button>

            {/* Semáforo de Pagos dentro de un botón al lado de Catálogo de Planes */}
            <button
              type="button"
              onClick={() => setActiveTab("semaforo")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "semaforo"
                  ? "border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
              title="Semáforo de Pagos"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${semaforoInfo.dotColor} shrink-0`} />
              <span>Semáforo de Pagos</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
            {activeTab === "suscripcion" ? (
              <>
                {/* Resumen del Plan y Estatus del Atleta */}
                <div className="bg-[var(--color-bg-base)] rounded-2xl p-3.5 shadow-neu-pressed border border-[var(--color-text-muted)]/15 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[var(--color-text-main)]">{nombrePlan}</span>
                        <span className="text-xs font-bold text-[var(--color-accent-blue)]">{formatPEN(precioPen)}</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        Fecha final registrada: <strong className="text-[var(--color-text-main)]">{fechaFin}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("semaforo")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-transform active:scale-95 ${semaforoInfo.badgeBg} ${semaforoInfo.badgeText} ${semaforoInfo.badgeBorder}`}
                    title="Ver detalle del Semáforo de Pagos"
                  >
                    <span className={`w-2 h-2 rounded-full ${semaforoInfo.dotColor}`} />
                    <span>{semaforoInfo.label}</span>
                    <span className="text-[10px] opacity-80 underline ml-1">Semáforo</span>
                  </button>
                </div>

                {/* Formulario de Configuración de Suscripción */}
                <div className="space-y-4">
                  {/* Period and Price Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                        Nombre del Plan
                      </label>
                      <input
                        type="text"
                        value={nombrePlan}
                        onChange={(e) => setNombrePlan(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                        placeholder="Ej: Plan 3 meses"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                        Precio en Soles (PEN)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-[var(--color-text-muted)]">
                          S/
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={precioPen}
                          onChange={(e) => setPrecioPen(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-[var(--color-text-muted)]">
                          Fecha de Inicio
                        </label>
                        <button
                          type="button"
                          onClick={() => handleStartDateChange(todayStr)}
                          className="text-[10px] text-[var(--color-accent-blue)] hover:underline font-semibold"
                        >
                          Hoy
                        </button>
                      </div>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-[var(--color-text-muted)]">
                          Fecha Final (Límite de Pago)
                        </label>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {semaforoInfo.label}
                        </span>
                      </div>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      Notas de la Membresía / Observaciones
                    </label>
                    <textarea
                      rows={2}
                      value={notasSub}
                      onChange={(e) => setNotasSub(e.target.value)}
                      placeholder="Ej: Descuento aplicado por pronto pago, modalidad presencial..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none resize-none"
                    />
                  </div>

                  {saveSuccessMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{saveSuccessMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <NeuButton
                      onClick={handleSaveSubscription}
                      disabled={isSavingSub}
                      className="px-4 py-2 text-xs font-bold text-[var(--color-accent-blue)] shadow-neu-flat flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingSub ? "Guardando..." : "Guardar Cambios de Suscripción"}</span>
                    </NeuButton>
                  </div>
                </div>

                {/* 3. Historial de Pagos y Registrar Nuevo Pago */}
                <div className="pt-3 border-t border-[var(--color-text-muted)]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Historial y Estatus de Pagos</span>
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        Total abonado completado: <strong className="text-[var(--color-text-main)]">{formatPEN(totalPagado)}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddPayment(!showAddPayment)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-accent-blue)] text-white flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddPayment ? "Ocultar Formulario" : "Registrar Pago"}</span>
                    </button>
                  </div>

                  {/* Formulario colapsable para añadir pago */}
                  {showAddPayment && (
                    <form
                      onSubmit={handleAddPayment}
                      className="bg-[var(--color-bg-base)] p-4 rounded-2xl shadow-neu-pressed border border-[var(--color-accent-blue)]/30 space-y-3.5"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-[var(--color-text-muted)]/15">
                        <span className="text-xs font-bold text-[var(--color-text-main)]">
                          Nuevo Registro de Pago
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Comprobante para {athlete.nombre}
                        </span>
                      </div>

                      {/* Botones que sugieren los planes actuales */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                            Sugerir monto y duración por Plan:
                          </label>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            (Selecciona para auto-completar)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {planesSuscripcion.map((p) => {
                            const isSelected = paymentSuggestedPlanId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setPaymentSuggestedPlanId(p.id);
                                  setPaymentSuggestedPlanName(p.nombre);
                                  setPaymentMonto(p.precio_pen);
                                  const base =
                                    athlete.suscripcion?.fecha_fin &&
                                    athlete.suscripcion.fecha_fin >= paymentFecha
                                      ? athlete.suscripcion.fecha_fin
                                      : paymentFecha;
                                  setPaymentProjectedEnd(
                                    calculateSubscriptionEndDate(base, p.duracion_meses)
                                  );
                                  setPaymentNotas(`Pago ${p.nombre}`);
                                }}
                                className={`px-2.5 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                                  isSelected
                                    ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)] shadow-sm"
                                    : "bg-[var(--color-bg-base)] text-[var(--color-text-main)] border-[var(--color-text-muted)]/20 hover:border-[var(--color-accent-blue)]/50"
                                }`}
                              >
                                <span>{p.nombre}</span>
                                <span className="ml-1 opacity-80">({formatPEN(p.precio_pen)})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                            Fecha de Pago
                          </label>
                          <input
                            type="date"
                            required
                            value={paymentFecha}
                            onChange={(e) => {
                              const newDate = e.target.value;
                              setPaymentFecha(newDate);
                              if (paymentSuggestedPlanId) {
                                const foundPlan = planesSuscripcion.find(
                                  (p) => p.id === paymentSuggestedPlanId
                                );
                                if (foundPlan) {
                                  const base =
                                    athlete.suscripcion?.fecha_fin &&
                                    athlete.suscripcion.fecha_fin >= newDate
                                      ? athlete.suscripcion.fecha_fin
                                      : newDate;
                                  setPaymentProjectedEnd(
                                    calculateSubscriptionEndDate(base, foundPlan.duracion_meses)
                                  );
                                }
                              }
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-[var(--color-text-muted)]">
                              Monto Pagado (PEN)
                            </label>
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              (editable manual)
                            </span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1.5 text-xs font-bold text-[var(--color-text-muted)]">
                              S/
                            </span>
                            <input
                              type="number"
                              required
                              min="1"
                              step="5"
                              value={paymentMonto}
                              onChange={(e) => setPaymentMonto(Number(e.target.value))}
                              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                            Método de Pago
                          </label>
                          <select
                            value={paymentMetodo}
                            onChange={(e) => setPaymentMetodo(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                          >
                            <option value="Yape/Plin">Yape / Plin</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia BCP/BBVA/Interbank">Transferencia Bancaria</option>
                            <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                            <option value="Otro">Otro medio</option>
                          </select>
                        </div>
                      </div>

                      {/* Fecha hasta la que se estaría pagando (Fecha Final) */}
                      <div className="p-3 rounded-xl bg-[var(--color-accent-blue)]/5 border border-[var(--color-accent-blue)]/20 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[var(--color-text-main)] block">
                              Fecha hasta la que se estaría pagando (Fecha Final):
                            </span>
                            <span className="text-[11px] text-[var(--color-text-muted)]">
                              Calculada según vigencia de la suscripción o fecha de este pago
                            </span>
                          </div>
                          <input
                            type="date"
                            value={paymentProjectedEnd}
                            onChange={(e) => setPaymentProjectedEnd(e.target.value)}
                            className="px-3 py-1 text-xs font-black rounded-lg bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-accent-blue)]/40 focus:outline-none"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-[var(--color-text-main)] cursor-pointer select-none pt-1">
                          <input
                            type="checkbox"
                            checked={paymentAutoUpdateEnd}
                            onChange={(e) => setPaymentAutoUpdateEnd(e.target.checked)}
                            className="w-4 h-4 rounded text-[var(--color-accent-blue)]"
                          />
                          <span>Actualizar la Fecha Final del atleta a esta fecha al registrar el pago</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                            Estado del Pago
                          </label>
                          <select
                            value={paymentEstado}
                            onChange={(e) => setPaymentEstado(e.target.value as any)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                          >
                            <option value="completado">Completado (Pago recibido)</option>
                            <option value="pendiente">Pendiente de confirmación</option>
                            <option value="anulado">Anulado</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                            N° Operación / Referencia
                          </label>
                          <input
                            type="text"
                            value={paymentReferencia}
                            onChange={(e) => setPaymentReferencia(e.target.value)}
                            placeholder="Ej: OPE-491029 / BCP"
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                          Notas del Pago
                        </label>
                        <input
                          type="text"
                          value={paymentNotas}
                          onChange={(e) => setPaymentNotas(e.target.value)}
                          placeholder="Ej: Pago adelantado del mes"
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddPayment(false)}
                          className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] font-semibold hover:underline"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingPayment}
                          className="px-4 py-1.5 text-xs font-bold bg-[var(--color-accent-blue)] text-white rounded-xl shadow-sm active:scale-95 transition-all"
                        >
                          {isSavingPayment ? "Guardando..." : "Registrar Pago"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Lista de Pagos Registrados */}
                  {pagosHistorial.length === 0 ? (
                    <div className="py-6 px-4 text-center rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/15">
                      <Receipt className="w-8 h-8 mx-auto mb-1.5 text-[var(--color-text-muted)] opacity-60" />
                      <p className="text-xs font-bold text-[var(--color-text-main)]">Sin pagos registrados</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        Registra el primer abono de este atleta usando el botón superior.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pagosHistorial.map((pago) => {
                        const isCompletado = pago.estado === "completado";
                        const isPendiente = pago.estado === "pendiente";

                        return (
                          <div
                            key={pago.id}
                            className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isCompletado
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : isPendiente
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                {isCompletado ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : isPendiente ? (
                                  <Clock className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-[var(--color-text-main)]">
                                    {formatPEN(pago.monto_pen)}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                                      isCompletado
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                        : isPendiente
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                                  >
                                    {pago.estado === "completado"
                                      ? "Completado"
                                      : pago.estado === "pendiente"
                                      ? "Pendiente"
                                      : "Anulado"}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[var(--color-text-muted)]">
                                  {pago.fecha_pago} • {pago.metodo_pago || "Efectivo"}
                                  {pago.referencia ? ` • Ref: ${pago.referencia}` : ""}
                                </span>
                                {pago.notas && (
                                  <span className="text-[10px] text-[var(--color-text-muted)] italic">
                                    {pago.notas}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePayment(pago.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Eliminar este pago"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* TAB 2: Catálogo de Planes Editables */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                      Catálogo de Planes (Precios en Soles - PEN)
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Puedes modificar los nombres, duración en meses y precios de cada plan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultPlans}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-text-muted)]/20 hover:border-[var(--color-text-muted)] flex items-center gap-1 transition-all"
                      title="Restablecer los 5 planes originales"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restablecer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewPlan(true);
                        setEditingPlanId("new");
                        setEditPlanNombre("Nuevo Plan");
                        setEditPlanMeses(1);
                        setEditPlanPrecio(200);
                        setEditPlanDesc("");
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-accent-blue)] text-white flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Plan</span>
                    </button>
                  </div>
                </div>

                {/* Formulario de edición o creación de plan */}
                {editingPlanId && (
                  <div className="p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-accent-blue)]/40 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-[var(--color-text-muted)]/15">
                      <span className="text-xs font-bold text-[var(--color-text-main)]">
                        {isCreatingNewPlan ? "Crear Nuevo Plan" : "Editar Plan del Catálogo"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlanId(null);
                          setIsCreatingNewPlan(false);
                        }}
                        className="text-xs text-[var(--color-text-muted)] hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                          Nombre del Plan
                        </label>
                        <input
                          type="text"
                          value={editPlanNombre}
                          onChange={(e) => setEditPlanNombre(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-bold"
                          placeholder="Ej: Plan 3 meses"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                          Duración (Meses)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="36"
                          value={editPlanMeses}
                          onChange={(e) => setEditPlanMeses(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                          Precio en Soles (PEN)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1.5 text-xs font-bold text-[var(--color-text-muted)]">
                            S/
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={editPlanPrecio}
                            onChange={(e) => setEditPlanPrecio(Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-black"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                        Descripción o detalles del plan
                      </label>
                      <input
                        type="text"
                        value={editPlanDesc}
                        onChange={(e) => setEditPlanDesc(e.target.value)}
                        placeholder="Ej: Entrenamiento personalizado con chequeo quincenal..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlanId(null);
                          setIsCreatingNewPlan(false);
                        }}
                        className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] font-semibold"
                      >
                        Descartar
                      </button>
                      <button
                        type="button"
                        onClick={isCreatingNewPlan ? handleCreateNewPlan : handleSaveEditedPlan}
                        className="px-4 py-1.5 text-xs font-bold bg-[var(--color-accent-blue)] text-white rounded-xl shadow-sm active:scale-95 transition-all"
                      >
                        {isCreatingNewPlan ? "Guardar Nuevo Plan" : "Guardar Cambios del Plan"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de planes configurados */}
                <div className="space-y-2.5">
                  {planesSuscripcion.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center font-black text-xs text-[var(--color-accent-blue)] shrink-0">
                          {plan.duracion_meses}m
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[var(--color-text-main)]">
                              {plan.nombre}
                            </span>
                            <span className="font-black text-xs text-[var(--color-accent-blue)]">
                              {formatPEN(plan.precio_pen)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                            Duración: {plan.duracion_meses} {plan.duracion_meses === 1 ? "mes" : "meses"}
                            {plan.descripcion ? ` • ${plan.descripcion}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditPlan(plan)}
                          className="px-2.5 py-1 text-xs font-bold text-[var(--color-accent-blue)] rounded-lg hover:bg-[var(--color-accent-blue)]/10 transition-colors flex items-center gap-1"
                          title="Editar este plan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Eliminar este plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "semaforo" && (
              <div className="space-y-4">
                {/* Indicador de Estado - Semáforo Visual Automático */}
                <div className="bg-[var(--color-bg-base)] rounded-2xl p-4 shadow-neu-pressed border border-[var(--color-text-muted)]/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-[var(--color-text-main)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Semáforo de Pagos</span>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        (Evaluación automática según fecha de vencimiento)
                      </span>
                    </div>

                    {/* Active State Pill */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${semaforoInfo.badgeBg} ${semaforoInfo.badgeText} ${semaforoInfo.badgeBorder}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${semaforoInfo.dotColor} animate-pulse`} />
                      <span>{semaforoInfo.label}</span>
                    </div>
                  </div>

                  {/* 4 Lights Interactive Visual Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {/* Verde */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                        semaforoInfo.semaforo === "verde"
                          ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                          : "bg-black/5 dark:bg-white/5 border-transparent opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verde</span>
                      </div>
                      <span className="text-[11px] leading-tight text-[var(--color-text-muted)]">
                        Al día (&gt; 5 días para vencer)
                      </span>
                    </div>

                    {/* Ámbar */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                        semaforoInfo.semaforo === "ambar"
                          ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                          : "bg-black/5 dark:bg-white/5 border-transparent opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Ámbar</span>
                      </div>
                      <span className="text-[11px] leading-tight text-[var(--color-text-muted)]">
                        Faltan 1 a 5 días para vencer
                      </span>
                    </div>

                    {/* Rojo */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                        semaforoInfo.semaforo === "rojo"
                          ? "bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30 shadow-md"
                          : "bg-black/5 dark:bg-white/5 border-transparent opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Rojo</span>
                      </div>
                      <span className="text-[11px] leading-tight text-[var(--color-text-muted)]">
                        Vencido de 0 a 2 días
                      </span>
                    </div>

                    {/* Negro */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                        semaforoInfo.semaforo === "negro"
                          ? "bg-slate-900 text-white border-slate-700 ring-2 ring-slate-500 shadow-md"
                          : "bg-black/5 dark:bg-white/5 border-transparent opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-black ring-1 ring-white shrink-0" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Negro</span>
                      </div>
                      <span className="text-[11px] leading-tight opacity-75">
                        &gt; 2 días de vencido (Bloqueo)
                      </span>
                    </div>
                  </div>

                  {/* Status explanation banner */}
                  <div
                    className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${
                      semaforoInfo.bloqueado
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                        : semaforoInfo.semaforo === "rojo"
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                        : semaforoInfo.semaforo === "ambar"
                        ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                    }`}
                  >
                    {semaforoInfo.bloqueado ? (
                      <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : semaforoInfo.semaforo === "rojo" ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : semaforoInfo.semaforo === "ambar" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">{semaforoInfo.descripcion}</p>
                      {semaforoInfo.bloqueado ? (
                        <p className="mt-0.5 text-[11px] opacity-90">
                          <strong>Acceso a rutinas bloqueado:</strong> El atleta no puede ver ni iniciar sus rutinas hasta que se registre su pago y se extienda su fecha límite.
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[11px] opacity-90">
                          <strong>Acceso a rutinas:</strong> Habilitado normalmente según los permisos y horarios configurados.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Atleta: <strong className="text-[var(--color-text-main)]">{athlete.nombre}</strong> (Vencimiento: {fechaFin})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("suscripcion")}
                    className="px-4 py-2 rounded-xl bg-[var(--color-accent-blue)] text-white text-xs font-bold shadow-sm"
                  >
                    Volver a Suscripción y Pagos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[var(--color-text-muted)]/20 flex items-center justify-between bg-[var(--color-bg-base)] shrink-0">
            <span className="text-[11px] text-[var(--color-text-muted)]">
              Módulo de Membresías GymBro
            </span>
            <NeuButton
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-[var(--color-text-main)] shadow-neu-flat"
            >
              Cerrar Panel
            </NeuButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
