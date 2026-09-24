'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Mail,
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
  const { signInWithGoogle, signInWithEmail, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      onClose();
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0d131d] border-2 border-[#1e2c3f] rounded-2xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/50 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182333] transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hardware Header Bezel */}
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1b283a]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="font-mono font-bold text-xs tracking-wider text-slate-200 uppercase">
            DAWGAMING CLOUD AUTH
          </span>
          <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
            FIREBASE SYNC
          </span>
        </div>

        {/* Modal Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#121c2a] border border-[#23344d] flex items-center justify-center mb-2.5 text-emerald-400 shadow-inner">
            <Cloud className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white font-mono uppercase">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Accede a tu cuenta para sincronizar tus partidas en la nube entre tu PC, móvil y cualquier navegador.
          </p>
        </div>

        {/* Notice: Para registrarte contacta con Carlos J Samper */}
        <div className="mb-5 p-3 rounded-xl bg-[#090e15] border border-emerald-500/40 shadow-sm shadow-emerald-950/40 flex items-center gap-3">
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
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/70 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#131c29] hover:bg-[#1a2638] border border-[#23354b] text-xs font-mono font-medium text-white transition-all cursor-pointer hover:border-emerald-500/50 mb-4 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Acceder con Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#1d2b3e]" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">o con tus credenciales</span>
          <div className="flex-1 h-px bg-[#1d2b3e]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Entrar y Conectar Nube'
            )}
          </button>
        </form>

        {/* Hardware Status Footer */}
        <div className="mt-5 pt-3.5 border-t border-[#1a2637] flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Multi-dispositivo</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Encriptación Firebase</span>
          </span>
        </div>
      </div>
    </div>
  );
}
