import React from 'react';
import { Game } from '@/lib/types';
import { GameCard } from './GameCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Gamepad2 } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export function GameGrid({
  games,
  emptyTitle = 'No se encontraron juegos',
  emptyDescription = 'Prueba ajustando los filtros de búsqueda o la plataforma seleccionada.',
  onResetFilters,
}: GameGridProps) {
  if (games.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<Gamepad2 className="w-8 h-8 text-[#64748b]" />}
        actionLabel={onResetFilters ? 'Restablecer filtros' : 'Ver todos los juegos'}
        actionHref={onResetFilters ? undefined : '/juegos'}
        onActionClick={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
