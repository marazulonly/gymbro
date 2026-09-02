import React, { useState, useEffect } from "react";
import { useStore } from "@/store";
import { NeuCard } from "./ui/NeuCard";
import { NeuInput } from "./ui/NeuInput";
import { NeuButton } from "./ui/NeuButton";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


export function ProfileModal({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId?: string }) {
  const { currentUser, usuarios, updateUsuario, deleteUsuario } = useStore();
  
  const targetUser = userId ? usuarios.find(u => u.id === userId) : currentUser;
  const isEditingOther = !!userId && userId !== currentUser?.id;
  
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [contrasena, setContrasena] = useState('');
  const [estado_suscripcion, setEstadoSuscripcion] = useState<'activo' | 'inactivo'>('activo');

  useEffect(() => {
    if (targetUser) {
      setNombre(targetUser.nombre || '');
      setDni(targetUser.dni || '');
      setWhatsapp(targetUser.whatsapp || '');
      setFecha(targetUser.fecha_nacimiento || '');
      setSexo(targetUser.sexo || 'masculino');
      setContrasena(targetUser.contrasena || '');
      setEstadoSuscripcion(targetUser.estado_suscripcion || 'activo');
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
          className="absolute inset-0 z-50 bg-[#E0E5EC] flex flex-col p-4 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#2D3748]">{isEditingOther ? 'Editar Usuario' : 'Mi Perfil'}</h2>
            <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat" onClick={onClose}>
              <X className="w-5 h-5 text-[#718096]" />
            </NeuButton>
          </div>

          <NeuCard className="p-4 mb-8">
            <form onSubmit={handleSave} className="flex flex-col gap-4">
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

              {(isEditingOther || currentUser?.rol === 'admin') && (
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium text-[#718096] pl-2">Suscripción</span>
                  <select 
                    className="w-full rounded-2xl bg-[#E0E5EC] px-4 py-2 text-[#2D3748] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20"
                    value={estado_suscripcion}
                    onChange={(e) => setEstadoSuscripcion(e.target.value as any)}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              <NeuInput label="Contraseña" type="text" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
              
              <NeuButton type="submit" className="mt-4 h-12 text-[#4D7CFE] font-bold">
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
