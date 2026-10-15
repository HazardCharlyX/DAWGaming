'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Game } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GameCartridgePlaceholder } from './GameCartridgePlaceholder';
import { isFavorite, toggleFavorite } from '@/lib/storage';
import { Play, Heart, Sparkles, HardDrive, Calendar, Lock } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [imgError, setImgError] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(game.id));
    const handleStorage = () => setFavorite(isFavorite(game.id));
    window.addEventListener('webgaming-storage-changed', handleStorage);
    return () => window.removeEventListener('webgaming-storage-changed', handleStorage);
  }, [game.id]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = toggleFavorite(game.id);
    setFavorite(nextState);
  };

  const getPlayUrl = () => {
    if (game.platform === 'gba') {
      return `/emuladores/gba/${game.slug}`;
    }
    if (game.platform === 'nds') {
      return `/emuladores/nds/${game.slug}`;
    }
    return `/juegos/${game.platform}/${game.slug}`;
  };

  return (
    <div className="game-card flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Cover or Placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0c1017]">
          {game.coverUrl && !imgError ? (
            <div className="relative w-full h-full">
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121822] via-transparent to-transparent opacity-80" />
            </div>
          ) : (
            <GameCartridgePlaceholder
              title={game.title}
              platform={game.platform}
              genre={game.genre}
            />
          )}

          {/* Top badges & favorite button */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <Badge variant={game.platform as any}>
                {game.platform.toUpperCase()}
              </Badge>
              {game.isLocked && (
                <Badge variant="danger" className="animate-pulse">
                  <Lock className="w-3 h-3 inline mr-0.5" />
                  BLOQUEADO
                </Badge>
              )}
            </div>

            <button
              onClick={handleFavoriteToggle}
              title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="p-1.5 rounded-md bg-[#0b0f15]/80 hover:bg-[#0b0f15] border border-[#2d3b4e] text-[#94a3b8] hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${
                  favorite ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
          </div>

          {/* Locked overlay tag */}
          {game.isLocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center pointer-events-none transition-opacity group-hover:bg-black/30">
              <div className="w-11 h-11 rounded-full bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400 mb-2 shadow-lg shadow-rose-950/80">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-950/85 px-2.5 py-0.5 rounded-full border border-rose-600/60 shadow">
                Acceso Bloqueado
              </span>
              <span className="text-[10px] font-mono text-amber-300 mt-1.5 bg-black/70 px-2 py-0.5 rounded border border-amber-500/30">
                ⏳ 25 días o 2 energéticas
              </span>
            </div>
          )}

          {/* Development status banner if not ready and not locked */}
          {!game.isLocked && game.status === 'in-development' && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <Badge variant="warning">En Desarrollo</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#94a3b8] mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[#818cf8]">
              {game.genre}
            </span>
            {game.originalBase && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-bold">
                  {game.originalBase}
                </span>
              </>
            )}
            {game.year && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#64748b]" />
                  {game.year}
                </span>
              </>
            )}
            {game.romSizeFormatted && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-[#64748b]" />
                  {game.romSizeFormatted}
                </span>
              </>
            )}
          </div>

          <h3 className="font-bold text-base text-[#f1f5f9] group-hover:text-white transition-colors line-clamp-1 mb-1.5">
            {game.title}
          </h3>

          <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed mb-3">
            {game.description}
          </p>

          {game.isLocked && (
            <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-md mb-1 leading-tight flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
              <span>Para desbloquear: 2 energéticas a Carlos Samper (Hazard) O 25 días.</span>
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="px-4 pb-4 pt-1 border-t border-[#1a2332] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#64748b] truncate max-w-[120px]">
          {game.developer || 'Comunidad'}
        </span>

        <Link href={getPlayUrl()}>
          {game.isLocked ? (
            <Button
              size="sm"
              variant="danger"
              icon={<Lock className="w-3.5 h-3.5" />}
            >
              Bloqueado • Preview
            </Button>
          ) : (
            <Button
              size="sm"
              variant={game.platform === 'gba' ? 'gba' : game.platform === 'nds' ? 'nds' : 'primary'}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              {game.status === 'in-development' ? 'Ver Detalles' : 'Jugar'}
            </Button>
          )}
        </Link>
      </div>
    </div>
  );
}
