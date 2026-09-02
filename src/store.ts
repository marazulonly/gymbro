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
  ejerciciosRutina: EjercicioRutina[];
  addEjercicioRutina: (item: EjercicioRutina) => Promise<void>;
  updateEjercicioRutina: (item: EjercicioRutina) => Promise<void>;
  deleteEjercicioRutina: (id: string) => Promise<void>;
  fichasProgreso: FichaProgreso[];
  addFichaProgreso: (ficha: FichaProgreso) => Promise<void>;
  updateFichaProgreso: (ficha: FichaProgreso) => Promise<void>;
  deleteFichaProgreso: (id: string) => Promise<void>;
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
  { id: 'xb-9988-fit', nombre: 'Xiomara Ballón', dni: '11111111', whatsapp: '977777777', fecha_nacimiento: '1998-03-20', sexo: 'femenino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'cliente', id_entrenador: 'entrenador1' },
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
  { id: 'r1', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 1: Tren Superior (A) - Empuje y Tirón Vertical', dia_semana: 1 },
  { id: 'r2', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 2: Tren Inferior (A) - Cuádriceps y Glúteo', dia_semana: 2 },
  { id: 'r3', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 3: Full Body - Fuerza, Glúteos y Core', dia_semana: 3 },
  { id: 'r4', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 4: Tren Superior (B) - Tirón Horizontal y Hombros', dia_semana: 4 },
  { id: 'r5', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 5: Tren Inferior (B) - Cadena Posterior y Unilaterales', dia_semana: 5 },
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

function mergeWithMock<T extends { id: string }>(stored: T[], mock: T[]): T[] {
  const map = new Map<string, T>();
  stored.forEach((item) => map.set(item.id, item));
  // Mock items take precedence for canonical definitions
  mock.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

// Initial state loaded from LocalStorage (or default baseline if first time ever)
const initialUsuarios = mergeWithMock(getStoredItem<Usuario[]>(USERS_STORAGE_KEY, mockUsuarios), mockUsuarios);
const initialCurrentUser = getStoredItem<Usuario | null>(CURRENT_USER_KEY, null);
const initialEjercicios = mergeWithMock(getStoredItem<Ejercicio[]>(EJERCICIOS_STORAGE_KEY, mockEjercicios), mockEjercicios);
const initialRutinas = mergeWithMock(getStoredItem<Rutina[]>(RUTINAS_STORAGE_KEY, mockRutinas), mockRutinas);
const initialEjerciciosRutina = mergeWithMock(getStoredItem<EjercicioRutina[]>(EJERCICIOS_RUTINA_STORAGE_KEY, mockEjerciciosRutina), mockEjerciciosRutina);
const initialPlanNutricion = getStoredItem<PlanNutricion>(PLAN_NUTRICION_STORAGE_KEY, mockPlanNutricion);
const initialFichasProgreso = mergeWithMock(getStoredItem<FichaProgreso[]>(FICHAS_PROGRESO_STORAGE_KEY, mockFichasProgreso), mockFichasProgreso);

export const useStore = create<AppState>((set, get) => ({
  isCloudReady: false,
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

  login: (dni, contrasena) => {
    const user = get().usuarios.find(u => u.dni.trim() === dni.trim() && u.contrasena === contrasena);
    if (user) {
      if (user.estado_suscripcion === 'inactivo' && user.rol === 'cliente') {
        return { success: false, error: 'Cuenta inactiva por falta de pago.' };
      }
      setStoredItem(CURRENT_USER_KEY, user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVED_USER_ID_KEY, user.id);
      }
      set({ isLoggedIn: true, currentUser: user, currentRole: user.rol });
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas.' };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVED_USER_ID_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    set({ isLoggedIn: false, currentUser: null });
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
    const updatedCurrent = get().currentUser?.id === updatedUsuario.id ? updatedUsuario : get().currentUser;
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

  addEjercicioRutina: async (item) => {
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
        if (state.currentUser) {
          const fresh = users.find(u => u.id === state.currentUser?.id);
          if (fresh) {
            updatedCurrentUser = fresh;
            setStoredItem(CURRENT_USER_KEY, fresh);
          }
        } else {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem(SAVED_USER_ID_KEY) : null;
          if (savedId) {
            const matched = users.find(u => u.id === savedId);
            if (matched) {
              setStoredItem(CURRENT_USER_KEY, matched);
              return { usuarios: users, currentUser: matched, isLoggedIn: true, currentRole: matched.rol, isCloudReady: true };
            }
          }
        }
        return { usuarios: users, currentUser: updatedCurrentUser, isCloudReady: true };
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

    // Always ensure the 5 canonical days are fully synchronized to Firestore
    try {
      const batch = writeBatch(db);
      mockRutinas.forEach((r) => {
        batch.set(doc(db, 'rutinas', r.id), cleanObject(r));
      });
      await batch.commit();
    } catch (e) {
      console.error('Error saving canonical rutinas to Firestore:', e);
    }
    ruts = mergeWithMock(ruts, mockRutinas);

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

    // Always ensure all canonical exercises are linked to r1..r5 in Firestore
    try {
      const batch = writeBatch(db);
      mockEjerciciosRutina.forEach((er) => {
        batch.set(doc(db, 'ejerciciosRutina', er.id), cleanObject(er));
      });
      await batch.commit();
    } catch (e) {
      console.error('Error saving canonical ejerciciosRutina to Firestore:', e);
    }
    ers = mergeWithMock(ers, mockEjerciciosRutina);

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


