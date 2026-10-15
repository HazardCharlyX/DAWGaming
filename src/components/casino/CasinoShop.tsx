'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  CASINO_SHINIES,
  ANSWER_PRICE,
  ANSWER_REVEAL_TEXT,
  CasinoShiny,
  RedemptionRecord,
  purchaseCasinoReward,
  getLocalRedemptions,
} from '@/lib/casino';
import {
  Sparkles,
  Key,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Coins,
  Camera,
  X,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface CasinoShopProps {
  user: User | null;
  chips: number;
  onRequireAuth: () => void;
  onBackToRoulette: () => void;
}

export function CasinoShop({
  user,
  chips,
  onRequireAuth,
  onBackToRoulette,
}: CasinoShopProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [activeModalRedemption, setActiveModalRedemption] = useState<RedemptionRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = user ? `dawgaming_casino_redemptions_${user.uid}` : 'dawgaming_casino_redemptions_guest';
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setRedemptions(JSON.parse(stored));
        } catch {}
      }
    }
  }, [user]);

  const handleBuyAnswer = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (chips < ANSWER_PRICE) {
      setErrorMessage(
        `Fichas insuficientes. La respuesta cuesta ${ANSWER_PRICE.toLocaleString()} fichas y tienes ${chips.toLocaleString()}. Juega a la ruleta para ganar más fichas.`
      );
      return;
    }

    setPurchasing(true);
    setErrorMessage(null);

    try {
      const record = await purchaseCasinoReward(
        user,
        'answer',
        'carlos_answer',
        'Respuesta de Carlos (Desbloquear Ya)',
        ANSWER_PRICE
      );
      setActiveModalRedemption(record);
      setRedemptions((prev) => [record, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la compra en Firestore.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleBuyShiny = async (shiny: CasinoShiny) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (chips < shiny.price) {
      setErrorMessage(
        `Fichas insuficientes. ${shiny.name} cuesta ${shiny.price.toLocaleString()} fichas y tienes ${chips.toLocaleString()}.`
      );
      return;
    }

    setPurchasing(true);
    setErrorMessage(null);

    try {
      const record = await purchaseCasinoReward(
        user,
        'shiny',
        shiny.id,
        shiny.name,
        shiny.price
      );
      setActiveModalRedemption(record);
      setRedemptions((prev) => [record, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al canjear el Shiny en Firestore.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Balance & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#111927] to-[#0a0f17] border border-[#23354d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Tu Saldo en el Casino
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-amber-300">
                {chips.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-400">fichas</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBackToRoulette}
          className="px-4 py-2 rounded-lg bg-[#182333] hover:bg-[#202e42] border border-[#2c3d55] text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
        >
          ← Volver a la Mesa de Ruleta
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PRODUCTO ESTRELLA: RESPUESTA DE CARLOS (10.000 PUNTOS)                 */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1405] via-[#141824] to-[#0a0e17] border-2 border-amber-500/60 p-6 sm:p-7 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>DESBLOQUEO INSTANTÁNEO • CÓDIGO VERIFICADO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              La Respuesta a la Pregunta de &ldquo;Desbloquear Ya&rdquo;
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              ¿Quieres la respuesta exacta a la pregunta de seguridad sobre la bebida favorita de Carlos
              para saltarte los 25 días de espera? Cuesta 10.000 puntos y te dará la respuesta oficial registrada en la base de datos.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-mono text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Genera código único para capturar e informar a Carlos (Hazard)</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 block">Precio Oficial</span>
              <span className="text-3xl font-black font-mono text-amber-400">
                10.000 <span className="text-sm font-normal text-slate-300">fichas</span>
              </span>
            </div>

            <button
              onClick={handleBuyAnswer}
              disabled={purchasing || chips < ANSWER_PRICE}
              className={`px-6 py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer ${
                chips < ANSWER_PRICE
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black border border-amber-300 shadow-amber-950/60 hover:scale-105 active:scale-95'
              }`}
            >
              {purchasing ? 'Registrando en Firestore...' : 'Comprar Respuesta (10.000 pts)'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATÁLOGO DE SHINIES PARA POKÉMON RENEGADE PLATINUM (500 A 15.000 PTS)  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c293d] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inyección de Pokémon para Nintendo DS</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Shinies Exclusivos para Pokémon Renegade Platinum
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Precios desde 500 hasta 15.000 fichas
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Al canjear cualquier Pokémon, el sistema generará un código único registrado en Firebase.
          Haz una captura del código y envíaselo a Carlos para que te inyecte el Shiny directamente en tu partida guardada.
        </p>

        {/* Shiny Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CASINO_SHINIES.map((shiny) => {
            const canAfford = chips >= shiny.price;
            return (
              <div
                key={shiny.id}
                className="p-4 rounded-xl bg-[#0d141f] border border-[#1e2d40] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-lg"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-lg bg-[#070b12] border border-[#172333] flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={shiny.spriteUrl}
                      alt={shiny.name}
                      className="w-28 h-28 object-contain pixelated group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(16,185,129,0.3)]"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ★ SHINY
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#111927] text-slate-400 border border-[#213045]">
                      Nv. {shiny.level}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    {shiny.types.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#182333] text-emerald-300 border border-emerald-500/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {shiny.name}
                  </h4>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {shiny.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#182333] flex items-center justify-between">
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {shiny.price.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pts</span>
                  </span>

                  <button
                    onClick={() => handleBuyShiny(shiny)}
                    disabled={purchasing || !canAfford}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-[#141b24] text-slate-500 border border-[#222d3b] cursor-not-allowed'
                    }`}
                  >
                    Canjear
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HISTORIAL DE CÓDIGOS CANJEADOS (PARA SACAR CAPTURA Y ENVIAR A CARLOS)  */}
      {/* ========================================================================= */}
      {redemptions.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0b1018] border border-[#1e2d42] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Mis Códigos Canjeados para Enviar a Carlos ({redemptions.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {redemptions.map((r) => (
              <div
                key={r.code}
                className="p-3.5 rounded-xl bg-[#121926] border border-[#23354d] space-y-2 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[200px]">{r.itemTitle}</span>
                  <span className="text-amber-400 font-bold">{r.cost.toLocaleString()} pts</span>
                </div>

                {r.secretMessage && (
                  <p className="text-[11px] text-amber-300 italic bg-amber-950/40 p-2 rounded border border-amber-500/30">
                    &ldquo;{r.secretMessage}&rdquo;
                  </p>
                )}

                <div className="p-2 rounded-lg bg-black/50 border border-slate-700 flex items-center justify-between gap-2">
                  <code className="text-emerald-400 font-black tracking-wider text-[11px] break-all">
                    {r.code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(r.code)}
                    className="p-1 rounded bg-[#1e2a3c] text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    title="Copiar código"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP / MODAL DE CANJE CON INSTRUCCIÓN DE CAPTURA PARA CARLOS             */}
      {/* ========================================================================= */}
      {activeModalRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0e1420] border-2 border-emerald-500/70 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#23344a] pb-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ CANJE REGISTRADO EN FIREBASE
                </span>
                <h3 className="text-xl font-black text-white">
                  {activeModalRedemption.itemTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalRedemption(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1a2536]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Secret Answer Reveal Message (Carlos punchline) */}
            {activeModalRedemption.secretMessage && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/50 via-[#1e1c15] to-[#141b27] border-2 border-amber-500/70 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                  <Key className="w-4 h-4 shrink-0" />
                  <span>RESPUESTA OFICIAL REVELADA:</span>
                </div>
                <blockquote className="text-sm sm:text-base font-extrabold text-white font-mono leading-relaxed border-l-2 border-amber-400 pl-3">
                  &ldquo;{activeModalRedemption.secretMessage}&rdquo;
                </blockquote>
              </div>
            )}

            {/* Important capture prompt requested by user */}
            <div className="p-4 rounded-xl bg-[#090e17] border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <Camera className="w-4 h-4 shrink-0" />
                <span>INSTRUCCIÓN OBLIGATORIA:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                Informa a Carlos con una captura del siguiente código:
              </p>

              <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/60 flex items-center justify-between gap-2">
                <code className="text-xs sm:text-sm font-black text-emerald-300 tracking-wider font-mono break-all select-all">
                  {activeModalRedemption.code}
                </code>
                <button
                  onClick={() => handleCopyCode(activeModalRedemption.code)}
                  className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Este código está vinculado a tu usuario en Firestore Database y puede ser validado por Carlos.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModalRedemption(null)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs cursor-pointer shadow-md"
              >
                Entendido, ya he sacado la captura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
