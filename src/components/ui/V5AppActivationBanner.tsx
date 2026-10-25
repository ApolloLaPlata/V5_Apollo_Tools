'use client';

import React, { useState, useEffect } from 'react';
import Apollo5RocketLogo from './Apollo5RocketLogo';
import { Sparkles, X, Wrench, ShieldCheck, Check } from 'lucide-react';

interface V5AppActivationBannerProps {
  appId?: string;
  appName?: string;
  capitaniaNumber?: string;
}

export function V5AppActivationBanner({
  appId = 'tools',
  appName = 'V5 Apollo Tools',
  capitaniaNumber = 'Capitania #11'
}: V5AppActivationBannerProps) {
  const [isActivated, setIsActivated] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [activating, setActivating] = useState<boolean>(false);
  const [userV5Id, setUserV5Id] = useState<string | null>(null);

  useEffect(() => {
    try {
      const activationKey = `v5_activated_${appId}`;
      const activatedStatus = localStorage.getItem(activationKey);
      const storedId = localStorage.getItem('v5_user_id') || localStorage.getItem('v5_id_session') || 'Comandante V5';

      setUserV5Id(storedId);

      if (activatedStatus === 'true') {
        setIsActivated(true);
      } else {
        setIsActivated(false);
      }
    } catch (_) {
      setIsActivated(true);
    }
  }, [appId]);

  const handleActivate = () => {
    setActivating(true);
    setTimeout(() => {
      try {
        localStorage.setItem(`v5_activated_${appId}`, 'true');
        if (!localStorage.getItem('v5_user_id')) {
          localStorage.setItem('v5_user_id', 'v5_tools_' + Math.floor(Math.random() * 8999 + 1000));
        }
      } catch (_) {}
      setIsActivated(true);
      setActivating(false);
    }, 600);
  };

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 border border-cyan-500/40 p-4 shadow-xl backdrop-blur-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Wrench className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Central de Utilitários & Workflows ComfyUI</span>
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                {capitaniaNumber}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Micro-ferramentas rápidas de texto e QR Code + Workflows de ComfyUI para E-commerce, IA e Mídia.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          {!isActivated ? (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-black transition shadow-md cursor-pointer"
            >
              <span>{activating ? 'Ativando...' : 'Ativar no V5 ID'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conectado à Holding</span>
            </div>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default V5AppActivationBanner;
