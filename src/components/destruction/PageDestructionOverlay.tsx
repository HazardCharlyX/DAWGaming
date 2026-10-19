'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playHitSound, playFinalDestructionSound } from './soundEffects';
import { Skull, AlertTriangle, RotateCcw, Volume2, ShieldAlert, Zap, Flame } from 'lucide-react';

interface Hole {
  id: number;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  cracks: Array<{
    startX: number;
    startY: number;
    branches: Array<{ x: number; y: number }>;
  }>;
  rimColor: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  rotation: number;
  vRot: number;
  type: 'spark' | 'shard' | 'smoke';
}

export function PageDestructionOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [damage, setDamage] = useState<number>(0);
  const [clicksCount, setClicksCount] = useState<number>(0);
  const [isDestroyed, setIsDestroyed] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(true);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);

  // Screen shake trauma
  const traumaRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const damagedElementsRef = useRef<HTMLElement[]>([]);

  // Sound & destruction triggers
  const triggerHitSound = useCallback((dmg: number) => {
    try {
      playHitSound(dmg);
    } catch {
      // Audio fallback
    }
  }, []);

  // Generate realistic fracture crack lines radiating from click
  const generateCracks = (cx: number, cy: number, baseRadius: number) => {
    const crackCount = Math.floor(Math.random() * 4) + 5; // 5-8 major crack lines
    const crackLines = [];

    for (let i = 0; i < crackCount; i++) {
      const angle = (i * ((Math.PI * 2) / crackCount)) + (Math.random() * 0.5 - 0.25);
      const branches: Array<{ x: number; y: number }> = [];
      const totalSteps = Math.floor(Math.random() * 4) + 4;
      let currX = cx + Math.cos(angle) * (baseRadius * 0.7);
      let currY = cy + Math.sin(angle) * (baseRadius * 0.7);
      branches.push({ x: currX, y: currY });

      let currentAngle = angle;
      const reach = Math.random() * 120 + 70; // 70px to 190px long
      const stepDist = reach / totalSteps;

      for (let s = 0; s < totalSteps; s++) {
        currentAngle += (Math.random() * 0.7 - 0.35);
        currX += Math.cos(currentAngle) * stepDist;
        currY += Math.sin(currentAngle) * stepDist;
        branches.push({ x: currX, y: currY });
      }

      crackLines.push({
        startX: cx,
        startY: cy,
        branches,
      });
    }

    return crackLines;
  };

  // Add spark, shard & smoke particles
  const spawnParticles = (x: number, y: number, count: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#f59e0b', '#ef4444', '#fbbf24', '#ffffff', '#ffedd5', '#38bdf8'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      const isSpark = Math.random() > 0.4;
      const isSmoke = !isSpark && Math.random() > 0.6;

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isSpark ? 3 : 1),
        size: isSmoke ? Math.random() * 14 + 10 : isSpark ? Math.random() * 3 + 1.5 : Math.random() * 6 + 3,
        alpha: 1,
        decay: isSmoke ? Math.random() * 0.02 + 0.01 : Math.random() * 0.03 + 0.02,
        color: isSmoke ? 'rgba(30, 41, 59, ' : colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        type: isSmoke ? 'smoke' : isSpark ? 'spark' : 'shard',
      });
    }

    particlesRef.current.push(...newParticles);
  };

  // Damage or detach nearby DOM elements
  const damageTargetElement = (x: number, y: number, currentDamage: number) => {
    const hitElement = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!hitElement) return;

    // Don't damage our HUD
    if (hitElement.closest('[data-destruction-hud="true"]')) {
      return;
    }

    // Find best targetable card, button, text, container
    const target = (hitElement.closest('button, a, .game-card, h1, h2, h3, p, img, input, [data-interactive]') ||
      hitElement) as HTMLElement;

    if (!target || target === document.body || target === document.documentElement) return;

    damagedElementsRef.current.push(target);

    // If damage is high, the clicked element physically falls down and shatters
    const shouldDetach = currentDamage >= 65 || (currentDamage >= 40 && Math.random() > 0.5);

    if (shouldDetach && !target.classList.contains('element-falling')) {
      target.classList.add('element-falling');
    } else {
      // Displace, crack and tilt the element
      target.classList.add('element-damaged');
      const rotateDeg = (Math.random() - 0.5) * (currentDamage * 0.4);
      const transX = (Math.random() - 0.5) * (currentDamage * 0.3);
      const transY = Math.random() * (currentDamage * 0.35);
      target.style.transform = `rotate(${rotateDeg}deg) translate(${transX}px, ${transY}px)`;
      target.style.filter = `contrast(${1 + currentDamage / 100}) brightness(${1 - currentDamage / 300})`;
    }
  };

  // Global click handler
  useEffect(() => {
    if (!active || isDestroyed) return;

    const handlePointerDown = (e: MouseEvent) => {
      // Ignore clicks on HUD buttons
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-destruction-hud="true"]')) {
        return;
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      // Increase damage
      const damageIncrement = Math.floor(Math.random() * 4) + 4; // 4% to 7% per click
      const newClicks = clicksCount + 1;
      const newDamage = Math.min(100, damage + damageIncrement);

      setClicksCount(newClicks);
      setDamage(newDamage);

      // Trigger Trauma screen shake
      traumaRef.current = Math.min(1, traumaRef.current + 0.45);

      // Spawn Audio
      triggerHitSound(newDamage);

      // Create hole
      const baseRadius = Math.random() * 26 + 32; // 32px to 58px radius
      const newHole: Hole = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY,
        radius: baseRadius,
        rotation: Math.random() * Math.PI * 2,
        cracks: generateCracks(clientX, clientY, baseRadius),
        rimColor: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
      };

      setHoles((prev) => [...prev, newHole]);

      // Spawn visual debris particles
      spawnParticles(clientX, clientY, Math.floor(Math.random() * 20) + 35);

      // Physically damage target DOM element
      damageTargetElement(clientX, clientY, newDamage);

      // Check if 100% reached
      if (newDamage >= 100) {
        setIsDestroyed(true);
        try {
          playFinalDestructionSound();
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('click', handlePointerDown, { capture: true });
    return () => {
      window.removeEventListener('click', handlePointerDown, { capture: true });
    };
  }, [active, damage, clicksCount, isDestroyed, triggerHitSound]);

  // Canvas drawing & animation loop for holes, fractures, smoke & sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw all blast holes
      for (const hole of holes) {
        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.rotate(hole.rotation);

        // Glass crack fractures
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 4;

        for (const crack of hole.cracks) {
          ctx.beginPath();
          ctx.moveTo(crack.startX - hole.x, crack.startY - hole.y);
          for (const pt of crack.branches) {
            ctx.lineTo(pt.x - hole.x, pt.y - hole.y);
          }
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Outer scorched crater rim (gradient of charred fire / lava)
        const radGrad = ctx.createRadialGradient(0, 0, hole.radius * 0.3, 0, 0, hole.radius * 1.35);
        radGrad.addColorStop(0, '#020408'); // Pure obsidian abyss
        radGrad.addColorStop(0.65, '#0a0d13');
        radGrad.addColorStop(0.85, hole.rimColor);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        // Jagged polygon for organic blasted hole edge
        const segments = 12;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wobble = (Math.sin(theta * 5 + hole.id) * 0.25 + 0.95);
          const r = hole.radius * 1.25 * wobble;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner Pitch-Black Hole Void (looks like a hole punched right through the screen!)
        ctx.fillStyle = '#020306';
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wobble = (Math.cos(theta * 4 + hole.id) * 0.15 + 0.9);
          const r = hole.radius * 0.75 * wobble;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Glitch exposed circuitry / sparks in void center
        ctx.fillStyle = hole.rimColor;
        ctx.beginPath();
        ctx.arc((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 2. Animate and draw flying particles (debris, sparks, smoke)
      const survivingParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.type === 'spark' ? 0.22 : 0.15; // Gravity
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.type === 'smoke') {
            ctx.fillStyle = `${p.color}${p.alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'spark') {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Sharp debris shard
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.moveTo(-p.size, -p.size * 0.5);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(0, p.size * 0.8);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
          survivingParticles.push(p);
        }
      }
      particlesRef.current = survivingParticles;

      // 3. Screen shake calculation
      if (traumaRef.current > 0) {
        traumaRef.current = Math.max(0, traumaRef.current - 0.025);
        const shakePower = traumaRef.current * traumaRef.current;
        const maxOffset = 14;
        const maxAngle = 1.5;
        const offsetX = (Math.random() * 2 - 1) * maxOffset * shakePower;
        const offsetY = (Math.random() * 2 - 1) * maxOffset * shakePower;
        const offsetAngle = (Math.random() * 2 - 1) * maxAngle * shakePower;

        document.body.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${offsetAngle}deg)`;
      } else {
        document.body.style.transform = '';
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
      document.body.style.transform = '';
    };
  }, [holes]);

  // Reset / Genesis function (so the user can restore and test the destruction again)
  const resetDestruction = () => {
    setHoles([]);
    setDamage(0);
    setClicksCount(0);
    setIsDestroyed(false);
    particlesRef.current = [];
    traumaRef.current = 0;
    document.body.style.transform = '';

    // Restore fallen elements
    damagedElementsRef.current.forEach((el) => {
      el.classList.remove('element-falling', 'element-damaged');
      el.style.transform = '';
      el.style.filter = '';
    });
    damagedElementsRef.current = [];
  };

  // Severity color
  const getIntegrityColor = () => {
    const integrity = 100 - damage;
    if (integrity > 65) return 'from-emerald-500 to-green-600';
    if (integrity > 35) return 'from-amber-500 to-yellow-600';
    return 'from-red-600 to-rose-700 animate-pulse';
  };

  const getStatusText = () => {
    const integrity = 100 - damage;
    if (integrity >= 90) return 'Estructura estable. Cada click perfora la página.';
    if (integrity >= 60) return '⚠️ Daños por impacto: Componentes cediendo.';
    if (integrity >= 30) return '🚨 CRÍTICO: El DOM se está desprendiendo.';
    if (integrity > 0) return '🔥 FALLO TOTAL INMINENTE: Estructura colapsando.';
    return '💀 SISTEMA ANIQUILADO. FIN.';
  };

  return (
    <>
      {/* Visual Canvas for Holes & Flying Particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9990] w-full h-full"
      />

      {/* Screen Glitch & Chromatic Aberration Overlays when damaged */}
      {damage > 25 && (
        <div
          className="fixed inset-0 pointer-events-none z-[9980] opacity-40 mix-blend-color-dodge transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(239, 68, 68, ${damage / 350}) 90%)`,
          }}
        />
      )}

      {damage > 60 && (
        <div className="fixed inset-0 pointer-events-none z-[9985] apocalypse-glitch-layer opacity-25 mix-blend-difference bg-red-900/10" />
      )}

      {/* HUD: Destruction Monitor */}
      <div
        data-destruction-hud="true"
        className="fixed top-3 right-3 sm:right-6 z-[9999] select-none font-mono text-xs"
      >
        {hudCollapsed ? (
          <button
            onClick={() => setHudCollapsed(false)}
            className="flex items-center gap-2 bg-red-950/90 text-red-300 border border-red-500/50 px-3 py-1.5 rounded-md shadow-2xl backdrop-blur-md hover:bg-red-900 transition-colors"
          >
            <Skull className="w-4 h-4 text-red-400 animate-pulse" />
            <span>DESTRUCCIÓN: {damage}%</span>
          </button>
        ) : (
          <div className="bg-[#090d14]/95 border-2 border-red-500/60 rounded-xl p-3 sm:p-4 shadow-[0_0_35px_rgba(239,68,68,0.35)] backdrop-blur-xl w-[290px] sm:w-[330px] flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
              <div className="flex items-center gap-2 text-red-400 font-bold tracking-wider">
                <Skull className="w-4 h-4 animate-bounce text-red-500" />
                <span>MODO DESTRUCCIÓN</span>
              </div>
              <button
                onClick={() => setHudCollapsed(true)}
                className="text-gray-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Health / Integrity Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-300 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  INTEGRIDAD:
                </span>
                <span
                  className={`font-bold ${
                    100 - damage < 30 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {Math.max(0, 100 - damage)}%
                </span>
              </div>

              <div className="w-full bg-[#151c27] h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-150 ${getIntegrityColor()}`}
                  style={{ width: `${Math.max(0, 100 - damage)}%` }}
                />
              </div>
            </div>

            {/* Impact Count & Status */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-black/40 px-2.5 py-1.5 rounded border border-white/5">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Impactos: <strong className="text-white">{clicksCount}</strong>
              </span>
              <span className="text-slate-400">
                {damage >= 100 ? 'ANIQUILADO' : `${holes.length} brechas`}
              </span>
            </div>

            <p className="text-[10px] text-gray-300 italic leading-tight">
              {getStatusText()}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => setActive(!active)}
                className={`flex-1 py-1.5 px-2 rounded font-bold text-[11px] transition-colors border ${
                  active
                    ? 'bg-red-600/80 hover:bg-red-500 text-white border-red-400/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-600'
                }`}
              >
                {active ? '⚡ ACTIVO' : 'PAUSADO'}
              </button>

              <button
                onClick={resetDestruction}
                title="Reparar todo el daño"
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] font-semibold transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-emerald-400" />
                Restaurar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FINAL APOCALYPTIC GAME OVER SCREEN ("PUNTO Y FINAL") */}
      {isDestroyed && (
        <div
          data-destruction-hud="true"
          className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-500"
        >
          {/* Scorched Red Flare Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.25)_0%,_transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-6">
            <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-full shadow-[0_0_60px_rgba(239,68,68,0.8)] animate-pulse">
              <Skull className="w-16 h-16 sm:w-20 sm:h-20 text-red-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/90 border border-red-500/40 text-red-400 text-xs font-mono tracking-widest uppercase">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                COLAPSO TOTAL DEL SISTEMA
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-wider font-mono">
                PUNTO Y FINAL
              </h1>
              <p className="text-red-400/90 font-mono text-sm sm:text-base max-w-md mx-auto">
                La página ha sido completamente destruida. Las estructuras del DOM colapsaron y ya nada funciona.
              </p>
            </div>

            <div className="bg-[#0e1420] border border-red-500/30 rounded-xl p-4 w-full text-left font-mono text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>ESTADO DEL SERVICIO:</span>
                <span className="text-red-500 font-bold">OFFLINE / ANIQUILADO</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>IMPACTOS DIRECTOS:</span>
                <span className="text-amber-400 font-bold">{clicksCount} impactos</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>INTEGRIDAD ESTRUCTURAL:</span>
                <span className="text-red-500 font-bold">0% (FATAL)</span>
              </div>
              <div className="flex justify-between">
                <span>RESPUESTA DE USUARIO:</span>
                <span className="text-slate-500">SE ACABÓ EL JUEGO</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={resetDestruction}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-mono font-bold rounded-lg shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                PROTOCOLO GÉNESIS (RESTAURAR WEB)
              </button>

              <button
                onClick={() => {
                  alert('Has decidido dejar la página en sus cenizas. Descansa en paz, WebGaming.');
                }}
                className="w-full sm:w-auto px-5 py-3.5 bg-transparent hover:bg-red-950/40 text-red-400/80 hover:text-red-300 font-mono text-xs rounded-lg border border-red-500/30 transition-colors"
              >
                DEJARLA EN RUINAS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
