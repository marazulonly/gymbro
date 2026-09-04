import React, { useState } from "react";
import { useStore } from "@/store";
import { LogOut, Dumbbell, Users, Settings, Home, Activity, ClipboardList, User, Database, Cloud, Heart, Calendar } from "lucide-react";
import { NeuButton } from "./ui/NeuButton";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "./ProfileModal";


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

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-full sm:max-w-md mx-auto overflow-hidden relative ${
      isModernGold 
        ? "bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100" 
        : "bg-[var(--color-bg-base)]"
    }`}>
      {/* Top Header */}
      <header className={`z-10 px-4 pt-3 pb-2 flex justify-between items-center transition-colors ${
        isModernGold 
          ? "bg-amber-400 dark:bg-amber-500 text-slate-950 border-b border-amber-300/40" 
          : "bg-[var(--color-bg-base)]/80 backdrop-blur-md"
      }`}>
        <div className="flex items-center gap-2">
          <h1 className={`text-xl font-black tracking-tight ${isModernGold ? "text-slate-950" : "text-[var(--color-text-main)]"}`}>
            GymBro
          </h1>
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isModernGold 
              ? "bg-white/80 text-slate-900 shadow-sm" 
              : "bg-[var(--color-bg-base)] text-[#00C9A7] shadow-neu-flat"
          }`}>
            <Cloud className="w-3 h-3" />
            <span>Nube</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className={`text-xs font-bold leading-tight ${isModernGold ? "text-slate-950" : "text-[var(--color-text-main)]"}`}>
              {currentUser?.nombre}
            </span>
          </div>

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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRole}-${activeTab}-${uiStyle}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
             {children(activeTab, setActiveTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {isModernGold ? (
        <nav className="absolute bottom-3 left-0 right-0 px-6 z-30 pointer-events-none">
          <div className="pointer-events-auto max-w-[320px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-full px-6 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {navItems.map((item, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex flex-col items-center justify-center w-12 h-11 transition-transform ${
                    isActive ? "scale-110 text-slate-900 dark:text-amber-400 font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "font-bold text-slate-950 dark:text-amber-400" : "font-normal"}`}>
                    {item.label}
                  </span>
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
