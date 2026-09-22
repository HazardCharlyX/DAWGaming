'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Game } from '@/lib/types';
import { recordGamePlayed } from '@/lib/storage';
import {
  RotateCcw,
  Maximize2,
  Tv,
  Layout,
  Columns,
  Rows,
  Sparkles,
  Monitor,
  Check,
} from 'lucide-react';

export type NdsScreenLayout =
  | 'hybrid/top'
  | 'top/bottom'
  | 'left/right'
  | 'hybrid/bottom'
  | 'top only'
  | 'bottom only';

interface NdsPlayerProps {
  game?: Partial<Game>;
  romUrl?: string;
  title?: string;
}

interface LayoutOption {
  id: NdsScreenLayout;
  label: string;
  shortLabel: string;
  description: string;
  aspectClass: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'hybrid/top',
    label: 'Híbrido 3:1 (Principal Grande Izq. + Táctil Der.)',
    shortLabel: '3/4 Híbrido',
    description: 'Pantalla superior grande 3/4 a la izquierda y pantalla táctil 1/4 a la derecha',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'top/bottom',
    label: 'Vertical Clásica (Estilo Nintendo DS real)',
    shortLabel: 'Vertical',
    description: 'Pantalla superior e inferior apiladas verticalmente',
    aspectClass: 'aspect-[3/4] sm:aspect-[4/5] max-w-xl mx-auto',
  },
  {
    id: 'left/right',
    label: 'Horizontal (Lado a lado 1:1)',
    shortLabel: 'Horizontal',
    description: 'Ambas pantallas de igual tamaño en paralelo',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'hybrid/bottom',
    label: 'Híbrido Táctil (Táctil Grande Izq. + Superior Der.)',
    shortLabel: 'Táctil Grande',
    description: 'Pantalla táctil grande 3/4 para control cómodo y pantalla superior 1/4 a la derecha',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'top only',
    label: 'Solo Pantalla Superior',
    shortLabel: 'Solo Superior',
    description: 'Muestra únicamente la pantalla superior a tamaño completo',
    aspectClass: 'aspect-[4/3] max-w-2xl mx-auto',
  },
];

export function NdsPlayer({ game, romUrl, title }: NdsPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crtFilter, setCrtFilter] = useState(false);
  const [layout, setLayout] = useState<NdsScreenLayout>('hybrid/top');
  const [isClient, setIsClient] = useState(false);

  const activeTitle = title || game?.title || 'Nintendo DS Web Player';
  const activeRomUrl = romUrl || game?.romUrl || '';

  // Load saved preference from localStorage
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dawgaming_nds_layout') as NdsScreenLayout;
      if (saved && LAYOUT_OPTIONS.some((opt) => opt.id === saved)) {
        setLayout(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (game?.id && game?.title) {
      recordGamePlayed({
        gameId: game.id,
        platform: 'nds',
        title: game.title,
      });
    }
  }, [game]);

  const handleSelectLayout = (newLayout: NdsScreenLayout) => {
    setLayout(newLayout);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dawgaming_nds_layout', newLayout);
    }
  };

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

  const currentOption =
    LAYOUT_OPTIONS.find((opt) => opt.id === layout) || LAYOUT_OPTIONS[0];

  const queryParams = new URLSearchParams({
    core: 'nds',
    name: activeTitle,
    layout: layout,
  });

  if (activeRomUrl) {
    queryParams.set('rom', activeRomUrl);
  }

  const emulatorSrc = `/emulator/index.html?${queryParams.toString()}`;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Chassis Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-[#0a0e15] border-2 border-[#1e293b] rounded-xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Hardware Header Bezel */}
        <div className="bg-[#121822] border-b border-[#1f2b3e] px-4 py-2.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-mono font-bold text-white tracking-wider">
              NINTENDO DS
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded hidden sm:inline">
              DeSmuME WASM
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Modo: {currentOption.shortLabel}</span>
            </span>
          </div>
        </div>

        {/* Emulator Screen Viewport with Dynamic Aspect Ratio */}
        <div
          className={`relative w-full bg-[#070a0e] flex items-center justify-center overflow-hidden transition-all duration-300 ${
            currentOption.aspectClass
          } ${crtFilter ? 'crt-overlay' : ''}`}
        >
          <iframe
            key={layout}
            ref={iframeRef}
            src={emulatorSrc}
            title={activeTitle}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; gamepad; microphone"
          />
        </div>

        {/* Bottom Tactile Hardware Toolbar */}
        <div className="bg-[#101722] border-t border-[#1f2b3e] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              title="Reiniciar emulación"
              className="btn-hardware px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reiniciar</span>
            </button>

            <button
              onClick={() => setCrtFilter(!crtFilter)}
              title="Filtro de líneas CRT"
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

      {/* Screen Layout Selector Bar */}
      <div className="w-full max-w-4xl bg-[#101722] border border-[#1f2b3e] rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Distribución de Pantallas Nintendo DS
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">
            {currentOption.description}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = layout === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectLayout(opt.id)}
                className={`px-3 py-2 rounded-md text-xs font-mono font-medium flex items-center justify-between gap-1.5 transition-all cursor-pointer text-left border ${
                  isSelected
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-950/50'
                    : 'bg-[#141d2b] text-[#94a3b8] border-[#223147] hover:bg-[#1a2536] hover:text-white hover:border-emerald-500/40'
                }`}
              >
                <span className="truncate">{opt.shortLabel}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
