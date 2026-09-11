import React, { useState, useMemo } from "react";
import { useStore } from "@/store";
import { Usuario, PagoSuscripcion, PlanSuscripcion } from "@/types";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { AthleteSubscriptionModal } from "@/components/AthleteSubscriptionModal";
import { isAthleteAssignedOrCreatedByTrainer } from "@/utils/routineAccess";
import { optimizeImageTo72Dpi } from "@/utils/imageOptimizer";
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  ArrowUpRight,
  TrendingUp,
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Eye,
  FileCheck,
} from "lucide-react";
import {
  formatPEN,
  formatDateDisplay,
  getTodayDateString,
  calculateSubscriptionEndDate,
} from "@/utils/subscriptionUtils";
import { motion, AnimatePresence } from "motion/react";

interface PaymentWithAthlete extends PagoSuscripcion {
  athleteId: string;
  athleteName: string;
  athleteDni?: string;
}

export function TrainerMembershipsModule() {
  const {
    usuarios,
    currentUser,
    planesSuscripcion,
    registrarPagoSuscripcion,
    updateUsuarioSuscripcion,
  } = useStore();

  const isAdmin = currentUser?.rol === "admin";
  const todayStr = getTodayDateString();

  // List of active athletes assigned or created by the current trainer (or all if admin)
  const athletes = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === "cliente")
      .filter((u) => isAthleteAssignedOrCreatedByTrainer(u, currentUser?.id, isAdmin))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
  }, [usuarios, currentUser?.id, isAdmin]);

  // Aggregate all payments across assigned athletes
  const allPayments = useMemo<PaymentWithAthlete[]>(() => {
    const list: PaymentWithAthlete[] = [];
    athletes.forEach((ath) => {
      const payments = ath.suscripcion?.historial_pagos || [];
      payments.forEach((pay) => {
        list.push({
          ...pay,
          athleteId: ath.id,
          athleteName: ath.nombre,
          athleteDni: ath.dni,
        });
      });
    });

    // Sort descending by payment date, then recorded date
    return list.sort((a, b) => {
      const dateDiff = new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.registrado_at || "").getTime() - new Date(a.registrado_at || "").getTime();
    });
  }, [athletes]);

  // Totals calculations: By Day, Month, Year
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const currentYearMonth = `${currentYear}-${currentMonth}`;

  const totals = useMemo(() => {
    let totalDia = 0;
    let countDia = 0;
    let totalMes = 0;
    let countMes = 0;
    let totalAnio = 0;
    let countAnio = 0;
    let totalHistorico = 0;
    let countHistorico = 0;

    allPayments.forEach((p) => {
      if (p.estado === "anulado") return;
      const amount = Number(p.monto_pen) || 0;

      totalHistorico += amount;
      countHistorico += 1;

      if (p.fecha_pago === todayStr) {
        totalDia += amount;
        countDia += 1;
      }
      if (p.fecha_pago.startsWith(currentYearMonth)) {
        totalMes += amount;
        countMes += 1;
      }
      if (p.fecha_pago.startsWith(currentYear)) {
        totalAnio += amount;
        countAnio += 1;
      }
    });

    return {
      dia: { total: totalDia, count: countDia },
      mes: { total: totalMes, count: countMes },
      anio: { total: totalAnio, count: countAnio },
      historico: { total: totalHistorico, count: countHistorico },
    };
  }, [allPayments, todayStr, currentYearMonth, currentYear]);

  // Search & Filter state for payments list
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"todos" | "dia" | "mes" | "anio">("todos");
  const [filterStatus, setFilterStatus] = useState<"todos" | "completado" | "pendiente">("todos");

  // Modal for New Payment
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [selectedAthleteForModal, setSelectedAthleteForModal] = useState<Usuario | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      // Period filter
      if (filterPeriod === "dia" && p.fecha_pago !== todayStr) return false;
      if (filterPeriod === "mes" && !p.fecha_pago.startsWith(currentYearMonth)) return false;
      if (filterPeriod === "anio" && !p.fecha_pago.startsWith(currentYear)) return false;

      // Status filter
      if (filterStatus !== "todos" && p.estado !== filterStatus) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.athleteName.toLowerCase().includes(query);
        const matchRef = p.referencia?.toLowerCase().includes(query) || false;
        const matchDni = p.athleteDni?.includes(query) || false;
        const matchMetodo = (p.metodo_pago || "").toLowerCase().includes(query);
        if (!matchName && !matchRef && !matchDni && !matchMetodo) return false;
      }

      return true;
    });
  }, [allPayments, filterPeriod, filterStatus, searchTerm, todayStr, currentYearMonth, currentYear]);

  // Form states inside Quick Payment Modal
  const [modalAthleteId, setModalAthleteId] = useState<string>("");
  const [modalPlanSugeridoId, setModalPlanSugeridoId] = useState<string | null>(null);
  const [modalPlanNombre, setModalPlanNombre] = useState<string>("");
  const [modalMonto, setModalMonto] = useState<number>(300);
  const [modalFechaPago, setModalFechaPago] = useState<string>(todayStr);
  const [modalFechaFinal, setModalFechaFinal] = useState<string>(
    calculateSubscriptionEndDate(todayStr, 1)
  );
  const [modalMetodoPago, setModalMetodoPago] = useState<string>("Yape/Plin");
  const [modalEstadoPago, setModalEstadoPago] = useState<"completado" | "pendiente">("completado");
  const [modalReferencia, setModalReferencia] = useState<string>("");
  const [modalNotas, setModalNotas] = useState<string>("");
  const [modalComprobanteUrl, setModalComprobanteUrl] = useState<string | null>(null);
  const [modalComprobanteNombre, setModalComprobanteNombre] = useState<string | null>(null);
  const [isProcessingComprobante, setIsProcessingComprobante] = useState<boolean>(false);
  const [modalAutoUpdateFin, setModalAutoUpdateFin] = useState<boolean>(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Pre-select first athlete when opening new payment modal
  const handleOpenNewPayment = (athleteId?: string) => {
    const targetId = athleteId || athletes[0]?.id || "";
    setModalAthleteId(targetId);
    const ath = athletes.find((a) => a.id === targetId);
    const defaultPlan = planesSuscripcion[0];

    if (defaultPlan) {
      setModalPlanSugeridoId(defaultPlan.id);
      setModalPlanNombre(defaultPlan.nombre);
      setModalMonto(defaultPlan.precio_pen);

      const baseDate =
        ath?.suscripcion?.fecha_fin && ath.suscripcion.fecha_fin >= todayStr
          ? ath.suscripcion.fecha_fin
          : todayStr;
      setModalFechaFinal(calculateSubscriptionEndDate(baseDate, defaultPlan.duracion_meses));
    } else {
      setModalMonto(300);
      setModalFechaFinal(calculateSubscriptionEndDate(todayStr, 1));
    }

    setModalFechaPago(todayStr);
    setModalMetodoPago("Yape/Plin");
    setModalEstadoPago("completado");
    setModalReferencia("");
    setModalNotas("");
    setModalComprobanteUrl(null);
    setModalComprobanteNombre(null);
    setModalAutoUpdateFin(true);
    setIsNewPaymentOpen(true);
  };

  // Athlete changed in modal
  const handleModalAthleteChange = (newAthleteId: string) => {
    setModalAthleteId(newAthleteId);
    const ath = athletes.find((a) => a.id === newAthleteId);
    const plan = planesSuscripcion.find((p) => p.id === modalPlanSugeridoId) || planesSuscripcion[0];
    if (plan) {
      const baseDate =
        ath?.suscripcion?.fecha_fin && ath.suscripcion.fecha_fin >= modalFechaPago
          ? ath.suscripcion.fecha_fin
          : modalFechaPago;
      setModalFechaFinal(calculateSubscriptionEndDate(baseDate, plan.duracion_meses));
    }
  };

  // Select a suggested plan in modal
  const handleModalSelectSuggestedPlan = (plan: PlanSuscripcion) => {
    setModalPlanSugeridoId(plan.id);
    setModalPlanNombre(plan.nombre);
    setModalMonto(plan.precio_pen);

    const ath = athletes.find((a) => a.id === modalAthleteId);
    const baseDate =
      ath?.suscripcion?.fecha_fin && ath.suscripcion.fecha_fin >= modalFechaPago
        ? ath.suscripcion.fecha_fin
        : modalFechaPago;
    const newEnd = calculateSubscriptionEndDate(baseDate, plan.duracion_meses);
    setModalFechaFinal(newEnd);
    setModalNotas(`Pago ${plan.nombre}`);
  };

  // Recalculate end date on payment date change
  const handleModalFechaPagoChange = (newFecha: string) => {
    setModalFechaPago(newFecha);
    if (modalPlanSugeridoId) {
      const plan = planesSuscripcion.find((p) => p.id === modalPlanSugeridoId);
      if (plan) {
        const ath = athletes.find((a) => a.id === modalAthleteId);
        const baseDate =
          ath?.suscripcion?.fecha_fin && ath.suscripcion.fecha_fin >= newFecha
            ? ath.suscripcion.fecha_fin
            : newFecha;
        setModalFechaFinal(calculateSubscriptionEndDate(baseDate, plan.duracion_meses));
      }
    }
  };

  // Handle voucher upload with automatic 72 DPI optimization
  const handleComprobanteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingComprobante(true);
    try {
      const result = await optimizeImageTo72Dpi(file, 1200, 0.8);
      setModalComprobanteUrl(result.dataUrl);
      setModalComprobanteNombre(file.name);
    } catch (err) {
      console.error("Error optimizando comprobante a 72 dpi:", err);
    } finally {
      setIsProcessingComprobante(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = "";
    }
  };

  // Submit payment from modal
  const handleSubmitNewPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAthleteId || modalMonto <= 0) return;

    setIsSubmittingPayment(true);
    try {
      const newPayment: PagoSuscripcion = {
        id: `pay_${Date.now()}`,
        fecha_pago: modalFechaPago,
        monto_pen: Number(modalMonto),
        metodo_pago: modalMetodoPago,
        estado: modalEstadoPago,
        referencia: modalReferencia.trim(),
        notas: modalNotas.trim(),
        comprobante_url: modalComprobanteUrl || undefined,
        comprobante_nombre: modalComprobanteNombre || undefined,
        registrado_at: new Date().toISOString(),
      };

      await registrarPagoSuscripcion(modalAthleteId, newPayment);

      // Auto update athlete's subscription end date if requested and completed
      if (modalEstadoPago === "completado" && modalAutoUpdateFin && modalFechaFinal) {
        const ath = athletes.find((a) => a.id === modalAthleteId);
        if (ath) {
          await updateUsuarioSuscripcion(modalAthleteId, {
            ...(ath.suscripcion || {
              id_plan: modalPlanSugeridoId || "plan_1m",
              nombre_plan: modalPlanNombre || "Plan 1 mes",
              duracion_meses: 1,
              precio_pen: modalMonto,
              fecha_inicio: modalFechaPago,
              fecha_fin: modalFechaFinal,
              historial_pagos: [],
            }),
            fecha_fin: modalFechaFinal,
            nombre_plan: modalPlanNombre || ath.suscripcion?.nombre_plan || "Plan",
          });
        }
      }

      setIsNewPaymentOpen(false);
    } catch (err) {
      console.error("Error registering payment:", err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header with Title and Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-bg-base)] p-4 rounded-3xl shadow-neu-flat border border-[var(--color-text-muted)]/15">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] shrink-0">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[var(--color-text-main)] tracking-tight">
              Membresías
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Ingresos y pagos
            </p>
          </div>
        </div>

        {/* Botón para registrar Nuevo Pago */}
        <button
          type="button"
          onClick={() => handleOpenNewPayment()}
          className="px-4 py-2.5 rounded-2xl bg-[var(--color-accent-blue)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo Pago</span>
        </button>
      </div>

      {/* Cards de Total de Pagos Registrados (Día, Mes, Año) - Altura compacta optimizada */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Total Por Día */}
        <div
          onClick={() => setFilterPeriod(filterPeriod === "dia" ? "todos" : "dia")}
          className={`py-2.5 px-3.5 sm:px-4 rounded-2xl cursor-pointer transition-all border ${
            filterPeriod === "dia"
              ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)] shadow-md scale-[1.01]"
              : "bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed border-[var(--color-text-muted)]/15"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  filterPeriod === "dia" ? "text-white/85" : "text-[var(--color-text-muted)]"
                }`}
              >
                Día
              </span>
              <div className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                {formatPEN(totals.dia.total)}
              </div>
              <div
                className={`text-[10px] mt-0.5 ${
                  filterPeriod === "dia" ? "text-white/80" : "text-[var(--color-text-muted)]"
                }`}
              >
                {totals.dia.count} {totals.dia.count === 1 ? "pago" : "pagos"}
              </div>
            </div>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                filterPeriod === "dia" ? "bg-white/20 text-white" : "shadow-neu-pressed text-emerald-500"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Total Por Mes */}
        <div
          onClick={() => setFilterPeriod(filterPeriod === "mes" ? "todos" : "mes")}
          className={`py-2.5 px-3.5 sm:px-4 rounded-2xl cursor-pointer transition-all border ${
            filterPeriod === "mes"
              ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)] shadow-md scale-[1.01]"
              : "bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed border-[var(--color-text-muted)]/15"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  filterPeriod === "mes" ? "text-white/85" : "text-[var(--color-text-muted)]"
                }`}
              >
                Mes
              </span>
              <div className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                {formatPEN(totals.mes.total)}
              </div>
              <div
                className={`text-[10px] mt-0.5 ${
                  filterPeriod === "mes" ? "text-white/80" : "text-[var(--color-text-muted)]"
                }`}
              >
                {totals.mes.count} {totals.mes.count === 1 ? "pago" : "pagos"}
              </div>
            </div>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                filterPeriod === "mes" ? "bg-white/20 text-white" : "shadow-neu-pressed text-[var(--color-accent-blue)]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Total Por Año */}
        <div
          onClick={() => setFilterPeriod(filterPeriod === "anio" ? "todos" : "anio")}
          className={`py-2.5 px-3.5 sm:px-4 rounded-2xl cursor-pointer transition-all border ${
            filterPeriod === "anio"
              ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)] shadow-md scale-[1.01]"
              : "bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed border-[var(--color-text-muted)]/15"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  filterPeriod === "anio" ? "text-white/85" : "text-[var(--color-text-muted)]"
                }`}
              >
                Año
              </span>
              <div className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                {formatPEN(totals.anio.total)}
              </div>
              <div
                className={`text-[10px] mt-0.5 ${
                  filterPeriod === "anio" ? "text-white/80" : "text-[var(--color-text-muted)]"
                }`}
              >
                {totals.anio.count} {totals.anio.count === 1 ? "pago" : "pagos"}
              </div>
            </div>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                filterPeriod === "anio" ? "bg-white/20 text-white" : "shadow-neu-pressed text-amber-500"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtro y Búsqueda */}
      <div className="bg-[var(--color-bg-base)] p-3 rounded-2xl shadow-neu-flat border border-[var(--color-text-muted)]/15 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por atleta, método, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros de Período y Estado */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-[var(--color-bg-base)] p-0.5 rounded-xl shadow-neu-pressed text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterPeriod("todos")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterPeriod === "todos"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod("dia")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterPeriod === "dia"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod("mes")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterPeriod === "mes"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod("anio")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterPeriod === "anio"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Año
            </button>
          </div>

          <div className="flex items-center bg-[var(--color-bg-base)] p-0.5 rounded-xl shadow-neu-pressed text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus("todos")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === "todos"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("completado")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === "completado"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Completados
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("pendiente")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === "pendiente"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Pendientes
            </button>
          </div>
        </div>
      </div>

      {/* Sección: Los Últimos Pagos Registrados */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Últimos Pagos Registrados ({filteredPayments.length})</span>
          </h2>

          <span className="text-[11px] text-[var(--color-text-muted)]">
            Total filtrado:{" "}
            <strong className="text-[var(--color-text-main)]">
              {formatPEN(filteredPayments.reduce((acc, p) => acc + (p.estado !== "anulado" ? p.monto_pen : 0), 0))}
            </strong>
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15 text-center flex flex-col items-center justify-center gap-2">
            <CreditCard className="w-10 h-10 text-[var(--color-text-muted)] stroke-1" />
            <p className="text-xs font-bold text-[var(--color-text-main)]">
              No hay pagos registrados con los filtros seleccionados
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs">
              Usa el botón "Nuevo Pago" para ingresar un abono para cualquier atleta.
            </p>
            {athletes.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenNewPayment()}
                className="mt-2 px-3 py-1.5 rounded-xl bg-[var(--color-accent-blue)] text-white font-bold text-xs shadow-sm hover:opacity-90"
              >
                Registrar Primer Pago
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPayments.map((payment) => {
              const ath = athletes.find((a) => a.id === payment.athleteId);
              return (
                <div
                  key={payment.id}
                  className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed transition-all border border-[var(--color-text-muted)]/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl shadow-neu-pressed flex items-center justify-center font-bold text-[var(--color-accent-blue)] text-sm shrink-0">
                      {payment.athleteName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--color-text-main)] truncate">
                          {payment.athleteName}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                            payment.estado === "completado"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                              : payment.estado === "pendiente"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                          }`}
                        >
                          {payment.estado === "completado"
                            ? "Completado"
                            : payment.estado === "pendiente"
                            ? "Pendiente"
                            : "Anulado"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5 flex-wrap">
                        <span>{formatDateDisplay(payment.fecha_pago)}</span>
                        <span>•</span>
                        <span className="font-medium text-[var(--color-text-main)]">
                          {payment.metodo_pago}
                        </span>
                        {payment.referencia && (
                          <>
                            <span>•</span>
                            <span className="opacity-80">Ref: {payment.referencia}</span>
                          </>
                        )}
                        {payment.notas && (
                          <>
                            <span>•</span>
                            <span className="italic opacity-70 truncate max-w-[150px]">
                              {payment.notas}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {payment.comprobante_url && (
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptUrl(payment.comprobante_url || null)}
                        className="px-2 py-1 rounded-xl shadow-neu-flat hover:shadow-neu-pressed text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30 transition-all active:scale-95"
                        title="Ver Comprobante Adjunto"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="hidden sm:inline">Comprobante</span>
                      </button>
                    )}

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-[var(--color-text-main)]">
                        {formatPEN(payment.monto_pen)}
                      </div>
                    </div>

                    {ath && (
                      <button
                        type="button"
                        onClick={() => setSelectedAthleteForModal(ath)}
                        className="p-2 rounded-xl shadow-neu-flat hover:shadow-neu-pressed text-[var(--color-accent-blue)] active:scale-95 transition-all"
                        title="Abrir Control de Membresía del Atleta"
                        aria-label="Abrir Control de Membresía"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Registrar Nuevo Pago */}
      <AnimatePresence>
        {isNewPaymentOpen && (
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
              className="bg-[var(--color-bg-base)] text-[var(--color-text-main)] w-full max-w-lg rounded-3xl shadow-2xl border border-[var(--color-text-muted)]/20 overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[var(--color-text-muted)]/20 flex items-center justify-between bg-[var(--color-bg-base)] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text-main)]">
                      Nuevo Registro de Pago
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Registra el pago de un atleta con sugerencia de planes
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNewPaymentOpen(false)}
                  className="p-2 rounded-full shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] active:scale-95 transition-all"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitNewPayment} className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Seleccionar Atleta - Solo asignados al entrenador actual */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    Atleta
                  </label>
                  {athletes.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-medium">
                      No tienes atletas asignados actualmente para registrar pagos.
                    </div>
                  ) : (
                    <select
                      required
                      value={modalAthleteId}
                      onChange={(e) => handleModalAthleteChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-semibold"
                    >
                      {athletes.map((ath) => (
                        <option key={ath.id} value={ath.id}>
                          {ath.nombre} {ath.dni ? `(DNI: ${ath.dni})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Botones que sugieren los planes actuales */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                    Planes sugeridos (Pulsa para autocompletar monto y fecha final):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {planesSuscripcion
                      .filter((p) => p.activo !== false)
                      .map((plan) => {
                        const isSelected = modalPlanSugeridoId === plan.id;
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => handleModalSelectSuggestedPlan(plan)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                              isSelected
                                ? "bg-[var(--color-accent-blue)] text-white border-[var(--color-accent-blue)] shadow-md scale-[1.02]"
                                : "bg-[var(--color-bg-base)] text-[var(--color-text-main)] shadow-neu-flat hover:shadow-neu-pressed border-transparent hover:border-[var(--color-accent-blue)]/40"
                            }`}
                          >
                            <span>{plan.nombre}</span>
                            <span
                              className={`text-[11px] font-black ${
                                isSelected ? "text-white/90" : "text-[var(--color-accent-blue)]"
                              }`}
                            >
                              {formatPEN(plan.precio_pen)}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Fecha de Pago y Monto Pagado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      Fecha de Pago
                    </label>
                    <input
                      type="date"
                      required
                      value={modalFechaPago}
                      onChange={(e) => handleModalFechaPagoChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      Monto Pagado (PEN)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-[var(--color-text-muted)]">
                        S/
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        value={modalMonto}
                        onChange={(e) => setModalMonto(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha hasta la que se estaría pagando (Fecha Final) */}
                <div className="p-3 rounded-2xl bg-[var(--color-accent-blue)]/10 border border-[var(--color-accent-blue)]/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--color-accent-blue)] shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-[var(--color-text-main)] block">
                          Fecha hasta la que se estaría pagando (Fecha Final)
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {modalFechaFinal
                            ? `Cubre el servicio hasta el ${formatDateDisplay(modalFechaFinal)}`
                            : "Ajusta la fecha final"}
                        </span>
                      </div>
                    </div>

                    <input
                      type="date"
                      value={modalFechaFinal}
                      onChange={(e) => setModalFechaFinal(e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent text-[var(--color-accent-blue)] focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-[var(--color-text-main)] cursor-pointer select-none pt-1 border-t border-[var(--color-accent-blue)]/20">
                    <input
                      type="checkbox"
                      checked={modalAutoUpdateFin}
                      onChange={(e) => setModalAutoUpdateFin(e.target.checked)}
                      className="rounded text-[var(--color-accent-blue)] focus:ring-0"
                    />
                    <span>Actualizar la Fecha Final del atleta a esta fecha al guardar</span>
                  </label>
                </div>

                {/* Método de Pago y Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={modalMetodoPago}
                      onChange={(e) => setModalMetodoPago(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                    >
                      <option value="Yape/Plin">Yape / Plin</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia BCP/BBVA/Interbank">Transferencia Bancaria</option>
                      <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                      <option value="Otro">Otro medio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      Estado del Pago
                    </label>
                    <select
                      value={modalEstadoPago}
                      onChange={(e) => setModalEstadoPago(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                    >
                      <option value="completado">Completado (Pago recibido)</option>
                      <option value="pendiente">Pendiente de confirmación</option>
                    </select>
                  </div>
                </div>

                {/* Subir Comprobante (Resolución 72 DPI automática para la nube) */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15">
                  <label className="block text-xs font-bold text-[var(--color-text-main)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                      Comprobante de Pago
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-normal">
                      Optimizado a 72 DPI
                    </span>
                  </label>

                  {modalComprobanteUrl ? (
                    <div className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-emerald-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={modalComprobanteUrl}
                          alt="Comprobante"
                          onClick={() => setPreviewReceiptUrl(modalComprobanteUrl)}
                          className="w-12 h-12 object-cover rounded-lg shadow-neu-flat cursor-pointer border border-emerald-500/30 hover:opacity-90 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                            {modalComprobanteNombre || "Comprobante cargado"}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)] block">
                            Listo para guardar en Firestore
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptUrl(modalComprobanteUrl)}
                          className="p-1.5 text-xs font-bold text-[var(--color-accent-blue)] rounded-lg shadow-neu-flat hover:shadow-neu-pressed"
                          title="Ver imagen completa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalComprobanteUrl(null);
                            setModalComprobanteNombre(null);
                          }}
                          className="p-1.5 text-xs font-bold text-red-500 rounded-lg shadow-neu-flat hover:shadow-neu-pressed"
                          title="Eliminar comprobante"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed active:scale-95 transition-all border border-[var(--color-accent-blue)]/30">
                        <Upload className="w-4 h-4" />
                        <span>{isProcessingComprobante ? "Optimizando a 72 DPI..." : "Subir Comprobante"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleComprobanteUpload}
                          disabled={isProcessingComprobante}
                        />
                      </label>
                      <span className="block text-[10px] text-[var(--color-text-muted)] mt-1">
                        Formatos JPG, PNG, WEBP. Se convierte automáticamente a resolución 72 DPI antes de subirse a la nube.
                      </span>
                    </div>
                  )}
                </div>

                {/* Referencia y Notas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      N° Operación / Referencia
                    </label>
                    <input
                      type="text"
                      value={modalReferencia}
                      onChange={(e) => setModalReferencia(e.target.value)}
                      placeholder="Ej: Operación 938210"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                      Notas / Observaciones
                    </label>
                    <input
                      type="text"
                      value={modalNotas}
                      onChange={(e) => setModalNotas(e.target.value)}
                      placeholder="Ej: Plan 3 meses promocional"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-transparent focus:border-[var(--color-accent-blue)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPaymentOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] shadow-neu-flat"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayment || isProcessingComprobante || athletes.length === 0}
                    className="px-4 py-2 rounded-xl bg-[var(--color-accent-blue)] text-white font-bold text-xs shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmittingPayment ? "Guardando..." : "Guardar Pago"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Vista Previa de Comprobante / Recibo */}
      <AnimatePresence>
        {previewReceiptUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setPreviewReceiptUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[var(--color-bg-base)] p-3 rounded-3xl max-w-lg w-full shadow-2xl border border-[var(--color-text-muted)]/20 overflow-hidden flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Comprobante de Pago Adjunto (72 DPI)
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptUrl(null)}
                  className="p-1.5 rounded-full shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center max-h-[70vh]">
                <img
                  src={previewReceiptUrl}
                  alt="Comprobante completo"
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Control de Membresía del Atleta individual */}
      {selectedAthleteForModal && (
        <AthleteSubscriptionModal
          isOpen={!!selectedAthleteForModal}
          athlete={selectedAthleteForModal}
          onClose={() => setSelectedAthleteForModal(null)}
        />
      )}
    </div>
  );
}

