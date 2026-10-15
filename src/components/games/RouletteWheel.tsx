'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { applyRouletteResult } from '@/lib/countdown-sync';
import {
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lock,
  Zap,
  HelpCircle,
  X,
  Flame,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

interface Sector {
  id: string;
  label: string;
  shortLabel: string;
  deltaMs: number;
  weight: number; // Secret weight out of 1000 (NEVER shown to users!)
  color: string;
  textColor: string;
  isJackpot?: boolean;
}

// 10 EQUAL-SIZED SLICES (36° each). Visually identical chances!
const SECTORS: Sector[] = [
  {
    id: 'jackpot',
    label: 'Desbloquear Ya',
    shortLabel: '¡DESBLOQUEAR YA!',
    deltaMs: 0,
    weight: 2, // Exactly 0.2% secret probability
    color: '#f59e0b', // Gold
    textColor: '#ffffff',
    isJackpot: true,
  },
  {
    id: 'plus-5m',
    label: 'Añadir 5 minutos a la espera',
    shortLabel: '+5 Minutos',
    deltaMs: 5 * 60 * 1000,
    weight: 280,
    color: '#ea580c',
    textColor: '#ffffff',
  },
  {
    id: 'minus-5m',
    label: 'Restar 5 minutos a la espera',
    shortLabel: '-5 Minutos',
    deltaMs: -5 * 60 * 1000,
    weight: 40,
    color: '#10b981',
    textColor: '#ffffff',
  },
  {
    id: 'plus-15m',
    label: 'Añadir 15 minutos a la espera',
    shortLabel: '+15 Minutos',
    deltaMs: 15 * 60 * 1000,
    weight: 200,
    color: '#dc2626',
    textColor: '#ffffff',
  },
  {
    id: 'plus-1d',
    label: 'Añadir 1 día al tiempo de espera',
    shortLabel: '+1 Día',
    deltaMs: 24 * 60 * 60 * 1000,
    weight: 110,
    color: '#991b1b',
    textColor: '#ffffff',
  },
  {
    id: 'minus-1d',
    label: 'Restar 1 día a la espera',
    shortLabel: '-1 Día',
    deltaMs: -24 * 60 * 60 * 1000,
    weight: 5, // Exactly 0.5% secret probability
    color: '#06b6d4',
    textColor: '#ffffff',
  },
  {
    id: 'plus-30m',
    label: 'Añadir 30 minutos a la espera',
    shortLabel: '+30 Minutos',
    deltaMs: 30 * 60 * 1000,
    weight: 150,
    color: '#f97316',
    textColor: '#ffffff',
  },
  {
    id: 'plus-1h',
    label: 'Añadir 1 hora al tiempo de espera',
    shortLabel: '+1 Hora',
    deltaMs: 60 * 60 * 1000,
    weight: 100,
    color: '#b91c1c',
    textColor: '#ffffff',
  },
  {
    id: 'plus-12h',
    label: 'Añadir 12 horas a la espera',
    shortLabel: '+12 Horas',
    deltaMs: 12 * 60 * 60 * 1000,
    weight: 60,
    color: '#7c3aed',
    textColor: '#ffffff',
  },
  {
    id: 'hazard-rage',
    label: 'Añadir 2 días (¡Furia de Hazard!)',
    shortLabel: '+2 Días (Furia)',
    deltaMs: 2 * 24 * 60 * 60 * 1000,
    weight: 53,
    color: '#450a0a',
    textColor: '#fca5a5',
  },
];

const NUM_SECTORS = SECTORS.length;
const ANGLE_PER_SECTOR = 360 / NUM_SECTORS; // Exactly 36 degrees per slice

export function RouletteWheel() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [lastResultMessage, setLastResultMessage] = useState<string | null>(null);
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);

  // Trick question modal state for "Desbloquear Ya"
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [hasSubmittedQuestion, setHasSubmittedQuestion] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the equal-slice wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, width, height);

    // Draw slices
    for (let i = 0; i < NUM_SECTORS; i++) {
      const sector = SECTORS[i];
      const startAngle = (i * ANGLE_PER_SECTOR * Math.PI) / 180;
      const endAngle = ((i + 1) * ANGLE_PER_SECTOR * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.color;
      ctx.fill();

      // Border between sectors
      ctx.strokeStyle = '#0b0f17';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + (ANGLE_PER_SECTOR * Math.PI) / 360);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = sector.textColor;
      ctx.font = 'bold 11px monospace';

      // Slight shadow for legibility
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(sector.shortLabel, radius - 16, 0);
      ctx.restore();
    }

    // Outer rim border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DAW', center, center);
  }, []);

  const handleSpinClick = async () => {
    if (spinning) return;

    // 1. Check if user is logged in first
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSpinning(true);
    setSelectedSector(null);
    setLastResultMessage(null);

    // 2. Secret weighted RNG (weights sum to 1000)
    const rand = Math.random() * 1000;
    let cumulative = 0;
    let chosenIndex = 0;

    for (let i = 0; i < NUM_SECTORS; i++) {
      cumulative += SECTORS[i].weight;
      if (rand < cumulative) {
        chosenIndex = i;
        break;
      }
    }

    const chosenSector = SECTORS[chosenIndex];

    // 3. Compute rotation so pointer at TOP (270 degrees) lands on the chosen slice
    // Pointer is at the top (270 deg / -90 deg).
    // Slice i center in standard coordinates is: i * 36 + 18 deg.
    // To align slice center with top (270 deg):
    const sliceCenterAngle = chosenIndex * ANGLE_PER_SECTOR + ANGLE_PER_SECTOR / 2;
    const targetOffset = (270 - sliceCenterAngle + 360) % 360;

    // Add 6 to 8 full revolutions for excitement
    const fullSpins = 360 * (6 + Math.floor(Math.random() * 3));
    const nextRotation = rotation + fullSpins + targetOffset - (rotation % 360);

    setRotation(nextRotation);

    // 4. Wait for animation to finish (4.5s)
    setTimeout(async () => {
      setSpinning(false);
      setSelectedSector(chosenSector);

      // Check if user landed on the trap "Desbloquear Ya"
      if (chosenSector.isJackpot) {
        setShowQuestionModal(true);
        setSelectedAnswer('');
        setCustomAnswer('');
        setQuestionError(null);
        setHasSubmittedQuestion(false);
        return;
      }

      // Normal time addition or subtraction -> Update Firebase Firestore in real-time
      setIsUpdatingDb(true);
      try {
        await applyRouletteResult(user, chosenSector.label, chosenSector.deltaMs);
        if (chosenSector.deltaMs > 0) {
          setLastResultMessage(
            `💥 ¡Mala suerte! Has añadido ${chosenSector.shortLabel} al contador de espera para toda la clase.`
          );
        } else {
          setLastResultMessage(
            `✨ ¡Buena jugada! Has descontado ${chosenSector.shortLabel} del tiempo de espera para todos.`
          );
        }
      } catch (err: any) {
        console.error('Error actualizando contador en Firestore:', err);
        setLastResultMessage(
          `⚠️ Resultado: ${chosenSector.shortLabel} (Ocurrió un error de red al sincronizar con Firebase).`
        );
      } finally {
        setIsUpdatingDb(false);
      }
    }, 4600);
  };

  // Handle submit on the trick question
  const handleConfirmQuestion = () => {
    const finalAnswer = selectedAnswer === 'otra' ? customAnswer.trim() : selectedAnswer;
    if (!finalAnswer) {
      setQuestionError('Debes seleccionar o escribir una respuesta para continuar.');
      return;
    }

    // ALL ANSWERS ARE ALWAYS WRONG! As explicitly instructed by user:
    // "todas las respuestas son incorrectas y les dará el error respuesta errónea, intento de desbloqueo fallido"
    setHasSubmittedQuestion(true);
    setQuestionError('Respuesta errónea, intento de desbloqueo fallido.');
  };

  return (
    <div className="w-full bg-[#0c111a] border border-[#23354d] rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background neon ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c293d] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ruleta de la Suerte de 2º DAW</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Ruleta del Contador Global</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
              Sincronizada
            </span>
          </h3>
        </div>

        <div className="text-left sm:text-right">
          {user ? (
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 sm:justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conectado: {user.displayName || user.email?.split('@')[0]}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Inicia Sesión para Tirar</span>
            </button>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
        Gira la ruleta para alterar el tiempo de espera de <strong className="text-white">Pokémon Blanco Infinito</strong> y{' '}
        <strong className="text-white">Pokémon Negro Rabioso 2</strong>. Cualquier modificación afectará al contador{' '}
        <strong className="text-amber-400">en tiempo real para todos los usuarios</strong>.
      </p>

      {/* Roulette Wheel & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Wheel Display Container */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          {/* Needle / Pointer at top */}
          <div className="z-20 -mb-4 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_6px_rgba(245,158,11,0.6)] animate-bounce" />
          </div>

          {/* Rotating Wheel Canvas */}
          <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full p-2 bg-[#080d14] border-4 border-[#1e2d42] shadow-[0_0_40px_rgba(15,23,42,0.8)]">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="w-full h-full rounded-full transition-transform duration-[4500ms] ease-[cubic-bezier(0.12,0.9,0.2,1)]"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-5">
            <button
              onClick={handleSpinClick}
              disabled={spinning || isUpdatingDb}
              className={`px-8 py-3.5 rounded-xl font-mono font-black text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                spinning
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-2 border-amber-300 shadow-amber-950/50 hover:scale-105 active:scale-95'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Girando ruleta...' : isUpdatingDb ? 'Actualizando base de datos...' : '¡Girar Ruleta!'}</span>
            </button>
          </div>
        </div>

        {/* Options Overview (All equal slices displayed without percentages!) */}
        <div className="lg:col-span-5 space-y-3 bg-[#080d15] border border-[#1d2b3e] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-[#1b2637] pb-2.5">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Casillas Disponibles</span>
            </h4>
            <span className="text-[11px] font-mono text-[#64748b]">10 casillas iguales</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {SECTORS.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#101724] border border-[#1c293c]"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-slate-200 truncate font-medium">{s.shortLabel}</span>
              </div>
            ))}
          </div>

          {/* Last Result Message Box */}
          {lastResultMessage && (
            <div className="mt-3 p-3.5 rounded-lg bg-[#141e2e] border border-cyan-500/40 text-xs font-mono text-cyan-200 leading-relaxed animate-fadeIn">
              {lastResultMessage}
            </div>
          )}

          {!user && (
            <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300/90 leading-tight">
              ⚠️ Inicia sesión para que tus giros actualicen el servidor de Firebase en tiempo real.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TRICK QUESTION MODAL FOR "DESBLOQUEAR YA" (TROLL FEATURE)                  */}
      {/* ========================================================================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0e141f] border-2 border-amber-500/70 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#223044] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>¡CASILLA DORADA: DESBLOQUEO EN JUEGO!</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Pregunta de Seguridad de Hazard
                </h3>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1a2536] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question description */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>PREGUNTA DEFINITIVA:</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                &ldquo;¿Cuál es la bebida energética favorita de Carlos?&rdquo;
              </p>
            </div>

            {/* Multiple Choice Answers */}
            <div className="space-y-2 text-xs font-mono">
              {[
                'Monster Energy Clásica (Verde)',
                'Monster Mango Loco',
                'Red Bull Sandía Edition',
                'Eneryeti Fresa & Nata',
                'Monster Ultra White (Cero Azúcar)',
              ].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAnswer === opt
                      ? 'bg-amber-500/20 border-amber-500/60 text-white'
                      : 'bg-[#121a27] border-[#1d2a3c] text-slate-300 hover:bg-[#182333]'
                  }`}
                >
                  <input
                    type="radio"
                    name="energy-drink-choice"
                    value={opt}
                    checked={selectedAnswer === opt}
                    onChange={() => {
                      setSelectedAnswer(opt);
                      setQuestionError(null);
                    }}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>{opt}</span>
                </label>
              ))}

              <label
                className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAnswer === 'otra'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white'
                    : 'bg-[#121a27] border-[#1d2a3c] text-slate-300 hover:bg-[#182333]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="energy-drink-choice"
                    value="otra"
                    checked={selectedAnswer === 'otra'}
                    onChange={() => {
                      setSelectedAnswer('otra');
                      setQuestionError(null);
                    }}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>Otra respuesta personalizada...</span>
                </div>
                {selectedAnswer === 'otra' && (
                  <input
                    type="text"
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Escribe la bebida aquí..."
                    className="w-full px-3 py-2 bg-[#090d14] border border-[#23354d] rounded-md text-xs text-white placeholder-slate-500 font-mono mt-1 focus:outline-none focus:border-amber-400"
                  />
                )}
              </label>
            </div>

            {/* Error Message if answered */}
            {questionError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-600/70 text-rose-300 text-xs font-mono font-bold flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <p>{questionError}</p>
                  <p className="text-[11px] font-normal text-rose-300/80 mt-1">
                    Carlos no aprueba esta bebida como su favorita. El juego permanece bloqueado.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={handleConfirmQuestion}
                disabled={hasSubmittedQuestion}
                className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
                  hasSubmittedQuestion
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-300 shadow-amber-950/40'
                }`}
              >
                Confirmar Respuesta y Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for login requirement */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
