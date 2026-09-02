import React, { useState, useEffect } from "react";
import { useStore } from "@/store";
import { Usuario, FichaProgreso } from "@/types";
import { NeuCard } from "./ui/NeuCard";
import { NeuInput } from "./ui/NeuInput";
import { NeuButton } from "./ui/NeuButton";
import { X, Calendar, Activity, Ruler, Target, CheckCircle2, Clock, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  athlete: Usuario | null;
}

export function AthleteProgressModal({ isOpen, onClose, athlete }: Props) {
  const { currentUser, fichasProgreso, addFichaProgreso, updateFichaProgreso } = useStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      }
      setSavedSuccess(false);
    }
  }, [athlete, isOpen, existingFicha]);

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
                <span className="text-[11px] text-[var(--color-text-muted)]">Ficha de Progreso & Chequeos</span>
              </div>
            </div>
            <NeuButton variant="circle" className="w-9 h-9 shadow-neu-flat" onClick={onClose}>
              <X className="w-4 h-4 text-[var(--color-text-muted)]" />
            </NeuButton>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4 pb-12">
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
                <div className="flex items-center gap-2 text-[#4D7CFE] font-bold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Composición Corporal</span>
                </div>
                {imc && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#E0E5EC] shadow-neu-pressed text-[#2D3748]">
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
              <div className="flex items-center gap-2 text-[#4D7CFE] font-bold text-xs uppercase tracking-wider">
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
              <div className="flex items-center gap-2 text-[#4D7CFE] font-bold text-xs uppercase tracking-wider">
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
                  <span className="text-xs font-medium text-[#718096] pl-2">Nivel Atleta</span>
                  <select
                    className="w-full rounded-2xl bg-[#E0E5EC] px-3 py-2 text-sm text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20"
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
                <span className="text-xs font-medium text-[#718096] pl-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#4D7CFE]" />
                  Observaciones para el Atleta
                </span>
                <textarea
                  className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-2.5 text-sm text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 resize-none h-24"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Indica pautas nutricionales, control de sobrecarga progresiva, descansos o sensaciones..."
                />
              </div>
            </NeuCard>

            {/* Save Button */}
            <NeuButton
              type="submit"
              className={`h-12 font-bold text-base flex items-center justify-center gap-2 transition-all ${
                savedSuccess ? "text-[#00C9A7] bg-emerald-50" : "text-[#4D7CFE]"
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#00C9A7]" />
                  ¡Ficha Guardada con Éxito!
                </>
              ) : (
                "Guardar Ficha de Progreso"
              )}
            </NeuButton>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
