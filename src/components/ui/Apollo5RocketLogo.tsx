'use client';

import React from 'react';

interface Apollo5RocketLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  animated?: boolean;
  subtitle?: string;
}

export function Apollo5RocketLogo({
  className = '',
  size = 'md',
  showText = true,
  animated = false,
  subtitle = 'Holding V5 • Tools & Workflows'
}: Apollo5RocketLogoProps) {
  const sizeMap = {
    sm: { rocket: 'w-8 h-8', textTitle: 'text-xs', textSub: 'text-[8px]', gap: 'gap-1' },
    md: { rocket: 'w-10 h-10', textTitle: 'text-sm font-black', textSub: 'text-[9px]', gap: 'gap-1.5' },
    lg: { rocket: 'w-16 h-16', textTitle: 'text-lg font-black', textSub: 'text-[10px]', gap: 'gap-2' },
    xl: { rocket: 'w-24 h-24', textTitle: 'text-xl font-black', textSub: 'text-xs', gap: 'gap-2.5' },
    hero: { rocket: 'w-32 h-32', textTitle: 'text-3xl font-black', textSub: 'text-sm', gap: 'gap-3' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${currentSize.gap} ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.rocket}`}>
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 w-3/4 h-1/2 bg-gradient-to-t from-amber-500/30 via-orange-500/20 to-transparent blur-md pointer-events-none" />

        <svg
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full relative z-10 drop-shadow-[0_4px_16px_rgba(34,211,238,0.45)] ${animated ? 'hover:-translate-y-1 transition-transform duration-300' : ''}`}
        >
          <defs>
            <linearGradient id="rocket_fuselage_tls" x1="60" y1="10" x2="60" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="90%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="rocket_nose_tls" x1="60" y1="5" x2="60" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="rocket_fins_tls" x1="20" y1="80" x2="100" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="flame_outer_tls" x1="60" y1="125" x2="60" y2="158" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            <linearGradient id="flame_inner_tls" x1="60" y1="125" x2="60" y2="148" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Pluma de Chamas */}
          <path d="M52 125 C45 138, 48 152, 60 158 C72 152, 75 138, 68 125 Z" fill="url(#flame_outer_tls)" opacity="0.9" />
          <path d="M55 125 C50 134, 52 144, 60 148 C68 144, 70 134, 65 125 Z" fill="url(#flame_inner_tls)" />

          {/* Aletas Aerodinâmicas */}
          <path d="M38 92 L22 124 L38 122 Z" fill="url(#rocket_fins_tls)" />
          <path d="M82 92 L98 124 L82 122 Z" fill="url(#rocket_fins_tls)" />

          {/* Fuselagem Saturn IB */}
          <rect x="38" y="32" width="44" height="92" rx="4" fill="url(#rocket_fuselage_tls)" stroke="#1e293b" strokeWidth="1.5" />

          {/* Pintura Xadrez / Padrão Apollo */}
          <rect x="38" y="44" width="22" height="12" fill="#0f172a" />
          <rect x="60" y="56" width="22" height="12" fill="#0f172a" />
          <rect x="38" y="90" width="44" height="4" fill="#0284c7" />

          {/* Insígnia V5 */}
          <text x="60" y="82" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">V5</text>

          {/* Coifa / Nariz */}
          <path d="M38 32 C38 12, 60 5, 60 5 C60 5, 82 12, 82 32 Z" fill="url(#rocket_nose_tls)" stroke="#0284c7" strokeWidth="1" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight text-white uppercase ${currentSize.textTitle}`}>
              APOLLO <span className="text-cyan-400">TOOLS</span>
            </span>
            <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              V5
            </span>
          </div>
          {subtitle && (
            <span className={`text-slate-400 font-mono tracking-widest uppercase ${currentSize.textSub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Apollo5RocketLogo;
