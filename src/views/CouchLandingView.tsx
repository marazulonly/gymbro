import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  Users, 
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
  DollarSign,
  Heart,
  Plus
} from 'lucide-react';
import { GymBroWordmarkLogo } from '../components/GymBroWordmarkLogo';
import { MuscleIcon } from '../components/ui/MuscleIcon';

export function CouchLandingView() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  
  // Demo Request Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    centerName: '',
    athletesCount: '1-20'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Quick state for Interactive Feature tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<'control' | 'rutinas' | 'movil'>('control');

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
      errors.whatsapp = 'El WhatsApp de contacto es obligatorio';
    } else if (!/^\+?[\d\s-]{8,15}$/.test(formData.whatsapp.trim())) {
      errors.whatsapp = 'Introduce un número de WhatsApp válido';
    }
    if (!formData.centerName.trim()) {
      errors.centerName = 'El nombre del centro de entrenamiento es obligatorio';
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
    
    // Simulate real successful API/Firestore storage if needed
    setFormSubmitted(true);
    setTimeout(() => {
      // Keep state clear after demo submission
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      whatsapp: '',
      centerName: '',
      athletesCount: '1-20'
    });
    setFormErrors({});
    setFormSubmitted(false);
  };

  const navigateToApp = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans antialiased selection:bg-[#DC2626] selection:text-white overflow-x-hidden">
      
      {/* 3-ZONE HEADER (TOP BAR CONTRACT) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Zone 1: Brand Title / Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <GymBroWordmarkLogo className="h-8 w-auto" gymColor="#FFFFFF" broColor="#DC2626" />
          </div>

          {/* Zone 2: Navigation Links (1-2 word labels, single-line) */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-black text-zinc-400">
            <a href="#beneficios" className="hover:text-white hover:underline decoration-[#DC2626] decoration-2 underline-offset-4 transition-colors">
              Beneficios
            </a>
            <a href="#funcionalidades" className="hover:text-white hover:underline decoration-[#DC2626] decoration-2 underline-offset-4 transition-colors">
              Funcionalidades
            </a>
            <a href="#precios" className="hover:text-white hover:underline decoration-[#DC2626] decoration-2 underline-offset-4 transition-colors">
              Planes
            </a>
            <a href="#demo" className="hover:text-white hover:underline decoration-[#DC2626] decoration-2 underline-offset-4 transition-colors">
              Solicitar Demo
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-4">
            <button 
              onClick={navigateToApp} 
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-black uppercase tracking-wider rounded-lg border border-white/10 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-sm"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setDemoModalOpen(true)} 
              className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              Empieza Gratis
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-white hover:text-[#DC2626] transition-colors p-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#000000] pt-24 px-6 flex flex-col gap-6 md:hidden">
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
              href="#precios" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Planes
            </a>
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Solicitar Demo
            </a>
          </nav>
          <div className="w-full h-px bg-zinc-800 my-4" />
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { setMobileMenuOpen(false); navigateToApp(); }}
              className="w-full py-4 bg-[#111111] hover:bg-zinc-800 text-white font-bold text-sm uppercase rounded-xl border border-white/10 text-center"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); setDemoModalOpen(true); }}
              className="w-full py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm uppercase rounded-xl text-center shadow-lg"
            >
              Empieza Gratis
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 md:py-40 bg-radial from-zinc-950 to-black overflow-hidden border-b border-zinc-900">
        
        {/* Background Gradients & Editorial Accent Lines */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DC2626]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full border-l border-zinc-900/40 hidden lg:block" />
        
        {/* Fine background red editorial stripe */}
        <div className="absolute top-20 right-[15%] w-px h-full bg-gradient-to-b from-[#DC2626]/45 via-transparent to-transparent hidden lg:block" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Editorial Micro Header (No pills, unboxed with separators) */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-[#DC2626]">
              <span>GYMBRO COUCH PLATFORM</span>
              <span className="text-zinc-600">·</span>
              <span>ESTÉTICA DE ALTO RENDIMIENTO</span>
            </div>

            {/* Giant Sporty Condensated Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold italic tracking-tighter uppercase leading-[0.9] text-white font-sans max-w-2xl">
              Optimiza la gestión de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#DC2626] to-[#DC2626]">gimnasio</span> y eleva el nivel de tus atletas.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-xl leading-relaxed">
              La plataforma todo en uno para controlar membresías, rutinas y progreso en tiempo real. Elimina las planillas obsoletas y ofrece una experiencia digital premium.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button 
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer"
              >
                <span>EMPIEZA GRATIS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#demo"
                className="px-8 py-4 bg-[#141414] hover:bg-[#222222] text-white text-xs font-black uppercase tracking-widest rounded-lg border border-zinc-800 flex items-center justify-center gap-2 transition-all hover:border-zinc-700 active:scale-95"
              >
                SOLICITA UNA DEMO
              </a>
            </div>

            {/* Editorial Quick Proof Checklist */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-900 mt-6 max-w-lg">
              <div>
                <div className="text-xl md:text-2xl font-black italic text-white leading-none">100%</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Automatizado</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black italic text-[#DC2626] leading-none">0 PLANILLAS</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Fácil de usar</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black italic text-white leading-none">Real-Time</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Sincronizado</div>
              </div>
            </div>

          </div>

          {/* Hero Visual Mockup Zone */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-8 lg:mt-0">
            
            {/* The Editorial Sports Photo Layer */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#DC2626]/20 to-transparent rounded-[32px] blur-2xl pointer-events-none opacity-60" />
            
            {/* Editorial Background Image Container */}
            <div className="absolute top-0 -left-6 w-72 h-96 rounded-3xl overflow-hidden border border-zinc-900 opacity-25 grayscale hover:grayscale-0 transition-all hidden sm:block">
              <img 
                src="/src/assets/images/coach_hero_athlete_1791429892924.jpg" 
                alt="Elite athlete training backdrop" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Main Interactive Athlete Panel Mockup Container */}
            <div className="relative z-10 w-full max-w-[340px] bg-[#0A0A0A] rounded-[32px] border border-zinc-800/80 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] overflow-hidden">
              
              {/* Phone Header Indicator */}
              <div className="w-full flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">GymBro Live Athlete Mode</span>
                </div>
                <div className="text-[10px] font-mono text-[#DC2626]">07:24 PM</div>
              </div>

              {/* Athlete Profile Segment (Styled with Neumorphism as specified: subtle, clean) */}
              <div className="p-3 bg-[#0D0D0D] rounded-2xl shadow-neu-flat border border-zinc-800/40 mb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#161616] border-2 border-[#DC2626] flex items-center justify-center font-black italic text-sm text-white">
                  XB
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">Xiomara Ballón</h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-zinc-400">
                    <span>Atleta Premium</span>
                    <span>·</span>
                    <span className="text-[#DC2626]">Fuerza & Tonif.</span>
                  </div>
                </div>
              </div>

              {/* Progress Radial Ring Visualization */}
              <div className="bg-[#0D0D0D] p-4 rounded-2xl shadow-neu-pressed mb-4 text-center border border-zinc-900/60">
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  
                  {/* Outer ring SVG */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-900"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#DC2626]"
                      strokeDasharray="75, 100"
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  
                  {/* Inside metrics */}
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-mono font-black italic text-white leading-none">75%</span>
                    <span className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">Rutina Lograda</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900">
                  <div className="text-left">
                    <span className="text-[8px] text-zinc-500 block font-bold uppercase">Series Realizadas</span>
                    <span className="text-xs font-mono font-bold text-white">9 de 12</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-zinc-500 block font-bold uppercase">Tiempo Activo</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">38 min</span>
                  </div>
                </div>
              </div>

              {/* Active Exercise List Card */}
              <div className="bg-[#0B0B0B] border border-zinc-900 p-3 rounded-2xl mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-[#DC2626] uppercase tracking-wider">Hoy: Tren Inferior (A)</span>
                  <span className="text-[8px] text-zinc-400 font-bold">Lun 19 Oct</span>
                </div>
                
                {/* Single exercise listing row */}
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded-xl border border-white/5 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#222222] flex items-center justify-center text-white text-[9px] font-black italic">1</div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white truncate max-w-[130px]">Sentadilla Goblet</h5>
                      <span className="text-[8px] text-zinc-400 block font-medium">4 series · RPE 8</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-300">10kg x 12</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                    </div>
                  </div>
                </div>

                {/* Second exercise listing row */}
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#222222] flex items-center justify-center text-white text-[9px] font-black italic">2</div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white truncate max-w-[130px]">Peso Muerto Rumano</h5>
                      <span className="text-[8px] text-zinc-400 block font-medium">3 series · RPE 8</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-[#DC2626]">Próximo</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
                  </div>
                </div>

              </div>

              {/* Fast interactive click tracker action */}
              <button 
                onClick={() => alert('¡Simulación de Registro! El atleta puede completar su entrenamiento instantáneamente.')}
                className="w-full py-2.5 bg-gradient-to-r from-[#DC2626] to-[#A30810] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-[0_4px_12px_rgba(220,38,38,0.25)]"
              >
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Registrar Serie Completada</span>
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* SECTION 2: BENEFICIOS */}
      <section id="beneficios" className="py-24 bg-[#080808] border-b border-zinc-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#DC2626_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Section Editorial Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-xs uppercase tracking-widest font-black text-[#DC2626] block mb-2">
                VENTAJAS COMPETITIVAS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic tracking-tighter uppercase leading-[0.9] text-white">
                ELEVA EL RENDIMIENTO DE TU CENTRO DE ENTRENAMIENTO
              </h2>
            </div>
            <p className="text-zinc-400 text-sm md:text-base max-w-sm font-medium">
              GymBro está diseñado por profesionales del fitness para erradicar las planillas estáticas de Excel y brindar soporte inteligente.
            </p>
          </div>

          {/* 3 ASYMMETRIC BLOCKS (Bento / Editorial Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Block 1: CONTROL TOTAL DE MEMBRESÍAS (Span 7) */}
            <div className="md:col-span-7 bg-[#0E0E0E] rounded-3xl border border-zinc-800/80 p-8 flex flex-col justify-between hover:border-[#DC2626]/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-full opacity-10 group-hover:opacity-20 transition-all pointer-events-none">
                <img 
                  src="/src/assets/images/gym_membership_focus_1791429902923.jpg" 
                  alt="Membership focus backdrop" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#DC2626] mb-8 font-mono text-lg font-black">
                  01
                </div>
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white mb-3">
                  CONTROL TOTAL DE MEMBRESÍAS
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-md font-semibold">
                  Automatiza pagos, vigencias y renovaciones sin planillas complicadas. El sistema detecta accesos impagos de manera autónoma y suspende automáticamente los accesos a las rutinas para cuidar las finanzas de tu gimnasio.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center gap-3 text-xs font-bold text-zinc-500">
                <span>Alertas de Whatsapp</span>
                <span>·</span>
                <span className="text-[#DC2626]">Bloqueo inteligente</span>
                <span>·</span>
                <span>Múltiples métodos de pago</span>
              </div>
            </div>

            {/* Block 2: SEGUIMIENTO PERSONALIZADO (Span 5) */}
            <div className="md:col-span-5 bg-[#0E0E0E] rounded-3xl border border-zinc-800/80 p-8 flex flex-col justify-between hover:border-[#DC2626]/30 transition-all group overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-full h-32 opacity-15 group-hover:opacity-25 transition-all pointer-events-none">
                <img 
                  src="/src/assets/images/coach_athlete_training_1791429915823.jpg" 
                  alt="Coach athlete training backdrop" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#DC2626] mb-8 font-mono text-lg font-black">
                  02
                </div>
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white mb-3">
                  SEGUIMIENTO PERSONALIZADO
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
                  Asigna rutinas basadas en RPE, tempo y descansos dinámicos. Registra la evolución del peso corporal, medidas antropométricas y monitorea las cargas de entrenamiento históricas de cada atleta con gráficos de progresión.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center gap-3 text-xs font-bold text-zinc-500">
                <span>Métricas de fuerza (RPE)</span>
                <span>·</span>
                <span className="text-white">Estadísticas físicas</span>
              </div>
            </div>

            {/* Block 3: INTERFAZ MODERNA (Span 12 - Full Width Asymmetric) */}
            <div className="md:col-span-12 bg-gradient-to-r from-[#0F0F0F] to-[#050505] rounded-3xl border border-zinc-800/80 p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:border-[#DC2626]/30 transition-all relative">
              
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#DC2626] font-mono text-lg font-black">
                  03
                </div>
                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white">
                  INTERFAZ MODERNA Y RESPONSIVE
                </h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-semibold">
                  Experiencia rápida, intuitiva y optimizada para coaches y atletas. Permite consultar rutinas, registrar series al fallo o con reservas de repeticiones de forma instantánea. Funciona fluidamente en smartphones de cualquier gama dentro de la sala de pesas, reduciendo la fricción tecnológica al mínimo.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4 text-xs font-black text-zinc-300 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-[#DC2626]" /> Mobile-First</span>
                  <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#DC2626]" /> Carga ultra-rápida</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#DC2626]" /> Offline resilient</span>
                </div>
              </div>

              <div className="md:col-span-5 h-64 md:h-72 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-10" />
                <img 
                  src="/src/assets/images/athlete_mobile_tracking_1791429925591.jpg" 
                  alt="Modern athlete application interface" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 bg-[#020202] border-b border-zinc-900 relative">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Section Editorial Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-black text-[#DC2626]">
              HERRAMIENTAS DE CONTROL
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic tracking-tighter uppercase leading-[0.9] text-white mt-2">
              SISTEMA INTEGRADO DE ALTO IMPACTO
            </h2>
            <p className="text-zinc-500 text-sm font-semibold mt-4">
              Cada módulo se comunica en tiempo real, garantizando que el coach siempre posea el estado actual de cada atleta.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-[#0D0D0D] p-1 rounded-xl border border-zinc-800/80 flex gap-1">
              <button
                onClick={() => setActiveFeatureTab('control')}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeFeatureTab === 'control'
                    ? 'bg-[#DC2626] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Control de Clientes</span>
              </button>
              <button
                onClick={() => setActiveFeatureTab('rutinas')}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeFeatureTab === 'rutinas'
                    ? 'bg-[#DC2626] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Rutinas & Progresos</span>
              </button>
              <button
                onClick={() => setActiveFeatureTab('movil')}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeFeatureTab === 'movil'
                    ? 'bg-[#DC2626] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Experiencia Móvil</span>
              </button>
            </div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="bg-[#0A0A0A] rounded-[32px] border border-zinc-800/80 p-8 md:p-12 min-h-[400px] flex items-center">
            
            {activeFeatureTab === 'control' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase">
                    <span>Módulo de Control Financiero</span>
                    <span>·</span>
                    <span>Automatización</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none text-white">
                    Panel de Control de Clientes
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
                    Mantén una base de datos centralizada de todos tus atletas. Monitorea planes de suscripción activos, vigencias de contratos, y recibe alertas automatizadas sobre próximos vencimientos antes de que ocurran para optimizar la cobranza.
                  </p>
                  
                  <ul className="flex flex-col gap-3 text-xs text-zinc-300 font-bold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Acceso directo a perfil con información de contacto Whatsapp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Estatus de pago codificado por color (Verde = Activo, Rojo = Vencido)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Filtro rápido de atletas sin entrenador o solicitudes pendientes</span>
                    </li>
                  </ul>
                </div>
                
                <div className="lg:col-span-6 bg-[#0E0E0E] p-6 rounded-2xl border border-zinc-800/80 shadow-inner">
                  {/* Visual mockup of the Client Management list inside Trainer panel */}
                  <div className="text-xs font-black uppercase text-zinc-500 mb-4 tracking-wider flex justify-between items-center">
                    <span>Atletas Activos ({'1'})</span>
                    <span className="text-[#DC2626] font-mono">Real-Time Sync</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs">
                          XB
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-white uppercase tracking-tight">Xiomara Ballón</h4>
                          <span className="text-[9px] text-[#DC2626] block font-bold">Plan 1 Mes regular</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 rounded text-[9px] font-bold uppercase border border-emerald-900/60">
                          Vigente
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">Hasta 01/11/26</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800 flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs">
                          MR
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-tight">Mateo Rivas</h4>
                          <span className="text-[9px] text-zinc-500 block font-bold">Membresía Libre</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-950/40 text-rose-400 rounded text-[9px] font-bold uppercase border border-rose-900/60">
                          Vencido
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">Expiró ayer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'rutinas' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase">
                    <span>Programación Científica</span>
                    <span>·</span>
                    <span>Análisis de Carga</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none text-white">
                    Gestor de Rutinas y Progresos
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
                    Diseña bloques de entrenamiento por objetivos. Carga ejercicios predefinidos del catálogo, especifica tempo, RPE objetivo y deja comentarios clave. Monitorea de forma centralizada la sobrecarga progresiva de cada atleta.
                  </p>
                  
                  <ul className="flex flex-col gap-3 text-xs text-zinc-300 font-bold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Copiar rutinas base entre atletas con un solo click</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Visualización instantánea de repeticiones y cargas estimadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Gráficos integrados de evolución de peso y fuerza</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-[#0E0E0E] p-6 rounded-2xl border border-zinc-800/80">
                  {/* Mini Routine Editor Visual */}
                  <div className="text-xs font-black uppercase text-zinc-500 mb-4 tracking-wider flex justify-between items-center">
                    <span>Crear Sesión de Entrenamiento</span>
                    <span className="text-zinc-400 font-bold">GymBro Editor</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#121212] p-3 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-[#DC2626] block uppercase font-bold mb-1">Nombre de la Sesión</span>
                      <span className="text-xs font-black text-white block">Hipertrofia Empuje & Hombros (A)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#121212] p-2.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] text-zinc-500 block uppercase font-bold">Series</span>
                        <span className="text-xs font-black text-white">4 series</span>
                      </div>
                      <div className="bg-[#121212] p-2.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] text-zinc-500 block uppercase font-bold">Reps Objetivo</span>
                        <span className="text-xs font-black text-white">8 - 10 reps</span>
                      </div>
                      <div className="bg-[#121212] p-2.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] text-zinc-500 block uppercase font-bold">RPE Objetivo</span>
                        <span className="text-xs font-black text-[#DC2626]">RPE 9</span>
                      </div>
                    </div>

                    <div className="bg-[#DC2626]/10 p-2.5 rounded-xl border border-[#DC2626]/20 flex items-center justify-between text-xs font-bold text-[#DC2626]">
                      <span>Asignar a: Xiomara Ballón</span>
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'movil' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase">
                    <span>Optimizado para Sala de Pesas</span>
                    <span>·</span>
                    <span>Rápido</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none text-white">
                    Experiencia Móvil de Alto Impacto
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
                    El atleta no necesita descargar pesadas apps de la tienda. Accede escaneando un código QR o mediante un enlace web directo. Guarda el progreso de manera instantánea, permitiendo registrar las series completadas directamente desde el soporte del celular o la banca de press.
                  </p>
                  
                  <ul className="flex flex-col gap-3 text-xs text-zinc-300 font-bold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Diseño optimizado para uso con una sola mano</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Cronómetro integrado para contar descansos entre series</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Guardado inteligente en la nube: no pierdes datos por mala señal</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-full max-w-[320px] bg-[#111111] p-3 rounded-2xl border border-zinc-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">GymBro Chronometer</span>
                      <Clock className="w-4 h-4 text-[#DC2626] animate-pulse" />
                    </div>
                    
                    <div className="bg-black p-4 rounded-xl text-center border border-zinc-900 mb-3">
                      <span className="text-[8px] text-zinc-500 block uppercase font-bold">Tiempo de Descanso</span>
                      <span className="text-2xl font-mono font-black italic text-white tracking-widest block mt-1">01:30</span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-[9px] font-bold uppercase border border-zinc-800">
                        Pausar
                      </button>
                      <button className="flex-1 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-[9px] font-bold uppercase shadow-sm">
                        Reiniciar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* SECTION PRECIOS (PROOF OF CONVERSION VALUE) */}
      <section id="precios" className="py-24 bg-[#080808] border-b border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-black text-[#DC2626]">
              PLANES DE SUSCRIPCIÓN
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic tracking-tighter uppercase leading-[0.9] text-white mt-2">
              LISTO PARA LLEVAR TUS ATLETAS AL PRÓXIMO NIVEL
            </h2>
            <p className="text-zinc-500 text-sm font-semibold mt-4">
              Escalabilidad garantizada para entrenadores independientes, boxes de CrossFit o centros deportivos de alto rendimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Plan 1 */}
            <div className="bg-[#0D0D0D] p-8 rounded-3xl border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Esencial</span>
                <h3 className="text-xl font-black italic uppercase text-white mt-2">Couch Rookie</h3>
                <p className="text-zinc-500 text-xs mt-2 font-medium">Perfecto para entrenadores independientes iniciando su viaje digital.</p>
                
                <div className="my-8">
                  <span className="text-4xl font-black font-mono italic text-white">$29</span>
                  <span className="text-zinc-500 text-xs font-medium lowercase"> / mes</span>
                </div>

                <div className="w-full h-px bg-zinc-900 my-6" />

                <ul className="space-y-3.5 text-xs text-zinc-300 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Hasta 15 Atletas Activos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Gestor de Rutinas Avanzado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-zinc-500 line-through">Sin Soporte de Whatsapp</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setDemoModalOpen(true)}
                className="w-full mt-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-zinc-800 transition-all cursor-pointer"
              >
                Elegir Rookie
              </button>
            </div>

            {/* Plan 2 (Recomendado) */}
            <div className="bg-[#0F0E0E] p-8 rounded-3xl border-2 border-[#DC2626] flex flex-col justify-between relative shadow-[0_0_30px_rgba(220,38,38,0.15)]">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#DC2626] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                RECOMENDADO
              </span>

              <div>
                <span className="text-[10px] text-[#DC2626] uppercase tracking-widest font-bold">Popular</span>
                <h3 className="text-xl font-black italic uppercase text-white mt-2">Couch Pro</h3>
                <p className="text-zinc-400 text-xs mt-2 font-semibold">Ideal para boxes de entrenamiento y coaches consolidados.</p>
                
                <div className="my-8">
                  <span className="text-4xl font-black font-mono italic text-white">$59</span>
                  <span className="text-zinc-500 text-xs font-medium lowercase"> / mes</span>
                </div>

                <div className="w-full h-px bg-zinc-900 my-6" />

                <ul className="space-y-3.5 text-xs text-zinc-200 font-bold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Hasta 80 Atletas Activos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Control de Membresías Automatizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Soporte vía WhatsApp y Alertas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Exportación en PDF y Excel</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setDemoModalOpen(true)}
                className="w-full mt-8 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] cursor-pointer"
              >
                PROBAR COUCH PRO
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-[#0D0D0D] p-8 rounded-3xl border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Elite</span>
                <h3 className="text-xl font-black italic uppercase text-white mt-2">Couch Beast</h3>
                <p className="text-zinc-500 text-xs mt-2 font-medium">Para franquicias de gimnasios y centros multifuncionales.</p>
                
                <div className="my-8">
                  <span className="text-4xl font-black font-mono italic text-white">$129</span>
                  <span className="text-zinc-500 text-xs font-medium lowercase"> / mes</span>
                </div>

                <div className="w-full h-px bg-zinc-900 my-6" />

                <ul className="space-y-3.5 text-xs text-zinc-300 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Atletas Activos Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Dominio Web Propio Integrado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>Atención Personalizada 24/7</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setDemoModalOpen(true)}
                className="w-full mt-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-zinc-800 transition-all cursor-pointer"
              >
                Contactar Ventas
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: CTA FINAL & LEAD CAPTURE */}
      <section id="demo" className="py-24 bg-[#000000] border-b border-zinc-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#DC2626]/5 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          
          <span className="text-xs uppercase tracking-widest font-black text-[#DC2626]">
            ÚNETE HOY
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic tracking-tighter uppercase leading-[0.9] text-white mt-2 max-w-2xl mx-auto">
            ¿Listo para modernizar tu centro de entrenamiento?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-medium mt-4">
            Únete a los entrenadores que optimizan su tiempo y llevan el rendimiento de sus atletas al siguiente nivel. Crea tu cuenta gratuita de prueba por 14 días.
          </p>

          {/* Fully Interactive Lead Capture Form */}
          <div className="bg-[#0A0A0A] p-8 md:p-10 rounded-3xl border border-zinc-800/80 text-left mt-12 max-w-2xl mx-auto shadow-2xl">
            
            {formSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-8 h-8 stroke-[3.5] animate-bounce" />
                </div>
                <h3 className="text-xl font-black italic uppercase text-white">¡Solicitud Procesada!</h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Hemos recibido tus datos con éxito. Uno de nuestros especialistas GymBro te contactará vía WhatsApp para habilitar tu cuenta en los próximos 15 minutos.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-4 text-xs font-black uppercase text-[#DC2626] hover:underline"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Roberto Carlos"
                      className={`w-full bg-[#121212] border ${formErrors.fullName ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#DC2626] transition-colors`}
                    />
                    {formErrors.fullName && (
                      <span className="text-[10px] text-rose-500 font-bold mt-1 block">{formErrors.fullName}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="coach@gymbro.com"
                      className={`w-full bg-[#121212] border ${formErrors.email ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#DC2626] transition-colors`}
                    />
                    {formErrors.email && (
                      <span className="text-[10px] text-rose-500 font-bold mt-1 block">{formErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* WhatsApp */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block mb-2">
                      Número de WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="+51 988 888 888"
                      className={`w-full bg-[#121212] border ${formErrors.whatsapp ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#DC2626] transition-colors`}
                    />
                    {formErrors.whatsapp && (
                      <span className="text-[10px] text-rose-500 font-bold mt-1 block">{formErrors.whatsapp}</span>
                    )}
                  </div>

                  {/* Center Name */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block mb-2">
                      Nombre del Centro / Box / Gym
                    </label>
                    <input
                      type="text"
                      name="centerName"
                      value={formData.centerName}
                      onChange={handleInputChange}
                      placeholder="Iron District"
                      className={`w-full bg-[#121212] border ${formErrors.centerName ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#DC2626] transition-colors`}
                    />
                    {formErrors.centerName && (
                      <span className="text-[10px] text-rose-500 font-bold mt-1 block">{formErrors.centerName}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block mb-2">
                    Cantidad de Atletas Estimada
                  </label>
                  <select
                    name="athletesCount"
                    value={formData.athletesCount}
                    onChange={handleInputChange}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#DC2626] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="1-20">1 - 20 atletas</option>
                    <option value="21-80">21 - 80 atletas</option>
                    <option value="81-200">81 - 200 atletas</option>
                    <option value="200+">Más de 200 atletas</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_18px_rgba(220,38,38,0.4)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  CREA TU CUENTA AHORA
                </button>

                <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 font-bold uppercase mt-4">
                  <Shield className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Prueba gratuita de 14 días sin tarjetas de crédito requeridas</span>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="bg-[#000000] pt-16 pb-12 border-t border-zinc-900 text-zinc-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <div className="flex flex-col gap-4">
              <GymBroWordmarkLogo className="h-7 w-auto self-start" gymColor="#FFFFFF" broColor="#DC2626" />
              <p className="text-xs text-zinc-600 font-medium max-w-xs">
                La plataforma de control y seguimiento de entrenamiento para coaches más potente de Latinoamérica.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] text-white uppercase tracking-widest font-black mb-4">Plataforma</h4>
              <ul className="space-y-2 text-xs font-bold text-zinc-500">
                <li><a href="#beneficios" className="hover:text-[#DC2626] transition-colors">Beneficios</a></li>
                <li><a href="#funcionalidades" className="hover:text-[#DC2626] transition-colors">Funcionalidades</a></li>
                <li><a href="#precios" className="hover:text-[#DC2626] transition-colors">Planes de Pago</a></li>
                <li><button onClick={navigateToApp} className="hover:text-[#DC2626] text-left transition-colors">Iniciar Aplicación</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] text-white uppercase tracking-widest font-black mb-4">Soporte</h4>
              <ul className="space-y-2 text-xs font-bold text-zinc-500">
                <li><a href="#demo" className="hover:text-[#DC2626] transition-colors">Asistencia Coach</a></li>
                <li><span className="text-zinc-600">Whatsapp Oficial: +51 981 245 611</span></li>
                <li><span className="text-zinc-600">Email: soporte@gymbro.com</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] text-white uppercase tracking-widest font-black mb-4">Seguridad & Legal</h4>
              <ul className="space-y-2 text-xs font-bold text-zinc-600">
                <li><span>Políticas de Privacidad</span></li>
                <li><span>Términos del Servicio</span></li>
                <li><span>Servidores Seguros SSL</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-zinc-950 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <span>© {new Date().getFullYear()} GymBro Tech. Todos los derechos reservados.</span>
            <div className="flex items-center gap-1 text-zinc-600">
              <span>Desarrollado para entrenadores de élite mundial.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* DEMO REQUEST MODAL OVERLAY */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0A0A0A] rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-[0_20px_50px_rgba(220,38,38,0.15)] max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[9px] text-[#DC2626] uppercase tracking-widest font-black">Acceso de Prueba Gratis</span>
              <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white mt-1">Habilita tu cuenta GymBro</h3>
              <p className="text-zinc-400 text-xs mt-1">Completa el formulario para recibir un enlace personalizado en tu WhatsApp.</p>
            </div>

            {formSubmitted ? (
              <div className="py-6 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h4 className="text-base font-black uppercase text-white">¡Prueba Activada!</h4>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Tu solicitud ha sido catalogada con prioridad de élite. Te hemos enviado un correo de bienvenida y nos comunicaremos al instante por WhatsApp para brindarte tu contraseña inicial.
                </p>
                <button
                  onClick={() => { setDemoModalOpen(false); setFormSubmitted(false); }}
                  className="mt-4 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-zinc-800"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-black block mb-1">Nombre del Coach</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Escribe tu nombre"
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#DC2626]"
                  />
                  {formErrors.fullName && <span className="text-[9px] text-rose-500 font-bold block mt-1">{formErrors.fullName}</span>}
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-black block mb-1">Email de contacto</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#DC2626]"
                  />
                  {formErrors.email && <span className="text-[9px] text-rose-500 font-bold block mt-1">{formErrors.email}</span>}
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-black block mb-1">WhatsApp (+Código de País)</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+51988888888"
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#DC2626]"
                  />
                  {formErrors.whatsapp && <span className="text-[9px] text-rose-500 font-bold block mt-1">{formErrors.whatsapp}</span>}
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-black block mb-1">Nombre de tu Gimnasio o Box</label>
                  <input
                    type="text"
                    name="centerName"
                    value={formData.centerName}
                    onChange={handleInputChange}
                    placeholder="Por ejemplo: Beast Mode Gym"
                    className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#DC2626]"
                  />
                  {formErrors.centerName && <span className="text-[9px] text-rose-500 font-bold block mt-1">{formErrors.centerName}</span>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(220,38,38,0.3)] mt-2"
                >
                  SOLICITAR MI ACCESO GRATIS
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
