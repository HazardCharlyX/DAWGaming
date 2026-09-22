import { Game, PlatformId, RomManifestEntry } from '@/lib/types';
import romsManifest from '@/data/roms-manifest.json';
import { BUILTIN_WEB_GAMES } from '@/data/built-in-games';

// Helper to convert RomManifestEntry to Game
function manifestEntryToGame(entry: RomManifestEntry): Game {
  const isPlayable = entry.platform === 'gba' || entry.platform === 'nds';
  const status = isPlayable ? 'ready' : 'in-development';

  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    platform: entry.platform,
    genre: entry.genre,
    year: entry.year,
    developer: entry.developer,
    description: entry.description,
    coverUrl: entry.coverUrl,
    romUrl: entry.romFile,
    romSource: entry.romSource,
    romSizeFormatted: entry.romSizeFormatted,
    featured: entry.featured,
    isWebGame: false,
    isPlayable,
    status,
    controlsHint: entry.controlsHint,
  };
}

export function getAllGames(): Game[] {
  const romGames = (romsManifest as RomManifestEntry[]).map(manifestEntryToGame);
  return [...BUILTIN_WEB_GAMES, ...romGames];
}

export function getGameById(id: string): Game | undefined {
  return getAllGames().find((g) => g.id === id || g.slug === id);
}

export function getGameBySlugAndPlatform(
  platform: PlatformId,
  slug: string
): Game | undefined {
  return getAllGames().find(
    (g) => g.platform === platform && g.slug.toLowerCase() === slug.toLowerCase()
  );
}

export function getGamesByPlatform(platform: PlatformId): Game[] {
  return getAllGames().filter((g) => g.platform === platform);
}

export function getFeaturedGames(): Game[] {
  return getAllGames().filter((g) => g.featured);
}

export function getLatestGames(limit = 6): Game[] {
  // Returns all games reversed (or up to limit)
  return getAllGames().slice(0, limit);
}

export interface FilterOptions {
  search?: string;
  platform?: string;
  genre?: string;
  sortBy?: 'title-asc' | 'title-desc' | 'year-desc' | 'platform';
}

export function filterGames(games: Game[], options: FilterOptions): Game[] {
  let result = [...games];

  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q) ||
        (g.developer && g.developer.toLowerCase().includes(q))
    );
  }

  if (options.platform && options.platform !== 'all') {
    result = result.filter((g) => g.platform === options.platform);
  }

  if (options.genre && options.genre !== 'all') {
    result = result.filter((g) => g.genre.toLowerCase() === options.genre?.toLowerCase());
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'year-desc':
        result.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'platform':
        result.sort((a, b) => a.platform.localeCompare(b.platform));
        break;
    }
  }

  return result;
}
