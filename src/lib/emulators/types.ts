import { PlatformId, EmulatorState } from '@/lib/types';

export interface EmulatorInstance {
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  restart: () => Promise<void>;
  saveState?: () => Promise<any>;
  loadState?: (state: any) => Promise<void>;
  destroy: () => Promise<void>;
  setVolume?: (volume: number) => void;
}

export interface EmulatorAdapter {
  id: string;
  name: string;
  platform: PlatformId;
  status: 'available' | 'development' | 'planned';
  isSupported: () => boolean;
  launch: (
    container: HTMLElement,
    romUrl: string,
    onStateChange?: (state: EmulatorState) => void
  ) => Promise<EmulatorInstance>;
}
