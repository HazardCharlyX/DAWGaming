'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { getGamesByPlatform } from '@/lib/games';
import { PLATFORMS } from '@/config/platforms';
import { GameGrid } from '@/components/games/GameGrid';
import { NdsPlayer } from '@/components/emulators/NdsPlayer';
import { ControlsGuide } from '@/components/emulators/ControlsGuide';
import { ArrowLeft, CheckCircle2, Play, Sparkles } from 'lucide-react';

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

      {/* Games Catalog Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Juegos Disponibles ({ndsGames.length})
        </h2>

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
