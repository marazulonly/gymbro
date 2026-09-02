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
import { Role, Usuario, Ejercicio, Rutina, EjercicioRutina, PlanNutricion } from './types';

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
  { id: 'e_jalon_pecho', nombre: 'Jalón al Pecho (Polea)', grupo_muscular: 'Espalda', instrucciones: 'Sentada, espalda recta, barra al pecho.' },
  { id: 'e_press_banca_manc', nombre: 'Press de Banca con Mancuernas', grupo_muscular: 'Pecho', instrucciones: 'Banco plano, empuje sobre el pecho.' },
  { id: 'e_remo_manc_1mano', nombre: 'Remo con Mancuerna a una Mano', grupo_muscular: 'Espalda', instrucciones: 'Apoyo en banco, mancuerna a la cadera.' },
  { id: 'e_press_militar_sent', nombre: 'Press Militar Sentada (Mancuernas)', grupo_muscular: 'Hombros', instrucciones: 'Respaldo, empuje hacia arriba.' },
  { id: 'e_ext_triceps_pol', nombre: 'Extensiones de Tríceps en Polea', grupo_muscular: 'Brazos / Tríceps', instrucciones: 'Cuerda hacia abajo, extender codos.' },
  { id: 'e_plancha_frontal', nombre: 'Plancha Frontal (Abdomen)', grupo_muscular: 'Core / Abdomen', instrucciones: 'Cuerpo recto, antebrazos.' },

  // Día 2: Tren Inferior (A)
  { id: 'e_sentadilla_goblet', nombre: 'Sentadilla Goblet (con Mancuerna)', grupo_muscular: 'Piernas / Cuádriceps', instrucciones: 'Mancuerna al pecho, baja la cadera.' },
  { id: 'e_prensa_piernas', nombre: 'Prensa de Piernas', grupo_muscular: 'Piernas / Cuádriceps', instrucciones: 'Pies ancho de hombros, no bloquear rodillas.' },
  { id: 'e_peso_muerto_rumano', nombre: 'Peso Muerto Rumano (Mancuernas)', grupo_muscular: 'Piernas / Isquios', instrucciones: 'Mancuernas deslizando, cadera atrás.' },
  { id: 'e_ext_cuadriceps_maq', nombre: 'Extensiones de Cuádriceps en Máquina', grupo_muscular: 'Piernas / Cuádriceps', instrucciones: 'Sentada, extiende y controla bajada.' },
  { id: 'e_puente_gluteo', nombre: 'Puente de Glúteo (con Disco/Barra)', grupo_muscular: 'Glúteos', instrucciones: 'Boca arriba, eleva y aprieta glúteos.' },

  // Día 4: Tren Superior (B)
  { id: 'e_remo_polea_baja', nombre: 'Remo en Polea Baja (Agarre Gironda)', grupo_muscular: 'Espalda', instrucciones: 'Tracción al abdomen bajo, aprieta escápulas.' },
  { id: 'e_press_inclinado_manc', nombre: 'Press Inclinado con Mancuernas', grupo_muscular: 'Pecho', instrucciones: 'Banco 30-45°, empuje parte alta pecho.' },
  { id: 'e_elev_laterales_hombro', nombre: 'Elevaciones Laterales de Hombro', grupo_muscular: 'Hombros', instrucciones: 'Mancuernas a los lados, altura hombros.' },
  { id: 'e_pullover_polea_alta', nombre: 'Pull-over en Polea Alta (Brazos Rectos)', grupo_muscular: 'Espalda', instrucciones: 'Brazos estirados, barra a los muslos.' },
  { id: 'e_curl_biceps_ez', nombre: 'Curl de Bíceps con Barra EZ', grupo_muscular: 'Brazos / Bíceps', instrucciones: 'Levanta flexionando codos, sin balanceo.' },
  { id: 'e_crunch_abdominal_pol', nombre: 'Crunch Abdominal en Polea', grupo_muscular: 'Core / Abdomen', instrucciones: 'De rodillas, encoge hacia rodillas.' },

  // Día 5: Tren Inferior (B)
  { id: 'e_hip_thrust_barra', nombre: 'Hip Thrust con Barra', grupo_muscular: 'Glúteos', instrucciones: 'Espalda en banco, eleva explosivo, baja lento.' },
  { id: 'e_lunges_caminando', nombre: 'Zancadas (Lunges) Caminando', grupo_muscular: 'Piernas / Glúteos', instrucciones: 'Paso largo, rodilla trasera cerca del suelo.' },
  { id: 'e_curl_femoral', nombre: 'Curl Femoral Tumbada o Sentada', grupo_muscular: 'Piernas / Isquios', instrucciones: 'Flexiona llevando rodillo al glúteo.' },
  { id: 'e_prensa_pies_altos', nombre: 'Prensa de Piernas (Pies Altos)', grupo_muscular: 'Piernas / Glúteo e Isquios', instrucciones: 'Foco en glúteo e isquios.' },
  { id: 'e_elev_talones_pie', nombre: 'Elevación de Talones de Pie', grupo_muscular: 'Piernas / Gemelos', instrucciones: 'Eleva talones en escalón.' },
];

