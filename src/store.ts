import { create } from 'zustand';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Role, Usuario, Ejercicio, Rutina, EjercicioRutina, PlanNutricion, FichaProgreso } from './types';

interface AppState {
  isCloudReady: boolean;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  isLoggedIn: boolean;
  currentUser: Usuario | null;
  usuarios: Usuario[];
  login: (dni: string, contrasena: string) => { success: boolean; error?: string };
  logout: () => void;
  addUsuario: (usuario: Usuario) => Promise<void>;
  updateUsuario: (usuario: Usuario) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
  planNutricion: PlanNutricion;
  updatePlanNutricion: (plan: PlanNutricion) => Promise<void>;
  ejercicios: Ejercicio[];
  addEjercicio: (ejercicio: Ejercicio) => Promise<void>;
  updateEjercicio: (ejercicio: Ejercicio) => Promise<void>;
  deleteEjercicio: (id: string) => Promise<void>;
  rutinas: Rutina[];
  addRutina: (rutina: Rutina) => Promise<void>;
  updateRutina: (rutina: Rutina) => Promise<void>;
  deleteRutina: (id: string) => Promise<void>;
  clearRutinaEjercicios: (rutinaId: string) => Promise<void>;
  moveRutinaToDay: (rutinaId: string, nuevoDia: number) => Promise<void>;
  toggleRutinaDescanso: (rutinaId: string, esDescanso?: boolean) => Promise<void>;
  ejerciciosRutina: EjercicioRutina[];
  addEjercicioRutina: (item: EjercicioRutina) => Promise<void>;
  updateEjercicioRutina: (item: EjercicioRutina) => Promise<void>;
  deleteEjercicioRutina: (id: string) => Promise<void>;
  fichasProgreso: FichaProgreso[];
  addFichaProgreso: (ficha: FichaProgreso) => Promise<void>;
  updateFichaProgreso: (ficha: FichaProgreso) => Promise<void>;
  deleteFichaProgreso: (id: string) => Promise<void>;
  assignBasePlanToAthlete: (athleteId: string, trainerId: string) => Promise<void>;
  copyRoutinesToAthlete: (sourceAthleteId: string, targetAthleteId: string, trainerId: string) => Promise<void>;
  ejerciciosRealizados: EjercicioRealizadoLog[];
  progresosParciales: Record<string, ProgresoParcialEjercicio>;
  guardarProgresoParcial: (id_ejercicio_rutina: string, series: SerieLograda[]) => void;
  registrarEjercicioCompleto: (log: EjercicioRealizadoLog) => void;
  reabrirEjercicioRealizado: (id_ejercicio_rutina: string) => void;
  limpiarProgresoEjercicio: (id_ejercicio_rutina: string) => void;
}

export interface SerieLograda {
  numero_serie: number;
  peso_kg: number;
  reps: number;
  rpe: number;
  timestamp: string;
}

export interface EjercicioRealizadoLog {
  id: string;
  id_cliente: string;
  id_rutina: string;
  id_ejercicio_rutina: string;
  id_ejercicio: string;
  nombre_ejercicio: string;
  grupo_muscular?: string;
  fecha: string;
  series: SerieLograda[];
  total_series_objetivo: number;
  completado: boolean;
  completado_at: string;
}

export interface ProgresoParcialEjercicio {
  id_ejercicio_rutina: string;
  series: SerieLograda[];
  proxima_serie: number;
  ultima_actualizacion: string;
}

function cleanObject<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

