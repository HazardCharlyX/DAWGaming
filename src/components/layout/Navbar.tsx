'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFavorites } from '@/lib/storage';
import { Menu, X, Heart } from 'lucide-react';

import { UserMenu } from '@/components/auth/UserMenu';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    setFavoriteCount(getFavorites().length);
    const updateFavs = () => setFavoriteCount(getFavorites().length);
    window.addEventListener('webgaming-storage-changed', updateFavs);
    return () => window.removeEventListener('webgaming-storage-changed', updateFavs);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0f15]/95 backdrop-blur-md border-b border-[#1c2635]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo: Pure text DAWGAMING without icon and without subtitle */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-wider font-mono text-white hover:text-emerald-400 transition-colors"
        >
          DAW<span className="text-emerald-400">GAMING</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive('/')
                ? 'bg-[#18212e] text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121822]'
            }`}
          >
            Inicio
          </Link>

          <Link
            href="/juegos"
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive('/juegos')
                ? 'bg-[#18212e] text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121822]'
            }`}
          >
            Juegos Web
          </Link>

          <Link
            href="/emuladores"
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive('/emuladores')
                ? 'bg-[#18212e] text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121822]'
            }`}
          >
            Emuladores
          </Link>

          <Link
            href="/biblioteca"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors ${
              isActive('/biblioteca')
                ? 'bg-[#18212e] text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121822]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biblioteca</span>
            {favoriteCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono bg-emerald-600 text-white rounded-full">
                {favoriteCount}
              </span>
            )}
          </Link>

          <div className="h-4 w-px bg-[#223348] mx-1" />

          {/* User & Cloud Save Profile Menu */}
          <UserMenu />
        </nav>

        {/* Mobile menu and User actions */}
        <div className="flex md:hidden items-center gap-2">
          <UserMenu />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-[#94a3b8] hover:text-white hover:bg-[#18212e] border border-[#253244]"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e141d] border-b border-[#1c2635] px-4 py-4 space-y-2 font-mono text-sm">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md ${
              isActive('/') ? 'bg-[#18212e] text-emerald-400 font-bold' : 'text-[#94a3b8]'
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/juegos"
            className={`block px-3 py-2 rounded-md ${
              isActive('/juegos') ? 'bg-[#18212e] text-emerald-400 font-bold' : 'text-[#94a3b8]'
            }`}
          >
            Juegos Web
          </Link>
          <Link
            href="/emuladores"
            className={`block px-3 py-2 rounded-md ${
              isActive('/emuladores') ? 'bg-[#18212e] text-emerald-400 font-bold' : 'text-[#94a3b8]'
            }`}
          >
            Emuladores (GBA & NDS)
          </Link>
          <Link
            href="/biblioteca"
            className={`flex items-center justify-between px-3 py-2 rounded-md ${
              isActive('/biblioteca') ? 'bg-[#18212e] text-emerald-400 font-bold' : 'text-[#94a3b8]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Mi Biblioteca</span>
            </div>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
                {favoriteCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
