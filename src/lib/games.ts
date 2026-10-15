import { Game, PlatformId, RomManifestEntry } from '@/lib/types';
import romsManifest from '@/data/roms-manifest.json';
import { BUILTIN_WEB_GAMES } from '@/data/built-in-games';
import { LOCKED_NDS_GAMES } from '@/data/locked-games';

// Helper to convert RomManifestEntry to Game
function manifestEntryToGame(entry: RomManifestEntry): Game {
  const isLocked = entry.isLocked ?? entry.status === 'locked';
  const isPlayable = isLocked ? false : entry.platform === 'gba' || entry.platform === 'nds';
  const status = isLocked ? 'locked' : isPlayable ? 'ready' : 'in-development';

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
    isLocked,
    originalBase: entry.originalBase,
    lockReason: entry.lockReason,
    unlockRequirement: entry.unlockRequirement,
    countdownDays: entry.countdownDays,
    previewNotice: entry.previewNotice,
  };
}

export function getAllGames(): Game[] {
  const romGames = (romsManifest as RomManifestEntry[]).map(manifestEntryToGame);
  
  // Combine built-in web games, rom games, and locked games
  const allKnown = [...BUILTIN_WEB_GAMES, ...romGames];
  const knownIds = new Set(allKnown.map((g) => g.id));
  const additionalLocked = LOCKED_NDS_GAMES.filter((g) => !knownIds.has(g.id));

  return [...allKnown, ...additionalLocked];
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
