import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  TrendingUp, 
  Dumbbell, 
  Smartphone, 
  Calendar, 
  ArrowRight, 
  Lock, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Menu, 
  X, 
  Mail, 
  Shield, 
  Activity, 
  Award,
  Heart,
  Plus,
  Star,
  Users,
  MessageCircle,
  Zap
} from 'lucide-react';
import { GymBroWordmarkLogo } from '../components/GymBroWordmarkLogo';

export function AthleteLandingView() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  
  // Athlete Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    currentGym: '',
    experienceLevel: 'intermedio'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Live Routine Preview States (Interactive Mockup)
  const [activeTab, setActiveTab] = useState<'registro' | 'graficos' | 'membresia'>('registro');
  
  // Interactive Live Tracker Stats
  const [currentSet, setCurrentSet] = useState(1);
  const [setsCompleted, setSetsCompleted] = useState<boolean[]>([false, false, false, false]);
  const [activeExerciseWeight, setActiveExerciseWeight] = useState(80); // in kg
  const [activeExerciseReps, setActiveExerciseReps] = useState(10);
  const [routineProgress, setRoutineProgress] = useState(40); // percent completed
  const [workoutDuration, setWorkoutDuration] = useState(38); // minutes elapsed
  const [selectedPRChart, setSelectedPRChart] = useState<'squat' | 'deadlift' | 'bench'>('deadlift');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es obligatorio';
    }
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'El WhatsApp es obligatorio';
    } else if (!/^\+?[\d\s-]{8,15}$/.test(formData.whatsapp.trim())) {
      errors.whatsapp = 'Introduce un número de WhatsApp válido';
    }
    return errors;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      whatsapp: '',
      currentGym: '',
      experienceLevel: 'intermedio'
    });
    setFormErrors({});
    setFormSubmitted(false);
  };

  const handleCompleteSet = (index: number) => {
    const newSets = [...setsCompleted];
    newSets[index] = !newSets[index];
    setSetsCompleted(newSets);
    
    // Recalculate progress based on sets completed
    const completedCount = newSets.filter(Boolean).length;
    const progressInc = 40 + (completedCount * 12.5); // base 40% + up to 50%
    setRoutineProgress(Math.min(Math.round(progressInc), 100));
  };

  const navigateToApp = () => {
    window.location.href = '/';
  };

  // PR progression values depending on selected chart
  const prChartData = {
    squat: [
      { date: 'Ene', value: 100 },
      { date: 'Feb', value: 105 },
      { date: 'Mar', value: 110 },
      { date: 'Abr', value: 110 },
      { date: 'May', value: 115 },
      { date: 'Jun', value: 122.5 },
    ],
    deadlift: [
      { date: 'Ene', value: 130 },
      { date: 'Feb', value: 135 },
      { date: 'Mar', value: 140 },
      { date: 'Abr', value: 145 },
      { date: 'May', value: 145 },
      { date: 'Jun', value: 155 },
    ],
    bench: [
      { date: 'Ene', value: 80 },
      { date: 'Feb', value: 82.5 },
      { date: 'Mar', value: 85 },
      { date: 'Abr', value: 85 },
      { date: 'May', value: 90 },
      { date: 'Jun', value: 95 },
    ]
  };

  return (
    <div className="min-h-screen bg-[#020503] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black overflow-x-hidden">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/10 w-[400px] h-[400px] bg-[#00FF66]/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/10 w-[600px] h-[600px] bg-[#CCFF00]/4 rounded-full blur-[150px] pointer-events-none" />

      {/* 3-ZONE HEADER (TOP BAR CONTRACT) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#020503]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Zone 1: Brand Title / Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <GymBroWordmarkLogo className="h-8 w-auto" gymColor="#FFFFFF" broColor="#CCFF00" />
          </div>

          {/* Zone 2: Navigation Links (1-2 word labels, single-line) */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-black text-zinc-400">
            <a href="#beneficios" className="hover:text-white hover:underline decoration-[#CCFF00] decoration-2 underline-offset-4 transition-colors">
              Beneficios
            </a>
            <a href="#funcionalidades" className="hover:text-white hover:underline decoration-[#CCFF00] decoration-2 underline-offset-4 transition-colors">
              Funcionalidades
            </a>
            <a href="#registro-en-vivo" className="hover:text-white hover:underline decoration-[#CCFF00] decoration-2 underline-offset-4 transition-colors">
              En Vivo
            </a>
            <a href="#cta" className="hover:text-white hover:underline decoration-[#CCFF00] decoration-2 underline-offset-4 transition-colors">
              Registrarme
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-4">
            <button 
              onClick={navigateToApp} 
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#121412] hover:bg-[#1C1F1C] text-white text-xs font-black uppercase tracking-wider rounded-lg border border-white/10 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setRegisterModalOpen(true)} 
              className="px-5 py-2.5 bg-[#CCFF00] hover:bg-[#b0db00] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-[0_0_15px_rgba(204,255,0,0.35)]"
            >
              Empieza a Entrenar
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-white hover:text-[#CCFF00] transition-colors p-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#020503] pt-24 px-6 flex flex-col gap-6 md:hidden">
          <nav className="flex flex-col gap-6 text-lg uppercase tracking-widest font-black text-zinc-400">
            <a 
              href="#beneficios" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Beneficios
            </a>
            <a 
              href="#funcionalidades" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Funcionalidades
            </a>
            <a 
              href="#registro-en-vivo" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              En Vivo
            </a>
            <a 
              href="#cta" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Comenzar
            </a>
          </nav>
          
          <div className="h-px bg-white/10 my-4" />
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                navigateToApp();
              }}
              className="w-full py-3.5 bg-[#121412] hover:bg-[#1C1F1C] text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/5"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setRegisterModalOpen(true);
              }}
              className="w-full py-3.5 bg-[#CCFF00] text-black text-xs font-black uppercase tracking-widest rounded-xl text-center shadow-lg"
            >
              Empieza a Entrenar
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Hero copy & value proposition) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
            
            {/* Visual Kicker: Clean, unboxed text badge */}
            <div className="flex items-center gap-1.5 text-[#CCFF00] text-[10px] uppercase tracking-[0.25em] font-black leading-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ELITE ATHLETE EXPERIENCE</span>
              <span className="text-zinc-600 font-normal">·</span>
              <span>100% MOBILE RESPONSIVE</span>
            </div>

            {/* Title / Big Condensed Typography */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.95] italic font-sans max-w-2xl">
              Lleva tu entrenamiento <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#CCFF00] to-[#00FF66]">
                al siguiente nivel
              </span> <br />
              y supera tus límites.
            </h1>

            {/* Subtext description */}
            <p className="text-zinc-400 text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
              Tu evolución física en la palma de tu mano. Accede a tus rutinas, registra tus marcas personales y visualiza tu progreso real desde cualquier lugar.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md sm:max-w-none">
              <button 
                onClick={() => setRegisterModalOpen(true)}
                className="px-8 py-4 bg-[#CCFF00] hover:bg-[#b0db00] text-black text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.4)] cursor-pointer"
              >
                <span>EMPIEZA A ENTRENAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#registro-en-vivo"
                className="px-8 py-4 bg-[#121412] hover:bg-[#1C1F1C] text-white text-xs font-black uppercase tracking-widest rounded-lg border border-zinc-800 flex items-center justify-center gap-2 transition-all hover:border-zinc-700 active:scale-95"
              >
                DESCUBRE TU PROGRESO
              </a>
            </div>

            {/* Key stats check list */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-900 mt-6 max-w-lg">
              <div>
                <div className="text-xl md:text-2xl font-black italic text-[#CCFF00] leading-none">PR TRACKER</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Registra récords</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black italic text-white leading-none">LIVE MODE</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Durante la serie</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black italic text-white leading-none">100% CLOUD</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Sin pérdidas</div>
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Premium Device Mockup */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-8 lg:mt-0">
            
            {/* Ambient Background Spot Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#CCFF00]/15 to-transparent rounded-[32px] blur-2xl pointer-events-none opacity-70" />
            
            {/* Large Sport Action Background Photo */}
            <div className="absolute top-12 -left-12 w-64 h-80 rounded-3xl overflow-hidden border border-zinc-900/40 opacity-20 grayscale hover:grayscale-0 transition-all hidden lg:block">
              <img 
                src="/src/assets/images/coach_athlete_training_1791429915823.jpg" 
                alt="Athlete heavy lifting" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Smart Phone Interactive Mockup Frame */}
            <div className="relative z-10 w-full max-w-[328px] bg-[#000000] rounded-[40px] border-4 border-zinc-800 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
              
              {/* Device Notch & Camera bar */}
              <div className="w-32 h-4 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl flex items-center justify-center gap-1.5 px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <div className="w-8 h-1 bg-zinc-900 rounded-full" />
              </div>

              {/* Internal App Screen Wrapper */}
              <div className="pt-4 flex flex-col gap-4 h-[440px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-900 select-none">
                
                {/* Header indicators */}
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-zinc-900 pb-2">
                  <span className="text-[#CCFF00] font-bold">GymBro v2.4 Atleta</span>
                  <span>10:42 AM</span>
                </div>

                {/* Athlete Quick Profile Status */}
                <div className="p-3 bg-[#090B09] rounded-2xl border border-white/5 shadow-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#121412] border border-[#CCFF00] flex items-center justify-center font-bold italic text-white text-xs">
                    GB
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">Estilo Atleta</h4>
                    <span className="text-[9px] text-zinc-400 block mt-0.5 uppercase tracking-wider font-semibold">
                      Coach: Carlos Ortega
                    </span>
                  </div>
                </div>

                {/* Active Workout Routine Preview Card */}
                <div className="p-3.5 bg-[#0C0F0C] rounded-2xl border border-[#CCFF00]/10 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rutina de Hoy</span>
                    <span className="bg-[#CCFF00]/10 text-[#CCFF00] px-2 py-0.5 text-[8px] font-black uppercase rounded-full">
                      Piernas / Core
                    </span>
                  </div>
                  
                  <h5 className="text-sm font-black uppercase text-white tracking-tight">Poder Hipertrofia</h5>

                  {/* Sets Progress Indicator */}
                  <div className="flex items-center justify-between gap-2.5 bg-black/60 p-2.5 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 uppercase font-black">Progreso General</span>
                      <span className="text-xs font-mono font-black text-[#CCFF00] mt-0.5">{routineProgress}%</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#CCFF00] rounded-full transition-all duration-500"
                        style={{ width: `${routineProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Exercise Details */}
                  <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase tracking-tight">1. Sentadilla Libre (Squat)</span>
                      <span className="text-[#CCFF00] font-mono text-[10px] font-bold">4 Series</span>
                    </div>
                    
                    {/* Inline sets checkboxes */}
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {setsCompleted.map((comp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCompleteSet(idx)}
                          className={`py-1.5 text-[9px] font-mono font-black rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${
                            comp 
                              ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-[0_0_8px_rgba(204,255,0,0.2)]'
                              : 'bg-black/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          <span>S{idx + 1}</span>
                          <span className="text-[7px] opacity-75">{activeExerciseWeight}kg</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct interactive buttons inside mockup */}
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => {
                        setActiveExerciseWeight(w => w + 5);
                        setRoutineProgress(p => Math.min(p + 5, 100));
                      }}
                      className="flex-1 py-2 bg-[#CCFF00] hover:bg-[#b0db00] text-black text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      Añadir Peso (+5kg)
                    </button>
                    <button 
                      onClick={() => {
                        setSetsCompleted([true, true, true, true]);
                        setRoutineProgress(100);
                      }}
                      className="py-2 px-3 bg-[#121412] hover:bg-[#1C1F1C] border border-zinc-800 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      Completar
                    </button>
                  </div>

                </div>

                {/* Subtitle / CTA inside the viewport */}
                <div className="text-center py-2 bg-[#CCFF00]/5 rounded-xl border border-[#CCFF00]/5">
                  <span className="text-[9px] text-[#CCFF00] font-black uppercase tracking-widest">
                    🔥 REGISTRO EN TIEMPO REAL
                  </span>
                </div>

              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-28 h-1 bg-zinc-800 mx-auto mt-4 rounded-full" />

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: BENEFICIOS */}
      <section id="beneficios" className="py-20 bg-[#000000] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header titles */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#CCFF00] text-[10px] uppercase tracking-[0.25em] font-black block mb-2">
              BENEFICIOS CLAVE
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight italic">
              Diseñado para Atletas de Alto Rendimiento
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm mt-3 font-semibold">
              Olvídate de planillas rotas o cuadernos húmedos. Ten toda tu evolución optimizada directamente en tu dispositivo.
            </p>
          </div>

          {/* Grid structure (3 cards) */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-[#090C09] rounded-2xl border border-zinc-900 hover:border-[#CCFF00]/20 p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                Tu Progreso Siempre a la Vista
              </h3>
              <p className="text-zinc-400 text-xs font-semibold leading-relaxed">
                Registra peso, series y repeticiones y analiza tu evolución de fuerza y volumen de entrenamiento mes a mes con gráficos claros y dinámicos.
              </p>
              {/* Simple unboxed metadata line */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pt-2 border-t border-zinc-900 mt-auto">
                <span>Historial</span>
                <span>·</span>
                <span>Análisis</span>
                <span>·</span>
                <span>Mes a Mes</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#090C09] rounded-2xl border border-zinc-900 hover:border-[#CCFF00]/20 p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                Rutinas Claras y Personalizadas
              </h3>
              <p className="text-zinc-400 text-xs font-semibold leading-relaxed">
                Sigue desde tu smartphone los entrenamientos diseñados exclusivamente para ti por tu coach. Cargas, descansos y descripciones sin dudas.
              </p>
              {/* Simple unboxed metadata line */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pt-2 border-t border-zinc-900 mt-auto">
                <span>Planes</span>
                <span>·</span>
                <span>Instrucciones</span>
                <span>·</span>
                <span>Series</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#090C09] rounded-2xl border border-zinc-900 hover:border-[#CCFF00]/20 p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
                <Award className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                Historial de Marcas Personales
              </h3>
              <p className="text-zinc-400 text-xs font-semibold leading-relaxed">
                Registra automáticamente tus récords personales (PRs) de cada levantamiento clave. Celebra y visualiza cada nuevo hito de tu desarrollo físico.
              </p>
              {/* Simple unboxed metadata line */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pt-2 border-t border-zinc-900 mt-auto">
                <span>Récords</span>
                <span>·</span>
                <span>Logros</span>
                <span>·</span>
                <span>1RM Estimado</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: FUNCIONALIDADES & INTERACTIVE ZONE */}
      <section id="funcionalidades" className="py-20 bg-[#020503] relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column (Details and Interactive Tabs Control) */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              
              <span className="text-[#CCFF00] text-[10px] uppercase tracking-[0.25em] font-black block">
                CARACTERÍSTICAS
              </span>
              
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight italic">
                La experiencia móvil <br /> definitiva en el gimnasio
              </h2>

              <p className="text-zinc-400 text-xs md:text-sm font-semibold leading-relaxed">
                GymBro combina un diseño minimalista y de alto contraste con funcionalidades diseñadas para responder en el fragor de la sesión de entrenamiento. Explora los tres pilares de la app de atleta:
              </p>

              {/* Interactive Segmented Tab Controls (NO BADGES, FUNCTIONAL CLICKS) */}
              <div className="flex flex-col gap-2.5 mt-4 p-1.5 bg-[#080B08] rounded-2xl border border-zinc-900/60">
                
                {/* Tab 1 */}
                <button 
                  onClick={() => setActiveTab('registro')}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3.5 border ${
                    activeTab === 'registro' 
                      ? 'bg-[#121612] border-[#CCFF00]/15 text-white shadow-sm' 
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeTab === 'registro' ? 'bg-[#CCFF00] text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      Modo de Registro en Vivo
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block font-medium">
                      Interfaz ultra-rápida y fluida, optimizada con neumorfismo moderno para usar entre series.
                    </span>
                  </div>
                </button>

                {/* Tab 2 */}
                <button 
                  onClick={() => setActiveTab('graficos')}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3.5 border ${
                    activeTab === 'graficos' 
                      ? 'bg-[#121612] border-[#CCFF00]/15 text-white shadow-sm' 
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeTab === 'graficos' ? 'bg-[#CCFF00] text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      Gráficos de Evolución
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block font-medium">
                      Visualiza tus progresos en carga y volumen de entrenamiento mediante curvas atractivas de rendimiento.
                    </span>
                  </div>
                </button>

                {/* Tab 3 */}
                <button 
                  onClick={() => setActiveTab('membresia')}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3.5 border ${
                    activeTab === 'membresia' 
                      ? 'bg-[#121612] border-[#CCFF00]/15 text-white shadow-sm' 
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeTab === 'membresia' ? 'bg-[#CCFF00] text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      Membresía y Accesos
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block font-medium">
                      Controla vigencias, fechas límites y próximas renovaciones sin sorpresas antes de ingresar a entrenar.
                    </span>
                  </div>
                </button>

              </div>

            </div>

            {/* Right Column: Visual Dashboard/Tablet/Phone Combo showcasing the active tab state */}
            <div id="registro-en-vivo" className="lg:col-span-7 relative flex items-center justify-center p-2.5">
              
              {/* Background spotlight matching the theme style */}
              <div className="absolute -inset-10 bg-gradient-to-br from-[#00FF66]/10 to-transparent rounded-[40px] blur-3xl pointer-events-none opacity-80" />

              {/* Interactive Mockup Container */}
              <div className="w-full max-w-lg bg-[#000000] rounded-3xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
                
                {/* Decorative header */}
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                      VISTA INTERACTIVA DE ATLETA
                    </span>
                  </div>
                  <span className="text-[#CCFF00] font-mono text-xs font-bold uppercase">
                    {activeTab === 'registro' && 'Modo Entrenamiento'}
                    {activeTab === 'graficos' && 'Estadísticas de PR'}
                    {activeTab === 'membresia' && 'Suscripción Digital'}
                  </span>
                </div>

                {/* RENDERING INTERACTIVE TABS CONTENT */}
                
                {/* 1. MODO REGISTRO EN VIVO */}
                {activeTab === 'registro' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">Sentadilla Libre Back Squat</h4>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mt-0.5">Siguiente objetivo: 85kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 text-[9px] block uppercase font-bold">Tiempo Activo</span>
                        <span className="text-sm font-mono font-black text-white">{workoutDuration}:15 Min</span>
                      </div>
                    </div>

                    {/* Analog-styled live digital chronometer */}
                    <div className="bg-[#080B08] p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-neu-pressed">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black border-2 border-[#CCFF00] flex items-center justify-center text-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.15)] animate-pulse">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white uppercase block leading-tight">Temporizador de Descanso</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5 block">Recomendado: 90s</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setWorkoutDuration(d => d + 1)}
                          className="px-3 py-1 bg-[#CCFF00] hover:bg-[#b0db00] text-black text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                        >
                          Iniciar (+1m)
                        </button>
                      </div>
                    </div>

                    {/* Exercises Sets List */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Series de Entrenamiento</span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        
                        {/* Series 1 */}
                        <div className="p-3 bg-[#0A0D0A] rounded-xl border border-zinc-900 flex flex-col justify-between h-20 shadow-neu-flat">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Serie 1</span>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-xs font-mono font-bold text-white">10 reps · 80kg</span>
                            <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>

                        {/* Series 2 */}
                        <div className="p-3 bg-[#0A0D0A] rounded-xl border border-zinc-900 flex flex-col justify-between h-20 shadow-neu-flat">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Serie 2</span>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-xs font-mono font-bold text-white">10 reps · 80kg</span>
                            <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>

                        {/* Series 3 */}
                        <div className="p-3 bg-[#0A0D0A] rounded-xl border border-zinc-900 flex flex-col justify-between h-20 shadow-neu-flat">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Serie 3</span>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-xs font-mono font-bold text-white">8 reps · 85kg</span>
                            <button 
                              type="button" 
                              onClick={() => {
                                setRoutineProgress(p => Math.min(p + 15, 100));
                              }}
                              className="w-5 h-5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-[10px] transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Series 4 (PR) */}
                        <div className="p-3 bg-[#0A0D0A] rounded-xl border border-[#CCFF00]/10 flex flex-col justify-between h-20 shadow-neu-flat">
                          <span className="text-[10px] text-[#CCFF00] font-black uppercase tracking-wider block">Serie 4 (PR)</span>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-xs font-mono font-bold text-white">6 reps · 90kg</span>
                            <span className="bg-[#CCFF00]/10 text-[#CCFF00] px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                              Objetivo
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-500 italic mt-1 text-center font-semibold">
                      💡 Toques rápidos en los botones de serie para validar y registrar la carga en el momento del levantamiento.
                    </p>
                  </div>
                )}

                {/* 2. GRÁFICOS DE EVOLUCIÓN */}
                {activeTab === 'graficos' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">Estadísticas y Récords Personales</h4>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mt-0.5">Historial histórico de tu 1RM</span>
                      </div>
                      
                      {/* Interactive toggle for different lifts */}
                      <div className="flex gap-1.5 p-1 bg-[#0A0D0A] rounded-lg border border-zinc-900">
                        <button 
                          onClick={() => setSelectedPRChart('squat')}
                          className={`px-2 py-1 text-[9px] font-black uppercase rounded ${selectedPRChart === 'squat' ? 'bg-[#CCFF00] text-black' : 'text-zinc-500'}`}
                        >
                          Squat
                        </button>
                        <button 
                          onClick={() => setSelectedPRChart('deadlift')}
                          className={`px-2 py-1 text-[9px] font-black uppercase rounded ${selectedPRChart === 'deadlift' ? 'bg-[#CCFF00] text-black' : 'text-zinc-500'}`}
                        >
                          Deadlift
                        </button>
                        <button 
                          onClick={() => setSelectedPRChart('bench')}
                          className={`px-2 py-1 text-[9px] font-black uppercase rounded ${selectedPRChart === 'bench' ? 'bg-[#CCFF00] text-black' : 'text-zinc-500'}`}
                        >
                          Bench
                        </button>
                      </div>
                    </div>

                    {/* Simulated High-contrast editorial Chart view */}
                    <div className="bg-[#060806] rounded-2xl p-4 border border-zinc-900">
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                          Levantamiento Máximo: {selectedPRChart === 'deadlift' ? 'Peso Muerto' : selectedPRChart === 'squat' ? 'Sentadilla' : 'Bench Press'}
                        </span>
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-500 block uppercase font-bold">Récord Actual (1RM)</span>
                          <span className="text-base font-mono font-black text-[#CCFF00]">
                            {selectedPRChart === 'deadlift' ? '155 kg' : selectedPRChart === 'squat' ? '122.5 kg' : '95 kg'}
                          </span>
                        </div>
                      </div>

                      {/* Visual representations of bar/chart lines */}
                      <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2 relative">
                        {/* Background guide lines */}
                        <div className="absolute left-0 right-0 top-1/4 h-px bg-zinc-900" />
                        <div className="absolute left-0 right-0 top-2/4 h-px bg-zinc-900" />
                        <div className="absolute left-0 right-0 top-3/4 h-px bg-zinc-900" />

                        {prChartData[selectedPRChart].map((item, index) => {
                          // Scale height based on value
                          const minVal = selectedPRChart === 'deadlift' ? 120 : selectedPRChart === 'squat' ? 90 : 70;
                          const maxVal = selectedPRChart === 'deadlift' ? 160 : selectedPRChart === 'squat' ? 130 : 100;
                          const heightPct = ((item.value - minVal) / (maxVal - minVal)) * 80 + 20;

                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                              <span className="text-[8px] font-mono font-bold text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-black border border-[#CCFF00]/15 px-1 rounded">
                                {item.value}kg
                              </span>
                              
                              <div 
                                className="w-full rounded-t-md bg-gradient-to-t from-[#CCFF00]/10 to-[#CCFF00] group-hover:to-[#00FF66] transition-all relative overflow-hidden"
                                style={{ height: `${heightPct}px` }}
                              >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/25 to-transparent pointer-events-none" />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.date}</span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    <div className="flex gap-4 items-center bg-[#090C09] p-3 rounded-xl border border-[#CCFF00]/5 text-xs text-zinc-400">
                      <Zap className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      <p className="font-semibold">
                        ¡Tu 1RM ha incrementado un <span className="text-white font-black">{(selectedPRChart === 'deadlift' ? 19.2 : selectedPRChart === 'squat' ? 22.5 : 18.7).toFixed(1)}%</span> desde Enero! Mantén la consistencia para romper tu récord el próximo mes.
                      </p>
                    </div>

                  </div>
                )}

                {/* 3. SUSCRIPCIÓN & ACCESOS */}
                {activeTab === 'membresia' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">Estado de Membresía Digital</h4>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mt-0.5">Control de ingresos y pagos</span>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full">
                        Al Día
                      </span>
                    </div>

                    {/* Access Ticket Neumorphic Card */}
                    <div className="bg-[#090C09] p-5 rounded-2xl border border-zinc-900 shadow-neu-flat flex flex-col gap-4">
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Plan de Atleta</span>
                          <span className="text-base font-black uppercase tracking-tight text-white block mt-0.5">Socio Premium GymBro</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Código de Acceso</span>
                          <span className="text-sm font-mono font-black text-white mt-0.5 block">#GB-8954-XM</span>
                        </div>
                      </div>

                      <div className="w-full h-px bg-zinc-900" />

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[9px] text-zinc-500 uppercase font-black block">Inicio de Suscripción</span>
                          <span className="font-bold text-white mt-1 block">15 Septiembre, 2026</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-rose-500 uppercase font-black block">Fecha de Vencimiento</span>
                          <span className="font-bold text-rose-400 mt-1 block">15 Octubre, 2026</span>
                        </div>
                      </div>

                      {/* Interactive countdown bar */}
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-zinc-400 font-semibold">Días Restantes para Renovación</span>
                        </div>
                        <span className="text-sm font-mono font-black text-[#CCFF00]">
                          8 Días
                        </span>
                      </div>

                    </div>

                    <div className="p-3.5 bg-[#080B08] rounded-xl border border-[#CCFF00]/10 flex items-center gap-3">
                      <div className="p-2 bg-[#CCFF00]/10 rounded-lg text-[#CCFF00]">
                        <Shield className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                        Control digital directo. No necesitas tarjetas físicas ni carnets molestos; tu smartphone autoriza tu acceso en el front desk mediante sincronización directa.
                      </p>
                    </div>

                  </div>
                )}

                {/* Subtitle bottom footer mockup info */}
                <div className="border-t border-zinc-950 pt-3 mt-4 flex items-center justify-between text-[9px] text-zinc-500 uppercase font-bold">
                  <span>GYMBRO APP SUITE</span>
                  <span>PREVIO ACTIVO DE INTERFAZ</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: FINAL CTA */}
      <section id="cta" className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#000000]">
        
        {/* Spot light circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center gap-6">
          
          <span className="text-[#CCFF00] text-[10px] uppercase tracking-[0.25em] font-black block leading-none mb-1">
            ÚNETE AL MOVIMIENTO
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none italic">
            Deja de entrenar a ciegas <br />
            y empieza a medir resultados reales.
          </h2>

          <p className="text-zinc-400 text-sm md:text-base font-semibold max-w-2xl leading-relaxed mt-2">
            Únete a GymBro y transforma la manera en que experimentas tu evolución en el gimnasio. Ten tus rutinas listas, registra tus pesos en tiempo real y lleva tu rendimiento al límite.
          </p>

          <button 
            onClick={() => setRegisterModalOpen(true)}
            className="mt-6 px-10 py-5 bg-[#CCFF00] hover:bg-[#b0db00] text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(204,255,0,0.45)] whitespace-nowrap cursor-pointer"
          >
            Crea tu cuenta de atleta ahora
          </button>

          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mt-2">
            Disponible para iOS, Android y Navegadores Web. Sincronización automática con tu Coach.
          </p>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020503] border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <GymBroWordmarkLogo className="h-6 w-auto" gymColor="#FFFFFF" broColor="#CCFF00" />
            <span className="text-[10px] text-zinc-500 font-semibold mt-1">
              © {new Date().getFullYear()} GymBro. Todos los derechos reservados.
            </span>
          </div>

          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="/" className="hover:text-white transition-colors">Iniciar Sesión</a>
            <a href="/couch" className="hover:text-white transition-colors">¿Eres Coach?</a>
          </div>

        </div>
      </footer>

      {/* INTERACTIVE REGISTRATION MODAL WITH VALIDATION & FEEDBACK */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Modal backdrop */}
          <div 
            onClick={() => {
              if (!formSubmitted) {
                setRegisterModalOpen(false);
                resetForm();
              }
            }} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />

          {/* Modal panel wrapper */}
          <div className="bg-[#090C09] w-full max-w-md rounded-2xl border border-zinc-800 p-6 md:p-8 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all animate-scaleUp">
            
            {/* Spotlight header */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CCFF00] via-[#00FF66] to-[#CCFF00]" />

            <button 
              onClick={() => {
                setRegisterModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!formSubmitted ? (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 pt-2">
                
                <div className="text-left">
                  <span className="text-[#CCFF00] text-[9px] uppercase tracking-widest font-black block mb-1">
                    REGISTRO DE ATLETA
                  </span>
                  <h3 className="text-xl font-black uppercase italic text-white tracking-tight">
                    Crea tu Cuenta Gratis
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1 font-semibold leading-relaxed">
                    Completa tus datos para recibir tu acceso de atleta y conectar de inmediato con el plan de tu coach.
                  </p>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Full name input */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="fullName" className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                    Nombre Completo *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ej. Andrés Quiroz"
                    className={`w-full px-4 py-3 bg-[#121612] border rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors font-semibold ${
                      formErrors.fullName ? 'border-rose-500' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.fullName && (
                    <span className="text-[9px] text-rose-400 font-bold block mt-0.5">{formErrors.fullName}</span>
                  )}
                </div>

                {/* Email input */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="email" className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                    Correo Electrónico *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="andres@ejemplo.com"
                    className={`w-full px-4 py-3 bg-[#121612] border rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors font-semibold ${
                      formErrors.email ? 'border-rose-500' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-[9px] text-rose-400 font-bold block mt-0.5">{formErrors.email}</span>
                  )}
                </div>

                {/* WhatsApp input */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="whatsapp" className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                    WhatsApp de Contacto *
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+51 987654321"
                    className={`w-full px-4 py-3 bg-[#121612] border rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors font-semibold ${
                      formErrors.whatsapp ? 'border-rose-500' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.whatsapp && (
                    <span className="text-[9px] text-rose-400 font-bold block mt-0.5">{formErrors.whatsapp}</span>
                  )}
                </div>

                {/* Gym or Coach Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="currentGym" className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                    Nombre de tu Gimnasio o Coach (Opcional)
                  </label>
                  <input
                    id="currentGym"
                    name="currentGym"
                    type="text"
                    value={formData.currentGym}
                    onChange={handleInputChange}
                    placeholder="Ej. Carlos Ortega"
                    className="w-full px-4 py-3 bg-[#121612] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors font-semibold"
                  />
                </div>

                {/* Experience Level selection */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="experienceLevel" className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                    Nivel de Experiencia *
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#121612] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors font-semibold"
                  >
                    <option value="principiante">Principiante (Menos de 6 meses)</option>
                    <option value="intermedio">Intermedio (1 a 3 años)</option>
                    <option value="avanzado">Avanzado (Más de 3 años / Atleta)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-4 bg-[#CCFF00] hover:bg-[#b0db00] text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-95 shadow-md font-mono"
                >
                  Registrarme Ahora
                </button>

                <p className="text-[9px] text-zinc-500 font-semibold text-center leading-relaxed">
                  Al registrarte, declaras estar conforme con las políticas de uso de GymBro Suite para control deportivo y de membresías.
                </p>

              </form>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.2)] animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                
                <div>
                  <h3 className="text-xl font-black uppercase italic text-white">¡Registro Exitoso!</h3>
                  <p className="text-[#CCFF00] text-xs font-bold uppercase mt-1 tracking-wider">¡Bienvenido a GymBro Atleta!</p>
                </div>

                <p className="text-zinc-400 text-xs font-semibold leading-relaxed max-w-sm mt-1">
                  Hemos registrado tus datos correctamente. El sistema ha enviado un correo de bienvenida a <span className="text-white font-bold">{formData.email}</span> con tus credenciales temporales y el enlace de descarga de la app.
                </p>

                <div className="w-full h-px bg-zinc-900 my-2" />

                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={navigateToApp}
                    className="w-full py-3 bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Acceder a Mi Cuenta
                  </button>
                  <button 
                    onClick={() => {
                      setRegisterModalOpen(false);
                      resetForm();
                    }}
                    className="w-full py-3 bg-[#121412] hover:bg-[#1C1F1C] border border-zinc-800 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cerrar Ventana
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
