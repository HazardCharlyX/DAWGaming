import { Platform, PlatformId } from '@/lib/types';

export const PLATFORMS: Record<PlatformId, Platform> = {
  gba: {
    id: 'gba',
    name: 'Game Boy Advance',
    shortName: 'GBA',
    tagline: 'Portátil clásica de 32 bits',
    description:
      'Consola portátil de 32 bits de Nintendo. Emulación completa en el navegador con WebAssembly.',
    status: 'available',
    accentColor: '#10b981',
    secondaryColor: '#065f46',
    releaseYear: 2001,
    nativeResolution: '240 × 160',
    supportedExtensions: ['.gba', '.zip'],
    specs: {
      cpu: 'ARM7TDMI a 16.78 MHz',
      memory: '384 KB',
      media: 'Cartuchos ROM',
    },
  },
  nds: {
    id: 'nds',
    name: 'Nintendo DS',
    shortName: 'NDS',
    tagline: 'Consola táctil de doble pantalla',
    description:
      'Consola de doble pantalla y control táctil. Emulación funcional en el navegador con soporte táctil (stylus).',
    status: 'available',
    accentColor: '#0284c7',
    secondaryColor: '#075985',
    releaseYear: 2004,
    nativeResolution: '256 × 384',
    supportedExtensions: ['.nds'],
    specs: {
      cpu: 'ARM9 + ARM7',
      memory: '4 MB RAM',
      media: 'Tarjetas DS',
    },
  },
  web: {
    id: 'web',
    name: 'Juegos Web',
    shortName: 'WEB',
    tagline: 'Arcade nativo para navegador',
    description:
      'Videojuegos desarrollados directamente en HTML5 Canvas.',
    status: 'available',
    accentColor: '#10b981',
    secondaryColor: '#065f46',
    releaseYear: 2026,
    nativeResolution: 'Full HD Dinámico',
    supportedExtensions: [],
    specs: {
      cpu: 'Canvas 2D / JS',
      memory: '60 FPS',
      media: 'Juegos web integrados',
    },
  },
};

export const EMULATOR_PLATFORMS: Platform[] = [PLATFORMS.gba, PLATFORMS.nds];
export const ALL_PLATFORMS: Platform[] = [PLATFORMS.gba, PLATFORMS.nds, PLATFORMS.web];
