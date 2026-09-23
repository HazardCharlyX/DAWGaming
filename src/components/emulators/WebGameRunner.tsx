'use client';

import React, { useRef, useEffect } from 'react';
import { Game } from '@/lib/types';
import { recordGamePlayed } from '@/lib/storage';
import {
  RotateCcw,
  Maximize2,
  Sparkles,
  Monitor,
} from 'lucide-react';

interface WebGameRunnerProps {
  game: Game;
}

export function WebGameRunner({ game }: WebGameRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recordGamePlayed({
      gameId: game.id,
      platform: 'web',
      title: game.title,
    });
  }, [game]);

  const handleRestart = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => {
        console.warn('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error exiting fullscreen:', err);
      });
    }
  };

  const gameSrc = game.romUrl || `/games/${game.slug}/index.html`;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Outer Chassis */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-[#0a0e15] border-2 border-[#1e293b] rounded-xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Hardware Header Bezel */}
        <div className="bg-[#121822] border-b border-[#1f2b3e] px-4 py-2.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-mono font-bold text-white tracking-wider">
              JUEGO WEB NATIVO
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded hidden sm:inline">
              HTML5 CANVAS / PIXI.JS
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="hidden md:inline text-[#64748b] truncate max-w-[250px]">
              {game.title}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2a384d]" />
            <span className="text-emerald-400">EJECUCIÓN INMEDIATA</span>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#070a0e] flex items-center justify-center overflow-hidden">
          <iframe
            ref={iframeRef}
            src={gameSrc}
            title={game.title}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; gamepad; focus-without-user-activation"
          />
        </div>

        {/* Bottom Hardware Toolbar */}
        <div className="bg-[#101722] border-t border-[#1f2b3e] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              title="Reiniciar Juego"
              className="btn-hardware px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reiniciar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFullscreen}
              title="Pantalla Completa"
              className="btn-hardware px-3 py-1.5 text-xs text-white hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer bg-[#17202e]"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Pantalla Completa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
