'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllGames } from '@/lib/games';
import { getFavorites, getRecentGames, UserLibraryItem } from '@/lib/storage';
import { Game } from '@/lib/types';
import { GameGrid } from '@/components/games/GameGrid';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { getUserCloudSaves, CloudSaveMetadata, deleteCloudSave } from '@/lib/cloud-saves';
import {
  Heart,
  History,
  Cloud,
  Trash2,
  Gamepad2,
  Download,
  Play,
  Calendar,
  HardDrive,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function UserLibraryPage() {
  const allGames = useMemo(() => getAllGames(), []);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'cloud'>('favorites');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<UserLibraryItem[]>([]);
  const [cloudSaves, setCloudSaves] = useState<CloudSaveMetadata[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadData = () => {
    setFavoriteIds(getFavorites());
    setRecentItems(getRecentGames());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('webgaming-storage-changed', loadData);
    return () => window.removeEventListener('webgaming-storage-changed', loadData);
  }, []);

  // Fetch Cloud Saves when switching to cloud tab or user changes
  useEffect(() => {
    if (activeTab === 'cloud' && user) {
      setLoadingCloud(true);
      getUserCloudSaves(user.uid)
        .then((saves) => setCloudSaves(saves))
        .finally(() => setLoadingCloud(false));
    }
  }, [activeTab, user]);

  const favoriteGames: Game[] = useMemo(() => {
    return allGames.filter((g) => favoriteIds.includes(g.id));
  }, [allGames, favoriteIds]);

  const recentGames: Game[] = useMemo(() => {
    const ids = recentItems.map((r) => r.gameId);
    return ids
      .map((id) => allGames.find((g) => g.id === id))
      .filter((g): g is Game => Boolean(g));
  }, [allGames, recentItems]);

  const clearRecents = () => {
    if (confirm('¿Estás seguro de que deseas vaciar tu historial de partidas recientes?')) {
      localStorage.removeItem('webgaming_recent_v1');
      window.dispatchEvent(new Event('webgaming-storage-changed'));
    }
  };

  const handleDeleteCloudSave = async (save: CloudSaveMetadata) => {
    if (!user) return;
    if (confirm(`¿Eliminar la partida en la nube de ${save.gameTitle}?`)) {
      await deleteCloudSave(user.uid, save.gameId, save.fileName);
      setCloudSaves((prev) => prev.filter((s) => s.gameId !== save.gameId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2635]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Centro de Partidas y Almacenamiento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mi Biblioteca
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Gestiona tus juegos favoritos y tus partidas sincronizadas en la nube de Firebase.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#121822] border border-[#222e40] rounded-lg p-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favoritos ({favoriteGames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Recientes ({recentGames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Partidas en Nube ({cloudSaves.length})</span>
          </button>
        </div>
      </div>

      {/* Content for Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <GameGrid
            games={favoriteGames}
            emptyTitle="Aún no tienes juegos favoritos"
            emptyDescription="Explora el catálogo y pulsa el icono de corazón en cualquier tarjeta para guardarlo aquí."
          />
        </div>
      )}

      {/* Content for Recent Games */}
      {activeTab === 'recent' && (
        <div className="space-y-6">
          {recentGames.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearRecents}
                className="text-xs font-mono text-[#64748b] hover:text-rose-400 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar historial</span>
              </button>
            </div>
          )}

          <GameGrid
            games={recentGames}
            emptyTitle="Aún no has iniciado ninguna partida"
            emptyDescription="Lanza cualquier juego desde el catálogo o los emuladores para registrarlo en tu historial."
          />
        </div>
      )}

      {/* Content for Cloud Saves */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          {!user ? (
            <div className="p-8 rounded-2xl bg-[#0f1724] border border-[#203147] text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Cloud className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">
                Sincronización en la Nube Desconectada
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Inicia sesión con tu cuenta para acceder a tus partidas guardadas desde cualquier ordenador o teléfono móvil.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Cloud className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          ) : loadingCloud ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Consultando tus partidas en Firebase...</span>
            </div>
          ) : cloudSaves.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0f1724] border border-[#203147] text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#141f2d] flex items-center justify-center mx-auto text-slate-400">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">
                No tienes partidas en la nube todavía
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Entra a cualquier juego de Nintendo DS o Game Boy Advance y pulsa el botón{' '}
                <strong className="text-emerald-400">"Guardar en Nube"</strong> en la barra de herramientas del emulador.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cloudSaves.map((save) => {
                const targetGame = allGames.find((g) => g.id === save.gameId);
                const playUrl =
                  save.platform === 'nds'
                    ? `/emuladores/nds/${targetGame?.slug || save.gameId}`
                    : `/emuladores/gba/${targetGame?.slug || save.gameId}`;

                return (
                  <div
                    key={save.gameId}
                    className="p-4 rounded-xl bg-[#101724] border border-[#22334b] flex flex-col justify-between gap-4 hover:border-emerald-500/50 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={save.platform === 'nds' ? 'nds' : 'gba'}>
                          {save.platform.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {(save.fileSizeBytes / 1024).toFixed(0)} KB
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-mono truncate">
                        {save.gameTitle}
                      </h4>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-2">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span>
                          {new Date(save.lastSavedAt).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1a2738] flex items-center justify-between gap-2">
                      <Link
                        href={playUrl}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Continuar</span>
                      </Link>

                      {save.downloadUrl && (
                        <a
                          href={save.downloadUrl}
                          download={save.fileName}
                          title="Descargar archivo .sav a tu equipo"
                          className="p-1.5 rounded-lg bg-[#152030] hover:bg-[#1a293e] border border-[#22354c] text-slate-300 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteCloudSave(save)}
                        title="Eliminar partida de la nube"
                        className="p-1.5 rounded-lg bg-[#152030] hover:bg-red-950/40 border border-[#22354c] hover:border-red-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Auth Modal for Login */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
