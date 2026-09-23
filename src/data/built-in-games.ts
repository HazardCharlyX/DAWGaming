import { Game } from '@/lib/types';

export const BUILTIN_WEB_GAMES: Game[] = [
  {
    id: 'web-openwheels',
    slug: 'openwheels',
    title: 'openWheels (Happy Wheels HTML5)',
    platform: 'web',
    genre: 'arcade',
    year: 2024,
    developer: 'jargdev',
    description:
      'Adaptación libre y moderna en HTML5 Canvas del legendario juego de físicas Happy Wheels. Supera niveles llenos de trampas, vehículos estrafalarios y físicas hilarantes.',
    coverUrl: '/games/openwheels/assets/gh/thumb.png',
    romUrl: '/games/openwheels/index.html',
    romSource: 'local',
    featured: true,
    isWebGame: true,
    isPlayable: true,
    status: 'ready',
    controlsHint:
      'Flechas (↑ ↓ ← →): Acelerar / Frenar / Inclinar | Espacio: Acción principal / Saltar | Shift / Ctrl: Acciones secundarias | Z: Eyectar',
  },
];
