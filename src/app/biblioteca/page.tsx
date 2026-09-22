'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllGames } from '@/lib/games';
import { getFavorites, getRecentGames, UserLibraryItem } from '@/lib/storage';
import { Game } from '@/lib/types';
import { GameGrid } from '@/components/games/GameGrid';
import { Button } from '@/components/ui/Button';
import { Heart, History, Clock, Trash2, ArrowRight, Gamepad2 } from 'lucide-react';

export default function UserLibraryPage() {
  const allGames = useMemo(() => getAllGames(), []);

  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>('favorites');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<UserLibraryItem[]>([]);

  const loadData = () => {
    setFavoriteIds(getFavorites());
    setRecentItems(getRecentGames());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('webgaming-storage-changed', loadData);
    return () => window.removeEventListener('webgaming-storage-changed', loadData);
  }, []);

  const favoriteGames: Game[] = useMemo(() => {
    return allGames.filter((g) => favoriteIds.includes(g.id));
  }, [allGames, favoriteIds]);

  const recentGames: Game[] = useMemo(() => {
    const ids = recentItems.map((r) => r.gameId);
    // Sort in order of recents
    return ids
      .map((id) => allGames.find((g) => g.id === id))
      .filter((g): g is Game => Boolean(g));
  }, [allGames, recentItems]);

  const clearRecents = () => {
    if (confirm('¿Estás seguro de que deseas vaciar tu historial de partidas recientes?')) {
      localStorage.removeItem('webgaming_recent_v1');
      window.dispatchEvent(new Event('webgaming-storage-changed'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2635]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#818cf8] uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Perfil y Almacenamiento Local</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mi Biblioteca
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Tus juegos favoritos guardados y el historial de partidas en este navegador
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#121822] border border-[#222e40] rounded-lg p-1 shrink-0">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#5c67f2] text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favoritos ({favoriteGames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-[#5c67f2] text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Recientes ({recentGames.length})</span>
          </button>
        </div>
      </div>

      {/* Content for Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <GameGrid
            games={favoriteGames}
            emptyTitle="Aún no tienes juegos favoritos"
            emptyDescription="Explora el catálogo y pulsa el icono de corazón en cualquier tarjeta para guardarlo aquí."
          />
        </div>
      )}

      {/* Content for Recent Games */}
      {activeTab === 'recent' && (
        <div className="space-y-6">
          {recentGames.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearRecents}
                className="text-xs font-mono text-[#64748b] hover:text-rose-400 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar historial</span>
              </button>
            </div>
          )}

          <GameGrid
            games={recentGames}
            emptyTitle="Aún no has iniciado ninguna partida"
            emptyDescription="Lanza cualquier juego desde el catálogo o los emuladores para registrarlo en tu historial."
          />
        </div>
      )}
    </div>
  );
}
