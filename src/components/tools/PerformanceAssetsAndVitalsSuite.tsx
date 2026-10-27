'use client';

import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Gauge, 
  Layers, 
  Globe, 
  Type, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode, 
  Wifi, 
  ArrowRight,
  TrendingDown,
  HardDrive
} from 'lucide-react';

interface PerformanceAssetsAndVitalsSuiteProps {
  defaultTab?: 'webp-avif' | 'critical-css' | 'resource-hints' | 'font-display' | 'bundle-budget';
}

export const PerformanceAssetsAndVitalsSuite: React.FC<PerformanceAssetsAndVitalsSuiteProps> = ({ defaultTab = 'webp-avif' }) => {
  const [activeTab, setActiveTab] = useState<'webp-avif' | 'critical-css' | 'resource-hints' | 'font-display' | 'bundle-budget'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: ESTIMADOR DE TAMANHO WEBP / AVIF VS JPEG / PNG
  // ==========================================
  const [origImageSizeKb, setOrigImageSizeKb] = useState<number>(450); // 450 KB
  const [origFormat, setOrigFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [monthlyPageviews, setMonthlyPageviews] = useState<number>(100000); // 100k views

  const compressionEstimates = useMemo(() => {
    // Fatores de redução teóricos médios
    let webpReductionFactor = origFormat === 'jpeg' ? 0.30 : 0.26; // 30% menor que JPG, 26% que PNG
    let avifReductionFactor = origFormat === 'jpeg' ? 0.50 : 0.45; // 50% menor que JPG, 45% que PNG

    const webpSizeKb = Math.round(origImageSizeKb * (1 - webpReductionFactor));
    const avifSizeKb = Math.round(origImageSizeKb * (1 - avifReductionFactor));

    const origTotalGb = ((origImageSizeKb * monthlyPageviews) / 1024 / 1024);
    const webpTotalGb = ((webpSizeKb * monthlyPageviews) / 1024 / 1024);
    const avifTotalGb = ((avifSizeKb * monthlyPageviews) / 1024 / 1024);

    const avifSavingsGb = Math.max(0, origTotalGb - avifTotalGb);
    // Custo CDN estimado médio: $0.08 por GB
    const dollarSaved = avifSavingsGb * 0.08;

    const pictureSnippet = `<picture>
  <source type="image/avif" srcset="/images/hero.avif" />
  <source type="image/webp" srcset="/images/hero.webp" />
  <img src="/images/hero.${origFormat}" alt="Hero Image" width="1200" height="630" loading="lazy" decoding="async" />
</picture>`;

    return {
      webpSizeKb,
      avifSizeKb,
      webpReductionPct: Math.round(webpReductionFactor * 100),
      avifReductionPct: Math.round(avifReductionFactor * 100),
      origTotalGb: origTotalGb.toFixed(1),
      webpTotalGb: webpTotalGb.toFixed(1),
      avifTotalGb: avifTotalGb.toFixed(1),
      avifSavingsGb: avifSavingsGb.toFixed(1),
      dollarSaved: dollarSaved.toFixed(2),
      pictureSnippet
    };
  }, [origImageSizeKb, origFormat, monthlyPageviews]);

  // ==========================================
  // FERRAMENTA 2: EXTRATOR & INLINER DE CRITICAL CSS ABOVE-THE-FOLD
  // ==========================================
  const sampleFullCss = `:root {
  --primary: #06b6d4;
  --bg-dark: #020617;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  background-color: var(--bg-dark);
  color: #f8fafc;
  line-height: 1.5;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #1e293b;
}

.hero {
  max-width: 1200px;
  margin: 4rem auto;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
}

.btn-primary {
  display: inline-block;
  background: var(--primary);
  color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
}

/* Regras não-críticas (Below-the-fold) */
footer {
  margin-top: 10rem;
  padding: 4rem;
  background: #0f172a;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
}

.faq-accordion .item:hover {
  background: #1e293b;
}

.testimonial-carousel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  opacity: 0;
}`;

  const [fullCssInput, setFullCssInput] = useState<string>(sampleFullCss);

  const criticalCssResult = useMemo(() => {
    if (!fullCssInput.trim()) return { critical: '', fullSize: 0, criticalSize: 0, reductionPct: 0 };

    // Extração heurística de seletores prioritários Above-the-fold
    const priorityKeywords = [
      ':root', 'html', 'body', '*', 'header', 'nav', 'hero', 'h1', 'h2', 'btn', 'main', 'container'
    ];

    const blocks = fullCssInput.split('}');
    const criticalBlocks: string[] = [];

    blocks.forEach(block => {
      const trimmed = block.trim();
      if (!trimmed) return;
      const selector = trimmed.split('{')[0].trim().toLowerCase();

      // Check if matches priority
      const isPriority = priorityKeywords.some(kw => selector.includes(kw));
      // Exclude below-the-fold selectors
      const isExcluded = selector.includes('footer') || selector.includes('modal') || selector.includes('faq') || selector.includes('carousel') || selector.includes(':hover');

      if (isPriority && !isExcluded) {
        criticalBlocks.push(trimmed + '}');
      }
    });

    const criticalCode = criticalBlocks.join('\n\n');
    const fullSize = new Blob([fullCssInput]).size;
    const criticalSize = new Blob([criticalCode]).size;
    const reductionPct = fullSize > 0 ? Math.round(((fullSize - criticalSize) / fullSize) * 100) : 0;

    const htmlTag = `<style id="critical-css">\n${criticalCode}\n</style>`;

    return {
      critical: criticalCode,
      htmlTag,
      fullSize,
      criticalSize,
      reductionPct
    };
  }, [fullCssInput]);

  // ==========================================
  // FERRAMENTA 3: CONSTRUTOR DE RESOURCE HINTS HTML
  // ==========================================
  const [hintType, setHintType] = useState<'preconnect' | 'preload' | 'prefetch' | 'dns-prefetch'>('preconnect');
  const [hintUrl, setHintUrl] = useState<string>('https://fonts.gstatic.com');
  const [asType, setAsType] = useState<string>('font');
  const [isCrossOrigin, setIsCrossOrigin] = useState<boolean>(true);

  const generatedHintSnippet = useMemo(() => {
    if (hintType === 'preconnect') {
      const crossOriginAttr = isCrossOrigin ? ' crossorigin' : '';
      return `<link rel="preconnect" href="${hintUrl}"${crossOriginAttr} />\n<link rel="dns-prefetch" href="${hintUrl}" />`;
    }

    if (hintType === 'preload') {
      const crossOriginAttr = (asType === 'font' || isCrossOrigin) ? ' crossorigin' : '';
      return `<link rel="preload" href="${hintUrl}" as="${asType}"${crossOriginAttr} />`;
    }

    if (hintType === 'prefetch') {
      return `<link rel="prefetch" href="${hintUrl}" />`;
    }

    if (hintType === 'dns-prefetch') {
      return `<link rel="dns-prefetch" href="${hintUrl}" />`;
    }

    return '';
  }, [hintType, hintUrl, asType, isCrossOrigin]);

  // Presets populares de CDNs
  const applyCdnPreset = (url: string, type: 'preconnect' | 'preload' | 'dns-prefetch', asVal: string = 'style', cross: boolean = true) => {
    setHintUrl(url);
    setHintType(type);
    setAsType(asVal);
    setIsCrossOrigin(cross);
  };

  // ==========================================
  // FERRAMENTA 4: SIMULADOR DE FONT-DISPLAY & IMPACTO CLS
  // ==========================================
  const [fontDisplayMode, setFontDisplayMode] = useState<'swap' | 'optional' | 'fallback' | 'block'>('swap');
  const [fontFamilyName, setFontFamilyName] = useState<string>('Space Grotesk');
  const [fontWoff2Url, setFontWoff2Url] = useState<string>('/fonts/space-grotesk.woff2');

  const fontDisplayAnalysis = useMemo(() => {
    switch (fontDisplayMode) {
      case 'swap':
        return {
          label: 'font-display: swap (Recomendado para Conteúdo)',
          blockPeriod: '0s (Bloqueio Zero)',
          swapPeriod: 'Infinito (Troca Imediata quando Baixar)',
          foitRisk: 'Mínimo (Sem texto invisível)',
          foutRisk: 'Presente (Flash de texto sem estilo)',
          clsImpact: 'Médio / Moderado (Pode causar pequenos saltos de layout se as métricas diferirem)',
          badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
          recommendation: 'Ideal para textos de leitura onde a prioridade máxima é o usuário enxergar o conteúdo sem esperar.'
        };
      case 'optional':
        return {
          label: 'font-display: optional (Recomendado para Redes Móveis / Core Web Vitals)',
          blockPeriod: '100ms (Bloqueio Ultra Curto)',
          swapPeriod: '0s (Não troca se a rede for lenta)',
          foitRisk: 'Quase nulo',
          foutRisk: 'Mínimo',
          clsImpact: 'ZERO (Excelente para eliminar CLS)',
          badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
          recommendation: 'Melhor opção para pontuação 100 no Google PageSpeed/Lighthouse, pois evita qualquer troca pós-renderização.'
        };
      case 'fallback':
        return {
          label: 'font-display: fallback (Equilíbrio)',
          blockPeriod: '100ms',
          swapPeriod: '3 segundos',
          foitRisk: 'Muito baixo',
          foutRisk: 'Moderado',
          clsImpact: 'Baixo a Moderado',
          badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
          recommendation: 'Equilíbrio aceitável para branding quando uma pequena janela de troca é tolerada.'
        };
      case 'block':
        return {
          label: 'font-display: block (Perigoso para Web Vitals)',
          blockPeriod: 'Até 3 segundos',
          swapPeriod: 'Infinito',
          foitRisk: 'CRÍTICO (Texto invisível durante conexão lenta)',
          foutRisk: 'Zero',
          clsImpact: 'Pode atrasar LCP gravemente',
          badgeColor: 'text-red-400 bg-red-950/60 border-red-800',
          recommendation: 'Usar apenas para ícones de fonte indispensáveis onde caracteres soltos causariam quebra visual total.'
        };
    }
  }, [fontDisplayMode]);

  const fontFaceSnippet = `@font-face {
  font-family: '${fontFamilyName}';
  src: url('${fontWoff2Url}') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: ${fontDisplayMode};
  /* Ajuste métrico para eliminar Cumulative Layout Shift (CLS) */
  size-adjust: 100%;
  ascent-override: 95%;
  descent-override: 25%;
}`;

  // ==========================================
  // FERRAMENTA 5: CALCULADORA DE PERFORMANCE BUDGET
  // ==========================================
  const [budgetHtmlKb, setBudgetHtmlKb] = useState<number>(30);
  const [budgetCssKb, setBudgetCssKb] = useState<number>(45);
  const [budgetJsKb, setBudgetJsKb] = useState<number>(150);
  const [budgetImagesKb, setBudgetImagesKb] = useState<number>(200);
  const [budgetFontsKb, setBudgetsFontsKb] = useState<number>(60);

  const budgetAnalysis = useMemo(() => {
    const totalKb = budgetHtmlKb + budgetCssKb + budgetJsKb + budgetImagesKb + budgetFontsKb;
    const totalBytes = totalKb * 1024;

    // Velocidades teóricas e RTT em ms
    // Slow 3G: 400 Kbps (50 KB/s), RTT 400ms
    // Fast 3G: 1.6 Mbps (200 KB/s), RTT 150ms
    // 4G: 9 Mbps (1125 KB/s), RTT 60ms
    // 5G: 50 Mbps (6250 KB/s), RTT 20ms

    const timeSlow3gSec = (totalKb / 50) + (4 * 0.4); // payload + conexões RTT
    const timeFast3gSec = (totalKb / 200) + (4 * 0.15);
    const time4gSec = (totalKb / 1125) + (4 * 0.06);
    const time5gSec = (totalKb / 6250) + (4 * 0.02);

    const isJsOverBudget = budgetJsKb > 170; // Alerta Google Vitals para JS inicial
    const isTotalOverBudget = totalKb > 500;

    const bundleJsonConfig = JSON.stringify({
      budgets: [
        { resourceType: 'document', budget: budgetHtmlKb },
        { resourceType: 'stylesheet', budget: budgetCssKb },
        { resourceType: 'script', budget: budgetJsKb },
        { resourceType: 'image', budget: budgetImagesKb },
        { resourceType: 'font', budget: budgetFontsKb },
        { resourceType: 'total', budget: totalKb }
      ]
    }, null, 2);

    return {
      totalKb,
      timeSlow3gSec: timeSlow3gSec.toFixed(2),
      timeFast3gSec: timeFast3gSec.toFixed(2),
      time4gSec: time4gSec.toFixed(2),
      time5gSec: time5gSec.toFixed(2),
      isJsOverBudget,
      isTotalOverBudget,
      bundleJsonConfig
    };
  }, [budgetHtmlKb, budgetCssKb, budgetJsKb, budgetImagesKb, budgetFontsKb]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Gauge className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                  Capitania #11 · Performance & Core Web Vitals Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Lighthouse 100 Optimized
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Velocidade Web, Core Web Vitals & Otimização de Assets
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Foco em FCP, LCP, CLS e Redução de Latência</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('webp-avif')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'webp-avif'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>WebP & AVIF Compression</span>
          </button>

          <button
            onClick={() => setActiveTab('critical-css')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'critical-css'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Critical CSS Inliner</span>
          </button>

          <button
            onClick={() => setActiveTab('resource-hints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'resource-hints'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Resource Hints (Preload/Preconnect)</span>
          </button>

          <button
            onClick={() => setActiveTab('font-display')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'font-display'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Font-Display & CLS</span>
          </button>

          <button
            onClick={() => setActiveTab('bundle-budget')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'bundle-budget'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Performance Budget (3G/4G/5G)</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: WEBP & AVIF COMPRESSION */}
        {/* ========================================================= */}
        {activeTab === 'webp-avif' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Parâmetros de Origem</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tamanho da Imagem Original (KB):</label>
                  <input
                    type="number"
                    value={origImageSizeKb}
                    onChange={(e) => setOrigImageSizeKb(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Formato Atual:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrigFormat('jpeg')}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${origFormat === 'jpeg' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      JPEG / JPG
                    </button>
                    <button
                      onClick={() => setOrigFormat('png')}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${origFormat === 'png' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      PNG (Gráficos/Fotos)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tráfego Mensal (Pageviews):</label>
                  <select
                    value={monthlyPageviews}
                    onChange={(e) => setMonthlyPageviews(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value={10000}>10.000 visualizações/mês</option>
                    <option value={100000}>100.000 visualizações/mês</option>
                    <option value={500000}>500.000 visualizações/mês</option>
                    <option value={1000000}>1.000.000 visualizações/mês</option>
                  </select>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Original ({origFormat.toUpperCase()})</span>
                    <div className="text-2xl font-bold text-slate-300">{origImageSizeKb} KB</div>
                    <span className="text-xs text-slate-500 mt-1 block">Baseline 100%</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-cyan-900/60 text-center">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-1">Google WebP</span>
                    <div className="text-2xl font-bold text-cyan-300">{compressionEstimates.webpSizeKb} KB</div>
                    <span className="text-xs text-emerald-400 mt-1 block">-{compressionEstimates.webpReductionPct}% Menor</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 text-center">
                    <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">AOMedia AVIF</span>
                    <div className="text-2xl font-bold text-amber-300">{compressionEstimates.avifSizeKb} KB</div>
                    <span className="text-xs text-emerald-400 font-bold mt-1 block">-{compressionEstimates.avifReductionPct}% Menor</span>
                  </div>
                </div>

                {/* Economia de Largura de Banda */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Impacto em Tráfego de CDN & Banda
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-1">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Tráfego Original:</span>
                      <span className="text-slate-300 font-bold">{compressionEstimates.origTotalGb} GB/mês</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Com AVIF:</span>
                      <span className="text-amber-400 font-bold">{compressionEstimates.avifTotalGb} GB/mês</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Economia de Banda:</span>
                      <span className="text-emerald-400 font-bold">{compressionEstimates.avifSavingsGb} GB</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Custo Evitado CDN:</span>
                      <span className="text-emerald-400 font-bold">~${compressionEstimates.dollarSaved}/mês</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">Snippet HTML &lt;picture&gt; com Fallbacks Modernos:</span>
                    <button
                      onClick={() => copyToClipboard(compressionEstimates.pictureSnippet, 'pic-snip')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'pic-snip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar HTML</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    {compressionEstimates.pictureSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: CRITICAL CSS INLINER */}
        {/* ========================================================= */}
        {activeTab === 'critical-css' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">
                O Critical CSS elimina o bloqueio de renderização (<strong className="text-amber-400">Eliminate render-blocking resources</strong>) injetando apenas o CSS essencial above-the-fold diretamente no <code className="text-cyan-300 bg-slate-900 px-1 rounded">&lt;head&gt;</code>.
              </div>
              <div className="text-right text-xs">
                {criticalCssResult.fullSize} B → <strong className="text-amber-400">{criticalCssResult.criticalSize} B</strong>
                <span className="text-emerald-400 font-bold ml-2">(-{criticalCssResult.reductionPct}% Redução)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">CSS Completo da Aplicação:</label>
                  <button
                    onClick={() => setFullCssInput(sampleFullCss)}
                    className="text-xs text-amber-400 hover:text-amber-300 underline"
                  >
                    Restaurar Amostra
                  </button>
                </div>
                <textarea
                  value={fullCssInput}
                  onChange={(e) => setFullCssInput(e.target.value)}
                  rows={12}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Tag &lt;style id="critical-css"&gt; Inline:</label>
                  <button
                    onClick={() => copyToClipboard(criticalCssResult.htmlTag || '', 'crit-css')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'crit-css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Bloco Inline</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={criticalCssResult.htmlTag}
                  rows={12}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: RESOURCE HINTS */}
        {/* ========================================================= */}
        {activeTab === 'resource-hints' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Configuração de Hint</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Resource Hint:</label>
                  <select
                    value={hintType}
                    onChange={(e) => setHintType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300"
                  >
                    <option value="preconnect">preconnect (+ dns-prefetch)</option>
                    <option value="preload">preload (Asset prioritário)</option>
                    <option value="prefetch">prefetch (Próxima navegação)</option>
                    <option value="dns-prefetch">dns-prefetch (Apenas resolução IP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">URL de Destino:</label>
                  <input
                    type="text"
                    value={hintUrl}
                    onChange={(e) => setHintUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>

                {hintType === 'preload' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Atributo as="...":</label>
                    <select
                      value={asType}
                      onChange={(e) => setAsType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    >
                      <option value="font">font (WOFF2/TTF)</option>
                      <option value="style">style (CSS)</option>
                      <option value="script">script (JS)</option>
                      <option value="image">image (Hero Banner)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={isCrossOrigin}
                      onChange={(e) => setIsCrossOrigin(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Incluir atributo crossorigin (Obrigatório para Fontes)</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Presets Rápidos de CDN:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => applyCdnPreset('https://fonts.gstatic.com', 'preconnect', 'font', true)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono"
                    >
                      Google Fonts
                    </button>
                    <button
                      onClick={() => applyCdnPreset('https://cdnjs.cloudflare.com', 'preconnect', 'script', false)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono"
                    >
                      Cloudflare CDN
                    </button>
                    <button
                      onClick={() => applyCdnPreset('https://www.googletagmanager.com', 'dns-prefetch', 'script', false)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono"
                    >
                      Google Analytics
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">Snippet HTML para Injeção no &lt;head&gt;:</span>
                    <button
                      onClick={() => copyToClipboard(generatedHintSnippet, 'hint-code')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'hint-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar Tag</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    {generatedHintSnippet}
                  </pre>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      <span>Guia de Boas Práticas (Core Web Vitals)</span>
                    </div>
                    <p>• <strong>preconnect:</strong> Estabelece handshake TLS + TCP com origens externas antes da requisição real.</p>
                    <p>• <strong>preload:</strong> Força o navegador a priorizar downloads críticos de fontes WOFF2 ou imagens LCP.</p>
                    <p>• <strong>prefetch:</strong> Baixa recursos em baixa prioridade para acelerar páginas seguintes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: FONT-DISPLAY & CLS */}
        {/* ========================================================= */}
        {activeTab === 'font-display' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Estratégia @font-face</h3>

                <div className="space-y-2">
                  {(['swap', 'optional', 'fallback', 'block'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFontDisplayMode(mode)}
                      className={`w-full p-2.5 rounded-lg text-xs text-left border transition font-mono ${
                        fontDisplayMode === mode
                          ? 'bg-amber-950/80 border-amber-700 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      font-display: {mode};
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Família da Fonte:</label>
                    <input
                      type="text"
                      value={fontFamilyName}
                      onChange={(e) => setFontFamilyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Diagnóstico de Performance</span>
                      <h4 className="text-base font-bold text-slate-200">{fontDisplayAnalysis.label}</h4>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${fontDisplayAnalysis.badgeColor}`}>
                      Impacto CLS: {fontDisplayMode === 'optional' ? 'ZERO' : fontDisplayMode === 'swap' ? 'MODERADO' : 'ALTO'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Período de Bloqueio (FOIT):</span>
                      <span className="text-slate-200 font-bold">{fontDisplayAnalysis.blockPeriod}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Período de Troca (FOUT):</span>
                      <span className="text-slate-200 font-bold">{fontDisplayAnalysis.swapPeriod}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    {fontDisplayAnalysis.recommendation}
                  </p>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Regra CSS @font-face com Correção Métrica de CLS:</span>
                      <button
                        onClick={() => copyToClipboard(fontFaceSnippet, 'font-snip')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'font-snip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar CSS</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-amber-300 overflow-x-auto whitespace-pre-wrap">
                      {fontFaceSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: PERFORMANCE BUDGET */}
        {/* ========================================================= */}
        {activeTab === 'bundle-budget' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Orçamento de Assets (KB)</h3>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Documento HTML:</span>
                    <span className="text-amber-400 font-bold">{budgetHtmlKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={budgetHtmlKb}
                    onChange={(e) => setBudgetHtmlKb(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>CSS Crítico:</span>
                    <span className="text-amber-400 font-bold">{budgetCssKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={150}
                    value={budgetCssKb}
                    onChange={(e) => setBudgetCssKb(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>JavaScript Inicial (Vendor + App):</span>
                    <span className="text-amber-400 font-bold">{budgetJsKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={500}
                    value={budgetJsKb}
                    onChange={(e) => setBudgetJsKb(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                  {budgetAnalysis.isJsOverBudget && (
                    <span className="text-[10px] text-red-400 block mt-0.5">
                      ⚠️ Acima do recomendado pelo Google (170 KB) para redes móveis!
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Imagens Above-The-Fold:</span>
                    <span className="text-amber-400 font-bold">{budgetImagesKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={600}
                    value={budgetImagesKb}
                    onChange={(e) => setBudgetImagesKb(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Fontes Web (WOFF2):</span>
                    <span className="text-amber-400 font-bold">{budgetFontsKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={200}
                    value={budgetFontsKb}
                    onChange={(e) => setBudgetsFontsKb(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Carga Total Estimada</span>
                      <div className="text-2xl font-bold text-slate-100">{budgetAnalysis.totalKb} KB</div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${
                      budgetAnalysis.isTotalOverBudget ? 'bg-red-950/60 text-red-400 border-red-800' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    }`}>
                      {budgetAnalysis.isTotalOverBudget ? 'Orçamento Alto (>500KB)' : 'Orçamento Saudável (Lighthouse Grade A)'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    Tempo Estimado de Download por Tipo de Conexão
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">3G Lento (400 Kbps):</span>
                      <span className={`text-base font-bold ${parseFloat(budgetAnalysis.timeSlow3gSec) > 5 ? 'text-red-400' : 'text-amber-400'}`}>
                        {budgetAnalysis.timeSlow3gSec}s
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">3G Rápido (1.6 Mbps):</span>
                      <span className="text-base font-bold text-cyan-400">{budgetAnalysis.timeFast3gSec}s</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">4G Médio (9 Mbps):</span>
                      <span className="text-base font-bold text-emerald-400">{budgetAnalysis.time4gSec}s</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">5G / Wi-Fi (50 Mbps):</span>
                      <span className="text-base font-bold text-emerald-400">{budgetAnalysis.time5gSec}s</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Configuração JSON (Lighthouse CI / bundlesize):</span>
                      <button
                        onClick={() => copyToClipboard(budgetAnalysis.bundleJsonConfig, 'budget-json')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'budget-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar JSON</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-36">
                      {budgetAnalysis.bundleJsonConfig}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
