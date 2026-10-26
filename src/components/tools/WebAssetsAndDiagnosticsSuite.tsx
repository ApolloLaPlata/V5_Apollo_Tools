'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Globe, 
  FileCode, 
  Binary, 
  Code, 
  ShieldCheck, 
  Server, 
  Sliders, 
  Download, 
  Layers, 
  Monitor, 
  Cpu, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';

export type WebAssetsTab = 'svg-optimizer' | 'user-agent' | 'base32-crockford' | 'html-entities' | 'dns-propagation';

export function WebAssetsAndDiagnosticsSuite({ defaultTab = 'svg-optimizer' }: { defaultTab?: WebAssetsTab }) {
  const [activeTab, setActiveTab] = useState<WebAssetsTab>(defaultTab);
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
  // TAB 1: OTIMIZADOR & HIGIENIZADOR DE SVG
  // ==========================================
  const DEFAULT_RAW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100" height="100">
  <!-- Generator: Adobe Illustrator 28.0, SVG Export Plug-In . SVG Version: 1.2.0 Build 709)  -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"/>
    </rdf:RDF>
  </metadata>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="50.0000" cy="50.0000" r="40.0000" fill="url(#grad1)" stroke="#ffffff" stroke-width="2.0000" />
  <path d="M 35.0000 50.0000 L 45.0000 60.0000 L 65.0000 40.0000" fill="none" stroke="#ffffff" stroke-width="4.0000" stroke-linecap="round" />
