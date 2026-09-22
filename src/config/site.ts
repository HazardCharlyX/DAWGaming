export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  badgeVariant?: 'default' | 'accent' | 'warning';
}

export const SITE_CONFIG = {
  name: 'DAWGAMING',
  title: 'DAWGAMING | Biblioteca Gaming para 2º DAW de IES Álvaro Falomir',
  subtitle: 'Biblioteca Gaming para 2º DAW de IES Álvaro Falomir',
  tagline:
    'Juegos hechos por Hazard (Carlos J Samper) con ayuda de Gemini 3.8 Flash y Emuladores funcionales web.',
  description:
    'Juegos hechos por Hazard (Carlos J Samper) con ayuda de Gemini 3.8 Flash y Emuladores funcionales web.',
  url: 'https://dawgaming.vercel.app',
  author: 'Hazard (Carlos J Samper)',
  githubUrl: 'https://github.com/CarlosSamper',
  navItems: [
    { label: 'Inicio', href: '/' },
    { label: 'Juegos', href: '/juegos' },
    { label: 'Emuladores', href: '/emuladores' },
    { label: 'Biblioteca', href: '/biblioteca' },
  ] as NavItem[],
  genres: [
    { id: 'all', label: 'Todos los géneros' },
    { id: 'arcade', label: 'Arcade' },
    { id: 'action', label: 'Acción' },
    { id: 'adventure', label: 'Aventura' },
    { id: 'rpg', label: 'RPG' },
    { id: 'shooter', label: 'Disparos' },
  ],
};
