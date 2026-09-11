import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store";
import { NeuCard } from "@/components/ui/NeuCard";
import {
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  Eye,
  FileCheck,
  X,
  User,
  MessageCircle,
  AlertCircle,
  ChevronRight,
  Info,
  Sparkles,
  Lock
} from "lucide-react";
import {
  calcularSemaforoPago,
  formatPEN,
  formatDateDisplay,
  getTodayDateString,
} from "@/utils/subscriptionUtils";
import { motion, AnimatePresence } from "motion/react";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

export function AthleteMembershipView() {
  const { currentUser, usuarios } = useStore();
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Entrenador asignado
  const trainer = useMemo(() => {
    if (!currentUser?.id_entrenador) return null;
    return usuarios.find((u) => u.id === currentUser.id_entrenador) || null;
  }, [currentUser, usuarios]);

  const suscripcion = currentUser?.suscripcion;
  const fechaFin = suscripcion?.fecha_fin;
  const fechaInicio = suscripcion?.fecha_inicio;

  const semaforoInfo = useMemo(() => {
    return calcularSemaforoPago(fechaFin);
  }, [fechaFin]);

  // Lista de pagos registrados por el entrenador
  const pagos = useMemo(() => {
    const list = suscripcion?.historial_pagos || [];
    return [...list].sort((a, b) => {
      return new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime();
    });
  }, [suscripcion]);

  // Cuenta regresiva en tiempo real
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    totalSeconds: 0,
  });

  useEffect(() => {
    if (!fechaFin) return;

    const calculateTime = () => {
      const [y, m, d] = fechaFin.split("-").map(Number);
      if (!y || !m || !d) return;

      // La suscripción vence al final del día de la fecha de fin (23:59:59)
      const targetDate = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        const pastDiff = Math.abs(diff);
        const pastDays = Math.floor(pastDiff / (1000 * 60 * 60 * 24));
        const pastHours = Math.floor((pastDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const pastMinutes = Math.floor((pastDiff % (1000 * 60 * 60)) / (1000 * 60));
        const pastSeconds = Math.floor((pastDiff % (1000 * 60)) / 1000);

        setCountdown({
          days: pastDays,
          hours: pastHours,
          minutes: pastMinutes,
          seconds: pastSeconds,
          isExpired: true,
          totalSeconds: 0,
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
          totalSeconds: Math.floor(diff / 1000),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [fechaFin]);

  const trainerWhatsappUrl = trainer?.whatsapp
    ? `https://wa.me/51${trainer.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola ${trainer.nombre}, te escribo desde mi app GymBro respecto a mi membresía.`
      )}`
    : null;

  return (
    <div className="space-y-4 pb-24 px-1 max-w-lg mx-auto">
      {/* Header Principal de Membresía */}
      <div className="p-4 rounded-3xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[var(--color-text-main)] tracking-tight">
                Membresía
              </h1>
            </div>
          </div>

          {/* Badge del Semáforo */}
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-sm ${semaforoInfo.badgeBg} ${semaforoInfo.badgeText} ${semaforoInfo.badgeBorder}`}
          >
            <span className={`w-2 h-2 rounded-full ${semaforoInfo.dotColor}`} />
            <span>{semaforoInfo.label}</span>
          </div>
        </div>

        {/* Tarjeta de Cuenta Regresiva */}
        {fechaFin ? (
          <div className="p-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--color-accent-blue)]" />
                {countdown.isExpired ? "Suscripción Finalizada" : "Tiempo Restante"}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                Vence: <strong>{formatDateDisplay(fechaFin)}</strong>
              </span>
            </div>

            {/* Contador en cajas neumórficas */}
            {!countdown.isExpired ? (
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                {/* Días */}
                <div className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/10">
                  <span className="text-lg sm:text-xl font-black text-[var(--color-text-main)] block leading-none">
                    {countdown.days}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mt-1 block">
                    Días
                  </span>
                </div>

                {/* Horas */}
                <div className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/10">
                  <span className="text-lg sm:text-xl font-black text-[var(--color-text-main)] block leading-none">
                    {String(countdown.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mt-1 block">
                    Horas
                  </span>
                </div>

                {/* Minutos */}
                <div className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/10">
                  <span className="text-lg sm:text-xl font-black text-[var(--color-text-main)] block leading-none">
                    {String(countdown.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mt-1 block">
                    Min
                  </span>
                </div>

                {/* Segundos */}
                <div className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/10">
                  <span className="text-lg sm:text-xl font-black text-[var(--color-accent-blue)] block leading-none tabular-nums">
                    {String(countdown.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mt-1 block">
                    Seg
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-rose-700 dark:text-rose-400 block">
                    Tu membresía expiró el {formatDateDisplay(fechaFin)}
                  </span>
                  <span className="text-rose-600/90 dark:text-rose-300 text-[11px]">
                    Hace {countdown.days} día(s) y {countdown.hours} hora(s). Contacta a tu entrenador para renovar.
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
            <Info className="w-6 h-6 text-amber-500 mx-auto" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              No tienes fechas de membresía registradas actualmente.
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
              Pídele a tu entrenador que configure tu plan o registre tu pago inicial.
            </p>
          </div>
        )}
      </div>

      {/* Información del Entrenador */}
      {trainer && (
        <div className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                Entrenador Responsable
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--color-text-main)]">
                {trainer.nombre}
              </span>
            </div>
          </div>

          {trainerWhatsappUrl && (
            <a
              href={trainerWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
              title="Contactar entrenador por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Coordinar</span>
            </a>
          )}
        </div>
      )}

      {/* Historial de Pagos Registrados */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
            Pagos Registrados ({pagos.length})
          </h2>
          {suscripcion?.precio_pen ? (
            <span className="text-[11px] font-bold text-[var(--color-text-muted)]">
              Plan: {formatPEN(suscripcion.precio_pen)}
            </span>
          ) : null}
        </div>

        {pagos.length === 0 ? (
          <div className="p-6 rounded-3xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl shadow-neu-pressed mx-auto flex items-center justify-center text-[var(--color-text-muted)]">
              <DollarSign className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-xs font-bold text-[var(--color-text-main)]">
              Aún no hay pagos registrados en tu cuenta
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs mx-auto">
              Cuando tu entrenador registre o valide un comprobante de pago, aparecerá reflejado aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pagos.map((pago) => {
              const isCompletado = pago.estado === "completado";
              const isPendiente = pago.estado === "pendiente";

              return (
                <div
                  key={pago.id}
                  className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/15 flex flex-col gap-2.5 hover:shadow-neu-pressed transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-[var(--color-text-main)]">
                          {formatPEN(pago.monto_pen)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                            isCompletado
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : isPendiente
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {isCompletado ? "Completado" : isPendiente ? "Pendiente" : "Anulado"}
                        </span>
                        {pago.metodo_pago && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/20">
                            {pago.metodo_pago}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5 block">
                        Fecha: <strong>{formatDateDisplay(pago.fecha_pago)}</strong>
                        {pago.nombre_plan ? ` • ${pago.nombre_plan}` : ""}
                      </span>
                    </div>

                    {/* Botón ver comprobante */}
                    {pago.comprobante_url && (
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptUrl(pago.comprobante_url || null)}
                        className="px-2.5 py-1 rounded-xl shadow-neu-flat hover:shadow-neu-pressed text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-500/30 transition-all active:scale-95 shrink-0"
                        title="Ver Comprobante Adjunto"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Comprobante</span>
                      </button>
                    )}
                  </div>

                  {/* Referencia y Notas */}
                  {(pago.referencia || pago.notas) && (
                    <div className="pt-2 border-t border-[var(--color-text-muted)]/10 text-[11px] space-y-0.5 text-[var(--color-text-muted)]">
                      {pago.referencia && (
                        <div>
                          N° Ref: <span className="font-mono font-bold text-[var(--color-text-main)]">{pago.referencia}</span>
                        </div>
                      )}
                      {pago.notas && (
                        <div className="italic text-[var(--color-text-muted)]">
                          Nota: "{pago.notas}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para ver comprobante de pago */}
      <AnimatePresence>
        {previewReceiptUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewReceiptUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-[var(--color-bg-base)] rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--color-text-muted)]/20">
                <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Comprobante de Pago
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptUrl(null)}
                  className="p-1.5 rounded-full shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black/10 flex items-center justify-center p-1">
                <img
                  src={previewReceiptUrl}
                  alt="Comprobante de Pago"
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
