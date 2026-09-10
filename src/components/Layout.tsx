import React, { useState } from "react";
import { useStore } from "@/store";
import { LogOut, Dumbbell, Users, Settings, Home, Activity, ClipboardList, User, Database, Heart, Calendar, Search, Plus, CreditCard } from "lucide-react";
import { NeuButton } from "./ui/NeuButton";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "./ProfileModal";
import { GymBroWordmarkLogo } from "./GymBroWordmarkLogo";


export function Layout({ children }: { children: (activeTab: number, setActiveTab: (tab: number) => void) => React.ReactNode }) {
  const { currentRole, logout, currentUser, isCloudReady, uiStyle } = useStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { icon: <Activity className="w-5 h-5" />, label: "Panel" },
          { icon: <Users className="w-5 h-5" />, label: "Cuentas" },
          { icon: <Settings className="w-5 h-5" />, label: "Biblioteca" },
        ];
      case 'entrenador':
        return [
          { icon: <Users className="w-5 h-5" />, label: "Atletas" },
          { icon: <ClipboardList className="w-5 h-5" />, label: "Rutinas" },
          { icon: <Database className="w-5 h-5" />, label: "Ejercicios" },
          { icon: <Activity className="w-5 h-5" />, label: "Revisiones" },
          { icon: <CreditCard className="w-5 h-5" />, label: "", title: "Membresía" },
        ];
      case 'cliente':
      default:
        return [
          { 
            icon: uiStyle === 'modern_gold' 
              ? <Heart className={`w-5 h-5 ${activeTab === 0 ? "fill-current text-slate-900 dark:text-white" : ""}`} /> 
              : <Home className="w-5 h-5" />, 
            label: "Hoy" 
          },
          { 
            icon: uiStyle === 'modern_gold' 
              ? <Calendar className={`w-5 h-5 ${activeTab === 1 ? "stroke-[2.5] text-slate-900 dark:text-white" : ""}`} /> 
              : <Dumbbell className="w-5 h-5" />, 
            label: "Entrenar" 
          },
          { 
            icon: uiStyle === 'modern_gold' 
              ? <User className={`w-5 h-5 ${activeTab === 2 ? "fill-current text-slate-900 dark:text-white" : ""}`} /> 
              : <Activity className="w-5 h-5" />, 
            label: "Progreso" 
          },
        ];
    }
  };

  const navItems = getNavItems();
  const isModernGold = uiStyle === 'modern_gold';
  const isSoftPorcelain = uiStyle === 'soft_porcelain';
  const isAthleteHomeScreen = currentRole === 'cliente' && activeTab === 0;

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-full sm:max-w-md mx-auto overflow-hidden relative ${
      isModernGold 
        ? "bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100" 
        : "bg-[var(--color-bg-base)] text-[var(--color-text-main)]"
    }`}>
      {/* Top Header */}
      {isSoftPorcelain ? (
        <header className="z-10 px-4 pt-3 pb-2.5 flex justify-between items-center bg-[var(--color-bg-base)]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl shadow-neu-pressed flex items-center justify-center text-[var(--color-accent-blue)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 14.5L9.5 4H14.5L9 14.5H4Z" />
                <path d="M10 20L15.5 9.5H20.5L15 20H10Z" opacity="0.65" />
              </svg>
            </div>
            <div className="flex items-center">
              <GymBroWordmarkLogo
                className="h-6 w-auto text-[var(--color-text-main)]"
                gymColor="currentColor"
                broColor={currentUser?.color_acento || "var(--color-accent-blue)"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAthleteHomeScreen && (
              <span className="text-xs font-bold text-[var(--color-text-main)] hidden xs:inline">
                {currentUser?.nombre}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              title="Buscar / Ajustes"
              className="w-9 h-9 rounded-full shadow-neu-pressed flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              title="Personalizar Estilo"
              className="w-9 h-9 rounded-full bg-[var(--color-accent-blue)] text-white flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="w-9 h-9 rounded-full shadow-neu-flat flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent-amber)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      ) : (
        <header className={`z-10 px-4 pt-3 pb-2 flex justify-between items-center transition-colors ${
          isModernGold 
            ? "bg-amber-400 dark:bg-amber-500 text-slate-950 border-b border-amber-300/40" 
            : "bg-[var(--color-bg-base)]/80 backdrop-blur-md"
        }`}>
          <div className="flex items-center gap-2">
            <GymBroWordmarkLogo
              className={`h-7 w-auto ${isModernGold ? "text-slate-950" : "text-[var(--color-text-main)]"}`}
              gymColor={isModernGold ? "#020617" : "currentColor"}
              broColor={currentUser?.color_acento || "var(--color-accent-blue)"}
            />
          </div>

          <div className="flex items-center gap-2">
            {!isAthleteHomeScreen && (
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold leading-tight ${isModernGold ? "text-slate-950" : "text-[var(--color-text-main)]"}`}>
                  {currentUser?.nombre}
                </span>
              </div>
            )}

            {isModernGold ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  title="Ajustes y Personalización"
                  className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Cerrar sesión"
                  className="w-9 h-9 rounded-full bg-slate-950/10 text-slate-950 flex items-center justify-center hover:bg-slate-950/20 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <NeuButton 
                  variant="circle" 
                  className="w-10 h-10 shadow-neu-flat text-[var(--color-accent-blue)]" 
                  onClick={() => setIsProfileOpen(true)}
                  title="Ajustes y Personalización"
                >
                  <Settings className="w-4 h-4" />
                </NeuButton>
                <NeuButton 
                  variant="circle" 
                  className="w-10 h-10 shadow-neu-flat text-[var(--color-text-muted)]" 
                  onClick={logout}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </NeuButton>
              </>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area - Generous pb-36 ensuring no cards collide with or hide under footer in any view */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-36 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRole}-${activeTab}-${uiStyle}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="min-h-full"
          >
             {children(activeTab, setActiveTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {isSoftPorcelain ? (
        <nav className="absolute bottom-3 left-0 right-0 px-4 z-30 pointer-events-none">
          <div className="pointer-events-auto max-w-[370px] mx-auto bg-[var(--color-bg-base)] rounded-[28px] px-4 py-2 shadow-neu-flat border border-white/60 dark:border-slate-800/60 flex justify-between items-center">
            {navItems.map((item, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className="relative flex flex-col items-center justify-center w-11 h-11"
                  title={item.title || item.label}
                  aria-label={item.title || item.label || `Tab ${idx + 1}`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-[var(--color-accent-blue)] text-white shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                    }`}
                  >
                    {item.icon}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      ) : isModernGold ? (
        <nav className="absolute bottom-3 left-0 right-0 px-4 z-30 pointer-events-none">
          <div className="pointer-events-auto max-w-[360px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {navItems.map((item, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex flex-col items-center justify-center min-w-[40px] h-11 transition-transform ${
                    isActive ? "scale-105 text-[var(--color-accent-amber)] font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                  title={item.title || item.label}
                  aria-label={item.title || item.label || `Tab ${idx + 1}`}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  {item.label && (
                    <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "font-bold text-[var(--color-accent-amber)]" : "font-normal"}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      ) : (
        <nav className="absolute bottom-0 w-full px-4 py-3 bg-[var(--color-bg-base)]/90 backdrop-blur-md z-20">
          <div className="flex justify-between items-center px-2 py-2 rounded-2xl shadow-neu-flat">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className="relative flex flex-col items-center justify-center w-12 h-12"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    activeTab === idx
                      ? "shadow-neu-pressed text-[var(--color-accent-blue)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {item.icon}
                </div>
              </button>
            ))}
          </div>
        </nav>
      )}

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
