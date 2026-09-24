'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Game } from '@/lib/types';
import { recordGamePlayed } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  uploadCloudSave,
  downloadCloudSave,
  getCloudSaveMetadata,
  CloudSaveMetadata,
} from '@/lib/cloud-saves';
import {
  RotateCcw,
  Maximize2,
  Tv,
  Layout,
  Check,
  Cloud,
  CloudUpload,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export type NdsScreenLayout =
  | 'hybrid/top'
  | 'top/bottom'
  | 'left/right'
  | 'hybrid/bottom'
  | 'top only'
  | 'bottom only';

interface NdsPlayerProps {
  game?: Partial<Game>;
  romUrl?: string;
  title?: string;
}

interface LayoutOption {
  id: NdsScreenLayout;
  label: string;
  shortLabel: string;
  description: string;
  aspectClass: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'hybrid/top',
    label: 'Híbrido 3:1 (Principal Grande Izq. + Táctil Der.)',
    shortLabel: '3/4 Híbrido',
    description: 'Pantalla superior grande 3/4 a la izquierda y pantalla táctil 1/4 a la derecha',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'top/bottom',
    label: 'Vertical Clásica (Estilo Nintendo DS real)',
    shortLabel: 'Vertical',
    description: 'Pantalla superior e inferior apiladas verticalmente',
    aspectClass: 'aspect-[3/4] sm:aspect-[4/5] max-w-xl mx-auto',
  },
  {
    id: 'left/right',
    label: 'Horizontal (Lado a lado 1:1)',
    shortLabel: 'Horizontal',
    description: 'Ambas pantallas de igual tamaño en paralelo',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'hybrid/bottom',
    label: 'Híbrido Táctil (Táctil Grande Izq. + Superior Der.)',
    shortLabel: 'Táctil Grande',
    description: 'Pantalla táctil grande 3/4 para control cómodo y pantalla superior 1/4 a la derecha',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'top only',
    label: 'Solo Pantalla Superior',
    shortLabel: 'Solo Superior',
    description: 'Muestra únicamente la pantalla superior a tamaño completo',
    aspectClass: 'aspect-[4/3] max-w-2xl mx-auto',
  },
];

