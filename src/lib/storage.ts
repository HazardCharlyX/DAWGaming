import { UserLibraryItem } from '@/lib/types';
export type { UserLibraryItem };

const STORAGE_KEY_FAVORITES = 'webgaming_favorites_v1';
const STORAGE_KEY_RECENT = 'webgaming_recent_v1';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

export function toggleFavorite(gameId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getFavorites();
    let updated: string[];
    let nowFavorite = false;
    if (current.includes(gameId)) {
      updated = current.filter((id) => id !== gameId);
    } else {
      updated = [...current, gameId];
      nowFavorite = true;
    }
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    window.dispatchEvent(new Event('webgaming-storage-changed'));
    return nowFavorite;
  } catch {
    return false;
  }
}

export function getRecentGames(): UserLibraryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordGamePlayed(item: {
  gameId: string;
  platform: any;
  title: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const recents = getRecentGames();
    const existingIndex = recents.findIndex((r) => r.gameId === item.gameId);

    const now = new Date().toISOString();
    let updated: UserLibraryItem[];

    if (existingIndex >= 0) {
      const existing = recents[existingIndex];
      const updatedItem: UserLibraryItem = {
        ...existing,
        lastPlayedAt: now,
        playCount: (existing.playCount || 0) + 1,
      };
      updated = [
        updatedItem,
        ...recents.filter((r) => r.gameId !== item.gameId),
      ];
    } else {
      const newItem: UserLibraryItem = {
        gameId: item.gameId,
        platform: item.platform,
        title: item.title,
        isFavorite: isFavorite(item.gameId),
        lastPlayedAt: now,
        playCount: 1,
        totalTimeMinutes: 1,
      };
      updated = [newItem, ...recents].slice(0, 20); // Keep last 20
    }

    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
    window.dispatchEvent(new Event('webgaming-storage-changed'));
  } catch (e) {
    console.error('Error saving recent game:', e);
  }
}
