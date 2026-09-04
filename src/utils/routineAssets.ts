import backChestImg from '@/assets/images/routine_back_chest_1788520996799.jpg';
import legsRunningImg from '@/assets/images/routine_legs_running_1788521012437.jpg';

export function getRoutineThumbnail(nombreSesion: string = ''): string {
  const lower = nombreSesion.toLowerCase();
  
  if (lower.includes('pierna') || lower.includes('inferior') || lower.includes('glúteo') || lower.includes('gluteo') || lower.includes('femoral') || lower.includes('cuádriceps')) {
    return legsRunningImg;
  }
  
  // Default and upper body / chest / back
  return backChestImg;
}

export function getRoutineCategoryName(nombreSesion: string = ''): string {
  const lower = nombreSesion.toLowerCase();
  if (lower.includes('tren superior') || lower.includes('pecho') || lower.includes('espalda')) {
    return 'Pecho y Espalda';
  }
  if (lower.includes('tren inferior') || lower.includes('pierna') || lower.includes('glúteo')) {
    return 'Piernas';
  }
  if (lower.includes('full body') || lower.includes('cuerpo completo')) {
    return 'Full Body';
  }
  return nombreSesion.split('-')[0].trim() || 'Entrenamiento';
}
