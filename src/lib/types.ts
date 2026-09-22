export type PlatformId = 'gba' | 'nds' | 'web';

export type PlatformStatus = 'available' | 'development' | 'planned';

export type GameGenre =
  | 'arcade'
  | 'action'
  | 'adventure'
  | 'rpg'
  | 'platformer'
  | 'puzzle'
  | 'racing'
  | 'shooter'
  | 'strategy';

export type RomSource = 'local' | 'external' | 'cdn';

export interface Platform {
  id: PlatformId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  status: PlatformStatus;
  accentColor: string;
  secondaryColor: string;
  releaseYear: number;
  nativeResolution: string;
  supportedExtensions: string[];
  specs: {
    cpu: string;
    memory: string;
    media: string;
  };
}

export interface GameMetadata {
  title?: string;
  description?: string;
  genre?: GameGenre | string;
  year?: number;
  developer?: string;
  featured?: boolean;
  controlsHint?: string;
  cover?: string;
}

export interface RomManifestEntry {
  id: string;
  slug: string;
  title: string;
  platform: PlatformId;
  genre: string;
  year?: number;
  developer?: string;
  description: string;
  romFile: string;
  romSource: RomSource;
  romSizeFormatted: string;
  romSizeBytes: number;
  coverUrl?: string;
  hasCustomCover: boolean;
  featured: boolean;
  controlsHint?: string;
  createdAt: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  platform: PlatformId;
  genre: string;
  year?: number;
  developer?: string;
  description: string;
  coverUrl?: string;
  romUrl?: string;
  romSource: RomSource;
  romSizeFormatted?: string;
  featured: boolean;
  isWebGame: boolean;
  isPlayable: boolean;
  status: 'ready' | 'in-development' | 'external';
  controlsHint?: string;
}

export interface UserLibraryItem {
  gameId: string;
  platform: PlatformId;
  title: string;
  isFavorite: boolean;
  lastPlayedAt?: string;
  playCount: number;
  totalTimeMinutes: number;
}

export type EmulatorState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'running'
  | 'paused'
  | 'error'
  | 'unsupported';

export interface KeyBinding {
  key: string;
  label: string;
  action: string;
}

export interface ControllerMapping {
  dpadUp: KeyBinding;
  dpadDown: KeyBinding;
  dpadLeft: KeyBinding;
  dpadRight: KeyBinding;
  buttonA: KeyBinding;
  buttonB: KeyBinding;
  buttonL: KeyBinding;
  buttonR: KeyBinding;
  buttonStart: KeyBinding;
  buttonSelect: KeyBinding;
  pause: KeyBinding;
  fullscreen: KeyBinding;
}
