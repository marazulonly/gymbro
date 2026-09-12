import React, { useState } from "react";
import { useStore } from "@/store";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { 
  Users, 
  Activity, 
  Settings, 
  Database, 
  Server, 
  UserPlus, 
  ArrowRightLeft, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  UserCheck,
  FileText,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Search
} from "lucide-react";
import { ProfileModal } from "@/components/ProfileModal";
import { AthleteProgressModal } from "@/components/AthleteProgressModal";
import { Usuario } from "@/types";

export function AdminView({ tab }: { tab: number }) {
  if (tab === 0) return <AdminDashboard />;
  if (tab === 1) return <AccountManagement />;
  if (tab === 2) return <MasterLibrary />;
  return null;
}

function AdminDashboard() {
  const { usuarios } = useStore();
  const clientsCount = usuarios.filter(u => u.rol === 'cliente').length;
  const trainersCount = usuarios.filter(u => u.rol === 'entrenador').length;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-1">Panel General</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <NeuCard className="flex flex-col items-center justify-center gap-2 py-4">
          <Users className="w-6 h-6 text-[var(--color-accent-blue)]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-text-main)]">{clientsCount}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] mt-1">Usuarios Activos</div>
          </div>
        </NeuCard>
        
        <NeuCard className="flex flex-col items-center justify-center gap-2 py-4">
          <Activity className="w-6 h-6 text-[var(--color-accent-green)]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-text-main)]">{trainersCount}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] mt-1">Entrenadores</div>
          </div>
        </NeuCard>
      </div>

      <NeuCard className="mt-2">
        <h3 className="font-bold text-[var(--color-text-main)] mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-[var(--color-text-muted)]" />
          Estado del Sistema
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-muted)]">Base de Datos</span>
            <span className="text-[var(--color-accent-green)] font-bold text-xs">Operativa</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-muted)]">Última Copia de Seg.</span>
            <span className="text-[var(--color-text-main)] font-bold text-xs">Hace 2 horas</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-muted)]">Carga de Servidor</span>
            <span className="text-[var(--color-text-main)] font-bold text-xs">24%</span>
          </div>
        </div>
      </NeuCard>
    </div>
  );
}

