'use client';

import React, { useState, useMemo } from 'react';
import { 
  Type, 
  Maximize2, 
  Crop, 
  Palette, 
  Sliders, 
  Copy, 
  Check, 
  Sparkles, 
  Laptop, 
  Smartphone,
  Eye,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TypographyAndDesignSuiteProps {
  defaultTab?: 'font-pairing' | 'fluid-typography' | 'aspect-ratio' | 'clip-path' | 'color-harmonies';
}

export const TypographyAndDesignSuite: React.FC<TypographyAndDesignSuiteProps> = ({ defaultTab = 'font-pairing' }) => {
  const [activeTab, setActiveTab] = useState<'font-pairing' | 'fluid-typography' | 'aspect-ratio' | 'clip-path' | 'color-harmonies'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: FONT PAIRING PREVIEWER
  // ==========================================
  const fontPairings = [
    {
      name: 'Cyber Future (Sora + Inter)',
      heading: 'Sora, sans-serif',
      body: 'Inter, sans-serif',
      category: 'Tech / SaaS',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Sora:wght@700;800&display=swap'
    },
    {
      name: 'Editorial Luxo (Playfair Display + Plus Jakarta Sans)',
      heading: 'Playfair Display, serif',
      body: 'Plus Jakarta Sans, sans-serif',
      category: 'Moda / Editorial',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500&display=swap'
    },
    {
      name: 'Modern Brutalism (Space Grotesk + Space Mono)',
      heading: 'Space Grotesk, sans-serif',
      body: 'Space Mono, monospace',
      category: 'Dev / Web3',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Space+Mono:wght@400;700&display=swap'
    },
    {
      name: 'Warm Corporate (Outfit + DM Sans)',
      heading: 'Outfit, sans-serif',
      body: 'DM Sans, sans-serif',
      category: 'Fintech / Enterprise',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Outfit:wght@700;800&display=swap'
    }
  ];

  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const activePair = fontPairings[selectedPairIndex];

  const fontPairingCss = `@import url('${activePair.googleFontUrl}');\n\nh1, h2, h3 {\n  font-family: '${activePair.heading}';\n}\n\np, body {\n  font-family: '${activePair.body}';\n}`;

  // ==========================================
  // FERRAMENTA 2: TIPOGRAFIA FLUIDA CLAMP()
  // ==========================================
  const [minVw, setMinVw] = useState<number>(360);
  const [maxVw, setMaxVw] = useState<number>(1280);
  const [minFontSize, setMinFontSize] = useState<number>(18);
  const [maxFontSize, setMaxFontSize] = useState<number>(44);

  const fluidClampCalculations = useMemo(() => {
    // Cálculo da taxa de variação (slope)
    const slope = (maxFontSize - minFontSize) / (maxVw - minVw);
    const yAxisIntersection = -minVw * slope + minFontSize;

    // Convertendo para rem (base 16px) e vw
    const minRem = (minFontSize / 16).toFixed(3);
    const maxRem = (maxFontSize / 16).toFixed(3);
    const slopeVw = (slope * 100).toFixed(3);
    const intersectionRem = (yAxisIntersection / 16).toFixed(3);

    const clampCss = `clamp(${minRem}rem, ${intersectionRem}rem + ${slopeVw}vw, ${maxRem}rem)`;

    return {
      minRem,
      maxRem,
      slopeVw,
      intersectionRem,
      clampCss
    };
  }, [minVw, maxVw, minFontSize, maxFontSize]);

  // ==========================================
  // FERRAMENTA 3: CONSTRUTOR ASPECT-RATIO
  // ==========================================
  const [aspectPreset, setAspectPreset] = useState<'16/9' | '9/16' | '1/1' | '4/3' | '21/9'>('16/9');

  const aspectCalculations = useMemo(() => {
    const [w, h] = aspectPreset.split('/').map(Number);
    const paddingBottomPercent = ((h / w) * 100).toFixed(2);

    const modernCss = `/* CSS Moderno (Suporte 98%+) */\n.media-container {\n  aspect-ratio: ${aspectPreset};\n  width: 100%;\n  object-fit: cover;\n}`;
    const legacyCss = `/* Fallback Legado (Padding-bottom hack) */\n.media-wrapper {\n  position: relative;\n  width: 100%;\n  padding-bottom: ${paddingBottomPercent}%;\n  height: 0;\n}\n\n.media-wrapper > * {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}`;

    return {
      w,
      h,
      paddingBottomPercent,
      modernCss,
      legacyCss
    };
  }, [aspectPreset]);

  // ==========================================
  // FERRAMENTA 4: GERADOR VISUAL DE CLIP-PATH CSS
  // ==========================================
  const clipPresets: Record<string, string> = {
    'Chanfro Cyber (Top/Bottom)': 'polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)',
    'Seta Direita (Chevron)': 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)',
    'Trapézio Isósceles': 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
    'Hexágono Simétrico': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    'Círculo Puro': 'circle(50% at 50% 50%)'
  };

  const [selectedClipName, setSelectedClipName] = useState<string>('Chanfro Cyber (Top/Bottom)');
  const activeClipPath = clipPresets[selectedClipName];

  // ==========================================
  // FERRAMENTA 5: GERADOR DE HARMONIAS CROMÁTICAS
  // ==========================================
  const [baseHexColor, setBaseHexColor] = useState<string>('#06b6d4'); // Ciano Apollo

  // Converte HEX para HSL
  const hexToHsl = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const colorHarmonies = useMemo(() => {
    const [h, s, l] = hexToHsl(baseHexColor);

    // Complementar (+180 deg)
    const compHex = hslToHex((h + 180) % 360, s, l);

    // Análogas (-30 deg e +30 deg)
    const ana1 = hslToHex((h + 330) % 360, s, l);
    const ana2 = hslToHex((h + 30) % 360, s, l);

    // Triádica (+120 deg e +240 deg)
    const tri1 = hslToHex((h + 120) % 360, s, l);
    const tri2 = hslToHex((h + 240) % 360, s, l);

    // Monocromática (mesmo matiz, variações de luminosidade)
    const monoLight = hslToHex(h, s, Math.min(92, l + 30));
    const monoDark = hslToHex(h, s, Math.max(12, l - 30));

    return {
      base: baseHexColor,
      complementary: compHex,
      analogous: [ana1, baseHexColor, ana2],
      triadic: [baseHexColor, tri1, tri2],
      monochromatic: [monoLight, baseHexColor, monoDark]
    };
  }, [baseHexColor]);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Tipografia, CSS & Design
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Type className="w-7 h-7 text-cyan-400" />
            Suíte de Tipografia Web, CSS & Design Responsivo
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Font pairing previewer, calculadora clamp() de tipografia fluida, aspect-ratio builder, gerador de clip-path e harmonias cromáticas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('font-pairing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'font-pairing'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          Font Pairing Previewer
        </button>

        <button
          onClick={() => setActiveTab('fluid-typography')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'fluid-typography'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Tipografia Fluida clamp()
        </button>

        <button
          onClick={() => setActiveTab('aspect-ratio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'aspect-ratio'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          Construtor aspect-ratio
        </button>

        <button
          onClick={() => setActiveTab('clip-path')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'clip-path'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Crop className="w-4 h-4" />
          Gerador Visual clip-path
        </button>

        <button
          onClick={() => setActiveTab('color-harmonies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'color-harmonies'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          Harmonias Cromáticas
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: FONT PAIRING PREVIEWER */}
        {activeTab === 'font-pairing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Selecione uma Combinação Harmônica:
              </label>
              <div className="space-y-2">
                {fontPairings.map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPairIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedPairIndex === idx
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{p.name}</div>
                    <div className="text-[11px] text-cyan-400/80 mt-0.5">{p.category}</div>
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">CSS de Importação</span>
                  <button
                    onClick={() => copyToClipboard(fontPairingCss, 'font-css')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedKey === 'font-css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900/60 p-2 rounded-lg overflow-x-auto select-all leading-relaxed">
                  {fontPairingCss}
                </pre>
              </div>
            </div>

            {/* Preview Visual */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-center space-y-4">
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest block font-mono">
                {activePair.category}
              </span>
              <h1 
                className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
                style={{ fontFamily: activePair.heading }}
              >
                Engenharia Soberana & Autonomia Digital
              </h1>
              <p 
                className="text-base text-slate-300 leading-relaxed max-w-xl"
                style={{ fontFamily: activePair.body }}
              >
                A Holding V5 Apollo unifica velocidade extrema, computação distribuída e tipografia de alto impacto para construir produtos web inesquecíveis.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
                  Explorar Plataforma
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-medium text-xs hover:bg-slate-700 transition-all">
                  Documentação Técnica
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: TIPOGRAFIA FLUIDA CLAMP() */}
        {activeTab === 'fluid-typography' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Viewport Mínimo (px):</label>
                <input
                  type="number"
                  value={minVw}
                  onChange={(e) => setMinVw(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Viewport Máximo (px):</label>
                <input
                  type="number"
                  value={maxVw}
                  onChange={(e) => setMaxVw(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Fonte Mínima (px):</label>
                <input
                  type="number"
                  value={minFontSize}
                  onChange={(e) => setMinFontSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Fonte Máxima (px):</label>
                <input
                  type="number"
                  value={maxFontSize}
                  onChange={(e) => setMaxFontSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Código CSS clamp() Gerado */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-blue-300">Regra CSS clamp() Calculada:</span>
                <button
                  onClick={() => copyToClipboard(`font-size: ${fluidClampCalculations.clampCss};`, 'clamp-css')}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  {copiedKey === 'clamp-css' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar CSS
                </button>
              </div>
              <pre className="text-sm font-mono text-cyan-400 bg-slate-900/60 p-3 rounded-lg overflow-x-auto select-all">
                font-size: {fluidClampCalculations.clampCss};
              </pre>
            </div>

            {/* Pré-visualização Interativa */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center">
              <span className="text-xs text-slate-500 block mb-2 font-mono">Texto com tamanho fluido ao vivo:</span>
              <p 
                className="font-bold text-white transition-all leading-tight"
                style={{ fontSize: fluidClampCalculations.clampCss }}
              >
                Tipografia Que Flui Perfeitamente
              </p>
            </div>
          </div>
        )}

        {/* ABA 3: CONSTRUTOR ASPECT-RATIO */}
        {activeTab === 'aspect-ratio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">Proporção (Aspect Ratio):</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '16/9', label: '16:9 (Vídeo / TV)' },
                    { id: '9/16', label: '9:16 (Shorts / Reels)' },
                    { id: '1/1', label: '1:1 (Quadrado Feed)' },
                    { id: '4/3', label: '4:3 (Fotografia Clássica)' },
                    { id: '21/9', label: '21:9 (Cinema Ultrawide)' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setAspectPreset(r.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        aspectPreset === r.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">Código CSS</span>
                  <button
                    onClick={() => copyToClipboard(aspectCalculations.modernCss, 'aspect-css')}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedKey === 'aspect-css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-300 bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto select-all leading-relaxed">
                  {aspectCalculations.modernCss}
                </pre>
              </div>
            </div>

            {/* Preview da Proporção */}
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div 
                className="w-full max-w-sm bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-dashed border-emerald-500/40 rounded-xl flex items-center justify-center p-4 transition-all duration-300"
                style={{ aspectRatio: aspectPreset }}
              >
                <div className="text-center">
                  <span className="text-xl font-black text-white font-mono block">{aspectPreset.replace('/', ':')}</span>
                  <span className="text-xs text-emerald-400 font-mono mt-1 block">Padding: {aspectCalculations.paddingBottomPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: GERADOR VISUAL CLIP-PATH */}
        {activeTab === 'clip-path' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">Formas Geométricas Pré-Configuradas:</label>
                <div className="space-y-2">
                  {Object.keys(clipPresets).map(name => (
                    <button
                      key={name}
                      onClick={() => setSelectedClipName(name)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                        selectedClipName === name
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">Regra CSS clip-path</span>
                  <button
                    onClick={() => copyToClipboard(`clip-path: ${activeClipPath};`, 'clip-css')}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'clip-css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="text-xs font-mono text-purple-300 bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                  clip-path: {activeClipPath};
                </pre>
              </div>
            </div>

            {/* Preview do Clip-path */}
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div 
                className="w-64 h-64 bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center shadow-2xl transition-all duration-300"
                style={{ clipPath: activeClipPath }}
              >
                <span className="text-white font-extrabold text-sm drop-shadow-md">
                  V5 Apollo Cyber
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: GERADOR DE HARMONIAS CROMÁTICAS */}
        {activeTab === 'color-harmonies' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-medium text-slate-300">Cor Base (Matiz Primário):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseHexColor}
                  onChange={(e) => setBaseHexColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={baseHexColor}
                  onChange={(e) => setBaseHexColor(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Complementar */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-300 block mb-3">Harmonia Complementar (180°):</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-xl p-2 flex flex-col justify-end" style={{ backgroundColor: colorHarmonies.base }}>
                    <span className="text-[11px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded w-max">{colorHarmonies.base}</span>
                  </div>
                  <div className="h-20 rounded-xl p-2 flex flex-col justify-end" style={{ backgroundColor: colorHarmonies.complementary }}>
                    <span className="text-[11px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded w-max">{colorHarmonies.complementary}</span>
                  </div>
                </div>
              </div>

              {/* Análogas */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-300 block mb-3">Harmonia Análoga (±30°):</span>
                <div className="grid grid-cols-3 gap-2">
                  {colorHarmonies.analogous.map((hex, idx) => (
                    <div key={idx} className="h-20 rounded-xl p-2 flex flex-col justify-end" style={{ backgroundColor: hex }}>
                      <span className="text-[10px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded w-max">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Triádica */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-300 block mb-3">Harmonia Triádica (120° / 240°):</span>
                <div className="grid grid-cols-3 gap-2">
                  {colorHarmonies.triadic.map((hex, idx) => (
                    <div key={idx} className="h-20 rounded-xl p-2 flex flex-col justify-end" style={{ backgroundColor: hex }}>
                      <span className="text-[10px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded w-max">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monocromática */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-300 block mb-3">Harmonia Monocromática:</span>
                <div className="grid grid-cols-3 gap-2">
                  {colorHarmonies.monochromatic.map((hex, idx) => (
                    <div key={idx} className="h-20 rounded-xl p-2 flex flex-col justify-end" style={{ backgroundColor: hex }}>
                      <span className="text-[10px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded w-max">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