const mockUsuarios: Usuario[] = [
  { id: 'admin1', nombre: 'Admin GymBro', dni: '12345678', whatsapp: '999999999', fecha_nacimiento: '1990-01-01', sexo: 'masculino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'admin' },
  { id: 'entrenador1', nombre: 'Coach Roberto', dni: '87654321', whatsapp: '988888888', fecha_nacimiento: '1985-05-15', sexo: 'masculino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'entrenador' },
  { id: 'u1', nombre: 'Xiomara Ballón', dni: '10101010', whatsapp: '977777777', fecha_nacimiento: '1998-03-20', sexo: 'femenino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'cliente', id_entrenador: 'entrenador1' },
];

const mockEjercicios: Ejercicio[] = [
  // Día 1: Tren Superior (A)
  { id: 'e_jalon_pecho', nombre: 'Jalón al Pecho (Polea)', grupo_muscular: 'Espalda', instrucciones: 'Sentada, espalda recta con ligera inclinación, barra al pecho contrayendo dorsales.' },
  { id: 'e_press_banca_manc', nombre: 'Press de Banca con Mancuernas', grupo_muscular: 'Pecho', instrucciones: 'Banco plano, retracción escapular y empuje vertical controlado.' },
  { id: 'e_remo_manc_1mano', nombre: 'Remo con Mancuerna a una Mano', grupo_muscular: 'Espalda', instrucciones: 'Apoyo en banco, traccionar mancuerna hacia la cadera apretando dorsal.' },
  { id: 'e_press_militar_sent', nombre: 'Press Militar Sentada (Mancuernas)', grupo_muscular: 'Hombros', instrucciones: 'Respaldo a 80°, empuje vertical sin arquear la zona lumbar.' },
  { id: 'e_ext_triceps_pol', nombre: 'Extensiones de Tríceps en Polea', grupo_muscular: 'Tríceps', instrucciones: 'Cuerda o barra recta, mantener codos fijos pegados al torso.' },
  { id: 'e_plancha_frontal', nombre: 'Plancha Frontal (Abdomen)', grupo_muscular: 'Core / Abdomen', instrucciones: 'Apoyo en antebrazos, cuerpo en línea recta y abdomen activo.' },

  // Día 2: Tren Inferior (A)
  { id: 'e_sentadilla_goblet', nombre: 'Sentadilla Goblet (con Mancuerna)', grupo_muscular: 'Piernas / Cuádriceps', instrucciones: 'Mancuerna al pecho, baja la cadera manteniendo el torso firme.' },
  { id: 'e_prensa_piernas', nombre: 'Prensa de Piernas', grupo_muscular: 'Piernas / Cuádriceps', instrucciones: 'Pies al ancho de hombros, bajar controlado sin despegar la espalda baja.' },
  { id: 'e_peso_muerto_rumano', nombre: 'Peso Muerto Rumano (Mancuernas)', grupo_muscular: 'Piernas / Isquios', instrucciones: 'Mancuernas deslizando por las piernas, empujar la cadera atrás.' },
  { id: 'e_ext_cuadriceps_maq', nombre: 'Extensiones de Cuádriceps en Máquina', grupo_muscular: 'Piernas / Cuádriceps', instrucciones: 'Sentada, extender rodillas pausando 1s arriba y bajando en 3s.' },
  { id: 'e_puente_gluteo', nombre: 'Puente de Glúteo (con Disco/Barra)', grupo_muscular: 'Glúteos', instrucciones: 'Boca arriba, apoyar talones, elevar cadera y contraer glúteos arriba.' },
  { id: 'e_elev_talones_pie', nombre: 'Elevación de Talones de Pie', grupo_muscular: 'Piernas / Gemelos', instrucciones: 'Elevar talones sobre un escalón pausando arriba y estirando abajo.' },

  // Día 3: Full Body - Fuerza, Glúteos y Core
  { id: 'e_hip_thrust_d3', nombre: 'Hip Thrust con Barra en Banco', grupo_muscular: 'Glúteos', instrucciones: 'Espalda en banco a la altura de escápulas, empuje explosivo de talones y bloqueo arriba.' },
  { id: 'e_jalon_neutro', nombre: 'Jalón al Pecho (Agarre Neutro)', grupo_muscular: 'Espalda', instrucciones: 'Agarre neutro estrecho, tracción al pecho enfocando el dorsal medio y bajo.' },
  { id: 'e_prensa_pies_altos', nombre: 'Prensa de Piernas (Pies Altos)', grupo_muscular: 'Piernas / Glúteo e Isquios', instrucciones: 'Pies en la parte superior de la plataforma para mayor activación de glúteos e isquiotibiales.' },
  { id: 'e_elev_laterales_hombro', nombre: 'Elevaciones Laterales de Hombro', grupo_muscular: 'Hombros', instrucciones: 'Mancuernas a los lados con codos ligeramente flexionados a la altura de hombros.' },
  { id: 'e_abductores_maq', nombre: 'Abductores en Máquina', grupo_muscular: 'Glúteos / Cadera', instrucciones: 'Torso ligeramente inclinado al frente, apertura amplia y control en la vuelta.' },
  { id: 'e_crunch_abdominal_pol', nombre: 'Crunch Abdominal en Polea', grupo_muscular: 'Core / Abdomen', instrucciones: 'De rodillas, sujetar la cuerda junto a las orejas y flexionar la columna.' },

  // Día 4: Tren Superior (B)
  { id: 'e_remo_polea_baja', nombre: 'Remo en Polea Baja (Agarre Gironda)', grupo_muscular: 'Espalda', instrucciones: 'Tracción al abdomen bajo, apretar escápulas sin balancear el torso.' },
  { id: 'e_press_inclinado_manc', nombre: 'Press Inclinado con Mancuernas', grupo_muscular: 'Pecho', instrucciones: 'Banco a 30-45°, empuje enfocado en la porción clavicular del pectoral.' },
  { id: 'e_pullover_polea_alta', nombre: 'Pull-over en Polea Alta (Brazos Rectos)', grupo_muscular: 'Espalda', instrucciones: 'Brazos casi rectos, llevar la barra hacia los muslos sintiendo el dorsal.' },
  { id: 'e_face_pulls', nombre: 'Face Pulls en Polea', grupo_muscular: 'Hombros / Postural', instrucciones: 'Cuerda a la altura de la cara, abrir codos hacia afuera y atrás rotando externamente.' },
  { id: 'e_curl_biceps_ez', nombre: 'Curl de Bíceps con Barra EZ', grupo_muscular: 'Brazos / Bíceps', instrucciones: 'Flexionar codos manteniendo la tensión constante, sin usar impulso.' },
  { id: 'e_elev_piernas', nombre: 'Elevaciones de Piernas (Abdomen)', grupo_muscular: 'Core / Abdomen', instrucciones: 'Elevar piernas manteniendo la pelvis retrovertida para máxima tensión abdominal.' },

  // Día 5: Tren Inferior (B)
  { id: 'e_hip_thrust_barra', nombre: 'Hip Thrust con Barra', grupo_muscular: 'Glúteos', instrucciones: 'Espalda apoyada en banco a la altura de escápulas, empuje explosivo de talones.' },
  { id: 'e_lunges_caminando', nombre: 'Zancadas (Lunges) Caminando', grupo_muscular: 'Piernas / Glúteos', instrucciones: 'Paso largo, flexionar rodilla trasera a 90° sin tocar el piso.' },
  { id: 'e_curl_femoral', nombre: 'Curl Femoral Tumbada o Sentada', grupo_muscular: 'Piernas / Isquios', instrucciones: 'Flexionar rodillas llevando los talones al glúteo, descender en 3 segundos.' },
  { id: 'e_sentadilla_bulgara', nombre: 'Sentadilla Búlgara con Mancuernas', grupo_muscular: 'Piernas / Glúteos', instrucciones: 'Pie trasero apoyado en banco, descenso vertical controlando la rodilla delantera.' },
  { id: 'e_plancha_lateral', nombre: 'Plancha Lateral con Elevación de Pierna', grupo_muscular: 'Core / Oblicuos', instrucciones: 'Cuerpo alineado sobre antebrazo, cadera arriba y pierna superior extendida.' },
];

const mockRutinas: Rutina[] = [
  { id: 'r1', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Tren Superior (A) - Empuje y Tirón Vertical', dia_semana: 1, es_descanso: false },
  { id: 'r2', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Tren Inferior (A) - Cuádriceps y Glúteo', dia_semana: 2, es_descanso: false },
  { id: 'r3', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Full Body - Fuerza, Glúteos y Core', dia_semana: 3, es_descanso: false },
  { id: 'r4', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Tren Superior (B) - Tirón Horizontal y Hombros', dia_semana: 4, es_descanso: false },
  { id: 'r5', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Tren Inferior (B) - Cadena Posterior y Unilaterales', dia_semana: 5, es_descanso: false },
];

const mockEjerciciosRutina: EjercicioRutina[] = [
  // Día 1 (r1)
  { id: 'er_d1_1', id_rutina: 'r1', id_ejercicio: 'e_jalon_pecho', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d1_2', id_rutina: 'r1', id_ejercicio: 'e_press_banca_manc', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d1_3', id_rutina: 'r1', id_ejercicio: 'e_remo_manc_1mano', series_objetivo: 3, reps_objetivo: '12', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d1_4', id_rutina: 'r1', id_ejercicio: 'e_press_militar_sent', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d1_5', id_rutina: 'r1', id_ejercicio: 'e_ext_triceps_pol', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },
  { id: 'er_d1_6', id_rutina: 'r1', id_ejercicio: 'e_plancha_frontal', series_objetivo: 3, reps_objetivo: 'Al fallo técnico', tempo: '-', descanso_segundos: 45, rpe_objetivo: 10 },

  // Día 2 (r2)
  { id: 'er_d2_1', id_rutina: 'r2', id_ejercicio: 'e_sentadilla_goblet', series_objetivo: 4, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 120, rpe_objetivo: 8 },
  { id: 'er_d2_2', id_rutina: 'r2', id_ejercicio: 'e_prensa_piernas', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d2_3', id_rutina: 'r2', id_ejercicio: 'e_peso_muerto_rumano', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d2_4', id_rutina: 'r2', id_ejercicio: 'e_ext_cuadriceps_maq', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d2_5', id_rutina: 'r2', id_ejercicio: 'e_puente_gluteo', series_objetivo: 3, reps_objetivo: '15-20', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d2_6', id_rutina: 'r2', id_ejercicio: 'e_elev_talones_pie', series_objetivo: 3, reps_objetivo: '15-20', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },

  // Día 3 (r3) - Full Body activo
  { id: 'er_d3_1', id_rutina: 'r3', id_ejercicio: 'e_hip_thrust_d3', series_objetivo: 4, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 120, rpe_objetivo: 8 },
  { id: 'er_d3_2', id_rutina: 'r3', id_ejercicio: 'e_jalon_neutro', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d3_3', id_rutina: 'r3', id_ejercicio: 'e_prensa_pies_altos', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d3_4', id_rutina: 'r3', id_ejercicio: 'e_elev_laterales_hombro', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d3_5', id_rutina: 'r3', id_ejercicio: 'e_abductores_maq', series_objetivo: 3, reps_objetivo: '15-20', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },
  { id: 'er_d3_6', id_rutina: 'r3', id_ejercicio: 'e_crunch_abdominal_pol', series_objetivo: 3, reps_objetivo: '15-20', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },

  // Día 4 (r4)
  { id: 'er_d4_1', id_rutina: 'r4', id_ejercicio: 'e_remo_polea_baja', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d4_2', id_rutina: 'r4', id_ejercicio: 'e_press_inclinado_manc', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d4_3', id_rutina: 'r4', id_ejercicio: 'e_pullover_polea_alta', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d4_4', id_rutina: 'r4', id_ejercicio: 'e_face_pulls', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d4_5', id_rutina: 'r4', id_ejercicio: 'e_curl_biceps_ez', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },
  { id: 'er_d4_6', id_rutina: 'r4', id_ejercicio: 'e_elev_piernas', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },

  // Día 5 (r5)
  { id: 'er_d5_1', id_rutina: 'r5', id_ejercicio: 'e_hip_thrust_barra', series_objetivo: 4, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 120, rpe_objetivo: 8 },
  { id: 'er_d5_2', id_rutina: 'r5', id_ejercicio: 'e_lunges_caminando', series_objetivo: 3, reps_objetivo: '12/pierna', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d5_3', id_rutina: 'r5', id_ejercicio: 'e_curl_femoral', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_d5_4', id_rutina: 'r5', id_ejercicio: 'e_sentadilla_bulgara', series_objetivo: 3, reps_objetivo: '10-12/pierna', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_d5_5', id_rutina: 'r5', id_ejercicio: 'e_plancha_lateral', series_objetivo: 3, reps_objetivo: '30-45s/lado', tempo: '-', descanso_segundos: 45, rpe_objetivo: 8 },
];

const mockPlanNutricion: PlanNutricion = {
  id: 'pn_xb_1',
  id_cliente: 'xb-9988-fit',
  calorias_meta: 1600,
  proteinas_g: 120,
  carbohidratos_g: 160,
  grasas_g: 53,
  agua_litros: 2.5,
  pasos_meta: 10000
};

const mockFichasProgreso: FichaProgreso[] = [
  {
    id: 'fp_xb_1',
    id_cliente: 'xb-9988-fit',
    id_entrenador: 'entrenador1',
    fecha_inicio: '2026-09-01',
    fecha_chequeo: '2026-09-15',
    peso_kg: 62.5,
    altura_cm: 165,
    grasa_porcentaje: 22.5,
    musculo_porcentaje: 31.0,
    pecho_cm: 88,
    cintura_cm: 68,
    cadera_cm: 96,
    brazo_cm: 28,
    muslo_cm: 54,
    pantorrilla_cm: 34,
    objetivo_principal: 'Pérdida de grasa y tonificación (Déficit moderado)',
    nivel: 'Intermedio',
    adherencia_porcentaje: 95,
    notas_entrenador: 'Excelente técnica y adherencia al plan. Próximo chequeo con medidas y fotos de control.',
    fecha_actualizacion: '2026-09-01'
  }
];

// Local storage keys
const USERS_STORAGE_KEY = 'gymbro_usuarios_data';
const CURRENT_USER_KEY = 'gymbro_current_user_data';
const SAVED_USER_ID_KEY = 'gymbro_current_user_id';
const EJERCICIOS_STORAGE_KEY = 'gymbro_ejercicios_data';
const RUTINAS_STORAGE_KEY = 'gymbro_rutinas_data';
const EJERCICIOS_RUTINA_STORAGE_KEY = 'gymbro_ejercicios_rutina_data';
const PLAN_NUTRICION_STORAGE_KEY = 'gymbro_plan_nutricion_data';
const FICHAS_PROGRESO_STORAGE_KEY = 'gymbro_fichas_progreso_data';
const THEME_MODE_STORAGE_KEY = 'gymbro_theme_mode';
const ACCENT_COLOR_STORAGE_KEY = 'gymbro_accent_color';
const EJERCICIOS_REALIZADOS_KEY = 'gymbro_ejercicios_realizados_v1';
const PROGRESOS_PARCIALES_KEY = 'gymbro_progresos_parciales_v1';

export const getUserAccentKey = (userId: string) => `gymbro_user_accent_${userId}`;
export const getUserThemeKey = (userId: string) => `gymbro_user_theme_${userId}`;

export function getUserAccentColor(user?: Usuario | null): string {
  if (!user) return '#4D7CFE';
  if (user.color_acento) return user.color_acento;
  return getStoredItem<string>(getUserAccentKey(user.id), '#4D7CFE');
}

export function getUserThemeMode(user?: Usuario | null): 'light' | 'dark' {
  if (!user) return 'light';
  if (user.modo_tema) return user.modo_tema;
  return getStoredItem<'light' | 'dark'>(getUserThemeKey(user.id), 'light');
}

export function applyThemeToDocument(theme: 'light' | 'dark', accent: string) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.body.classList.remove('dark');
  }
  root.style.setProperty('--color-accent-blue', accent);
  root.style.setProperty('--user-accent-color', accent);
}

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage:`, e);
  }
}

export interface DiaSemanaMeta {
  numero: number; // 1 = Lunes, ..., 6 = Sábado, 0 = Domingo
  nombre: string;
  corto: string;
}

export const DIAS_DE_LA_SEMANA: DiaSemanaMeta[] = [
  { numero: 1, nombre: 'Lunes', corto: 'Lun' },
  { numero: 2, nombre: 'Martes', corto: 'Mar' },
  { numero: 3, nombre: 'Miércoles', corto: 'Mié' },
  { numero: 4, nombre: 'Jueves', corto: 'Jue' },
  { numero: 5, nombre: 'Viernes', corto: 'Vie' },
  { numero: 6, nombre: 'Sábado', corto: 'Sáb' },
  { numero: 0, nombre: 'Domingo', corto: 'Dom' },
];

export function getDiaSemanaNombre(dia: number): string {
  const found = DIAS_DE_LA_SEMANA.find((d) => d.numero === dia);
  return found ? found.nombre : `Día ${dia}`;
}

export function getDiaSemanaCorto(dia: number): string {
  const found = DIAS_DE_LA_SEMANA.find((d) => d.numero === dia);
  return found ? found.corto : `D${dia}`;
}

export function isRutinaDescanso(r?: Rutina | null): boolean {
  if (!r) return true;
  if (r.es_descanso === true) return true;
  if (r.nombre_sesion && r.nombre_sesion.toLowerCase().includes('descanso')) return true;
  return false;
}

export function isXiomaraBallon(user?: { id?: string; dni?: string; nombre?: string } | null): boolean {
  if (!user) return false;
  const id = (user.id || '').toLowerCase();
  const dni = (user.dni || '').trim();
  const nombre = (user.nombre || '').toLowerCase();
  return (
    id === 'u1' ||
    id === 'xb-9988-fit' ||
    id === 'cliente1' ||
    dni === '10101010' ||
    dni === '11111111' ||
    nombre.includes('xiomara')
  );
}

export function getClientRoutines(rutinas: Rutina[], currentUser?: Usuario | null): Rutina[] {
  if (!rutinas || rutinas.length === 0) return mockRutinas;

  // Filter for matching client
  let matched: Rutina[] = [];

  if (!currentUser) {
    matched = rutinas;
  } else if (isXiomaraBallon(currentUser)) {
    // For Xiomara Ballón: include all routines configured for her by the trainer
    const u1Routines = rutinas.filter((r) => r.id_cliente === 'u1');
    if (u1Routines.length > 0) {
      matched = u1Routines;
    } else {
      matched = rutinas.filter(
        (r) =>
          r.id_cliente === currentUser.id ||
          r.id_cliente === 'xb-9988-fit' ||
          r.id_cliente === 'u1' ||
          !r.id_cliente
      );
    }
  } else {
    matched = rutinas.filter((r) => r.id_cliente === currentUser.id);
  }

  // If nothing matched, use all rutinas
  if (matched.length === 0) {
    matched = rutinas;
  }

  // Deduplicate strictly by day of week: at most ONE routine per day, max 7 days, no repeating days
  const dayMap = new Map<number, Rutina>();
  matched.forEach((r) => {
    if (r && typeof r.dia_semana === 'number') {
      if (!dayMap.has(r.dia_semana)) {
        dayMap.set(r.dia_semana, r);
      } else {
        const existing = dayMap.get(r.dia_semana);
        // If current routine explicitly belongs to client and existing doesn't, prefer it
        if (r.id_cliente && !existing?.id_cliente) {
          dayMap.set(r.dia_semana, r);
        }
      }
    }
  });

  const dayOrderMap: { [key: number]: number } = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 0: 7 };
  const sorted = Array.from(dayMap.values()).sort((a, b) => {
    const orderA = dayOrderMap[a.dia_semana] ?? 99;
    const orderB = dayOrderMap[b.dia_semana] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.nombre_sesion || '').localeCompare(b.nombre_sesion || '');
  }).slice(0, 7);
  return sorted.length > 0 ? sorted : mockRutinas;
}

export function getClientActiveRoutines(rutinas: Rutina[], currentUser?: Usuario | null): Rutina[] {
  const all = getClientRoutines(rutinas, currentUser);
  return all.filter((r) => !isRutinaDescanso(r) && !r.es_descanso);
}

function mergeWithMock<T extends { id: string }>(stored: T[], mock: T[]): T[] {
  const map = new Map<string, T>();
  mock.forEach((item) => map.set(item.id, item));
  stored.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

// Initial state: If a user was previously logged in, apply their individual color & theme mode. Otherwise neutral default.
const initialUsuarios = mergeWithMock(getStoredItem<Usuario[]>(USERS_STORAGE_KEY, mockUsuarios), mockUsuarios);
const initialCurrentUser = getStoredItem<Usuario | null>(CURRENT_USER_KEY, null);

const initialThemeMode = initialCurrentUser ? getUserThemeMode(initialCurrentUser) : 'light';
const initialAccentColor = initialCurrentUser ? getUserAccentColor(initialCurrentUser) : '#4D7CFE';

// Apply immediately on module load
applyThemeToDocument(initialThemeMode, initialAccentColor);

const initialEjercicios = mergeWithMock(getStoredItem<Ejercicio[]>(EJERCICIOS_STORAGE_KEY, mockEjercicios), mockEjercicios);
const initialRutinas = mergeWithMock(getStoredItem<Rutina[]>(RUTINAS_STORAGE_KEY, mockRutinas), mockRutinas);
const initialEjerciciosRutina = mergeWithMock(getStoredItem<EjercicioRutina[]>(EJERCICIOS_RUTINA_STORAGE_KEY, mockEjerciciosRutina), mockEjerciciosRutina);
const initialPlanNutricion = getStoredItem<PlanNutricion>(PLAN_NUTRICION_STORAGE_KEY, mockPlanNutricion);
const initialFichasProgreso = mergeWithMock(getStoredItem<FichaProgreso[]>(FICHAS_PROGRESO_STORAGE_KEY, mockFichasProgreso), mockFichasProgreso);

export const useStore = create<AppState>((set, get) => ({
  isCloudReady: false,
  themeMode: initialThemeMode,
  accentColor: initialAccentColor,
  setThemeMode: (mode) => {
    setStoredItem(THEME_MODE_STORAGE_KEY, mode);
    applyThemeToDocument(mode, get().accentColor);
    set({ themeMode: mode });

    // Persist individually for currently logged in user
    const currentUser = get().currentUser;
    if (currentUser) {
      setStoredItem(getUserThemeKey(currentUser.id), mode);
      const updatedUser: Usuario = { ...currentUser, modo_tema: mode };
      const updatedList = get().usuarios.map((u) => (u.id === currentUser.id ? updatedUser : u));
      set({ currentUser: updatedUser, usuarios: updatedList });
      setStoredItem(CURRENT_USER_KEY, updatedUser);
      setStoredItem(USERS_STORAGE_KEY, updatedList);

      setDoc(doc(db, 'usuarios', currentUser.id), { modo_tema: mode }, { merge: true }).catch((err) => {
        console.warn('Error saving individual theme mode to Firestore:', err);
      });
    }
  },
  setAccentColor: (color) => {
    setStoredItem(ACCENT_COLOR_STORAGE_KEY, color);
    applyThemeToDocument(get().themeMode, color);
    set({ accentColor: color });

    // Persist individually for currently logged in user
    const currentUser = get().currentUser;
    if (currentUser) {
      setStoredItem(getUserAccentKey(currentUser.id), color);
      const updatedUser: Usuario = { ...currentUser, color_acento: color };
      const updatedList = get().usuarios.map((u) => (u.id === currentUser.id ? updatedUser : u));
      set({ currentUser: updatedUser, usuarios: updatedList });
      setStoredItem(CURRENT_USER_KEY, updatedUser);
      setStoredItem(USERS_STORAGE_KEY, updatedList);

      setDoc(doc(db, 'usuarios', currentUser.id), { color_acento: color }, { merge: true }).catch((err) => {
        console.warn('Error saving individual accent color to Firestore:', err);
      });
    }
  },
  currentRole: initialCurrentUser?.rol || 'cliente',
  setCurrentRole: (role) => set({ currentRole: role }),
  isLoggedIn: !!initialCurrentUser,
  currentUser: initialCurrentUser,
  usuarios: initialUsuarios,
  ejercicios: initialEjercicios,
  rutinas: initialRutinas,
  ejerciciosRutina: initialEjerciciosRutina,
  planNutricion: initialPlanNutricion,
  fichasProgreso: initialFichasProgreso,
  ejerciciosRealizados: getStoredItem<EjercicioRealizadoLog[]>(EJERCICIOS_REALIZADOS_KEY, []),
  progresosParciales: getStoredItem<Record<string, ProgresoParcialEjercicio>>(PROGRESOS_PARCIALES_KEY, {}),

  login: (dni, contrasena) => {
    const trimmedDni = dni.trim();
    const user = get().usuarios.find((u) => {
      const isDniMatch =
        u.dni.trim() === trimmedDni ||
        (trimmedDni === '11111111' && isXiomaraBallon(u)) ||
        (trimmedDni === '10101010' && isXiomaraBallon(u));
      return isDniMatch && u.contrasena === contrasena;
    });
    if (user) {
      if (user.estado_suscripcion === 'inactivo' && user.rol === 'cliente') {
        return { success: false, error: 'Cuenta inactiva por falta de pago.' };
      }

      // Automatically activate this individual user's chosen color & theme
      const userAccent = getUserAccentColor(user);
      const userTheme = getUserThemeMode(user);
      applyThemeToDocument(userTheme, userAccent);
      setStoredItem(THEME_MODE_STORAGE_KEY, userTheme);
      setStoredItem(ACCENT_COLOR_STORAGE_KEY, userAccent);

      setStoredItem(CURRENT_USER_KEY, user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVED_USER_ID_KEY, user.id);
      }
      set({ 
        isLoggedIn: true, 
        currentUser: user, 
        currentRole: user.rol,
        accentColor: userAccent,
        themeMode: userTheme
      });
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas.' };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVED_USER_ID_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    // Return to neutral default theme for login screen
    applyThemeToDocument('light', '#4D7CFE');
    setStoredItem(THEME_MODE_STORAGE_KEY, 'light');
    setStoredItem(ACCENT_COLOR_STORAGE_KEY, '#4D7CFE');

    set({ 
      isLoggedIn: false, 
      currentUser: null,
      accentColor: '#4D7CFE',
      themeMode: 'light'
    });
  },

  addUsuario: async (usuario) => {
    const updated = [...get().usuarios.filter(u => u.id !== usuario.id), usuario];
    set({ usuarios: updated });
    setStoredItem(USERS_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'usuarios', usuario.id), cleanObject(usuario));
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
    }
  },

  updateUsuario: async (updatedUsuario) => {
    const updatedList = get().usuarios.map(u => u.id === updatedUsuario.id ? updatedUsuario : u);
    const isCurrent = get().currentUser?.id === updatedUsuario.id;
    const updatedCurrent = isCurrent ? updatedUsuario : get().currentUser;
    
    // If editing currently logged in user, activate their colors if modified
    if (isCurrent) {
      if (updatedUsuario.color_acento) {
        setStoredItem(getUserAccentKey(updatedUsuario.id), updatedUsuario.color_acento);
        setStoredItem(ACCENT_COLOR_STORAGE_KEY, updatedUsuario.color_acento);
      }
      if (updatedUsuario.modo_tema) {
        setStoredItem(getUserThemeKey(updatedUsuario.id), updatedUsuario.modo_tema);
        setStoredItem(THEME_MODE_STORAGE_KEY, updatedUsuario.modo_tema);
      }
      const activeColor = updatedUsuario.color_acento || get().accentColor;
      const activeTheme = updatedUsuario.modo_tema || get().themeMode;
      applyThemeToDocument(activeTheme, activeColor);
      set({
        accentColor: activeColor,
        themeMode: activeTheme
      });
    }

    set({
      usuarios: updatedList,
      currentUser: updatedCurrent
    });
    setStoredItem(USERS_STORAGE_KEY, updatedList);
    if (updatedCurrent) {
      setStoredItem(CURRENT_USER_KEY, updatedCurrent);
    }
    try {
      await setDoc(doc(db, 'usuarios', updatedUsuario.id), cleanObject(updatedUsuario), { merge: true });
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
    }
  },

  deleteUsuario: async (id) => {
    const updatedList = get().usuarios.filter(u => u.id !== id);
    set({ usuarios: updatedList });
    setStoredItem(USERS_STORAGE_KEY, updatedList);
    try {
      await deleteDoc(doc(db, 'usuarios', id));
    } catch (err) {
      console.error('Error deleting user in Firestore:', err);
    }
  },

  updatePlanNutricion: async (plan) => {
    set({ planNutricion: plan });
    setStoredItem(PLAN_NUTRICION_STORAGE_KEY, plan);
    try {
      await setDoc(doc(db, 'planesNutricion', plan.id), cleanObject(plan), { merge: true });
    } catch (err) {
      console.error('Error saving nutrition plan to Firestore:', err);
    }
  },

  addEjercicio: async (ejercicio) => {
    const updated = [...get().ejercicios.filter(e => e.id !== ejercicio.id), ejercicio];
    set({ ejercicios: updated });
    setStoredItem(EJERCICIOS_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'ejercicios', ejercicio.id), cleanObject(ejercicio));
    } catch (err) {
      console.error('Error adding ejercicio to Firestore:', err);
    }
  },

  updateEjercicio: async (updatedEjercicio) => {
    const updated = get().ejercicios.map(e => e.id === updatedEjercicio.id ? updatedEjercicio : e);
    set({ ejercicios: updated });
    setStoredItem(EJERCICIOS_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'ejercicios', updatedEjercicio.id), cleanObject(updatedEjercicio), { merge: true });
    } catch (err) {
      console.error('Error updating ejercicio in Firestore:', err);
    }
  },

  deleteEjercicio: async (id) => {
    const updated = get().ejercicios.filter(e => e.id !== id);
    set({ ejercicios: updated });
    setStoredItem(EJERCICIOS_STORAGE_KEY, updated);
    try {
      await deleteDoc(doc(db, 'ejercicios', id));
    } catch (err) {
      console.error('Error deleting ejercicio from Firestore:', err);
    }
  },

  addRutina: async (rutina) => {
    const updated = [...get().rutinas.filter(r => r.id !== rutina.id), rutina];
    set({ rutinas: updated });
    setStoredItem(RUTINAS_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'rutinas', rutina.id), cleanObject(rutina));
    } catch (err) {
      console.error('Error adding rutina to Firestore:', err);
    }
  },

  updateRutina: async (updatedRutina) => {
    const updated = get().rutinas.map(r => r.id === updatedRutina.id ? updatedRutina : r);
    set({ rutinas: updated });
    setStoredItem(RUTINAS_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'rutinas', updatedRutina.id), cleanObject(updatedRutina), { merge: true });
    } catch (err) {
      console.error('Error updating rutina in Firestore:', err);
    }
  },

  deleteRutina: async (id) => {
    const updatedRutinas = get().rutinas.filter(r => r.id !== id);
    const relatedEjercicios = get().ejerciciosRutina.filter(er => er.id_rutina === id);
    const updatedErs = get().ejerciciosRutina.filter(er => er.id_rutina !== id);
    
    set({ rutinas: updatedRutinas, ejerciciosRutina: updatedErs });
    setStoredItem(RUTINAS_STORAGE_KEY, updatedRutinas);
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updatedErs);
    
    try {
      await deleteDoc(doc(db, 'rutinas', id));
      for (const er of relatedEjercicios) {
        await deleteDoc(doc(db, 'ejerciciosRutina', er.id));
      }
    } catch (err) {
      console.error('Error deleting rutina from Firestore:', err);
    }
  },

  clearRutinaEjercicios: async (rutinaId: string) => {
    const toDelete = get().ejerciciosRutina.filter((er) => er.id_rutina === rutinaId);
    const updatedErs = get().ejerciciosRutina.filter((er) => er.id_rutina !== rutinaId);

    set({ ejerciciosRutina: updatedErs });
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updatedErs);

    try {
      for (const item of toDelete) {
        await deleteDoc(doc(db, 'ejerciciosRutina', item.id));
      }
    } catch (err) {
      console.error('Error clearing ejercicios from Firestore:', err);
    }
  },

  moveRutinaToDay: async (rutinaId: string, nuevoDia: number) => {
    const current = get().rutinas.find((r) => r.id === rutinaId);
    if (!current) return;

    // Check if another routine of the same client already occupies nuevoDia
    const occupying = get().rutinas.find(
      (r) => r.id_cliente === current.id_cliente && r.dia_semana === nuevoDia && r.id !== rutinaId
    );

    const oldDia = current.dia_semana;
    const updatedRutinas = get().rutinas.map((r) => {
      if (r.id === rutinaId) {
        return { ...r, dia_semana: nuevoDia };
      }
      if (occupying && r.id === occupying.id) {
        // Swap days
        return { ...r, dia_semana: oldDia };
      }
      return r;
    });

    set({ rutinas: updatedRutinas });
    setStoredItem(RUTINAS_STORAGE_KEY, updatedRutinas);

    try {
      await setDoc(doc(db, 'rutinas', rutinaId), { dia_semana: nuevoDia }, { merge: true });
      if (occupying) {
        await setDoc(doc(db, 'rutinas', occupying.id), { dia_semana: oldDia }, { merge: true });
      }
    } catch (err) {
      console.error('Error moving rutina to day in Firestore:', err);
    }
  },

  toggleRutinaDescanso: async (rutinaId: string, esDescanso?: boolean) => {
    const currentRutina = get().rutinas.find((r) => r.id === rutinaId);
    const targetDescanso = esDescanso !== undefined ? esDescanso : !currentRutina?.es_descanso;
    const updatedRutinas = get().rutinas.map((r) =>
      r.id === rutinaId ? { ...r, es_descanso: targetDescanso } : r
    );
    set({ rutinas: updatedRutinas });
    setStoredItem(RUTINAS_STORAGE_KEY, updatedRutinas);

    try {
      await setDoc(doc(db, 'rutinas', rutinaId), { es_descanso: targetDescanso }, { merge: true });
    } catch (err) {
      console.error('Error toggling rutina descanso in Firestore:', err);
    }
  },

  addEjercicioRutina: async (item) => {
    // Guard against duplicate exercises in the same routine
    const existingInSameRoutine = get().ejerciciosRutina.find(
      (er) => er.id_rutina === item.id_rutina && er.id_ejercicio === item.id_ejercicio && er.id !== item.id
    );
    if (existingInSameRoutine) {
      console.warn(`Prevented duplicate exercise ${item.id_ejercicio} in routine ${item.id_rutina}`);
      return;
    }
    const updated = [...get().ejerciciosRutina.filter(er => er.id !== item.id), item];
    set({ ejerciciosRutina: updated });
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'ejerciciosRutina', item.id), cleanObject(item));
    } catch (err) {
      console.error('Error adding ejercicio rutina to Firestore:', err);
    }
  },

  updateEjercicioRutina: async (item) => {
    const updated = get().ejerciciosRutina.map(er => er.id === item.id ? item : er);
    set({ ejerciciosRutina: updated });
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'ejerciciosRutina', item.id), cleanObject(item), { merge: true });
    } catch (err) {
      console.error('Error updating ejercicio rutina in Firestore:', err);
    }
  },

  deleteEjercicioRutina: async (id) => {
    const updated = get().ejerciciosRutina.filter(er => er.id !== id);
    set({ ejerciciosRutina: updated });
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updated);
    try {
      await deleteDoc(doc(db, 'ejerciciosRutina', id));
    } catch (err) {
      console.error('Error deleting ejercicio rutina from Firestore:', err);
    }
  },

  addFichaProgreso: async (ficha) => {
    const updated = [...get().fichasProgreso.filter(f => f.id !== ficha.id), ficha];
    set({ fichasProgreso: updated });
    setStoredItem(FICHAS_PROGRESO_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'fichasProgreso', ficha.id), cleanObject(ficha));
    } catch (err) {
      console.error('Error adding ficha progreso to Firestore:', err);
    }
  },

  updateFichaProgreso: async (ficha) => {
    const updated = get().fichasProgreso.map(f => f.id === ficha.id ? ficha : f);
    set({ fichasProgreso: updated });
    setStoredItem(FICHAS_PROGRESO_STORAGE_KEY, updated);
    try {
      await setDoc(doc(db, 'fichasProgreso', ficha.id), cleanObject(ficha), { merge: true });
    } catch (err) {
      console.error('Error updating ficha progreso in Firestore:', err);
    }
  },

  deleteFichaProgreso: async (id) => {
    const updated = get().fichasProgreso.filter(f => f.id !== id);
    set({ fichasProgreso: updated });
    setStoredItem(FICHAS_PROGRESO_STORAGE_KEY, updated);
    try {
      await deleteDoc(doc(db, 'fichasProgreso', id));
    } catch (err) {
      console.error('Error deleting ficha progreso from Firestore:', err);
    }
  },

  assignBasePlanToAthlete: async (athleteId: string, trainerId: string) => {
    const baseRoutines = [
      { idSuffix: 'd1', nombre: 'Tren Superior (A) - Empuje y Tirón Vertical', dia: 1, baseId: 'r1' },
      { idSuffix: 'd2', nombre: 'Tren Inferior (A) - Cuádriceps y Glúteo', dia: 2, baseId: 'r2' },
      { idSuffix: 'd3', nombre: 'Full Body - Fuerza, Glúteos y Core', dia: 3, baseId: 'r3' },
      { idSuffix: 'd4', nombre: 'Tren Superior (B) - Tirón Horizontal y Hombros', dia: 4, baseId: 'r4' },
      { idSuffix: 'd5', nombre: 'Tren Inferior (B) - Cadena Posterior y Unilaterales', dia: 5, baseId: 'r5' },
    ];

    const newRoutines: Rutina[] = [];
    const newErs: EjercicioRutina[] = [];
    const currentErs = get().ejerciciosRutina.length > 0 ? get().ejerciciosRutina : mockEjerciciosRutina;

    const batch = writeBatch(db);

    for (const br of baseRoutines) {
      const routineId = `r_${athleteId}_${br.idSuffix}_${Date.now()}`;
      const rItem: Rutina = {
        id: routineId,
        id_cliente: athleteId,
        id_entrenador: trainerId || 'entrenador1',
        nombre_sesion: br.nombre,
        dia_semana: br.dia,
        es_descanso: false,
      };
      newRoutines.push(rItem);
      batch.set(doc(db, 'rutinas', routineId), cleanObject(rItem));

      const sourceExercises = currentErs.filter((er) => er.id_rutina === br.baseId);
      const fallbackExercises = mockEjerciciosRutina.filter((er) => er.id_rutina === br.baseId);
      const exToCopy = sourceExercises.length > 0 ? sourceExercises : fallbackExercises;

      exToCopy.forEach((er, idx) => {
        const erId = `er_${routineId}_${idx + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const erItem: EjercicioRutina = {
          id: erId,
          id_rutina: routineId,
          id_ejercicio: er.id_ejercicio,
          series_objetivo: er.series_objetivo || 3,
          reps_objetivo: er.reps_objetivo || '10-12',
          tempo: er.tempo || '3-0-1-0',
          descanso_segundos: er.descanso_segundos || 90,
          rpe_objetivo: er.rpe_objetivo || 8,
        };
        newErs.push(erItem);
        batch.set(doc(db, 'ejerciciosRutina', erId), cleanObject(erItem));
      });
    }

    const updatedRuts = [...get().rutinas, ...newRoutines];
    const updatedErs = [...get().ejerciciosRutina, ...newErs];

    set({ rutinas: updatedRuts, ejerciciosRutina: updatedErs });
    setStoredItem(RUTINAS_STORAGE_KEY, updatedRuts);
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updatedErs);

    try {
      await batch.commit();
    } catch (e) {
      console.error('Error committing assigned routines to Firestore:', e);
    }
  },

  copyRoutinesToAthlete: async (sourceAthleteId: string, targetAthleteId: string, trainerId: string) => {
    const sourceRoutines = get().rutinas.filter((r) => r.id_cliente === sourceAthleteId);
    if (sourceRoutines.length === 0) return;

    const newRoutines: Rutina[] = [];
    const newErs: EjercicioRutina[] = [];
    const currentErs = get().ejerciciosRutina;

    const batch = writeBatch(db);

    for (const sr of sourceRoutines) {
      const routineId = `r_${targetAthleteId}_${sr.dia_semana}_${Date.now()}`;
      const rItem: Rutina = {
        id: routineId,
        id_cliente: targetAthleteId,
        id_entrenador: trainerId || 'entrenador1',
        nombre_sesion: sr.nombre_sesion,
        dia_semana: sr.dia_semana,
      };
      newRoutines.push(rItem);
      batch.set(doc(db, 'rutinas', routineId), cleanObject(rItem));

      const sourceExercises = currentErs.filter((er) => er.id_rutina === sr.id);
      sourceExercises.forEach((er, idx) => {
        const erId = `er_${routineId}_${idx + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const erItem: EjercicioRutina = {
          id: erId,
          id_rutina: routineId,
          id_ejercicio: er.id_ejercicio,
          series_objetivo: er.series_objetivo || 3,
          reps_objetivo: er.reps_objetivo || '10-12',
          tempo: er.tempo || '3-0-1-0',
          descanso_segundos: er.descanso_segundos || 90,
          rpe_objetivo: er.rpe_objetivo || 8,
        };
        newErs.push(erItem);
        batch.set(doc(db, 'ejerciciosRutina', erId), cleanObject(erItem));
      });
    }

    const updatedRuts = [...get().rutinas, ...newRoutines];
    const updatedErs = [...get().ejerciciosRutina, ...newErs];

    set({ rutinas: updatedRuts, ejerciciosRutina: updatedErs });
    setStoredItem(RUTINAS_STORAGE_KEY, updatedRuts);
    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, updatedErs);

    try {
      await batch.commit();
    } catch (e) {
      console.error('Error copying routines to Firestore:', e);
    }
  },

  guardarProgresoParcial: (id_ejercicio_rutina, series) => {
    const nextSet = series.length + 1;
    const updated = {
      ...get().progresosParciales,
      [id_ejercicio_rutina]: {
        id_ejercicio_rutina,
        series,
        proxima_serie: nextSet,
        ultima_actualizacion: new Date().toISOString(),
      },
    };
    set({ progresosParciales: updated });
    setStoredItem(PROGRESOS_PARCIALES_KEY, updated);
  },

  registrarEjercicioCompleto: (log) => {
    const existing = get().ejerciciosRealizados.filter(
      (e) => e.id !== log.id && e.id_ejercicio_rutina !== log.id_ejercicio_rutina
    );
    const updated = [log, ...existing];
    const nextParciales = { ...get().progresosParciales };
    delete nextParciales[log.id_ejercicio_rutina];

    set({ ejerciciosRealizados: updated, progresosParciales: nextParciales });
    setStoredItem(EJERCICIOS_REALIZADOS_KEY, updated);
    setStoredItem(PROGRESOS_PARCIALES_KEY, nextParciales);
  },

  reabrirEjercicioRealizado: (id_ejercicio_rutina) => {
    const updated = get().ejerciciosRealizados.filter((e) => e.id_ejercicio_rutina !== id_ejercicio_rutina);
    set({ ejerciciosRealizados: updated });
    setStoredItem(EJERCICIOS_REALIZADOS_KEY, updated);
  },

  limpiarProgresoEjercicio: (id_ejercicio_rutina) => {
    const nextParciales = { ...get().progresosParciales };
    delete nextParciales[id_ejercicio_rutina];
    set({ progresosParciales: nextParciales });
    setStoredItem(PROGRESOS_PARCIALES_KEY, nextParciales);
  },
}));

// Setup Firestore real-time synchronization
// Strictly respects user changes in the cloud and keeps local storage updated
export function initFirestoreSync() {
  // 1. Usuarios listener - cloud is source of truth, updates local storage
  onSnapshot(collection(db, 'usuarios'), async (snapshot) => {
    if (!snapshot.empty) {
      const users: Usuario[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data() } as Usuario);
      });
      
      // Update store and local storage
      setStoredItem(USERS_STORAGE_KEY, users);
      
      useStore.setState((state) => {
        let updatedCurrentUser = state.currentUser;
        let newAccent = state.accentColor;
        let newTheme = state.themeMode;

        if (state.currentUser) {
          const fresh = users.find(
            (u) =>
              u.id === state.currentUser?.id ||
              (isXiomaraBallon(state.currentUser) && isXiomaraBallon(u))
          );
          if (fresh) {
            updatedCurrentUser = fresh;
            setStoredItem(CURRENT_USER_KEY, fresh);
            if (typeof window !== 'undefined') {
              localStorage.setItem(SAVED_USER_ID_KEY, fresh.id);
            }
            const freshAccent = getUserAccentColor(fresh);
            const freshTheme = getUserThemeMode(fresh);
            if (freshAccent !== state.accentColor || freshTheme !== state.themeMode) {
              newAccent = freshAccent;
              newTheme = freshTheme;
              applyThemeToDocument(newTheme, newAccent);
            }
          }
        } else {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem(SAVED_USER_ID_KEY) : null;
          if (savedId) {
            const matched = users.find(
              (u) =>
                u.id === savedId ||
                ((savedId === 'xb-9988-fit' || savedId === 'u1') && isXiomaraBallon(u))
            );
            if (matched) {
              setStoredItem(CURRENT_USER_KEY, matched);
              if (typeof window !== 'undefined') {
                localStorage.setItem(SAVED_USER_ID_KEY, matched.id);
              }
              const matchedAccent = getUserAccentColor(matched);
              const matchedTheme = getUserThemeMode(matched);
              applyThemeToDocument(matchedTheme, matchedAccent);
              return { 
                usuarios: users, 
                currentUser: matched, 
                isLoggedIn: true, 
                currentRole: matched.rol, 
                isCloudReady: true,
                accentColor: matchedAccent,
                themeMode: matchedTheme
              };
            }
          }
        }
        return { 
          usuarios: users, 
          currentUser: updatedCurrentUser, 
          isCloudReady: true,
          accentColor: newAccent,
          themeMode: newTheme
        };
      });
    } else {
      // If collection in cloud is completely empty on very first install, push initial baseline once without overwriting
      try {
        const batch = writeBatch(db);
        mockUsuarios.forEach((user) => {
          batch.set(doc(db, 'usuarios', user.id), cleanObject(user));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error saving initial users to Firestore:', e);
      }
    }
  }, (error) => {
    console.error('Firestore usuarios subscription error:', error);
  });

  // 2. Ejercicios listener
  onSnapshot(collection(db, 'ejercicios'), async (snapshot) => {
    let ejs: Ejercicio[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        ejs.push({ id: docSnap.id, ...docSnap.data() } as Ejercicio);
      });
    }
    
    // Merge any missing mock exercises and backfill to Firestore
    const missingEjs = mockEjercicios.filter((me) => !ejs.some((e) => e.id === me.id));
    if (missingEjs.length > 0) {
      try {
        const batch = writeBatch(db);
        missingEjs.forEach((ej) => {
          batch.set(doc(db, 'ejercicios', ej.id), cleanObject(ej));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error saving missing ejercicios to Firestore:', e);
      }
      ejs = mergeWithMock(ejs, mockEjercicios);
    }

    setStoredItem(EJERCICIOS_STORAGE_KEY, ejs);
    useStore.setState({ ejercicios: ejs });
  }, (error) => {
    console.error('Firestore ejercicios subscription error:', error);
  });

  // 3. Rutinas listener
  onSnapshot(collection(db, 'rutinas'), async (snapshot) => {
    let ruts: Rutina[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        ruts.push({ id: docSnap.id, ...docSnap.data() } as Rutina);
      });
    } else {
      // If collection is completely empty in Firestore on first load, seed baseline 5-day templates
      try {
        const batch = writeBatch(db);
        mockRutinas.forEach((r) => {
          batch.set(doc(db, 'rutinas', r.id), cleanObject(r));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error saving initial rutinas to Firestore:', e);
      }
      ruts = [...mockRutinas];
    }

    // Clean up any legacy _xb documents from Firestore if present
    const legacyRuts = ruts.filter((r) => r.id.endsWith('_xb'));
    if (legacyRuts.length > 0) {
      try {
        const batch = writeBatch(db);
        legacyRuts.forEach((lr) => {
          batch.delete(doc(db, 'rutinas', lr.id));
        });
        await batch.commit();
      } catch (e) {
        console.warn('Cleaned legacy rutinas:', e);
      }
      ruts = ruts.filter((r) => !r.id.endsWith('_xb'));
    }

    setStoredItem(RUTINAS_STORAGE_KEY, ruts);
    useStore.setState({ rutinas: ruts });
  }, (error) => {
    console.error('Firestore rutinas subscription error:', error);
  });

  // 4. EjerciciosRutina listener
  onSnapshot(collection(db, 'ejerciciosRutina'), async (snapshot) => {
    let ers: EjercicioRutina[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        ers.push({ id: docSnap.id, ...docSnap.data() } as EjercicioRutina);
      });
    } else {
      // If collection is completely empty on first load, seed baseline exercise mappings
      try {
        const batch = writeBatch(db);
        mockEjerciciosRutina.forEach((er) => {
          batch.set(doc(db, 'ejerciciosRutina', er.id), cleanObject(er));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error saving initial ejerciciosRutina to Firestore:', e);
      }
      ers = [...mockEjerciciosRutina];
    }

    // Clean up any legacy _xb items
    const legacyErs = ers.filter((er) => er.id.startsWith('er_xb_') || er.id_rutina.endsWith('_xb'));
    if (legacyErs.length > 0) {
      try {
        const batch = writeBatch(db);
        legacyErs.forEach((ler) => {
          batch.delete(doc(db, 'ejerciciosRutina', ler.id));
        });
        await batch.commit();
      } catch (e) {
        console.warn('Cleaned legacy ejerciciosRutina:', e);
      }
      ers = ers.filter((er) => !er.id.startsWith('er_xb_') && !er.id_rutina.endsWith('_xb'));
    }

    setStoredItem(EJERCICIOS_RUTINA_STORAGE_KEY, ers);
    useStore.setState({ ejerciciosRutina: ers });
  }, (error) => {
    console.error('Firestore ejerciciosRutina subscription error:', error);
  });

  // 5. PlanNutricion listener
  onSnapshot(collection(db, 'planesNutricion'), async (snapshot) => {
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const plan = { id: docSnap.id, ...docSnap.data() } as PlanNutricion;
        setStoredItem(PLAN_NUTRICION_STORAGE_KEY, plan);
        useStore.setState({ planNutricion: plan });
      });
    } else {
      try {
        await setDoc(doc(db, 'planesNutricion', mockPlanNutricion.id), cleanObject(mockPlanNutricion));
      } catch (e) {
        console.error('Error saving initial planNutricion:', e);
      }
    }
  }, (error) => {
    console.error('Firestore planesNutricion subscription error:', error);
  });

  // 6. FichasProgreso listener
  onSnapshot(collection(db, 'fichasProgreso'), async (snapshot) => {
    let fps: FichaProgreso[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        fps.push({ id: docSnap.id, ...docSnap.data() } as FichaProgreso);
      });
    }

    const missingFps = mockFichasProgreso.filter((mfp) => !fps.some((fp) => fp.id === mfp.id));
    if (missingFps.length > 0) {
      try {
        const batch = writeBatch(db);
        missingFps.forEach((fp) => {
          batch.set(doc(db, 'fichasProgreso', fp.id), cleanObject(fp));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error saving missing fichasProgreso:', e);
      }
      fps = mergeWithMock(fps, mockFichasProgreso);
    }

    setStoredItem(FICHAS_PROGRESO_STORAGE_KEY, fps);
    useStore.setState({ fichasProgreso: fps });
  }, (error) => {
    console.error('Firestore fichasProgreso subscription error:', error);
  });
}


