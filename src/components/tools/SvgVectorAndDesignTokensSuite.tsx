'use client';

import { sanitizeSvg } from '@/lib/utils/svgSanitizer';

import React, { useState, useMemo } from 'react';
import { 
  FileCode2, 
  Palette, 
  Eye, 
  Type, 
  Activity, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sliders, 
  Zap, 
  Play, 
  RotateCcw, 
  Layers, 
  Maximize2,
  Minimize2,
  Code2,
  ArrowRight
} from 'lucide-react';

interface SvgVectorAndDesignTokensSuiteProps {
  defaultTab?: 'svg-optimizer' | 'design-tokens' | 'apca-contrast' | 'fluid-clamp' | 'bezier-easing';
}

export const SvgVectorAndDesignTokensSuite: React.FC<SvgVectorAndDesignTokensSuiteProps> = ({ 
  defaultTab = 'svg-optimizer' 
}) => {
  const [activeTab, setActiveTab] = useState<'svg-optimizer' | 'design-tokens' | 'apca-contrast' | 'fluid-clamp' | 'bezier-easing'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: OTIMIZADOR & MINIFICADOR DE SVG
  // ==========================================
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Generator: Adobe Illustrator 28.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>V5 Apollo Emblem</dc:title>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g id="Camada_1" data-name="ApolloLayer">
    <circle id="bg-circle" cx="50.000000" cy="50.000000" r="42.500000" fill="url(#grad1)" stroke="#020617" stroke-width="3.000000" />
    <path id="rocket-fin" d="M 50.000000 20.000000 L 65.543210 70.123456 L 34.456789 70.123456 Z" fill="#ffffff" />
    <polygon id="thruster" points="45.000000,72.000000 55.000000,72.000000 50.000000,85.000000" fill="#f59e0b" />
  </g>
</svg>`;

  const [inputSvg, setInputSvg] = useState<string>(sampleSvg);
  const [decimalPrecision, setDecimalPrecision] = useState<number>(2);
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [removeEditorData, setRemoveEditorData] = useState<boolean>(true);

  const optimizedSvgResult = useMemo(() => {
    let result = inputSvg;

    // 1. Remover comentários
    if (removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 2. Remover <metadata>
    if (removeMetadata) {
      result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
      result = result.replace(/<\?xml[\s\S]*?\?>/gi, '');
      result = result.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    }

    // 3. Remover atributos de editores e versões redundantes
    if (removeEditorData) {
      result = result.replace(/\s*(data-name|data-original|inkscape:[a-z]+|sodipodi:[a-z]+|xmlns:xlink)="[^"]*"/gi, '');
      result = result.replace(/\s*version="1\.1"/gi, '');
      result = result.replace(/\s*id="(Camada_[0-9]+|Layer_[0-9]+|svg[0-9]+)"/gi, '');
    }

    // 4. Arredondar números decimais longos
    result = result.replace(/(\d+\.\d{3,})/g, (match) => {
      const num = parseFloat(match);
      return isNaN(num) ? match : num.toFixed(decimalPrecision);
    });

    // 5. Minificar espaços e quebras
    result = result
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const originalBytes = new Blob([inputSvg]).size;
    const optimizedBytes = new Blob([result]).size;
    const savedBytes = Math.max(0, originalBytes - optimizedBytes);
    const savedPercent = originalBytes > 0 ? (savedBytes / originalBytes) * 100 : 0;

    return {
      code: result,
      originalBytes,
      optimizedBytes,
      savedBytes,
      savedPercent: savedPercent.toFixed(1)
    };
  }, [inputSvg, decimalPrecision, removeComments, removeMetadata, removeEditorData]);

  // ==========================================
  // FERRAMENTA 2: GERADOR DE DESIGN TOKENS (W3C / TAILWIND V4)
  // ==========================================
  const [tokenFormat, setTokenFormat] = useState<'css-variables' | 'tailwind-v4' | 'w3c-json' | 'typescript'>('tailwind-v4');
  const [colorBrandPrimary, setColorBrandPrimary] = useState<string>('#06b6d4'); // Cyan
  const [colorBrandAccent, setColorBrandAccent] = useState<string>('#8b5cf6'); // Violet
  const [colorBrandDark, setColorBrandDark] = useState<string>('#020617'); // Slate 950
  const [colorBrandSurface, setColorBrandSurface] = useState<string>('#0f172a'); // Slate 900
  const [borderRadiusBase, setBorderRadiusBase] = useState<string>('0.75rem'); // 12px
  const [fontFamilySans, setFontFamilySans] = useState<string>("'Inter', sans-serif");

  const generatedDesignTokens = useMemo(() => {
    if (tokenFormat === 'css-variables') {
      return `:root {
  /* Cores Globais da Marca */
  --color-primary: ${colorBrandPrimary};
  --color-accent: ${colorBrandAccent};
  --color-surface-dark: ${colorBrandDark};
  --color-surface-card: ${colorBrandSurface};

  /* Tipografia & Formas */
  --font-family-sans: ${fontFamilySans};
  --radius-base: ${borderRadiusBase};
  --radius-lg: calc(${borderRadiusBase} * 1.5);
}`;
    } else if (tokenFormat === 'tailwind-v4') {
      return `@theme {
  /* Tailwind CSS v4 Modern Theme Configuration */
  --color-brand-primary: ${colorBrandPrimary};
  --color-brand-accent: ${colorBrandAccent};
  --color-surface-canvas: ${colorBrandDark};
  --color-surface-panel: ${colorBrandSurface};

  --font-sans: ${fontFamilySans};
  --radius-panel: ${borderRadiusBase};
}`;
    } else if (tokenFormat === 'w3c-json') {
      return JSON.stringify({
        $schema: "https://design-tokens.github.io/community-group/format/v1/schema.json",
        color: {
          brand: {
            primary: { $value: colorBrandPrimary, $type: "color" },
            accent: { $value: colorBrandAccent, $type: "color" }
          },
          surface: {
            canvas: { $value: colorBrandDark, $type: "color" },
            panel: { $value: colorBrandSurface, $type: "color" }
          }
        },
        typography: {
          fontFamily: {
            sans: { $value: fontFamilySans, $type: "fontFamily" }
          }
        },
        dimension: {
          radius: {
            base: { $value: borderRadiusBase, $type: "dimension" }
          }
        }
      }, null, 2);
    } else {
      // TypeScript
      return `export const DESIGN_TOKENS = {
  colors: {
    primary: '${colorBrandPrimary}',
    accent: '${colorBrandAccent}',
    surfaceCanvas: '${colorBrandDark}',
    surfacePanel: '${colorBrandSurface}',
  },
  typography: {
    fontFamilySans: "${fontFamilySans}",
  },
  borders: {
    radiusBase: '${borderRadiusBase}',
  }
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;`;
    }
  }, [tokenFormat, colorBrandPrimary, colorBrandAccent, colorBrandDark, colorBrandSurface, borderRadiusBase, fontFamilySans]);

  // ==========================================
  // FERRAMENTA 3: CALCULADORA DE CONTRASTE APCA & WCAG 2.1
  // ==========================================
  const [fgColor, setFgColor] = useState<string>('#06b6d4'); // Cyan
  const [bgColor, setBgColor] = useState<string>('#020617'); // Slate 950

  const contrastCalculations = useMemo(() => {
    // Conversor Hex -> RGB
    const hexToRgb = (hex: string) => {
      const clean = hex.replace('#', '');
      if (clean.length === 3) {
        return {
          r: parseInt(clean[0] + clean[0], 16),
          g: parseInt(clean[1] + clean[1], 16),
          b: parseInt(clean[2] + clean[2], 16)
        };
      }
      return {
        r: parseInt(clean.substring(0, 2), 16) || 0,
        g: parseInt(clean.substring(2, 4), 16) || 0,
        b: parseInt(clean.substring(4, 6), 16) || 0
      };
    };

    const rgbFg = hexToRgb(fgColor);
    const rgbBg = hexToRgb(bgColor);

    // Luminância Relativa WCAG 2.1
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const lumFg = getLuminance(rgbFg.r, rgbFg.g, rgbFg.b);
    const lumBg = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);

    const brighter = Math.max(lumFg, lumBg);
    const darker = Math.min(lumFg, lumBg);
    const wcagRatio = (brighter + 0.05) / (darker + 0.05);

    // Validações WCAG
    const passAaNormal = wcagRatio >= 4.5;
    const passAaLarge = wcagRatio >= 3.0;
    const passAaaNormal = wcagRatio >= 7.0;
    const passAaaLarge = wcagRatio >= 4.5;

    // Cálculo Simplificado APCA Lc (Lightness Contrast)
    // APCA usa expoentes não lineares de acordo com fundo escuro vs claro
    const yFg = Math.pow(rgbFg.r / 255, 2.4) * 0.2126729 + Math.pow(rgbFg.g / 255, 2.4) * 0.7151522 + Math.pow(rgbFg.b / 255, 2.4) * 0.0721750;
    const yBg = Math.pow(rgbBg.r / 255, 2.4) * 0.2126729 + Math.pow(rgbBg.g / 255, 2.4) * 0.7151522 + Math.pow(rgbBg.b / 255, 2.4) * 0.0721750;

    let apcaLc = 0;
    if (yBg > yFg) {
      // Fundo claro, texto escuro
      apcaLc = (Math.pow(yBg, 0.56) - Math.pow(yFg, 0.57)) * 1.14 * 100;
    } else {
      // Fundo escuro, texto claro
      apcaLc = (Math.pow(yFg, 0.62) - Math.pow(yBg, 0.65)) * 1.14 * 100;
    }

    const absLc = Math.abs(apcaLc);
    let apcaRating = 'Inadequado para texto';
    if (absLc >= 75) {
      apcaRating = 'Excelente para Texto Corrido (Body Text)';
    } else if (absLc >= 60) {
      apcaRating = 'Bom para Texto Médio (18px+)';
    } else if (absLc >= 45) {
      apcaRating = 'Aprovado para Títulos Grandes (Bold 24px+)';
    } else if (absLc >= 30) {
      apcaRating = 'Apenas para Elementos Visuais Decorativos';
    }

    return {
      wcagRatio: wcagRatio.toFixed(2),
      passAaNormal,
      passAaLarge,
      passAaaNormal,
      passAaaLarge,
      apcaLc: apcaLc.toFixed(1),
      apcaRating
    };
  }, [fgColor, bgColor]);

  // ==========================================
  // FERRAMENTA 4: CALCULADORA DE TIPOGRAFIA FLUIDA CLAMP()
  // ==========================================
  const [minFontSizeRem, setMinFontSizeRem] = useState<number>(1.125); // 18px
  const [maxFontSizeRem, setMaxFontSizeRem] = useState<number>(2.5); // 40px
  const [minViewportPx, setMinViewportPx] = useState<number>(375); // Mobile (iPhone)
  const [maxViewportPx, setMaxViewportPx] = useState<number>(1280); // Desktop

  const fluidClampResult = useMemo(() => {
    const minFontPx = minFontSizeRem * 16;
    const maxFontPx = maxFontSizeRem * 16;

    // Fórmula canônica:
    // slope = (maxFontSize - minFontSize) / (maxViewport - minViewport)
    // yAxisIntersection = -minViewport * slope + minFontSize
    const slope = (maxFontPx - minFontPx) / (maxViewportPx - minViewportPx);
    const yAxisIntersectionRem = (-minViewportPx * slope + minFontPx) / 16;
    const slopeVw = slope * 100;

    const clampCss = `font-size: clamp(${minFontSizeRem}rem, ${yAxisIntersectionRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxFontSizeRem}rem);`;

    return {
      clampCss,
      minFontPx: Math.round(minFontPx),
      maxFontPx: Math.round(maxFontPx),
      slopeVw: slopeVw.toFixed(2),
      yIntersection: yAxisIntersectionRem.toFixed(2)
    };
  }, [minFontSizeRem, maxFontSizeRem, minViewportPx, maxViewportPx]);

  // ==========================================
  // FERRAMENTA 5: VISUALIZADOR DE CUBIC BÉZIER
  // ==========================================
  const [x1, setX1] = useState<number>(0.25);
  const [y1, setY1] = useState<number>(0.10);
  const [x2, setX2] = useState<number>(0.25);
  const [y2, setY2] = useState<number>(1.00);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const bezierCss = useMemo(() => {
    return `cubic-bezier(${x1.toFixed(2)}, ${y1.toFixed(2)}, ${x2.toFixed(2)}, ${y2.toFixed(2)})`;
  }, [x1, y1, x2, y2]);

  const setBezierPreset = (preset: 'ease' | 'ease-in-out' | 'spring' | 'material' | 'linear') => {
    if (preset === 'ease') {
      setX1(0.25); setY1(0.10); setX2(0.25); setY2(1.00);
    } else if (preset === 'ease-in-out') {
      setX1(0.42); setY1(0.00); setX2(0.58); setY2(1.00);
    } else if (preset === 'spring') {
      setX1(0.68); setY1(-0.55); setX2(0.26); setY2(1.55);
    } else if (preset === 'material') {
      setX1(0.20); setY1(0.00); setX2(0.00); setY2(1.00);
    } else if (preset === 'linear') {
      setX1(0.00); setY1(0.00); setX2(1.00); setY2(1.00);
    }
  };

  const triggerAnimation = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HEADER DA SUÍTE */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 rounded-lg border border-cyan-500/30">
              <Palette className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Otimização Vetorial SVG, Design Tokens & CSS Moderno
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  Etapa 59
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Minificador de SVG, design tokens W3C/Tailwind v4, contraste APCA, tipografia clamp() e curvas Cubic Bézier.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('svg-optimizer')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'svg-optimizer'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            Otimizador SVG
          </button>
          <button
            onClick={() => setActiveTab('design-tokens')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'design-tokens'
                ? 'bg-violet-500 text-slate-950 shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Design Tokens
          </button>
          <button
            onClick={() => setActiveTab('apca-contrast')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'apca-contrast'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Contraste APCA / WCAG
          </button>
          <button
            onClick={() => setActiveTab('fluid-clamp')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'fluid-clamp'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Tipografia clamp()
          </button>
          <button
            onClick={() => setActiveTab('bezier-easing')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'bezier-easing'
                ? 'bg-fuchsia-500 text-slate-950 shadow-md shadow-fuchsia-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Cubic Bézier
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ========================================================= */}
        {/* TAB 1: OTIMIZADOR & MINIFICADOR DE SVG                    */}
        {/* ========================================================= */}
        {activeTab === 'svg-optimizer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ENTRADA DO SVG */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4" /> Código SVG Original
                  </h3>
                  <button
                    onClick={() => setInputSvg(sampleSvg)}
                    className="text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                  >
                    Restaurar Exemplo
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={inputSvg}
                  onChange={(e) => setInputSvg(e.target.value)}
                  placeholder="Cole aqui seu código <svg>...</svg>"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />

                {/* OPÇÕES DE OTIMIZAÇÃO */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Parâmetros de Otimização:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeComments}
                        onChange={(e) => setRemoveComments(e.target.checked)}
                        className="accent-cyan-500"
                      />
                      Remover Comentários
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeMetadata}
                        onChange={(e) => setRemoveMetadata(e.target.checked)}
                        className="accent-cyan-500"
                      />
                      Remover &lt;metadata&gt;
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeEditorData}
                        onChange={(e) => setRemoveEditorData(e.target.checked)}
                        className="accent-cyan-500"
                      />
                      Limpar Tags de Editores
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Casas Decimais:</span>
                      <select
                        value={decimalPrecision}
                        onChange={(e) => setDecimalPrecision(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                      >
                        <option value={1}>1 casa</option>
                        <option value={2}>2 casas</option>
                        <option value={3}>3 casas</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAÍDA E PREVIEW */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Resultado Otimizado (-{optimizedSvgResult.savedPercent}%)
                    </span>
                    <button
                      onClick={() => copyToClipboard(optimizedSvgResult.code, 'svg-code')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      {copiedKey === 'svg-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar SVG
                    </button>
                  </div>

                  {/* ESTATÍSTICAS DE PESO */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Original</span>
                      <span className="text-xs font-bold text-slate-300">{optimizedSvgResult.originalBytes} B</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Otimizado</span>
                      <span className="text-xs font-bold text-cyan-400">{optimizedSvgResult.optimizedBytes} B</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Economia</span>
                      <span className="text-xs font-bold text-emerald-400">{optimizedSvgResult.savedPercent}%</span>
                    </div>
                  </div>

                  {/* PREVIEW VISUAL */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-center min-h-[140px] mb-3">
                    <div 
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(optimizedSvgResult.code) }} 
                      className="flex items-center justify-center max-h-[120px] max-w-[120px]"
                    />
                  </div>

                  {/* CÓDIGO MINIFICADO */}
                  <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-[120px]">
                    {optimizedSvgResult.code}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GERADOR DE DESIGN TOKENS (W3C / TAILWIND V4)       */}
        {/* ========================================================= */}
        {activeTab === 'design-tokens' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONFIGURAÇÃO DA PALETA E TOKENS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Variáveis da Identidade Visual
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Cor Primária:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorBrandPrimary}
                        onChange={(e) => setColorBrandPrimary(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorBrandPrimary}
                        onChange={(e) => setColorBrandPrimary(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Cor de Destaque (Accent):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorBrandAccent}
                        onChange={(e) => setColorBrandAccent(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorBrandAccent}
                        onChange={(e) => setColorBrandAccent(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Canvas / Fundo:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorBrandDark}
                        onChange={(e) => setColorBrandDark(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorBrandDark}
                        onChange={(e) => setColorBrandDark(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Superfície / Painel:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorBrandSurface}
                        onChange={(e) => setColorBrandSurface(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorBrandSurface}
                        onChange={(e) => setColorBrandSurface(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Raio de Borda Base:</label>
                    <input
                      type="text"
                      value={borderRadiusBase}
                      onChange={(e) => setBorderRadiusBase(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Fonte Sans:</label>
                    <input
                      type="text"
                      value={fontFamilySans}
                      onChange={(e) => setFontFamilySans(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* EXPORTAÇÃO EM MÚLTIPLOS FORMATOS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setTokenFormat('tailwind-v4')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          tokenFormat === 'tailwind-v4' ? 'bg-violet-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tailwind v4 (@theme)
                      </button>
                      <button
                        onClick={() => setTokenFormat('css-variables')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          tokenFormat === 'css-variables' ? 'bg-violet-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        CSS :root
                      </button>
                      <button
                        onClick={() => setTokenFormat('w3c-json')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          tokenFormat === 'w3c-json' ? 'bg-violet-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        W3C DTCG
                      </button>
                      <button
                        onClick={() => setTokenFormat('typescript')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          tokenFormat === 'typescript' ? 'bg-violet-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        TypeScript
                      </button>
                    </div>

                    <button
                      onClick={() => copyToClipboard(generatedDesignTokens, 'tokens-code')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      {copiedKey === 'tokens-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Tokens
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-violet-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-[360px]">
                    {generatedDesignTokens}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CALCULADORA DE CONTRASTE APCA & WCAG 2.1           */}
        {/* ========================================================= */}
        {activeTab === 'apca-contrast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONTROLES DE CORES */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Seleção de Cores em Teste
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Cor do Texto (Foreground):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Cor do Fundo (Background):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* PRESETS RÁPIDOS */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1.5">Presets Rápidos de Teste:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setFgColor('#06b6d4'); setBgColor('#020617'); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Ciano no Obsidian
                    </button>
                    <button
                      onClick={() => { setFgColor('#ffffff'); setBgColor('#020617'); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Branco no Preto (Max)
                    </button>
                    <button
                      onClick={() => { setFgColor('#64748b'); setBgColor('#020617'); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Slate 500 (Risco AA)
                    </button>
                    <button
                      onClick={() => { setFgColor('#0f172a'); setBgColor('#ffffff'); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Dark no Branco
                    </button>
                  </div>
                </div>

                {/* PREVIEW AO VIVO */}
                <div 
                  style={{ backgroundColor: bgColor, color: fgColor }}
                  className="p-5 rounded-xl border border-slate-800 space-y-2 transition-all"
                >
                  <h4 className="text-lg font-bold">Título de Demonstração (Bold 18px+)</h4>
                  <p className="text-sm">
                    Este é um exemplo de parágrafo corrido para validar a legibilidade percebida pelo olho humano tanto no padrão clássico WCAG 2.1 quanto no algoritmo perceptual moderno APCA.
                  </p>
                </div>
              </div>

              {/* RESULTADOS DE APROVAÇÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                    Contraste WCAG 2.1 Clássico
                  </span>
                  <div className="flex items-baseline gap-3 mb-3">
                    <div className="text-4xl font-extrabold text-white">
                      {contrastCalculations.wcagRatio} <span className="text-xl font-normal text-slate-500">: 1</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded border flex items-center justify-between ${
                      contrastCalculations.passAaNormal ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-rose-950/40 border-rose-800 text-rose-400'
                    }`}>
                      <span>AA Normal (4.5:1)</span>
                      {contrastCalculations.passAaNormal ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className={`p-2 rounded border flex items-center justify-between ${
                      contrastCalculations.passAaLarge ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-rose-950/40 border-rose-800 text-rose-400'
                    }`}>
                      <span>AA Grande (3.0:1)</span>
                      {contrastCalculations.passAaLarge ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className={`p-2 rounded border flex items-center justify-between ${
                      contrastCalculations.passAaaNormal ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-rose-950/40 border-rose-800 text-rose-400'
                    }`}>
                      <span>AAA Normal (7.0:1)</span>
                      {contrastCalculations.passAaaNormal ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className={`p-2 rounded border flex items-center justify-between ${
                      contrastCalculations.passAaaLarge ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-rose-950/40 border-rose-800 text-rose-400'
                    }`}>
                      <span>AAA Grande (4.5:1)</span>
                      {contrastCalculations.passAaaLarge ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                    Algoritmo Perceptivo APCA (WCAG 3.0 Draft)
                  </span>
                  <div className="flex items-baseline gap-3 mb-2">
                    <div className="text-3xl font-extrabold text-cyan-400">
                      Lc {contrastCalculations.apcaLc}
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{contrastCalculations.apcaRating}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O APCA leva em conta o peso da fonte (font-weight), tamanho em pixels e a sensibilidade do olho humano à radiação espectral do fundo escuro vs claro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CALCULADORA DE TIPOGRAFIA FLUIDA CLAMP()            */}
        {/* ========================================================= */}
        {activeTab === 'fluid-clamp' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ENTRADAS DA FÓRMULA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Parâmetros de Escala Tipográfica
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Tamanho Mínimo (rem):</label>
                    <input
                      type="number"
                      step={0.125}
                      value={minFontSizeRem}
                      onChange={(e) => setMinFontSizeRem(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <span className="text-[10px] text-slate-500">{fluidClampResult.minFontPx}px em base 16px</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Tamanho Máximo (rem):</label>
                    <input
                      type="number"
                      step={0.125}
                      value={maxFontSizeRem}
                      onChange={(e) => setMaxFontSizeRem(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <span className="text-[10px] text-slate-500">{fluidClampResult.maxFontPx}px em base 16px</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Viewport Mínimo (px):</label>
                    <input
                      type="number"
                      step={10}
                      value={minViewportPx}
                      onChange={(e) => setMinViewportPx(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <span className="text-[10px] text-slate-500">Mobile Breakpoint</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Viewport Máximo (px):</label>
                    <input
                      type="number"
                      step={20}
                      value={maxViewportPx}
                      onChange={(e) => setMaxViewportPx(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <span className="text-[10px] text-slate-500">Desktop Breakpoint</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                  A tipografia fluida interpola perfeitamente o tamanho da fonte proporcionalmente à largura da tela do usuário, eliminando múltiplos media queries como <code>@media (min-width: 768px)</code>.
                </div>
              </div>

              {/* SAÍDA CSS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-amber-400" /> Declaração CSS clamp()
                    </span>
                    <button
                      onClick={() => copyToClipboard(fluidClampResult.clampCss, 'clamp-css')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      {copiedKey === 'clamp-css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar CSS
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-amber-300 font-mono whitespace-pre-wrap overflow-x-auto mb-4">
                    {fluidClampResult.clampCss}
                  </pre>

                  {/* PREVIEW DINÂMICO */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[11px] text-slate-500 block mb-2">Texto com Estilo Aplicado:</span>
                    <p 
                      style={{ fontSize: `clamp(${minFontSizeRem}rem, ${fluidClampResult.yIntersection}rem + ${fluidClampResult.slopeVw}vw, ${maxFontSizeRem}rem)` }}
                      className="font-bold text-white leading-tight"
                    >
                      Título Fluido Apollo 5
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: VISUALIZADOR DE CUBIC BÉZIER                       */}
        {/* ========================================================= */}
        {activeTab === 'bezier-easing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONTROLES DA CURVA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-fuchsia-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Pontos de Controle (x1, y1, x2, y2)
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBezierPreset('ease')}
                      className="px-2 py-0.5 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Ease
                    </button>
                    <button
                      onClick={() => setBezierPreset('spring')}
                      className="px-2 py-0.5 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Spring
                    </button>
                    <button
                      onClick={() => setBezierPreset('material')}
                      className="px-2 py-0.5 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      Material
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">X1 ({x1.toFixed(2)}):</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={x1}
                      onChange={(e) => setX1(Number(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Y1 ({y1.toFixed(2)}):</label>
                    <input
                      type="range"
                      min={-1}
                      max={2}
                      step={0.05}
                      value={y1}
                      onChange={(e) => setY1(Number(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">X2 ({x2.toFixed(2)}):</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={x2}
                      onChange={(e) => setX2(Number(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Y2 ({y2.toFixed(2)}):</label>
                    <input
                      type="range"
                      min={-1}
                      max={2}
                      step={0.05}
                      value={y2}
                      onChange={(e) => setY2(Number(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>
                </div>

                {/* CSS OUTPUT */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <code className="text-xs text-fuchsia-300 font-mono">
                    transition-timing-function: {bezierCss};
                  </code>
                  <button
                    onClick={() => copyToClipboard(`transition-timing-function: ${bezierCss};`, 'bezier-code')}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'bezier-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* PREVIEW DA ANIMAÇÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Play className="w-4 h-4 text-fuchsia-400" /> Comparativo de Aceleração
                    </span>
                    <button
                      onClick={triggerAnimation}
                      className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Testar Animação
                    </button>
                  </div>

                  {/* PISTA DE ANIMAÇÃO */}
                  <div className="space-y-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Curva Personalizada ({bezierCss}):</span>
                      <div className="w-full bg-slate-950 h-7 rounded-lg overflow-hidden p-1 relative border border-slate-800">
                        <div
                          style={{
                            transition: isAnimating ? `transform 1.2s ${bezierCss}` : 'none',
                            transform: isAnimating ? 'translateX(calc(100% - 24px))' : 'translateX(0)'
                          }}
                          className="w-5 h-5 rounded-md bg-fuchsia-500 shadow-md shadow-fuchsia-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Linear Convencional (linear):</span>
                      <div className="w-full bg-slate-950 h-7 rounded-lg overflow-hidden p-1 relative border border-slate-800">
                        <div
                          style={{
                            transition: isAnimating ? 'transform 1.2s linear' : 'none',
                            transform: isAnimating ? 'translateX(calc(100% - 24px))' : 'translateX(0)'
                          }}
                          className="w-5 h-5 rounded-md bg-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Dica: Curvas com valores de Y &gt; 1.0 ou Y &lt; 0 geram o clássico efeito de <strong>rebote elástico (spring/overshoot)</strong> muito utilizado em micro-interações de apps nativos modernos.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
