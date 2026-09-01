import { useStore } from "@/store";
import { LogOut, Dumbbell, Users, Settings, Home, Activity, ClipboardList, User } from "lucide-react";
import { NeuButton } from "./ui/NeuButton";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProfileModal } from "./ProfileModal";

export function Layout({ children }: { children: (activeTab: number) => React.ReactNode }) {
  const { currentRole, logout, currentUser } = useStore();
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
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#E0E5EC] overflow-hidden relative">
      {/* Top Header */}
      <header className="z-10 px-4 pt-4 pb-2 flex justify-between items-center bg-[#E0E5EC]/80 backdrop-blur-md">
        <h1 className="text-xl font-bold text-[#2D3748]">GymBro</h1>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-[#2D3748] leading-tight">{currentUser?.nombre}</span>
            <span className="text-[10px] font-medium text-[#718096] capitalize">{currentUser?.rol}</span>
          </div>
          <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat text-[#4D7CFE]" onClick={() => setIsProfileOpen(true)}>
            <User className="w-4 h-4" />
          </NeuButton>
          <NeuButton variant="circle" className="w-10 h-10 shadow-neu-flat text-[#718096]" onClick={logout}>
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
             {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full px-4 py-3 bg-[#E0E5EC]/90 backdrop-blur-md z-20">
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
                    ? "shadow-neu-pressed text-[#4D7CFE]"
                    : "text-[#718096]"
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
