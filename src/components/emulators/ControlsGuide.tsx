'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad, Keyboard, CheckCircle2 } from 'lucide-react';

export function ControlsGuide() {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadId, setGamepadId] = useState<string | null>(null);

  useEffect(() => {
    const handleConnected = (e: GamepadEvent) => {
      setGamepadConnected(true);
      setGamepadId(e.gamepad.id);
    };

    const handleDisconnected = () => {
      setGamepadConnected(false);
      setGamepadId(null);
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const pads = navigator.getGamepads();
      for (const pad of pads) {
        if (pad) {
          setGamepadConnected(true);
          setGamepadId(pad.id);
          break;
        }
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
    };
  }, []);

  const keys = [
    { action: 'Cruceta / Dirección', key: 'Flechas (↑ ↓ ← →)' },
    { action: 'Botón A', key: 'Z' },
    { action: 'Botón B', key: 'X' },
    { action: 'Gatillo L', key: 'Q' },
    { action: 'Gatillo R', key: 'E' },
    { action: 'Start', key: 'Enter' },
    { action: 'Select', key: 'V / Espacio' },
    { action: 'Menú / Ajustes', key: 'Icono Mando' },
    { action: 'Pantalla Completa', key: 'Alt + Enter' },
  ];

  return (
    <div className="bg-[#121822] border border-[#222d3d] rounded-lg p-5">
      {/* Header: Simply "Controles" as requested */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1d2737]">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <span>Controles</span>
        </div>

        {/* Gamepad Status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {gamepadConnected ? (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[180px]">Mando conectado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#64748b] bg-[#18212e] border border-[#263548] px-2 py-1 rounded">
              <Gamepad className="w-3.5 h-3.5" />
              <span>Mando USB / BT soportado</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of keys */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {keys.map((item) => (
          <div
            key={item.action}
            className="flex items-center justify-between bg-[#18212e]/70 border border-[#243345] px-3 py-2 rounded text-xs"
          >
            <span className="text-[#94a3b8] font-medium">{item.action}</span>
            <kbd className="font-mono bg-[#0b0f15] text-emerald-300 border border-emerald-900/50 px-1.5 py-0.5 rounded shadow-sm font-semibold">
              {item.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
