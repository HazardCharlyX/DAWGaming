'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  WHEEL_SEQUENCE,
  ROULETTE_NUMBERS,
  RED_NUMBERS,
  BLACK_NUMBERS,
  VOISINS_NUMBERS,
  TIER_NUMBERS,
  ORPHELINS_NUMBERS,
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
  Flame,
  Trash2,
  ShieldCheck,
  Volume2,
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

  // Draw the authentic European Wooden & Gold Roulette Wheel (37 slots)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = center - 8;
    const numSlices = WHEEL_SEQUENCE.length; // 37
    const anglePerSlice = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, width, height);

    // 1. Outer Gold Rim
    const rimGrad = ctx.createRadialGradient(center, center, radius * 0.85, center, center, radius);
    rimGrad.addColorStop(0, '#ca8a04');
    rimGrad.addColorStop(0.5, '#fde047');
    rimGrad.addColorStop(0.8, '#a16207');
    rimGrad.addColorStop(1, '#713f12');
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Diamond frets on gold rim
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const dx = center + (radius - 5) * Math.cos(a);
      const dy = center + (radius - 5) * Math.sin(a);
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // 2. Rich Mahogany Wood Bowl
    const woodRadius = radius * 0.88;
    const woodGrad = ctx.createRadialGradient(center, center, radius * 0.6, center, center, woodRadius);
    woodGrad.addColorStop(0, '#3b1807');
    woodGrad.addColorStop(0.7, '#240d04');
    woodGrad.addColorStop(1, '#150602');
    ctx.beginPath();
    ctx.arc(center, center, woodRadius, 0, 2 * Math.PI);
    ctx.fillStyle = woodGrad;
    ctx.fill();

    // 3. Number Track (Red, Black, and Green 0)
    const trackOuterRadius = woodRadius * 0.94;
    const trackInnerRadius = woodRadius * 0.68;

    for (let i = 0; i < numSlices; i++) {
      const num = WHEEL_SEQUENCE[i];
      const color = getNumberColor(num);
      const startAngle = i * anglePerSlice;
      const endAngle = (i + 1) * anglePerSlice;

      ctx.beginPath();
      ctx.arc(center, center, trackOuterRadius, startAngle, endAngle);
      ctx.arc(center, center, trackInnerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle =
        color === 'green' ? '#15803d' : color === 'red' ? '#dc2626' : '#0f172a';
      ctx.fill();

      // Silver separator fret
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Number text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Times New Roman", serif, monospace';
      ctx.fillText(num.toString(), trackOuterRadius - 6, 0);
      ctx.restore();
    }

    // 4. Inner Bowl Cone (Wood with Shadow)
    const coneGrad = ctx.createRadialGradient(center, center, trackInnerRadius * 0.2, center, center, trackInnerRadius);
    coneGrad.addColorStop(0, '#fef08a');
    coneGrad.addColorStop(0.4, '#ca8a04');
    coneGrad.addColorStop(0.8, '#451a03');
    coneGrad.addColorStop(1, '#1c0902');
    ctx.beginPath();
    ctx.arc(center, center, trackInnerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // 5. Center Brass Turret & 4-Spoke Crossbar
    const turretRadius = trackInnerRadius * 0.42;

    // 4 spokes
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(center - turretRadius * 1.5, center);
    ctx.lineTo(center + turretRadius * 1.5, center);
    ctx.moveTo(center, center - turretRadius * 1.5);
    ctx.lineTo(center, center + turretRadius * 1.5);
    ctx.stroke();

    // Brass hub
    const hubGrad = ctx.createRadialGradient(center - 3, center - 3, 2, center, center, turretRadius * 0.6);
    hubGrad.addColorStop(0, '#fef9c3');
    hubGrad.addColorStop(0.5, '#eab308');
    hubGrad.addColorStop(1, '#854d0e');
    ctx.beginPath();
    ctx.arc(center, center, turretRadius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, []);

  const addBet = (
    type: CasinoBet['type'],
    target: string | number
  ) => {
    if (spinning) return;
    if (!user) {
      onRequireAuth();
      return;
    }

    setErrorMessage(null);

    if (totalBet + selectedChipValue > chips) {
      setErrorMessage(`Fichas insuficientes. Saldo actual: ${chips}`);
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
      setErrorMessage('Debes colocar al menos una ficha en el tapete para girar.');
      return;
    }
    if (totalBet > chips) {
      setErrorMessage('Tus apuestas superan tu saldo disponible.');
      return;
    }

    setSpinning(true);
    setErrorMessage(null);
    setLastSpinResult(null);

    // Pick winning number among 0 to 36
    const chosenNumber = Math.floor(Math.random() * 37);
    const chosenColor = getNumberColor(chosenNumber);

    // Align slice center with pointer at top (270 deg)
    const indexOnWheel = WHEEL_SEQUENCE.indexOf(chosenNumber);
    const numSlices = WHEEL_SEQUENCE.length;
    const anglePerSlice = 360 / numSlices;
    const sliceCenterAngle = indexOnWheel * anglePerSlice + anglePerSlice / 2;

    const targetOffset = (270 - sliceCenterAngle + 360) % 360;
    const fullSpins = 360 * (6 + Math.floor(Math.random() * 2));
    const nextRotation = wheelRotation + fullSpins + targetOffset - (wheelRotation % 360);

    setWheelRotation(nextRotation);

    setTimeout(async () => {
      try {
        const result = await executeAndRecordSpin(user, bets, chosenNumber);
        setLastSpinResult({
          netWon: result.netWon,
          totalPayout: result.totalPayout,
          winningNumber: chosenNumber,
          winningColor: chosenColor,
        });
        setBets([]);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al registrar la tirada en Firestore.');
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

  const getBetAmount = (type: CasinoBet['type'], target: string | number) => {
    return bets.find((b) => b.type === type && b.target === target)?.amount || 0;
  };

  // Numbers rows for 3x12 grid (matches European Roulette layout exactly)
  const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

  return (
    <div className="space-y-6">
      {/* Top Banner: Chips & Shop shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#072412] border border-[#14532d] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">
              Fichas Verificadas en Base de Datos
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-amber-300">
                {chips.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-emerald-300/80">fichas</span>
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
              <span>{claimingLoan ? 'Pidiendo préstamo...' : 'Préstamo de Carlos (+10)'}</span>
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

      {/* Main European Felt Table (Matches User Image) */}
      <div className="p-5 sm:p-7 rounded-2xl bg-[#09381c] border-4 border-[#072d17] shadow-2xl relative overflow-hidden space-y-6">
        {/* Title as in the image */}
        <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide font-normal">
            European roulette
          </h2>
          <span className="text-xs font-mono text-emerald-300">
            Total Apostado: <strong className="text-amber-300 font-bold">{totalBet}</strong> fichas
          </span>
        </div>

        {/* Layout: Wheel on Left, Tables on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel Column */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {/* Top Pointer Needle */}
            <div className="z-20 -mb-3 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-300 drop-shadow-[0_4px_6px_rgba(253,224,71,0.8)]" />
            </div>

            {/* Wheel Canvas */}
            <div className="relative w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] rounded-full p-2 bg-[#051c0e] border-4 border-[#ca8a04] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <canvas
                ref={canvasRef}
                width={330}
                height={330}
                className="w-full h-full rounded-full transition-transform duration-[4500ms] ease-[cubic-bezier(0.12,0.9,0.2,1)]"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                }}
              />
            </div>

            {/* Last Spin Result Callout */}
            {lastSpinResult && (
              <div
                className={`mt-4 p-3 rounded-xl border text-center font-mono w-full animate-fadeIn ${
                  lastSpinResult.netWon >= 0
                    ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                    : 'bg-red-950/70 border-red-500 text-red-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-sm font-black">
                  <span>Resultado:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-white font-bold ${
                      lastSpinResult.winningColor === 'green'
                        ? 'bg-emerald-600'
                        : lastSpinResult.winningColor === 'red'
                        ? 'bg-red-600'
                        : 'bg-black border border-slate-700'
                    }`}
                  >
                    {lastSpinResult.winningNumber} ({lastSpinResult.winningColor.toUpperCase()})
                  </span>
                </div>
                <div className="text-xs mt-1">
                  {lastSpinResult.netWon > 0
                    ? `🎉 ¡Has ganado +${lastSpinResult.netWon} fichas!`
                    : lastSpinResult.netWon === 0
                    ? 'Empate.'
                    : `Has perdido ${Math.abs(lastSpinResult.netWon)} fichas.`}
                </div>
              </div>
            )}
          </div>

          {/* Tables Column (Main Grid + Racetrack Oval) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. MAIN BETTING TABLE (White Grid on Green Felt) */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[560px] border border-white/60 bg-[#073017] select-none text-xs font-mono shadow-xl">
                {/* 3 Rows of Numbers with 0 on Left and 2 to 1 on Right */}
                <div className="grid grid-cols-[54px_repeat(12,1fr)_48px] border-b border-white/60">
                  {/* Zero '0' Cell spanning row height */}
                  <button
                    onClick={() => addBet('number', 0)}
                    disabled={spinning}
                    className="row-span-3 bg-[#15803d] hover:bg-[#16a34a] border-r border-white/60 text-white font-serif text-lg font-bold flex items-center justify-center cursor-pointer relative transition-colors"
                  >
                    <span>0</span>
                    {getBetAmount('number', 0) > 0 && (
                      <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('number', 0)}
                      </span>
                    )}
                  </button>

                  {/* Row 1 (Top: 3, 6, 9... 36) */}
                  {row1.map((num) => {
                    const color = getNumberColor(num);
                    const betAmt = getBetAmount('number', num);
                    return (
                      <button
                        key={num}
                        onClick={() => addBet('number', num)}
                        disabled={spinning}
                        className={`h-9 border-r border-b border-white/60 flex items-center justify-center font-bold text-white relative transition-colors cursor-pointer ${
                          color === 'red' ? 'bg-[#dc2626] hover:bg-[#ef4444]' : 'bg-[#0f172a] hover:bg-[#1e293b]'
                        }`}
                      >
                        <span>{num}</span>
                        {betAmt > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black shadow">
                            {betAmt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {/* Row 1: 2 to 1 */}
                  <button
                    onClick={() => addBet('column', 'col3')}
                    disabled={spinning}
                    className="h-9 border-b border-white/60 bg-[#073017] hover:bg-[#0c4422] text-white text-[10px] font-semibold flex items-center justify-center cursor-pointer"
                  >
                    2 to 1
                    {getBetAmount('column', 'col3') > 0 && (
                      <span className="ml-0.5 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('column', 'col3')}
                      </span>
                    )}
                  </button>

                  {/* Row 2 (Middle: 2, 5, 8... 35) */}
                  {row2.map((num) => {
                    const color = getNumberColor(num);
                    const betAmt = getBetAmount('number', num);
                    return (
                      <button
                        key={num}
                        onClick={() => addBet('number', num)}
                        disabled={spinning}
                        className={`h-9 border-r border-b border-white/60 flex items-center justify-center font-bold text-white relative transition-colors cursor-pointer ${
                          color === 'red' ? 'bg-[#dc2626] hover:bg-[#ef4444]' : 'bg-[#0f172a] hover:bg-[#1e293b]'
                        }`}
                      >
                        <span>{num}</span>
                        {betAmt > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black shadow">
                            {betAmt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {/* Row 2: 2 to 1 */}
                  <button
                    onClick={() => addBet('column', 'col2')}
                    disabled={spinning}
                    className="h-9 border-b border-white/60 bg-[#073017] hover:bg-[#0c4422] text-white text-[10px] font-semibold flex items-center justify-center cursor-pointer"
                  >
                    2 to 1
                    {getBetAmount('column', 'col2') > 0 && (
                      <span className="ml-0.5 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('column', 'col2')}
                      </span>
                    )}
                  </button>

                  {/* Row 3 (Bottom: 1, 4, 7... 34) */}
                  {row3.map((num) => {
                    const color = getNumberColor(num);
                    const betAmt = getBetAmount('number', num);
                    return (
                      <button
                        key={num}
                        onClick={() => addBet('number', num)}
                        disabled={spinning}
                        className={`h-9 border-r border-white/60 flex items-center justify-center font-bold text-white relative transition-colors cursor-pointer ${
                          color === 'red' ? 'bg-[#dc2626] hover:bg-[#ef4444]' : 'bg-[#0f172a] hover:bg-[#1e293b]'
                        }`}
                      >
                        <span>{num}</span>
                        {betAmt > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black shadow">
                            {betAmt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {/* Row 3: 2 to 1 */}
                  <button
                    onClick={() => addBet('column', 'col1')}
                    disabled={spinning}
                    className="h-9 bg-[#073017] hover:bg-[#0c4422] text-white text-[10px] font-semibold flex items-center justify-center cursor-pointer"
                  >
                    2 to 1
                    {getBetAmount('column', 'col1') > 0 && (
                      <span className="ml-0.5 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('column', 'col1')}
                      </span>
                    )}
                  </button>
                </div>

                {/* Dozens Row (1st 12, 2nd 12, 3rd 12) */}
                <div className="grid grid-cols-[54px_repeat(3,1fr)_48px] border-b border-white/60 text-center font-serif text-xs font-semibold text-white">
                  <div className="border-r border-white/60 bg-[#073017]" />
                  <button
                    onClick={() => addBet('dozen', '1st 12')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer relative"
                  >
                    1st 12
                    {getBetAmount('dozen', '1st 12') > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('dozen', '1st 12')}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => addBet('dozen', '2nd 12')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer relative"
                  >
                    2nd 12
                    {getBetAmount('dozen', '2nd 12') > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('dozen', '2nd 12')}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => addBet('dozen', '3rd 12')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer relative"
                  >
                    3rd 12
                    {getBetAmount('dozen', '3rd 12') > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('dozen', '3rd 12')}
                      </span>
                    )}
                  </button>
                  <div className="bg-[#073017]" />
                </div>

                {/* Outside Bets Row (1 to 18, EVEN, RED, BLACK, ODD, 19 to 36) */}
                <div className="grid grid-cols-[54px_repeat(6,1fr)_48px] text-center font-serif text-xs font-semibold text-white">
                  <div className="border-r border-white/60 bg-[#073017]" />

                  {/* 1 to 18 */}
                  <button
                    onClick={() => addBet('half', '1 to 18')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer"
                  >
                    1 to 18
                    {getBetAmount('half', '1 to 18') > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('half', '1 to 18')}
                      </span>
                    )}
                  </button>

                  {/* EVEN */}
                  <button
                    onClick={() => addBet('parity', 'even')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer"
                  >
                    EVEN
                    {getBetAmount('parity', 'even') > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('parity', 'even')}
                      </span>
                    )}
                  </button>

                  {/* RED DIAMOND */}
                  <button
                    onClick={() => addBet('color', 'red')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] flex items-center justify-center cursor-pointer"
                  >
                    <span className="w-5 h-3 bg-[#dc2626] border border-white rotate-45 transform" />
                    {getBetAmount('color', 'red') > 0 && (
                      <span className="ml-1.5 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('color', 'red')}
                      </span>
                    )}
                  </button>

                  {/* BLACK DIAMOND */}
                  <button
                    onClick={() => addBet('color', 'black')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] flex items-center justify-center cursor-pointer"
                  >
                    <span className="w-5 h-3 bg-[#0f172a] border border-white rotate-45 transform" />
                    {getBetAmount('color', 'black') > 0 && (
                      <span className="ml-1.5 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('color', 'black')}
                      </span>
                    )}
                  </button>

                  {/* ODD */}
                  <button
                    onClick={() => addBet('parity', 'odd')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer"
                  >
                    ODD
                    {getBetAmount('parity', 'odd') > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('parity', 'odd')}
                      </span>
                    )}
                  </button>

                  {/* 19 to 36 */}
                  <button
                    onClick={() => addBet('half', '19 to 36')}
                    disabled={spinning}
                    className="py-2 border-r border-white/60 hover:bg-[#0c4422] transition-colors cursor-pointer"
                  >
                    19 to 36
                    {getBetAmount('half', '19 to 36') > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-amber-400 text-black text-[8px] font-black">
                        {getBetAmount('half', '19 to 36')}
                      </span>
                    )}
                  </button>

                  <div className="bg-[#073017]" />
                </div>
              </div>
            </div>

            {/* 2. RACETRACK OVAL (HIPPODROME AS IN USER IMAGE) */}
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[540px] max-w-[620px] mx-auto p-3 rounded-full border-2 border-white/80 bg-[#072f17] shadow-xl relative select-none">
                {/* Center Calls: Tier | Voisins | Orphelins */}
                <div className="grid grid-cols-3 gap-2 px-8 py-1.5 mb-2 text-center text-xs font-serif font-bold text-white border-b border-white/40">
                  <button
                    onClick={() => addBet('racetrack', 'tier')}
                    disabled={spinning}
                    className="py-1 rounded-full border border-white/60 bg-[#0a3f20] hover:bg-[#0f542b] transition-all cursor-pointer"
                  >
                    Tier (12 núm)
                    {getBetAmount('racetrack', 'tier') > 0 && (
                      <span className="ml-1 px-1.5 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('racetrack', 'tier')}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => addBet('racetrack', 'voisins')}
                    disabled={spinning}
                    className="py-1 rounded-full border border-white/60 bg-[#0a3f20] hover:bg-[#0f542b] transition-all cursor-pointer"
                  >
                    Voisins (17 núm)
                    {getBetAmount('racetrack', 'voisins') > 0 && (
                      <span className="ml-1 px-1.5 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('racetrack', 'voisins')}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => addBet('racetrack', 'orphelins')}
                    disabled={spinning}
                    className="py-1 rounded-full border border-white/60 bg-[#0a3f20] hover:bg-[#0f542b] transition-all cursor-pointer"
                  >
                    Orphelins (8 núm)
                    {getBetAmount('racetrack', 'orphelins') > 0 && (
                      <span className="ml-1 px-1.5 rounded-full bg-amber-400 text-black text-[9px] font-black">
                        {getBetAmount('racetrack', 'orphelins')}
                      </span>
                    )}
                  </button>
                </div>

                {/* Racetrack number ring preview */}
                <div className="flex flex-wrap items-center justify-center gap-1 font-mono text-[10px] font-bold text-white">
                  {WHEEL_SEQUENCE.map((num) => {
                    const color = getNumberColor(num);
                    const betAmt = getBetAmount('number', num);
                    return (
                      <button
                        key={`race-${num}`}
                        onClick={() => addBet('number', num)}
                        disabled={spinning}
                        className={`w-5 h-6 rounded flex flex-col items-center justify-center border border-white/40 cursor-pointer transition-all hover:scale-110 ${
                          color === 'green'
                            ? 'bg-[#15803d]'
                            : color === 'red'
                            ? 'bg-[#dc2626]'
                            : 'bg-[#0f172a]'
                        }`}
                        title={`Apostar al número ${num}`}
                      >
                        <span>{num}</span>
                        {betAmt > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chips Selector & Spin Controls */}
        <div className="pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-4">
          {/* Chip Values */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-200 font-bold">Ficha:</span>
            <div className="flex flex-wrap gap-2">
              {[1, 5, 10, 25, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setSelectedChipValue(val)}
                  className={`w-9 h-9 rounded-full font-mono font-black text-xs border-2 shadow-lg transition-all cursor-pointer flex items-center justify-center ${
                    selectedChipValue === val
                      ? 'bg-amber-400 text-black border-white scale-110 ring-2 ring-amber-300'
                      : 'bg-[#0f2e1a] text-emerald-100 border-emerald-500 hover:border-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearBets}
              disabled={spinning || bets.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-[#0c2e17] hover:bg-[#124222] border border-emerald-600/60 text-emerald-200 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>

            <button
              onClick={handleSpin}
              disabled={spinning || bets.length === 0}
              className={`px-8 py-3 rounded-xl font-mono font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xl ${
                spinning || bets.length === 0
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black border border-white shadow-amber-950/80 hover:scale-105 active:scale-95'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Girando ruleta...' : `Girar (${totalBet} fichas)`}</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
