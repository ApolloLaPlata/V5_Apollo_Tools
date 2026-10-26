'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  ShoppingCart, 
  TrendingUp, 
  Link2, 
  DollarSign, 
  Percent, 
  MessageSquare, 
  Sliders, 
  BarChart2, 
  Tag, 
  Send,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export type EcommerceTrafficTab = 'roas-cpa' | 'utm-builder' | 'pricing-sim' | 'promo-copy' | 'unit-profit';

export function EcommerceTrafficAndConversionSuite({ defaultTab = 'roas-cpa' }: { defaultTab?: EcommerceTrafficTab }) {
  const [activeTab, setActiveTab] = useState<EcommerceTrafficTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: CALCULADORA DE ROAS & CPA (BREAK-EVEN)
  // ==========================================
  const [ticketPrice, setTicketPrice] = useState<number>(197.00);
  const [productCost, setProductCost] = useState<number>(45.00); // Custo do produto/fornecedor
  const [operationalPercent, setOperationalPercent] = useState<number>(12.0); // Impostos + Gateway %
  const [monthlyAdSpend, setMonthlyAdSpend] = useState<number>(3000.00);
  const [targetRoas, setTargetRoas] = useState<number>(3.5);

  // Cálculos de Break-Even
  const operationalCost = ticketPrice * (operationalPercent / 100);
  const contributionMargin = ticketPrice - productCost - operationalCost;
  const breakEvenCpa = Math.max(0, contributionMargin);
  const breakEvenRoas = contributionMargin > 0 ? ticketPrice / contributionMargin : 0;

  // Projeção de Tráfego Pago
  const projectedRevenue = monthlyAdSpend * targetRoas;
  const projectedSalesCount = ticketPrice > 0 ? Math.floor(projectedRevenue / ticketPrice) : 0;
  const totalCostProducts = projectedSalesCount * productCost;
  const totalOperational = projectedSalesCount * operationalCost;
  const projectedNetProfit = projectedRevenue - totalCostProducts - totalOperational - monthlyAdSpend;

  // ==========================================
  // TAB 2: GERADOR DE URLs UTM (GA4 & ADS)
  // ==========================================
  const [baseUrl, setBaseUrl] = useState<string>('https://tools.v5apollo.com/oferta');
  const [utmSource, setUtmSource] = useState<string>('meta');
  const [utmMedium, setUtmMedium] = useState<string>('stories_cpc');
  const [utmCampaign, setUtmCampaign] = useState<string>('black_friday_2026');
  const [utmContent, setUtmContent] = useState<string>('video_roas_01');
  const [utmTerm, setUtmTerm] = useState<string>('publico_comfyui');

  const sanitizeParam = (val: string) => {
    return val.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '');
  };

  const buildUtmUrl = () => {
    if (!baseUrl.trim()) return '';
    try {
      const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
      if (utmSource) url.searchParams.set('utm_source', sanitizeParam(utmSource));
      if (utmMedium) url.searchParams.set('utm_medium', sanitizeParam(utmMedium));
      if (utmCampaign) url.searchParams.set('utm_campaign', sanitizeParam(utmCampaign));
      if (utmContent) url.searchParams.set('utm_content', sanitizeParam(utmContent));
      if (utmTerm) url.searchParams.set('utm_term', sanitizeParam(utmTerm));
      return url.toString();
    } catch {
      return `${baseUrl}?utm_source=${sanitizeParam(utmSource)}&utm_medium=${sanitizeParam(utmMedium)}&utm_campaign=${sanitizeParam(utmCampaign)}`;
    }
  };

  const finalUtmUrl = buildUtmUrl();

  // ==========================================
  // TAB 3: SIMULADOR DE PREÇO PSICOLÓGICO
  // ==========================================
  const [originalPrice, setOriginalPrice] = useState<number>(250.00);
  const [discountPercent, setDiscountPercent] = useState<number>(40);

  const discountedRaw = originalPrice * (1 - discountPercent / 100);
  const baseInt = Math.floor(discountedRaw);

  const charm90 = Number(`${baseInt}.90`);
  const charm99 = Number(`${baseInt}.99`);
  const round97 = Number(`${baseInt >= 10 ? baseInt - (baseInt % 10) + 7 : baseInt}`);
  const rounded00 = Number(`${Math.round(discountedRaw)}.00`);

  // ==========================================
  // TAB 4: FORMATADOR DE COPY PROMO TELEGRAM / WHATSAPP
  // ==========================================
  const [promoTitle, setPromoTitle] = useState<string>('🚀 Oportunidade: V5 Apollo Tools Pro — Vitalício');
  const [promoOldPrice, setPromoOldPrice] = useState<string>('297,00');
  const [promoNewPrice, setPromoNewPrice] = useState<string>('97,00');
  const [promoCoupon, setPromoCoupon] = useState<string>('APOLLO50');
  const [promoLink, setPromoLink] = useState<string>('https://tools.v5apollo.com/pro');
  const [promoChannelType, setPromoChannelType] = useState<'telegram' | 'whatsapp'>('whatsapp');

  const buildPromoMessage = () => {
    if (promoChannelType === 'whatsapp') {
      return `🔥 *${promoTitle}*

💥 De: ~R$ ${promoOldPrice}~
⚡ *Por apenas: R$ ${promoNewPrice}* à vista!

🎟 Cupom: \`${promoCoupon}\`
🔗 *Garanta no link oficial:* ${promoLink}

⏳ _Promoção por tempo limitado enquanto durarem as licenças!_`;
    }

    return `🔥 **${promoTitle}**

💥 De: ~~R$ ${promoOldPrice}~~
⚡ **Por apenas: R$ ${promoNewPrice}** à vista!

🎟 Cupom: \`${promoCoupon}\`
🔗 **Garanta no link oficial:** ${promoLink}

⏳ __Promoção por tempo limitado enquanto durarem as licenças!__`;
  };

  const formattedPromoMessage = buildPromoMessage();

  // ==========================================
  // TAB 5: CALCULADORA DE LUCRO LÍQUIDO (UNIT ECONOMICS)
  // ==========================================
  const [unitSalePrice, setUnitSalePrice] = useState<number>(149.90);
  const [unitCogs, setUnitCogs] = useState<number>(38.00); // Custo de mercadoria/serviço
  const [marketplaceFeePct, setMarketplaceFeePct] = useState<number>(14.0); // Taxa Shopee/ML/Hotmart %
  const [taxPercent, setTaxPercent] = useState<number>(6.0); // Simples Nacional %
  const [shippingAndPackaging, setShippingAndPackaging] = useState<number>(12.50); // Frete + embalagem
  const [fixedFee, setFixedFee] = useState<number>(3.00); // Taxa fixa da plataforma

  const calcMktFee = unitSalePrice * (marketplaceFeePct / 100);
  const calcTax = unitSalePrice * (taxPercent / 100);
  const totalDeductions = unitCogs + calcMktFee + calcTax + shippingAndPackaging + fixedFee;
  const netProfitUnit = unitSalePrice - totalDeductions;
  const netMarginPct = unitSalePrice > 0 ? (netProfitUnit / unitSalePrice) * 100 : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de E-commerce, Tráfego Pago & Conversão
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Growth & Ads · Etapa 31
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calculadora de ROAS & CPA Máximo, Gerador de URLs UTM, Preço Psicológico, Copy Promocional e Unit Economics.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('roas-cpa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'roas-cpa'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>ROAS & CPA</span>
          </button>
          <button
            onClick={() => setActiveTab('utm-builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'utm-builder'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Gerador UTM</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing-sim')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'pricing-sim'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Preço Psicológico</span>
          </button>
          <button
            onClick={() => setActiveTab('promo-copy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'promo-copy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Copy Telegram/Whats</span>
          </button>
          <button
            onClick={() => setActiveTab('unit-profit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'unit-profit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Lucro Unitário</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: ROAS & CPA BREAK-EVEN */}
        {/* ========================================== */}
        {activeTab === 'roas-cpa' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entradas */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Dados do Produto & Venda
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Ticket Médio / Preço (R$)</span>
                      <span className="font-mono text-cyan-400">R$ {ticketPrice.toFixed(2)}</span>
                    </label>
                    <input
                      type="number"
                      step="1.00"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Custo do Produto / COGS (R$)</span>
                      <span className="font-mono text-slate-300">R$ {productCost.toFixed(2)}</span>
                    </label>
                    <input
                      type="number"
                      step="1.00"
                      value={productCost}
                      onChange={(e) => setProductCost(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Impostos + Gateway (% total)</span>
                      <span className="font-mono text-slate-300">{operationalPercent}%</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={operationalPercent}
                      onChange={(e) => setOperationalPercent(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Simulação de Escala de Mídia:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Gasto em Ads (R$)</label>
                        <input
                          type="number"
                          step="100"
                          value={monthlyAdSpend}
                          onChange={(e) => setMonthlyAdSpend(Number(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-cyan-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">ROAS Desejado (x)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={targetRoas}
                          onChange={(e) => setTargetRoas(Number(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs font-mono text-emerald-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas de Break-Even */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* CPA Máximo */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">CPA Máximo de Equilíbrio</span>
                    <div className="text-2xl font-bold font-mono text-cyan-400">
                      R$ {breakEvenCpa.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Custo máximo por venda antes de entrar no prejuízo.
                    </p>
                  </div>

                  {/* ROAS Mínimo */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">ROAS de Break-Even</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {breakEvenRoas.toFixed(2)}x
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Multiplicador mínimo sobre o orçamento de anúncios.
                    </p>
                  </div>
                </div>

                {/* Resultado da Projeção de Escala */}
                <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
                    Projeção com ROAS {targetRoas}x
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Faturamento Bruto</span>
                      <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
                        R$ {projectedRevenue.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Vendas Estimadas</span>
                      <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                        {projectedSalesCount} un.
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Lucro Líquido Real</span>
                      <span className={`text-base font-bold font-mono mt-0.5 block ${projectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        R$ {projectedNetProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: GERADOR DE URLs UTM */}
        {/* ========================================== */}
        {activeTab === 'utm-builder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Parâmetros */}
              <div className="lg:col-span-6 space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Parâmetros de Rastreamento (GA4)
                  </span>

                  <div>
                    <label className="text-slate-400 block mb-1">URL Base da Página de Destino</label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-cyan-300 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">utm_source (Origem)</label>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="meta, google, email"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">utm_medium (Mídia)</label>
                      <input
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        placeholder="stories, cpc, bio"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">utm_campaign</label>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">utm_content</label>
                      <input
                        type="text"
                        value={utmContent}
                        onChange={(e) => setUtmContent(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">utm_term</label>
                      <input
                        type="text"
                        value={utmTerm}
                        onChange={(e) => setUtmTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Final Gerada */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-cyan-400" />
                      Link Rastreado Pronto para Ads
                    </span>
                    <button
                      onClick={() => copyToClipboard(finalUtmUrl, 'utm-url')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'utm-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Link
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all leading-relaxed">
                    {finalUtmUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: SIMULADOR DE PREÇO PSICOLÓGICO */}
        {/* ========================================== */}
        {activeTab === 'pricing-sim' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entradas */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Base de Precificação
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Preço Original "De" (R$)</span>
                      <span className="font-mono text-slate-300">R$ {originalPrice.toFixed(2)}</span>
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Desconto Promocional</span>
                      <span className="font-mono text-cyan-400">{discountPercent}% OFF</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={90}
                      step={5}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Variações Psicológicas */}
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Terminação .90 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Terminação Charm .90</span>
                    <div className="text-xl font-bold font-mono text-cyan-400">
                      R$ {charm90.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Padrão de e-commerce e infoprodutos no Brasil.
                    </p>
                  </div>

                  {/* Terminação .99 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Terminação .99 Clássica</span>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      R$ {charm99.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Percepção imediata de liquidação ou varejo.
                    </p>
                  </div>

                  {/* Terminação em 7 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Gatilho do Número 7</span>
                    <div className="text-xl font-bold font-mono text-purple-400">
                      R$ {round97.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Muito utilizado em lançamentos e ofertas diretas.
                    </p>
                  </div>

                  {/* Arredondado .00 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Arredondado de Prestígio</span>
                    <div className="text-xl font-bold font-mono text-slate-200">
                      R$ {rounded00.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Transmite sofisticação e posicionamento premium.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: FORMATADOR DE COPY PROMO */}
        {/* ========================================== */}
        {activeTab === 'promo-copy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entradas da Oferta */}
              <div className="lg:col-span-5 space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Dados da Mensagem
                  </span>

                  <div>
                    <label className="text-slate-400 block mb-1">Título da Oferta</label>
                    <input
                      type="text"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">De (R$)</label>
                      <input
                        type="text"
                        value={promoOldPrice}
                        onChange={(e) => setPromoOldPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Por (R$)</label>
                      <input
                        type="text"
                        value={promoNewPrice}
                        onChange={(e) => setPromoNewPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-cyan-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Cupom</label>
                      <input
                        type="text"
                        value={promoCoupon}
                        onChange={(e) => setPromoCoupon(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-emerald-300 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Destino</label>
                      <select
                        value={promoChannelType}
                        onChange={(e) => setPromoChannelType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-cyan-300 font-mono"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagem Formatada */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-cyan-400" />
                      Mensagem Pronta para Disparo ({promoChannelType.toUpperCase()})
                    </span>
                    <button
                      onClick={() => copyToClipboard(formattedPromoMessage, 'promo-msg')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'promo-msg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Mensagem
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {formattedPromoMessage}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: UNIT ECONOMICS (LUCRO LÍQUIDO) */}
        {/* ========================================== */}
        {activeTab === 'unit-profit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entradas */}
              <div className="lg:col-span-5 space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Estrutura de Custos por Unidade
                  </span>

                  <div>
                    <label className="text-slate-400 block mb-1">Preço Final de Venda (R$)</label>
                    <input
                      type="number"
                      step="1.00"
                      value={unitSalePrice}
                      onChange={(e) => setUnitSalePrice(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-cyan-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Custo Produto (R$)</label>
                      <input
                        type="number"
                        step="1.00"
                        value={unitCogs}
                        onChange={(e) => setUnitCogs(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Frete/Embalagem (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        value={shippingAndPackaging}
                        onChange={(e) => setShippingAndPackaging(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Taxa Mktplace (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={marketplaceFeePct}
                        onChange={(e) => setMarketplaceFeePct(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Impostos NF (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado Financeiro */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Lucro Líquido por Venda</span>
                    <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 flex items-baseline gap-2">
                      <span>R$ {netProfitUnit.toFixed(2)}</span>
                      <span className="text-sm font-normal text-slate-400 font-mono">
                        ({netMarginPct.toFixed(1)}% de margem líquida)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Comissão Plataforma</span>
                      <span className="font-mono text-slate-200 font-bold">R$ {calcMktFee.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Impostos Fiscais</span>
                      <span className="font-mono text-slate-200 font-bold">R$ {calcTax.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
