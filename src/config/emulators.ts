import { ControllerMapping } from '@/lib/types';

export const DEFAULT_KEYBINDINGS: ControllerMapping = {
  dpadUp: { key: 'ArrowUp', label: '↑', action: 'Arriba' },
  dpadDown: { key: 'ArrowDown', label: '↓', action: 'Abajo' },
  dpadLeft: { key: 'ArrowLeft', label: '←', action: 'Izquierda' },
  dpadRight: { key: 'ArrowRight', label: '→', action: 'Derecha' },
  buttonA: { key: 'KeyX', label: 'X', action: 'Botón A' },
  buttonB: { key: 'KeyZ', label: 'Z', action: 'Botón B' },
  buttonL: { key: 'KeyA', label: 'A', action: 'Gatillo L' },
  buttonR: { key: 'KeyS', label: 'S', action: 'Gatillo R' },
  buttonStart: { key: 'Enter', label: 'Enter', action: 'Start' },
  buttonSelect: { key: 'ShiftRight', label: 'R-Shift / Espacio', action: 'Select' },
  pause: { key: 'KeyP', label: 'P', action: 'Pausar' },
  fullscreen: { key: 'KeyF', label: 'F', action: 'Pantalla completa' },
};

export const GBA_CORE_CONFIG = {
  coreName: 'mgba',
  coreLabel: 'mGBA Libretro WebAssembly',
  version: '0.10.x',
  fpsTarget: 60,
  audioSampleRate: 44100,
  saveStateSlots: 3,
};

export const NDS_CORE_CONFIG = {
  coreName: 'melonds',
  coreLabel: 'melonDS WebAssembly',
  version: '0.9.5',
  fpsTarget: 60,
  dualScreenLayout: 'vertical', // 'vertical' | 'horizontal' | 'hybrid'
  touchEnabled: true,
};
