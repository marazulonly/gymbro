export type Role = 'admin' | 'entrenador' | 'cliente';
export type UIStyle = 'neumorfico' | 'modern_gold';

export interface Usuario {
  id: string;
  nombre: string;
  dni: string;
  whatsapp: string;
  fecha_nacimiento: string;
  sexo: 'masculino' | 'femenino' | 'otro';
  contrasena: string;
  estado_suscripcion: 'activo' | 'inactivo';
  rol: Role;
  id_entrenador?: string;
  avatar_url?: string;
  color_acento?: string;
  modo_tema?: 'light' | 'dark';
  estilo_diseno?: UIStyle;
}

export interface Ejercicio {
  id: string;
  nombre: string;
  grupo_muscular: string;
  video_url?: string;
  instrucciones?: string;
}

export interface Rutina {
  id: string;
  id_cliente: string;
  id_entrenador: string;
  nombre_sesion: string;
  dia_semana: number; // 0 = Domingo, 1 = Lunes, etc.
  es_descanso?: boolean;
}

export interface EjercicioRutina {
  id: string;
  id_rutina: string;
  id_ejercicio: string;
  series_objetivo: number;
  reps_objetivo: string; // ej. "8-12"
  tempo: string; // ej. "3-0-1-0"
  descanso_segundos: number;
  rpe_objetivo: number;
}

export interface RegistroEntrenamiento {
  id: string;
  id_cliente: string;
  id_rutina: string;
  fecha: string; // ISO date
  duracion_minutos: number;
  notas_cliente?: string;
}

export interface RegistroSerie {
  id: string;
  id_registro_entrenamiento: string;
  id_ejercicio: string;
  numero_serie: number;
  peso_kg: number;
  reps_realizadas: number;
  rpe_real: number;
  completada: boolean;
}

export interface PlanNutricion {
  id: string;
  id_cliente: string;
  calorias_meta: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  agua_litros: number;
  pasos_meta: number;
}

export interface RevisionSemanal {
  id: string;
  id_cliente: string;
  fecha: string;
  peso_kg: number;
  nivel_fatiga: number;
  nivel_estres: number;
  feedback_entrenador?: string;
}

export interface FichaProgreso {
  id: string;
  id_cliente: string;
  id_entrenador?: string;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_chequeo: string; // YYYY-MM-DD
  peso_kg: number;
  altura_cm: number;
  grasa_porcentaje?: number;
  musculo_porcentaje?: number;
  pecho_cm?: number;
  cintura_cm?: number;
  cadera_cm?: number;
  brazo_cm?: number;
  muslo_cm?: number;
  pantorrilla_cm?: number;
  objetivo_principal?: string;
  nivel?: 'Principiante' | 'Intermedio' | 'Avanzado';
  adherencia_porcentaje?: number;
  notas_entrenador?: string;
  fecha_actualizacion?: string;
}

export interface SerieLograda {
  numero_serie: number;
  peso_kg: number;
  reps: number;
  rpe: number;
  timestamp: string;
  tiempo_serie_segundos?: number;
}

export interface EjercicioRealizadoLog {
  id: string;
  id_cliente: string;
  nombre_cliente?: string;
  id_rutina: string;
  id_ejercicio_rutina: string;
  id_ejercicio: string;
  nombre_ejercicio: string;
  grupo_muscular?: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio?: string; // HH:mm:ss
  hora_fin?: string; // HH:mm:ss
  duracion_segundos?: number;
  inicio_timestamp?: number;
  fin_timestamp?: number;
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
  inicio_timestamp?: number;
  hora_inicio?: string;
}

export interface SesionUsoWeb {
  id: string;
  id_usuario: string;
  nombre_usuario: string;
  rol: Role;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm:ss
  hora_fin: string; // HH:mm:ss
  duracion_segundos: number;
  inicio_timestamp: number;
  ultima_actividad_timestamp: number;
  dispositivo?: string;
}

