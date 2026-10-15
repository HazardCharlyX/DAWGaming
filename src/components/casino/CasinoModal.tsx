'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { CasinoRoulette } from './CasinoRoulette';
import { CasinoShop } from './CasinoShop';
import { subscribeToUserChips, INITIAL_CHIPS, getLocalChips } from '@/lib/casino';
import { X, Coins, Sparkles, RotateCcw, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'roulette' | 'shop';
}

export function CasinoModal({
  isOpen,
  onClose,
  defaultTab = 'roulette',
}: CasinoModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roulette' | 'shop'>(defaultTab);
  const [chips, setChips] = useState<number>(INITIAL_CHIPS);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Subscribe to live user chips from Firestore
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToUserChips(user, (updatedChips) => {
      setChips(updatedChips);
    });
    return () => unsub();
  }, [user, isOpen]);

  // Handle ESC and body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#080d15] border-2 border-[#1e2e42] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#1c293d] flex flex-wrap items-center justify-between gap-3 bg-[#0c121d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-950/60">
              🎰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Casino DAW Falomir
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
                  Verificado en Firestore
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Ruleta de 27 números • Cada jugador comienza con 20 fichas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time chips indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141d2c] border border-amber-500/40 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-300">
                {chips.toLocaleString()} fichas
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#192436] transition-colors cursor-pointer"
              title="Cerrar Casino"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1b2637] bg-[#090e17] px-5 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('roulette')}
            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'roulette'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mesa de Ruleta (27 Números)</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Tienda: Shinies & Respuesta (10.000 pts)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'roulette' ? (
            <CasinoRoulette
              user={user}
              chips={chips}
              onRequireAuth={() => setShowAuthModal(true)}
              onOpenShop={() => setActiveTab('shop')}
            />
          ) : (
            <CasinoShop
              user={user}
              chips={chips}
              onRequireAuth={() => setShowAuthModal(true)}
              onBackToRoulette={() => setActiveTab('roulette')}
            />
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>,
    document.body
  );
}
