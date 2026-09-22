'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Game } from '@/lib/types';
import { recordGamePlayed } from '@/lib/storage';
import {
  RotateCcw,
  Maximize2,
  Tv,
  Gamepad2,
  Sparkles,
} from 'lucide-react';

interface GbaPlayerProps {
  game: Game;
}

export function GbaPlayer({ game }: GbaPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crtFilter, setCrtFilter] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    recordGamePlayed({
      gameId: game.id,
      platform: game.platform,
      title: game.title,
    });
  }, [game.id, game.platform, game.title]);

  const handleRestart = () => {
    if (iframeRef.current) {
      setIsLoaded(false);
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

  const emulatorSrc = `/emulator/index.html?core=gba&rom=${encodeURIComponent(
    game.romUrl || ''
  )}&name=${encodeURIComponent(game.title)}`;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Outer Hardware Chassis */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-[#0a0e15] border-2 border-[#1e293b] rounded-xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Hardware Header Bezel */}
        <div className="bg-[#121822] border-b border-[#1f2b3e] px-4 py-2.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-mono font-bold text-white tracking-wider">
              GAME BOY ADVANCE
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded hidden sm:inline">
              mGBA WASM 60 FPS
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="hidden md:inline text-[#64748b] truncate max-w-[200px]">
              {game.title}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2a384d]" />
            <span className="text-emerald-400">AUTO-BOOT ON</span>
          </div>
        </div>

        {/* Emulator Screen Viewport (Aspect ratio 3:2) */}
        <div
          className={`relative w-full aspect-[3/2] bg-[#070a0e] flex items-center justify-center overflow-hidden ${
            crtFilter ? 'crt-overlay' : ''
          }`}
        >
          <iframe
            ref={iframeRef}
            src={emulatorSrc}
            title={game.title}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; gamepad; microphone"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* Bottom Tactile Hardware Toolbar */}
        <div className="bg-[#101722] border-t border-[#1f2b3e] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              title="Reiniciar emulación del juego"
              className="btn-hardware px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reiniciar</span>
            </button>

            <button
              onClick={() => setCrtFilter(!crtFilter)}
              title="Filtro visual de líneas CRT"
              className={`btn-hardware px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer ${
                crtFilter ? 'text-emerald-400 border-emerald-500 bg-emerald-950/40' : 'text-[#64748b]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase">CRT</span>
            </button>
          </div>

          {/* Right Actions */}
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
