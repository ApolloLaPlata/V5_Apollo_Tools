'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import V5SovereignCheckoutModal, { PlanItem } from '@/components/checkout/V5SovereignCheckoutModal';

export default function PricingPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);

  const plans: Record<string, PlanItem> = {
    starter: {
      id: 'tools_starter',
      name: 'Developer Starter',
      priceBrl: 29.9,
      priceUsd: 5.5,
      period: 'mês',
      description: 'Acesso a ferramentas essenciais para automação e processamento de arquivos.',
      creditsLabel: '2.000 Requisições de API/mês',
      featured: false
    },
    pro: {
      id: 'tools_pro',
      name: 'Tools Pro Power',
      priceBrl: 59.9,
      priceUsd: 11.0,
      period: 'mês',
      description: 'Poder total para desenvolvedores construindo produtos em cima do ecossistema.',
      creditsLabel: '15.000 Requisições de API/mês',
      featured: true
    },
    agency: {
      id: 'tools_enterprise',
      name: 'API Enterprise Dedicated',
      priceBrl: 119.9,
      priceUsd: 22.0,
      period: 'mês',
      description: 'Volume ilimitado com infraestrutura de containers dedicados.',
      creditsLabel: 'Requisições Ilimitadas de API',
      featured: false
    }
  };

  const handleOpenCheckout = (planKey: string) => {
    setSelectedPlan(plans[planKey]);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none fixed"></div>
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TOOLS & MICROSERVIÇOS • CÂNONE FINANCEIRO 50/25/25</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Planos V5 Tools API Hub
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Utilitários, Compressores de Mídia, Scrapers e APIs de Inteligência. Liquidação instantânea via Pix D+0, Cartão de Crédito em até 12x sem juros e Cripto USDT Soberano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-16">
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 p-7 flex flex-col justify-between transition-all duration-200">
            <div>
              
              <h3 className="text-xl font-bold text-white mb-2">Developer Starter</h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Acesso a ferramentas essenciais para automação e processamento de arquivos.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-medium text-zinc-400">R$</span>
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">29.90</span>
                <span className="text-xs text-zinc-400 font-medium">/mês</span>
              </div>
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 mb-6 flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>2.000 Requisições de API/mês</span>
              </div>
              <div className="space-y-3 mb-8">
                <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Benefícios Inclusos:</p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Compressores de Vídeo e Áudio WebP/MP4</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Geradores de Metadados e Tags SEO</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Scrapers Básicos de Informações</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Chave de API REST com Rate Limit Básico</span></li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleOpenCheckout("starter")}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <span>Garantir Developer Starter</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative rounded-3xl border border-blue-500/50 bg-gradient-to-b from-blue-950/40 via-zinc-900/60 to-zinc-950 shadow-2xl shadow-blue-950/50 p-7 flex flex-col justify-between transition-all duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase tracking-widest mb-3"><Sparkles className="h-3 w-3" /> Mais Escolhido</div>
              <h3 className="text-xl font-bold text-white mb-2">Tools Pro Power</h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Poder total para desenvolvedores construindo produtos em cima do ecossistema.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-medium text-zinc-400">R$</span>
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">59.90</span>
                <span className="text-xs text-zinc-400 font-medium">/mês</span>
              </div>
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 mb-6 flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>15.000 Requisições de API/mês</span>
              </div>
              <div className="space-y-3 mb-8">
                <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Benefícios Inclusos:</p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>15.000 Requisições de API sem Travamento</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Rotas de Inteligência Artificial e OCR</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Endpoints de Síntese de Áudio e Imagem</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Webhooks em Tempo Real de Conclusão</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>SLA de 99.9% de Disponibilidade</span></li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleOpenCheckout("pro")}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-blue-900/40"
            >
              <span>Garantir Tools Pro Power</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 p-7 flex flex-col justify-between transition-all duration-200">
            <div>
              
              <h3 className="text-xl font-bold text-white mb-2">API Enterprise Dedicated</h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Volume ilimitado com infraestrutura de containers dedicados.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-medium text-zinc-400">R$</span>
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">119.90</span>
                <span className="text-xs text-zinc-400 font-medium">/mês</span>
              </div>
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 mb-6 flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Requisições Ilimitadas de API</span>
              </div>
              <div className="space-y-3 mb-8">
                <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Benefícios Inclusos:</p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Requisições Ilimitadas de Alta Latência</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>IP Dedicado e Proxy Mesh Incluso</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Containers Provisionados sob Demanda</span></li><li className="flex items-center gap-2 text-xs text-zinc-300"><Check className="h-4 w-4 text-emerald-400 shrink-0" /><span>Canal de Suporte Técnico com Engenheiros</span></li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleOpenCheckout("agency")}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <span>Garantir API Enterprise Dedicated</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Garantia Soberana & Liberação Instantânea</h4>
              <p className="text-xs text-zinc-400">Ativação automática em 2,4s via bot. Sem intermediários fiduciários e com reembolso direto.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            <Lock className="h-3.5 w-3.5 text-blue-400" />
            <span>Holding V5 Apollo</span>
          </div>
        </div>
      </main>

      <V5SovereignCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
