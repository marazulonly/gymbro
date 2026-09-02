import React, { useState } from "react";
import { useStore } from "@/store";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Save, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Calendar, 
  Activity, 
  Clock, 
  Dumbbell, 
  CheckCircle2, 
  User,
  ClipboardList,
  Flame,
  Scale,
  Copy,
  Sparkles,
  Sliders,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "@/components/ProfileModal";
import { AthleteProgressModal } from "@/components/AthleteProgressModal";
import { Rutina, EjercicioRutina, Usuario, Ejercicio } from "@/types";

export function TrainerView({ 
  tab, 
  onNavigateTab 
}: { 
  tab: number; 
  onNavigateTab?: (tab: number) => void;
}) {
  const { usuarios } = useStore();
  const athletes = usuarios
    .filter((u) => u.rol === "cliente")
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || "xb-9988-fit");

  const handleSelectAthleteForRoutines = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    if (onNavigateTab) {
      onNavigateTab(1); // Switch to Rutinas tab
    }
  };

  if (tab === 0) {
    return <AthletesList onManageRoutines={handleSelectAthleteForRoutines} />;
  }
  if (tab === 1) {
    return (
      <RoutineManager 
        selectedAthleteId={selectedAthleteId} 
        onSelectAthlete={setSelectedAthleteId} 
      />
    );
  }
  if (tab === 2) return <ExercisesLibrary />;
  if (tab === 3) return <CheckinsDashboard />;
  return null;
}

const DIAS_SEMANA = [
  { id: 1, label: "Lunes (Día 1)" },
  { id: 2, label: "Martes (Día 2)" },
  { id: 3, label: "Miércoles (Día 3)" },
  { id: 4, label: "Jueves (Día 4)" },
  { id: 5, label: "Viernes (Día 5)" },
  { id: 6, label: "Sábado (Día 6)" },
  { id: 0, label: "Domingo (Día 7)" },
];

function AthletesList({ onManageRoutines }: { onManageRoutines: (athleteId: string) => void }) {
  const { currentUser, usuarios, addUsuario, rutinas, fichasProgreso } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [progressModalAthlete, setProgressModalAthlete] = useState<Usuario | null>(null);

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fecha, setFecha] = useState("");
  const [sexo, setSexo] = useState<"masculino" | "femenino" | "otro">("masculino");

  // Alphabetically sorted athletes list
  const athletes = usuarios
    .filter((u) => u.rol === "cliente")
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !dni) return;

    const newUserId = `u_${Date.now()}`;
    await addUsuario({
      id: newUserId,
      nombre,
      dni,
      whatsapp,
      fecha_nacimiento: fecha,
      sexo,
      contrasena: "0000",
      estado_suscripcion: "activo",
      rol: "cliente",
      id_entrenador: currentUser?.id || "entrenador1",
    });

    setIsAdding(false);
    setNombre("");
    setDni("");
    setWhatsapp("");
    setFecha("");
    
    // Automatically open routine management for the newly created athlete
    onManageRoutines(newUserId);
  };

  if (isAdding) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={() => setIsAdding(false)}>
            <ArrowLeft className="w-5 h-5 text-[#718096]" />
          </NeuButton>
          <h2 className="text-xl font-bold text-[#2D3748]">Nuevo Atleta</h2>
        </div>

        <NeuCard className="p-4">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <NeuInput label="DNI / Documento" value={dni} onChange={(e) => setDni(e.target.value)} required />
            <NeuInput label="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <NeuInput label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <NeuInput label="Fecha de Nacimiento" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

            <div className="flex flex-col gap-1 w-full">
              <span className="text-sm font-medium text-[#718096] pl-2">Sexo</span>
              <select
                className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-2 text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20"
                value={sexo}
                onChange={(e) => setSexo(e.target.value as any)}
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <p className="text-xs text-[#718096] px-2 text-center mt-2">
              La contraseña inicial será <span className="font-bold">0000</span>
            </p>

            <NeuButton type="submit" className="mt-2 h-12 text-[#4D7CFE] font-bold">
              Guardar Atleta y Asignar Rutinas
            </NeuButton>
          </form>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3748]">Mis Atletas</h2>
          <span className="text-xs text-[#718096]">Gestión de rutinas, ejercicios y control físico</span>
        </div>
        <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={() => setIsAdding(true)}>
          <Plus className="w-5 h-5 text-[#4D7CFE]" />
        </NeuButton>
      </div>

      <div className="flex flex-col gap-3">
        {athletes.length === 0 ? (
          <p className="text-center text-[#718096] my-6 text-sm">No tienes atletas registrados.</p>
        ) : (
          athletes.map((athlete) => {
            const ficha = fichasProgreso.find((f) => f.id_cliente === athlete.id);
            const athleteRoutinesCount = rutinas.filter((r) => r.id_cliente === athlete.id).length;

            let checkinText = "Sin ficha";
            let daysBadge = null;

            if (ficha?.fecha_chequeo) {
              const target = new Date(ficha.fecha_chequeo).getTime();
              const today = new Date().setHours(0, 0, 0, 0);
              const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
              checkinText = `Chequeo: ${ficha.fecha_chequeo.substring(5)}`;
              daysBadge = diff;
            }

            return (
              <NeuCard key={athlete.id} className="flex flex-col gap-3 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[#4D7CFE] text-base">
                      {athlete.nombre.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#2D3748] text-sm leading-tight">{athlete.nombre}</span>
                      <div className="flex items-center gap-2 text-[10px] text-[#718096] mt-0.5">
                        <span>DNI: {athlete.dni}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md ${
                            athlete.estado_suscripcion === "inactivo"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {athlete.estado_suscripcion === "inactivo" ? "Inactivo" : "Activo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <NeuButton
                    variant="circle"
                    className="w-8 h-8 shadow-neu-flat text-[#718096] !p-0 flex items-center justify-center"
                    onClick={() => setSelectedUserId(athlete.id)}
                    title="Editar Perfil"
                  >
                    <User className="w-4 h-4" />
                  </NeuButton>
                </div>

                {/* Routine status info banner */}
                <div className="flex items-center justify-between bg-[#E0E5EC] px-3 py-2 rounded-xl shadow-neu-pressed">
                  <div className="flex items-center gap-2 text-xs">
                    <Dumbbell className="w-4 h-4 text-[#4D7CFE]" />
                    <span className="text-[#2D3748] font-bold">
                      {athleteRoutinesCount > 0 ? `${athleteRoutinesCount} Días de Rutina` : "Sin rutinas"}
                    </span>
                  </div>

                  <NeuButton
                    className="px-3 py-1 text-xs text-[#4D7CFE] font-bold flex items-center gap-1.5 h-8 shadow-neu-flat"
                    onClick={() => onManageRoutines(athlete.id)}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Editar Rutinas
                  </NeuButton>
                </div>

                {/* Progress quick glance & action */}
                <div className="flex items-center justify-between pt-1 border-t border-[#c5cad1]/30">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#4D7CFE]" />
                    <span className="text-[11px] font-medium text-[#718096]">{checkinText}</span>
                    {daysBadge !== null && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          daysBadge < 0
                            ? "bg-red-100 text-red-600"
                            : daysBadge <= 3
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {daysBadge < 0 ? `${Math.abs(daysBadge)}d atrasado` : daysBadge === 0 ? "Hoy" : `${daysBadge}d`}
                      </span>
                    )}
                  </div>

                  <NeuButton
                    className="px-3 py-1 text-xs text-[#718096] font-bold flex items-center gap-1 h-8"
                    onClick={() => setProgressModalAthlete(athlete)}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    Ficha
                  </NeuButton>
                </div>
              </NeuCard>
            );
          })
        )}
      </div>

      <ProfileModal
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId || undefined}
      />

      <AthleteProgressModal
        isOpen={!!progressModalAthlete}
        onClose={() => setProgressModalAthlete(null)}
        athlete={progressModalAthlete}
      />
    </div>
  );
}

