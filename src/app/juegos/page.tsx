import React from 'react';
import { getGamesByPlatform } from '@/lib/games';
import { GameCard } from '@/components/games/GameCard';
import { Monitor } from 'lucide-react';

export const metadata = {
  title: 'Juegos Web | DAWGAMING',
  description: 'Juegos web nativos desarrollados para el navegador.',
};

export default function JuegosWebPage() {
  const webGames = getGamesByPlatform('web');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
          <Monitor className="w-4 h-4" />
          <span>Juegos Web</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Juegos Web
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1">
          Títulos desarrollados en HTML5 Canvas directamente para navegador.
        </p>
      </div>

      {/* Solo juegos web (ningún juego de emulador) */}
      {webGames.length === 0 ? (
        <div className="p-8 rounded-xl bg-[#121822] border border-[#222d3d] text-center text-[#94a3b8] font-mono text-sm max-w-lg mx-auto my-12">
          Actualmente no hay ninguno.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {webGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