export function NdsPlayer({ game, romUrl, title }: NdsPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [crtFilter, setCrtFilter] = useState(false);
  const [layout, setLayout] = useState<NdsScreenLayout>('hybrid/top');
  const [isClient, setIsClient] = useState(false);

  // Cloud Save States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudMetadata, setCloudMetadata] = useState<CloudSaveMetadata | null>(null);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);
  const cloudSaveBytesRef = useRef<Uint8Array | null>(null);
  const lastAutoSyncTime = useRef<number>(0);

  const activeTitle = title || game?.title || 'Nintendo DS Web Player';
  const activeRomUrl = romUrl || game?.romUrl || '';
  const gameId = game?.id || 'nds-game';

  // Load saved preference from localStorage
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dawgaming_nds_layout') as NdsScreenLayout;
      if (saved && LAYOUT_OPTIONS.some((opt) => opt.id === saved)) {
        setLayout(saved);
      }
    }
  }, []);

  // Inyectar partida en la nube en el iframe
  const injectCloudSaveIntoIframe = (bytes: Uint8Array, fileName?: string) => {
    if (iframeRef.current?.contentWindow) {
      console.log('[DAWGAMING] Enviando partida de la nube al emulador...');
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'DAWGAMING_INJECT_CLOUD_SAVE',
          saveData: bytes,
          fileName: fileName || `${gameId}.srm`,
        },
        '*'
      );
    }
  };

  // Buscar partida en la nube al cargar el juego si el usuario está conectado
  useEffect(() => {
    if (!user || !gameId) {
      setCloudMetadata(null);
      cloudSaveBytesRef.current = null;
      return;
    }

    let isMounted = true;
    getCloudSaveMetadata(user.uid, gameId).then(async (meta) => {
      if (!isMounted) return;
      if (meta) {
        setCloudMetadata(meta);
        const bytes = await downloadCloudSave(user.uid, gameId, meta.fileName);
        if (bytes && isMounted) {
          cloudSaveBytesRef.current = bytes;
          injectCloudSaveIntoIframe(bytes, meta.fileName);
          // Reintento de respaldo por si el núcleo tardó en montar el FS
          setTimeout(() => {
            if (isMounted) injectCloudSaveIntoIframe(bytes, meta.fileName);
          }, 2500);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user, gameId]);

  // Forzar guardado y subida a la base de datos Firestore
  const forceSaveAndUploadToCloud = async (customMessage?: string) => {
    if (!user || !gameId) return null;

    try {
      setCloudSyncing(true);
      if (customMessage) setCloudMessage(customMessage);

      // 1. Acceso directo por mismo origen para salvar al instante sin retardos
      const win = iframeRef.current?.contentWindow as any;
      const emu = win?.EJS_emulator;
      const gm = emu?.gameManager;

      if (gm && typeof gm.saveSaveFiles === 'function') {
        gm.saveSaveFiles();
        if (gm.FS && typeof gm.FS.syncfs === 'function') {
          gm.FS.syncfs(false, () => {});
        }
        const saveBytes = gm.getSaveFile(!1);
        if (saveBytes && saveBytes.length > 0) {
          const savePath = gm.getSaveFilePath() || '';
          const fileName = savePath.split('/').pop() || `${gameId}.srm`;
          const meta = await uploadCloudSave(
            user.uid,
            gameId,
            'nds',
            activeTitle,
            fileName,
            new Uint8Array(saveBytes)
          );
          setCloudMetadata(meta);
          setCloudMessage('¡Partida guardada en tu cuenta de Firebase!');
          setTimeout(() => setCloudMessage(null), 4000);
          return meta;
        }
      }

      // 2. Si el acceso directo no devolvió datos, solicitar vía postMessage
      iframeRef.current?.contentWindow?.postMessage({ type: 'DAWGAMING_GET_SAVE' }, '*');
    } catch (e) {
      console.warn('[DAWGAMING Cloud] Extracción directa falló, solicitando vía mensaje:', e);
      iframeRef.current?.contentWindow?.postMessage({ type: 'DAWGAMING_GET_SAVE' }, '*');
    } finally {
      setTimeout(() => setCloudSyncing(false), 600);
    }
    return null;
  };

  useEffect(() => {
    if (game?.id && game?.title) {
      recordGamePlayed({
        gameId: game.id,
        platform: 'nds',
        title: game.title,
      });
    }

    return () => {
      // Al salir de la página: Forzar guardado en IndexedDB y subida a Firebase
      try {
        const win = iframeRef.current?.contentWindow as any;
        const gm = win?.EJS_emulator?.gameManager;
        if (gm && typeof gm.saveSaveFiles === 'function') {
          gm.saveSaveFiles();
          if (gm.FS) gm.FS.syncfs(false, () => {});
          const saveBytes = gm.getSaveFile(!1);
          if (saveBytes && user && gameId) {
            const fileName = (gm.getSaveFilePath() || '').split('/').pop() || `${gameId}.srm`;
            uploadCloudSave(
              user.uid,
              gameId,
              'nds',
              activeTitle,
              fileName,
              new Uint8Array(saveBytes)
            ).catch(() => {});
          }
        } else if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'DAWGAMING_SAVE_NOW' }, '*');
        }
      } catch {}
    };
  }, [game, user, gameId, activeTitle]);

  // Listener para mensajes del emulador
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data) return;

      // 1. El emulador arrancó y está listo: si tenemos partida de la nube descargada, inyectar
      if (event.data.type === 'DAWGAMING_EMULATOR_READY') {
        if (cloudSaveBytesRef.current) {
          injectCloudSaveIntoIframe(cloudSaveBytesRef.current, cloudMetadata?.fileName);
        }
      }

      // 2. Respuesta a petición explícita de guardado
      if (event.data.type === 'DAWGAMING_SAVE_DATA') {
        const { saveData, fileName } = event.data;
        if (saveData && user) {
          try {
            setCloudSyncing(true);
            const meta = await uploadCloudSave(
              user.uid,
              gameId,
              'nds',
              activeTitle,
              fileName || `${gameId}.srm`,
              new Uint8Array(saveData)
            );
            setCloudMetadata(meta);
            setCloudMessage('¡Partida guardada en tu cuenta de Firebase!');
            setTimeout(() => setCloudMessage(null), 4000);
          } catch (err) {
            console.error('Error subiendo partida a Firebase:', err);
            setCloudMessage('Error al sincronizar en la nube');
            setTimeout(() => setCloudMessage(null), 4000);
          } finally {
            setCloudSyncing(false);
          }
        }
      }

      // 3. Auto-guardado periódico o por visibilidad (segundo plano/móvil)
      if (event.data.type === 'DAWGAMING_SAVE_UPDATED' && user && event.data.saveData) {
        const source = event.data.source;
        const now = Date.now();
        const isUrgent =
          source === 'visibilitychange_hidden' ||
          source === 'pagehide' ||
          source === 'beforeunload' ||
          source === 'parent_message';

        // Guardar de inmediato si es un evento de salida o cada 15 segundos en juego continuo
        if (isUrgent || now - lastAutoSyncTime.current > 15000) {
          lastAutoSyncTime.current = now;
          uploadCloudSave(
            user.uid,
            gameId,
            'nds',
            activeTitle,
            event.data.fileName || `${gameId}.srm`,
            new Uint8Array(event.data.saveData)
          )
            .then((meta) => setCloudMetadata(meta))
            .catch((err) => console.warn('[CloudSync Auto] Error:', err));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, gameId, activeTitle, cloudMetadata?.fileName]);

  const handleSelectLayout = async (newLayout: NdsScreenLayout) => {
    if (newLayout === layout) return;
    if (user) {
      await forceSaveAndUploadToCloud('Guardando progreso antes de cambiar pantalla...');
    } else if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: 'DAWGAMING_SAVE_NOW' }, '*');
      } catch {}
    }
    setLayout(newLayout);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dawgaming_nds_layout', newLayout);
    }
  };

  const handleRestart = async () => {
    if (user) {
      await forceSaveAndUploadToCloud('Guardando en la nube antes de reiniciar...');
    } else if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: 'DAWGAMING_SAVE_NOW' }, '*');
      } catch {}
    }
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    }, 150);
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => {
        console.warn('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error exiting fullscreen:', err);
      });
    }
  };

  // Botón manual "Guardar en Nube"
  const handleCloudSaveClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    forceSaveAndUploadToCloud('Guardando en Firebase...');
  };

  // Descargar partida local (.sav)
  const handleDownloadSav = () => {
    try {
      const win = iframeRef.current?.contentWindow as any;
      const gm = win?.EJS_emulator?.gameManager;
      if (gm && typeof gm.saveSaveFiles === 'function') {
        gm.saveSaveFiles();
        const saveBytes = gm.getSaveFile(!1);
        if (saveBytes) {
          const blob = new Blob([new Uint8Array(saveBytes)], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.sav`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      }
    } catch {}

    // Fallback con postMessage
    const onData = (event: MessageEvent) => {
      if (event.data?.type === 'DAWGAMING_SAVE_DATA' && event.data.saveData) {
        window.removeEventListener('message', onData);
        const blob = new Blob([new Uint8Array(event.data.saveData)], {
          type: 'application/octet-stream',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.sav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    window.addEventListener('message', onData);
    iframeRef.current?.contentWindow?.postMessage({ type: 'DAWGAMING_GET_SAVE' }, '*');
  };

  const currentOption =
    LAYOUT_OPTIONS.find((opt) => opt.id === layout) || LAYOUT_OPTIONS[0];

  const queryParams = new URLSearchParams({
    core: 'nds',
    name: activeTitle,
    layout: layout,
  });

  if (activeRomUrl) {
    queryParams.set('rom', activeRomUrl);
  }

  const emulatorSrc = `/emulator/index.html?${queryParams.toString()}`;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Chassis Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-[#0a0e15] border-2 border-[#1e293b] rounded-xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Hardware Header Bezel */}
        <div className="bg-[#121822] border-b border-[#1f2b3e] px-4 py-2.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-mono font-bold text-white tracking-wider">
              NINTENDO DS
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded hidden sm:inline">
              DeSmuME WASM
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            {/* Cloud Status Pill */}
            {user ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                <Cloud className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">
                  {cloudMetadata ? 'Nube Sincronizada' : 'Conectado a Firebase'}
                </span>
              </span>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Inicia sesión para guardar en la nube"
              >
                <Cloud className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Nube desconectada</span>
              </button>
            )}

            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Modo: {currentOption.shortLabel}</span>
            </span>
          </div>
        </div>

        {/* Emulator Screen Viewport with Dynamic Aspect Ratio */}
        <div
          className={`relative w-full bg-[#070a0e] flex items-center justify-center overflow-hidden transition-all duration-300 ${
            currentOption.aspectClass
          } ${crtFilter ? 'crt-overlay' : ''}`}
        >
          <iframe
            key={layout}
            ref={iframeRef}
            src={emulatorSrc}
            title={activeTitle}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; gamepad; microphone"
          />

          {/* Toast Notification */}
          {cloudMessage && (
            <div className="absolute top-4 bg-[#0e1622]/95 border border-emerald-500/70 text-emerald-300 px-3.5 py-1.5 rounded-lg shadow-xl font-mono text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 z-30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{cloudMessage}</span>
            </div>
          )}
        </div>

        {/* Bottom Tactile Hardware Toolbar */}
        <div className="bg-[#101722] border-t border-[#1f2b3e] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left Actions: Reiniciar, CRT, Descargar .sav */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              title="Reiniciar emulación"
              className="btn-hardware px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reiniciar</span>
            </button>

            <button
              onClick={() => setCrtFilter(!crtFilter)}
              title="Filtro de líneas CRT"
              className={`btn-hardware px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer ${
                crtFilter ? 'text-emerald-400 border-emerald-500 bg-emerald-950/40' : 'text-[#64748b]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase">CRT</span>
            </button>

            <button
              onClick={handleDownloadSav}
              title="Descargar copia de tu partida (.sav) al ordenador"
              className="btn-hardware px-2.5 py-1.5 text-xs text-[#94a3b8] hover:text-white hover:border-emerald-500 flex items-center gap-1 cursor-pointer hidden sm:flex"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">Bajar .sav</span>
            </button>
          </div>

          {/* Right Actions: Guardar en Nube & Pantalla Completa */}
          <div className="flex items-center gap-2">
            {/* Botón Guardar en Nube Firebase */}
            <button
              onClick={handleCloudSaveClick}
              disabled={cloudSyncing}
              title={user ? 'Sincronizar progreso en tu cuenta de Firebase' : 'Iniciar sesión para guardar en la nube'}
              className="btn-hardware px-3 py-1.5 text-xs text-emerald-300 bg-emerald-950/70 border-emerald-500/60 hover:bg-emerald-900/80 hover:border-emerald-400 flex items-center gap-1.5 cursor-pointer font-mono font-bold transition-all shadow-sm shadow-emerald-950/50 disabled:opacity-50"
            >
              {cloudSyncing ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{cloudSyncing ? 'Guardando...' : 'Guardar en Nube'}</span>
            </button>

            <button
              onClick={handleFullscreen}
              title="Pantalla Completa"
              className="btn-hardware px-3 py-1.5 text-xs text-white hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer bg-[#17202e]"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Pantalla Completa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screen Layout Selector Bar */}
      <div className="w-full max-w-4xl bg-[#101722] border border-[#1f2b3e] rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Distribución de Pantallas Nintendo DS
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">
            {currentOption.description}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = layout === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectLayout(opt.id)}
                className={`px-3 py-2 rounded-md text-xs font-mono font-medium flex items-center justify-between gap-1.5 transition-all cursor-pointer text-left border ${
                  isSelected
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-950/50'
                    : 'bg-[#141d2b] text-[#94a3b8] border-[#223147] hover:bg-[#1a2536] hover:text-white hover:border-emerald-500/40'
                }`}
              >
                <span className="truncate">{opt.shortLabel}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auth Modal for Login */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
