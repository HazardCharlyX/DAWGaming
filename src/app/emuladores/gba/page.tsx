'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { getGamesByPlatform } from '@/lib/games';
import { PLATFORMS } from '@/config/platforms';
import { GameGrid } from '@/components/games/GameGrid';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Gamepad2, CheckCircle2 } from 'lucide-react';

export default function GbaPlatformPage() {
  const gbaPlatform = PLATFORMS.gba;
  const gbaGames = useMemo(() => getGamesByPlatform('gba'), []);

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

      <div className="bg-[#121822] border border-[#232f3f] rounded-xl p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0a0e14] border border-[#232f3f] shrink-0">
            <img
              src="/icons/gba_console.png"
              alt="Game Boy Advance"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {gbaPlatform.name}
          </h1>
        </div>
        <p className="text-sm text-[#94a3b8] max-w-2xl leading-relaxed">
          {gbaPlatform.description}
        </p>
      </div>

      {/* Games Catalog Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Juegos Disponibles ({gbaGames.length})
        </h2>

        <GameGrid
          games={gbaGames}
          emptyTitle="No hay juegos de GBA"
          emptyDescription="Añade archivos .gba a public/roms/gba/."
        />
      </div>
    </div>
  );
}
