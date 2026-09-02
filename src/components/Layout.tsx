import React, { useState } from "react";
import { useStore } from "@/store";
import { LogOut, Dumbbell, Users, Settings, Home, Activity, ClipboardList, User, Database, Cloud } from "lucide-react";
import { NeuButton } from "./ui/NeuButton";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "./ProfileModal";


export function Layout({ children }: { children: (activeTab: number, setActiveTab: (tab: number) => void) => React.ReactNode }) {
  const { currentRole, logout, currentUser, isCloudReady } = useStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { icon: <Activity />, label: "Panel" },
          { icon: <Users />, label: "Cuentas" },
          { icon: <Settings />, label: "Biblioteca" },
        ];
      case 'entrenador':
        return [
          { icon: <Users />, label: "Atletas" },
          { icon: <ClipboardList />, label: "Rutinas" },
          { icon: <Database />, label: "Ejercicios" },
          { icon: <Activity />, label: "Revisiones" },
        ];
      case 'cliente':
      default:
        return [
          { icon: <Home />, label: "Hoy" },
          { icon: <Dumbbell />, label: "Entrenar" },
          { icon: <Activity />, label: "Progreso" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[var(--color-bg-base)] overflow-hidden relative">
      {/* Top Header */}
      <header className="z-10 px-4 pt-4 pb-2 flex justify-between items-center bg-[var(--color-bg-base)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[var(--color-text-main)]">GymBro</h1>
          <div className="flex items-center gap-1 text-[10px] text-[#00C9A7] font-semibold bg-[var(--color-bg-base)] px-2 py-0.5 rounded-full shadow-neu-flat">
            <Cloud className="w-3 h-3 text-[#00C9A7]" />
            <span>Nube</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-[var(--color-text-main)] leading-tight">{currentUser?.nombre}</span>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] capitalize">{currentUser?.rol}</span>
          </div>
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-20 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRole}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
             {children(activeTab, setActiveTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
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

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
