'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  User as UserIcon,
  LogOut,
  Cloud,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse border border-slate-700" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-medium transition-all shadow-sm shadow-emerald-950/50 cursor-pointer"
        >
          <Cloud className="w-3.5 h-3.5 animate-pulse" />
          <span>Iniciar Sesión</span>
        </button>

        <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const initial =
    user.displayName?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    'U';

  const name =
    user.displayName || user.email?.split('@')[0] || 'Gamer';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#141d2b] hover:bg-[#1a2638] border border-[#23354e] hover:border-emerald-500/40 text-xs text-white transition-all cursor-pointer"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={name}
            className="w-5 h-5 rounded-full object-cover border border-emerald-500/50"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-[10px]">
            {initial}
          </div>
        )}
        <span className="font-mono text-xs max-w-[100px] truncate text-slate-200">
          {name}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Cloud Sync Activo" />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#101724] border border-[#22334b] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs font-mono">
          <div className="px-3.5 py-2 border-b border-[#1c293c]">
            <p className="text-[11px] text-slate-400">Conectado como</p>
            <p className="font-bold text-white truncate">{name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              <Cloud className="w-3 h-3" />
              <span>Guardado en Nube Activo</span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/biblioteca"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-[#152030] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Mi Biblioteca</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-[#1c293c]">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
