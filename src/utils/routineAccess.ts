import { Usuario, ControlAccesoRutinas, ModoControlAcceso } from "@/types";

export interface RoutineAccessStatus {
  allowed: boolean;
  modo: ModoControlAcceso;
  reasonTitle: string;
  reasonMessage: string;
  trainerName: string;
  trainerWhatsapp?: string;
  isTodayOnly: boolean;
  isDayAllowed: boolean; // if targetDiaSemana is provided
  secondsRemainingToday: number | null; // null if not in franja_horaria
  todayFranjaWindow?: { start: string; end: string };
}

export const DIAS_SEMANA_COMPLETO = [
  { id: 1, label: "Lunes", corto: "Lun" },
  { id: 2, label: "Martes", corto: "Mar" },
  { id: 3, label: "Miércoles", corto: "Mié" },
  { id: 4, label: "Jueves", corto: "Jue" },
  { id: 5, label: "Viernes", corto: "Vie" },
  { id: 6, label: "Sábado", corto: "Sáb" },
  { id: 0, label: "Domingo", corto: "Dom" },
];

export const DEFAULT_FRANJA_HORARIA = {
  activo: true,
  hora_inicio: "06:00",
  hora_fin: "22:00",
};

/**
 * Checks the routine access for an athlete based on their trainer's configuration.
 * Always respects the athlete's local device timezone.
 */
export function checkAthleteRoutineAccess(
  athlete: Usuario | null | undefined,
  allUsers: Usuario[],
  targetDiaSemana?: number
): RoutineAccessStatus {
  const defaultStatus: RoutineAccessStatus = {
    allowed: true,
    modo: "siempre_visible",
    reasonTitle: "",
    reasonMessage: "",
    trainerName: "tu entrenador",
    trainerWhatsapp: undefined,
    isTodayOnly: false,
    isDayAllowed: true,
    secondsRemainingToday: null,
  };

  if (!athlete || athlete.rol !== "cliente") {
    return defaultStatus;
  }

  // Find assigned trainer
  const trainer = allUsers.find((u) => u.id === athlete.id_entrenador) ||
    allUsers.find((u) => u.rol === "entrenador");
  const trainerName = trainer?.nombre || "tu entrenador";
  const trainerWhatsapp = trainer?.whatsapp;

  const config: ControlAccesoRutinas = athlete.control_acceso || {
    modo: "siempre_visible",
  };

  const modo = config.modo || "siempre_visible";

  // Athlete's local time
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
  const currentFormattedTime = `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;

  // 1. Siempre visible (Default)
  if (modo === "siempre_visible") {
    return {
      allowed: true,
      modo: "siempre_visible",
      reasonTitle: "",
      reasonMessage: "",
      trainerName,
      trainerWhatsapp,
      isTodayOnly: false,
      isDayAllowed: true,
      secondsRemainingToday: null,
    };
  }

  // 2. Solo hoy
  if (modo === "solo_hoy") {
    const isDayAllowed = targetDiaSemana !== undefined ? targetDiaSemana === currentDayOfWeek : true;
    const allowed = isDayAllowed;

    return {
      allowed,
      modo: "solo_hoy",
      reasonTitle: "Modo: Solo Hoy",
      reasonMessage: isDayAllowed
        ? "Acceso habilitado para la rutina de hoy."
        : `Esta rutina está programada para otro día. Tu entrenador ha habilitado el acceso únicamente a la fecha actual. Comunicarse con ${trainerName}.`,
      trainerName,
      trainerWhatsapp,
      isTodayOnly: true,
      isDayAllowed,
      secondsRemainingToday: null,
    };
  }

  // 3. Horario manual (Switch ON / OFF)
  if (modo === "horario_manual") {
    const isManualOn = config.manual_activo !== false; // default to true if undefined
    const allowed = isManualOn;

    return {
      allowed,
      modo: "horario_manual",
      reasonTitle: allowed ? "Acceso Manual Habilitado" : "Rutina Pausada Temporalmente",
      reasonMessage: allowed
        ? "Acceso habilitado manualmente por tu entrenador."
        : `Tu rutina está pausada temporalmente. Comunicarse con ${trainerName}.`,
      trainerName,
      trainerWhatsapp,
      isTodayOnly: false,
      isDayAllowed: true,
      secondsRemainingToday: null,
    };
  }

  // 4. Por franja horaria
  if (modo === "franja_horaria") {
    const franjas = config.franjas_semanales || {};
    const todayFranja = franjas[currentDayOfWeek];

    if (!todayFranja || !todayFranja.activo) {
      return {
        allowed: false,
        modo: "franja_horaria",
        reasonTitle: "Día no habilitado para entrenamiento",
        reasonMessage: `Hoy no tienes franja horaria de entrenamiento habilitada. Comunicarse con ${trainerName}.`,
        trainerName,
        trainerWhatsapp,
        isTodayOnly: false,
        isDayAllowed: false,
        secondsRemainingToday: 0,
      };
    }

    const [startH, startM] = (todayFranja.hora_inicio || "06:00").split(":").map(Number);
    const [endH, endM] = (todayFranja.hora_fin || "22:00").split(":").map(Number);

    const startSeconds = startH * 3600 + (startM || 0) * 60;
    const endSeconds = endH * 3600 + (endM || 0) * 60;

    const isWithinTime = currentTotalSeconds >= startSeconds && currentTotalSeconds <= endSeconds;
    const secondsRemaining = isWithinTime ? Math.max(0, endSeconds - currentTotalSeconds) : 0;

    let reasonMessage = "";
    if (currentTotalSeconds < startSeconds) {
      reasonMessage = `Tu horario de entrenamiento inicia a las ${todayFranja.hora_inicio}. Comunicarse con ${trainerName}.`;
    } else if (currentTotalSeconds > endSeconds) {
      reasonMessage = `Tu horario de entrenamiento finalizó a las ${todayFranja.hora_fin}. Comunicarse con ${trainerName}.`;
    } else {
      reasonMessage = `Entrenamiento habilitado de ${todayFranja.hora_inicio} a ${todayFranja.hora_fin}.`;
    }

    return {
      allowed: isWithinTime,
      modo: "franja_horaria",
      reasonTitle: isWithinTime ? "Dentro de la Franja Horaria" : "Fuera de la Franja Horaria",
      reasonMessage: isWithinTime ? reasonMessage : `${reasonMessage} Comunicarse con ${trainerName}.`,
      trainerName,
      trainerWhatsapp,
      isTodayOnly: false,
      isDayAllowed: isWithinTime,
      secondsRemainingToday: secondsRemaining,
      todayFranjaWindow: {
        start: todayFranja.hora_inicio,
        end: todayFranja.hora_fin,
      },
    };
  }

  return defaultStatus;
}