interface RoutineFormExercise {
  tempId: string;
  id_ejercicio: string;
  nombre_ejercicio: string;
  series_objetivo: number;
  reps_objetivo: string;
  tempo: string;
  descanso_segundos: number;
  rpe_objetivo: number;
}

function RoutineManager({
  selectedAthleteId,
  onSelectAthlete,
}: {
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
}) {
  const { 
    currentUser, 
    usuarios, 
    rutinas, 
    ejerciciosRutina, 
    ejercicios, 
    addRutina, 
    updateRutina, 
    deleteRutina, 
    addEjercicioRutina, 
    updateEjercicioRutina,
    deleteEjercicioRutina,
    assignBasePlanToAthlete,
    copyRoutinesToAthlete
  } = useStore();

  const athletes = usuarios
    .filter((u) => u.rol === "cliente")
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  // If no athlete selected or ID invalid, fallback
  const effectiveAthleteId = currentAthlete?.id || "xb-9988-fit";

  // Editing / Creating routine state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Routine Form Fields
  const [formNombreSesion, setFormNombreSesion] = useState("");
  const [formDiaSemana, setFormDiaSemana] = useState<number>(1);
  const [formExercises, setFormExercises] = useState<RoutineFormExercise[]>([]);
  
  // Exercise Pickers & Modals
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [quickAddTargetRoutineId, setQuickAddTargetRoutineId] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("todos");

  // Inline Quick Exercise Parameter Editor State
  const [editingExerciseParam, setEditingExerciseParam] = useState<{
    id: string; // er id
    ejercicioNombre: string;
    series: number;
    reps: string;
    tempo: string;
    descanso: number;
    rpe: number;
  } | null>(null);

  // Copy modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [sourceAthleteIdForCopy, setSourceAthleteIdForCopy] = useState<string>("");

  // Loading state feedback
  const [isSyncing, setIsSyncing] = useState(false);

  // Routines for the selected athlete
  const athleteRoutines = rutinas
    .filter((r) => r.id_cliente === effectiveAthleteId)
    .sort((a, b) => (a.dia_semana || 0) - (b.dia_semana || 0));

  // Extract unique muscle groups for filter
  const muscleGroups = Array.from(new Set(ejercicios.map((e) => e.grupo_muscular))).filter(Boolean);

  const startEditRoutine = (rutina: Rutina) => {
    setEditingRoutineId(rutina.id);
    setIsCreatingNew(false);
    setFormNombreSesion(rutina.nombre_sesion);
    setFormDiaSemana(rutina.dia_semana);

    const relatedErs = ejerciciosRutina.filter((er) => er.id_rutina === rutina.id);
    const mapped: RoutineFormExercise[] = relatedErs.map((er) => {
      const ej = ejercicios.find((e) => e.id === er.id_ejercicio);
      return {
        tempId: er.id,
        id_ejercicio: er.id_ejercicio,
        nombre_ejercicio: ej?.nombre || "Ejercicio",
        series_objetivo: er.series_objetivo || 3,
        reps_objetivo: er.reps_objetivo || "10-12",
        tempo: er.tempo || "3-0-1-0",
        descanso_segundos: er.descanso_segundos || 90,
        rpe_objetivo: er.rpe_objetivo || 8,
      };
    });
    setFormExercises(mapped);
  };

  const startCreateRoutine = () => {
    setEditingRoutineId(null);
    setIsCreatingNew(true);
    setFormNombreSesion(`Día ${athleteRoutines.length + 1}: Nueva Sesión`);
    setFormDiaSemana((athleteRoutines.length % 7) + 1);
    setFormExercises([]);
  };

  const handleAssignBasePlan = async () => {
    if (!currentAthlete) return;
    setIsSyncing(true);
    try {
      await assignBasePlanToAthlete(currentAthlete.id, currentUser?.id || "entrenador1");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyFromAthlete = async () => {
    if (!sourceAthleteIdForCopy || !currentAthlete) return;
    setIsSyncing(true);
    try {
      await copyRoutinesToAthlete(sourceAthleteIdForCopy, currentAthlete.id, currentUser?.id || "entrenador1");
      setIsCopyModalOpen(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddExerciseToRoutine = async (ej: Ejercicio) => {
    if (quickAddTargetRoutineId) {
      // Adding directly to an existing routine on the screen
      const erPayload: EjercicioRutina = {
        id: `er_${quickAddTargetRoutineId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        id_rutina: quickAddTargetRoutineId,
        id_ejercicio: ej.id,
        series_objetivo: 3,
        reps_objetivo: "10-12",
        tempo: "3-0-1-0",
        descanso_segundos: 90,
        rpe_objetivo: 8,
      };
      await addEjercicioRutina(erPayload);
      setQuickAddTargetRoutineId(null);
      setExercisePickerOpen(false);
      setExerciseSearch("");
      return;
    }

    // Adding inside the routine form
    const newEx: RoutineFormExercise = {
      tempId: `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      id_ejercicio: ej.id,
      nombre_ejercicio: ej.nombre,
      series_objetivo: 3,
      reps_objetivo: "10-12",
      tempo: "3-0-1-0",
      descanso_segundos: 90,
      rpe_objetivo: 8,
    };
    setFormExercises((prev) => [...prev, newEx]);
    setExercisePickerOpen(false);
    setExerciseSearch("");
  };

  const handleUpdateFormExercise = (tempId: string, field: keyof RoutineFormExercise, value: any) => {
    setFormExercises((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveFormExercise = (tempId: string) => {
    setFormExercises((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleDirectDeleteExerciseFromRoutine = async (erId: string, exName: string) => {
    if (window.confirm(`¿Quitar "${exName}" de esta rutina?`)) {
      await deleteEjercicioRutina(erId);
    }
  };

  const handleSaveQuickParamEdit = async () => {
    if (!editingExerciseParam) return;
    const existing = ejerciciosRutina.find((er) => er.id === editingExerciseParam.id);
    if (existing) {
      const updated: EjercicioRutina = {
        ...existing,
        series_objetivo: Number(editingExerciseParam.series) || 3,
        reps_objetivo: String(editingExerciseParam.reps) || "10-12",
        tempo: String(editingExerciseParam.tempo) || "3-0-1-0",
        descanso_segundos: Number(editingExerciseParam.descanso) || 90,
        rpe_objetivo: Number(editingExerciseParam.rpe) || 8,
      };
      await updateEjercicioRutina(updated);
    }
    setEditingExerciseParam(null);
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombreSesion.trim() || !effectiveAthleteId) return;

    setIsSyncing(true);
    try {
      if (isCreatingNew) {
        const newRoutineId = `r_${effectiveAthleteId}_${Date.now()}`;
        const newRutina: Rutina = {
          id: newRoutineId,
          id_cliente: effectiveAthleteId,
          id_entrenador: currentUser?.id || "entrenador1",
          nombre_sesion: formNombreSesion,
          dia_semana: formDiaSemana,
        };
        await addRutina(newRutina);

        for (const ex of formExercises) {
          const erPayload: EjercicioRutina = {
            id: `er_${newRoutineId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            id_rutina: newRoutineId,
            id_ejercicio: ex.id_ejercicio,
            series_objetivo: Number(ex.series_objetivo) || 3,
            reps_objetivo: String(ex.reps_objetivo) || "10-12",
            tempo: String(ex.tempo) || "3-0-1-0",
            descanso_segundos: Number(ex.descanso_segundos) || 90,
            rpe_objetivo: Number(ex.rpe_objetivo) || 8,
          };
          await addEjercicioRutina(erPayload);
        }
      } else if (editingRoutineId) {
        const updatedRutina: Rutina = {
          id: editingRoutineId,
          id_cliente: effectiveAthleteId,
          id_entrenador: currentUser?.id || "entrenador1",
          nombre_sesion: formNombreSesion,
          dia_semana: formDiaSemana,
        };
        await updateRutina(updatedRutina);

        // Clean existing exercises and re-add updated
        const oldErs = ejerciciosRutina.filter((er) => er.id_rutina === editingRoutineId);
        for (const old of oldErs) {
          await deleteEjercicioRutina(old.id);
        }

        for (const ex of formExercises) {
          const erPayload: EjercicioRutina = {
            id: `er_${editingRoutineId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            id_rutina: editingRoutineId,
            id_ejercicio: ex.id_ejercicio,
            series_objetivo: Number(ex.series_objetivo) || 3,
            reps_objetivo: String(ex.reps_objetivo) || "10-12",
            tempo: String(ex.tempo) || "3-0-1-0",
            descanso_segundos: Number(ex.descanso_segundos) || 90,
            rpe_objetivo: Number(ex.rpe_objetivo) || 8,
          };
          await addEjercicioRutina(erPayload);
        }
      }

      setEditingRoutineId(null);
      setIsCreatingNew(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRoutine = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la rutina "${nombre}" y todos sus ejercicios?`)) {
      await deleteRutina(id);
    }
  };

  // Filtered exercises for picker modal, sorted alphabetically
  const filteredEjercicios = ejercicios
    .filter((e) => {
      const matchesSearch = 
        e.nombre.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        e.grupo_muscular.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchesGroup = selectedMuscleFilter === "todos" || e.grupo_muscular === selectedMuscleFilter;
      return matchesSearch && matchesGroup;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  // If currently in Full Edit / Create Mode
  if (isCreatingNew || editingRoutineId) {
    return (
      <div className="flex flex-col gap-4 pb-16">
        <div className="flex items-center gap-3 mb-1">
          <NeuButton
            variant="circle"
            className="w-10 h-10 shadow-neu-flat"
            onClick={() => {
              setIsCreatingNew(false);
              setEditingRoutineId(null);
            }}
          >
            <ArrowLeft className="w-5 h-5 text-[#718096]" />
          </NeuButton>
          <div>
            <h2 className="text-xl font-bold text-[#2D3748]">
              {isCreatingNew ? "Nueva Rutina" : "Editar Rutina"}
            </h2>
            <span className="text-xs text-[#4D7CFE] font-medium">Atleta: {currentAthlete?.nombre}</span>
          </div>
        </div>

        <form onSubmit={handleSaveRoutine} className="flex flex-col gap-4">
          <NeuCard className="p-4 flex flex-col gap-3">
            <NeuInput
              label="Nombre de la Sesión / Bloque"
              value={formNombreSesion}
              onChange={(e) => setFormNombreSesion(e.target.value)}
              placeholder="ej. Día 1: Tren Superior (A)"
              required
            />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[#718096] pl-2">Día de la Semana</span>
              <select
                className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-2.5 text-sm text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20"
                value={formDiaSemana}
                onChange={(e) => setFormDiaSemana(Number(e.target.value))}
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </NeuCard>

          {/* Exercise List for this Routine */}
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-sm text-[#2D3748] flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#4D7CFE]" />
              Ejercicios de la Sesión ({formExercises.length})
            </h3>
            <NeuButton
              type="button"
              className="px-3 py-1 text-xs text-[#4D7CFE] font-bold flex items-center gap-1"
              onClick={() => {
                setQuickAddTargetRoutineId(null);
                setExercisePickerOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Ejercicio
            </NeuButton>
          </div>

          {formExercises.length === 0 ? (
            <NeuCard inset className="p-6 text-center text-[#718096] text-xs flex flex-col items-center gap-2">
              <Dumbbell className="w-8 h-8 text-[#718096]/40" />
              <p>No has añadido ejercicios a esta rutina.</p>
              <NeuButton
                type="button"
                className="text-[#4D7CFE] text-xs font-bold mt-1"
                onClick={() => {
                  setQuickAddTargetRoutineId(null);
                  setExercisePickerOpen(true);
                }}
              >
                Seleccionar de Biblioteca
              </NeuButton>
            </NeuCard>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {formExercises.map((ex, index) => (
                  <motion.div
                    key={ex.tempId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <NeuCard className="p-3 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#4D7CFE] uppercase tracking-wider truncate max-w-[240px]">
                          {index + 1}. {ex.nombre_ejercicio}
                        </span>
                        <NeuButton
                          type="button"
                          variant="circle"
                          className="w-7 h-7 shadow-neu-flat text-red-500 !p-0 flex items-center justify-center"
                          onClick={() => handleRemoveFormExercise(ex.tempId)}
                          title="Disminuir / Quitar ejercicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </NeuButton>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <NeuInput
                          label="Series"
                          type="number"
                          value={ex.series_objetivo}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "series_objetivo", Number(e.target.value))
                          }
                          className="text-center text-xs h-9 font-bold"
                          required
                        />
                        <NeuInput
                          label="Reps"
                          value={ex.reps_objetivo}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "reps_objetivo", e.target.value)
                          }
                          className="text-center text-xs h-9 font-bold"
                          placeholder="10-12"
                          required
                        />
                        <NeuInput
                          label="Descanso (s)"
                          type="number"
                          value={ex.descanso_segundos}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "descanso_segundos", Number(e.target.value))
                          }
                          className="text-center text-xs h-9"
                          placeholder="90"
                        />
                        <NeuInput
                          label="RPE / RIR"
                          type="number"
                          value={ex.rpe_objetivo}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "rpe_objetivo", Number(e.target.value))
                          }
                          className="text-center text-xs h-9"
                          placeholder="8"
                        />
                      </div>

                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-[#718096] pl-1 font-medium">Tempo:</span>
                        <input
                          type="text"
                          value={ex.tempo}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "tempo", e.target.value)
                          }
                          className="w-28 text-center rounded-lg bg-[#E0E5EC] px-2 py-0.5 text-xs text-[#2D3748] shadow-neu-pressed outline-none"
                          placeholder="3-0-1-0"
                        />
                      </div>
                    </NeuCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <NeuButton
              type="submit"
              className="flex-1 h-12 text-[#00C9A7] font-bold text-sm flex items-center justify-center gap-2"
              disabled={isSyncing}
            >
              <Save className="w-4 h-4" />
              {isSyncing ? "Guardando..." : "Guardar Rutina"}
            </NeuButton>
            <NeuButton
              type="button"
              className="px-4 h-12 text-[#718096] font-medium text-sm"
              onClick={() => {
                setIsCreatingNew(false);
                setEditingRoutineId(null);
              }}
            >
              Cancelar
            </NeuButton>
          </div>
        </form>

        {/* Reusable Exercise Picker Modal */}
        {renderExercisePickerModal()}
      </div>
    );
  }

  // MAIN ROUTINE MANAGER VIEW
  return (
    <div className="flex flex-col gap-4 pb-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3748]">Rutinas</h2>
          <span className="text-xs text-[#718096]">Asignación y edición de ejercicios por atleta</span>
        </div>
        <NeuButton
          className="px-3 py-1.5 text-xs text-[#4D7CFE] font-bold flex items-center gap-1.5"
          onClick={startCreateRoutine}
        >
          <Plus className="w-4 h-4" />
          Nueva Rutina
        </NeuButton>
      </div>

      {/* Athlete Selector Horizontal Pills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#718096] pl-1">Seleccionar Atleta</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {athletes.map((a) => {
            const count = rutinas.filter((r) => r.id_cliente === a.id).length;
            const isSelected = effectiveAthleteId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => onSelectAthlete(a.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#E0E5EC] shadow-neu-pressed text-[#4D7CFE]"
                    : "bg-[#E0E5EC] shadow-neu-flat text-[#718096]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isSelected ? "bg-[#4D7CFE] text-white" : "bg-[#E0E5EC] shadow-neu-pressed text-[#718096]"
                }`}>
                  {a.nombre.charAt(0)}
                </div>
                <span>{a.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  count > 0 ? "bg-[#4D7CFE]/10 text-[#4D7CFE]" : "bg-gray-200 text-gray-500"
                }`}>
                  {count}d
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Athlete Banner & Actions */}
      <NeuCard className="p-3.5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[#4D7CFE]">
              {currentAthlete?.nombre.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#2D3748]">{currentAthlete?.nombre}</span>
              <span className="text-[10px] text-[#718096]">
                DNI: {currentAthlete?.dni} • {athleteRoutines.length} sesiones programadas
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              currentAthlete?.estado_suscripcion === "inactivo"
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {currentAthlete?.estado_suscripcion === "inactivo" ? "Inactivo" : "Activo"}
          </span>
        </div>

        {/* Quick action buttons for athlete */}
        <div className="flex gap-2 pt-1 border-t border-[#c5cad1]/30">
          <NeuButton
            className="flex-1 py-1.5 text-xs text-[#4D7CFE] font-bold flex items-center justify-center gap-1 h-8"
            onClick={startCreateRoutine}
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir Sesión
          </NeuButton>

          {athleteRoutines.length === 0 ? (
            <NeuButton
              className="flex-1 py-1.5 text-xs text-[#00C9A7] font-bold flex items-center justify-center gap-1 h-8"
              onClick={handleAssignBasePlan}
              disabled={isSyncing}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSyncing ? "Asignando..." : "Asignar Plan 5 Días"}
            </NeuButton>
          ) : (
            <NeuButton
              className="px-3 py-1.5 text-xs text-[#718096] font-medium flex items-center justify-center gap-1 h-8"
              onClick={() => setIsCopyModalOpen(true)}
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar de...
            </NeuButton>
          )}
        </div>
      </NeuCard>

      {/* List of Routines for Athlete */}
      <div className="flex flex-col gap-3.5">
        {athleteRoutines.length === 0 ? (
          <NeuCard inset className="p-6 text-center text-[#718096] text-xs flex flex-col items-center gap-3">
            <ClipboardList className="w-10 h-10 text-[#718096]/40" />
            <div>
              <p className="font-bold text-[#2D3748] text-sm">Esta atleta aún no tiene rutinas asignadas</p>
              <p className="text-[11px] text-[#718096] mt-0.5">
                Puedes asignarle el plan estructurado base de 5 días o crear rutinas personalizadas desde cero.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <NeuButton
                className="text-[#00C9A7] text-xs font-bold px-3 py-2 flex items-center gap-1"
                onClick={handleAssignBasePlan}
                disabled={isSyncing}
              >
                <Sparkles className="w-4 h-4" />
                {isSyncing ? "Cargando..." : "Asignar Plan Base (5 Días)"}
              </NeuButton>
              <NeuButton
                className="text-[#4D7CFE] text-xs font-bold px-3 py-2 flex items-center gap-1"
                onClick={startCreateRoutine}
              >
                <Plus className="w-4 h-4" />
                Crear Sesión Manual
              </NeuButton>
            </div>
          </NeuCard>
        ) : (
          athleteRoutines.map((rutina) => {
            const relatedErs = ejerciciosRutina.filter((er) => er.id_rutina === rutina.id);
            const diaObj = DIAS_SEMANA.find((d) => d.id === rutina.dia_semana);

            return (
              <NeuCard key={rutina.id} className="p-4 flex flex-col gap-3">
                {/* Routine Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D7CFE] bg-[#E0E5EC] px-2 py-0.5 rounded-md shadow-neu-pressed">
                        {diaObj?.label || `Día ${rutina.dia_semana}`}
                      </span>
                      <span className="text-[10px] text-[#718096] font-medium">
                        {relatedErs.length} ejercicios
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#2D3748] leading-tight">
                      {rutina.nombre_sesion}
                    </h3>
                  </div>

                  {/* Actions: Edit / Quick Add / Delete */}
                  <div className="flex gap-1.5 items-center">
                    <NeuButton
                      variant="circle"
                      className="w-8 h-8 shadow-neu-flat text-[#00C9A7] !p-0 flex items-center justify-center"
                      onClick={() => {
                        setQuickAddTargetRoutineId(rutina.id);
                        setExercisePickerOpen(true);
                      }}
                      title="Añadir ejercicio a esta rutina"
                    >
                      <Plus className="w-4 h-4" />
                    </NeuButton>
                    <NeuButton
                      variant="circle"
                      className="w-8 h-8 shadow-neu-flat text-[#4D7CFE] !p-0 flex items-center justify-center"
                      onClick={() => startEditRoutine(rutina)}
                      title="Editar Sesión"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </NeuButton>
                    <NeuButton
                      variant="circle"
                      className="w-8 h-8 shadow-neu-flat text-red-500 !p-0 flex items-center justify-center"
                      onClick={() => handleDeleteRoutine(rutina.id, rutina.nombre_sesion)}
                      title="Eliminar Rutina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </NeuButton>
                  </div>
                </div>

                {/* Exercises list inside routine card */}
                <div className="flex flex-col gap-2 pt-1 border-t border-[#c5cad1]/20">
                  {relatedErs.length === 0 ? (
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#E0E5EC] shadow-neu-pressed">
                      <span className="text-xs text-[#718096] italic">Sin ejercicios en esta sesión</span>
                      <button
                        onClick={() => {
                          setQuickAddTargetRoutineId(rutina.id);
                          setExercisePickerOpen(true);
                        }}
                        className="text-xs font-bold text-[#4D7CFE] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir Ejercicio
                      </button>
                    </div>
                  ) : (
                    relatedErs.map((er, idx) => {
                      const ej = ejercicios.find((e) => e.id === er.id_ejercicio);
                      return (
                        <div
                          key={er.id}
                          className="flex flex-col gap-1.5 py-2 px-3 rounded-xl bg-[#E0E5EC] shadow-neu-pressed"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col max-w-[210px]">
                              <span className="font-bold text-xs text-[#2D3748]">
                                {idx + 1}. {ej?.nombre || "Ejercicio"}
                              </span>
                              <span className="text-[9px] text-[#718096]">{ej?.grupo_muscular || "General"}</span>
                            </div>

                            {/* Quick buttons: edit params & remove exercise */}
                            <div className="flex gap-1 items-center">
                              <button
                                onClick={() =>
                                  setEditingExerciseParam({
                                    id: er.id,
                                    ejercicioNombre: ej?.nombre || "Ejercicio",
                                    series: er.series_objetivo,
                                    reps: er.reps_objetivo,
                                    tempo: er.tempo,
                                    descanso: er.descanso_segundos,
                                    rpe: er.rpe_objetivo,
                                  })
                                }
                                className="p-1 rounded-md text-[#4D7CFE] hover:bg-[#4D7CFE]/10"
                                title="Editar parámetros"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDirectDeleteExerciseFromRoutine(er.id, ej?.nombre || "Ejercicio")
                                }
                                className="p-1 rounded-md text-red-500 hover:bg-red-500/10"
                                title="Disminuir / Quitar ejercicio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Parameters Badges */}
                          <div className="flex items-center gap-2 text-[10px] text-[#718096] flex-wrap">
                            <span className="font-bold text-[#4D7CFE] bg-[#E0E5EC] px-2 py-0.5 rounded-md shadow-neu-flat">
                              {er.series_objetivo} series × {er.reps_objetivo}
                            </span>
                            <span className="bg-[#E0E5EC] px-1.5 py-0.5 rounded shadow-neu-flat">
                              Descanso: {er.descanso_segundos}s
                            </span>
                            <span className="bg-[#E0E5EC] px-1.5 py-0.5 rounded shadow-neu-flat">
                              RPE: {er.rpe_objetivo}
                            </span>
                            {er.tempo && er.tempo !== "-" && (
                              <span className="bg-[#E0E5EC] px-1.5 py-0.5 rounded shadow-neu-flat">
                                Tempo: {er.tempo}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </NeuCard>
            );
          })
        )}
      </div>

      {/* Quick Exercise Parameters Editor Modal */}
      <AnimatePresence>
        {editingExerciseParam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D3748]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#E0E5EC] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-[#2D3748]">Editar Parámetros</h3>
                  <span className="text-xs font-semibold text-[#4D7CFE]">{editingExerciseParam.ejercicioNombre}</span>
                </div>
                <NeuButton
                  variant="circle"
                  className="w-7 h-7 shadow-neu-flat"
                  onClick={() => setEditingExerciseParam(null)}
                >
                  <X className="w-4 h-4 text-[#718096]" />
                </NeuButton>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NeuInput
                  label="Series Objetivo"
                  type="number"
                  value={editingExerciseParam.series}
                  onChange={(e) =>
                    setEditingExerciseParam({
                      ...editingExerciseParam,
                      series: Number(e.target.value),
                    })
                  }
                  required
                />
                <NeuInput
                  label="Reps Objetivo"
                  value={editingExerciseParam.reps}
                  onChange={(e) =>
                    setEditingExerciseParam({
                      ...editingExerciseParam,
                      reps: e.target.value,
                    })
                  }
                  placeholder="ej. 10-12"
                  required
                />
                <NeuInput
                  label="Descanso (segundos)"
                  type="number"
                  value={editingExerciseParam.descanso}
                  onChange={(e) =>
                    setEditingExerciseParam({
                      ...editingExerciseParam,
                      descanso: Number(e.target.value),
                    })
                  }
                  placeholder="90"
                />
                <NeuInput
                  label="RPE / Intensidad (1-10)"
                  type="number"
                  value={editingExerciseParam.rpe}
                  onChange={(e) =>
                    setEditingExerciseParam({
                      ...editingExerciseParam,
                      rpe: Number(e.target.value),
                    })
                  }
                  placeholder="8"
                />
              </div>

              <NeuInput
                label="Tempo de Ejecución"
                value={editingExerciseParam.tempo}
                onChange={(e) =>
                  setEditingExerciseParam({
                    ...editingExerciseParam,
                    tempo: e.target.value,
                  })
                }
                placeholder="ej. 3-0-1-0"
              />

              <div className="flex gap-2 mt-2">
                <NeuButton
                  className="flex-1 h-11 text-[#00C9A7] font-bold text-sm flex items-center justify-center gap-2"
                  onClick={handleSaveQuickParamEdit}
                >
                  <Check className="w-4 h-4" />
                  Guardar Cambios
                </NeuButton>
                <NeuButton
                  className="px-4 h-11 text-[#718096] text-sm"
                  onClick={() => setEditingExerciseParam(null)}
                >
                  Cancelar
                </NeuButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Routines From Another Athlete Modal */}
      <AnimatePresence>
        {isCopyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D3748]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#E0E5EC] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-[#2D3748]">Copiar Rutinas</h3>
                <NeuButton
                  variant="circle"
                  className="w-7 h-7 shadow-neu-flat"
                  onClick={() => setIsCopyModalOpen(false)}
                >
                  <X className="w-4 h-4 text-[#718096]" />
                </NeuButton>
              </div>

              <p className="text-xs text-[#718096]">
                Selecciona de qué atleta deseas replicar las rutinas hacia{" "}
                <strong className="text-[#2D3748]">{currentAthlete?.nombre}</strong>:
              </p>

              <select
                className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-2.5 text-sm text-[#2D3748] shadow-neu-pressed outline-none"
                value={sourceAthleteIdForCopy}
                onChange={(e) => setSourceAthleteIdForCopy(e.target.value)}
              >
                <option value="">-- Seleccionar atleta origen --</option>
                {athletes
                  .filter((a) => a.id !== effectiveAthleteId)
                  .map((a) => {
                    const count = rutinas.filter((r) => r.id_cliente === a.id).length;
                    return (
                      <option key={a.id} value={a.id}>
                        {a.nombre} ({count} rutinas)
                      </option>
                    );
                  })}
              </select>

              <div className="flex gap-2 mt-2">
                <NeuButton
                  className="flex-1 h-11 text-[#4D7CFE] font-bold text-sm flex items-center justify-center gap-2"
                  onClick={handleCopyFromAthlete}
                  disabled={!sourceAthleteIdForCopy || isSyncing}
                >
                  <Copy className="w-4 h-4" />
                  {isSyncing ? "Copiando..." : "Copiar Rutinas"}
                </NeuButton>
                <NeuButton
                  className="px-4 h-11 text-[#718096] text-sm"
                  onClick={() => setIsCopyModalOpen(false)}
                >
                  Cancelar
                </NeuButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reusable Exercise Picker Modal */}
      {renderExercisePickerModal()}
    </div>
  );

  // Helper render for Exercise Picker Modal
  function renderExercisePickerModal() {
    return (
      <AnimatePresence>
        {exercisePickerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#E0E5EC]/95 backdrop-blur-sm flex flex-col p-4 max-w-md mx-auto"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-base text-[#2D3748]">Seleccionar Ejercicio</h3>
                <span className="text-[10px] text-[#718096]">
                  {quickAddTargetRoutineId ? "Añadir a sesión activa" : "Añadir a la rutina en edición"}
                </span>
              </div>
              <NeuButton
                variant="circle"
                className="w-8 h-8 shadow-neu-flat"
                onClick={() => {
                  setExercisePickerOpen(false);
                  setQuickAddTargetRoutineId(null);
                }}
              >
                <ArrowLeft className="w-4 h-4 text-[#718096]" />
              </NeuButton>
            </div>

            <NeuInput
              placeholder="Buscar por ejercicio o grupo..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="mb-2"
            />

            {/* Muscle group filter pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
              <button
                onClick={() => setSelectedMuscleFilter("todos")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedMuscleFilter === "todos"
                    ? "bg-[#E0E5EC] shadow-neu-pressed text-[#4D7CFE]"
                    : "bg-[#E0E5EC] shadow-neu-flat text-[#718096]"
                }`}
              >
                Todos
              </button>
              {muscleGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedMuscleFilter(group)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedMuscleFilter === group
                      ? "bg-[#E0E5EC] shadow-neu-pressed text-[#4D7CFE]"
                      : "bg-[#E0E5EC] shadow-neu-flat text-[#718096]"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Exercises List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-6">
              {filteredEjercicios.map((ej) => (
                <NeuCard
                  key={ej.id}
                  className="p-3 flex justify-between items-center cursor-pointer active:shadow-neu-pressed"
                  onClick={() => handleAddExerciseToRoutine(ej)}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#2D3748]">{ej.nombre}</span>
                    <span className="text-[10px] text-[#718096]">{ej.grupo_muscular}</span>
                  </div>
                  <NeuButton
                    variant="circle"
                    className="w-7 h-7 shadow-neu-flat text-[#4D7CFE] !p-0 flex items-center justify-center shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </NeuButton>
                </NeuCard>
              ))}

              {filteredEjercicios.length === 0 && (
                <div className="text-center text-[#718096] py-8 text-xs">
                  No se encontraron ejercicios con ese criterio.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
}

function ExercisesLibrary() {
  const { ejercicios, addEjercicio, updateEjercicio, deleteEjercicio } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Edit states
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("");
  const [instrucciones, setInstrucciones] = useState("");

  const filtered = ejercicios
    .filter(
      (e) =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.grupo_muscular.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  const handleEdit = (id: string) => {
    const ej = ejercicios.find((e) => e.id === id);
    if (ej) {
      setNombre(ej.nombre);
      setGrupo(ej.grupo_muscular);
      setInstrucciones(ej.instrucciones || "");
      setIsEditing(id);
    }
  };

  const handleAddNew = () => {
    setNombre("");
    setGrupo("");
    setInstrucciones("");
    setIsEditing("new");
  };

  const handleSave = async () => {
    if (!nombre || !grupo) return;
    if (isEditing === "new") {
      await addEjercicio({
        id: `e_${Date.now()}`,
        nombre,
        grupo_muscular: grupo,
        instrucciones: instrucciones || undefined,
      });
    } else if (isEditing) {
      await updateEjercicio({
        id: isEditing,
        nombre,
        grupo_muscular: grupo,
        instrucciones: instrucciones || undefined,
      });
    }
    setIsEditing(null);
  };

  const handleDelete = async () => {
    if (isEditing && isEditing !== "new") {
      if (window.confirm("¿Eliminar este ejercicio de la biblioteca global?")) {
        await deleteEjercicio(isEditing);
        setIsEditing(null);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={() => setIsEditing(null)}>
            <ArrowLeft className="w-5 h-5 text-[#718096]" />
          </NeuButton>
          <h2 className="text-xl font-bold text-[#2D3748]">
            {isEditing === "new" ? "Nuevo Ejercicio" : "Editar Ejercicio"}
          </h2>
        </div>

        <NeuCard className="p-4">
          <div className="flex flex-col gap-4">
            <NeuInput
              label="Nombre del Ejercicio"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <NeuInput
              label="Grupo Muscular"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="ej. Piernas / Cuádriceps"
              required
            />
            <div className="flex flex-col gap-1 w-full">
              <span className="text-sm font-medium text-[#718096] pl-2">Instrucciones / Ejecución</span>
              <textarea
                className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-3 text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 resize-none h-24 text-sm"
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                placeholder="Pautas técnicas, recorrido, respiración..."
              />
            </div>

            <NeuButton onClick={handleSave} className="mt-2 h-12 text-[#4D7CFE] font-bold">
              Guardar Ejercicio
            </NeuButton>

            {isEditing !== "new" && (
              <NeuButton
                onClick={handleDelete}
                className="mt-1 h-12 text-red-500 font-bold border-2 border-red-200/50"
              >
                Eliminar
              </NeuButton>
            )}
          </div>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3748]">Biblioteca</h2>
          <span className="text-xs text-[#718096]">{ejercicios.length} ejercicios registrados</span>
        </div>
        <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={handleAddNew}>
          <Plus className="w-5 h-5 text-[#4D7CFE]" />
        </NeuButton>
      </div>

      <NeuInput
        placeholder="Buscar por nombre o grupo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-1"
      />

      <div className="flex flex-col gap-3">
        {filtered.map((ej) => (
          <NeuCard
            key={ej.id}
            className="flex justify-between items-center py-3 px-4 cursor-pointer active:shadow-neu-pressed"
            onClick={() => handleEdit(ej.id)}
          >
            <div className="flex flex-col">
              <span className="font-bold text-[#2D3748] text-sm">{ej.nombre}</span>
              <span className="text-[10px] text-[#718096]">{ej.grupo_muscular}</span>
            </div>
            <NeuButton
              variant="circle"
              className="w-8 h-8 shadow-neu-pressed text-[#4D7CFE] !p-0 flex items-center justify-center shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </NeuButton>
          </NeuCard>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-[#718096] my-4 text-sm">No se encontraron ejercicios.</p>
        )}
      </div>
    </div>
  );
}

function CheckinsDashboard() {
  const { usuarios, fichasProgreso } = useStore();
  const athletes = usuarios
    .filter((u) => u.rol === "cliente")
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const [selectedProgressAthlete, setSelectedProgressAthlete] = useState<Usuario | null>(null);

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[#2D3748]">Revisiones & Progreso</h2>
        <span className="text-xs text-[#718096]">Control de fechas de chequeo y avances físicos</span>
      </div>

      <div className="flex flex-col gap-3">
        {athletes.map((athlete) => {
          const ficha = fichasProgreso.find((f) => f.id_cliente === athlete.id);

          let diasRestantes: number | null = null;
          if (ficha?.fecha_chequeo) {
            const target = new Date(ficha.fecha_chequeo).getTime();
            const today = new Date().setHours(0, 0, 0, 0);
            diasRestantes = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
          }

          return (
            <NeuCard key={athlete.id} className="flex flex-col gap-3 p-4">
              <div className="flex justify-between items-center border-b border-[#c5cad1]/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[#4D7CFE]">
                    {athlete.nombre.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#2D3748] text-sm">{athlete.nombre}</div>
                    <div className="text-[10px] text-[#718096]">
                      {ficha ? `Inicio: ${ficha.fecha_inicio} • Próx: ${ficha.fecha_chequeo}` : "Sin ficha registrada"}
                    </div>
                  </div>
                </div>

                {diasRestantes !== null ? (
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      diasRestantes < 0
                        ? "bg-red-100 text-red-600"
                        : diasRestantes <= 3
                        ? "bg-amber-100 text-amber-700 font-bold"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {diasRestantes < 0
                      ? `Atrasado ${Math.abs(diasRestantes)}d`
                      : diasRestantes === 0
                      ? "¡Hoy!"
                      : `En ${diasRestantes}d`}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#718096] bg-[#E0E5EC] px-2 py-0.5 rounded shadow-neu-pressed">
                    Pendiente
                  </span>
                )}
              </div>

              {/* Physical stats summary */}
              {ficha ? (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[#718096]">Peso</span>
                    <span className="font-bold text-[#2D3748] text-xs">{ficha.peso_kg} kg</span>
                  </div>
                  <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[#718096]">% Grasa</span>
                    <span className="font-bold text-[#2D3748] text-xs">
                      {ficha.grasa_porcentaje ? `${ficha.grasa_porcentaje}%` : "--"}
                    </span>
                  </div>
                  <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[#718096]">% Músculo</span>
                    <span className="font-bold text-[#2D3748] text-xs">
                      {ficha.musculo_porcentaje ? `${ficha.musculo_porcentaje}%` : "--"}
                    </span>
                  </div>
                  <div className="bg-[#E0E5EC] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[#718096]">Cintura</span>
                    <span className="font-bold text-[#2D3748] text-xs">
                      {ficha.cintura_cm ? `${ficha.cintura_cm} cm` : "--"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#718096] italic">No se han registrado mediciones antropométricas.</p>
              )}

              {ficha?.notas_entrenador && (
                <p className="text-[11px] text-[#718096] bg-[#E0E5EC] p-2 rounded-xl shadow-neu-pressed line-clamp-2">
                  <strong className="text-[#2D3748]">Pauta:</strong> {ficha.notas_entrenador}
                </p>
              )}

              <NeuButton
                className="w-full flex gap-2 justify-center text-[#4D7CFE] font-bold text-xs h-10"
                onClick={() => setSelectedProgressAthlete(athlete)}
              >
                <Activity className="w-4 h-4" />
                {ficha ? "Actualizar Ficha & Chequeo" : "Crear Ficha de Progreso"}
              </NeuButton>
            </NeuCard>
          );
        })}
      </div>

      <AthleteProgressModal
        isOpen={!!selectedProgressAthlete}
        onClose={() => setSelectedProgressAthlete(null)}
        athlete={selectedProgressAthlete}
      />
    </div>
  );
}
