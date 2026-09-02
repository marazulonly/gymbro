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
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "@/components/ProfileModal";
import { AthleteProgressModal } from "@/components/AthleteProgressModal";
import { Rutina, EjercicioRutina, Usuario } from "@/types";

export function TrainerView({ tab }: { tab: number }) {
  if (tab === 0) return <AthletesList />;
  if (tab === 1) return <RoutineManager />;
  if (tab === 2) return <ExercisesLibrary />;
  if (tab === 3) return <CheckinsDashboard />;
  return null;
}

const DIAS_SEMANA = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

function AthletesList() {
  const { currentUser, usuarios, addUsuario, fichasProgreso } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [progressModalAthlete, setProgressModalAthlete] = useState<Usuario | null>(null);

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fecha, setFecha] = useState("");
  const [sexo, setSexo] = useState<"masculino" | "femenino" | "otro">("masculino");

  const athletes = usuarios.filter((u) => u.rol === "cliente");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !dni) return;

    await addUsuario({
      id: `u${Date.now()}`,
      nombre,
      dni,
      whatsapp,
      fecha_nacimiento: fecha,
      sexo,
      contrasena: "0000",
      estado_suscripcion: "activo",
      rol: "cliente",
      id_entrenador: currentUser?.id,
    });

    setIsAdding(false);
    setNombre("");
    setDni("");
    setWhatsapp("");
    setFecha("");
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
            <NeuInput label="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
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
              Guardar Atleta
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
          <span className="text-xs text-[#718096]">Gestión de atletas y control físico</span>
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

                {/* Progress quick glance & action */}
                <div className="flex items-center justify-between pt-2 border-t border-[#c5cad1]/30">
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
                    className="px-3 py-1 text-xs text-[#4D7CFE] font-bold flex items-center gap-1 h-8"
                    onClick={() => setProgressModalAthlete(athlete)}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    Ficha de Progreso
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

