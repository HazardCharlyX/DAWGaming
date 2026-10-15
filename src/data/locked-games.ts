import { Game } from '@/lib/types';

export const LOCKED_NDS_GAMES: Game[] = [
  {
    id: 'nds-pokemon_blanco_infinito',
    slug: 'pokemon_blanco_infinito',
    title: 'Pokémon Blanco Infinito',
    platform: 'nds',
    genre: 'rpg',
    year: 2021,
    developer: 'Drayano / Game Freak',
    description:
      'Versión definitiva y de alta dificultad para Nintendo DS basada en el aclamado hackrom Pokémon Volt White de Drayano. Los 649 Pokémon capturables en Teselia, combates competitivos, cambios de tipos, estadísticas rebalanceadas y líderes con equipos de 6.',
    coverUrl: '/roms/nds/pokemon_blanco_infinito.jpg',
    romUrl: '',
    romSource: 'local',
    romSizeFormatted: 'Pendiente',
    featured: true,
    isWebGame: false,
    isPlayable: false,
    status: 'locked',
    isLocked: true,
    originalBase: 'Pokémon Volt White',
    lockReason: 'Acceso Bloqueado',
    unlockRequirement:
      'Para desbloquear debéis invitar a un total de 2 energéticas a Carlos Samper (Hazard) O esperar 25 días',
    countdownDays: 25,
    previewNotice:
      '¡Podría estar ya disponible en la web, pero aún no lo está! Próximamente en DAW Gaming.',
    controlsHint:
      'D-Pad: Moverse | A: Confirmar / Interactuar | B: Cancelar / Correr | X: Abrir Menú | Y: Objeto Registrado | L/R: Cambiar pantallas',
  },
  {
    id: 'nds-pokemon_negro_rabioso_2',
    slug: 'pokemon_negro_rabioso_2',
    title: 'Pokémon Negro Rabioso 2',
    platform: 'nds',
    genre: 'rpg',
    year: 2022,
    developer: 'Drayano / AphexCubed',
    description:
      'La experiencia definitiva en Teselia 2 basada en Pokémon Blaze Black 2 Redux. Nuevas áreas desbloqueadas, modo desafío profesional, entrenadores con estrategias de torneo, distribución completa de la Pokédex Nacional y mejoras drásticas de QoL.',
    coverUrl: '/roms/nds/pokemon_negro_rabioso_2.jpg',
    romUrl: '',
    romSource: 'local',
    romSizeFormatted: 'Pendiente',
    featured: true,
    isWebGame: false,
    isPlayable: false,
    status: 'locked',
    isLocked: true,
    originalBase: 'Pokémon Blaze Black 2',
    lockReason: 'Acceso Bloqueado',
    unlockRequirement:
      'Para desbloquear debéis invitar a un total de 2 energéticas a Carlos Samper (Hazard) O esperar 25 días',
    countdownDays: 25,
    previewNotice:
      '¡Podría estar ya disponible en la web, pero aún no lo está! Próximamente en DAW Gaming.',
    controlsHint:
      'D-Pad: Moverse | A: Confirmar / Interactuar | B: Cancelar / Correr | X: Abrir Menú | Y: Objeto Registrado | L/R: Cambiar pantallas',
  },
];
