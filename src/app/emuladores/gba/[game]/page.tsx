import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameBySlugAndPlatform, getGamesByPlatform } from '@/lib/games';
import { GbaPlayer } from '@/components/emulators/GbaPlayer';
import { ControlsGuide } from '@/components/emulators/ControlsGuide';
import { GameCard } from '@/components/games/GameCard';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ShieldCheck, Gamepad2 } from 'lucide-react';

interface GamePageProps {
  params: Promise<{
    game: string;
  }>;
}

export async function generateMetadata({ params }: GamePageProps) {
  const { game: slug } = await params;
  const game = getGameBySlugAndPlatform('gba', slug);
  if (!game) return { title: 'Juego no encontrado' };

  return {
    title: `${game.title} | DAWGAMING`,
    description: game.description,
  };
}

export default async function GbaGameRunnerPage({ params }: GamePageProps) {
  const { game: slug } = await params;
  const game = getGameBySlugAndPlatform('gba', slug);

  if (!game) {
    notFound();
  }

  const otherGbaGames = getGamesByPlatform('gba').filter((g) => g.id !== game.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/emuladores/gba"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94a3b8] hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Game Boy Advance</span>
        </Link>

        <Badge variant="gba">GAME BOY ADVANCE</Badge>
      </div>

      {/* 1. Nombre del Juego */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {game.title}
        </h1>
        {game.description && (
          <p className="text-sm text-[#94a3b8] mt-1 max-w-3xl leading-relaxed">
            {game.description}
          </p>
        )}
      </div>

      {/* 2. Área del Emulador (Autostart) */}
      <div className="w-full flex justify-center">
        <GbaPlayer game={game} />
      </div>

      {/* 3. Abajo: Ficha Técnica y Controles (Sin botón de descarga) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Ficha Técnica */}
        <div className="bg-[#121822] border border-[#222d3d] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1d2737] pb-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ficha Técnica</span>
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-[#94a3b8]">
              <span className="text-[#64748b]">Plataforma:</span>
              <span className="text-white">Game Boy Advance</span>
            </div>
            <div className="flex justify-between text-[#94a3b8]">
              <span className="text-[#64748b]">Género:</span>
              <span className="text-emerald-400 uppercase">{game.genre}</span>
            </div>
            {game.year && (
              <div className="flex justify-between text-[#94a3b8]">
                <span className="text-[#64748b]">Año:</span>
                <span className="text-white">{game.year}</span>
              </div>
            )}
            {game.developer && (
              <div className="flex justify-between text-[#94a3b8]">
                <span className="text-[#64748b]">Desarrollador:</span>
                <span className="text-white truncate max-w-[150px]">{game.developer}</span>
              </div>
            )}
            {game.romSizeFormatted && (
              <div className="flex justify-between text-[#94a3b8]">
                <span className="text-[#64748b]">Tamaño ROM:</span>
                <span className="text-white">{game.romSizeFormatted}</span>
              </div>
            )}
            <div className="flex justify-between text-[#94a3b8]">
              <span className="text-[#64748b]">Emulador:</span>
              <span className="text-emerald-400 font-semibold">mGBA WebAssembly</span>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="lg:col-span-2">
          <ControlsGuide />
        </div>
      </div>

      {/* Otros juegos disponibles en GBA */}
      {otherGbaGames.length > 0 && (
        <div className="pt-6 border-t border-[#1c2635] space-y-4">
          <h3 className="text-lg font-bold text-white">
            Otros Juegos de GBA
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {otherGbaGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
