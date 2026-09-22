'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface GameFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

export function GameFilters({
  search,
  onSearchChange,
  selectedPlatform,
  onPlatformChange,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  totalResults,
}: GameFiltersProps) {
  const platforms = [
    { id: 'all', label: 'Todos' },
    { id: 'web', label: 'Juegos Web' },
    { id: 'gba', label: 'Game Boy Advance' },
    { id: 'nds', label: 'Nintendo DS' },
  ];

  const hasActiveFilters =
    search.trim() !== '' || selectedPlatform !== 'all' || selectedGenre !== 'all';

  const resetAll = () => {
    onSearchChange('');
    onPlatformChange('all');
    onGenreChange('all');
  };

  return (
    <div className="flex flex-col gap-4 mb-8 bg-[#121822] p-4 sm:p-5 rounded-lg border border-[#222d3d]">
      {/* Top row: Search input & Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título, desarrollador, género..."
            className="w-full bg-[#18212e] border border-[#2d3b4e] rounded-md pl-10 pr-9 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#f1f5f9]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Genre dropdowns */}
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="bg-[#18212e] border border-[#2d3b4e] text-xs sm:text-sm text-[#f1f5f9] rounded-md px-3 py-2 focus:outline-none focus:border-[#5c67f2] cursor-pointer"
            >
              {SITE_CONFIG.genres.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#121822]">
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-[#18212e] border border-[#2d3b4e] text-xs sm:text-sm text-[#f1f5f9] rounded-md px-3 py-2 focus:outline-none focus:border-[#5c67f2] cursor-pointer"
            >
              <option value="title-asc" className="bg-[#121822]">
                Nombre (A-Z)
              </option>
              <option value="title-desc" className="bg-[#121822]">
                Nombre (Z-A)
              </option>
              <option value="year-desc" className="bg-[#121822]">
                Año (Recientes)
              </option>
              <option value="platform" className="bg-[#121822]">
                Plataforma
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom row: Platform pills & Results counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1e2736]">
        <div className="flex flex-wrap items-center gap-1.5">
          {platforms.map((p) => {
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPlatformChange(p.id)}
                className={`px-3 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                    : 'bg-[#18212e] text-[#94a3b8] border-[#283547] hover:bg-[#1f2b3b] hover:text-[#f1f5f9]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#64748b]">
          <span>
            {totalResults} {totalResults === 1 ? 'juego disponible' : 'juegos disponibles'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
