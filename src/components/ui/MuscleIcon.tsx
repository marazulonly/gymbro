import React from 'react';

export function MuscleIcon({ className = "w-6 h-6 text-white" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Trapezius and neck */}
      <path d="M19 12C20.5 13.5 22 14 24 14C26 14 27.5 13.5 29 12" />
      {/* Shoulders / Deltoids */}
      <path d="M14 16C11 18 8 21 8 25C10 25.5 13 25 15 23" />
      <path d="M34 16C37 18 40 21 40 25C38 25.5 35 25 33 23" />
      {/* Pectorals / Chest curves */}
      <path d="M15 21C18 20.5 21 21 24 23.5C27 21 30 20.5 33 21" />
      <path d="M15 23C16.5 27.5 20.5 29.5 24 28.5C27.5 29.5 31.5 27.5 33 23" />
      {/* Sternum divider */}
      <path d="M24 23.5V33" />
      {/* Abs / Core subtle indicators */}
      <path d="M21 33C22 34 23 34.5 24 34.5C25 34.5 26 34 27 33" />
      <path d="M20 38C22 39 23 39.5 24 39.5C25 39.5 26 39 28 38" />
    </svg>
  );
}
