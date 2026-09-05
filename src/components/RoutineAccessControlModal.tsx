import React, { useState, useEffect } from "react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { 
  Lock, 
  Unlock, 
  Calendar, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  X, 
  Sliders, 
  AlertCircle,
  Copy,
  Sparkles,
  ShieldCheck,
  CalendarCheck
} from "lucide-react";
import { Usuario, ModoControlAcceso, ControlAccesoRutinas, FranjaHorariaDia } from "@/types";
import { DIAS_SEMANA_COMPLETO, DEFAULT_FRANJA_HORARIA } from "@/utils/routineAccess";
import { useStore } from "@/store";

interface RoutineAccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Usuario | null;
}

export function RoutineAccessControlModal({
  isOpen,
  onClose,
  athlete,
}: RoutineAccessControlModalProps) {
  const { updateUsuario, currentUser } = useStore();

  const [modo, setModo] = useState<ModoControlAcceso>("siempre_visible");
  const [manualActivo, setManualActivo] = useState<boolean>(true);
  const [franjas, setFranjas] = useState<{ [dia: number]: FranjaHorariaDia }>({});
  const [mensajePersonalizado, setMensajePersonalizado] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Initialize or update state from athlete's current configuration
  useEffect(() => {
    if (athlete) {
      const cfg = athlete.control_acceso;
      setModo(cfg?.modo || "siempre_visible");
      setManualActivo(cfg?.manual_activo !== false); // default to true
      setMensajePersonalizado(cfg?.mensaje_personalizado || "");

      // Initialize default franjas if not present
      const initialFranjas: { [dia: number]: FranjaHorariaDia } = {};
      DIAS_SEMANA_COMPLETO.forEach((d) => {
        if (cfg?.franjas_semanales?.[d.id]) {
          initialFranjas[d.id] = { ...cfg.franjas_semanales[d.id] };
        } else {
          initialFranjas[d.id] = {
            activo: d.id !== 0, // default active Lun-Sáb
            hora_inicio: "06:00",
            hora_fin: "22:00",
          };
        }
      });
      setFranjas(initialFranjas);
      setSaveSuccess(false);
    }
  }, [athlete, isOpen]);

  if (!isOpen || !athlete) return null;

  const handleToggleDay = (diaId: number) => {
    setFranjas((prev) => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        activo: !prev[diaId]?.activo,
      },
    }));
  };

  const handleTimeChange = (diaId: number, field: "hora_inicio" | "hora_fin", value: string) => {
    setFranjas((prev) => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        [field]: value,
      },
    }));
  };

  const handleApplyTimeToAllActive = (sourceDiaId: number) => {
    const src = franjas[sourceDiaId];
    if (!src) return;
    setFranjas((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        const diaNum = Number(k);
        updated[diaNum] = {
          ...updated[diaNum],
          hora_inicio: src.hora_inicio,
          hora_fin: src.hora_fin,
        };
      });
      return updated;
    });
  };

  const handlePresetAllDays = () => {
    setFranjas((prev) => {
      const updated = { ...prev };
      DIAS_SEMANA_COMPLETO.forEach((d) => {
        updated[d.id] = {
          activo: true,
          hora_inicio: updated[d.id]?.hora_inicio || "06:00",
          hora_fin: updated[d.id]?.hora_fin || "22:00",
        };
      });
      return updated;
    });
  };

  const handlePresetWeekdays = () => {
    setFranjas((prev) => {
      const updated = { ...prev };
      DIAS_SEMANA_COMPLETO.forEach((d) => {
        const isWeekday = d.id >= 1 && d.id <= 5;
        updated[d.id] = {
          activo: isWeekday,
          hora_inicio: updated[d.id]?.hora_inicio || "06:00",
          hora_fin: updated[d.id]?.hora_fin || "22:00",
        };
      });
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedControlAcceso: ControlAccesoRutinas = {
        modo,
        manual_activo: manualActivo,
        franjas_semanales: franjas,
        mensaje_personalizado: mensajePersonalizado.trim() || undefined,
        ultima_actualizacion: new Date().toISOString(),
      };

      const updatedAthlete: Usuario = {
        ...athlete,
        control_acceso: updatedControlAcceso,
      };

      await updateUsuario(updatedAthlete);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error("Error saving routine access configuration:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <NeuCard className="w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 my-auto max-h-[92vh] overflow-y-auto bg-[var(--color-bg-base)]">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[var(--color-text-muted)]/15 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                Control de Acceso a Rutinas
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Atleta: <span className="font-bold text-[var(--color-text-main)]">{athlete.nombre}</span> (DNI: {athlete.dni})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector - Exclusive Radio Cards */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Seleccionar Modo de Acceso (Exclusivo)
          </span>

          {/* Mode 1: Siempre visible */}
          <div
            onClick={() => setModo("siempre_visible")}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              modo === "siempre_visible"
                ? "shadow-neu-pressed bg-[var(--color-bg-base)] border-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/30"
                : "shadow-neu-flat bg-[var(--color-bg-base)] border-transparent hover:border-[var(--color-text-muted)]/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    modo === "siempre_visible"
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]"
                      : "border-[var(--color-text-muted)]/40 bg-transparent"
                  }`}
                >
                  {modo === "siempre_visible" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <span>1. Siempre visible</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                      Por defecto
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Acceso total e irrestricto a todas sus rutinas en cualquier momento.
                  </p>
                </div>
              </div>
              <Unlock className={`w-4 h-4 shrink-0 ${modo === "siempre_visible" ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-muted)]"}`} />
            </div>
          </div>

          {/* Mode 2: Solo hoy */}
          <div
            onClick={() => setModo("solo_hoy")}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              modo === "solo_hoy"
                ? "shadow-neu-pressed bg-[var(--color-bg-base)] border-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/30"
                : "shadow-neu-flat bg-[var(--color-bg-base)] border-transparent hover:border-[var(--color-text-muted)]/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    modo === "solo_hoy"
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]"
                      : "border-[var(--color-text-muted)]/40 bg-transparent"
                  }`}
                >
                  {modo === "solo_hoy" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <span>2. Solo hoy</span>
                    <span className="text-[10px] font-semibold text-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/10 px-2 py-0.2 rounded-full">
                      Fecha actual
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Solo visualiza y ejecuta las rutinas asignadas a la fecha actual (00:00 a 23:59 en su zona horaria). Los demás días quedan bloqueados.
                  </p>
                </div>
              </div>
              <CalendarCheck className={`w-4 h-4 shrink-0 ${modo === "solo_hoy" ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-muted)]"}`} />
            </div>
          </div>

          {/* Mode 3: Horario manual */}
          <div
            onClick={() => setModo("horario_manual")}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              modo === "horario_manual"
                ? "shadow-neu-pressed bg-[var(--color-bg-base)] border-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/30"
                : "shadow-neu-flat bg-[var(--color-bg-base)] border-transparent hover:border-[var(--color-text-muted)]/20"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all mt-0.5 ${
                    modo === "horario_manual"
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]"
                      : "border-[var(--color-text-muted)]/40 bg-transparent"
                  }`}
                >
                  {modo === "horario_manual" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <span>3. Horario manual</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      manualActivo 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" 
                        : "text-red-600 dark:text-red-400 bg-red-500/10"
                    }`}>
                      {manualActivo ? "Habilitado (ON)" : "Pausado (OFF)"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Controla el acceso con un interruptor inmediato ON / OFF. Si está en OFF, el atleta verá su rutina pausada.
                  </p>
                </div>
              </div>
              <Lock className={`w-4 h-4 shrink-0 mt-0.5 ${modo === "horario_manual" ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-muted)]"}`} />
            </div>

            {/* Sub-config for Mode 3: Manual Switch */}
            {modo === "horario_manual" && (
              <div 
                className="mt-3 pt-3 border-t border-[var(--color-text-muted)]/15 flex items-center justify-between px-2 bg-[var(--color-bg-base)] rounded-xl py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--color-text-main)]">
                    Estado del Interruptor:
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    {manualActivo ? "El atleta puede ingresar ahora mismo" : "Acceso bloqueado actualmente"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setManualActivo(!manualActivo)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-neu-flat active:shadow-neu-pressed cursor-pointer ${
                    manualActivo
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {manualActivo ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span>ON (Permitido)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span>OFF (Bloqueado)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mode 4: Por franja horaria */}
          <div
            onClick={() => setModo("franja_horaria")}
            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
              modo === "franja_horaria"
                ? "shadow-neu-pressed bg-[var(--color-bg-base)] border-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/30"
                : "shadow-neu-flat bg-[var(--color-bg-base)] border-transparent hover:border-[var(--color-text-muted)]/20"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all mt-0.5 ${
                    modo === "franja_horaria"
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]"
                      : "border-[var(--color-text-muted)]/40 bg-transparent"
                  }`}
                >
                  {modo === "franja_horaria" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <span>4. Por franja horaria</span>
                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.2 rounded-full">
                      Días y Horas
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Define qué días y en qué horario específico (Hora inicio — Hora fin) el atleta puede visualizar y registrar ejercicios.
                  </p>
                </div>
              </div>
              <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${modo === "franja_horaria" ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-muted)]"}`} />
            </div>

            {/* Sub-config for Mode 4: Days and Hours Selector */}
            {modo === "franja_horaria" && (
              <div 
                className="mt-3 pt-3 border-t border-[var(--color-text-muted)]/15 flex flex-col gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Presets */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-semibold text-[var(--color-text-muted)]">Preajustes rápidos:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handlePresetWeekdays}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed text-[var(--color-accent-blue)] cursor-pointer"
                    >
                      Lun - Vie
                    </button>
                    <button
                      type="button"
                      onClick={handlePresetAllDays}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed text-[var(--color-accent-blue)] cursor-pointer"
                    >
                      Todos (7 días)
                    </button>
                  </div>
                </div>

                {/* Day Rows */}
                <div className="flex flex-col gap-2">
                  {DIAS_SEMANA_COMPLETO.map((dia) => {
                    const franja = franjas[dia.id] || { activo: false, hora_inicio: "06:00", hora_fin: "22:00" };
                    return (
                      <div
                        key={dia.id}
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-2 transition-all ${
                          franja.activo
                            ? "bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-accent-blue)]/20"
                            : "bg-[var(--color-bg-base)] shadow-neu-flat opacity-65"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 w-28 shrink-0">
                          <input
                            type="checkbox"
                            id={`check-dia-${dia.id}`}
                            checked={franja.activo}
                            onChange={() => handleToggleDay(dia.id)}
                            className="w-4 h-4 accent-[var(--color-accent-blue)] rounded cursor-pointer"
                          />
                          <label
                            htmlFor={`check-dia-${dia.id}`}
                            className={`text-xs font-bold cursor-pointer ${
                              franja.activo ? "text-[var(--color-text-main)]" : "text-[var(--color-text-muted)]"
                            }`}
                          >
                            {dia.label}
                          </label>
                        </div>

                        {franja.activo ? (
                          <div className="flex items-center gap-2 text-xs flex-1 justify-end">
                            <input
                              type="time"
                              value={franja.hora_inicio}
                              onChange={(e) => handleTimeChange(dia.id, "hora_inicio", e.target.value)}
                              className="px-2 py-1 rounded-lg bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-main)] font-semibold text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent-blue)]"
                            />
                            <span className="text-[var(--color-text-muted)] font-bold">—</span>
                            <input
                              type="time"
                              value={franja.hora_fin}
                              onChange={(e) => handleTimeChange(dia.id, "hora_fin", e.target.value)}
                              className="px-2 py-1 rounded-lg bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-main)] font-semibold text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent-blue)]"
                            />
                            <button
                              type="button"
                              title="Copiar este horario a todos los demás días"
                              onClick={() => handleApplyTimeToAllActive(dia.id)}
                              className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/10 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--color-text-muted)] italic pr-2">
                            Acceso bloqueado todo el día
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5 p-2 rounded-xl bg-[var(--color-accent-blue)]/5 border border-[var(--color-accent-blue)]/15">
                  <AlertCircle className="w-4 h-4 text-[var(--color-accent-blue)] shrink-0" />
                  <span>
                    Los horarios se evalúan automáticamente según la <strong>zona horaria del dispositivo del atleta</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>Configuración de acceso guardada exitosamente en la nube.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-[var(--color-text-muted)]/15">
          <NeuButton
            type="button"
            onClick={onClose}
            className="flex-1 h-11 text-xs text-[var(--color-text-muted)]"
          >
            Cancelar
          </NeuButton>
          <NeuButton
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-11 text-xs font-bold text-[var(--color-accent-blue)] flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Guardar Control de Acceso</span>
              </>
            )}
          </NeuButton>
        </div>
      </NeuCard>
    </div>
  );
}
