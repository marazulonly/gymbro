import React, { useState, useEffect } from "react";
import { useStore, isAthleteRoutine } from "@/store";
import { Usuario, FichaProgreso } from "@/types";
import { NeuCard } from "./ui/NeuCard";
import { NeuInput } from "./ui/NeuInput";
import { NeuButton } from "./ui/NeuButton";
import { 
  X, 
  Calendar, 
  Activity, 
  Ruler, 
  Target, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  Upload, 
  Eye, 
  Image as ImageIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { optimizeImageTo72Dpi } from "@/utils/imageOptimizer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  athlete: Usuario | null;
}

export function AthleteProgressModal({ isOpen, onClose, athlete }: Props) {
  const { 
    currentUser, 
    fichasProgreso, 
    rutinas, 
    ejerciciosRutina, 
    clearAthleteRoutines, 
    addFichaProgreso, 
    updateFichaProgreso 
  } = useStore();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isClearingRoutines, setIsClearingRoutines] = useState(false);
  const [clearSuccessMsg, setClearSuccessMsg] = useState<string | null>(null);

  // Form states
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaChequeo, setFechaChequeo] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [alturaCm, setAlturaCm] = useState("");
  const [grasaPorcentaje, setGrasaPorcentaje] = useState("");
  const [musculoPorcentaje, setMusculoPorcentaje] = useState("");
  const [pechoCm, setPechoCm] = useState("");
  const [cinturaCm, setCinturaCm] = useState("");
  const [caderaCm, setCaderaCm] = useState("");
  const [brazoCm, setBrazoCm] = useState("");
  const [musloCm, setMusloCm] = useState("");
  const [pantorrillaCm, setPantorrillaCm] = useState("");
  const [objetivo, setObjetivo] = useState("Pérdida de grasa y tonificación");
  const [nivel, setNivel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [adherencia, setAdherencia] = useState("95");
  const [notas, setNotas] = useState("");

  // Foto de progreso (conversión automática 72 DPI)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoNombre, setFotoNombre] = useState<string | null>(null);
  const [isProcessingFoto, setIsProcessingFoto] = useState(false);
  const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null);

  const existingFicha = fichasProgreso.find((f) => f.id_cliente === athlete?.id);

  useEffect(() => {
    if (athlete && isOpen) {
      if (existingFicha) {
        setFechaInicio(existingFicha.fecha_inicio || "");
        setFechaChequeo(existingFicha.fecha_chequeo || "");
        setPesoKg(existingFicha.peso_kg ? String(existingFicha.peso_kg) : "");
        setAlturaCm(existingFicha.altura_cm ? String(existingFicha.altura_cm) : "");
        setGrasaPorcentaje(existingFicha.grasa_porcentaje ? String(existingFicha.grasa_porcentaje) : "");
        setMusculoPorcentaje(existingFicha.musculo_porcentaje ? String(existingFicha.musculo_porcentaje) : "");
        setPechoCm(existingFicha.pecho_cm ? String(existingFicha.pecho_cm) : "");
        setCinturaCm(existingFicha.cintura_cm ? String(existingFicha.cintura_cm) : "");
        setCaderaCm(existingFicha.cadera_cm ? String(existingFicha.cadera_cm) : "");
        setBrazoCm(existingFicha.brazo_cm ? String(existingFicha.brazo_cm) : "");
        setMusloCm(existingFicha.muslo_cm ? String(existingFicha.muslo_cm) : "");
        setPantorrillaCm(existingFicha.pantorrilla_cm ? String(existingFicha.pantorrilla_cm) : "");
        setObjetivo(existingFicha.objetivo_principal || "Pérdida de grasa y tonificación");
        setNivel(existingFicha.nivel || "Intermedio");
        setAdherencia(existingFicha.adherencia_porcentaje ? String(existingFicha.adherencia_porcentaje) : "95");
        setNotas(existingFicha.notas_entrenador || "");
        setFotoUrl(existingFicha.foto_url || null);
        setFotoNombre(existingFicha.foto_nombre || null);
      } else {
        // Defaults
        const today = new Date().toISOString().split("T")[0];
        const nextCheck = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        setFechaInicio(today);
        setFechaChequeo(nextCheck);
        setPesoKg("62.5");
        setAlturaCm("165");
        setGrasaPorcentaje("22.5");
        setMusculoPorcentaje("31.0");
        setPechoCm("88");
        setCinturaCm("68");
        setCaderaCm("96");
        setBrazoCm("28");
        setMusloCm("54");
        setPantorrillaCm("34");
        setObjetivo("Pérdida de grasa y tonificación");
        setNivel("Intermedio");
        setAdherencia("95");
        setNotas("Excelente progreso en técnica y constancia. Seguir progresión de cargas en tren inferior.");
        setFotoUrl(null);
        setFotoNombre(null);
      }
      setSavedSuccess(false);
    }
  }, [athlete, isOpen, existingFicha]);

  // Handle Photo Upload with 72 DPI optimization
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFoto(true);
    try {
      // 72 DPI client-side optimization
      const result = await optimizeImageTo72Dpi(file, 1200, 0.82);
      setFotoUrl(result.dataUrl);
      setFotoNombre(file.name);
    } catch (error) {
      console.error("Error optimizando imagen a 72 DPI:", error);
      alert("No se pudo procesar la imagen. Intenta con otra imagen.");
    } finally {
      setIsProcessingFoto(false);
      e.target.value = "";
    }
  };

  // Compute BMI
  const numPeso = parseFloat(pesoKg);
  const numAltura = parseFloat(alturaCm);
  let imc: string | null = null;
  let imcLabel = "";
  if (!isNaN(numPeso) && !isNaN(numAltura) && numAltura > 0) {
    const alturaM = numAltura / 100;
    const calc = numPeso / (alturaM * alturaM);
    imc = calc.toFixed(1);
    if (calc < 18.5) imcLabel = "Bajo peso";
    else if (calc < 25) imcLabel = "Normopeso";
    else if (calc < 30) imcLabel = "Sobrepeso";
    else imcLabel = "Obesidad";
  }

  // Compute days until check-in
  let diasRestantes: number | null = null;
  if (fechaChequeo) {
    const target = new Date(fechaChequeo).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    diasRestantes = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete) return;

    const payload: FichaProgreso = {
      id: existingFicha ? existingFicha.id : `fp_${athlete.id}_${Date.now()}`,
      id_cliente: athlete.id,
      id_entrenador: currentUser?.id || "entrenador1",
      fecha_inicio: fechaInicio || new Date().toISOString().split("T")[0],
      fecha_chequeo: fechaChequeo || new Date().toISOString().split("T")[0],
      peso_kg: parseFloat(pesoKg) || 0,
      altura_cm: parseFloat(alturaCm) || 0,
      grasa_porcentaje: grasaPorcentaje ? parseFloat(grasaPorcentaje) : undefined,
      musculo_porcentaje: musculoPorcentaje ? parseFloat(musculoPorcentaje) : undefined,
      pecho_cm: pechoCm ? parseFloat(pechoCm) : undefined,
      cintura_cm: cinturaCm ? parseFloat(cinturaCm) : undefined,
      cadera_cm: caderaCm ? parseFloat(caderaCm) : undefined,
      brazo_cm: brazoCm ? parseFloat(brazoCm) : undefined,
      muslo_cm: musloCm ? parseFloat(musloCm) : undefined,
      pantorrilla_cm: pantorrillaCm ? parseFloat(pantorrillaCm) : undefined,
      objetivo_principal: objetivo,
      nivel,
      adherencia_porcentaje: adherencia ? parseFloat(adherencia) : 90,
      notas_entrenador: notas,
      foto_url: fotoUrl || undefined,
      foto_nombre: fotoNombre || undefined,
      fecha_actualizacion: new Date().toISOString().split("T")[0],
    };

    if (existingFicha) {
      await updateFichaProgreso(payload);
    } else {
      await addFichaProgreso(payload);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const athleteRoutines = athlete ? rutinas.filter((r) => isAthleteRoutine(r, athlete)) : [];
  const isXiomara = athlete?.dni === '10101010' || athlete?.dni === '11111111' || athlete?.id === 'u1' || athlete?.id === 'xb-9988-fit' || (athlete?.nombre || '').toLowerCase().includes('xiomara');
  const routineIds = new Set(athleteRoutines.map((r) => r.id));
  if (isXiomara) {
    ['r1', 'r2', 'r3', 'r4', 'r5'].forEach((id) => routineIds.add(id));
  }
  const athleteExercisesCount = ejerciciosRutina.filter((er) => routineIds.has(er.id_rutina)).length;

  const handleClearRoutines = async () => {
    if (!athlete) return;
    setIsClearingRoutines(true);
    try {
      await clearAthleteRoutines(athlete.id);
      setClearSuccessMsg(`Se han borrado todas las rutinas y ejercicios de todos los días de ${athlete.nombre}.`);
      setIsConfirmClearOpen(false);
      setTimeout(() => setClearSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error clearing routines from athlete ficha:', err);
    } finally {
      setIsClearingRoutines(false);
    }
  };

  if (!athlete) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-50 bg-[var(--color-bg-base)] flex flex-col p-4 overflow-y-auto max-w-md mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-[var(--color-accent-blue)]">
                {athlete.nombre.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-main)] leading-tight">{athlete.nombre}</h2>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {existingFicha ? "Ficha de Progreso & Chequeos" : "Ficha Inicial del Atleta"}
                </span>
              </div>
            </div>
            <NeuButton variant="circle" className="w-9 h-9 shadow-neu-flat" onClick={onClose}>
              <X className="w-4 h-4 text-[var(--color-text-muted)]" />
            </NeuButton>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4 pb-12">
            {/* Informative banner about Ficha Inicial requirement */}
            {!existingFicha && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2.5 text-xs">
                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[13px] mb-0.5">Ficha Inicial Obligatoria</span>
                  Antes de iniciar el entrenamiento, crea esta Ficha Inicial con los datos de referencia para usarlos cuando se evalúe al atleta en la fecha correspondiente y medir sus indicadores.
                </div>
              </div>
            )}

            {/* Status & Fechas Clave */}
            <NeuCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[var(--color-accent-blue)] font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Control de Fechas & Revisiones</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NeuInput
                  label="Fecha de Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
                <NeuInput
                  label="Próximo Chequeo"
                  type="date"
                  value={fechaChequeo}
                  onChange={(e) => setFechaChequeo(e.target.value)}
                  required
                />
              </div>

              {/* Countdown badge */}
              {diasRestantes !== null && (
                <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-bg-base)] rounded-xl shadow-neu-pressed text-xs">
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                    <span>Plazo de evaluación:</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                      diasRestantes < 0
                        ? "bg-red-100 text-red-600"
                        : diasRestantes <= 3
                        ? "bg-amber-100 text-amber-700 font-bold animate-pulse"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {diasRestantes < 0
                      ? `Vencido hace ${Math.abs(diasRestantes)}d`
                      : diasRestantes === 0
                      ? "¡Revisión Hoy!"
                      : `Faltan ${diasRestantes} días`}
                  </span>
                </div>
              )}
            </NeuCard>

            {/* Composición Corporal & Métricas Principales */}
            <NeuCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-accent-blue)] font-bold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Composición Corporal</span>
                </div>
                {imc && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[var(--color-bg-base)] shadow-neu-pressed text-[var(--color-text-main)]">
                    IMC: {imc} ({imcLabel})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NeuInput
                  label="Peso Actual (kg)"
                  type="number"
                  step="0.1"
                  value={pesoKg}
                  onChange={(e) => setPesoKg(e.target.value)}
                  placeholder="ej. 62.5"
                  required
                />
                <NeuInput
                  label="Altura (cm)"
                  type="number"
                  value={alturaCm}
                  onChange={(e) => setAlturaCm(e.target.value)}
                  placeholder="ej. 165"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NeuInput
                  label="% Grasa Corporal"
                  type="number"
                  step="0.1"
                  value={grasaPorcentaje}
                  onChange={(e) => setGrasaPorcentaje(e.target.value)}
                  placeholder="ej. 22.5"
                />
                <NeuInput
                  label="% Masa Muscular"
                  type="number"
                  step="0.1"
                  value={musculoPorcentaje}
                  onChange={(e) => setMusculoPorcentaje(e.target.value)}
                  placeholder="ej. 31.0"
                />
              </div>
            </NeuCard>

            {/* Medidas Antropométricas */}
            <NeuCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[var(--color-accent-blue)] font-bold text-xs uppercase tracking-wider">
                <Ruler className="w-4 h-4" />
                <span>Medidas Antropométricas (cm)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <NeuInput
                  label="Pecho"
                  type="number"
                  step="0.5"
                  value={pechoCm}
                  onChange={(e) => setPechoCm(e.target.value)}
                  placeholder="88"
                  className="text-center text-sm"
                />
                <NeuInput
                  label="Cintura"
                  type="number"
                  step="0.5"
                  value={cinturaCm}
                  onChange={(e) => setCinturaCm(e.target.value)}
                  placeholder="68"
                  className="text-center text-sm"
                />
                <NeuInput
                  label="Cadera"
                  type="number"
                  step="0.5"
                  value={caderaCm}
                  onChange={(e) => setCaderaCm(e.target.value)}
                  placeholder="96"
                  className="text-center text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <NeuInput
                  label="Brazo / Bíceps"
                  type="number"
                  step="0.5"
                  value={brazoCm}
                  onChange={(e) => setBrazoCm(e.target.value)}
                  placeholder="28"
                  className="text-center text-sm"
                />
                <NeuInput
                  label="Muslo"
                  type="number"
                  step="0.5"
                  value={musloCm}
                  onChange={(e) => setMusloCm(e.target.value)}
                  placeholder="54"
                  className="text-center text-sm"
                />
                <NeuInput
                  label="Pantorrilla"
                  type="number"
                  step="0.5"
                  value={pantorrillaCm}
                  onChange={(e) => setPantorrillaCm(e.target.value)}
                  placeholder="34"
                  className="text-center text-sm"
                />
              </div>
            </NeuCard>

            {/* Objetivo y Notas del Entrenador */}
            <NeuCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[var(--color-accent-blue)] font-bold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Pautas & Observaciones Técnicas</span>
              </div>

              <NeuInput
                label="Objetivo Principal"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="ej. Pérdida de grasa y tonificación"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--color-text-muted)] pl-2">Nivel Atleta</span>
                  <select
                    className="w-full rounded-2xl bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/20"
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value as any)}
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>

                <NeuInput
                  label="Adherencia (%)"
                  type="number"
                  value={adherencia}
                  onChange={(e) => setAdherencia(e.target.value)}
                  placeholder="95"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--color-text-muted)] pl-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                  Observaciones para el Atleta
                </span>
                <textarea
                  className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2.5 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/20 resize-none h-24"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Indica pautas nutricionales, control de sobrecarga progresiva, descansos o sensaciones..."
                />
              </div>
            </NeuCard>

            {/* Foto de Progreso / Chequeo Visual (Resolución 72 DPI automática para la nube) */}
            <NeuCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-accent-blue)] font-bold text-xs uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>Foto de Progreso / Chequeo Visual</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] font-normal px-2 py-0.5 rounded-lg bg-[var(--color-bg-base)] shadow-neu-pressed">
                  72 DPI Automático
                </span>
              </div>

              {fotoUrl ? (
                <div className="p-3 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={fotoUrl}
                      alt="Foto de progreso"
                      onClick={() => setPreviewFotoUrl(fotoUrl)}
                      className="w-14 h-14 object-cover rounded-xl shadow-neu-flat cursor-pointer border border-emerald-500/40 hover:opacity-90 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                        {fotoNombre || "Foto de progreso adjunta"}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)] block">
                        Optimizada a 72 DPI lista para guardar
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewFotoUrl(fotoUrl)}
                      className="p-2 text-xs font-bold text-[var(--color-accent-blue)] rounded-xl shadow-neu-flat hover:shadow-neu-pressed active:scale-95 transition-all"
                      title="Ver imagen completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFotoUrl(null);
                        setFotoNombre(null);
                      }}
                      className="p-2 text-xs font-bold text-red-500 rounded-xl shadow-neu-flat hover:shadow-neu-pressed active:scale-95 transition-all"
                      title="Eliminar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-[var(--color-accent-blue)] bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed active:scale-95 transition-all border border-[var(--color-accent-blue)]/30">
                    <Upload className="w-4 h-4" />
                    <span>{isProcessingFoto ? "Optimizando a 72 DPI..." : "Adjuntar Imagen"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoUpload}
                      disabled={isProcessingFoto}
                    />
                  </label>
                  <span className="block text-[11px] text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                    Adjunta una fotografía de control físico o chequeo. Al pulsar "Guardar Ficha de Progreso" o "Crear Ficha Inicial", se convierte automáticamente a resolución 72 DPI antes de guardarse en la nube.
                  </span>
                </div>
              )}
            </NeuCard>

            {/* Gestión de Rutinas: Limpiar Rutinas */}
            <NeuCard className="p-4 flex flex-col gap-3 border border-red-500/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Gestión de Rutinas</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                  {athleteRoutines.length} {athleteRoutines.length === 1 ? "día" : "días"} ({athleteExercisesCount} {athleteExercisesCount === 1 ? "ejercicio" : "ejercicios"})
                </span>
              </div>

              {clearSuccessMsg ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{clearSuccessMsg}</span>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Al pulsar <strong>Limpiar Rutinas</strong> se borrarán <strong>TODOS</strong> los ejercicios y rutinas de todos los días para este atleta, permitiéndole empezar desde cero o reasignar un nuevo plan. Los demás datos de la ficha permanecerán intactos.
                </p>
              )}

              {isConfirmClearOpen ? (
                <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/30 flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>¿Confirmar eliminación total de rutinas?</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Se borrarán las {athleteRoutines.length} rutinas y {athleteExercisesCount} ejercicios de {athlete?.nombre} de todos los días. Esta acción no se puede deshacer.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <NeuButton
                      type="button"
                      onClick={() => setIsConfirmClearOpen(false)}
                      className="flex-1 h-9 text-xs font-medium text-[var(--color-text-muted)]"
                      disabled={isClearingRoutines}
                    >
                      Cancelar
                    </NeuButton>
                    <NeuButton
                      type="button"
                      onClick={handleClearRoutines}
                      disabled={isClearingRoutines}
                      className="flex-1 h-9 text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5"
                    >
                      {isClearingRoutines ? (
                        <span>Borrando...</span>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Sí, Limpiar Rutinas</span>
                        </>
                      )}
                    </NeuButton>
                  </div>
                </div>
              ) : (
                <NeuButton
                  type="button"
                  onClick={() => setIsConfirmClearOpen(true)}
                  disabled={athleteRoutines.length === 0 && athleteExercisesCount === 0}
                  className="h-10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Limpiar Rutinas</span>
                </NeuButton>
              )}
            </NeuCard>

            {/* Save Button */}
            <NeuButton
              type="submit"
              className={`h-12 font-bold text-base flex items-center justify-center gap-2 transition-all ${
                savedSuccess ? "text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/15" : "text-[var(--color-accent-blue)]"
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-green)]" />
                  {existingFicha ? "¡Ficha Actualizada con Éxito!" : "¡Ficha Inicial Creada con Éxito!"}
                </>
              ) : (
                existingFicha ? "Guardar Ficha de Progreso" : "Crear Ficha Inicial y Habilitar Entrenamiento"
              )}
            </NeuButton>
          </form>

          {/* Modal de Vista Previa de Foto de Progreso */}
          <AnimatePresence>
            {previewFotoUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={() => setPreviewFotoUrl(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-[var(--color-bg-base)] p-3.5 rounded-3xl max-w-lg w-full shadow-2xl border border-[var(--color-text-muted)]/20 overflow-hidden flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[var(--color-accent-blue)]" />
                      Foto de Progreso (72 DPI) - {athlete.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewFotoUrl(null)}
                      className="p-1.5 rounded-full shadow-neu-flat text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center max-h-[70vh]">
                    <img
                      src={previewFotoUrl}
                      alt="Foto de progreso completa"
                      className="max-h-[70vh] w-auto object-contain rounded-xl"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
