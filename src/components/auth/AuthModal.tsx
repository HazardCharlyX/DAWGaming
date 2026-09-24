'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  User,
  Lock,
  Cloud,
  AlertCircle,
  Loader2,
  CheckCircle2,
  UserCheck,
  Shield,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithUsername, error, clearError } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar con Escape y bloquear scroll del body
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username.trim() || !password.trim()) {
      setLocalError('Introduce tu nombre de usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      await signInWithUsername(username.trim(), password);
      onClose();
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md my-auto max-h-[92vh] flex flex-col bg-[#0d131d] border-2 border-[#1e2c3f] rounded-2xl shadow-2xl shadow-black/90 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hardware Header Bezel */}
        <div className="bg-[#121a26] px-5 py-3 border-b border-[#1b283a] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-mono font-bold text-xs tracking-wider text-slate-200 uppercase">
              DAWGAMING CLOUD AUTH
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded hidden sm:inline">
              FIREBASE SYNC
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1c293c] transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
          {/* Title */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-[#121c2a] border border-[#23344d] flex items-center justify-center mb-2 text-emerald-400 shadow-inner">
              <Cloud className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white font-mono uppercase">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Introduce tus datos para cargar y guardar tus partidas en la nube.
            </p>
          </div>

          {/* Notice: Para registrarte contacta con Carlos J Samper */}
          <div className="p-3 rounded-xl bg-[#090e15] border border-emerald-500/40 shadow-sm shadow-emerald-950/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-xs leading-snug">
              <span className="text-slate-400 font-mono text-[11px] block">¿No tienes cuenta?</span>
              <span className="text-emerald-300 font-semibold font-mono">
                Para registrarte contacta con <strong className="text-white underline decoration-emerald-400/50 underline-offset-2">Carlos J Samper</strong>
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/70 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Form: Usuario y Contraseña únicamente */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: carlos"
                  className="w-full pl-9 pr-3 py-2 bg-[#090d14] border border-[#202e43] rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#090d14] border border-[#202e43] rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Action Buttons: Cancelar & Entrar */}
            <div className="flex items-center gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#141d2a] hover:bg-[#1a2638] border border-[#23354b] text-slate-300 hover:text-white font-mono font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          {/* Security Footer */}
          <div className="pt-3 border-t border-[#1a2637] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Multi-dispositivo</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Base de Datos Firebase</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
