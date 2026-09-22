import React from 'react';
import { PlatformId } from '@/lib/types';
import { Gamepad2, Disc, Monitor, Cpu } from 'lucide-react';

interface GameCartridgePlaceholderProps {
  title: string;
  platform: PlatformId;
  genre?: string;
  className?: string;
}

export function GameCartridgePlaceholder({
  title,
  platform,
  genre,
  className = '',
}: GameCartridgePlaceholderProps) {
  const getTheme = () => {
    switch (platform) {
      case 'gba':
        return {
          bg: 'from-[#1e1b4b] to-[#0f172a]',
          border: 'border-[#5c67f2]/30',
          accent: 'text-[#818cf8]',
          badge: 'GBA CARTRIDGE',
          icon: <Gamepad2 className="w-8 h-8 text-[#818cf8]" />,
        };
      case 'nds':
        return {
          bg: 'from-[#082f49] to-[#0f172a]',
          border: 'border-[#0284c7]/30',
          accent: 'text-[#38bdf8]',
          badge: 'DS CARD',
          icon: <Cpu className="w-8 h-8 text-[#38bdf8]" />,
        };
      case 'web':
        return {
          bg: 'from-[#064e3b] to-[#0f172a]',
          border: 'border-[#10b981]/30',
          accent: 'text-[#34d399]',
          badge: 'WEB ARCADE',
          icon: <Monitor className="w-8 h-8 text-[#34d399]" />,
        };
      default:
        return {
          bg: 'from-[#27272a] to-[#09090b]',
          border: 'border-[#3f3f46]',
          accent: 'text-[#a1a1aa]',
          badge: 'RETRO MEDIA',
          icon: <Disc className="w-8 h-8 text-[#a1a1aa]" />,
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-t-md overflow-hidden bg-gradient-to-br ${theme.bg} border-b ${theme.border} flex flex-col items-center justify-between p-4 select-none ${className}`}
    >
      {/* Subtle cartridge grip ridges */}
      <div className="w-full flex items-center justify-between opacity-40">
        <div className="flex gap-1">
          <span className="w-1 h-3 bg-white/20 rounded-full" />
          <span className="w-1 h-3 bg-white/20 rounded-full" />
          <span className="w-1 h-3 bg-white/20 rounded-full" />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-slate-400">
          {theme.badge}
        </span>
        <div className="flex gap-1">
          <span className="w-1 h-3 bg-white/20 rounded-full" />
          <span className="w-1 h-3 bg-white/20 rounded-full" />
          <span className="w-1 h-3 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Central icon & decorative console plate */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="p-3 rounded-lg bg-[#0b0f15]/60 border border-white/5 mb-2 shadow-inner">
          {theme.icon}
        </div>
        <span className="text-xs font-semibold text-[#f1f5f9] text-center line-clamp-2 px-2">
          {title}
        </span>
      </div>

      {/* Bottom meta label */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
        <span className="uppercase">{genre || 'Juego'}</span>
        <span>{platform.toUpperCase()}</span>
      </div>
    </div>
  );
}
