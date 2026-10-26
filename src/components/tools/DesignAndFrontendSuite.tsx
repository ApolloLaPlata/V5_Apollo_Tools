'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Palette, 
  Type, 
  Maximize2, 
  CreditCard, 
  FileImage, 
  Trash2, 
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';

export type DesignFrontendTab = 'wcag-contrast' | 'css-units' | 'glassmorphism' | 'fake-card-qa' | 'exif-cleaner';

export function DesignAndFrontendSuite({ defaultTab = 'wcag-contrast' }: { defaultTab?: DesignFrontendTab }) {
  const [activeTab, setActiveTab] = useState<DesignFrontendTab>(defaultTab);
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
  // TAB 1: VALIDADOR DE CONTRASTE WCAG 2.1 (AA / AAA)
  // ==========================================
  const [textColor, setTextColor] = useState<string>('#38bdf8'); // sky-400
  const [bgColor, setBgColor] = useState<string>('#020617'); // slate-950

  // Função para converter hex para RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return [0, 0, 0];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  // Cálculo de Luminância Relativa W3C WCAG
  const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (c1: string, c2: string): number => {
    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);
    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const contrastRatio = getContrastRatio(textColor, bgColor);
  const ratioFormatted = contrastRatio.toFixed(2);

  // Status de conformidade
  const normalTextAA = contrastRatio >= 4.5;
  const normalTextAAA = contrastRatio >= 7.0;
  const largeTextAA = contrastRatio >= 3.0;
  const largeTextAAA = contrastRatio >= 4.5;
  const uiComponentsAA = contrastRatio >= 3.0;

  // ==========================================
  // TAB 2: CONVERSOR DE UNIDADES CSS & CLAMP() FLUIDO
  // ==========================================
  const [baseFontSize, setBaseFontSize] = useState<number>(16);
  const [pxValue, setPxValue] = useState<number>(24);
  const [viewportWidth, setViewportWidth] = useState<number>(1920);

  // Valores calculados
  const remValue = (pxValue / baseFontSize).toFixed(4);
  const emValue = (pxValue / baseFontSize).toFixed(4);
  const percentValue = ((pxValue / baseFontSize) * 100).toFixed(1);
  const vwValue = ((pxValue / viewportWidth) * 100).toFixed(3);
  const ptValue = (pxValue * 0.75).toFixed(2);

  // Tipografia Fluida clamp()
  const [minVw, setMinVw] = useState<number>(360);
  const [maxVw, setMaxVw] = useState<number>(1280);
  const [minPx, setMinPx] = useState<number>(16);
  const [maxPx, setMaxPx] = useState<number>(32);

  // Fórmula clamp: clamp(min, yAxis + val, max)
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const yAxisIntersection = -minVw * slope + minPx;
  const clampRemMin = (minPx / baseFontSize).toFixed(3);
  const clampRemMax = (maxPx / baseFontSize).toFixed(3);
  const clampVw = (slope * 100).toFixed(3);
  const clampIntersectionRem = (yAxisIntersection / baseFontSize).toFixed(3);
  const clampFormula = `clamp(${clampRemMin}rem, ${clampIntersectionRem}rem + ${clampVw}vw, ${clampRemMax}rem)`;

  // ==========================================
  // TAB 3: GERADOR DE GLASSMORPHISM & BOX-SHADOW CYBER
  // ==========================================
  const [glassBlur, setGlassBlur] = useState<number>(16);
  const [glassOpacity, setGlassOpacity] = useState<number>(25); // 0.25
  const [glassBorderOpacity, setGlassBorderOpacity] = useState<number>(30); // 0.30
  const [glassBorderRadius, setGlassBorderRadius] = useState<number>(16);
  const [shadowColorType, setShadowColorType] = useState<'cyan' | 'purple' | 'emerald' | 'amber' | 'slate'>('cyan');
  const [shadowBlur, setShadowBlur] = useState<number>(30);
  const [shadowSpread, setShadowSpread] = useState<number>(0);
  const [shadowOpacity, setShadowOpacity] = useState<number>(25);

  const getShadowColorRgba = () => {
    const op = (shadowOpacity / 100).toFixed(2);
    switch (shadowColorType) {
      case 'cyan': return `rgba(6, 182, 212, ${op})`;
      case 'purple': return `rgba(168, 85, 247, ${op})`;
      case 'emerald': return `rgba(16, 185, 129, ${op})`;
      case 'amber': return `rgba(245, 158, 11, ${op})`;
      default: return `rgba(0, 0, 0, ${op})`;
    }
  };

  const glassStyle: React.CSSProperties = {
    backgroundColor: `rgba(15, 23, 42, ${glassOpacity / 100})`,
    backdropFilter: `blur(${glassBlur}px)`,
    WebkitBackdropFilter: `blur(${glassBlur}px)`,
    borderRadius: `${glassBorderRadius}px`,
    border: `1px solid rgba(255, 255, 255, ${glassBorderOpacity / 100})`,
    boxShadow: `0 8px ${shadowBlur}px ${shadowSpread}px ${getShadowColorRgba()}`
  };

  const generatedCss = `background: rgba(15, 23, 42, ${(glassOpacity / 100).toFixed(2)});
backdrop-filter: blur(${glassBlur}px);
-webkit-backdrop-filter: blur(${glassBlur}px);
border-radius: ${glassBorderRadius}px;
border: 1px solid rgba(255, 255, 255, ${(glassBorderOpacity / 100).toFixed(2)});
box-shadow: 0 8px ${shadowBlur}px ${shadowSpread}px ${getShadowColorRgba()};`;

  // ==========================================
  // TAB 4: GERADOR DE CARTÕES FICTÍCIOS PARA QA
  // ==========================================
  interface GeneratedCard {
    brand: 'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Hipercard';
    cardNumber: string;
    holderName: string;
    expiryDate: string;
    cvv: string;
  }

  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Hipercard'>('Visa');
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);

  // Algoritmo de Luhn para gerar cartões matematicamente válidos
  const generateLuhnCard = (prefix: string, length: number): string => {
    const cardDigits: number[] = prefix.split('').map(Number);
    while (cardDigits.length < length - 1) {
      cardDigits.push(Math.floor(Math.random() * 10));
    }

    // Calcula dígito verificador
    let sum = 0;
    const reversed = [...cardDigits].reverse();
    for (let i = 0; i < reversed.length; i++) {
      let d = reversed[i];
      if (i % 2 === 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    cardDigits.push(checkDigit);
    return cardDigits.join('');
  };

  const handleGenerateCard = () => {
    let prefix = '4';
    let length = 16;
    let cvvLength = 3;

    if (cardBrand === 'Visa') {
      prefix = '4012';
      length = 16;
    } else if (cardBrand === 'Mastercard') {
      prefix = '5521';
      length = 16;
    } else if (cardBrand === 'Elo') {
      prefix = '636368';
      length = 16;
    } else if (cardBrand === 'Amex') {
      prefix = '3782';
      length = 15;
      cvvLength = 4;
    } else if (cardBrand === 'Hipercard') {
      prefix = '606282';
      length = 16;
    }

    const rawNumber = generateLuhnCard(prefix, length);
    // Formata o número
    let formattedNumber = '';
    if (length === 15) {
      // Formato Amex: 4-6-5
      formattedNumber = `${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 10)} ${rawNumber.slice(10, 15)}`;
    } else {
      formattedNumber = rawNumber.replace(/(\d{4})/g, '$1 ').trim();
    }

    const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const randomYear = String(Math.floor(Math.random() * 6) + 2027);

    const randomNames = [
      'GABRIEL S OLIVEIRA QA',
      'MARIANA F SANTOS TESTE',
      'LUCAS M SILVA DEV',
      'ANA BEATRIZ COSTA QA',
      'RODRIGO N CARVALHO QA',
      'FERNANDA L PEREIRA SANDBOX'
    ];
    const holderName = randomNames[Math.floor(Math.random() * randomNames.length)];

    let cvv = '';
    for (let i = 0; i < cvvLength; i++) {
      cvv += Math.floor(Math.random() * 10);
    }

    setGeneratedCard({
      brand: cardBrand,
      cardNumber: formattedNumber,
      holderName,
      expiryDate: `${randomMonth}/${randomYear.slice(2)}`,
      cvv
    });
  };

  useEffect(() => {
    if (!generatedCard) {
      handleGenerateCard();
    }
  }, [cardBrand]);

  // ==========================================
  // TAB 5: INSPETOR & LIMPADOR EXIF DE IMAGENS
  // ==========================================
  interface ExifMeta {
    fileName: string;
    fileSize: string;
    fileType: string;
    width: number;
    height: number;
    hasGpsEstimate: boolean;
    cleanDataUrl: string;
  }

  const [exifResult, setExifResult] = useState<ExifMeta | null>(null);
  const [cleaningStatus, setCleaningStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExifImageUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setCleaningStatus('Processando e removendo metadados...');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Criamos um Canvas virgem para reconstruir a imagem sem metadados
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const cleanJpeg = canvas.toDataURL('image/jpeg', 0.95);

          setExifResult({
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            fileType: file.type,
            width: img.width,
            height: img.height,
            hasGpsEstimate: file.name.toLowerCase().includes('img') || file.name.toLowerCase().includes('photo') || file.size > 2000000,
            cleanDataUrl: cleanJpeg
          });
          setCleaningStatus(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de Design System, Frontend & Tipografia
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Client-Side · Etapa 25
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Acessibilidade WCAG 2.1, Conversor de Unidades CSS, Glassmorphism Cyber, Mock Cards para QA e Limpador EXIF.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('wcag-contrast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'wcag-contrast'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>WCAG 2.1</span>
          </button>
          <button
            onClick={() => setActiveTab('css-units')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'css-units'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Unidades CSS</span>
          </button>
          <button
            onClick={() => setActiveTab('glassmorphism')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'glassmorphism'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Glassmorphism</span>
          </button>
          <button
            onClick={() => setActiveTab('fake-card-qa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'fake-card-qa'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cartões QA Mock</span>
          </button>
          <button
            onClick={() => setActiveTab('exif-cleaner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'exif-cleaner'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Limpador EXIF</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: VALIDADOR DE CONTRASTE WCAG 2.1 */}
        {/* ========================================== */}
        {activeTab === 'wcag-contrast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Seletor de Cores */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Configuração de Cores
                  </div>

                  {/* Cor de Texto */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Cor do Texto (Foreground)</span>
                      <span className="font-mono text-[11px] text-cyan-400">{textColor}</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* Cor de Fundo */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Cor do Fundo (Background)</span>
                      <span className="font-mono text-[11px] text-cyan-400">{bgColor}</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* Presets Rápidos */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-2 font-mono">Paletas de Teste:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => { setTextColor('#38bdf8'); setBgColor('#020617'); }}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 transition text-left"
                      >
                        Cyber Ciano / Fundo 950
                      </button>
                      <button
                        onClick={() => { setTextColor('#ffffff'); setBgColor('#0f172a'); }}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 transition text-left"
                      >
                        Branco / Slate 900
                      </button>
                      <button
                        onClick={() => { setTextColor('#f59e0b'); setBgColor('#18181b'); }}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 transition text-left"
                      >
                        Âmbar / Dark Gray
                      </button>
                      <button
                        onClick={() => { setTextColor('#64748b'); setBgColor('#020617'); }}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 transition text-left"
                      >
                        Mudo 500 / Fundo 950
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado & Conformidade WCAG */}
              <div className="lg:col-span-7 space-y-4">
                {/* Score Principal */}
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-slate-400 uppercase">Razão de Contraste W3C</div>
                    <div className="text-4xl font-extrabold font-mono text-slate-100 mt-1 flex items-baseline gap-2">
                      <span>{ratioFormatted} : 1</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                        normalTextAAA 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : normalTextAA 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {normalTextAAA ? 'Excelente (AAA)' : normalTextAA ? 'Adequado (AA)' : 'Falhou'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-500">
                    Norma WCAG 2.1<br/>
                    Algoritmo de Luminância
                  </div>
                </div>

                {/* Tabela de Critérios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Texto Normal */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300">Texto Normal (&lt; 18pt)</div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">AA (4.5:1):</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${normalTextAA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {normalTextAA ? 'PASSA' : 'FALHA'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">AAA (7.0:1):</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${normalTextAAA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {normalTextAAA ? 'PASSA' : 'FALHA'}
                      </span>
                    </div>
                  </div>

                  {/* Texto Grande */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300">Texto Grande (≥ 18pt/bold)</div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">AA (3.0:1):</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${largeTextAA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {largeTextAA ? 'PASSA' : 'FALHA'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">AAA (4.5:1):</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${largeTextAAA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {largeTextAAA ? 'PASSA' : 'FALHA'}
                      </span>
                    </div>
                  </div>

                  {/* Componentes UI */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300">Ícones & UI Gráfica</div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">AA (3.0:1):</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${uiComponentsAA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {uiComponentsAA ? 'PASSA' : 'FALHA'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Botões, bordas e ícones essenciais.
                    </div>
                  </div>
                </div>

                {/* Preview em Tempo Real */}
                <div 
                  style={{ backgroundColor: bgColor, color: textColor }}
                  className="p-6 rounded-xl border border-slate-700/80 transition-colors duration-200 space-y-3"
                >
                  <div className="text-xl font-bold">
                    Título de Exemplo em Destaque (Heading 24px)
                  </div>
                  <p className="text-sm leading-relaxed">
                    Este é um parágrafo de amostra simulando o texto de um artigo, descrição de produto ou interface web.
                    O contraste de leitura deve ser confortável e acessível para qualquer usuário com deficiência visual.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button 
                      style={{ borderColor: textColor }}
                      className="px-4 py-1.5 rounded-lg border text-xs font-medium"
                    >
                      Botão de Ação Primário
                    </button>
                    <span className="text-xs underline cursor-pointer">Link de Navegação</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: CONVERSOR DE UNIDADES CSS & CLAMP() */}
        {/* ========================================== */}
        {activeTab === 'css-units' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles Base */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Parâmetros de Entrada
                  </div>

                  {/* Valor em Pixels */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Valor em Pixels (px)</span>
                      <span className="font-mono text-cyan-400">{pxValue}px</span>
                    </label>
                    <input
                      type="number"
                      value={pxValue}
                      onChange={(e) => setPxValue(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Base Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Base do Root HTML (1rem = X px)</span>
                      <span className="font-mono text-slate-300">{baseFontSize}px</span>
                    </label>
                    <input
                      type="number"
                      value={baseFontSize}
                      onChange={(e) => setBaseFontSize(Number(e.target.value) || 16)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Viewport Width */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Largura da Viewport para cálculo de VW</span>
                      <span className="font-mono text-slate-300">{viewportWidth}px</span>
                    </label>
                    <input
                      type="number"
                      value={viewportWidth}
                      onChange={(e) => setViewportWidth(Number(e.target.value) || 1920)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Tabela de Conversão */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* REM */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 relative group">
                    <div className="text-xs font-mono text-slate-400">rem (Root Em)</div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{remValue}rem</div>
                    <button
                      onClick={() => copyToClipboard(`${remValue}rem`, 'rem')}
                      className="absolute top-3 right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'rem' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* EM */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 relative group">
                    <div className="text-xs font-mono text-slate-400">em (Element)</div>
                    <div className="text-xl font-bold font-mono text-slate-200 mt-1">{emValue}em</div>
                    <button
                      onClick={() => copyToClipboard(`${emValue}em`, 'em')}
                      className="absolute top-3 right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'em' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* VW */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 relative group">
                    <div className="text-xs font-mono text-slate-400">vw (Viewport Width)</div>
                    <div className="text-xl font-bold font-mono text-purple-400 mt-1">{vwValue}vw</div>
                    <button
                      onClick={() => copyToClipboard(`${vwValue}vw`, 'vw')}
                      className="absolute top-3 right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'vw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* % */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 relative group">
                    <div className="text-xs font-mono text-slate-400">% (Percentual)</div>
                    <div className="text-xl font-bold font-mono text-slate-200 mt-1">{percentValue}%</div>
                    <button
                      onClick={() => copyToClipboard(`${percentValue}%`, 'percent')}
                      className="absolute top-3 right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'percent' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* PT */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 relative group">
                    <div className="text-xs font-mono text-slate-400">pt (Pontos Impressão)</div>
                    <div className="text-xl font-bold font-mono text-slate-200 mt-1">{ptValue}pt</div>
                    <button
                      onClick={() => copyToClipboard(`${ptValue}pt`, 'pt')}
                      className="absolute top-3 right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'pt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* PX */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 relative group">
                    <div className="text-xs font-mono text-slate-400">px (Pixels)</div>
                    <div className="text-xl font-bold font-mono text-slate-200 mt-1">{pxValue}px</div>
                    <button
                      onClick={() => copyToClipboard(`${pxValue}px`, 'px')}
                      className="absolute top-3 right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'px' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Seção Tipografia Fluida clamp() */}
                <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Gerador de Tipografia Fluida CSS clamp()
                    </span>
                    <button
                      onClick={() => copyToClipboard(`font-size: ${clampFormula};`, 'clamp')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-1"
                    >
                      {copiedKey === 'clamp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar CSS
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Min Viewport (px)</label>
                      <input
                        type="number"
                        value={minVw}
                        onChange={(e) => setMinVw(Number(e.target.value) || 360)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Max Viewport (px)</label>
                      <input
                        type="number"
                        value={maxVw}
                        onChange={(e) => setMaxVw(Number(e.target.value) || 1280)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Min Font (px)</label>
                      <input
                        type="number"
                        value={minPx}
                        onChange={(e) => setMinPx(Number(e.target.value) || 16)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Max Font (px)</label>
                      <input
                        type="number"
                        value={maxPx}
                        onChange={(e) => setMaxPx(Number(e.target.value) || 32)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                    font-size: {clampFormula};
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: GERADOR DE GLASSMORPHISM & BOX-SHADOW */}
        {/* ========================================== */}
        {activeTab === 'glassmorphism' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles de Sliders */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Controles de Estilo Glass
                  </div>

                  {/* Blur */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Blur (Desfoque)</span>
                      <span className="font-mono text-cyan-400">{glassBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={glassBlur}
                      onChange={(e) => setGlassBlur(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Opacidade do Fundo */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Opacidade de Fundo</span>
                      <span className="font-mono text-cyan-400">{glassOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={glassOpacity}
                      onChange={(e) => setGlassOpacity(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Opacidade da Borda */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Opacidade da Borda</span>
                      <span className="font-mono text-cyan-400">{glassBorderOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={glassBorderOpacity}
                      onChange={(e) => setGlassBorderOpacity(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Raio da Borda */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Border Radius</span>
                      <span className="font-mono text-cyan-400">{glassBorderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={glassBorderRadius}
                      onChange={(e) => setGlassBorderRadius(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Sombra Glow Color */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs text-slate-400 block">Cor do Glow da Sombra</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShadowColorType('cyan')}
                        className={`w-7 h-7 rounded-full bg-cyan-500 border-2 ${shadowColorType === 'cyan' ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                      <button
                        onClick={() => setShadowColorType('purple')}
                        className={`w-7 h-7 rounded-full bg-purple-500 border-2 ${shadowColorType === 'purple' ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                      <button
                        onClick={() => setShadowColorType('emerald')}
                        className={`w-7 h-7 rounded-full bg-emerald-500 border-2 ${shadowColorType === 'emerald' ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                      <button
                        onClick={() => setShadowColorType('amber')}
                        className={`w-7 h-7 rounded-full bg-amber-500 border-2 ${shadowColorType === 'amber' ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                      <button
                        onClick={() => setShadowColorType('slate')}
                        className={`w-7 h-7 rounded-full bg-black border-2 ${shadowColorType === 'slate' ? 'border-white scale-110' : 'border-transparent'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview 3D & Código CSS */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visualizador do Efeito com Background Dinâmico */}
                <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-6 bg-slate-950">
                  {/* Elementos decorativos por trás do vidro para exibir o blur */}
                  <div className="absolute top-4 left-6 w-24 h-24 rounded-full bg-cyan-500/40 blur-xl pointer-events-none" />
                  <div className="absolute bottom-4 right-10 w-32 h-32 rounded-full bg-purple-600/40 blur-xl pointer-events-none" />
                  <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-emerald-500/30 blur-lg pointer-events-none" />
                  
                  {/* Card com o estilo aplicado */}
                  <div 
                    style={glassStyle}
                    className="relative z-10 w-full max-w-sm p-6 text-slate-100 transition-all duration-150"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">V5 Apollo Card</span>
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-lg font-bold">Cyber Obsidian UI</div>
                    <p className="text-xs text-slate-300 mt-1">
                      Visual moderno com profundidade espacial e alta legibilidade no escuro.
                    </p>
                  </div>
                </div>

                {/* Código CSS Exportável */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">CSS Pronto para Copiar:</span>
                    <button
                      onClick={() => copyToClipboard(generatedCss, 'css')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar CSS
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                    {generatedCss}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: GERADOR DE CARTÕES FICTÍCIOS PARA QA */}
        {/* ========================================== */}
        {activeTab === 'fake-card-qa' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles da Bandeira */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Configuração de Sandbox QA
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block">Selecione a Bandeira</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard'] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setCardBrand(b)}
                          className={`px-3 py-2 rounded-lg font-medium border text-left transition ${
                            cardBrand === b
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCard}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Gerar Novo Cartão Fictício
                  </button>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>
                      <strong>Aviso Legal & Ético:</strong> Dados 100% matemáticos fictícios (Módulo 10 Luhn) para testes de QA e checkout em ambiente Sandbox (Stripe, Pagar.me, etc). Sem valor financeiro real.
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualizador de Cartão Estilizado */}
              <div className="lg:col-span-7 space-y-4">
                {generatedCard && (
                  <div className="relative w-full max-w-md mx-auto aspect-[1.586] rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950">
                    {/* Chip e Ícone */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-200/50 shadow-inner" />
                      <div className="font-extrabold font-mono text-base tracking-wider text-cyan-400 uppercase">
                        {generatedCard.brand}
                      </div>
                    </div>

                    {/* Número do Cartão */}
                    <div className="py-2">
                      <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-slate-100 drop-shadow">
                        {generatedCard.cardNumber}
                      </div>
                    </div>

                    {/* Nome, Validade e CVV */}
                    <div className="flex items-end justify-between text-xs font-mono">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Titular QA</div>
                        <div className="font-semibold text-slate-200 uppercase">{generatedCard.holderName}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Validade</div>
                        <div className="font-semibold text-slate-200">{generatedCard.expiryDate}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">CVV</div>
                        <div className="font-semibold text-cyan-300">{generatedCard.cvv}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Copiadores Rápidos */}
                {generatedCard && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedCard.cardNumber.replace(/\s+/g, ''), 'num')}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === 'num' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Número
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedCard.expiryDate, 'exp')}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === 'exp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Validade
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedCard.cvv, 'cvv')}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === 'cvv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar CVV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: INSPETOR & LIMPADOR EXIF DE IMAGENS */}
        {/* ========================================== */}
        {activeTab === 'exif-cleaner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upload e Ações */}
              <div className="lg:col-span-5 space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl bg-slate-950/60 cursor-pointer flex flex-col items-center justify-center text-center transition group"
                >
                  <FileImage className="w-10 h-10 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-slate-200">Clique para carregar foto</span>
                  <span className="text-[11px] text-slate-500 mt-1">JPEG, PNG ou WebP com metadados</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleExifImageUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {cleaningStatus && (
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{cleaningStatus}</span>
                  </div>
                )}
              </div>

              {/* Resultado do Diagnóstico & Download Limpo */}
              <div className="lg:col-span-7 space-y-4">
                {exifResult ? (
                  <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-100">{exifResult.fileName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {exifResult.width} x {exifResult.height}px · {exifResult.fileSize}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% Higienizado
                      </span>
                    </div>

                    {/* Alertas de Metadados Detectados */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Coordenadas GPS de Localização:</span>
                        <span className="font-mono text-emerald-400 font-bold">REMOVIDAS</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Modelo da Câmera & Dispositivo:</span>
                        <span className="font-mono text-emerald-400 font-bold">REMOVIDO</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Data e Hora de Captura Original:</span>
                        <span className="font-mono text-emerald-400 font-bold">REMOVIDA</span>
                      </div>
                    </div>

                    {/* Botão de Download */}
                    <a
                      href={exifResult.cleanDataUrl}
                      download={`v5_clean_${exifResult.fileName}`}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Baixar Imagem Higienizada (Zero Metadados)
                    </a>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                    Carregue uma fotografia para inspecionar e remover metadados de câmera e GPS.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
