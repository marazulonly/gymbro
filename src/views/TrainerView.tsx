import React, { useState, useEffect, useMemo } from "react";
import { useStore, getClientRoutines, getDiaSemanaNombre, getDiaSemanaCorto, isRutinaDescanso, isAthleteRoutine } from "@/store";
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
  X,
  ArrowRightLeft,
  Eraser,
  Coffee,
  AlertTriangle,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Send,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "@/components/ProfileModal";
import { AthleteProgressModal } from "@/components/AthleteProgressModal";
import { AthleteProgressView } from "@/components/AthleteProgressView";
import { FichaEstadisticasUsoModal } from "@/components/FichaEstadisticasUsoModal";
import { RegistroEjerciciosRealizadosModal } from "@/components/RegistroEjerciciosRealizadosModal";
import { RoutineAccessControlModal } from "@/components/RoutineAccessControlModal";
import { AthleteSubscriptionModal } from "@/components/AthleteSubscriptionModal";
import { TrainerInvitePromptModal } from "@/components/TrainerInvitePromptModal";
import { TrainerMembershipsModule } from "@/views/TrainerMembershipsModule";
import { Rutina, EjercicioRutina, Usuario, Ejercicio, ModoControlAcceso } from "@/types";
import { isAthleteAssignedOrCreatedByTrainer } from "@/utils/routineAccess";
import { calcularSemaforoPago } from "@/utils/subscriptionUtils";

export function TrainerView({ 
  tab, 
  onNavigateTab 
}: { 
  tab: number; 
  onNavigateTab?: (tab: number) => void;
}) {
  const { usuarios, currentUser } = useStore();
  const isTrainer = currentUser?.rol === "entrenador";
  const isAdmin = currentUser?.rol === "admin";

  const athletes = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === "cliente")
      .filter((u) => isAthleteAssignedOrCreatedByTrainer(u, currentUser?.id, isAdmin))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [usuarios, currentUser, isAdmin]);

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || "");
  const [routineViewMode, setRoutineViewMode] = useState<"gestionar" | "progreso">("gestionar");

  useEffect(() => {
    if (athletes.length > 0 && !athletes.some((a) => a.id === selectedAthleteId)) {
      setSelectedAthleteId(athletes[0].id);
    }
  }, [athletes, selectedAthleteId]);

  const handleSelectAthleteForRoutines = (athleteId: string, mode: "gestionar" | "progreso" = "gestionar") => {
    setSelectedAthleteId(athleteId);
    setRoutineViewMode(mode);
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
        initialViewMode={routineViewMode}
      />
    );
  }
  if (tab === 2) return <ExercisesLibrary />;
  if (tab === 3) return <CheckinsDashboard />;
  if (tab === 4) return <TrainerMembershipsModule />;
  return null;
}

const DIAS_SEMANA = [
  { id: 1, label: "Lunes", corto: "Lun" },
  { id: 2, label: "Martes", corto: "Mar" },
  { id: 3, label: "Miércoles", corto: "Mié" },
  { id: 4, label: "Jueves", corto: "Jue" },
  { id: 5, label: "Viernes", corto: "Vie" },
  { id: 6, label: "Sábado", corto: "Sáb" },
  { id: 0, label: "Domingo", corto: "Dom" },
];

