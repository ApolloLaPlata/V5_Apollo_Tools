'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Gauge, 
  Accessibility, 
  Code2, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Smartphone, 
  Layers, 
  ArrowRight,
  Sliders,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

interface AccessibilityAndWebPerfSuiteProps {
  defaultTab?: 'wcag-checker' | 'cwv-estimator' | 'aria-builder' | 'css-specificity' | 'csp-builder';
}

export function AccessibilityAndWebPerfSuite({ defaultTab = 'wcag-checker' }: AccessibilityAndWebPerfSuiteProps) {
  const [activeTab, setActiveTab] = useState<'wcag-checker' | 'cwv-estimator' | 'aria-builder' | 'css-specificity' | 'csp-builder'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // =========================================================================
  // ABA 1: VERIFICADOR DE CONTRASTE WCAG 2.2 & TOUCH TARGET
  // =========================================================================
  const [textColor, setTextColor] = useState('#06b6d4'); // Ciano elétrico
  const [bgColor, setBgColor] = useState('#020617'); // Slate 950
  const [touchTargetWidth, setTouchTargetWidth] = useState(48);
  const [touchTargetHeight, setTouchTargetHeight] = useState(48);

  // Luminância Relativa conforme W3C WCAG 2.2
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return 0;
    const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
    const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

    const sRGB = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const getContrastRatio = (c1: string, c2: string) => {
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrastRatio = getContrastRatio(textColor, bgColor);
  const passAaNormal = contrastRatio >= 4.5;
  const passAaLarge = contrastRatio >= 3.0;
  const passAaaNormal = contrastRatio >= 7.0;
  const passAaaLarge = contrastRatio >= 4.5;

  const isTouchTargetValid = touchTargetWidth >= 44 && touchTargetHeight >= 44; // WCAG 2.2 Criterion 2.5.8 Target Size

  // =========================================================================
  // ABA 2: ESTIMADOR CORE WEB VITALS (LCP, INP, CLS)
  // =========================================================================
  const [lcpValue, setLcpValue] = useState<number>(1.8); // Segundos (<= 2.5s bom)
  const [inpValue, setInpValue] = useState<number>(120); // Milissegundos (<= 200ms bom)
  const [clsValue, setClsValue] = useState<number>(0.04); // Score (<= 0.1 bom)

  const getLcpStatus = (val: number) => {
    if (val <= 2.5) return { status: 'Bom', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800' };
    if (val <= 4.0) return { status: 'Precisa de Melhorias', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800' };
    return { status: 'Ruim', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
  };

  const getInpStatus = (val: number) => {
    if (val <= 200) return { status: 'Bom', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800' };
    if (val <= 500) return { status: 'Precisa de Melhorias', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800' };
    return { status: 'Ruim', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
  };

  const getClsStatus = (val: number) => {
    if (val <= 0.1) return { status: 'Bom', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800' };
    if (val <= 0.25) return { status: 'Precisa de Melhorias', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800' };
    return { status: 'Ruim', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
  };

  // Score de Performance Estimado Lighthouse (0-100)
  const calculateLighthouseScore = () => {
    let score = 100;
    // Penalidades proporcionais
    if (lcpValue > 2.5) score -= Math.min(35, ((lcpValue - 2.5) / 2.5) * 35);
    if (inpValue > 200) score -= Math.min(35, ((inpValue - 200) / 400) * 35);
    if (clsValue > 0.1) score -= Math.min(30, ((clsValue - 0.1) / 0.2) * 30);
    return Math.max(0, Math.round(score));
  };

  const overallPerfScore = calculateLighthouseScore();

  // =========================================================================
  // ABA 3: CONSTRUTOR DE ATRIBUTOS WAI-ARIA 1.2
  // =========================================================================
  const [ariaPattern, setAriaPattern] = useState<'modal' | 'accordion' | 'alert' | 'tabs' | 'menu'>('modal');
  const [componentId, setComponentId] = useState('dialog-login');
  const [componentLabel, setComponentLabel] = useState('Acessar Conta');
  const [isExpanded, setIsExpanded] = useState(false);

  const getAriaSnippet = () => {
    if (ariaPattern === 'modal') {
      return `<!-- Padrão WAI-ARIA: Modal Dialog -->
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="${componentId}-title"
  aria-describedby="${componentId}-desc"
  className="modal-container"
>
  <h2 id="${componentId}-title">${componentLabel}</h2>
  <p id="${componentId}-desc">Preencha seus dados para entrar com segurança.</p>
  
  <button aria-label="Fechar janela modal" onClick={closeModal}>
    ✕
  </button>
</div>`;
    }
    if (ariaPattern === 'accordion') {
      return `<!-- Padrão WAI-ARIA: Accordion / Collapse -->
<button
  type="button"
  aria-expanded="${isExpanded}"
  aria-controls="${componentId}-panel"
  id="${componentId}-header"
  className="accordion-trigger"
>
  ${componentLabel}
</button>

<div
  id="${componentId}-panel"
  role="region"
  aria-labelledby="${componentId}-header"
  hidden={!${isExpanded}}
  className="accordion-content"
>
  <p>Conteúdo expansível acessível por leitores de tela.</p>
</div>`;
    }
    if (ariaPattern === 'alert') {
      return `<!-- Padrão WAI-ARIA: Live Region Alert -->
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  className="toast-notification"
>
  <strong>Aviso:</strong> ${componentLabel}
</div>`;
    }
    if (ariaPattern === 'tabs') {
      return `<!-- Padrão WAI-ARIA: Tablist / Navegação por Abas -->
<div role="tablist" aria-label="Seletor de Ferramentas">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="${componentId}-panel-1"
    id="${componentId}-tab-1"
    tabIndex={0}
  >
    ${componentLabel}
  </button>
</div>

<div
  role="tabpanel"
  id="${componentId}-panel-1"
  aria-labelledby="${componentId}-tab-1"
  tabIndex={0}
>
  Painel de conteúdo da aba ativa.
</div>`;
    }
    return `<!-- Padrão WAI-ARIA: Menu Dropdown -->
<button
  aria-haspopup="true"
  aria-expanded="${isExpanded}"
  id="${componentId}-button"
>
  ${componentLabel}
</button>

<ul
  role="menu"
  aria-labelledby="${componentId}-button"
  hidden={!${isExpanded}}
>
  <li role="menuitem" tabIndex={-1}>Opção 1</li>
  <li role="menuitem" tabIndex={-1}>Opção 2</li>
</ul>`;
  };

  // =========================================================================
  // ABA 4: CALCULADORA DE ESPECIFICIDADE CSS
  // =========================================================================
  const [selectorA, setSelectorA] = useState('#app-header .nav-item.active > a:hover');
  const [selectorB, setSelectorB] = useState('header ul.menu li a.highlight');

  const calculateSpecificity = (sel: string) => {
    let ids = 0;
    let classes = 0;
    let elements = 0;

    const trimmed = sel.trim();
    if (!trimmed) return { ids: 0, classes: 0, elements: 0, score: '0,0,0' };

    // Regex aproximado para contar especificidade
    // IDs: #id
    const idMatches = trimmed.match(/#[a-zA-Z0-9_-]+/g);
    ids = idMatches ? idMatches.length : 0;

    // Classes (.class), atributos ([attr]), pseudo-classes (:hover, :focus, etc exceto :not)
    const cleanForClasses = trimmed.replace(/:not\([^)]*\)/g, '');
    const classMatches = cleanForClasses.match(/\.[a-zA-Z0-9_-]+/g);
    const attrMatches = cleanForClasses.match(/\[[^\]]+\]/g);
    const pseudoClassMatches = cleanForClasses.match(/:[a-zA-Z0-9_-]+/g);
    
    // Filtra pseudo-elementos duplos (::before, ::after)
    const pseudoElements = cleanForClasses.match(/::[a-zA-Z0-9_-]+/g);
    const pseudoElCount = pseudoElements ? pseudoElements.length : 0;
    const pseudoClassesCount = (pseudoClassMatches ? pseudoClassMatches.length : 0) - pseudoElCount;

    classes = (classMatches ? classMatches.length : 0) + (attrMatches ? attrMatches.length : 0) + Math.max(0, pseudoClassesCount);

    // Elementos (div, a, span)
    const tokens = trimmed
      .replace(/#[a-zA-Z0-9_-]+/g, '')
      .replace(/\.[a-zA-Z0-9_-]+/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/::?[a-zA-Z0-9_-]+/g, '')
      .replace(/[>+~*]/g, ' ')
      .split(/\s+/)
      .filter(t => t.trim().length > 0 && /^[a-zA-Z][a-zA-Z0-9]*$/.test(t));

    elements = tokens.length + pseudoElCount;

    return {
      ids,
      classes,
      elements,
      score: `(${ids}, ${classes}, ${elements})`,
      numericValue: ids * 100 + classes * 10 + elements
    };
  };

  const specA = calculateSpecificity(selectorA);
  const specB = calculateSpecificity(selectorB);

  // =========================================================================
  // ABA 5: GERADOR DE CSP (CONTENT SECURITY POLICY)
  // =========================================================================
  const [cspScriptSrc, setCspScriptSrc] = useState("'self' https://cdn.jsdelivr.net");
  const [cspStyleSrc, setCspStyleSrc] = useState("'self' 'unsafe-inline' https://fonts.googleapis.com");
  const [cspImgSrc, setCspImgSrc] = useState("'self' data: https: blob:");
  const [cspConnectSrc, setCspConnectSrc] = useState("'self' https://sitesviniciusmiranda--apollo-api.modal.run");
  const [cspFrameAncestors, setCspFrameAncestors] = useState("'none'");
  const [includeHsts, setIncludeHsts] = useState(true);

  const getCspDirectivesString = () => {
    return `default-src 'self'; script-src ${cspScriptSrc}; style-src ${cspStyleSrc}; img-src ${cspImgSrc}; connect-src ${cspConnectSrc}; frame-ancestors ${cspFrameAncestors}; object-src 'none'; base-uri 'self'; form-action 'self';`;
  };

  const getNginxSecuritySnippet = () => {
    return `# Nginx Security Headers (Capitania #11 Apollo)
add_header Content-Security-Policy "${getCspDirectivesString()}" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
${includeHsts ? 'add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;' : ''}
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`;
  };

  const getNextJsConfigHeaders = () => {
    return `// next.config.js - Security Headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "${getCspDirectivesString().replace(/"/g, '\\"')}",
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ${includeHsts ? "{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }," : ''}
];

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};`;
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Accessibility className="w-4 h-4" />
            <span>Capitania #11 · Suíte de Acessibilidade & Performance Web</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Acessibilidade WCAG 2.2 & Core Web Vitals
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              W3C & Google Search
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auditoria de contraste WCAG 2.2 AA/AAA, estimador de Core Web Vitals (LCP, INP, CLS), construtor WAI-ARIA, calculadora de especificidade CSS e gerador CSP.
          </p>
        </div>

        {/* Status / Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Lighthouse & WAI-ARIA 1.2</span>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('wcag-checker')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'wcag-checker'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>WCAG 2.2 & Touch Target</span>
        </button>

        <button
          onClick={() => setActiveTab('cwv-estimator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'cwv-estimator'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Core Web Vitals (LCP/INP/CLS)</span>
        </button>

        <button
          onClick={() => setActiveTab('aria-builder')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'aria-builder'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Construtor WAI-ARIA</span>
        </button>

        <button
          onClick={() => setActiveTab('css-specificity')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'css-specificity'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Especificidade CSS</span>
        </button>

        <button
          onClick={() => setActiveTab('csp-builder')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'csp-builder'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CSP & Security Headers</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pt-6">
        {/* =================================================================== */}
        {/* ABA 1: WCAG 2.2 & TOUCH TARGET */}
        {/* =================================================================== */}
        {activeTab === 'wcag-checker' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controles de Cores e Preview */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Cores de Texto e Fundo:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Cor do Texto (HEX):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Cor do Fundo (HEX):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Box de Pré-visualização ao Vivo */}
                <div 
                  style={{ backgroundColor: bgColor, color: textColor }}
                  className="p-6 rounded-xl border border-slate-700/60 space-y-2 transition-all shadow-inner"
                >
                  <div className="text-lg font-bold">
                    Texto Grande em Título (24px)
                  </div>
                  <div className="text-sm leading-relaxed">
                    Este é um exemplo de corpo de texto normal (14px/16px) avaliado para leitura contínua de usuários e pessoas com baixa visão ou daltonismo.
                  </div>
                </div>

                {/* Touch Target (WCAG 2.2 Criterion 2.5.8) */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-xs font-mono text-slate-300 font-bold block">
                    Área de Toque Mobile (Touch Target min 44x44px):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Largura (px):</span>
                      <input
                        type="number"
                        min="20"
                        max="120"
                        value={touchTargetWidth}
                        onChange={(e) => setTouchTargetWidth(parseInt(e.target.value) || 20)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Altura (px):</span>
                      <input
                        type="number"
                        min="20"
                        max="120"
                        value={touchTargetHeight}
                        onChange={(e) => setTouchTargetHeight(parseInt(e.target.value) || 20)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Demonstrativo das Regras WCAG */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Razão de Contraste W3C:</span>
                    <span className="text-cyan-400 font-bold font-mono">Fórmula WCAG 2.2</span>
                  </div>

                  <div className="text-4xl font-black font-mono text-white">
                    {contrastRatio.toFixed(2)} : 1
                  </div>

                  {/* Badges de Aprovação */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <div className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${passAaNormal ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                      <span>WCAG AA (Normal):</span>
                      <strong>{passAaNormal ? 'Passou (4.5:1)' : 'Falhou'}</strong>
                    </div>

                    <div className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${passAaLarge ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                      <span>WCAG AA (Grande):</span>
                      <strong>{passAaLarge ? 'Passou (3.0:1)' : 'Falhou'}</strong>
                    </div>

                    <div className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${passAaaNormal ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                      <span>WCAG AAA (Normal):</span>
                      <strong>{passAaaNormal ? 'Passou (7.0:1)' : 'Falhou'}</strong>
                    </div>

                    <div className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${passAaaLarge ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                      <span>WCAG AAA (Grande):</span>
                      <strong>{passAaaLarge ? 'Passou (4.5:1)' : 'Falhou'}</strong>
                    </div>
                  </div>
                </div>

                {/* Status Touch Target */}
                <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${isTouchTargetValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-amber-950/40 border-amber-800 text-amber-300'}`}>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>Touch Target: {touchTargetWidth}x{touchTargetHeight}px</span>
                  </div>
                  <strong>{isTouchTargetValid ? '✓ Conforme WCAG 2.2 (min 44px)' : '⚠ Abaixo de 44px (Pode gerar toque acidental)'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: CORE WEB VITALS (LCP, INP, CLS) */}
        {/* =================================================================== */}
        {activeTab === 'cwv-estimator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sliders de Simulação */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Simulador de Métricas Core Web Vitals:
                </span>

                {/* LCP Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">LCP (Largest Contentful Paint):</span>
                    <span className="text-white font-bold">{lcpValue.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={lcpValue}
                    onChange={(e) => setLcpValue(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>≤ 2.5s (Bom)</span>
                    <span>2.5s - 4.0s</span>
                    <span>&gt; 4.0s (Ruim)</span>
                  </div>
                </div>

                {/* INP Slider */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">INP (Interaction to Next Paint):</span>
                    <span className="text-white font-bold">{inpValue} ms</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    step="10"
                    value={inpValue}
                    onChange={(e) => setInpValue(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>≤ 200ms (Bom)</span>
                    <span>200ms - 500ms</span>
                    <span>&gt; 500ms (Ruim)</span>
                  </div>
                </div>

                {/* CLS Slider */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">CLS (Cumulative Layout Shift):</span>
                    <span className="text-white font-bold">{clsValue.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.50"
                    step="0.01"
                    value={clsValue}
                    onChange={(e) => setClsValue(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>≤ 0.10 (Bom)</span>
                    <span>0.10 - 0.25</span>
                    <span>&gt; 0.25 (Ruim)</span>
                  </div>
                </div>
              </div>

              {/* Painel do Score Geral e Diagnóstico */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Score de Performance Estimado:</span>
                    <span className="text-cyan-400 font-bold font-mono">Lighthouse Weight</span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <div className={`text-5xl font-black font-mono ${overallPerfScore >= 90 ? 'text-emerald-400' : overallPerfScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {overallPerfScore}
                    </div>
                    <span className="text-xs font-mono text-slate-400">/ 100 pontos</span>
                  </div>

                  {/* 3 Cartões de Status */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div className={`p-2 rounded-lg border ${getLcpStatus(lcpValue).bg}`}>
                      <span className="text-slate-400 block text-[10px]">LCP</span>
                      <strong className={getLcpStatus(lcpValue).color}>{getLcpStatus(lcpValue).status}</strong>
                    </div>

                    <div className={`p-2 rounded-lg border ${getInpStatus(inpValue).bg}`}>
                      <span className="text-slate-400 block text-[10px]">INP</span>
                      <strong className={getInpStatus(inpValue).color}>{getInpStatus(inpValue).status}</strong>
                    </div>

                    <div className={`p-2 rounded-lg border ${getClsStatus(clsValue).bg}`}>
                      <span className="text-slate-400 block text-[10px]">CLS</span>
                      <strong className={getClsStatus(clsValue).color}>{getClsStatus(clsValue).status}</strong>
                    </div>
                  </div>
                </div>

                {/* Checklist de Otimização */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
                  <span className="text-slate-200 font-bold block mb-1">Checklist de Otimização Técnica:</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span>✓ LCP: Pré-carregar imagem hero (`rel="preload" as="image"`).</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span>✓ INP: Quebrar long tasks de JavaScript no main thread com `scheduler.yield()`.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span>✓ CLS: Reservar dimensões `width` e `height` explícitas em todas as imagens e iframes.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: CONSTRUTOR WAI-ARIA 1.2 */}
        {/* =================================================================== */}
        {activeTab === 'aria-builder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Padrão de Componente Acessível:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setAriaPattern('modal'); setComponentId('dialog-auth'); setComponentLabel('Entrar na Conta'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                      ariaPattern === 'modal' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Modal Dialog
                  </button>

                  <button
                    onClick={() => { setAriaPattern('accordion'); setComponentId('acc-faq'); setComponentLabel('Como funciona o Apollo?'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                      ariaPattern === 'accordion' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Accordion / Collapse
                  </button>

                  <button
                    onClick={() => { setAriaPattern('alert'); setComponentId('alert-status'); setComponentLabel('Arquivo exportado com sucesso!'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                      ariaPattern === 'alert' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Live Region Alert
                  </button>

                  <button
                    onClick={() => { setAriaPattern('tabs'); setComponentId('tab-settings'); setComponentLabel('Configurações Gerais'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                      ariaPattern === 'tabs' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Tablist / Abas
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">ID do Componente (DOM ID):</label>
                  <input
                    type="text"
                    value={componentId}
                    onChange={(e) => setComponentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Texto do Rótulo / Título:</label>
                  <input
                    type="text"
                    value={componentLabel}
                    onChange={(e) => setComponentLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Snippet Gerado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Código JSX/HTML Acessível:</span>
                  <button
                    onClick={() => copyToClipboard(getAriaSnippet(), 'aria-snippet')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                  >
                    {copiedId === 'aria-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'aria-snippet' ? 'Copiado!' : 'Copiar Snippet'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all">
                  {getAriaSnippet()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: ESPECIFICIDADE CSS */}
        {/* =================================================================== */}
        {activeTab === 'css-specificity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Comparador de Seletores Conflitantes:
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-cyan-400 mb-1">Seletor A:</label>
                  <input
                    type="text"
                    value={selectorA}
                    onChange={(e) => setSelectorA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                  <div className="mt-1 text-[11px] font-mono text-slate-400">
                    Peso: <strong>{specA.score}</strong> (IDs: {specA.ids}, Classes: {specA.classes}, Elementos: {specA.elements})
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-amber-400 mb-1">Seletor B:</label>
                  <input
                    type="text"
                    value={selectorB}
                    onChange={(e) => setSelectorB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                  <div className="mt-1 text-[11px] font-mono text-slate-400">
                    Peso: <strong>{specB.score}</strong> (IDs: {specB.ids}, Classes: {specB.classes}, Elementos: {specB.elements})
                  </div>
                </div>
              </div>

              {/* Vencedor da Cascata */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <span className="text-xs font-mono text-slate-400 block">
                    Resultado da Cascata do Navegador:
                  </span>

                  <div className="text-2xl font-black font-mono">
                    {(specA.numericValue ?? 0) > (specB.numericValue ?? 0) ? (
                      <span className="text-cyan-400">✓ Seletor A Vence na Cascata!</span>
                    ) : (specB.numericValue ?? 0) > (specA.numericValue ?? 0) ? (
                      <span className="text-amber-400">✓ Seletor B Vence na Cascata!</span>
                    ) : (
                      <span className="text-slate-300">= Empate na Especificidade (A última regra no CSS prevalece)</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-center">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Coluna 1</span>
                      <span className="text-white font-bold">IDs (#)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Coluna 2</span>
                      <span className="text-white font-bold">Classes (.)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Coluna 3</span>
                      <span className="text-white font-bold">Tags (div)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: CSP & SECURITY HEADERS */}
        {/* =================================================================== */}
        {activeTab === 'csp-builder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Diretivas de Content Security Policy (CSP):
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">script-src:</label>
                  <input
                    type="text"
                    value={cspScriptSrc}
                    onChange={(e) => setCspScriptSrc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">style-src:</label>
                  <input
                    type="text"
                    value={cspStyleSrc}
                    onChange={(e) => setCspStyleSrc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">connect-src (APIs & WebSockets):</label>
                  <input
                    type="text"
                    value={cspConnectSrc}
                    onChange={(e) => setCspConnectSrc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="hsts-check"
                    checked={includeHsts}
                    onChange={(e) => setIncludeHsts(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="hsts-check" className="text-xs font-mono text-slate-300 cursor-pointer">
                    Incluir HSTS (Strict-Transport-Security preload 2 anos)
                  </label>
                </div>
              </div>

              {/* Snippet para Nginx / Next.js */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Snippet Nginx / Next.js:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(getNginxSecuritySnippet(), 'csp-nginx')}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-mono hover:bg-slate-800 transition"
                    >
                      {copiedId === 'csp-nginx' ? 'Copiado Nginx!' : 'Copiar Nginx'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(getNextJsConfigHeaders(), 'csp-next')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 transition"
                    >
                      {copiedId === 'csp-next' ? 'Copiado Next.js!' : 'Copiar Next.js'}
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all">
                  {getNginxSecuritySnippet()}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
