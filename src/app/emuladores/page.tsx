import React from 'react';
import { EMULATOR_PLATFORMS } from '@/config/platforms';
import { getGamesByPlatform } from '@/lib/games';
import { PlatformCard } from '@/components/emulators/PlatformCard';
import { Gamepad2 } from 'lucide-react';

export default function EmulatorsHubPage() {
  const gbaGames = getGamesByPlatform('gba');
  const ndsGames = getGamesByPlatform('nds');

  const getPlatformGameCount = (platformId: string) => {
    if (platformId === 'gba') return gbaGames.length;
    if (platformId === 'nds') return ndsGames.length;
    return 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
          <Gamepad2 className="w-4 h-4" />
          <span>Sistemas y Consolas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Emuladores
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1">
          Selecciona una plataforma para acceder a sus juegos disponibles y emulación en navegador.
        </p>
      </div>

      {/* 1 Tarjeta por emulador (GBA y NDS únicamente) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {EMULATOR_PLATFORMS.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            gameCount={getPlatformGameCount(platform.id)}
          />
        ))}
      </div>
    </div>
  );
}
