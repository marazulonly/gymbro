import React from 'react';
import { useStore } from '../store';
import { UIStyle } from '../types';

interface AnalogExerciseClockProps {
  elapsedSeconds: number;
  className?: string;
  size?: number;
  onClick?: () => void;
}

export const AnalogExerciseClock: React.FC<AnalogExerciseClockProps> = ({
  elapsedSeconds,
  className = '',
  size = 180,
  onClick,
}) => {
  const { uiStyle = 'soft_porcelain', themeMode = 'light' } = useStore();
  const isDark = themeMode === 'dark';

  // Format digital minutes and seconds
  const totalSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const currentSeconds = totalSeconds % 60;
  const currentMinutes = Math.floor(totalSeconds / 60);

  // Degrees of rotation: 0° is 12 o'clock
  // Segundero moves 6° per second (360° / 60s)
  const secondAngle = currentSeconds * 6;

  // Minutero moves 6° per minute + 0.1° per second (smooth continuous progression)
  const minuteAngle = ((currentMinutes % 60) * 6) + (currentSeconds * 0.1);

  // Border progress bar calculations (radius 43 inside 100x100 box)
  const radius = 43;
  const circumference = 2 * Math.PI * radius; // ~270.18
  // Progress fraction goes from 0 to 1 as seconds advance through the minute
  const progress = totalSeconds === 0 ? 0 : (currentSeconds === 0 ? 1 : currentSeconds / 60);
  const strokeDashoffset = circumference * (1 - progress);

  // Style configurations matching the unified 4-color palette
  const getClockTheme = (style: UIStyle, dark: boolean) => {
    switch (style) {
      case 'soft_porcelain':
        return {
          faceBg: 'var(--color-bg-base)',
          rimTrack: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          progressBar: 'var(--color-accent-blue)',
          minutero: 'var(--color-text-main)',
          segundero: 'var(--color-accent-blue)',
          centerDot: 'var(--color-accent-blue)',
          shadowClass: 'shadow-neu-flat border border-white/60 dark:border-slate-800/60',
          debossedClass: 'bg-[var(--color-bg-base)] text-[var(--color-accent-blue)] shadow-neu-pressed',
        };
      case 'modern_gold':
        return {
          faceBg: 'var(--color-bg-base)',
          rimTrack: dark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)',
          progressBar: 'var(--color-accent-amber)',
          minutero: 'var(--color-text-main)',
          segundero: 'var(--color-accent-amber)',
          centerDot: 'var(--color-accent-amber)',
          shadowClass: dark
            ? 'shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-amber-900/40'
            : 'shadow-[0_10px_25px_rgba(245,158,11,0.12),0_2px_8px_rgba(0,0,0,0.04)] border border-amber-100',
          debossedClass: 'bg-[var(--color-bg-base)] text-[var(--color-accent-amber)] shadow-neu-pressed',
        };
      case 'neon_lime':
        return {
          faceBg: '#121212',
          rimTrack: 'rgba(255,255,255,0.1)',
          progressBar: '#CCFF00',
          minutero: '#FFFFFF',
          segundero: '#CCFF00',
          centerDot: '#CCFF00',
          shadowClass: 'shadow-[0_8px_24px_rgba(0,0,0,0.9)] border border-white/10',
          debossedClass: 'bg-black text-[#CCFF00] border border-[#CCFF00]/40 shadow-inner',
        };
      case 'neumorfico':
      default:
        return {
          faceBg: 'var(--color-bg-base)',
          rimTrack: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          progressBar: 'var(--color-accent-blue)',
          minutero: 'var(--color-text-main)',
          segundero: 'var(--color-accent-blue)',
          centerDot: 'var(--color-accent-blue)',
          shadowClass: dark ? 'shadow-neu-flat' : 'shadow-neu-flat',
          debossedClass: 'bg-[var(--color-bg-base)] text-[var(--color-accent-blue)] shadow-neu-pressed',
        };
    }
  };

  const theme = getClockTheme(uiStyle, isDark);

  const formattedDigital = `${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Analog Clock Disc */}
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        title={onClick ? 'Pulsa sobre el cronometro cuando acabes la serie' : undefined}
        aria-label={onClick ? 'Completar serie (LOGRADO)' : 'Cronómetro analógico'}
        className={`relative rounded-full flex items-center justify-center select-none transition-all duration-300 ${theme.shadowClass} ${
          onClick ? 'cursor-pointer active:scale-95 hover:scale-[1.02] transition-transform duration-150' : ''
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform"
        >
          {/* Base Clock Dial Background */}
          <circle
            cx="50"
            cy="50"
            r="49"
            fill={theme.faceBg}
          />

          {/* Border Progress Track (Background Rim) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={theme.rimTrack}
            strokeWidth="3.5"
          />

          {/* Border Progress Bar (Active Seconds Fill) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={theme.progressBar}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{
              transition: totalSeconds === 0 ? 'none' : 'stroke-dashoffset 0.3s ease-linear',
            }}
          />

          {/* Minutero (Minute Hand) - No hour hand as requested */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="21"
            stroke={theme.minutero}
            strokeWidth="2.4"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 50 50)`}
            style={{
              transition: 'transform 0.25s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
            }}
          />

          {/* Segundero (Second Hand) - With tail for balance */}
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="15"
            stroke={theme.segundero}
            strokeWidth="1.8"
            strokeLinecap="round"
            transform={`rotate(${secondAngle} 50 50)`}
            style={{
              transition: 'transform 0.25s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
            }}
          />

          {/* Center Pivot Dot */}
          <circle
            cx="50"
            cy="50"
            r="3"
            fill={theme.centerDot}
          />
          <circle
            cx="50"
            cy="50"
            r="1.2"
            fill={theme.faceBg}
          />
        </svg>

        {/* Recuadro en bajo relieve con el tiempo transcurrido dentro del reloj debajo del eje */}
        <div
          className={`absolute top-[63%] left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-lg flex items-center justify-center select-none pointer-events-none transition-all duration-200 ${theme.debossedClass}`}
        >
          <span className="font-mono text-sm tracking-wider font-semibold leading-normal">
            {formattedDigital}
          </span>
        </div>
      </div>
    </div>
  );
};
