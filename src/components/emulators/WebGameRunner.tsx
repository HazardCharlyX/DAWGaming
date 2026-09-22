'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Game } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { recordGamePlayed } from '@/lib/storage';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Trophy,
  Heart,
  Gamepad2,
} from 'lucide-react';

interface WebGameRunnerProps {
  game: Game;
}

export function WebGameRunner({ game }: WebGameRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context synthesizer for 8-bit chiptune sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = (freq: number, type: OscillatorType = 'square', duration = 0.1) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = 640);
    const height = (canvas.height = 480);

    // ==========================================
    // GAME 1: SPACE DEFENDER 1984
    // ==========================================
    if (game.slug === 'space-defender-1984') {
      let playerX = width / 2;
      const playerY = height - 50;
      const playerSpeed = 6;
      let leftPressed = false;
      let rightPressed = false;
      let shootPressed = false;
      let lastShot = 0;

      let bullets: { x: number; y: number; vy: number }[] = [];
      let enemies: { x: number; y: number; vx: number; alive: boolean; row: number }[] = [];
      let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

      // Spawn enemy grid
      const initEnemies = () => {
        enemies = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 8; c++) {
            enemies.push({
              x: 80 + c * 60,
              y: 60 + r * 40,
              vx: 1.5,
              alive: true,
              row: r,
            });
          }
        }
      };
      initEnemies();

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = true;
        if (e.code === 'Space') {
          e.preventDefault();
          shootPressed = true;
        }
      };

      const onKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = false;
        if (e.code === 'Space') shootPressed = false;
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      // Starfield background
      const stars = Array.from({ length: 50 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.5,
      }));

      const loop = (timestamp: number) => {
        // Clear
        ctx.fillStyle = '#070a0f';
        ctx.fillRect(0, 0, width, height);

        // Render stars
        ctx.fillStyle = '#384b66';
        stars.forEach((s) => {
          s.y = (s.y + s.speed) % height;
          ctx.fillRect(s.x, s.y, 1.5, 1.5);
        });

        // Update player
        if (leftPressed && playerX > 25) playerX -= playerSpeed;
        if (rightPressed && playerX < width - 25) playerX += playerSpeed;

        // Shoot bullet
        if (shootPressed && timestamp - lastShot > 250) {
          bullets.push({ x: playerX, y: playerY - 10, vy: -8 });
          lastShot = timestamp;
          playTone(880, 'square', 0.08);
        }

        // Draw Player Ship (Vector style)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(playerX, playerY - 16);
        ctx.lineTo(playerX - 16, playerY + 12);
        ctx.lineTo(playerX, playerY + 4);
        ctx.lineTo(playerX + 16, playerY + 12);
        ctx.closePath();
        ctx.stroke();

        // Update & Draw Bullets
        ctx.fillStyle = '#34d399';
        bullets = bullets.filter((b) => b.y > 0);
        bullets.forEach((b) => {
          b.y += b.vy;
          ctx.fillRect(b.x - 1.5, b.y - 4, 3, 8);
        });

        // Update & Draw Enemies
        let shiftDown = false;
        const aliveEnemies = enemies.filter((e) => e.alive);

        if (aliveEnemies.length === 0) {
          // New Wave
          setScore((s) => s + 500);
          playTone(523, 'triangle', 0.2);
          initEnemies();
        }

        for (const e of aliveEnemies) {
          e.x += e.vx;
          if (e.x > width - 40 || e.x < 40) {
            shiftDown = true;
          }
        }

        if (shiftDown) {
          enemies.forEach((e) => {
            e.vx = -e.vx * 1.05;
            e.y += 12;
            if (e.alive && e.y >= playerY - 20) {
              setGameOver(true);
              playTone(150, 'sawtooth', 0.4);
            }
          });
        }

        enemies.forEach((e) => {
          if (!e.alive) return;
          // Colors based on row
          ctx.strokeStyle = e.row === 0 ? '#e63946' : e.row === 1 ? '#f59e0b' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(e.x - 12, e.y - 10, 24, 20);
          ctx.stroke();
          // Inner invaders eyes
          ctx.fillStyle = '#fff';
          ctx.fillRect(e.x - 6, e.y - 3, 3, 3);
          ctx.fillRect(e.x + 3, e.y - 3, 3, 3);

          // Collision with bullets
          bullets.forEach((b) => {
            if (b.x > e.x - 14 && b.x < e.x + 14 && b.y > e.y - 12 && b.y < e.y + 12) {
              e.alive = false;
              b.y = -999;
              setScore((s) => s + (4 - e.row) * 20);
              playTone(220 + (4 - e.row) * 60, 'sawtooth', 0.12);

              // Spawn particles
              for (let i = 0; i < 8; i++) {
                particles.push({
                  x: e.x,
                  y: e.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 1,
                  color: ctx.strokeStyle as string,
                });
              }
            }
          });
        });

        // Update & Draw Particles
        particles = particles.filter((p) => p.life > 0);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillRect(p.x, p.y, 2, 2);
          ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }

    // ==========================================
    // GAME 2: CYBER BREAKER DX
    // ==========================================
    if (game.slug === 'cyber-breaker-dx') {
      let paddleX = width / 2 - 45;
      const paddleWidth = 90;
      const paddleHeight = 12;
      const paddleY = height - 40;

      let ballX = width / 2;
      let ballY = paddleY - 15;
      let ballVx = 3.5;
      let ballVy = -3.5;
      const ballRadius = 5;

      let leftPressed = false;
      let rightPressed = false;

      // Bricks setup
      const brickRows = 5;
      const brickCols = 8;
      const brickWidth = 65;
      const brickHeight = 16;
      const brickPadding = 8;
      const brickOffsetTop = 60;
      const brickOffsetLeft = (width - (brickCols * (brickWidth + brickPadding) - brickPadding)) / 2;

      let bricks: { x: number; y: number; status: number; color: string }[] = [];
      const colors = ['#e63946', '#f59e0b', '#10b981', '#0284c7', '#818cf8'];

      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          bricks.push({
            x: brickOffsetLeft + c * (brickWidth + brickPadding),
            y: brickOffsetTop + r * (brickHeight + brickPadding),
            status: 1,
            color: colors[r % colors.length],
          });
        }
      }

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = true;
      };
      const onKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = false;
      };
      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const rootX = e.clientX - rect.left;
        paddleX = Math.max(0, Math.min(width - paddleWidth, (rootX / rect.width) * width - paddleWidth / 2));
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      canvas.addEventListener('mousemove', onMouseMove);

      const loop = () => {
        ctx.fillStyle = '#070a0f';
        ctx.fillRect(0, 0, width, height);

        // Paddle controls
        if (leftPressed && paddleX > 0) paddleX -= 7;
        if (rightPressed && paddleX < width - paddleWidth) paddleX += 7;

        // Draw Paddle
        ctx.fillStyle = '#5c67f2';
        ctx.beginPath();
        ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, 4);
        ctx.fill();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Move Ball
        ballX += ballVx;
        ballY += ballVy;

        // Wall collisions
        if (ballX + ballRadius > width || ballX - ballRadius < 0) {
          ballVx = -ballVx;
          playTone(400, 'square', 0.05);
        }
        if (ballY - ballRadius < 0) {
          ballVy = -ballVy;
          playTone(400, 'square', 0.05);
        } else if (ballY + ballRadius > height) {
          // Ball lost
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameOver(true);
              playTone(150, 'sawtooth', 0.4);
            } else {
              ballX = width / 2;
              ballY = paddleY - 15;
              ballVx = 3.5;
              ballVy = -3.5;
            }
            return nextL;
          });
          playTone(200, 'sawtooth', 0.2);
        }

        // Paddle collision
        if (
          ballY + ballRadius >= paddleY &&
          ballY - ballRadius <= paddleY + paddleHeight &&
          ballX >= paddleX &&
          ballX <= paddleX + paddleWidth
        ) {
          ballVy = -Math.abs(ballVy);
          // Angle modifier
          const hitPoint = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
          ballVx = hitPoint * 5;
          playTone(600, 'square', 0.06);
        }

        // Brick collisions
        bricks.forEach((b) => {
          if (b.status === 1) {
            if (
              ballX > b.x &&
              ballX < b.x + brickWidth &&
              ballY > b.y &&
              ballY < b.y + brickHeight
            ) {
              ballVy = -ballVy;
              b.status = 0;
              setScore((s) => s + 50);
              playTone(750, 'sine', 0.08);
            }

            // Draw brick
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y, brickWidth, brickHeight, 2);
            ctx.fill();
          }
        });

        // Draw Ball
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('mousemove', onMouseMove);
      };
    }
  }, [isPlaying, isPaused, gameOver, game.slug, soundEnabled]);

  const handleStart = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);

    recordGamePlayed({
      gameId: game.id,
      platform: game.platform,
      title: game.title,
    });
  };

  const handleRestart = () => {
    handleStart();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      {/* Top HUD: Score & Lives */}
      <div className="w-full max-w-3xl bg-[#121822] border-t border-x border-[#232f3f] rounded-t-lg px-4 py-2.5 flex items-center justify-between font-mono text-xs text-[#94a3b8]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-white font-bold text-sm">{score.toString().padStart(6, '0')}</span>
        </div>

        <div className="flex items-center gap-1.5 text-rose-400">
          {Array.from({ length: lives }).map((_, i) => (
            <Heart key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
      </div>

      {/* Screen Viewport */}
      <div className="relative w-full max-w-3xl aspect-[4/3] bg-[#070a0f] border border-[#232f3f] overflow-hidden flex items-center justify-center shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* Start Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#0b0f15]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-[#18212e] border border-[#2d3b4e] flex items-center justify-center text-[#10b981] mb-4 shadow-xl">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{game.title}</h2>
            <p className="text-xs text-[#94a3b8] mb-6 max-w-md leading-relaxed">
              {game.description}
            </p>
            <Button
              size="lg"
              variant="primary"
              onClick={handleStart}
              icon={<Play className="w-5 h-5 fill-current" />}
            >
              Jugar Ahora
            </Button>
          </div>
        )}

        {/* Paused Overlay */}
        {isPlaying && isPaused && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <h3 className="text-xl font-bold font-mono tracking-widest text-white uppercase mb-4">
              Juego en Pausa
            </h3>
            <Button variant="primary" onClick={() => setIsPaused(false)}>
              Continuar
            </Button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black font-mono tracking-widest text-white uppercase mb-2">
              Game Over
            </h3>
            <p className="text-sm font-mono text-rose-200 mb-6">
              Puntuación Final: {score}
            </p>
            <Button variant="primary" onClick={handleRestart} icon={<RotateCcw className="w-4 h-4" />}>
              Jugar de Nuevo
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full max-w-3xl bg-[#121822] border-b border-x border-[#232f3f] rounded-b-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isPlaying && !gameOver && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn-hardware px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Reanudar' : 'Pausa'}</span>
            </button>
          )}

          <button
            onClick={handleRestart}
            title="Reiniciar Partida"
            className="btn-hardware px-2.5 py-1.5 text-xs text-[#94a3b8] hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
            className="btn-hardware px-2.5 py-1.5 text-xs text-[#94a3b8] hover:text-white cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          <button
            onClick={handleFullscreen}
            title="Pantalla Completa"
            className="btn-hardware px-3 py-1.5 text-xs text-[#f1f5f9] flex items-center gap-1.5 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pantalla Completa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
