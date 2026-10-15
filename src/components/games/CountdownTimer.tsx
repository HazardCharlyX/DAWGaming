'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  daysTotal?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const STORAGE_KEY = 'dawgaming_hazard_countdown_target_v1';
const DEFAULT_DAYS = 25;

export function CountdownTimer({
  daysTotal = DEFAULT_DAYS,
  size = 'md',
  showLabel = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: daysTotal,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let targetTs: number;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

    if (stored) {
      targetTs = parseInt(stored, 10);
      if (isNaN(targetTs)) {
        targetTs = Date.now() + daysTotal * 24 * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, targetTs.toString());
      }
    } else {
      targetTs = Date.now() + daysTotal * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, targetTs.toString());
    }

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTs - now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [daysTotal]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (!mounted) {
    return (
      <div className="font-mono text-xs text-amber-400/80 animate-pulse flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>Calculando cuenta atrás (25 días)...</span>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-[11px] text-amber-300">
        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
        <span>
          {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
        </span>
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-[#0c111a] border border-amber-500/30 rounded-xl px-4 py-2.5 shadow-lg shadow-amber-950/20">
        {showLabel && (
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Cuenta atrás de desbloqueo:</span>
          </div>
        )}
        <div className="flex items-center gap-1 font-mono text-sm font-bold text-white">
          <span className="px-2 py-1 rounded bg-[#16202e] border border-amber-500/40 text-amber-300">
            {timeLeft.days} <span className="text-[10px] text-neutral-400 font-normal">días</span>
          </span>
          <span className="text-amber-500 font-bold">:</span>
          <span className="px-2 py-1 rounded bg-[#16202e] border border-amber-500/40 text-amber-300">
            {pad(timeLeft.hours)} <span className="text-[10px] text-neutral-400 font-normal">h</span>
          </span>
          <span className="text-amber-500 font-bold">:</span>
          <span className="px-2 py-1 rounded bg-[#16202e] border border-amber-500/40 text-amber-300">
            {pad(timeLeft.minutes)} <span className="text-[10px] text-neutral-400 font-normal">m</span>
          </span>
          <span className="text-amber-500 font-bold">:</span>
          <span className="px-2 py-1 rounded bg-[#16202e] border border-amber-500/40 text-amber-300 min-w-[38px] text-center">
            {pad(timeLeft.seconds)} <span className="text-[10px] text-neutral-400 font-normal">s</span>
          </span>
        </div>
      </div>
    );
  }

  // size === 'lg' (Hero preview display)
  return (
    <div className="w-full bg-gradient-to-b from-[#121927] to-[#0c1018] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-950/30 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {showLabel && (
        <div className="flex items-center justify-between gap-3 mb-4 border-b border-[#1f2b3e] pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
              Tiempo Restante para Desbloqueo Automático
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">
            Periodo de espera: 25 días
          </span>
        </div>
      )}

      {/* Digits cards grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
        {/* Days */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#090d14] border border-amber-500/30 shadow-inner">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
            {timeLeft.days}
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-amber-400/90 font-medium mt-1">
            Días
          </span>
        </div>

        {/* Hours */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#090d14] border border-amber-500/30 shadow-inner">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-amber-400/90 font-medium mt-1">
            Horas
          </span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#090d14] border border-amber-500/30 shadow-inner">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-amber-400/90 font-medium mt-1">
            Minutos
          </span>
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#090d14] border border-amber-500/30 shadow-inner">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-amber-400 tracking-tight animate-pulse">
            {pad(timeLeft.seconds)}
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-amber-400/90 font-medium mt-1">
            Segundos
          </span>
        </div>
      </div>
    </div>
  );
}