function RoutineManager() {
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
    deleteEjercicioRutina 
  } = useStore();

  const athletes = usuarios.filter((u) => u.rol === "cliente");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || "xb-9988-fit");

  // Editing / Creating routine state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Routine Form Fields
  const [formNombreSesion, setFormNombreSesion] = useState("");
  const [formDiaSemana, setFormDiaSemana] = useState<number>(1);
  const [formExercises, setFormExercises] = useState<RoutineFormExercise[]>([]);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");

  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const athleteRoutines = rutinas
    .filter((r) => r.id_cliente === selectedAthleteId)
    .sort((a, b) => a.dia_semana - b.dia_semana);

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

  const handleAddExerciseToRoutine = (ej: (typeof ejercicios)[0]) => {
    const newEx: RoutineFormExercise = {
      tempId: `tmp_${Date.now()}_${Math.random()}`,
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

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombreSesion.trim() || !selectedAthleteId) return;

    if (isCreatingNew) {
      const newRoutineId = `r_${selectedAthleteId}_${Date.now()}`;
      const newRutina: Rutina = {
        id: newRoutineId,
        id_cliente: selectedAthleteId,
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
        id_cliente: selectedAthleteId,
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
  };

  const handleDeleteRoutine = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la rutina "${nombre}" y todos sus ejercicios?`)) {
      await deleteRutina(id);
    }
  };

  // If in Edit / Create mode
  if (isCreatingNew || editingRoutineId) {
    const filteredEjercicios = ejercicios.filter((e) =>
      e.nombre.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      e.grupo_muscular.toLowerCase().includes(exerciseSearch.toLowerCase())
    );

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
            <span className="text-xs text-[#718096]">Para: {currentAthlete?.nombre}</span>
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
              Ejercicios de la Rutina ({formExercises.length})
            </h3>
            <NeuButton
              type="button"
              className="px-3 py-1 text-xs text-[#4D7CFE] font-bold flex items-center gap-1"
              onClick={() => setExercisePickerOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Ejercicio
            </NeuButton>
          </div>

          {formExercises.length === 0 ? (
            <NeuCard inset className="p-6 text-center text-[#718096] text-xs">
              No has añadido ejercicios a esta rutina. Haz clic en "Añadir Ejercicio" para seleccionar de la biblioteca.
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
                    <NeuCard className="p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#4D7CFE] uppercase tracking-wider">
                          {index + 1}. {ex.nombre_ejercicio}
                        </span>
                        <NeuButton
                          type="button"
                          variant="circle"
                          className="w-7 h-7 shadow-neu-flat text-red-500 !p-0 flex items-center justify-center"
                          onClick={() => handleRemoveFormExercise(ex.tempId)}
                          title="Quitar ejercicio"
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
                          label="Descanso"
                          type="number"
                          value={ex.descanso_segundos}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "descanso_segundos", Number(e.target.value))
                          }
                          className="text-center text-xs h-9"
                          placeholder="90s"
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
                        <span className="text-[10px] text-[#718096] pl-1">Tempo:</span>
                        <input
                          type="text"
                          value={ex.tempo}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "tempo", e.target.value)
                          }
                          className="w-24 text-center rounded-lg bg-[#E0E5EC] px-2 py-0.5 text-xs text-[#2D3748] shadow-neu-pressed outline-none"
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
            >
              <Save className="w-4 h-4" />
              Guardar Rutina
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

        {/* Exercise Picker Modal */}
        <AnimatePresence>
          {exercisePickerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 bg-[#E0E5EC]/95 backdrop-blur-sm flex flex-col p-4 max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-base text-[#2D3748]">Seleccionar Ejercicio</h3>
                <NeuButton
                  variant="circle"
                  className="w-8 h-8 shadow-neu-flat"
                  onClick={() => setExercisePickerOpen(false)}
                >
                  <ArrowLeft className="w-4 h-4 text-[#718096]" />
                </NeuButton>
              </div>

              <NeuInput
                placeholder="Buscar ejercicio o grupo..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="mb-3"
              />

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
                    <Plus className="w-4 h-4 text-[#4D7CFE]" />
                  </NeuCard>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3748]">Rutinas</h2>
          <span className="text-xs text-[#718096]">Asigna, edita y borra sesiones</span>
        </div>
        <NeuButton
          className="px-3 py-1.5 text-xs text-[#4D7CFE] font-bold flex items-center gap-1.5"
          onClick={startCreateRoutine}
        >
          <Plus className="w-4 h-4" />
          Nueva Rutina
        </NeuButton>
      </div>

      {/* Athlete Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#718096] pl-1">Seleccionar Atleta</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAthleteId(a.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedAthleteId === a.id
                  ? "bg-[#E0E5EC] shadow-neu-pressed text-[#4D7CFE]"
                  : "bg-[#E0E5EC] shadow-neu-flat text-[#718096]"
              }`}
            >
              {a.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards for Athlete */}
      <div className="flex flex-col gap-3">
        {athleteRoutines.length === 0 ? (
          <NeuCard inset className="p-6 text-center text-[#718096] text-xs flex flex-col items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#718096]/50" />
            <p>Este atleta aún no tiene rutinas asignadas.</p>
            <NeuButton className="text-[#4D7CFE] text-xs font-bold" onClick={startCreateRoutine}>
              Crear Primera Rutina
            </NeuButton>
          </NeuCard>
        ) : (
          athleteRoutines.map((rutina) => {
            const relatedErs = ejerciciosRutina.filter((er) => er.id_rutina === rutina.id);
            const diaObj = DIAS_SEMANA.find((d) => d.id === rutina.dia_semana);

            return (
              <NeuCard key={rutina.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D7CFE] bg-[#E0E5EC] px-2 py-0.5 rounded-md shadow-neu-pressed w-fit mb-1">
                      {diaObj?.label || `Día ${rutina.dia_semana}`}
                    </span>
                    <h3 className="font-bold text-sm text-[#2D3748] leading-tight">
                      {rutina.nombre_sesion}
                    </h3>
                  </div>

                  {/* Actions: Edit / Delete */}
                  <div className="flex gap-2">
                    <NeuButton
                      variant="circle"
                      className="w-8 h-8 shadow-neu-flat text-[#4D7CFE] !p-0 flex items-center justify-center"
                      onClick={() => startEditRoutine(rutina)}
                      title="Editar Rutina"
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

                {/* Exercises preview inside routine */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {relatedErs.length === 0 ? (
                    <span className="text-[11px] text-[#718096] italic">Sin ejercicios cargados</span>
                  ) : (
                    relatedErs.map((er, idx) => {
                      const ej = ejercicios.find((e) => e.id === er.id_ejercicio);
                      return (
                        <div
                          key={er.id}
                          className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-[#E0E5EC] shadow-neu-pressed"
                        >
                          <span className="font-medium text-[#2D3748] truncate max-w-[200px]">
                            {idx + 1}. {ej?.nombre || "Ejercicio"}
                          </span>
                          <span className="text-[10px] font-bold text-[#718096]">
                            {er.series_objetivo} × {er.reps_objetivo}
                          </span>
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
    </div>
  );
}

function ExercisesLibrary() {
  const { ejercicios, addEjercicio, updateEjercicio, deleteEjercicio } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Edit states
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("");
  const [instrucciones, setInstrucciones] = useState("");

  const filtered = ejercicios.filter(
    (e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.grupo_muscular.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      if (window.confirm("¿Eliminar este ejercicio de la biblioteca?")) {
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
  const athletes = usuarios.filter((u) => u.rol === "cliente");
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