function AccountManagement() {
  const { usuarios, assignAthleteToTrainer, addUsuario, updateUsuario, clearAthleteRoutines } = useStore();
  const [filterRole, setFilterRole] = useState<'cliente' | 'entrenador'>('cliente');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAthleteForProgress, setSelectedAthleteForProgress] = useState<Usuario | null>(null);
  
  // Reassignment state
  const [reassigningAthlete, setReassigningAthlete] = useState<Usuario | null>(null);
  const [targetTrainerId, setTargetTrainerId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);
  
  // Create user state
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createRole, setCreateRole] = useState<'cliente' | 'entrenador'>('cliente');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [contrasena, setContrasena] = useState('0000');
  const [initialTrainerId, setInitialTrainerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Trainer view expansion state
  const [expandedTrainerId, setExpandedTrainerId] = useState<string | null>(null);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Success toast notification
  const [notification, setNotification] = useState<string | null>(null);

  const trainers = usuarios.filter(u => u.rol === 'entrenador');
  const clients = usuarios.filter(u => u.rol === 'cliente');

  // Filtered and sorted alphabetically by name
  const filteredUsers = usuarios
    .filter(u => u.rol === filterRole)
    .filter(u => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      const matchName = u.nombre.toLowerCase().includes(term);
      const matchDni = u.dni ? u.dni.toLowerCase().includes(term) : false;
      return matchName || matchDni;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleToggleLogoPermission = async (trainer: Usuario) => {
    const newPermiso = !trainer.permiso_cambiar_logo;
    try {
      await updateUsuario({
        ...trainer,
        permiso_cambiar_logo: newPermiso
      });
      showNotification(
        newPermiso
          ? `Autorización para subir logo activada para ${trainer.nombre}`
          : `Autorización para subir logo desactivada para ${trainer.nombre}`
      );
    } catch (err) {
      console.error('Error toggling logo permission:', err);
    }
  };

  const handleStartReassign = (athlete: Usuario) => {
    setReassigningAthlete(athlete);
    setTargetTrainerId(athlete.id_entrenador || (trainers[0]?.id || ''));
  };

  const handleConfirmReassign = async () => {
    if (!reassigningAthlete || !targetTrainerId) return;
    setIsReassigning(true);
    try {
      await assignAthleteToTrainer(reassigningAthlete.id, targetTrainerId);
      const newTrainer = trainers.find(t => t.id === targetTrainerId);
      showNotification(`Atleta ${reassigningAthlete.nombre} asignado a ${newTrainer?.nombre || 'nuevo entrenador'}`);
      setReassigningAthlete(null);
    } catch (err) {
      console.error('Error reassigning athlete:', err);
    } finally {
      setIsReassigning(false);
    }
  };

  const handleOpenCreateModal = (role: 'cliente' | 'entrenador') => {
    setCreateRole(role);
    setNombre('');
    setDni('');
    setWhatsapp('');
    setFecha('');
    setSexo('masculino');
    setContrasena('0000');
    setInitialTrainerId(trainers[0]?.id || '');
    setIsCreatingUser(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !dni.trim()) return;

    setIsSubmitting(true);
    try {
      const newId = createRole === 'cliente' ? `u_${Date.now()}` : `trainer_${Date.now()}`;
      await addUsuario({
        id: newId,
        nombre: nombre.trim(),
        dni: dni.trim(),
        whatsapp: whatsapp.trim(),
        fecha_nacimiento: fecha,
        sexo,
        contrasena: contrasena.trim() || '0000',
        estado_suscripcion: 'activo',
        rol: createRole,
        id_entrenador: createRole === 'cliente' ? (initialTrainerId || undefined) : undefined,
      });

      if (createRole === 'cliente') {
        await clearAthleteRoutines(newId);
      }

      showNotification(`${createRole === 'cliente' ? 'Atleta' : 'Entrenador'} ${nombre} registrado exitosamente en la nube`);
      setIsCreatingUser(false);
    } catch (err: any) {
      console.error('Error creating user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Cuentas</h2>
        <div className="flex items-center gap-2">
          {/* Botón de lupa (sin texto) que al pulsarse activa la barra de búsqueda de atletas o entrenadores */}
          <NeuButton
            variant="circle"
            className={`w-9 h-9 flex items-center justify-center transition-all ${
              isSearchOpen
                ? "text-[var(--color-accent-blue)] shadow-neu-pressed"
                : "text-[var(--color-accent-blue)] shadow-neu-flat hover:shadow-neu-pressed"
            }`}
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchTerm('');
            }}
            title={filterRole === 'cliente' ? 'Buscar atletas' : 'Buscar entrenadores'}
            aria-label={filterRole === 'cliente' ? 'Buscar atletas' : 'Buscar entrenadores'}
          >
            <Search className="w-4 h-4" />
          </NeuButton>

          <NeuButton 
            onClick={() => handleOpenCreateModal(filterRole)} 
            className="px-3 py-1.5 text-xs text-[var(--color-accent-blue)] font-bold flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{filterRole === 'cliente' ? 'Nuevo Atleta' : 'Nuevo Entrenador'}</span>
          </NeuButton>
        </div>
      </div>

      {/* Barra de búsqueda animada */}
      {isSearchOpen && (
        <div className="relative flex items-center animate-in fade-in duration-200">
          <Search className="w-4 h-4 absolute left-3.5 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={filterRole === 'cliente' ? 'Buscar atleta por nombre o DNI...' : 'Buscar entrenador por nombre o DNI...'}
            autoFocus
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[var(--color-bg-base)] text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] text-sm shadow-neu-pressed focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-blue)]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {notification && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
      
      <div className="flex gap-3">
        <NeuButton 
          isActive={filterRole === 'cliente'} 
          onClick={() => setFilterRole('cliente')}
          className="flex-1 text-sm py-2"
        >
          Clientes ({clients.length})
        </NeuButton>
        <NeuButton 
          isActive={filterRole === 'entrenador'} 
          onClick={() => setFilterRole('entrenador')}
          className="flex-1 text-sm py-2"
        >
          Entrenadores ({trainers.length})
        </NeuButton>
      </div>

      {/* Clientes Tab */}
      {filterRole === 'cliente' && (
        <div className="flex flex-col gap-3">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] my-4 text-sm">
              {searchTerm.trim()
                ? `No se encontraron atletas que coincidan con "${searchTerm.trim()}".`
                : "No hay clientes registrados."}
            </p>
          ) : (
            filteredUsers.map((u) => {
              const assignedTrainer = trainers.find(t => t.id === u.id_entrenador);
              return (
                <NeuCard key={u.id} className="flex flex-col gap-2.5 p-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-[var(--color-text-main)] text-sm">{u.nombre}</div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        <span>DNI: {u.dni}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${u.estado_suscripcion === 'inactivo' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                          {u.estado_suscripcion === 'inactivo' ? 'Inactivo' : 'Activo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <NeuButton 
                        className="px-2.5 py-1 text-xs text-[var(--color-accent-blue)] font-bold flex items-center gap-1" 
                        onClick={() => setSelectedAthleteForProgress(u)}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ficha</span>
                      </NeuButton>
                      <NeuButton 
                        className="px-2.5 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" 
                        onClick={() => setSelectedUserId(u.id)}
                      >
                        Gestionar
                      </NeuButton>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-text-muted)]/10 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-text-muted)]">Entrenador:</span>
                      {assignedTrainer ? (
                        <span className="font-semibold text-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/10 px-2 py-0.5 rounded-md">
                          {assignedTrainer.nombre}
                        </span>
                      ) : (
                        <span className="font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          Sin Asignar
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleStartReassign(u)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-accent-blue)] hover:underline px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{assignedTrainer ? 'Cambiar Entrenador' : 'Asignar Entrenador'}</span>
                    </button>
                  </div>
                </NeuCard>
              );
            })
          )}
        </div>
      )}

      {/* Entrenadores Tab */}
      {filterRole === 'entrenador' && (
        <div className="flex flex-col gap-3">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] my-4 text-sm">
              {searchTerm.trim()
                ? `No se encontraron entrenadores que coincidan con "${searchTerm.trim()}".`
                : "No hay entrenadores registrados."}
            </p>
          ) : (
            filteredUsers.map((trainer) => {
              const assignedAthletes = clients.filter(c => c.id_entrenador === trainer.id);
              const isExpanded = expandedTrainerId === trainer.id;

              return (
                <NeuCard key={trainer.id} className="flex flex-col p-3.5 gap-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[var(--color-text-main)] text-sm">{trainer.nombre}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">DNI: {trainer.dni}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
                        {assignedAthletes.length} {assignedAthletes.length === 1 ? 'atleta' : 'atletas'}
                      </span>
                      <NeuButton 
                        className="px-2.5 py-1 text-xs text-[var(--color-accent-blue)]" 
                        onClick={() => setSelectedUserId(trainer.id)}
                      >
                        Gestionar
                      </NeuButton>
                    </div>
                  </div>

                  {/* Check autorización subir PNG / SVG para reemplazar GymBro */}
                  <div className="p-2.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[var(--color-accent-blue)] shrink-0" />
                      <div>
                        <span className="font-bold text-[var(--color-text-main)] block text-xs">
                          Autorizar subir PNG o SVG (Logo)
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Reemplaza la palabra "GymBro" en la cabecera
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {trainer.logo_personalizado_url && (
                        <div className="h-6 px-1.5 rounded-lg bg-white/60 dark:bg-black/40 border border-[var(--color-text-muted)]/20 flex items-center justify-center">
                          <img src={trainer.logo_personalizado_url} alt="Logo" className="max-h-4 w-auto max-w-[60px] object-contain" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleLogoPermission(trainer)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          trainer.permiso_cambiar_logo
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-text-muted)]"
                        }`}
                        title="Activar / desactivar permiso para subir logo PNG/SVG"
                      >
                        {trainer.permiso_cambiar_logo ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5 fill-current" />
                            <span>Autorizado</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>No autorizado</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-text-muted)]/10">
                    <button
                      onClick={() => setExpandedTrainerId(isExpanded ? null : trainer.id)}
                      className="w-full flex items-center justify-between text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors py-1 cursor-pointer"
                    >
                      <span>Atletas a cargo ({assignedAthletes.length})</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 flex flex-col gap-1.5 pl-2">
                        {assignedAthletes.length === 0 ? (
                          <p className="text-xs text-[var(--color-text-muted)] italic py-1">
                            Este entrenador no tiene atletas asignados actualmente.
                          </p>
                        ) : (
                          assignedAthletes.map((ath) => (
                            <div key={ath.id} className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed text-xs">
                              <div>
                                <span className="font-medium text-[var(--color-text-main)]">{ath.nombre}</span>
                                <span className="text-[10px] text-[var(--color-text-muted)] ml-2">DNI: {ath.dni}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedAthleteForProgress(ath)}
                                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-accent-blue)] hover:underline cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Ficha</span>
                                </button>
                                <button
                                  onClick={() => handleStartReassign(ath)}
                                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-text-muted)] hover:underline cursor-pointer"
                                >
                                  <ArrowRightLeft className="w-3 h-3" />
                                  <span>Reasignar</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </NeuCard>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Reassign Athlete to Trainer */}
      {reassigningAthlete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <NeuCard className="w-full max-w-md p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[var(--color-accent-blue)]" />
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">Reasignar Entrenador</h3>
              </div>
              <button 
                onClick={() => setReassigningAthlete(null)} 
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-bg-base)] shadow-neu-pressed text-xs flex flex-col gap-1">
              <div className="text-[var(--color-text-muted)]">Atleta:</div>
              <div className="text-sm font-bold text-[var(--color-text-main)]">{reassigningAthlete.nombre}</div>
              <div className="text-[var(--color-text-muted)]">DNI: {reassigningAthlete.dni}</div>
              <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                Entrenador actual:{' '}
                <span className="font-semibold text-[var(--color-text-main)]">
                  {trainers.find(t => t.id === reassigningAthlete.id_entrenador)?.nombre || 'Sin entrenador asignado'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-muted)] pl-1">
                Seleccionar Nuevo Entrenador:
              </label>
              <select
                className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2.5 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/30"
                value={targetTrainerId}
                onChange={(e) => setTargetTrainerId(e.target.value)}
              >
                <option value="">-- Selecciona un entrenador --</option>
                {trainers.map((t) => {
                  const count = clients.filter(c => c.id_entrenador === t.id).length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({count} {count === 1 ? 'atleta' : 'atletas'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex gap-2.5 mt-2">
              <NeuButton 
                onClick={() => setReassigningAthlete(null)}
                className="flex-1 h-11 text-xs text-[var(--color-text-muted)]"
              >
                Cancelar
              </NeuButton>
              <NeuButton 
                onClick={handleConfirmReassign}
                disabled={!targetTrainerId || isReassigning}
                className="flex-1 h-11 text-xs font-bold text-[var(--color-accent-blue)]"
              >
                {isReassigning ? 'Reasignando...' : 'Confirmar'}
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}

      {/* Modal: Create User (Athlete or Trainer) */}
      {isCreatingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <NeuCard className="w-full max-w-md p-5 flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--color-accent-blue)]" />
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                  {createRole === 'cliente' ? 'Registrar Nuevo Atleta' : 'Registrar Nuevo Entrenador'}
                </h3>
              </div>
              <button 
                onClick={() => setIsCreatingUser(false)} 
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5">
              <NeuInput 
                label="Nombre Completo" 
                placeholder="Ej. Juan Pérez" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
              <NeuInput 
                label="DNI / Documento" 
                placeholder="Ej. 12345678" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                required 
              />
              <NeuInput 
                label="WhatsApp" 
                placeholder="Ej. 987654321" 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
              />
              <NeuInput 
                label="Fecha de Nacimiento" 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
              />

              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs font-medium text-[var(--color-text-muted)] pl-2">Sexo</span>
                <select 
                  className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/30"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value as any)}
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {createRole === 'cliente' && (
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-xs font-medium text-[var(--color-text-muted)] pl-2">Entrenador Asignado</span>
                  <select 
                    className="w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2 text-sm text-[var(--color-text-main)] shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/30"
                    value={initialTrainerId}
                    onChange={(e) => setInitialTrainerId(e.target.value)}
                  >
                    <option value="">-- Sin Entrenador Inicial --</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <NeuInput 
                label="Contraseña de Acceso" 
                placeholder="0000" 
                value={contrasena} 
                onChange={(e) => setContrasena(e.target.value)} 
                required 
              />

              <div className="flex gap-2.5 mt-2">
                <NeuButton 
                  type="button" 
                  onClick={() => setIsCreatingUser(false)}
                  className="flex-1 h-11 text-xs text-[var(--color-text-muted)]"
                >
                  Cancelar
                </NeuButton>
                <NeuButton 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-11 text-xs font-bold text-[var(--color-accent-blue)]"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear en la Nube'}
                </NeuButton>
              </div>
            </form>
          </NeuCard>
        </div>
      )}

      <ProfileModal 
        isOpen={!!selectedUserId} 
        onClose={() => setSelectedUserId(null)} 
        userId={selectedUserId || undefined} 
      />

      <AthleteProgressModal
        isOpen={!!selectedAthleteForProgress}
        onClose={() => setSelectedAthleteForProgress(null)}
        athlete={selectedAthleteForProgress}
      />
    </div>
  );
}

function MasterLibrary() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Biblioteca Maestra</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <NeuCard className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center">
              <Database className="w-4 h-4 text-[var(--color-accent-blue)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--color-text-main)] text-base">Ejercicios</div>
              <div className="text-xs text-[var(--color-text-muted)]">245 registros</div>
            </div>
          </div>
          <NeuButton variant="circle" className="w-8 h-8 shadow-neu-pressed text-[var(--color-accent-blue)] !p-0 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </NeuButton>
        </NeuCard>

        <NeuCard className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shadow-neu-pressed flex items-center justify-center">
              <Database className="w-4 h-4 text-[var(--color-accent-green)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--color-text-main)] text-base">Alimentos</div>
              <div className="text-xs text-[var(--color-text-muted)]">1200 registros</div>
            </div>
          </div>
          <NeuButton variant="circle" className="w-8 h-8 shadow-neu-pressed text-[var(--color-accent-blue)] !p-0 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </NeuButton>
        </NeuCard>
      </div>
    </div>
  );
}
