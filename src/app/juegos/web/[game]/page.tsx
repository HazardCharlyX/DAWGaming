import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameBySlugAndPlatform, getGamesByPlatform } from '@/lib/games';
import { WebGameRunner } from '@/components/emulators/WebGameRunner';
import { GameCard } from '@/components/games/GameCard';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Monitor, Zap } from 'lucide-react';

interface WebGamePageProps {
  params: Promise<{
    game: string;
  }>;
}

export async function generateMetadata({ params }: WebGamePageProps) {
  const { game: slug } = await params;
  const game = getGameBySlugAndPlatform('web', slug);
  if (!game) return { title: 'Juego Web no encontrado' };

  return {
    title: `${game.title} (Juego Web HTML5)`,
    description: game.description,
  };
}

export default async function WebGamePage({ params }: WebGamePageProps) {
  const { game: slug } = await params;
  const game = getGameBySlugAndPlatform('web', slug);

  if (!game) {
    notFound();
  }

  const otherWebGames = getGamesByPlatform('web').filter((g) => g.id !== game.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/juegos"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94a3b8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="web">JUEGO WEB</Badge>
          <Badge variant="success">Ejecución Inmediata</Badge>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {game.title}
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1.5 max-w-3xl leading-relaxed">
          {game.description}
        </p>
      </div>

      {/* Canvas Runner */}
      <div className="w-full flex justify-center">
        <WebGameRunner game={game} />
      </div>

      {/* Controls description box */}
      {game.controlsHint && (
        <div className="max-w-3xl mx-auto w-full bg-[#121822] border border-[#222d3d] rounded-lg p-4 font-mono text-xs flex items-center gap-3">
          <div className="p-2 rounded bg-[#18212e] text-[#10b981] shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#64748b] block mb-0.5">Controles del juego:</span>
            <span className="text-white">{game.controlsHint}</span>
          </div>
        </div>
      )}

      {/* Other Web Games */}
      {otherWebGames.length > 0 && (
        <div className="pt-6 border-t border-[#1c2635] space-y-4">
          <h3 className="text-lg font-bold text-white">
            Otros Juegos Web Integrados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {otherWebGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
