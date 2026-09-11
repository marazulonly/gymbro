import { PlanSuscripcion, SemaforoPago } from "@/types";

export interface InfoSemaforoPago {
  semaforo: SemaforoPago | 'sin_registro';
  label: string;
  diasDiferencia: number; // > 0: faltan días, 0: hoy vence, < 0: días de retraso
  descripcion: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  bloqueado: boolean; // true solo para estado 'negro' (> 2 días pasados)
}

export const DEFAULT_PLANES_SUSCRIPCION: PlanSuscripcion[] = [
  {
    id: "plan_1m",
    nombre: "Plan 1 mes",
    duracion_meses: 1,
    precio_pen: 300,
    descripcion: "Entrenamiento mensual regular y seguimiento personalizado.",
    activo: true,
  },
  {
    id: "plan_3m",
    nombre: "Plan 3 meses",
    duracion_meses: 3,
    precio_pen: 750,
    descripcion: "Plan trimestral para consolidación de hábitos y fuerza.",
    activo: true,
  },
  {
    id: "plan_6m",
    nombre: "Plan 6 meses",
    duracion_meses: 6,
    precio_pen: 1500,
    descripcion: "Transformación semestral con evaluación continua.",
    activo: true,
  },
  {
    id: "plan_anual",
    nombre: "Plan Anual",
    duracion_meses: 12,
    precio_pen: 3000,
    descripcion: "Membresía anual completa con acceso preferencial 365 días.",
    activo: true,
  },
  {
    id: "plan_minero",
    nombre: "Plan Minero",
    duracion_meses: 1,
    precio_pen: 2500,
    descripcion: "Plan especial adaptado a régimen minero (14x7 / 20x10).",
    activo: true,
  },
];

/**
 * Calcula la fecha final sumando meses a la fecha inicial respetando los días del mes.
 * Retorna fecha en formato ISO "YYYY-MM-DD"
 */
