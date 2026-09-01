import { create } from 'zustand';
import { Role, Usuario, Ejercicio, Rutina, EjercicioRutina, PlanNutricion } from './types';

interface AppState {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  isLoggedIn: boolean;
  currentUser: Usuario | null;
  usuarios: Usuario[];
  login: (dni: string, contrasena: string) => { success: boolean; error?: string };
  logout: () => void;
  addUsuario: (usuario: Usuario) => void;
  updateUsuario: (usuario: Usuario) => void;
  deleteUsuario: (id: string) => void;
  planNutricion: PlanNutricion;
  ejercicios: Ejercicio[];
  addEjercicio: (ejercicio: Ejercicio) => void;
  updateEjercicio: (ejercicio: Ejercicio) => void;
  deleteEjercicio: (id: string) => void;
  rutinas: Rutina[];
  ejerciciosRutina: EjercicioRutina[];
}

const mockUsuarios: Usuario[] = [
  { id: 'admin1', nombre: 'Admin GymBro', dni: '12345678', whatsapp: '999999999', fecha_nacimiento: '1990-01-01', sexo: 'masculino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'admin' },
  { id: 'entrenador1', nombre: 'Coach Roberto', dni: '87654321', whatsapp: '988888888', fecha_nacimiento: '1985-05-15', sexo: 'masculino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'entrenador' },
  { id: 'u1', nombre: 'Xiomara Ballón', dni: '11111111', whatsapp: '977777777', fecha_nacimiento: '1998-03-20', sexo: 'femenino', contrasena: '0000', estado_suscripcion: 'activo', rol: 'cliente', id_entrenador: 'entrenador1' },
];

const mockEjercicios: Ejercicio[] = [
  // Sesion 1
  { id: 'e1', nombre: 'Sentadilla Goblet (Mancuerna o KB)', grupo_muscular: 'Piernas', instrucciones: 'Sustituto: Prensa de piernas inclinada' },
  { id: 'e2', nombre: 'Peso Muerto Rumano', grupo_muscular: 'Piernas', instrucciones: 'Sustituto: Curl femoral' },
  { id: 'e3', nombre: 'Zancadas Estáticas', grupo_muscular: 'Piernas' },
  { id: 'e4', nombre: 'Paseo del Granjero', grupo_muscular: 'Full Body' },
  // Sesion 2
  { id: 'e5', nombre: 'Jalón al Pecho en Polea', grupo_muscular: 'Espalda', instrucciones: 'Sustituto: Remo con mancuernas' },
  { id: 'e6', nombre: 'Press Militar con Mancuernas', grupo_muscular: 'Hombros' },
  { id: 'e7', nombre: 'Flexiones Modificadas', grupo_muscular: 'Pecho' },
  { id: 'e8', nombre: 'Plancha Abdominal + Escaladores', grupo_muscular: 'Core' },
  // Sesion 3
  { id: 'e9', nombre: 'Hip Thrust', grupo_muscular: 'Glúteos', instrucciones: 'Sustituto: Puente de glúteos unilateral' },
  { id: 'e10', nombre: 'Step-Ups en Banco', grupo_muscular: 'Piernas' },
  { id: 'e11', nombre: 'Abducción de Cadera en Polea', grupo_muscular: 'Glúteos' },
  { id: 'e12', nombre: 'Bicho Muerto (Deadbug)', grupo_muscular: 'Core' },
  // Sesion 4
  { id: 'e13', nombre: 'Thrusters con Mancuernas', grupo_muscular: 'Full Body' },
  { id: 'e14', nombre: 'Kettlebell Swings', grupo_muscular: 'Full Body' },
  { id: 'e15', nombre: 'Remo Renegado en Plancha', grupo_muscular: 'Espalda/Core' },
  { id: 'e16', nombre: 'Circuito Cardio Final', grupo_muscular: 'Cardio', instrucciones: '30s on / 30s off' },
];

const mockRutinas: Rutina[] = [
  { id: 'r1', id_cliente: 'u1', id_entrenador: 'e1', nombre_sesion: 'S1: Tren Inferior', dia_semana: 1 },
  { id: 'r2', id_cliente: 'u1', id_entrenador: 'e1', nombre_sesion: 'S2: Tren Superior y Core', dia_semana: 2 },
  { id: 'r3', id_cliente: 'u1', id_entrenador: 'e1', nombre_sesion: 'S3: Glúteos, Isquios y Zona Media', dia_semana: 4 },
  { id: 'r4', id_cliente: 'u1', id_entrenador: 'e1', nombre_sesion: 'S4: Full Body & HIIT', dia_semana: 5 },
];

const mockEjerciciosRutina: EjercicioRutina[] = [
  // Sesion 1
  { id: 'er1', id_rutina: 'r1', id_ejercicio: 'e1', series_objetivo: 4, reps_objetivo: '10-12', tempo: '3-1-1-0', descanso_segundos: 90, rpe_objetivo: 8 },
  { id: 'er2', id_rutina: 'r1', id_ejercicio: 'e2', series_objetivo: 4, reps_objetivo: '12', tempo: '3-0-1-0', descanso_segundos: 75, rpe_objetivo: 8 },
  { id: 'er3', id_rutina: 'r1', id_ejercicio: 'e3', series_objetivo: 3, reps_objetivo: '12/pierna', tempo: '2-0-1-0', descanso_segundos: 60, rpe_objetivo: 9 },
  { id: 'er4', id_rutina: 'r1', id_ejercicio: 'e4', series_objetivo: 3, reps_objetivo: '45s activo', tempo: '-', descanso_segundos: 60, rpe_objetivo: 8 },
];

export const useStore = create<AppState>((set, get) => ({
  currentRole: 'cliente',
  setCurrentRole: (role) => set({ currentRole: role }),
  isLoggedIn: false,
  currentUser: null,
  usuarios: mockUsuarios,
  login: (dni, contrasena) => {
    const user = get().usuarios.find(u => u.dni === dni && u.contrasena === contrasena);
    if (user) {
      if (user.estado_suscripcion === 'inactivo' && user.rol === 'cliente') {
        return { success: false, error: 'Cuenta inactiva por falta de pago.' };
      }
      set({ isLoggedIn: true, currentUser: user, currentRole: user.rol });
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas.' };
  },
  logout: () => set({ isLoggedIn: false, currentUser: null }),
  addUsuario: (usuario) => set((state) => ({ usuarios: [...state.usuarios, usuario] })),
  updateUsuario: (updatedUsuario) => set((state) => ({
    usuarios: state.usuarios.map(u => u.id === updatedUsuario.id ? updatedUsuario : u),
    currentUser: state.currentUser?.id === updatedUsuario.id ? updatedUsuario : state.currentUser
  })),
  deleteUsuario: (id) => set((state) => ({
    usuarios: state.usuarios.filter(u => u.id !== id)
  })),
  planNutricion: {
    id: 'pn1', id_cliente: 'u1',
    calorias_meta: 1600, proteinas_g: 120, carbohidratos_g: 160, grasas_g: 53,
    agua_litros: 2.5, pasos_meta: 10000
  },
  ejercicios: mockEjercicios,
  addEjercicio: (ejercicio) => set((state) => ({ ejercicios: [...state.ejercicios, ejercicio] })),
  updateEjercicio: (updatedEjercicio) => set((state) => ({
    ejercicios: state.ejercicios.map(e => e.id === updatedEjercicio.id ? updatedEjercicio : e)
  })),
  deleteEjercicio: (id) => set((state) => ({
    ejercicios: state.ejercicios.filter(e => e.id !== id)
  })),
  rutinas: mockRutinas,
  ejerciciosRutina: mockEjerciciosRutina,
}));
