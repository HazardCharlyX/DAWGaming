'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  WHEEL_SEQUENCE,
  ROULETTE_NUMBERS,
  getNumberColor,
  CasinoBet,
  executeAndRecordSpin,
  claimEmergencyLoan,
} from '@/lib/casino';
import {
  RotateCcw,
  Sparkles,
  Coins,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Flame,
  Volume2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

interface CasinoRouletteProps {
  user: User | null;
  chips: number;
  onRequireAuth: () => void;
  onOpenShop: () => void;
}

export function CasinoRoulette({
  user,
  chips,
  onRequireAuth,
  onOpenShop,
}: CasinoRouletteProps) {
  const [selectedChipValue, setSelectedChipValue] = useState<number>(5);
  const [bets, setBets] = useState<CasinoBet[]>([]);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastSpinResult, setLastSpinResult] = useState<{
    netWon: number;
    totalPayout: number;
    winningNumber: number;
    winningColor: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [claimingLoan, setClaimingLoan] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);

  // Draw the 27-slot roulette wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = center - 6;
    const numSlices = WHEEL_SEQUENCE.length; // 27 slices
    const anglePerSlice = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, width, height);

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const num = WHEEL_SEQUENCE[i];
      const color = getNumberColor(num);
      const startAngle = i * anglePerSlice;
      const endAngle = (i + 1) * anglePerSlice;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle =
        color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#1e293b';
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Number text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(num.toString(), radius - 14, 0);
      ctx.restore();
    }

    // Outer metal rim
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner bronze ring
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.55, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0e17';
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center jewel
    ctx.beginPath();
    ctx.arc(center, center, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#d97706';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const addBet = (
    type: 'number' | 'color' | 'parity' | 'half',
    target: number | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high'
  ) => {
    if (spinning) return;
    if (!user) {
      onRequireAuth();
      return;
    }

    setErrorMessage(null);

    if (totalBet + selectedChipValue > chips) {
      setErrorMessage(`No tienes suficientes fichas. Saldo actual: ${chips}`);
      return;
    }

    setBets((prev) => {
      const existing = prev.find((b) => b.type === type && b.target === target);
      if (existing) {
        return prev.map((b) =>
          b.type === type && b.target === target
            ? { ...b, amount: b.amount + selectedChipValue }
            : b
        );
      }
      return [...prev, { type, target, amount: selectedChipValue }];
    });
  };

  const clearBets = () => {
    if (spinning) return;
    setBets([]);
    setErrorMessage(null);
  };

  const handleSpin = async () => {
    if (spinning) return;
    if (!user) {
      onRequireAuth();
      return;
    }
    if (bets.length === 0) {
      setErrorMessage('Debes colocar al menos una apuesta en el tapete.');
      return;
    }
    if (totalBet > chips) {
      setErrorMessage('Tus apuestas superan tu saldo disponible.');
      return;
    }

    setSpinning(true);
    setErrorMessage(null);
    setLastSpinResult(null);

    // Pick winning number fairly among 0 to 26
    const chosenNumber = Math.floor(Math.random() * 27);
    const chosenColor = getNumberColor(chosenNumber);

    // Compute angle to stop pointer at chosen number
    const indexOnWheel = WHEEL_SEQUENCE.indexOf(chosenNumber);
    const numSlices = WHEEL_SEQUENCE.length;
    const anglePerSlice = 360 / numSlices;
    const sliceCenterAngle = indexOnWheel * anglePerSlice + anglePerSlice / 2;

    // Pointer is at TOP (270 degrees)
    const targetOffset = (270 - sliceCenterAngle + 360) % 360;
    const fullSpins = 360 * (6 + Math.floor(Math.random() * 2));
    const nextRotation = wheelRotation + fullSpins + targetOffset - (wheelRotation % 360);

    setWheelRotation(nextRotation);

    // Wait for wheel animation (4.5s)
    setTimeout(async () => {
      try {
        const result = await executeAndRecordSpin(user, bets, chosenNumber);
        setWinningNumber(chosenNumber);
        setLastSpinResult({
          netWon: result.netWon,
          totalPayout: result.totalPayout,
          winningNumber: chosenNumber,
          winningColor: chosenColor,
        });
        setBets([]);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al registrar la tirada en la base de datos.');
      } finally {
        setSpinning(false);
      }
    }, 4600);
  };

  const handleLoan = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setClaimingLoan(true);
    setErrorMessage(null);
    try {
      await claimEmergencyLoan(user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setClaimingLoan(false);
    }
  };

  const getBetOnTarget = (
    type: 'number' | 'color' | 'parity' | 'half',
    target: number | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high'
  ) => {
    return bets.find((b) => b.type === type && b.target === target)?.amount || 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Chips & Shop shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#121824] via-[#0d141e] to-[#0a0f17] border border-[#23354d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Tus Fichas Registradas
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-amber-300">
                {chips.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-400">fichas</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chips <= 5 && (
            <button
              onClick={handleLoan}
              disabled={claimingLoan}
              className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-600/60 text-red-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>{claimingLoan ? 'Pidiendo préstamo...' : 'Préstamo de Emergencia (+10)'}</span>
            </button>
          )}

          <button
            onClick={onOpenShop}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Tienda de Shinies & Respuesta (10.000 pts)</span>
          </button>
        </div>
      </div>

      {/* Main Wheel & Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Roulette Wheel Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-[#090e16] border border-[#1d2b3e] rounded-2xl relative shadow-xl">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ruleta de 27 Números (0 Verde • 1-26 Rojo/Negro)</span>
          </div>

          {/* Pointer needle */}
          <div className="z-20 -mb-3 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_4px_6px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Wheel canvas with rotation */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full p-2 bg-[#05070a] border-4 border-[#243346] shadow-[0_0_35px_rgba(0,0,0,0.8)]">
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="w-full h-full rounded-full transition-transform duration-[4500ms] ease-[cubic-bezier(0.12,0.9,0.2,1)]"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
              }}
            />
          </div>

          {/* Last Result Display */}
          {lastSpinResult && (
            <div
              className={`mt-4 p-3 rounded-xl border text-center font-mono w-full animate-fadeIn ${
                lastSpinResult.netWon >= 0
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-black">
                <span>Número Ganador:</span>
                <span
                  className={`px-2 py-0.5 rounded text-white ${
                    lastSpinResult.winningColor === 'green'
                      ? 'bg-emerald-600'
                      : lastSpinResult.winningColor === 'red'
                      ? 'bg-red-600'
                      : 'bg-slate-800 border border-slate-600'
                  }`}
                >
                  {lastSpinResult.winningNumber} (
                  {lastSpinResult.winningColor.toUpperCase()})
                </span>
              </div>
              <div className="text-xs mt-1">
                {lastSpinResult.netWon > 0
                  ? `🎉 ¡Has ganado +${lastSpinResult.netWon} fichas!`
                  : lastSpinResult.netWon === 0
                  ? 'Te has quedado igual.'
                  : `Has perdido ${Math.abs(lastSpinResult.netWon)} fichas.`}
              </div>
            </div>
          )}
        </div>

        {/* Casino Table Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Chip Value Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0d141f] border border-[#1e2c3d] rounded-xl font-mono text-xs">
            <span className="text-slate-400 font-bold">Valor de Ficha:</span>
            <div className="flex flex-wrap gap-2">
              {[1, 5, 10, 25, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setSelectedChipValue(val)}
                  className={`px-3 py-1 rounded-full font-bold border transition-all cursor-pointer ${
                    selectedChipValue === val
                      ? 'bg-amber-500 text-black border-amber-300 scale-105 shadow-md shadow-amber-950/50'
                      : 'bg-[#151f2e] text-slate-300 border-[#27384f] hover:border-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Green Casino Felt Table */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#06331e] border-4 border-[#0b4d2e] shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-300 font-mono text-xs border-b border-emerald-700/50 pb-2">
              <span className="font-bold tracking-wider uppercase">Tapete de Apuestas</span>
              <span>Total Apostado: <strong className="text-amber-300 font-bold">{totalBet}</strong> fichas</span>
            </div>

            {/* Zero 0 (Green) */}
            <button
              onClick={() => addBet('number', 0)}
              disabled={spinning}
              className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 font-mono font-black text-sm text-white flex items-center justify-between px-4 transition-all shadow-md cursor-pointer active:scale-[0.98]"
            >
              <span>0 (VERDE • Paga 26x)</span>
              {getBetOnTarget('number', 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-xs font-bold">
                  {getBetOnTarget('number', 0)}
                </span>
              )}
            </button>

            {/* Grid of Numbers 1 to 26 */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 font-mono text-xs font-bold">
              {ROULETTE_NUMBERS.slice(1).map((n) => {
                const color = getNumberColor(n);
                const currentBet = getBetOnTarget('number', n);
                return (
                  <button
                    key={n}
                    onClick={() => addBet('number', n)}
                    disabled={spinning}
                    className={`aspect-square sm:aspect-auto py-2.5 rounded-md flex flex-col items-center justify-center border transition-all cursor-pointer active:scale-95 relative ${
                      color === 'red'
                        ? 'bg-red-700 hover:bg-red-600 border-red-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{n}</span>
                    {currentBet > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black shadow">
                        {currentBet}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Outside Bets (Red/Black, Even/Odd, 1-13/14-26) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 font-mono text-xs font-bold">
              {/* Red */}
              <button
                onClick={() => addBet('color', 'red')}
                disabled={spinning}
                className="py-2.5 rounded-lg bg-red-700 hover:bg-red-600 border border-red-500 text-white flex items-center justify-between px-3 cursor-pointer transition-all"
              >
                <span>ROJO (2x)</span>
                {getBetOnTarget('color', 'red') > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {getBetOnTarget('color', 'red')}
                  </span>
                )}
              </button>

              {/* Black */}
              <button
                onClick={() => addBet('color', 'black')}
                disabled={spinning}
                className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-between px-3 cursor-pointer transition-all"
              >
                <span>NEGRO (2x)</span>
                {getBetOnTarget('color', 'black') > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {getBetOnTarget('color', 'black')}
                  </span>
                )}
              </button>

              {/* Even (Par) */}
              <button
                onClick={() => addBet('parity', 'even')}
                disabled={spinning}
                className="py-2.5 rounded-lg bg-[#0e482b] hover:bg-[#125936] border border-emerald-500/60 text-emerald-200 flex items-center justify-between px-3 cursor-pointer transition-all"
              >
                <span>PAR (2x)</span>
                {getBetOnTarget('parity', 'even') > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {getBetOnTarget('parity', 'even')}
                  </span>
                )}
              </button>

              {/* Odd (Impar) */}
              <button
                onClick={() => addBet('parity', 'odd')}
                disabled={spinning}
                className="py-2.5 rounded-lg bg-[#0e482b] hover:bg-[#125936] border border-emerald-500/60 text-emerald-200 flex items-center justify-between px-3 cursor-pointer transition-all"
              >
                <span>IMPAR (2x)</span>
                {getBetOnTarget('parity', 'odd') > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {getBetOnTarget('parity', 'odd')}
                  </span>
                )}
              </button>

              {/* 1 - 13 */}
              <button
                onClick={() => addBet('half', 'low')}
                disabled={spinning}
                className="py-2.5 rounded-lg bg-[#0e482b] hover:bg-[#125936] border border-emerald-500/60 text-emerald-200 flex items-center justify-between px-3 cursor-pointer transition-all"
              >
                <span>1 al 13 (2x)</span>
                {getBetOnTarget('half', 'low') > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {getBetOnTarget('half', 'low')}
                  </span>
                )}
              </button>

              {/* 14 - 26 */}
              <button
                onClick={() => addBet('half', 'high')}
                disabled={spinning}
                className="py-2.5 rounded-lg bg-[#0e482b] hover:bg-[#125936] border border-emerald-500/60 text-emerald-200 flex items-center justify-between px-3 cursor-pointer transition-all"
              >
                <span>14 al 26 (2x)</span>
                {getBetOnTarget('half', 'high') > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {getBetOnTarget('half', 'high')}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons (Clear & Spin) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              onClick={clearBets}
              disabled={spinning || bets.length === 0}
              className="px-3.5 py-2 rounded-lg bg-[#141b27] hover:bg-[#1b2536] border border-[#27374d] text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Limpiar Apuestas</span>
            </button>

            <button
              onClick={handleSpin}
              disabled={spinning || bets.length === 0}
              className={`px-8 py-3 rounded-xl font-mono font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xl ${
                spinning || bets.length === 0
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black border border-amber-300 shadow-amber-950/60 hover:scale-105 active:scale-95'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Girando ruleta...' : `Girar Ruleta (${totalBet} fichas)`}</span>
            </button>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
