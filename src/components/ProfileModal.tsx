import React, { useState, useEffect } from "react";
import { useStore } from "@/store";
import { NeuCard } from "./ui/NeuCard";
import { NeuInput } from "./ui/NeuInput";
import { NeuButton } from "./ui/NeuButton";
import { X, Sun, Moon, Palette, Check, Sparkles, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UIStyle } from "@/types";

const ACCENT_PRESETS = [
  { name: "Azul Clásico", value: "#4D7CFE" },
  { name: "Morado Eléctrico", value: "#8B5CF6" },
  { name: "Verde Esmeralda", value: "#10B981" },
  { name: "Rosa Vibrante", value: "#F43F5E" },
  { name: "Fucsia Neón", value: "#EC4899" },
  { name: "Naranja Atardecer", value: "#F97316" },
  { name: "Ámbar Dorado", value: "#F59E0B" },
  { name: "Cyan Océano", value: "#06B6D4" },
  { name: "Índigo Real", value: "#6366F1" },
  { name: "Rojo Pasión", value: "#EF4444" },
];

export function ProfileModal({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId?: string }) {
  const { 
    currentUser, 
    usuarios, 
    updateUsuario, 
    deleteUsuario,
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    uiStyle,
    setUIStyle
  } = useStore();
  
  const targetUser = userId ? usuarios.find(u => u.id === userId) : currentUser;
  const isEditingOther = !!userId && userId !== currentUser?.id;
  
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [contrasena, setContrasena] = useState('');
  const [estado_suscripcion, setEstadoSuscripcion] = useState<'activo' | 'inactivo'>('activo');
  const [targetUIStyle, setTargetUIStyle] = useState<UIStyle>('neumorfico');

  useEffect(() => {
    if (targetUser) {
      setNombre(targetUser.nombre || '');
      setDni(targetUser.dni || '');
      setWhatsapp(targetUser.whatsapp || '');
      setFecha(targetUser.fecha_nacimiento || '');
      setSexo(targetUser.sexo || 'masculino');
      setContrasena(targetUser.contrasena || '');
      setEstadoSuscripcion(targetUser.estado_suscripcion || 'activo');
      setTargetUIStyle(targetUser.estilo_diseno || 'neumorfico');
    }
  }, [targetUser, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    updateUsuario({
      ...targetUser,
      nombre,
      dni,
      whatsapp,
      fecha_nacimiento: fecha,
      sexo,
      contrasena,
      estado_suscripcion,
      color_acento: isEditingOther ? targetUser.color_acento : accentColor,
      modo_tema: isEditingOther ? targetUser.modo_tema : themeMode,
      estilo_diseno: isEditingOther ? targetUIStyle : uiStyle,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!targetUser || !isEditingOther) return;
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${targetUser.nombre}?`)) {
      deleteUsuario(targetUser.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute inset-0 z-50 bg-[var(--color-bg-base)] flex flex-col p-4 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[var(--color-text-main)]">{isEditingOther ? 'Editar Usuario' : 'Ajustes & Personalización'}</h2>
            <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={onClose}>
              <X className="w-5 h-5 text-[var(--color-text-muted)]" />
            </NeuButton>
          </div>

          {/* Theme & Color Settings Section */}
          {!isEditingOther && (
            <NeuCard className="p-4 mb-4 flex flex-col gap-4">
              {/* Design Style Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--color-accent-blue)]" />
                    <h3 className="font-bold text-sm text-[var(--color-text-main)]">Estilo de Diseño Visual</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Nuevo estilo
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
                  Elige entre el diseño neumórfico original con relieve táctil o el nuevo estilo app fitness con tarjetas modernas, botón Reproducir y cabecera dorada curvada.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUIStyle('neumorfico')}
                    className={`p-3.5 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                      uiStyle === 'neumorfico'
                        ? 'shadow-neu-pressed border-[var(--color-accent-blue)]/50 bg-[var(--color-bg-base)] ring-2 ring-[var(--color-accent-blue)]/30'
                        : 'shadow-neu-flat border-transparent bg-[var(--color-bg-base)] hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl shadow-neu-flat flex items-center justify-center text-[var(--color-accent-blue)]">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-[var(--color-text-main)]">Neumórfico Clásico</span>
                      </div>
                      {uiStyle === 'neumorfico' && (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent-blue)] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-normal">
                      Aspecto tridimensional original con botones circulares, sombras suaves y relieves táctiles.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUIStyle('modern_gold')}
                    className={`p-3.5 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                      uiStyle === 'modern_gold'
                        ? 'shadow-neu-pressed border-amber-500/60 bg-[var(--color-bg-base)] ring-2 ring-amber-500/30'
                        : 'shadow-neu-flat border-transparent bg-[var(--color-bg-base)] hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm">
                          <Sparkles className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-bold text-xs text-[var(--color-text-main)]">Fitness Gold (Estilo App)</span>
                      </div>
                      {uiStyle === 'modern_gold' && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-normal">
                      Diseño igual a la imagen: cabecera dorada curvada, tarjetas redondeadas, botón Reproducir y cuadrícula de series de alta densidad.
                    </p>
                  </button>
                </div>
              </div>

              {/* Day / Night Theme */}
              <div className="pt-2 border-t border-[var(--color-text-muted)]/15">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-[var(--color-accent-blue)]" />
                  <h3 className="font-bold text-sm text-[var(--color-text-main)]">Tema de Pantalla</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
                      themeMode === 'light'
                        ? 'shadow-neu-pressed text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/30'
                        : 'shadow-neu-flat text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Modo Día</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
                      themeMode === 'dark'
                        ? 'shadow-neu-pressed text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/30'
                        : 'shadow-neu-flat text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Modo Noche</span>
                  </button>
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="pt-2 border-t border-[var(--color-text-muted)]/15">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[var(--color-accent-blue)]" />
                    <h3 className="font-bold text-sm text-[var(--color-text-main)]">Color de Acento</h3>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                    (Solo afecta elementos azules)
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2.5 my-2">
                  {ACCENT_PRESETS.map((color) => {
                    const isSelected = accentColor.toLowerCase() === color.value.toLowerCase();
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setAccentColor(color.value)}
                        title={color.name}
                        className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                          isSelected ? 'shadow-neu-pressed' : 'shadow-neu-flat'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                          style={{ backgroundColor: color.value }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 text-xs text-[var(--color-text-muted)]">
                  <label htmlFor="custom-color-input" className="cursor-pointer font-medium hover:text-[var(--color-text-main)]">
                    Color Personalizado:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="custom-color-input"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent shadow-neu-flat"
                    />
                    <span className="font-mono text-[11px] font-bold text-[var(--color-text-main)] uppercase">
                      {accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </NeuCard>
          )}

          {/* User Profile Form */}
          <NeuCard className="p-4 mb-8">
            <h3 className="font-bold text-sm text-[var(--color-text-main)] mb-3">Datos del Perfil</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <NeuInput label="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
              <NeuInput label="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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

              {(isEditingOther || currentUser?.rol === 'admin') && (
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium text-[var(--color-text-muted)] pl-2">Suscripción</span>
                  <select 
                    className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2 text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/20"
                    value={estado_suscripcion}
                    onChange={(e) => setEstadoSuscripcion(e.target.value as any)}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              <NeuInput label="Contraseña" type="text" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
              
              <NeuButton type="submit" className="mt-4 h-12 text-[var(--color-accent-blue)] font-bold">
                Guardar Cambios
              </NeuButton>

              {isEditingOther && currentUser?.rol === 'admin' && (
                <NeuButton type="button" onClick={handleDelete} className="mt-2 h-12 text-red-500 font-bold border-2 border-red-200/50">
                  Eliminar Usuario
                </NeuButton>
              )}
            </form>
          </NeuCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