export function calculateSubscriptionEndDate(startDateStr: string, months: number): string {
  if (!startDateStr) return "";
  const [yearStr, monthStr, dayStr] = startDateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return "";

  // Crear objeto fecha
  const targetDate = new Date(year, month - 1 + months, day);
  
  // Si el mes resultante se desborda (ej. 31 de enero + 1 mes -> marzo), ajustar al último día del mes
  const expectedMonth = (month - 1 + months) % 12;
  if (targetDate.getMonth() !== (expectedMonth < 0 ? expectedMonth + 12 : expectedMonth)) {
    targetDate.setDate(0); // Último día del mes anterior
  }

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, "0");
  const d = String(targetDate.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

/**
 * Indicador de Estado (Semáforo de pagos para el atleta):
 * Basado en la fecha actual frente a la fecha final de suscripción:
 * - Verde: Atleta al día en sus pagos (más de 5 días restantes).
 * - Ámbar: Faltan 5 días o menos para la fecha de pago (entre 1 y 5 días restantes).
 * - Rojo: Ha llegado la fecha de pago o han pasado hasta 2 días de la fecha límite (0 a -2 días).
 * - Negro: Han pasado más de 2 días de la fecha límite de pago (diffDays < -2).
 *   Activa bloqueo automático de rutinas.
 */
export function calcularSemaforoPago(fechaFin?: string | null): InfoSemaforoPago {
  if (!fechaFin || fechaFin.trim() === "") {
    return {
      semaforo: "sin_registro",
      label: "Sin suscripción",
      diasDiferencia: 0,
      descripcion: "No tiene fecha final registrada. Configura su suscripción.",
      badgeBg: "bg-slate-100 dark:bg-slate-800",
      badgeText: "text-slate-600 dark:text-slate-400",
      badgeBorder: "border-slate-300 dark:border-slate-700",
      dotColor: "bg-slate-400",
      bloqueado: false,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [yStr, mStr, dStr] = fechaFin.split("-");
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return {
      semaforo: "sin_registro",
      label: "Fecha inválida",
      diasDiferencia: 0,
      descripcion: "Fecha final con formato no reconocido.",
      badgeBg: "bg-slate-100 dark:bg-slate-800",
      badgeText: "text-slate-600 dark:text-slate-400",
      badgeBorder: "border-slate-300 dark:border-slate-700",
      dotColor: "bg-slate-400",
      bloqueado: false,
    };
  }

  const targetDate = new Date(year, month - 1, day);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // 1. Verde: Atleta al día en sus pagos (más de 5 días restantes)
  if (diffDays > 5) {
    return {
      semaforo: "verde",
      label: "Al día",
      diasDiferencia: diffDays,
      descripcion: `Al día (${diffDays} días restantes hasta el ${fechaFin})`,
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/50",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      badgeBorder: "border-emerald-400 dark:border-emerald-600",
      dotColor: "bg-emerald-500",
      bloqueado: false,
    };
  }

  // 2. Ámbar: Faltan 5 días o menos para la fecha de pago (entre 1 y 5 días restantes)
  if (diffDays >= 1 && diffDays <= 5) {
    return {
      semaforo: "ambar",
      label: "Por vencer",
      diasDiferencia: diffDays,
      descripcion: diffDays === 1 
        ? "¡Vence mañana! Pendiente de pago." 
        : `Faltan ${diffDays} días para la fecha de pago (${fechaFin})`,
      badgeBg: "bg-amber-100 dark:bg-amber-950/50",
      badgeText: "text-amber-800 dark:text-amber-300",
      badgeBorder: "border-amber-400 dark:border-amber-600",
      dotColor: "bg-amber-500",
      bloqueado: false,
    };
  }

  // 3. Rojo: Ha llegado la fecha de pago o han pasado hasta 2 días de la fecha límite (0 a -2 días)
  if (diffDays <= 0 && diffDays >= -2) {
    const atraso = Math.abs(diffDays);
    const label = diffDays === 0 ? "Vence hoy" : `Vencido (${atraso}d)`;
    const desc = diffDays === 0 
      ? `Hoy es la fecha de pago (${fechaFin}). Regularizar hoy.` 
      : `Han pasado ${atraso} día(s) de la fecha límite (período de gracia).`;

    return {
      semaforo: "rojo",
      label,
      diasDiferencia: diffDays,
      descripcion: desc,
      badgeBg: "bg-rose-100 dark:bg-rose-950/50",
      badgeText: "text-rose-700 dark:text-rose-300",
      badgeBorder: "border-rose-400 dark:border-rose-600",
      dotColor: "bg-rose-500",
      bloqueado: false,
    };
  }

  // 4. Negro: Han pasado más de 2 días de la fecha límite de pago (diffDays < -2, ej: -3, -4...)
  const diasMora = Math.abs(diffDays);
  return {
    semaforo: "negro",
    label: "Bloqueado (Mora)",
    diasDiferencia: diffDays,
    descripcion: `Superó el límite de pago por ${diasMora} días. Rutinas bloqueadas automáticamente.`,
    badgeBg: "bg-slate-900 dark:bg-black text-slate-100 dark:text-white",
    badgeText: "text-slate-100 dark:text-white",
    badgeBorder: "border-slate-700 dark:border-slate-600",
    dotColor: "bg-slate-950 ring-2 ring-slate-400 dark:ring-slate-300",
    bloqueado: true,
  };
}

export function formatPEN(monto: number): string {
  return `S/ ${Number(monto || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

/**
 * Determina si un plan pertenece exclusivamente a un entrenador específico.
 * Los planes creados con id_entrenador se comparan directamente.
 * Los planes iniciales sin id_entrenador se asocian por defecto a "entrenador1".
 */
export function isPlanOfTrainer(plan: PlanSuscripcion, trainerId?: string): boolean {
  if (!trainerId) return false;
  if (plan.id_entrenador) {
    return plan.id_entrenador === trainerId;
  }
  return trainerId === "entrenador1";
}

/**
 * Genera una copia limpia de un plan asignándola al entrenador destino.
 */
export function createPlanCopyForTrainer(
  plan: PlanSuscripcion,
  targetTrainerId: string
): PlanSuscripcion {
  return {
    ...plan,
    id: `plan_tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    id_entrenador: targetTrainerId,
  };
}
