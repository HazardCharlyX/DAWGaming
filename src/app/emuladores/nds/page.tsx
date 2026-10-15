'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { getGamesByPlatform } from '@/lib/games';
import { PLATFORMS } from '@/config/platforms';
import { GameGrid } from '@/components/games/GameGrid';
import { NdsPlayer } from '@/components/emulators/NdsPlayer';
import { ControlsGuide } from '@/components/emulators/ControlsGuide';
import { CountdownTimer } from '@/components/games/CountdownTimer';
import { ArrowLeft, CheckCircle2, Play, Sparkles, Lock, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

export default function NdsPlatformPage() {
  const ndsPlatform = PLATFORMS.nds;
  const ndsGames = useMemo(() => getGamesByPlatform('nds'), []);
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back button & Header */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <Link
          href="/emuladores"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94a3b8] hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Emuladores</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-700/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Funciona: Sí</span>
        </span>
      </div>

      {/* Console Info Header */}
      <div className="bg-[#121822] border border-[#232f3f] rounded-xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0a0e14] border border-[#232f3f] shrink-0">
              <img
                src="/icons/nds_console.png"
                alt="Nintendo DS"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {ndsPlatform.name}
            </h1>
          </div>
          <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed">
            {ndsPlatform.description}
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowPlayer(!showPlayer)}
            className="btn-hardware px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 border-emerald-500 hover:bg-emerald-500 flex items-center gap-2 cursor-pointer rounded-lg shadow-lg shadow-emerald-950/40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{showPlayer ? 'Ocultar Emulador' : 'Lanzar Emulador NDS'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Web NDS Player */}
      {showPlayer && (
        <div className="space-y-6 pt-2">
          <div className="w-full flex justify-center">
            <NdsPlayer />
          </div>
          <div className="max-w-4xl mx-auto">
            <ControlsGuide />
          </div>
        </div>
      )}

      {/* TEASER / PREVIEW SHOWCASE BANNER FOR VOLT WHITE & BLAZE BLACK 2 */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141b28] via-[#101622] to-[#0c1017] border border-amber-500/40 p-5 sm:p-6 shadow-xl shadow-amber-950/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PRÓXIMOS LANZAMIENTOS</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
                <Lock className="w-3 h-3" />
                <span>ACCESO BLOQUEADO</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pokémon Blanco Infinito (Volt White) & Pokémon Negro Rabioso 2 (Blaze Black 2)
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed">
              &ldquo;Van a estar disponibles muy pronto. De hecho, <strong className="text-amber-300">¡podrían estar ya disponibles, pero aún no lo están!</strong>&rdquo;
            </p>

            <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30 text-xs font-mono text-[#cbd5e1] space-y-1">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Condición de Desbloqueo:</span>
              </div>
              <p>
                Para desbloquear su acceso, debéis invitar a un total de <strong className="text-emerald-400">2 energéticas</strong> a Carlos Samper (Hazard) O esperar los <strong className="text-amber-300">25 días</strong> de la cuenta atrás.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            <CountdownTimer size="md" />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/emuladores/nds/pokemon_blanco_infinito"
                className="px-3 py-1.5 rounded-lg bg-[#182333] hover:bg-[#202d42] border border-amber-500/30 text-xs font-mono text-amber-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Preview Blanco Infinito</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/emuladores/nds/pokemon_negro_rabioso_2"
                className="px-3 py-1.5 rounded-lg bg-[#182333] hover:bg-[#202d42] border border-amber-500/30 text-xs font-mono text-amber-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Preview Negro Rabioso 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Games Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Catálogo de Nintendo DS</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#182230] text-emerald-400 border border-[#243346]">
              {ndsGames.length} títulos
            </span>
          </h2>
        </div>

        {ndsGames.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#121822] border border-[#222d3d] text-center text-[#94a3b8] font-mono text-sm max-w-xl">
            Actualmente no hay ninguno.
          </div>
        ) : (
          <GameGrid
            games={ndsGames}
            emptyTitle="Actualmente no hay ninguno."
          />
        )}
      </div>
    </div>
  );
}