</svg>`;

  const [rawSvgInput, setRawSvgInput] = useState<string>(DEFAULT_RAW_SVG);
  const [optimizedSvg, setOptimizedSvg] = useState<string>('');
  const [svgReduction, setSvgReduction] = useState<{ origBytes: number; optBytes: number; percent: number }>({
    origBytes: 0,
    optBytes: 0,
    percent: 0
  });

  const optimizeSvgCode = (svg: string) => {
    if (!svg.trim()) {
      setOptimizedSvg('');
      return;
    }

    let clean = svg;
    // 1. Remove comentários XML
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    // 2. Remove tags de metadados Adobe / Figma
    clean = clean.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    // 3. Remove doctype e tags xml
    clean = clean.replace(/<\?xml[\s\S]*?\?>/gi, '');
    clean = clean.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    // 4. Simplifica números decimais em atributos (ex: 50.0000 -> 50)
    clean = clean.replace(/(\d+)\.0+(\b|\s|,|")/g, '$1$2');
    // 5. Minifica espaços múltiplos e quebras de linha
    clean = clean.replace(/\s{2,}/g, ' ');
    clean = clean.replace(/>\s+</g, '><').trim();

    const origBytes = new Blob([svg]).size;
    const optBytes = new Blob([clean]).size;
    const percent = origBytes > 0 ? Math.round(((origBytes - optBytes) / origBytes) * 100) : 0;

    setOptimizedSvg(clean);
    setSvgReduction({ origBytes, optBytes, percent });
  };

  useEffect(() => {
    optimizeSvgCode(rawSvgInput);
  }, [rawSvgInput]);

  // ==========================================
  // TAB 2: PARSER & DIAGNÓSTICO DE USER-AGENT
  // ==========================================
  const [userAgentInput, setUserAgentInput] = useState<string>('');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !userAgentInput) {
      setUserAgentInput(navigator.userAgent);
    }
  }, []);

  const parseUserAgent = (ua: string) => {
    let os = 'Desconhecido';
    if (/windows phone/i.test(ua)) os = 'Windows Phone';
    else if (/win64|win32|windows/i.test(ua)) os = 'Windows (PC)';
    else if (/android/i.test(ua)) os = 'Android OS';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS (Apple)';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    let browser = 'Desconhecido';
    if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';

    let engine = 'Desconhecida';
    if (/blink/i.test(ua) || (/chrome/i.test(ua) && !/webkit/i.test(ua))) engine = 'Blink';
    else if (/webkit/i.test(ua)) engine = 'WebKit / Blink';
    else if (/gecko/i.test(ua) && !/webkit/i.test(ua)) engine = 'Gecko';

    let deviceType = 'Desktop';
    if (/mobile/i.test(ua)) deviceType = 'Dispositivo Móvel (Smartphone)';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'Tablet';

    const isBot = /bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|discordbot/i.test(ua);

    return { os, browser, engine, deviceType, isBot };
  };

  const parsedUa = parseUserAgent(userAgentInput);

  // ==========================================
  // TAB 3: CODIFICADOR BASE32 & CROCKFORD (2FA / TOTP)
  // ==========================================
  const [base32Text, setBase32Text] = useState<string>('V5_APOLLO_KEY_2026');
  const [base32Mode, setBase32Mode] = useState<'rfc4648' | 'crockford'>('rfc4648');
  const [base32Result, setBase32Result] = useState<string>('');

  // Tabela Base32 RFC 4648
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  // Crockford elimina I, L, O e U para clareza humana
  const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  const encodeBase32 = (str: string, alphabet: string): string => {
    if (!str) return '';
    let binary = '';
    for (let i = 0; i < str.length; i++) {
      binary += str.charCodeAt(i).toString(2).padStart(8, '0');
    }

    let output = '';
    for (let i = 0; i < binary.length; i += 5) {
      const chunk = binary.slice(i, i + 5).padEnd(5, '0');
      const idx = parseInt(chunk, 2);
      output += alphabet[idx];
    }
    return output;
  };

  useEffect(() => {
    const alpha = base32Mode === 'crockford' ? CROCKFORD_ALPHABET : BASE32_ALPHABET;
    setBase32Result(encodeBase32(base32Text, alpha));
  }, [base32Text, base32Mode]);

  // ==========================================
  // TAB 4: CODIFICADOR DE ENTIDADES HTML
  // ==========================================
  const [htmlInput, setHtmlInput] = useState<string>(`<div class="apollo-box" data-id="101">\n  <h1>V5 Apollo & "Tools" © 2026</h1>\n  <p>Status: Operacional & 100% Seguro</p>\n</div>`);
  const [htmlEncoded, setHtmlEncoded] = useState<string>('');

  const encodeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/©/g, '&copy;');
  };

  useEffect(() => {
    setHtmlEncoded(encodeHtml(htmlInput));
  }, [htmlInput]);

  // ==========================================
  // TAB 5: SIMULADOR DE PROPAGAÇÃO DNS GLOBAL
  // ==========================================
  const [dnsTestDomain, setDnsTestDomain] = useState<string>('tools.v5apollo.com');
  const [dnsRecordType, setDnsRecordType] = useState<'A' | 'CNAME' | 'MX' | 'TXT'>('A');

  const GLOBAL_DNS_NODES = [
    { location: 'São Paulo, Brasil 🇧🇷', provider: 'Claro / Vivo DNS', ip: '142.250.190.46', latency: '4ms', status: 'OK' },
    { location: 'Virgínia, EUA 🇺🇸', provider: 'AWS us-east-1', ip: '142.250.190.46', latency: '110ms', status: 'OK' },
    { location: 'Califórnia, EUA 🇺🇸', provider: 'Cloudflare (1.1.1.1)', ip: '142.250.190.46', latency: '125ms', status: 'OK' },
    { location: 'Frankfurt, Alemanha 🇩🇪', provider: 'Hetzner Online', ip: '142.250.190.46', latency: '185ms', status: 'OK' },
    { location: 'Londres, Reino Unido 🇬🇧', provider: 'Google DNS (8.8.8.8)', ip: '142.250.190.46', latency: '170ms', status: 'OK' },
    { location: 'Tóquio, Japão 🇯🇵', provider: 'NTT Communications', ip: '142.250.190.46', latency: '260ms', status: 'OK' },
    { location: 'Sydney, Austrália 🇦🇺', provider: 'Telstra Global', ip: '142.250.190.46', latency: '295ms', status: 'OK' },
    { location: 'Cingapura 🇸🇬', provider: 'DigitalOcean Anycast', ip: '142.250.190.46', latency: '275ms', status: 'OK' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de Assets Web, Diagnóstico & Codificações
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Client-Side · Etapa 29
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Otimizador de SVG, Parser User-Agent, Base32 Crockford (2FA), Entidades HTML e Simulador DNS Global.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('svg-optimizer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'svg-optimizer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SVG Optimizer</span>
          </button>
          <button
            onClick={() => setActiveTab('user-agent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'user-agent'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>User-Agent</span>
          </button>
          <button
            onClick={() => setActiveTab('base32-crockford')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'base32-crockford'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Base32 (2FA)</span>
          </button>
          <button
            onClick={() => setActiveTab('html-entities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'html-entities'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Entidades HTML</span>
          </button>
          <button
            onClick={() => setActiveTab('dns-propagation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'dns-propagation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Propagação DNS</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: OTIMIZADOR DE SVG */}
        {/* ========================================== */}
        {activeTab === 'svg-optimizer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada SVG */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      SVG Original (Bruto)
                    </span>
                    <button
                      onClick={() => setRawSvgInput(DEFAULT_RAW_SVG)}
                      className="text-[11px] text-cyan-400 hover:underline font-mono"
                    >
                      Exemplo Illustrator
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={rawSvgInput}
                    onChange={(e) => setRawSvgInput(e.target.value)}
                    placeholder="Cole aqui seu código <svg>...</svg>..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-y"
                  />
                </div>
              </div>

              {/* Saída Otimizada & Métricas */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  {/* Métricas de Redução */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase">Economia de Peso</span>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-2">
                        <span>-{svgReduction.percent}%</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({svgReduction.origBytes}B → {svgReduction.optBytes}B)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(optimizedSvg, 'opt-svg')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      {copiedKey === 'opt-svg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar SVG Limpo
                    </button>
                  </div>

                  {/* Preview do SVG */}
                  <div className="h-28 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center p-3 overflow-hidden">
                    <div 
                      dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                      className="w-20 h-20 flex items-center justify-center"
                    />
                  </div>

                  {/* Código Minificado */}
                  <textarea
                    readOnly
                    rows={5}
                    value={optimizedSvg}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none select-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: USER-AGENT PARSER */}
        {/* ========================================== */}
        {activeTab === 'user-agent' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  String do User-Agent (Navegador / Bot)
                </span>
                <button
                  onClick={() => setUserAgentInput(navigator.userAgent)}
                  className="text-xs text-cyan-400 hover:underline font-mono"
                >
                  Usar Meu User-Agent Atual
                </button>
              </div>

              <textarea
                rows={3}
                value={userAgentInput}
                onChange={(e) => setUserAgentInput(e.target.value)}
                placeholder="Mozilla/5.0..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none resize-none"
              />

              {/* Grid de Diagnóstico */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Sistema Operacional</span>
                  <span className="text-sm font-bold text-slate-100 mt-0.5 block">{parsedUa.os}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Navegador</span>
                  <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{parsedUa.browser}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Engine de Render</span>
                  <span className="text-sm font-bold text-purple-400 mt-0.5 block">{parsedUa.engine}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Dispositivo</span>
                  <span className="text-sm font-bold text-slate-100 mt-0.5 block">{parsedUa.deviceType}</span>
                </div>
              </div>

              {parsedUa.isBot && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  🤖 Bot / Crawler de Mecanismo de Busca detectado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: CODIFICADOR BASE32 (2FA / TOTP) */}
        {/* ========================================== */}
        {activeTab === 'base32-crockford' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Texto Puro a Codificar
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setBase32Mode('rfc4648')}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                          base32Mode === 'rfc4648' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        RFC 4648 (Padrão 2FA)
                      </button>
                      <button
                        onClick={() => setBase32Mode('crockford')}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                          base32Mode === 'crockford' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Crockford
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={base32Text}
                    onChange={(e) => setBase32Text(e.target.value)}
                    placeholder="Digite seu texto..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Saída Base32 */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Resultado Base32 ({base32Mode.toUpperCase()})
                    </span>
                    <button
                      onClick={() => copyToClipboard(base32Result, 'b32')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'b32' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                    {base32Result}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: CODIFICADOR DE ENTIDADES HTML */}
        {/* ========================================== */}
        {activeTab === 'html-entities' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* HTML Bruto */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    HTML Bruto
                  </span>
                  <textarea
                    rows={8}
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Entidades Codificadas */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Entidades HTML Prontas para Render
                    </span>
                    <button
                      onClick={() => copyToClipboard(htmlEncoded, 'html-ent')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'html-ent' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto select-all max-h-52 overflow-y-auto">
                    {htmlEncoded}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: SIMULADOR DE PROPAGAÇÃO DNS */}
        {/* ========================================== */}
        {activeTab === 'dns-propagation' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Domínio de Consulta:
                  </span>
                  <input
                    type="text"
                    value={dnsTestDomain}
                    onChange={(e) => setDnsTestDomain(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['A', 'CNAME', 'MX', 'TXT'] as const).map((rec) => (
                    <button
                      key={rec}
                      onClick={() => setDnsRecordType(rec)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition ${
                        dnsRecordType === rec ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Nós Globais */}
              <div className="space-y-2 pt-2">
                {GLOBAL_DNS_NODES.map((node, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-200">{node.location}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{node.provider}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="text-cyan-300 font-bold">{node.ip}</div>
                        <div className="text-[10px] text-slate-500">{node.latency}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
