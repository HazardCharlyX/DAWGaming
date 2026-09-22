import React from 'react';
import Link from 'next/link';
import { getGamesByPlatform } from '@/lib/games';
import { EMULATOR_PLATFORMS } from '@/config/platforms';
import { GameCard } from '@/components/games/GameCard';
import { PlatformCard } from '@/components/emulators/PlatformCard';
import { Button } from '@/components/ui/Button';
import { Monitor, Gamepad2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const webGames = getGamesByPlatform('web');
  const gbaGames = getGamesByPlatform('gba');
  const ndsGames = getGamesByPlatform('nds');

  const getPlatformGameCount = (platformId: string) => {
    if (platformId === 'gba') return gbaGames.length;
    if (platformId === 'nds') return ndsGames.length;
    return 0;
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-14 pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0c1118] border-b border-[#1c2635] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            {/* Main Heading requested by user */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Biblioteca Gaming para 2º DAW de IES Álvaro Falomir
            </h1>

            {/* Subtitle requested by user */}
            <p className="text-base sm:text-lg text-emerald-400 font-mono leading-relaxed">
              Juegos hechos por Hazard (Carlos J Samper) con ayuda de Gemini 3.8 Flash y Emuladores funcionales web.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/emuladores/gba">
                <Button size="md" variant="gba" icon={<Gamepad2 className="w-4 h-4" />}>
                  Abrir Game Boy Advance
                </Button>
              </Link>

              <Link href="/emuladores">
                <Button size="md" variant="secondary">
                  Ver Emuladores
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRIMERA SECCIÓN: JUEGOS (JUEGOS WEB)                                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1c2635]">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Juegos Web
            </h2>
          </div>
        </div>

        {/* Mensaje si no hay ninguno */}
        {webGames.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#121822] border border-[#222d3d] text-center text-[#94a3b8] font-mono text-sm max-w-xl">
            Actualmente no hay ninguno.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
            {webGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. SEGUNDA SECCIÓN: EMULADORES (GBA Y NDS CON CARCASA REAL DE CONSOLA)   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1c2635]">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Emuladores
            </h2>
          </div>

          <Link
            href="/emuladores"
            className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Ver consolas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 1 Tarjeta por emulador (con aspecto auténtico de GBA y NDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          {EMULATOR_PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              gameCount={getPlatformGameCount(platform.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
