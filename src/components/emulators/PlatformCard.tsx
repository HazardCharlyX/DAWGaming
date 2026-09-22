import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Platform } from '@/lib/types';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface PlatformCardProps {
  platform: Platform;
  gameCount: number;
}

export function PlatformCard({ platform, gameCount }: PlatformCardProps) {
  const isGBA = platform.id === 'gba';
  const isWorking = platform.status === 'available';
  const href = isGBA ? '/emuladores/gba' : '/emuladores/nds';
  const iconSrc = isGBA ? '/icons/gba_console.png' : '/icons/nds_console.png';

  return (
    <Link
      href={href}
      className="group block w-full bg-[#121822] hover:bg-[#161f2c] border border-[#222d3d] hover:border-emerald-500/60 rounded-xl p-5 shadow-lg transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Console Minimalist Icon + Name + Count */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden bg-[#0a0e14] border border-[#232f3f] shrink-0 group-hover:border-emerald-500/40 transition-colors">
            <img
              src={iconSrc}
              alt={platform.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              {platform.name}
            </h3>
            <p className="text-xs font-mono text-[#94a3b8] mt-1">
              {gameCount} {gameCount === 1 ? 'juego disponible' : 'juegos disponibles'}
            </p>
          </div>
        </div>

        {/* Right: Working Status & Arrow */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1c2635]">
          {isWorking ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-700/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Funciona: Sí</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-amber-950/50 text-amber-400 border border-amber-700/60">
              <XCircle className="w-3.5 h-3.5" />
              <span>Funciona: No (En Desarrollo)</span>
            </span>
          )}

          <div className="w-8 h-8 rounded-md bg-[#18212e] border border-[#283649] flex items-center justify-center text-[#94a3b8] group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