function ClearAthleteRoutinesModal({
  isOpen,
  athlete,
  onClose,
  onConfirm,
  isClearing,
}: {
  isOpen: boolean;
  athlete: Usuario | null;
  onClose: () => void;
  onConfirm: (athleteId: string) => Promise<void>;
  isClearing: boolean;
}) {
  const { rutinas, ejerciciosRutina } = useStore();

  if (!isOpen || !athlete) return null;

  const athleteRoutines = rutinas.filter((r) => isAthleteRoutine(r, athlete));
  const isXiomara = athlete.dni === '10101010' || athlete.dni === '11111111' || athlete.id === 'u1' || athlete.id === 'xb-9988-fit' || (athlete.nombre || '').toLowerCase().includes('xiomara');
  const routineIds = new Set(athleteRoutines.map((r) => r.id));
  if (isXiomara) {
    ['r1', 'r2', 'r3', 'r4', 'r5'].forEach((id) => routineIds.add(id));
  }
  const athleteExercisesCount = ejerciciosRutina.filter((er) => routineIds.has(er.id_rutina)).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[var(--color-text-main)]/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[var(--color-bg-base)] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--color-text-main)]">Limpiar Rutinas</h3>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">Atleta: {athlete.nombre}</span>
            </div>
          </div>

          {/* Warning Content */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              ¿Estás seguro de que deseas eliminar todas las rutinas recomendadas programadas para{" "}
              <strong className="text-[var(--color-text-main)]">{athlete.nombre}</strong>?
            </p>

            <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)] font-medium">Rutinas a eliminar:</span>
              <span className="font-bold text-red-500">
                {athleteRoutines.length} {athleteRoutines.length === 1 ? "sesión" : "sesiones"} ({athleteExercisesCount} {athleteExercisesCount === 1 ? "ejercicio" : "ejercicios"})
              </span>
            </div>

            {/* Safety Guarantee */}
            <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed flex flex-col gap-1.5 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Solo se borran las rutinas</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                <strong>No se borrará ningún otro dato:</strong> la cuenta del atleta, su ficha inicial, medidas antropométricas, notas de control, plan nutricional e historial se mantendrán 100% intactos.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <NeuButton
              className="flex-1 h-11 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5"
              disabled={isClearing}
              onClick={() => onConfirm(athlete.id)}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>{isClearing ? "Borrando..." : "Sí, limpiar rutinas"}</span>
            </NeuButton>

            <NeuButton
              className="px-4 h-11 text-[var(--color-text-muted)] text-xs font-medium"
              disabled={isClearing}
              onClick={onClose}
            >
              Cancelar
            </NeuButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AthletesList({ onManageRoutines }: { onManageRoutines: (athleteId: string, mode?: "gestionar" | "progreso") => void }) {
  const { 
    currentUser, 
    usuarios, 
    addUsuario, 
    rutinas, 
    fichasProgreso, 
    uiStyle, 
    clearAthleteRoutines,
    solicitudesEntrenador,
    enviarSolicitudEntrenamiento,
    deleteSolicitudEntrenamiento 
  } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [progressModalAthlete, setProgressModalAthlete] = useState<Usuario | null>(null);
  const [accessModalAthlete, setAccessModalAthlete] = useState<Usuario | null>(null);
  const [clearRoutinesAthlete, setClearRoutinesAthlete] = useState<Usuario | null>(null);
  const [isClearingRoutines, setIsClearingRoutines] = useState(false);
  const [filterTrainerMode, setFilterTrainerMode] = useState<"mis_atletas" | "todos">("mis_atletas");
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null);

  // Invitation flow states
  const [existingAthleteDetected, setExistingAthleteDetected] = useState<Usuario | null>(null);
  const [invitationAthlete, setInvitationAthlete] = useState<Usuario | null>(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [invitationToast, setInvitationToast] = useState<string | null>(null);

  // Auto-collapse expanded athlete card when clicking outside anywhere on the screen
  useEffect(() => {
    if (!expandedAthleteId) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do not collapse if interacting inside any modal, portal or dialog
      if (target.closest('.fixed') || target.closest('[role="dialog"]')) {
        return;
      }

      // Check if clicked inside the currently expanded athlete's card
      const cardEl = document.getElementById(`athlete-card-${expandedAthleteId}`);
      if (cardEl && cardEl.contains(target)) {
        return;
      }

      // Click was outside the expanded card: collapse it
      setExpandedAthleteId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [expandedAthleteId]);

  // Modals for web usage stats and exercise completion history
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isExerciseLogModalOpen, setIsExerciseLogModalOpen] = useState(false);
  const [selectedModalAthleteId, setSelectedModalAthleteId] = useState<string | undefined>(undefined);
  const [subscriptionModalAthlete, setSubscriptionModalAthlete] = useState<Usuario | null>(null);

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fecha, setFecha] = useState("");
  const [sexo, setSexo] = useState<"masculino" | "femenino" | "otro">("masculino");
  const [contrasena, setContrasena] = useState("0000");

  const isTrainer = currentUser?.rol === "entrenador";
  const isAdmin = currentUser?.rol === "admin";

  // Alphabetically sorted athletes list
  const allGymAthletes = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === "cliente")
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [usuarios]);

  // Athletes assigned to or created by this trainer (or all if admin)
  const assignedAthletes = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === "cliente")
      .filter((u) => isAthleteAssignedOrCreatedByTrainer(u, currentUser?.id, isAdmin))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [usuarios, currentUser, isAdmin]);

  // Trainers ONLY have access to their assigned or created athletes, never all athletes
  const displayedAthletes = isTrainer ? assignedAthletes : (filterTrainerMode === "mis_atletas" ? assignedAthletes : allGymAthletes);

  // Sent invitations by this trainer
  const trainerInvitations = useMemo(() => {
    if (!currentUser) return [];
    return solicitudesEntrenador.filter((s) => s.id_entrenador === currentUser.id);
  }, [solicitudesEntrenador, currentUser]);

  const isTargetAlreadyAssigned = useMemo(() => {
    if (!invitationAthlete || !currentUser) return false;
    return isAthleteAssignedOrCreatedByTrainer(invitationAthlete, currentUser.id, isAdmin);
  }, [invitationAthlete, currentUser, isAdmin]);

  const targetPendingSolicitud = useMemo(() => {
    if (!invitationAthlete || !currentUser) return null;
    return solicitudesEntrenador.find(
      (s) => (s.id_atleta === invitationAthlete.id || s.dni_atleta === invitationAthlete.dni) &&
             s.id_entrenador === currentUser.id &&
             s.estado === "pendiente"
    );
  }, [invitationAthlete, currentUser, solicitudesEntrenador]);

  const handleDniChange = (val: string) => {
    setDni(val);
    const clean = val.trim().toLowerCase();
    if (clean.length >= 4) {
      const found = usuarios.find((u) => u.dni.trim().toLowerCase() === clean);
      setExistingAthleteDetected(found || null);
    } else {
      setExistingAthleteDetected(null);
    }
  };

  const handleOpenAthleteExercises = (athleteId: string) => {
    setSelectedModalAthleteId(athleteId);
    setIsExerciseLogModalOpen(true);
  };

  const handleOpenAthleteUsage = (athleteId: string) => {
    setSelectedModalAthleteId(athleteId);
    setIsUsageModalOpen(true);
  };

  const handleOpenAllExercises = () => {
    setSelectedModalAthleteId(undefined);
    setIsExerciseLogModalOpen(true);
  };

  const handleOpenAllUsage = () => {
    setSelectedModalAthleteId(undefined);
    setIsUsageModalOpen(true);
  };

  const handleConfirmClearRoutines = async (athleteId: string) => {
    setIsClearingRoutines(true);
    try {
      await clearAthleteRoutines(athleteId);
      setClearRoutinesAthlete(null);
    } catch (err) {
      console.error("Error clearing athlete routines:", err);
    } finally {
      setIsClearingRoutines(false);
    }
  };

  const handleConfirmSendInvitation = async (customMessage?: string) => {
    if (!invitationAthlete || !currentUser) return;
    setIsSendingInvitation(true);
    try {
      const res = await enviarSolicitudEntrenamiento({
        id_atleta: invitationAthlete.id,
        dni_atleta: invitationAthlete.dni,
        nombre_atleta: invitationAthlete.nombre,
        id_entrenador: currentUser.id,
        nombre_entrenador: currentUser.nombre || "Tu Entrenador",
        mensaje: customMessage,
      });

      if (res.success) {
        setInvitationToast(`¡Solicitud enviada a ${invitationAthlete.nombre}! Le aparecerá en tiempo real si está conectado o al reingresar.`);
        setShowInvitationModal(false);
        setIsAdding(false);
        setDni("");
        setNombre("");
        setWhatsapp("");
        setFecha("");
        setExistingAthleteDetected(null);
      } else {
        alert(res.message || "No se pudo enviar la solicitud");
      }
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) return;

    const cleanDni = dni.trim().toLowerCase();
    const existing = usuarios.find((u) => u.dni.trim().toLowerCase() === cleanDni);

    if (existing) {
      // Prompt modal asking if trainer wants to invite this already registered athlete!
      setInvitationAthlete(existing);
      setShowInvitationModal(true);
      return;
    }

    if (!nombre.trim()) return;

    const newUserId = `u_${Date.now()}`;
    await addUsuario({
      id: newUserId,
      nombre,
      dni,
      whatsapp,
      fecha_nacimiento: fecha,
      sexo,
      contrasena: contrasena.trim() || "0000",
      estado_suscripcion: "activo",
      rol: "cliente",
      id_entrenador: currentUser?.id || "entrenador1",
      creado_por: currentUser?.id,
    });

    // Ensure newly created athlete starts completely blank without any default or inherited routines
    await clearAthleteRoutines(newUserId);

    setIsAdding(false);
    setNombre("");
    setDni("");
    setWhatsapp("");
    setFecha("");
    setContrasena("0000");
    setExistingAthleteDetected(null);
    
    // Automatically open routine management for the newly created athlete
    onManageRoutines(newUserId);
  };

  if (isAdding) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={() => setIsAdding(false)}>
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-muted)]" />
          </NeuButton>
          <h2 className="text-xl font-bold text-[var(--color-text-main)]">Nuevo Atleta</h2>
        </div>

        <NeuCard className="p-4">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <NeuInput 
                label="DNI / Documento" 
                value={dni} 
                onChange={(e) => handleDniChange(e.target.value)} 
                required 
              />
              {existingAthleteDetected && (
                <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-main)]">
                        Atleta ya registrado: <span className="text-[var(--color-accent-blue)]">{existingAthleteDetected.nombre}</span>
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        DNI: {existingAthleteDetected.dni}
                      </p>
                    </div>
                  </div>
                  <NeuButton
                    type="button"
                    className="px-3 py-1.5 text-xs font-bold text-[var(--color-accent-blue)] shrink-0 flex items-center gap-1 shadow-neu-flat"
                    onClick={() => {
                      setInvitationAthlete(existingAthleteDetected);
                      setShowInvitationModal(true);
                    }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invitar a ser entrenado</span>
                  </NeuButton>
                </div>
              )}
            </div>
            <NeuInput label="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required={!existingAthleteDetected} />
            <NeuInput label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <NeuInput label="Fecha de Nacimiento" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

            <div className="flex flex-col gap-1 w-full">
              <span className="text-sm font-medium text-[var(--color-text-muted)] pl-2">Sexo</span>
              <select
                className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2 text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/20"
                value={sexo}
                onChange={(e) => setSexo(e.target.value as any)}
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <NeuInput 
              label="Contraseña de Acceso" 
              placeholder="0000" 
              value={contrasena} 
              onChange={(e) => setContrasena(e.target.value)} 
              required 
            />

            <NeuButton type="submit" className="mt-2 h-12 text-[var(--color-accent-blue)] font-bold">
              Guardar Atleta y Asignar Rutinas
            </NeuButton>
          </form>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Mis Atletas</h2>
          <span className="text-xs text-[var(--color-text-muted)]">Gestión de rutinas, ejercicios y control físico</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <NeuButton
            className="text-xs font-bold text-[var(--color-accent-green)] px-3 py-1.5 flex items-center gap-1.5 shadow-neu-flat h-9"
            onClick={handleOpenAllExercises}
            title={isAdmin ? "Ver registro de todos los ejercicios realizados" : "Ver registro de ejercicios de mis atletas"}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Ejercicios</span>
            <span>Realizados</span>
          </NeuButton>

          <NeuButton
            className="text-xs font-bold text-[var(--color-accent-blue)] px-3 py-1.5 flex items-center gap-1.5 shadow-neu-flat h-9"
            onClick={handleOpenAllUsage}
            title={isAdmin ? "Ver ficha de estadísticas de tiempo de uso de todos los usuarios" : "Ver ficha de estadísticas de tiempo de uso de mis atletas"}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ficha</span>
            <span>Tiempo</span>
          </NeuButton>

          <NeuButton variant="circle" className="w-9 h-9 shadow-neu-flat" onClick={() => setIsAdding(true)} title="Registrar Atleta">
            <Plus className="w-4 h-4 text-[var(--color-accent-blue)]" />
          </NeuButton>
        </div>
      </div>

      {/* Toast Feedback for Sent Invitations */}
      {invitationToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <span>✓ {invitationToast}</span>
          <button onClick={() => setInvitationToast(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Trainer's Sent Invitations Panel */}
      {trainerInvitations.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-[var(--color-text-muted)]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
              Invitaciones de entrenamiento ({trainerInvitations.length})
            </span>
          </div>
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
            {trainerInvitations.map((inv) => (
              <div key={inv.id} className="p-2.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-[var(--color-text-main)]">
                    {inv.nombre_atleta} <span className="font-normal font-mono text-[var(--color-text-muted)]">({inv.dni_atleta})</span>
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Enviada: {new Date(inv.fecha_solicitud).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.estado === "pendiente" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pendiente
                    </span>
                  )}
                  {inv.estado === "aceptada" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Aceptada
                    </span>
                  )}
                  {inv.estado === "rechazada" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Rechazada
                    </span>
                  )}
                  {inv.estado === "pendiente" && (
                    <button
                      onClick={() => deleteSolicitudEntrenamiento(inv.id)}
                      className="p-1 text-[var(--color-text-muted)] hover:text-rose-500"
                      title="Cancelar invitación"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trainer Athletes Filter Tabs - ONLY visible for Admin */}
      {isAdmin && (
        <div className="flex bg-[var(--color-bg-base)] p-1 rounded-2xl shadow-neu-pressed">
          <button
            type="button"
            onClick={() => setFilterTrainerMode("mis_atletas")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              filterTrainerMode === "mis_atletas"
                ? "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mis Atletas Asignados ({assignedAthletes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTrainerMode("todos")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              filterTrainerMode === "todos"
                ? "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Todos los Atletas ({allGymAthletes.length})</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2.5 pb-8">
        {displayedAthletes.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] my-6 text-sm">
            {isTrainer
              ? "No tienes atletas asignados o creados actualmente."
              : filterTrainerMode === "mis_atletas"
              ? "No tienes atletas asignados a tu cuenta actualmente."
              : "No hay atletas registrados en el gimnasio."}
          </p>
        ) : (
          displayedAthletes.map((athlete) => {
            const ficha = fichasProgreso.find((f) => f.id_cliente === athlete.id);
            const athleteRoutinesCount = rutinas.filter((r) => isAthleteRoutine(r, athlete)).length;
            const modoAcceso = athlete.control_acceso?.modo || "siempre_visible";

            let checkinText = "Sin Ficha Inicial";
            let daysBadge = null;

            if (ficha?.fecha_chequeo) {
              const target = new Date(ficha.fecha_chequeo).getTime();
              const today = new Date().setHours(0, 0, 0, 0);
              const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
              checkinText = `Chequeo: ${ficha.fecha_chequeo.substring(5)}`;
              daysBadge = diff;
            }

            const isExpanded = expandedAthleteId === athlete.id;
            const semaforoPago = calcularSemaforoPago(athlete.suscripcion?.fecha_fin);

            return (
              <NeuCard 
                key={athlete.id} 
                id={`athlete-card-${athlete.id}`}
                className={`transition-all duration-200 ${
                  !isExpanded 
                    ? "p-2.5 sm:p-3" 
                    : "flex flex-col gap-3 p-4"
                }`}
              >
                {!isExpanded ? (
                  /* Ficha de una sola línea: circulo con la inicial, el nombre del atleta y botón para expandir */
                  <div 
                    className="flex items-center justify-between gap-3 cursor-pointer select-none"
                    onClick={() => setExpandedAthleteId(athlete.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[var(--color-accent-blue)] text-sm shrink-0">
                        {athlete.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-[var(--color-text-main)] text-sm truncate">
                        {athlete.nombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón semáforo: solo el círculo de color en forma de botón, sin texto */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubscriptionModalAthlete(athlete);
                        }}
                        className={`w-7 h-7 rounded-full shadow-neu-flat hover:shadow-neu-pressed flex items-center justify-center transition-all active:scale-95 border ${semaforoPago.badgeBorder} ${semaforoPago.badgeBg}`}
                        title={`Control de Membresía (${semaforoPago.label}) - Vence: ${athlete.suscripcion?.fecha_fin || 'Sin fecha'}`}
                        aria-label="Control de Membresía"
                      >
                        <span className={`w-3 h-3 rounded-full ${semaforoPago.dotColor} shadow-sm`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedAthleteId(athlete.id);
                        }}
                        className="w-8 h-8 rounded-full shadow-neu-flat hover:shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] transition-all shrink-0 active:scale-95"
                        title="Expandir vista completa"
                        aria-label="Expandir vista completa"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Vista expandida tal cual como está actualmente con botón para contraer */
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[var(--color-accent-blue)] text-base shrink-0">
                          {athlete.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--color-text-main)] text-base leading-tight">{athlete.nombre}</span>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] mt-0.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.2 rounded-md ${
                                athlete.estado_suscripcion === "inactivo"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {athlete.estado_suscripcion === "inactivo" ? "Inactivo" : "Activo"}
                            </span>

                            {/* Botón semáforo: solo el círculo de color en forma de botón, sin texto */}
                            <button
                              type="button"
                              onClick={() => setSubscriptionModalAthlete(athlete)}
                              className={`w-5 h-5 rounded-full shadow-neu-flat hover:shadow-neu-pressed flex items-center justify-center transition-all active:scale-95 border ${semaforoPago.badgeBorder} ${semaforoPago.badgeBg}`}
                              title={`Control de Membresía (${semaforoPago.label}) - Vence: ${athlete.suscripcion?.fecha_fin || 'Sin fecha'}`}
                              aria-label="Control de Membresía"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${semaforoPago.dotColor} shadow-sm`} />
                            </button>

                            {/* Access Mode Badge */}
                            <span
                              className={`px-2 py-0.2 rounded-md font-bold flex items-center gap-1 ${
                                modoAcceso === "siempre_visible"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : modoAcceso === "solo_hoy"
                                  ? "bg-blue-100 text-blue-700"
                                  : modoAcceso === "horario_manual"
                                  ? athlete.control_acceso?.manual_activo !== false
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>
                                {modoAcceso === "solo_hoy"
                                  ? "Solo hoy"
                                  : modoAcceso === "horario_manual"
                                  ? `Manual: ${athlete.control_acceso?.manual_activo !== false ? "ON" : "OFF"}`
                                  : modoAcceso === "franja_horaria"
                                  ? "Franja horaria"
                                  : "Siempre visible"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <NeuButton
                          variant="circle"
                          className="w-8 h-8 shadow-neu-flat text-[var(--color-text-muted)] !p-0 flex items-center justify-center"
                          onClick={() => setSelectedUserId(athlete.id)}
                          title="Editar Perfil"
                        >
                          <User className="w-4 h-4" />
                        </NeuButton>

                        <button
                          type="button"
                          className="w-8 h-8 rounded-full shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)] active:scale-95"
                          onClick={() => setExpandedAthleteId(null)}
                          title="Contraer ficha"
                          aria-label="Contraer ficha"
                        >
                          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Routine status info banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--color-bg-base)] p-2.5 rounded-xl shadow-neu-pressed gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Dumbbell className="w-4 h-4 text-[var(--color-accent-blue)] shrink-0" />
                        <span className="text-[var(--color-text-main)] font-bold">
                          {athleteRoutinesCount > 0 ? `${athleteRoutinesCount} Días de Rutina` : "Sin rutinas"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <NeuButton
                          className="px-2 py-1 text-[11px] text-[var(--color-accent-blue)] font-bold flex items-center gap-1 h-7 shadow-neu-flat"
                          onClick={() => setAccessModalAthlete(athlete)}
                          title="Configurar Control de Acceso a Rutinas (Siempre visible, Solo hoy, Manual, Franja horaria)"
                        >
                          <Lock className="w-3 h-3 text-[var(--color-accent-blue)]" />
                          <span>Acceso</span>
                        </NeuButton>

                        <NeuButton
                          className="px-2 py-1 text-[11px] text-[var(--color-accent-green)] font-bold flex items-center gap-1 h-7 shadow-neu-flat"
                          onClick={() => handleOpenAthleteExercises(athlete.id)}
                          title="Ver ejercicios completados por esta atleta"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Ejercicios</span>
                        </NeuButton>

                        <NeuButton
                          className="px-2 py-1 text-[11px] text-[var(--color-accent-blue)] font-bold flex items-center gap-1 h-7 shadow-neu-flat"
                          onClick={() => handleOpenAthleteUsage(athlete.id)}
                          title="Ver ficha de tiempos de uso de esta atleta"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Tiempo</span>
                        </NeuButton>

                        <NeuButton
                          className="px-2.5 py-1 text-[11px] text-[var(--color-accent-blue)] font-bold flex items-center gap-1 h-7 shadow-neu-flat"
                          onClick={() => onManageRoutines(athlete.id, "progreso")}
                          title="Ver pantalla Tu Progreso de la atleta"
                        >
                          <Activity className="w-3 h-3" />
                          <span>Progreso</span>
                        </NeuButton>

                        <NeuButton
                          className="px-2.5 py-1 text-[11px] text-[var(--color-text-main)] font-bold flex items-center gap-1 h-7 shadow-neu-flat"
                          onClick={() => onManageRoutines(athlete.id, "gestionar")}
                          title="Editar rutinas y ejercicios"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Rutinas</span>
                        </NeuButton>

                        <NeuButton
                          className={`px-2 py-1 text-[11px] font-bold flex items-center gap-1 h-7 shadow-neu-flat transition-colors ${
                            athleteRoutinesCount > 0
                              ? "text-red-600 dark:text-red-400 hover:text-red-700"
                              : "text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (athleteRoutinesCount > 0) {
                              setClearRoutinesAthlete(athlete);
                            }
                          }}
                          disabled={athleteRoutinesCount === 0}
                          title={
                            athleteRoutinesCount > 0
                              ? "Limpiar todas las rutinas recomendadas a este atleta"
                              : "No tiene rutinas recomendadas para limpiar"
                          }
                        >
                          <Trash2 className="w-3 h-3 text-red-500 shrink-0" />
                          <span>Limpiar rutinas</span>
                        </NeuButton>
                      </div>
                    </div>

                    {/* Progress quick glance & action */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--color-text-muted)]/20">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                        <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{checkinText}</span>
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
                        className={`px-3 py-1 text-xs font-bold flex items-center gap-1 h-8 ${
                          ficha 
                            ? "text-[var(--color-text-muted)]" 
                            : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-neu-flat"
                        }`}
                        onClick={() => setProgressModalAthlete(athlete)}
                        title={ficha ? "Ver Ficha de Progreso" : "Crear Ficha Inicial requerida para iniciar entrenamiento"}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        {ficha ? "Ficha" : "Crear Ficha Inicial"}
                      </NeuButton>
                    </div>
                  </>
                )}
              </NeuCard>
            );
          })
        )}
      </div>

      <RoutineAccessControlModal
        isOpen={!!accessModalAthlete}
        athlete={accessModalAthlete}
        onClose={() => setAccessModalAthlete(null)}
      />

      <AthleteSubscriptionModal
        isOpen={!!subscriptionModalAthlete}
        athlete={subscriptionModalAthlete}
        onClose={() => setSubscriptionModalAthlete(null)}
      />

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

      <FichaEstadisticasUsoModal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        initialUserId={selectedModalAthleteId}
      />

      <RegistroEjerciciosRealizadosModal
        isOpen={isExerciseLogModalOpen}
        onClose={() => setIsExerciseLogModalOpen(false)}
        initialAthleteId={selectedModalAthleteId}
      />

      <ClearAthleteRoutinesModal
        isOpen={!!clearRoutinesAthlete}
        athlete={clearRoutinesAthlete}
        onClose={() => setClearRoutinesAthlete(null)}
        onConfirm={handleConfirmClearRoutines}
        isClearing={isClearingRoutines}
      />

      <TrainerInvitePromptModal
        isOpen={showInvitationModal}
        athlete={invitationAthlete}
        onClose={() => setShowInvitationModal(false)}
        onSend={handleConfirmSendInvitation}
        isSending={isSendingInvitation}
        alreadyAssigned={isTargetAlreadyAssigned}
        alreadyPending={!!targetPendingSolicitud}
        pendingDate={targetPendingSolicitud?.fecha_solicitud}
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
  initialViewMode = "gestionar",
}: {
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
  initialViewMode?: "gestionar" | "progreso";
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
    copyRoutinesToAthlete,
    clearRutinaEjercicios,
    clearAthleteRoutines,
    moveRutinaToDay,
    toggleRutinaDescanso,
    updateUsuario
  } = useStore();

  const [viewMode, setViewMode] = useState<"gestionar" | "progreso">(initialViewMode);
  const [progressModalAthlete, setProgressModalAthlete] = useState<Usuario | null>(null);
  const [accessModalAthlete, setAccessModalAthlete] = useState<Usuario | null>(null);
  const [subscriptionModalAthlete, setSubscriptionModalAthlete] = useState<Usuario | null>(null);
  const [isClearAthleteRoutinesOpen, setIsClearAthleteRoutinesOpen] = useState(false);
  const [isClearingAthleteRoutines, setIsClearingAthleteRoutines] = useState(false);

  const handleQuickSetMode = async (modo: ModoControlAcceso) => {
    if (!currentAthlete) return;
    const currentControl = currentAthlete.control_acceso || {
      modo: "siempre_visible",
      manual_activo: true,
      franjas_semanales: [],
    };
    const updatedUser: Usuario = {
      ...currentAthlete,
      control_acceso: {
        ...currentControl,
        modo,
      },
    };
    await updateUsuario(updatedUser);
  };

  const handleToggleManual = async () => {
    if (!currentAthlete) return;
    const currentControl = currentAthlete.control_acceso || {
      modo: "horario_manual",
      manual_activo: true,
      franjas_semanales: [],
    };
    const updatedUser: Usuario = {
      ...currentAthlete,
      control_acceso: {
        ...currentControl,
        modo: "horario_manual",
        manual_activo: currentControl.manual_activo === false ? true : false,
      },
    };
    await updateUsuario(updatedUser);
  };

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode, selectedAthleteId]);

  const isTrainer = currentUser?.rol === "entrenador";
  const isAdmin = currentUser?.rol === "admin";

  const athletes = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === "cliente")
      .filter((u) => isAthleteAssignedOrCreatedByTrainer(u, currentUser?.id, isAdmin))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [usuarios, currentUser, isAdmin]);

  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  // If no athlete selected or ID invalid, fallback
  const effectiveAthleteId = currentAthlete?.id || "";

  // Day of week filter state for trainer - defaults to "todos" to show all routine days
  const todayDay = new Date().getDay();
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | "todos">("todos");
  const [showRestDays, setShowRestDays] = useState(false);

  // Modals for routine management
  const [moveModalRoutine, setMoveModalRoutine] = useState<Rutina | null>(null);
  const [clearConfirmRoutine, setClearConfirmRoutine] = useState<Rutina | null>(null);

  // Editing / Creating routine state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Routine Form Fields
  const [formNombreSesion, setFormNombreSesion] = useState("");
  const [formDiaSemana, setFormDiaSemana] = useState<number>(1);
  const [formEsDescanso, setFormEsDescanso] = useState(false);
  const [formExercises, setFormExercises] = useState<RoutineFormExercise[]>([]);
  
  // Duplicate exercise warning state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Auto clear warning after 6 seconds
  useEffect(() => {
    if (duplicateWarning) {
      const timer = setTimeout(() => setDuplicateWarning(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [duplicateWarning]);

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
  const athleteRoutines = getClientRoutines(rutinas, currentAthlete);
  const activeAthleteRoutines = athleteRoutines.filter((r) => !isRutinaDescanso(r) && !r.es_descanso);
  const restRoutines = athleteRoutines.filter((r) => isRutinaDescanso(r) || r.es_descanso);

  // Reset day filter to all routine days whenever athlete changes
  useEffect(() => {
    setSelectedDayFilter("todos");
    setShowRestDays(false);
  }, [selectedAthleteId]);

  // Extract unique muscle groups for filter
  const muscleGroups = Array.from(new Set(ejercicios.map((e) => e.grupo_muscular))).filter(Boolean);

  const startEditRoutine = (rutina: Rutina) => {
    setEditingRoutineId(rutina.id);
    setIsCreatingNew(false);
    setFormNombreSesion(rutina.nombre_sesion);
    setFormDiaSemana(rutina.dia_semana);
    setFormEsDescanso(rutina.es_descanso || false);

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

  const checkExerciseDuplicateOnDay = (exerciseId: string, day: number, targetRoutineId?: string | null): { isDuplicate: boolean; reason?: string } => {
    // 1. If inside routine creation/editing form
    if (isCreatingNew || editingRoutineId) {
      if (formExercises.some((item) => item.id_ejercicio === exerciseId)) {
        return { isDuplicate: true, reason: "Este ejercicio ya está agregado a esta sesión." };
      }
      // Check other routines of this athlete on the same day
      const sameDayRoutines = rutinas.filter(
        (r) => r.id_cliente === effectiveAthleteId && r.dia_semana === day && r.id !== editingRoutineId
      );
      const sameDayRoutineIds = sameDayRoutines.map((r) => r.id);
      const existsInOther = ejerciciosRutina.some(
        (er) => sameDayRoutineIds.includes(er.id_rutina) && er.id_ejercicio === exerciseId
      );
      if (existsInOther) {
        return { isDuplicate: true, reason: "Este ejercicio ya está asignado a otra rutina de este mismo día." };
      }
      return { isDuplicate: false };
    }

    // 2. If quick-adding to an existing routine
    if (targetRoutineId) {
      const targetRutina = rutinas.find((r) => r.id === targetRoutineId);
      if (!targetRutina) return { isDuplicate: false };
      const athleteId = targetRutina.id_cliente;
      const targetDay = targetRutina.dia_semana;

      // Find all routines of this athlete for this day
      const sameDayRoutines = rutinas.filter(
        (r) => r.id_cliente === athleteId && r.dia_semana === targetDay
      );
      const sameDayRoutineIds = sameDayRoutines.map((r) => r.id);
      const exists = ejerciciosRutina.some(
        (er) => sameDayRoutineIds.includes(er.id_rutina) && er.id_ejercicio === exerciseId
      );
      if (exists) {
        return { isDuplicate: true, reason: "Este ejercicio ya está programado en este día." };
      }
    }

    return { isDuplicate: false };
  };

  const startCreateRoutine = (suggestedDay?: number) => {
    if (athleteRoutines.length >= 7) {
      const msg = "⚠️ Límite alcanzado: Solo pueden aparecer como máximo 7 días de rutinas. El atleta ya tiene los 7 días de la semana programados (ningún día se puede repetir).";
      setDuplicateWarning(msg);
      try {
        window.alert(msg);
      } catch (_) {}
      return;
    }
    setEditingRoutineId(null);
    setIsCreatingNew(true);

    // Find available days not yet occupied
    const occupiedDays = new Set(athleteRoutines.map((r) => r.dia_semana));
    const allDays = [1, 2, 3, 4, 5, 6, 0];
    const availableDay = allDays.find((d) => !occupiedDays.has(d)) ?? 1;

    const validDay = typeof suggestedDay === "number" && !occupiedDays.has(suggestedDay) ? suggestedDay : undefined;
    const targetDay = validDay !== undefined 
      ? validDay 
      : typeof selectedDayFilter === "number" && !occupiedDays.has(selectedDayFilter)
      ? selectedDayFilter 
      : availableDay;

    setFormNombreSesion(`${getDiaSemanaNombre(targetDay)}: Sesión Principal`);
    setFormDiaSemana(targetDay);
    setFormEsDescanso(false);
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
      const targetRutina = rutinas.find((r) => r.id === quickAddTargetRoutineId);
      const targetDay = targetRutina?.dia_semana ?? 1;
      const check = checkExerciseDuplicateOnDay(ej.id, targetDay, quickAddTargetRoutineId);
      if (check.isDuplicate) {
        const dayName = getDiaSemanaNombre(targetDay);
        const warningMsg = `⚠️ Advertencia: El ejercicio "${ej.nombre}" ya está asignado en este día (${dayName}). No se puede duplicar el mismo ejercicio en el mismo día.`;
        setDuplicateWarning(warningMsg);
        try {
          window.alert(warningMsg);
        } catch (_) {}
        return;
      }

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
    const check = checkExerciseDuplicateOnDay(ej.id, formDiaSemana, editingRoutineId);
    if (check.isDuplicate) {
      const dayName = getDiaSemanaNombre(formDiaSemana);
      const warningMsg = `⚠️ Advertencia: El ejercicio "${ej.nombre}" ya está asignado en este día (${dayName}). No se puede duplicar el mismo ejercicio en el mismo día.`;
      setDuplicateWarning(warningMsg);
      try {
        window.alert(warningMsg);
      } catch (_) {}
      return;
    }

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

    // Check for duplicate exercises in the form
    const exerciseIds = formExercises.map((ex) => ex.id_ejercicio);
    const duplicateId = exerciseIds.find((id, idx) => exerciseIds.indexOf(id) !== idx);
    if (duplicateId) {
      const dupEx = ejercicios.find((ex) => ex.id === duplicateId);
      const dayName = getDiaSemanaNombre(formDiaSemana);
      const warningMsg = `⚠️ Advertencia: El ejercicio "${dupEx?.nombre || 'seleccionado'}" está duplicado en este día (${dayName}). No se puede duplicar el mismo ejercicio en el mismo día.`;
      setDuplicateWarning(warningMsg);
      try {
        window.alert(warningMsg);
      } catch (_) {}
      return;
    }

    // Check if another routine of the athlete on this same day already contains any of these exercises
    const sameDayOtherRoutines = rutinas.filter(
      (r) => r.id_cliente === effectiveAthleteId && r.dia_semana === formDiaSemana && r.id !== editingRoutineId
    );
    const sameDayOtherIds = sameDayOtherRoutines.map((r) => r.id);
    const conflictingEr = ejerciciosRutina.find(
      (er) => sameDayOtherIds.includes(er.id_rutina) && exerciseIds.includes(er.id_ejercicio)
    );
    if (conflictingEr) {
      const confEx = ejercicios.find((ex) => ex.id === conflictingEr.id_ejercicio);
      const dayName = getDiaSemanaNombre(formDiaSemana);
      const warningMsg = `⚠️ Advertencia: El ejercicio "${confEx?.nombre || 'seleccionado'}" ya está asignado en otra sesión de este mismo día (${dayName}). No se puede duplicar en el mismo día.`;
      setDuplicateWarning(warningMsg);
      try {
        window.alert(warningMsg);
      } catch (_) {}
      return;
    }

    // Enforce maximum 7 routine days and no repeating days
    if (isCreatingNew) {
      if (athleteRoutines.length >= 7) {
        const msg = "⚠️ Advertencia: Solo pueden aparecer como máximo 7 días de rutinas. El atleta ya tiene los 7 días asignados.";
        setDuplicateWarning(msg);
        try { window.alert(msg); } catch (_) {}
        return;
      }
      const dayAlreadyExists = athleteRoutines.some((r) => r.dia_semana === formDiaSemana);
      if (dayAlreadyExists) {
        const dayName = getDiaSemanaNombre(formDiaSemana);
        const msg = `⚠️ Advertencia: El día ${dayName} ya tiene una rutina asignada. Solo pueden aparecer como máximo 7 días de rutinas y ningún día se puede repetir.`;
        setDuplicateWarning(msg);
        try { window.alert(msg); } catch (_) {}
        return;
      }
    } else if (editingRoutineId) {
      const dayAlreadyExists = athleteRoutines.some(
        (r) => r.dia_semana === formDiaSemana && r.id !== editingRoutineId
      );
      if (dayAlreadyExists) {
        const dayName = getDiaSemanaNombre(formDiaSemana);
        const msg = `⚠️ Advertencia: El día ${dayName} ya tiene una rutina asignada. Solo pueden aparecer como máximo 7 días de rutinas y ningún día se puede repetir.`;
        setDuplicateWarning(msg);
        try { window.alert(msg); } catch (_) {}
        return;
      }
    }

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
          es_descanso: formEsDescanso,
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
          es_descanso: formEsDescanso,
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
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-muted)]" />
          </NeuButton>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-main)]">
              {isCreatingNew ? "Nueva Rutina" : "Editar Rutina"}
            </h2>
            <span className="text-xs text-[var(--color-accent-blue)] font-medium">Atleta: {currentAthlete?.nombre}</span>
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
              <span className="text-xs font-medium text-[var(--color-text-muted)] pl-2">Día de la Semana</span>
              <select
                className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2.5 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/20"
                value={formDiaSemana}
                onChange={(e) => setFormDiaSemana(Number(e.target.value))}
              >
                {DIAS_SEMANA.map((d) => {
                  const isOccupied = athleteRoutines.some(
                    (r) => r.dia_semana === d.id && r.id !== editingRoutineId
                  );
                  return (
                    <option key={d.id} value={d.id} disabled={isOccupied}>
                      {d.label} {isOccupied ? '(Ocupado - No repetir día)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Rest Day Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed mt-1">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${formEsDescanso ? 'bg-amber-100 text-amber-700' : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'}`}>
                  <Coffee className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--color-text-main)]">Día de Descanso Recomendado</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Los días de descanso no se mostrarán al atleta en su lista activa de rutinas
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                id="routine-form-rest-toggle"
                checked={formEsDescanso}
                onChange={(e) => setFormEsDescanso(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent-blue)] cursor-pointer"
              />
            </div>
          </NeuCard>

          {/* Exercise List for this Routine */}
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[var(--color-accent-blue)]" />
              Ejercicios de la Sesión ({formExercises.length})
            </h3>
            <NeuButton
              type="button"
              className="px-3 py-1 text-xs text-[var(--color-accent-blue)] font-bold flex items-center gap-1"
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
            <NeuCard inset className="p-6 text-center text-[var(--color-text-muted)] text-xs flex flex-col items-center gap-2">
              <Dumbbell className="w-8 h-8 text-[var(--color-text-muted)]/40" />
              <p>No has añadido ejercicios a esta rutina.</p>
              <NeuButton
                type="button"
                className="text-[var(--color-accent-blue)] text-xs font-bold mt-1"
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
                        <span className="font-bold text-xs text-[var(--color-accent-blue)] uppercase tracking-wider truncate max-w-[240px]">
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
                        <span className="text-[10px] text-[var(--color-text-muted)] pl-1 font-medium">Tempo:</span>
                        <input
                          type="text"
                          value={ex.tempo}
                          onChange={(e) =>
                            handleUpdateFormExercise(ex.tempId, "tempo", e.target.value)
                          }
                          className="w-28 text-center rounded-lg bg-[var(--color-bg-base)] px-2 py-0.5 text-xs text-[var(--color-text-main)] shadow-neu-pressed outline-none"
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
              className="flex-1 h-12 text-[var(--color-accent-green)] font-bold text-sm flex items-center justify-center gap-2"
              disabled={isSyncing}
            >
              <Save className="w-4 h-4" />
              {isSyncing ? "Guardando..." : "Guardar Rutina"}
            </NeuButton>
            <NeuButton
              type="button"
              className="px-4 h-12 text-[var(--color-text-muted)] font-medium text-sm"
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
  if (athletes.length === 0 || !currentAthlete) {
    return (
      <div className="flex flex-col gap-4 pb-16">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Rutinas</h2>
            <span className="text-xs text-[var(--color-text-muted)]">Asignación y edición de ejercicios por atleta</span>
          </div>
        </div>
        <NeuCard className="p-8 flex flex-col items-center justify-center text-center gap-3">
          <User className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />
          <p className="text-sm font-semibold text-[var(--color-text-main)]">
            No tienes atletas asignados o creados
          </p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm">
            Para crear y gestionar rutinas de entrenamiento, primero registra o asigna un atleta en la pestaña de Atletas.
          </p>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Rutinas</h2>
          <span className="text-xs text-[var(--color-text-muted)]">Asignación y edición de ejercicios por atleta</span>
        </div>
        <NeuButton
          className="px-3 py-1.5 text-xs text-[var(--color-accent-blue)] font-bold flex items-center gap-1.5"
          onClick={startCreateRoutine}
        >
          <Plus className="w-4 h-4" />
          Nueva Rutina
        </NeuButton>
      </div>

      {/* Athlete Selector Horizontal Pills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[var(--color-text-muted)] pl-1">Seleccionar Atleta</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {athletes.map((a) => {
            const count = rutinas.filter((r) => isAthleteRoutine(r, a)).length;
            const isSelected = effectiveAthleteId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => onSelectAthlete(a.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)]"
                    : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isSelected ? "bg-[var(--color-accent-blue)] text-white" : "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-muted)]"
                }`}>
                  {a.nombre.charAt(0)}
                </div>
                <span>{a.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  count > 0 ? "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]" : "bg-gray-200 text-gray-500"
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
            <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[var(--color-accent-blue)]">
              {currentAthlete?.nombre.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[var(--color-text-main)]">{currentAthlete?.nombre}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
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
        <div className="flex gap-2 pt-1 border-t border-[var(--color-text-muted)]/20">
          <NeuButton
            className="flex-1 py-1.5 text-xs text-[var(--color-accent-blue)] font-bold flex items-center justify-center gap-1 h-8"
            onClick={startCreateRoutine}
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir Sesión
          </NeuButton>

          {athleteRoutines.length === 0 ? (
            <NeuButton
              className="flex-1 py-1.5 text-xs text-[var(--color-accent-green)] font-bold flex items-center justify-center gap-1 h-8"
              onClick={handleAssignBasePlan}
              disabled={isSyncing}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSyncing ? "Asignando..." : "Asignar Plan 5 Días"}
            </NeuButton>
          ) : (
            <div className="flex items-center gap-2">
              <NeuButton
                className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] font-medium flex items-center justify-center gap-1 h-8"
                onClick={() => setIsCopyModalOpen(true)}
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar de...
              </NeuButton>
              <NeuButton
                className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-1 h-8"
                onClick={() => setIsClearAthleteRoutinesOpen(true)}
                title="Limpiar todas las rutinas recomendadas a este atleta"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Limpiar rutinas
              </NeuButton>
            </div>
          )}
        </div>
      </NeuCard>

      {/* Control de Membresía y Semáforo de Pagos Card */}
      {currentAthlete && (() => {
        const semaforoPago = calcularSemaforoPago(currentAthlete.suscripcion?.fecha_fin);
        return (
          <NeuCard className="p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[var(--color-text-main)]">Control de Membresía</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${semaforoPago.badgeBg} ${semaforoPago.badgeText} ${semaforoPago.badgeBorder}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${semaforoPago.dotColor}`} />
                      <span>{semaforoPago.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {currentAthlete.suscripcion?.nombre_plan ? (
                      <>Plan: <strong className="text-[var(--color-text-main)]">{currentAthlete.suscripcion.nombre_plan}</strong> • </>
                    ) : (
                      <span className="italic">Sin plan asignado • </span>
                    )}
                    Vence:{" "}
                    <strong className="text-[var(--color-text-main)]">
                      {currentAthlete.suscripcion?.fecha_fin || "No definida"}
                    </strong>{" "}
                    ({semaforoPago.diasDiferencia > 0 ? `${semaforoPago.diasDiferencia} días restantes` : semaforoPago.diasDiferencia === 0 ? 'Vence hoy' : `${Math.abs(semaforoPago.diasDiferencia)} días de mora`})
                  </span>
                </div>
              </div>

              <NeuButton
                className="px-3 py-1 text-xs text-[var(--color-accent-blue)] font-bold flex items-center gap-1.5 h-7 shadow-neu-flat"
                onClick={() => setSubscriptionModalAthlete(currentAthlete)}
                title="Gestionar membresía, pagos y planes del atleta"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Gestionar Suscripción</span>
              </NeuButton>
            </div>

            {/* Aviso de bloqueo si semáforo está en Negro */}
            {semaforoPago.bloqueado && (
              <div className="p-2.5 rounded-xl bg-slate-950 text-white text-xs flex items-center gap-2.5 border border-red-500/40 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="flex-1 font-medium text-[11px] leading-snug">
                  <strong className="text-red-400">Acceso restringido:</strong> El atleta supera los 2 días de mora. El acceso a sus rutinas se encuentra bloqueado automáticamente hasta regularizar su pago.
                </span>
                <button
                  type="button"
                  onClick={() => setSubscriptionModalAthlete(currentAthlete)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shrink-0 transition-colors"
                >
                  Registrar Pago
                </button>
              </div>
            )}
          </NeuCard>
        );
      })()}

      {/* Control de Acceso a Rutinas Card */}
      {currentAthlete && (
        <NeuCard className="p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-[var(--color-text-main)]">Control de Acceso a Rutinas</h3>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
                    {currentAthlete.control_acceso?.modo === "solo_hoy"
                      ? "Solo hoy"
                      : currentAthlete.control_acceso?.modo === "horario_manual"
                      ? `Manual: ${currentAthlete.control_acceso?.manual_activo !== false ? "ON" : "OFF"}`
                      : currentAthlete.control_acceso?.modo === "franja_horaria"
                      ? "Por franja horaria"
                      : "Siempre visible"}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  Define cuándo {currentAthlete.nombre} puede visualizar y registrar sus ejercicios
                </span>
              </div>
            </div>

            <NeuButton
              className="px-2.5 py-1 text-xs text-[var(--color-accent-blue)] font-bold flex items-center gap-1 h-7"
              onClick={() => setAccessModalAthlete(currentAthlete)}
            >
              <span>Detalles</span>
            </NeuButton>
          </div>

          {/* 4 Access Modes Exclusive Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {/* 1. Siempre visible */}
            <button
              type="button"
              onClick={() => handleQuickSetMode("siempre_visible")}
              className={`p-2 rounded-xl text-left flex flex-col gap-0.5 transition-all ${
                (currentAthlete.control_acceso?.modo || "siempre_visible") === "siempre_visible"
                  ? "bg-[var(--color-bg-base)] shadow-neu-pressed border-2 border-emerald-500/40 text-emerald-700"
                  : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">1. Siempre visible</span>
                {(currentAthlete.control_acceso?.modo || "siempre_visible") === "siempre_visible" && (
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                )}
              </div>
              <span className="text-[9px] text-[var(--color-text-muted)] leading-tight">Acceso total e irrestricto</span>
            </button>

            {/* 2. Solo hoy */}
            <button
              type="button"
              onClick={() => handleQuickSetMode("solo_hoy")}
              className={`p-2 rounded-xl text-left flex flex-col gap-0.5 transition-all ${
                currentAthlete.control_acceso?.modo === "solo_hoy"
                  ? "bg-[var(--color-bg-base)] shadow-neu-pressed border-2 border-blue-500/40 text-blue-700"
                  : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">2. Solo hoy</span>
                {currentAthlete.control_acceso?.modo === "solo_hoy" && (
                  <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                )}
              </div>
              <span className="text-[9px] text-[var(--color-text-muted)] leading-tight">Solo fecha actual (00:00-23:59)</span>
            </button>

            {/* 3. Horario manual */}
            <div
              className={`p-2 rounded-xl text-left flex flex-col gap-1 transition-all ${
                currentAthlete.control_acceso?.modo === "horario_manual"
                  ? "bg-[var(--color-bg-base)] shadow-neu-pressed border-2 border-amber-500/40 text-amber-800"
                  : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleQuickSetMode("horario_manual")}
              >
                <span className="text-[11px] font-bold">3. Horario manual</span>
                {currentAthlete.control_acceso?.modo === "horario_manual" && (
                  <Check className="w-3 h-3 text-amber-600 stroke-[3]" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[var(--color-text-muted)]">
                  {currentAthlete.control_acceso?.manual_activo !== false ? "Habilitado" : "Pausado"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleManual();
                  }}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${
                    currentAthlete.control_acceso?.manual_activo !== false
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-red-500 text-white shadow-sm"
                  }`}
                >
                  {currentAthlete.control_acceso?.manual_activo !== false ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* 4. Por franja horaria */}
            <button
              type="button"
              onClick={() => {
                handleQuickSetMode("franja_horaria");
                setAccessModalAthlete(currentAthlete);
              }}
              className={`p-2 rounded-xl text-left flex flex-col gap-0.5 transition-all ${
                currentAthlete.control_acceso?.modo === "franja_horaria"
                  ? "bg-[var(--color-bg-base)] shadow-neu-pressed border-2 border-purple-500/40 text-purple-700"
                  : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">4. Franja horaria</span>
                {currentAthlete.control_acceso?.modo === "franja_horaria" && (
                  <Check className="w-3 h-3 text-purple-600 stroke-[3]" />
                )}
              </div>
              <span className="text-[9px] text-[var(--color-text-muted)] leading-tight">Días y horas permitidas</span>
            </button>
          </div>
        </NeuCard>
      )}

      {/* View Mode Switcher: Rutinas vs Vista "Tu Progreso" */}
      <div className="flex bg-[var(--color-bg-base)] p-1 rounded-2xl shadow-neu-pressed">
        <button
          type="button"
          onClick={() => setViewMode("gestionar")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            viewMode === "gestionar"
              ? "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Gestión de Rutinas</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode("progreso")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            viewMode === "progreso"
              ? "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Ver "Tu Progreso"</span>
        </button>
      </div>

      {viewMode === "progreso" ? (
        <AthleteProgressView
          athleteId={effectiveAthleteId}
          isTrainerView={true}
          onBack={() => setViewMode("gestionar")}
          onOpenPhysicalFicha={() => setProgressModalAthlete(currentAthlete)}
        />
      ) : (
        <>
          {/* Day Selector Navigation Bar for Trainer (Shows all days with routines, hiding rest days) */}
          <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Días con Rutina ({activeAthleteRoutines.length})
            </span>
            {restRoutines.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRestDays(!showRestDays)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                  showRestDays 
                    ? "bg-amber-100 text-amber-800 shadow-sm"
                    : "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]"
                }`}
                title={showRestDays ? "Ocultar días de descanso" : "Mostrar días de descanso ocultos"}
              >
                <Coffee className="w-3 h-3" />
                <span>{showRestDays ? "Ocultar descansos" : `${restRoutines.length} descanso(s) oculto(s)`}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedDayFilter("todos")}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                selectedDayFilter === "todos"
                  ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                  : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              Todos ({activeAthleteRoutines.length})
            </button>
            <button
              onClick={() => startCreateRoutine()}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-green)] hover:text-[var(--color-accent-green)] flex items-center gap-1"
              title="Programar rutina para un nuevo día"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Día</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(showRestDays ? athleteRoutines : activeAthleteRoutines).map((routine) => {
            const isSelected = selectedDayFilter === routine.dia_semana;
            const exercisesCount = ejerciciosRutina.filter((er) => er.id_rutina === routine.id).length;
            const isRest = routine.es_descanso || isRutinaDescanso(routine);
            const isToday = routine.dia_semana === todayDay;
            const dayName = getDiaSemanaNombre(routine.dia_semana);

            return (
              <button
                key={routine.id}
                id={`trainer-btn-day-${routine.dia_semana}`}
                onClick={() => {
                  if (selectedDayFilter === routine.dia_semana) {
                    setSelectedDayFilter("todos");
                  } else {
                    setSelectedDayFilter(routine.dia_semana);
                  }
                }}
                className={`flex-1 min-w-[84px] py-2 px-1.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)] ring-2 ring-[var(--color-accent-blue)]/40 font-bold"
                    : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] font-medium active:shadow-neu-pressed"
                }`}
              >
                <span className="text-xs font-bold leading-tight">{dayName}</span>
                {isToday && (
                  <span className="text-[8px] font-black uppercase tracking-wider bg-[var(--color-accent-blue)] text-white px-1.5 py-0.2 rounded-full shadow-sm">
                    Hoy
                  </span>
                )}
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                    isSelected
                      ? "bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)]"
                      : isRest
                      ? "bg-amber-100 text-amber-700"
                      : "bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]"
                  }`}
                >
                  {isRest ? "Descanso" : `${exercisesCount} ej.`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List of Routines for Athlete */}
      <div className="flex flex-col gap-3.5">
        {activeAthleteRoutines.length === 0 && !showRestDays ? (
          <NeuCard inset className="p-6 text-center text-[var(--color-text-muted)] text-xs flex flex-col items-center gap-3">
            <ClipboardList className="w-10 h-10 text-[var(--color-text-muted)]/40" />
            <div>
              <p className="font-bold text-[var(--color-text-main)] text-sm">Esta atleta aún no tiene rutinas asignadas</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Puedes asignarle el plan estructurado base de 5 días o crear rutinas personalizadas desde cero.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <NeuButton
                className="text-[var(--color-accent-green)] text-xs font-bold px-3 py-2 flex items-center gap-1"
                onClick={handleAssignBasePlan}
                disabled={isSyncing}
              >
                <Sparkles className="w-4 h-4" />
                {isSyncing ? "Cargando..." : "Asignar Plan Base (5 Días)"}
              </NeuButton>
              <NeuButton
                className="text-[var(--color-accent-blue)] text-xs font-bold px-3 py-2 flex items-center gap-1"
                onClick={() => startCreateRoutine()}
              >
                <Plus className="w-4 h-4" />
                Crear Sesión Manual
              </NeuButton>
            </div>
          </NeuCard>
        ) : (
          (() => {
            const routinesSource = showRestDays ? athleteRoutines : activeAthleteRoutines;
            const displayedRoutines = selectedDayFilter === "todos"
              ? routinesSource
              : routinesSource.filter((r) => r.dia_semana === selectedDayFilter);

            if (displayedRoutines.length === 0 && selectedDayFilter !== "todos") {
              const selectedDiaObj = DIAS_SEMANA.find((d) => d.id === selectedDayFilter);
              return (
                <NeuCard inset className="p-6 text-center text-[var(--color-text-muted)] text-xs flex flex-col items-center gap-3">
                  <Calendar className="w-10 h-10 text-[var(--color-text-muted)]/40" />
                  <div>
                    <p className="font-bold text-[var(--color-text-main)] text-sm">
                      Sin rutina activa para el {selectedDiaObj?.label || getDiaSemanaNombre(selectedDayFilter)}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      Puedes programar una sesión para este día o volver a ver todos los días con rutina.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <NeuButton
                      className="text-[var(--color-accent-blue)] text-xs font-bold px-3 py-2 flex items-center gap-1"
                      onClick={() => startCreateRoutine(selectedDayFilter)}
                    >
                      <Plus className="w-4 h-4" />
                      Programar Rutina
                    </NeuButton>
                    <NeuButton
                      className="text-[var(--color-text-muted)] text-xs font-bold px-3 py-2 flex items-center gap-1"
                      onClick={() => setSelectedDayFilter("todos")}
                    >
                      Ver Todos los Días
                    </NeuButton>
                  </div>
                </NeuCard>
              );
            }

            return displayedRoutines.map((rutina) => {
              const relatedErs = ejerciciosRutina.filter((er) => er.id_rutina === rutina.id);
              const diaObj = DIAS_SEMANA.find((d) => d.id === rutina.dia_semana);
              const isRest = rutina.es_descanso || isRutinaDescanso(rutina);
              const isToday = rutina.dia_semana === todayDay;

              return (
                <NeuCard key={rutina.id} className="p-4 flex flex-col gap-3">
                  {/* Routine Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded-md shadow-neu-pressed">
                          {diaObj?.label || `Día ${rutina.dia_semana}`}
                        </span>
                        {isToday && (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-[var(--color-accent-blue)] text-white px-1.5 py-0.2 rounded-full shadow-sm">
                            Hoy
                          </span>
                        )}
                        {isRest && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            Descanso (Oculto al atleta)
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                          {relatedErs.length} ejercicios
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[var(--color-text-main)] leading-tight">
                        {rutina.nombre_sesion}
                      </h3>
                    </div>

                    {/* Actions: Edit / Quick Add / Move / Clear / Rest / Delete */}
                    <div className="flex gap-1.5 items-center">
                      <NeuButton
                        variant="circle"
                        className="w-8 h-8 shadow-neu-flat text-[var(--color-accent-green)] !p-0 flex items-center justify-center"
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
                        className="w-8 h-8 shadow-neu-flat text-[var(--color-accent-blue)] !p-0 flex items-center justify-center"
                        onClick={() => setMoveModalRoutine(rutina)}
                        title="Mover rutina a otro día"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </NeuButton>
                      <NeuButton
                        variant="circle"
                        className="w-8 h-8 shadow-neu-flat text-amber-600 !p-0 flex items-center justify-center disabled:opacity-40"
                        onClick={() => setClearConfirmRoutine(rutina)}
                        disabled={relatedErs.length === 0}
                        title="Limpiar ejercicios de esta rutina"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </NeuButton>
                      <NeuButton
                        variant="circle"
                        className={`w-8 h-8 shadow-neu-flat !p-0 flex items-center justify-center ${
                          isRest ? "text-amber-700 bg-amber-100" : "text-[var(--color-text-muted)]"
                        }`}
                        onClick={() => toggleRutinaDescanso(rutina.id)}
                        title={isRest ? "Activar rutina de entrenamiento" : "Marcar como día de descanso"}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                      </NeuButton>
                      <NeuButton
                        variant="circle"
                        className="w-8 h-8 shadow-neu-flat text-[var(--color-accent-blue)] !p-0 flex items-center justify-center"
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
                <div className="flex flex-col gap-2 pt-1 border-t border-[var(--color-text-muted)]/20">
                  {relatedErs.length === 0 ? (
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[var(--color-bg-base)] shadow-neu-pressed">
                      <span className="text-xs text-[var(--color-text-muted)] italic">Sin ejercicios en esta sesión</span>
                      <button
                        onClick={() => {
                          setQuickAddTargetRoutineId(rutina.id);
                          setExercisePickerOpen(true);
                        }}
                        className="text-xs font-bold text-[var(--color-accent-blue)] flex items-center gap-1"
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
                          className="flex flex-col gap-1.5 py-2 px-3 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col max-w-[210px]">
                              <span className="font-bold text-xs text-[var(--color-text-main)]">
                                {idx + 1}. {ej?.nombre || "Ejercicio"}
                              </span>
                              <span className="text-[9px] text-[var(--color-text-muted)]">{ej?.grupo_muscular || "General"}</span>
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
                                className="p-1 rounded-md text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/10"
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
                          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] flex-wrap">
                            <span className="font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded-md shadow-neu-flat">
                              {er.series_objetivo} series × {er.reps_objetivo}
                            </span>
                            <span className="bg-[var(--color-bg-base)] px-1.5 py-0.5 rounded shadow-neu-flat">
                              Descanso: {er.descanso_segundos}s
                            </span>
                            <span className="bg-[var(--color-bg-base)] px-1.5 py-0.5 rounded shadow-neu-flat">
                              RPE: {er.rpe_objetivo}
                            </span>
                            {er.tempo && er.tempo !== "-" && (
                              <span className="bg-[var(--color-bg-base)] px-1.5 py-0.5 rounded shadow-neu-flat">
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
          });
        })())}
      </div>
    </>
  )}

      {/* Quick Exercise Parameters Editor Modal */}
      <AnimatePresence>
        {editingExerciseParam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--color-text-main)]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-base)] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-[var(--color-text-main)]">Editar Parámetros</h3>
                  <span className="text-xs font-semibold text-[var(--color-accent-blue)]">{editingExerciseParam.ejercicioNombre}</span>
                </div>
                <NeuButton
                  variant="circle"
                  className="w-7 h-7 shadow-neu-flat"
                  onClick={() => setEditingExerciseParam(null)}
                >
                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
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
                  className="flex-1 h-11 text-[var(--color-accent-green)] font-bold text-sm flex items-center justify-center gap-2"
                  onClick={handleSaveQuickParamEdit}
                >
                  <Check className="w-4 h-4" />
                  Guardar Cambios
                </NeuButton>
                <NeuButton
                  className="px-4 h-11 text-[var(--color-text-muted)] text-sm"
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
            className="fixed inset-0 z-50 bg-[var(--color-text-main)]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-base)] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-[var(--color-text-main)]">Copiar Rutinas</h3>
                <NeuButton
                  variant="circle"
                  className="w-7 h-7 shadow-neu-flat"
                  onClick={() => setIsCopyModalOpen(false)}
                >
                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                </NeuButton>
              </div>

              <p className="text-xs text-[var(--color-text-muted)]">
                Selecciona de qué atleta deseas replicar las rutinas hacia{" "}
                <strong className="text-[var(--color-text-main)]">{currentAthlete?.nombre}</strong>:
              </p>

              <select
                className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2.5 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none"
                value={sourceAthleteIdForCopy}
                onChange={(e) => setSourceAthleteIdForCopy(e.target.value)}
              >
                <option value="">-- Seleccionar atleta origen --</option>
                {athletes
                  .filter((a) => a.id !== effectiveAthleteId)
                  .map((a) => {
                    const count = rutinas.filter((r) => isAthleteRoutine(r, a)).length;
                    return (
                      <option key={a.id} value={a.id}>
                        {a.nombre} ({count} rutinas)
                      </option>
                    );
                  })}
              </select>

              <div className="flex gap-2 mt-2">
                <NeuButton
                  className="flex-1 h-11 text-[var(--color-accent-blue)] font-bold text-sm flex items-center justify-center gap-2"
                  onClick={handleCopyFromAthlete}
                  disabled={!sourceAthleteIdForCopy || isSyncing}
                >
                  <Copy className="w-4 h-4" />
                  {isSyncing ? "Copiando..." : "Copiar Rutinas"}
                </NeuButton>
                <NeuButton
                  className="px-4 h-11 text-[var(--color-text-muted)] text-sm"
                  onClick={() => setIsCopyModalOpen(false)}
                >
                  Cancelar
                </NeuButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Routine to Another Day Modal */}
      <AnimatePresence>
        {moveModalRoutine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--color-text-main)]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-base)] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text-main)]">Mover Rutina de Día</h3>
                    <span className="text-xs text-[var(--color-text-muted)]">Reorganizar planificación</span>
                  </div>
                </div>
                <NeuButton
                  variant="circle"
                  className="w-7 h-7 shadow-neu-flat"
                  onClick={() => setMoveModalRoutine(null)}
                >
                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                </NeuButton>
              </div>

              <p className="text-xs text-[var(--color-text-muted)]">
                Mover <strong className="text-[var(--color-text-main)]">{moveModalRoutine.nombre_sesion}</strong> (actualmente en {getDiaSemanaNombre(moveModalRoutine.dia_semana)}) a otro día de la semana:
              </p>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {DIAS_SEMANA.filter((d) => d.id !== moveModalRoutine.dia_semana).map((dia) => {
                  const targetRoutine = athleteRoutines.find((r) => r.dia_semana === dia.id);
                  const isToday = dia.id === todayDay;

                  return (
                    <button
                      key={dia.id}
                      onClick={async () => {
                        await moveRutinaToDay(moveModalRoutine.id, dia.id);
                        setSelectedDayFilter(dia.id);
                        setMoveModalRoutine(null);
                      }}
                      className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed active:shadow-neu-pressed flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--color-text-main)]">{dia.label}</span>
                        {isToday && (
                          <span className="text-[8px] font-black uppercase bg-[var(--color-accent-blue)] text-white px-1.5 py-0.2 rounded-full">
                            Hoy
                          </span>
                        )}
                      </div>
                      {targetRoutine ? (
                        <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md font-bold">
                          Intercambiar con: {targetRoutine.nombre_sesion}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold">
                          Día Libre
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <NeuButton
                className="h-10 text-[var(--color-text-muted)] text-xs font-medium"
                onClick={() => setMoveModalRoutine(null)}
              >
                Cancelar
              </NeuButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Routine Exercises Confirmation Modal */}
      <AnimatePresence>
        {clearConfirmRoutine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--color-text-main)]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-base)] rounded-3xl p-5 w-full max-w-sm shadow-neu-flat flex flex-col gap-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Eraser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--color-text-main)]">Limpiar Ejercicios</h3>
                  <span className="text-xs text-[var(--color-text-muted)]">{clearConfirmRoutine.nombre_sesion}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                ¿Estás seguro de que deseas eliminar todos los ejercicios de la sesión del día{" "}
                <strong className="text-[var(--color-text-main)]">{getDiaSemanaNombre(clearConfirmRoutine.dia_semana)}</strong>?
                <br />
                <span className="text-[11px] text-[var(--color-text-muted)]/80 mt-1 block">
                  La sesión permanecerá programada para este día pero quedará limpia para agregar nuevos ejercicios.
                </span>
              </p>

              <div className="flex gap-2">
                <NeuButton
                  className="flex-1 h-11 text-red-600 font-bold text-xs"
                  onClick={async () => {
                    await clearRutinaEjercicios(clearConfirmRoutine.id);
                    setClearConfirmRoutine(null);
                  }}
                >
                  Limpiar Ejercicios
                </NeuButton>
                <NeuButton
                  className="px-4 h-11 text-[var(--color-text-muted)] text-xs"
                  onClick={() => setClearConfirmRoutine(null)}
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

      {/* Physical Evaluation Modal if requested */}
      <AthleteProgressModal
        isOpen={!!progressModalAthlete}
        onClose={() => setProgressModalAthlete(null)}
        athlete={progressModalAthlete}
      />

      <RoutineAccessControlModal
        isOpen={!!accessModalAthlete}
        athlete={accessModalAthlete}
        onClose={() => setAccessModalAthlete(null)}
      />

      <AthleteSubscriptionModal
        isOpen={!!subscriptionModalAthlete}
        athlete={subscriptionModalAthlete}
        onClose={() => setSubscriptionModalAthlete(null)}
      />

      <ClearAthleteRoutinesModal
        isOpen={isClearAthleteRoutinesOpen}
        athlete={currentAthlete || null}
        onClose={() => setIsClearAthleteRoutinesOpen(false)}
        onConfirm={async (athleteId) => {
          setIsClearingAthleteRoutines(true);
          try {
            await clearAthleteRoutines(athleteId);
            setIsClearAthleteRoutinesOpen(false);
          } finally {
            setIsClearingAthleteRoutines(false);
          }
        }}
        isClearing={isClearingAthleteRoutines}
      />
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
            className="fixed inset-0 z-50 bg-[var(--color-bg-base)]/95 backdrop-blur-sm flex flex-col p-4 max-w-md mx-auto"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--color-text-main)]">Seleccionar Ejercicio</h3>
                <span className="text-[10px] text-[var(--color-text-muted)]">
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
                <ArrowLeft className="w-4 h-4 text-[var(--color-text-muted)]" />
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
                    ? "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)]"
                    : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)]"
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
                      ? "bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-accent-blue)]"
                      : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)]"
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
                    <span className="font-bold text-xs text-[var(--color-text-main)]">{ej.nombre}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{ej.grupo_muscular}</span>
                  </div>
                  <NeuButton
                    variant="circle"
                    className="w-7 h-7 shadow-neu-flat text-[var(--color-accent-blue)] !p-0 flex items-center justify-center shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </NeuButton>
                </NeuCard>
              ))}

              {filteredEjercicios.length === 0 && (
                <div className="text-center text-[var(--color-text-muted)] py-8 text-xs">
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
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-muted)]" />
          </NeuButton>
          <h2 className="text-xl font-bold text-[var(--color-text-main)]">
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
              <span className="text-sm font-medium text-[var(--color-text-muted)] pl-2">Instrucciones / Ejecución</span>
              <textarea
                className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-3 text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/20 resize-none h-24 text-sm"
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                placeholder="Pautas técnicas, recorrido, respiración..."
              />
            </div>

            <NeuButton onClick={handleSave} className="mt-2 h-12 text-[var(--color-accent-blue)] font-bold">
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
          <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Biblioteca</h2>
          <span className="text-xs text-[var(--color-text-muted)]">{ejercicios.length} ejercicios registrados</span>
        </div>
        <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={handleAddNew}>
          <Plus className="w-5 h-5 text-[var(--color-accent-blue)]" />
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
              <span className="font-bold text-[var(--color-text-main)] text-sm">{ej.nombre}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{ej.grupo_muscular}</span>
            </div>
            <NeuButton
              variant="circle"
              className="w-8 h-8 shadow-neu-pressed text-[var(--color-accent-blue)] !p-0 flex items-center justify-center shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </NeuButton>
          </NeuCard>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] my-4 text-sm">No se encontraron ejercicios.</p>
        )}
      </div>
    </div>
  );
}

