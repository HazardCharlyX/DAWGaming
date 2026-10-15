'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Coffee, Check, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';

const ENERGY_STORAGE_KEY = 'dawgaming_hazard_energy_count_v1';
const TARGET_ENERGY_COUNT = 2;

export function EnergyDrinkChallenge() {
  const [count, setCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem(ENERGY_STORAGE_KEY) : null;
    if (stored) {
      setCount(Math.min(TARGET_ENERGY_COUNT, Math.max(0, parseInt(stored, 10) || 0)));
    }
  }, []);

  const handleInvite = () => {
    const next = Math.min(TARGET_ENERGY_COUNT, count + 1);
    setCount(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ENERGY_STORAGE_KEY, next.toString());
    }

    if (next === 1) {
      setToastMessage(
        '⚡ ¡1ª Energética registrada! Carlos Samper (Hazard) siente la primera dosis de cafeína, pero aún necesita 1 energética más para terminar de desbloquear el acceso.'
      );
    } else if (next === 2) {
      setToastMessage(
        '🎉 ¡RETO CUMPLIDO! Carlos Samper (Hazard) ha recibido las 2 energéticas. La cafeína está en niveles óptimos. ¡El juego queda pre-aprobado para cuando se añada el archivo .nds al emulador!'
      );
    }
  };

  const handleReset = () => {
    setCount(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ENERGY_STORAGE_KEY, '0');
    }
    setToastMessage('Contador de energéticas reiniciado.');
  };

  if (!mounted) return null;

  const isCompleted = count >= TARGET_ENERGY_COUNT;

  return (
    <div className="w-full bg-[#121824] border border-[#233348] rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden shadow-xl">
      {/* Background neon vibe */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2b3e] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-emerald-400" />
            <span>Condición Alternativa de Desbloqueo</span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Invitar a 2 energéticas a Carlos Samper (Hazard)
          </h3>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Reto Cumplido! ({count}/2)</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Progreso: {count} / {TARGET_ENERGY_COUNT}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Instruction text */}
      <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
        Para saltarse la cuenta atrás de 25 días y desbloquear el acceso a{' '}
        <strong className="text-white">Pokémon Blanco Infinito</strong> y{' '}
        <strong className="text-white">Pokémon Negro Rabioso 2</strong>, los alumnos de 2º DAW de IES Álvaro Falomir
        deben invitar a un total de <strong className="text-emerald-400">2 bebidas energéticas</strong> (Monster,
        Red Bull o similar) a Carlos Samper (Hazard) en persona.
      </p>

      {/* Visual Energy Drink Cans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Can 1 */}
        <div
          className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
            count >= 1
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
              : 'bg-[#0a0e16] border-[#1d2737] opacity-75'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
              count >= 1
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'bg-[#151c27] text-[#64748b] border-[#222f42]'
            }`}
          >
            {count >= 1 ? <Check className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>Energética #1</span>
              {count >= 1 && <span className="text-[10px] text-emerald-400">✓ Entregada</span>}
            </div>
            <div className="text-[11px] text-[#94a3b8]">
              {count >= 1 ? '¡Primer boost de cafeína para Hazard!' : 'Pendiente de entrega a Carlos'}
            </div>
          </div>
        </div>

        {/* Can 2 */}
        <div
          className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
            count >= 2
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
              : 'bg-[#0a0e16] border-[#1d2737] opacity-75'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
              count >= 2
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'bg-[#151c27] text-[#64748b] border-[#222f42]'
            }`}
          >
            {count >= 2 ? <Check className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>Energética #2</span>
              {count >= 2 && <span className="text-[10px] text-emerald-400">✓ Entregada</span>}
            </div>
            <div className="text-[11px] text-[#94a3b8]">
              {count >= 2 ? '¡Sobrecarga completada, acceso listo!' : 'Pendiente de entrega a Carlos'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-[#64748b]">
          <span>Progreso de cafeína</span>
          <span className="text-emerald-400 font-bold">{count === 0 ? '0%' : count === 1 ? '50%' : '100%'}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#0a0e16] overflow-hidden border border-[#1f2b3e]">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : count === 1
                ? 'w-1/2 bg-amber-500'
                : 'w-0'
            }`}
            style={{ width: `${(count / TARGET_ENERGY_COUNT) * 100}%` }}
          />
        </div>
      </div>

      {/* Feedback Toast if interacted */}
      {toastMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-mono leading-relaxed flex items-start gap-2.5 border animate-fadeIn ${
            isCompleted
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
          }`}
        >
          {isCompleted ? (
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          onClick={handleInvite}
          disabled={isCompleted}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-md ${
            isCompleted
              ? 'bg-[#1a2332] text-[#64748b] border border-[#253245] cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-emerald-950/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{isCompleted ? '¡Las 2 energéticas ya fueron entregadas!' : 'Registrar 1 energética para Carlos (+1)'}</span>
        </button>

        {count > 0 && (
          <button
            onClick={handleReset}
            className="text-[11px] font-mono text-[#64748b] hover:text-[#94a3b8] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar reto</span>
          </button>
        )}
      </div>
    </div>
  );
}