const mockRutinas: Rutina[] = [
  { id: 'r1_xb', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 1: Tren Superior (A) - Empuje y Tirón Vertical', dia_semana: 1 },
  { id: 'r2_xb', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 2: Tren Inferior (A) - Cuádriceps y Glúteo', dia_semana: 2 },
  { id: 'r3_xb', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 3: Descanso Activo / Cardio LISS', dia_semana: 3 },
  { id: 'r4_xb', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 4: Tren Superior (B) - Tirón Horizontal y Tonificación', dia_semana: 4 },
  { id: 'r5_xb', id_cliente: 'xb-9988-fit', id_entrenador: 'entrenador1', nombre_sesion: 'Día 5: Tren Inferior (B) - Cadena Posterior y Unilaterales', dia_semana: 5 },
];

const mockEjerciciosRutina: EjercicioRutina[] = [
  // Día 1
  { id: 'er_xb_1', id_rutina: 'r1_xb', id_ejercicio: 'e_jalon_pecho', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_2', id_rutina: 'r1_xb', id_ejercicio: 'e_press_banca_manc', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_3', id_rutina: 'r1_xb', id_ejercicio: 'e_remo_manc_1mano', series_objetivo: 3, reps_objetivo: '12', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_xb_4', id_rutina: 'r1_xb', id_ejercicio: 'e_press_militar_sent', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_xb_5', id_rutina: 'r1_xb', id_ejercicio: 'e_ext_triceps_pol', series_objetivo: 2, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },
  { id: 'er_xb_6', id_rutina: 'r1_xb', id_ejercicio: 'e_plancha_frontal', series_objetivo: 3, reps_objetivo: 'Al fallo técnico', tempo: '-', descanso_segundos: 45, rpe_objetivo: 10 },

  // Día 2
  { id: 'er_xb_7', id_rutina: 'r2_xb', id_ejercicio: 'e_sentadilla_goblet', series_objetivo: 4, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 120, rpe_objetivo: 8 },
  { id: 'er_xb_8', id_rutina: 'r2_xb', id_ejercicio: 'e_prensa_piernas', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_9', id_rutina: 'r2_xb', id_ejercicio: 'e_peso_muerto_rumano', series_objetivo: 3, reps_objetivo: '12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_10', id_rutina: 'r2_xb', id_ejercicio: 'e_ext_cuadriceps_maq', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_xb_11', id_rutina: 'r2_xb', id_ejercicio: 'e_puente_gluteo', series_objetivo: 3, reps_objetivo: '15-20', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },

  // Día 4
  { id: 'er_xb_12', id_rutina: 'r4_xb', id_ejercicio: 'e_remo_polea_baja', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_13', id_rutina: 'r4_xb', id_ejercicio: 'e_press_inclinado_manc', series_objetivo: 3, reps_objetivo: '10-12', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_14', id_rutina: 'r4_xb', id_ejercicio: 'e_elev_laterales_hombro', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_xb_15', id_rutina: 'r4_xb', id_ejercicio: 'e_pullover_polea_alta', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_xb_16', id_rutina: 'r4_xb', id_ejercicio: 'e_curl_biceps_ez', series_objetivo: 2, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },
  { id: 'er_xb_17', id_rutina: 'r4_xb', id_ejercicio: 'e_crunch_abdominal_pol', series_objetivo: 3, reps_objetivo: '15-20', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },

  // Día 5
  { id: 'er_xb_18', id_rutina: 'r5_xb', id_ejercicio: 'e_hip_thrust_barra', series_objetivo: 4, reps_objetivo: '10', tempo: '3-0-1-0', descanso_segundos: 120, rpe_objetivo: 8 },
  { id: 'er_xb_19', id_rutina: 'r5_xb', id_ejercicio: 'e_lunges_caminando', series_objetivo: 3, reps_objetivo: '12/pierna', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_20', id_rutina: 'r5_xb', id_ejercicio: 'e_curl_femoral', series_objetivo: 3, reps_objetivo: '12-15', tempo: '3-0-1-0', descanso_segundos: 60, rpe_objetivo: 8 },
  { id: 'er_xb_21', id_rutina: 'r5_xb', id_ejercicio: 'e_prensa_pies_altos', series_objetivo: 3, reps_objetivo: '15', tempo: '3-0-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er_xb_22', id_rutina: 'r5_xb', id_ejercicio: 'e_elev_talones_pie', series_objetivo: 3, reps_objetivo: '20', tempo: '3-0-1-0', descanso_segundos: 45, rpe_objetivo: 8 },
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

// Local storage helper for persisting session
const SAVED_USER_KEY = 'gymbro_current_user_id';
const savedUserId = typeof window !== 'undefined' ? localStorage.getItem(SAVED_USER_KEY) : null;

export const useStore = create<AppState>((set, get) => ({
  isCloudReady: false,
  currentRole: 'cliente',
  setCurrentRole: (role) => set({ currentRole: role }),
  isLoggedIn: false,
  currentUser: null,
  usuarios: mockUsuarios,
  ejercicios: mockEjercicios,
  rutinas: mockRutinas,
  ejerciciosRutina: mockEjerciciosRutina,
  planNutricion: mockPlanNutricion,

  login: (dni, contrasena) => {
    const user = get().usuarios.find(u => u.dni.trim() === dni.trim() && u.contrasena === contrasena);
    if (user) {
      if (user.estado_suscripcion === 'inactivo' && user.rol === 'cliente') {
        return { success: false, error: 'Cuenta inactiva por falta de pago.' };
      }
      localStorage.setItem(SAVED_USER_KEY, user.id);
      set({ isLoggedIn: true, currentUser: user, currentRole: user.rol });
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas.' };
  },

  logout: () => {
    localStorage.removeItem(SAVED_USER_KEY);
    set({ isLoggedIn: false, currentUser: null });
  },

  addUsuario: async (usuario) => {
    // Optimistic update
    set((state) => ({ usuarios: [...state.usuarios.filter(u => u.id !== usuario.id), usuario] }));
    try {
      await setDoc(doc(db, 'usuarios', usuario.id), cleanObject(usuario));
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
    }
  },

  updateUsuario: async (updatedUsuario) => {
    // Optimistic update
    set((state) => ({
      usuarios: state.usuarios.map(u => u.id === updatedUsuario.id ? updatedUsuario : u),
      currentUser: state.currentUser?.id === updatedUsuario.id ? updatedUsuario : state.currentUser
    }));
    try {
      await setDoc(doc(db, 'usuarios', updatedUsuario.id), cleanObject(updatedUsuario), { merge: true });
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
    }
  },

  deleteUsuario: async (id) => {
    // Optimistic update
    set((state) => ({
      usuarios: state.usuarios.filter(u => u.id !== id)
    }));
    try {
      await deleteDoc(doc(db, 'usuarios', id));
    } catch (err) {
      console.error('Error deleting user in Firestore:', err);
    }
  },

  updatePlanNutricion: async (plan) => {
    set({ planNutricion: plan });
    try {
      await setDoc(doc(db, 'planesNutricion', plan.id), cleanObject(plan), { merge: true });
    } catch (err) {
      console.error('Error saving nutrition plan to Firestore:', err);
    }
  },

  addEjercicio: async (ejercicio) => {
    set((state) => ({ ejercicios: [...state.ejercicios.filter(e => e.id !== ejercicio.id), ejercicio] }));
    try {
      await setDoc(doc(db, 'ejercicios', ejercicio.id), cleanObject(ejercicio));
    } catch (err) {
      console.error('Error adding ejercicio to Firestore:', err);
    }
  },

  updateEjercicio: async (updatedEjercicio) => {
    set((state) => ({
      ejercicios: state.ejercicios.map(e => e.id === updatedEjercicio.id ? updatedEjercicio : e)
    }));
    try {
      await setDoc(doc(db, 'ejercicios', updatedEjercicio.id), cleanObject(updatedEjercicio), { merge: true });
    } catch (err) {
      console.error('Error updating ejercicio in Firestore:', err);
    }
  },

  deleteEjercicio: async (id) => {
    set((state) => ({
      ejercicios: state.ejercicios.filter(e => e.id !== id)
    }));
    try {
      await deleteDoc(doc(db, 'ejercicios', id));
    } catch (err) {
      console.error('Error deleting ejercicio from Firestore:', err);
    }
  },

  addRutina: async (rutina) => {
    set((state) => ({ rutinas: [...state.rutinas.filter(r => r.id !== rutina.id), rutina] }));
    try {
      await setDoc(doc(db, 'rutinas', rutina.id), cleanObject(rutina));
    } catch (err) {
      console.error('Error adding rutina to Firestore:', err);
    }
  },

  updateRutina: async (updatedRutina) => {
    set((state) => ({
      rutinas: state.rutinas.map(r => r.id === updatedRutina.id ? updatedRutina : r)
    }));
    try {
      await setDoc(doc(db, 'rutinas', updatedRutina.id), cleanObject(updatedRutina), { merge: true });
    } catch (err) {
      console.error('Error updating rutina in Firestore:', err);
    }
  },

  deleteRutina: async (id) => {
    set((state) => ({
      rutinas: state.rutinas.filter(r => r.id !== id)
    }));
    try {
      await deleteDoc(doc(db, 'rutinas', id));
    } catch (err) {
      console.error('Error deleting rutina from Firestore:', err);
    }
  },

  addEjercicioRutina: async (item) => {
    set((state) => ({ ejerciciosRutina: [...state.ejerciciosRutina.filter(er => er.id !== item.id), item] }));
    try {
      await setDoc(doc(db, 'ejerciciosRutina', item.id), cleanObject(item));
    } catch (err) {
      console.error('Error adding ejercicio rutina to Firestore:', err);
    }
  },

  updateEjercicioRutina: async (item) => {
    set((state) => ({
      ejerciciosRutina: state.ejerciciosRutina.map(er => er.id === item.id ? item : er)
    }));
    try {
      await setDoc(doc(db, 'ejerciciosRutina', item.id), cleanObject(item), { merge: true });
    } catch (err) {
      console.error('Error updating ejercicio rutina in Firestore:', err);
    }
  },

  deleteEjercicioRutina: async (id) => {
    set((state) => ({
      ejerciciosRutina: state.ejerciciosRutina.filter(er => er.id !== id)
    }));
    try {
      await deleteDoc(doc(db, 'ejerciciosRutina', id));
    } catch (err) {
      console.error('Error deleting ejercicio rutina from Firestore:', err);
    }
  },
}));

// Setup Firestore real-time synchronization and auto-seeding
export function initFirestoreSync() {
  // 1. Usuarios listener & initial seeding
  onSnapshot(collection(db, 'usuarios'), async (snapshot) => {
    if (snapshot.empty) {
      console.log('Seeding initial usuarios to Firestore...');
      try {
        const batch = writeBatch(db);
        mockUsuarios.forEach((user) => {
          batch.set(doc(db, 'usuarios', user.id), cleanObject(user));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error seeding initial usuarios:', e);
      }
    } else {
      const users: Usuario[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data() } as Usuario);
      });
      useStore.setState((state) => {
        let updatedCurrentUser = state.currentUser;
        if (state.currentUser) {
          const fresh = users.find(u => u.id === state.currentUser?.id);
          if (fresh) updatedCurrentUser = fresh;
        } else if (savedUserId) {
          const matched = users.find(u => u.id === savedUserId);
          if (matched) {
            return { usuarios: users, currentUser: matched, isLoggedIn: true, currentRole: matched.rol, isCloudReady: true };
          }
        }
        return { usuarios: users, currentUser: updatedCurrentUser, isCloudReady: true };
      });
    }
  }, (error) => {
    console.error('Firestore usuarios subscription error:', error);
  });

  // 2. Ejercicios listener & initial seeding
  onSnapshot(collection(db, 'ejercicios'), async (snapshot) => {
    if (snapshot.empty) {
      console.log('Seeding initial ejercicios to Firestore...');
      try {
        const batch = writeBatch(db);
        mockEjercicios.forEach((ej) => {
          batch.set(doc(db, 'ejercicios', ej.id), cleanObject(ej));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error seeding initial ejercicios:', e);
      }
    } else {
      const ejs: Ejercicio[] = [];
      snapshot.forEach((docSnap) => {
        ejs.push({ id: docSnap.id, ...docSnap.data() } as Ejercicio);
      });
      useStore.setState({ ejercicios: ejs });
    }
  }, (error) => {
    console.error('Firestore ejercicios subscription error:', error);
  });

  // 3. Rutinas listener & initial seeding
  onSnapshot(collection(db, 'rutinas'), async (snapshot) => {
    if (snapshot.empty) {
      console.log('Seeding initial rutinas to Firestore...');
      try {
        const batch = writeBatch(db);
        mockRutinas.forEach((r) => {
          batch.set(doc(db, 'rutinas', r.id), cleanObject(r));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error seeding initial rutinas:', e);
      }
    } else {
      const ruts: Rutina[] = [];
      snapshot.forEach((docSnap) => {
        ruts.push({ id: docSnap.id, ...docSnap.data() } as Rutina);
      });
      useStore.setState({ rutinas: ruts });
    }
  }, (error) => {
    console.error('Firestore rutinas subscription error:', error);
  });

  // 4. EjerciciosRutina listener & initial seeding
  onSnapshot(collection(db, 'ejerciciosRutina'), async (snapshot) => {
    if (snapshot.empty) {
      console.log('Seeding initial ejerciciosRutina to Firestore...');
      try {
        const batch = writeBatch(db);
        mockEjerciciosRutina.forEach((er) => {
          batch.set(doc(db, 'ejerciciosRutina', er.id), cleanObject(er));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error seeding initial ejerciciosRutina:', e);
      }
    } else {
      const ers: EjercicioRutina[] = [];
      snapshot.forEach((docSnap) => {
        ers.push({ id: docSnap.id, ...docSnap.data() } as EjercicioRutina);
      });
      useStore.setState({ ejerciciosRutina: ers });
    }
  }, (error) => {
    console.error('Firestore ejerciciosRutina subscription error:', error);
  });

  // 5. PlanNutricion listener & initial seeding
  onSnapshot(collection(db, 'planesNutricion'), async (snapshot) => {
    if (snapshot.empty) {
      try {
        await setDoc(doc(db, 'planesNutricion', mockPlanNutricion.id), cleanObject(mockPlanNutricion));
      } catch (e) {
        console.error('Error seeding initial planNutricion:', e);
      }
    } else {
      snapshot.forEach((docSnap) => {
        if (docSnap.id === 'pn1' || docSnap.data().id_cliente === 'u1') {
          useStore.setState({ planNutricion: { id: docSnap.id, ...docSnap.data() } as PlanNutricion });
        }
      });
    }
  }, (error) => {
    console.error('Firestore planesNutricion subscription error:', error);
  });
}