function CheckinsDashboard() {
  const { usuarios, fichasProgreso, currentUser } = useStore();
  const isTrainer = currentUser?.rol === "entrenador";
  const isAdmin = currentUser?.rol === "admin";

  const athletes = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === "cliente")
      .filter((u) => isAthleteAssignedOrCreatedByTrainer(u, currentUser?.id, isAdmin))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [usuarios, currentUser, isAdmin]);

  const [selectedProgressAthlete, setSelectedProgressAthlete] = useState<Usuario | null>(null);

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Revisiones & Progreso</h2>
        <span className="text-xs text-[var(--color-text-muted)]">Control de fechas de chequeo y avances físicos</span>
      </div>

      <div className="flex flex-col gap-3">
        {athletes.length === 0 ? (
          <NeuCard className="p-6 text-center text-[var(--color-text-muted)] text-sm">
            No tienes atletas asignados o creados actualmente.
          </NeuCard>
        ) : (
          athletes.map((athlete) => {
          const ficha = fichasProgreso.find((f) => f.id_cliente === athlete.id);

          let diasRestantes: number | null = null;
          if (ficha?.fecha_chequeo) {
            const target = new Date(ficha.fecha_chequeo).getTime();
            const today = new Date().setHours(0, 0, 0, 0);
            diasRestantes = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
          }

          return (
            <NeuCard key={athlete.id} className="flex flex-col gap-3 p-4">
              <div className="flex justify-between items-center border-b border-[var(--color-text-muted)]/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[var(--color-accent-blue)]">
                    {athlete.nombre.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-text-main)] text-sm">{athlete.nombre}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
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
                  <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-base)] px-2 py-0.5 rounded shadow-neu-pressed">
                    Pendiente
                  </span>
                )}
              </div>

              {/* Physical stats summary */}
              {ficha ? (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-[var(--color-bg-base)] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[var(--color-text-muted)]">Peso</span>
                    <span className="font-bold text-[var(--color-text-main)] text-xs">{ficha.peso_kg} kg</span>
                  </div>
                  <div className="bg-[var(--color-bg-base)] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[var(--color-text-muted)]">% Grasa</span>
                    <span className="font-bold text-[var(--color-text-main)] text-xs">
                      {ficha.grasa_porcentaje ? `${ficha.grasa_porcentaje}%` : "--"}
                    </span>
                  </div>
                  <div className="bg-[var(--color-bg-base)] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[var(--color-text-muted)]">% Músculo</span>
                    <span className="font-bold text-[var(--color-text-main)] text-xs">
                      {ficha.musculo_porcentaje ? `${ficha.musculo_porcentaje}%` : "--"}
                    </span>
                  </div>
                  <div className="bg-[var(--color-bg-base)] shadow-neu-pressed p-2 rounded-xl flex flex-col">
                    <span className="text-[9px] text-[var(--color-text-muted)]">Cintura</span>
                    <span className="font-bold text-[var(--color-text-main)] text-xs">
                      {ficha.cintura_cm ? `${ficha.cintura_cm} cm` : "--"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic">No se han registrado mediciones antropométricas.</p>
              )}

              {ficha?.notas_entrenador && (
                <p className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-base)] p-2 rounded-xl shadow-neu-pressed line-clamp-2">
                  <strong className="text-[var(--color-text-main)]">Pauta:</strong> {ficha.notas_entrenador}
                </p>
              )}

              <NeuButton
                className={`w-full flex gap-2 justify-center font-bold text-xs h-10 ${
                  ficha ? "text-[var(--color-accent-blue)]" : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-neu-flat"
                }`}
                onClick={() => setSelectedProgressAthlete(athlete)}
              >
                <Activity className="w-4 h-4" />
                {ficha ? "Actualizar Ficha & Chequeo" : "Crear Ficha Inicial (Requerida para entrenar)"}
              </NeuButton>
            </NeuCard>
          );
        }))}
      </div>

      <AthleteProgressModal
        isOpen={!!selectedProgressAthlete}
        onClose={() => setSelectedProgressAthlete(null)}
        athlete={selectedProgressAthlete}
      />
    </div>
  );
}
