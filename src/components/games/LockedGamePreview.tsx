'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Game } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CountdownTimer } from './CountdownTimer';
import { EnergyDrinkChallenge } from './EnergyDrinkChallenge';
import { RouletteWheel } from './RouletteWheel';
import { CasinoModal } from '@/components/casino/CasinoModal';
import {
  Lock,
  ArrowLeft,
  Sparkles,
  Gamepad2,
  Calendar,
  AlertTriangle,
  Flame,
  Zap,
  ShieldAlert,
  Play,
  CheckCircle2,
  Cpu,
  RotateCcw,
  Coins,
} from 'lucide-react';

interface LockedGamePreviewProps {
  game: Game;
}

export function LockedGamePreview({ game }: LockedGamePreviewProps) {
  const [showCasino, setShowCasino] = useState(false);
  const [casinoDefaultTab, setCasinoDefaultTab] = useState<'roulette' | 'shop'>('roulette');

  const isBlanco = game.slug.includes('blanco');
  const hackromName = isBlanco ? 'Pokémon Volt White' : 'Pokémon Blaze Black 2';
  const originalCreator = isBlanco ? 'Drayano' : 'Drayano & AphexCubed';

  const hackromFeatures = isBlanco
    ? [
        {
          title: 'Todos los 649 Pokémon disponibles',
          description:
            'Captura cualquier criatura desde la 1ª hasta la 5ª generación dentro de la región de Teselia sin intercambios externos.',
        },
        {
          title: 'Gimnasios y Alto Mando con 6 Pokémon',
          description:
            'Los líderes de gimnasio cuentan con equipos completos de 6 Pokémon con objetos equipados, EVs/IVs entrenados y coberturas.',
        },
        {
          title: 'Rebalanceo de Tipos y Estadísticas',
          description:
            'Ajustes inspirados en el competitivo: Serperior gana tipo Dragón, cambios en movimientos y más viabilidad en todo el equipo.',
        },
        {
          title: 'Dificultad profesional adaptada',
          description:
            'Una curva de dificultad implacable diseñada para poner a prueba a los entrenadores veteranos de 2º DAW.',
        },
      ]
    : [
        {
          title: 'Secuela Mejorada: Blaze Black 2 Redux',
          description:
            'La experiencia definitiva de Teselia 2 con rutas expandidas, nuevas áreas desbloqueadas y entrenadores completamente renovados.',
        },
        {
          title: 'Dificultad Modo Desafío Integrada',
          description:
            'La IA de combate toma decisiones óptimas, predice cambios y utiliza sinergias de clima y estrategias complejas de torneo.',
        },
        {
          title: 'PWT (Torneo Mundial) Expandido',
          description:
            'Enfréntate a líderes de gimnasio y campeones de todas las regiones pasadas con equipos legendarios rebalanceados.',
        },
        {
          title: 'Calidad de Vida Superior',
          description:
            'Repelente infinito automático, acceso directo a MTs ilimitadas, caramelos raros y tutores de movimientos accesibles.',
        },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fadeIn">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/emuladores/nds"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94a3b8] hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Catálogo de Nintendo DS</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>ACCESO BLOQUEADO</span>
          </span>
          <Badge variant="nds">NINTENDO DS</Badge>
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#121927] via-[#0d131f] to-[#090d14] border border-[#233348] p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Box Art Cover with Lock Overlay */}
          <div className="md:col-span-5 lg:col-span-4 flex justify-center">
            <div className="relative w-64 sm:w-72 aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/50 group">
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[#151d2a] flex items-center justify-center text-white font-mono">
                  Cover Art
                </div>
              )}

              {/* Holographic Lock Badge Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-3 shadow-lg shadow-rose-950/80 animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-600/60 mb-1">
                  Acceso Bloqueado
                </span>
                <span className="text-[11px] font-mono text-neutral-300">
                  Próximamente en DAW Gaming
                </span>
              </div>
            </div>
          </div>

          {/* Details & Announcement */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>PREVIEW EXCLUSIVA • 2º DAW IES ÁLVARO FALOMIR</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {game.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#94a3b8]">
              <span className="px-2 py-0.5 rounded bg-[#1c2636] text-amber-300 font-semibold border border-amber-500/30">
                Hackrom base: {hackromName}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Creador: {originalCreator}</span>
              <span>•</span>
              <span>{game.year}</span>
            </div>

            {/* Cheeky Announcement Banner as requested by user */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#1a2232] to-[#141b27] border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Anuncio Oficial de Disponibilidad:</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-mono">
                &ldquo;Estará disponible muy pronto. De hecho, <strong className="text-amber-300">¡podría estar ya disponible, pero aún no lo está!</strong>&rdquo;
              </p>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                El entorno de emulación Nintendo DS en DAW Gaming está 100% operativo, pero la ROM se encuentra bajo candado.
                Para acelerar su lanzamiento tienes dos caminos: esperar la cuenta atrás o invitar a energéticas a Hazard.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="md"
                variant="primary"
                icon={<Coins className="w-4 h-4 text-amber-950" />}
                onClick={() => {
                  setCasinoDefaultTab('roulette');
                  setShowCasino(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black border-amber-300 font-black shadow-lg shadow-amber-950/60"
              >
                Abrir Casino DAW (20 Fichas)
              </Button>

              <Link href="/emuladores/nds/pokemon_renegade_platinum">
                <Button
                  size="md"
                  variant="nds"
                  icon={<Play className="w-4 h-4 fill-current" />}
                >
                  Jugar a Pokémon Platino (Disponible ya)
                </Button>
              </Link>

              <Link href="/emuladores/nds">
                <Button size="md" variant="secondary">
                  Ver otros juegos NDS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Contador de Cuenta Atrás Sincronizado (25 Días)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#94a3b8]">
          Si nadie invita a Carlos a energéticas y la ruleta no lo altera, el candado se abrirá automáticamente cuando este reloj llegue a cero:
        </p>
        <CountdownTimer daysTotal={game.countdownDays || 25} size="lg" />
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN CASINO DAW: RULETA DE 27 NÚMEROS Y TIENDA DE SHINIES              */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#171206] via-[#101726] to-[#0a0f17] border-2 border-amber-500/50 p-6 sm:p-7 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                CASINO DAW FALOMIR • 20 FICHAS DE SALDO INICIAL
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-400" />
                Registrado en Base de Datos
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Casino: Ruleta de 27 Números & Tienda de Shinies
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
              Juega a la clásica ruleta de casino (27 números: 0 verde, rojo y negro). Comienzas con 20 fichas gratis.
              Acierta plenos (26x) o apuestas a color/paridad. Por <strong className="text-amber-300">10.000 puntos</strong> puedes
              comprar la respuesta a la pregunta de Carlos o canjear <strong className="text-emerald-400">Shinies para Pokémon Renegade Platinum</strong> (500 a 15.000 pts).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => {
                setCasinoDefaultTab('roulette');
                setShowCasino(true);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-mono font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-amber-300"
            >
              <Coins className="w-4 h-4" />
              <span>Mesa de Ruleta</span>
            </button>

            <button
              onClick={() => {
                setCasinoDefaultTab('shop');
                setShowCasino(true);
              }}
              className="px-5 py-3 rounded-xl bg-[#141d2c] hover:bg-[#1a2638] text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider border border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ver Tienda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sincronized Roulette Wheel Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Ruleta de la Suerte: Altera el Tiempo Global
          </h2>
        </div>
        <RouletteWheel />
      </div>

      {/* Interactive Energy Drink Challenge */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Desbloqueo Inmediato: Reto de las 2 Energéticas
          </h2>
        </div>
        <EnergyDrinkChallenge />
      </div>

      {/* Hackrom Features Showcase */}
      <div className="space-y-4 pt-4 border-t border-[#1c2635]">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            ¿Qué incluye esta versión de {hackromName}?
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#94a3b8] max-w-3xl">
          Las versiones de Drayano son reconocidas mundialmente en la comunidad por transformar los juegos originales de Nintendo DS
          en experiencias RPG complejas, balanceadas y desafiantes para jugadores exigentes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hackromFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#121822] border border-[#222d3d] space-y-1.5 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat.title}</span>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed pl-6">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ficha Técnica / Emulator Spec */}
      <div className="bg-[#101620] border border-[#1e2a3b] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Ficha Técnica y Estado del Emulador</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#64748b] block">Plataforma:</span>
            <span className="text-white font-semibold">Nintendo DS</span>
          </div>
          <div>
            <span className="text-[#64748b] block">Motor de emulación:</span>
            <span className="text-emerald-400 font-semibold">DeSmuME WebAssembly</span>
          </div>
          <div>
            <span className="text-[#64748b] block">Estado de la ROM:</span>
            <span className="text-amber-400 font-semibold">Aún sin .nds cargado</span>
          </div>
          <div>
            <span className="text-[#64748b] block">Acceso:</span>
            <span className="text-rose-400 font-semibold">Bloqueado temporalmente</span>
          </div>
        </div>
      </div>

      {/* Casino Modal with Roulette & Shinies Shop */}
      <CasinoModal
        isOpen={showCasino}
        onClose={() => setShowCasino(false)}
        defaultTab={casinoDefaultTab}
      />
    </div>
  );
}
