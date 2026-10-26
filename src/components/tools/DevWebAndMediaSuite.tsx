'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileImage, 
  Search, 
  Pipette, 
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Sliders, 
  Eye, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Code
} from 'lucide-react';

export type DevWebMediaTab = 'image-compressor' | 'seo-meta-preview' | 'color-palette' | 'jwt-inspector' | 'favicon-gen';

export function DevWebAndMediaSuite({ defaultTab = 'image-compressor' }: { defaultTab?: DevWebMediaTab }) {
  const [activeTab, setActiveTab] = useState<DevWebMediaTab>(defaultTab);
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
  // TAB 1: COMPRESSOR & CONVERSOR DE IMAGENS
  // ==========================================
  const [origImageSrc, setOrigImageSrc] = useState<string | null>(null);
  const [origFileSize, setOrigFileSize] = useState<number>(0);
  const [compressedSrc, setCompressedSrc] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionQuality, setCompressionQuality] = useState<number>(75);
  const [outputFormat, setOutputFormat] = useState<'image/webp' | 'image/jpeg'>('image/webp');
  const [scalePercent, setScalePercent] = useState<number>(100);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOrigFileSize(file.size);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setOrigImageSrc(src);
      compressImage(src, compressionQuality, outputFormat, scalePercent);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (
    src: string,
    quality: number,
    format: 'image/webp' | 'image/jpeg',
    scale: number
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetW = Math.round((img.width * scale) / 100);
      const targetH = Math.round((img.height * scale) / 100);
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            const url = URL.createObjectURL(blob);
            setCompressedSrc(url);
          }
        },
        format,
        quality / 100
      );
    };
    img.src = src;
  };

  useEffect(() => {
    if (origImageSrc) {
      compressImage(origImageSrc, compressionQuality, outputFormat, scalePercent);
    }
  }, [compressionQuality, outputFormat, scalePercent]);

  // ==========================================
  // TAB 2: GERADOR DE METATAGS SEO & OG PREVIEW
  // ==========================================
  const [seoTitle, setSeoTitle] = useState('V5 Apollo Tools · Canivete Suíço de Produtividade');
  const [seoDesc, setSeoDesc] = useState(
    'Mais de 100 ferramentas soberanas client-side para desenvolvedores, QA, redatores e criadores de conteúdo. Zero custo de API, privacidade total.'
  );
  const [seoUrl, setSeoUrl] = useState('https://tools.v5apollo.com');
  const [seoOgImage, setSeoOgImage] = useState('https://tools.v5apollo.com/og-image.jpg');
  const [previewPlatform, setPreviewPlatform] = useState<'google' | 'whatsapp' | 'twitter'>('google');

  const generatedMetaTags = `<!-- Primárias -->
<title>${seoTitle}</title>
<meta name="title" content="${seoTitle}">
<meta name="description" content="${seoDesc}">
<link rel="canonical" href="${seoUrl}">

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:url" content="${seoUrl}">
<meta property="og:title" content="${seoTitle}">
<meta property="og:description" content="${seoDesc}">
<meta property="og:image" content="${seoOgImage}">

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${seoUrl}">
<meta property="twitter:title" content="${seoTitle}">
<meta property="twitter:description" content="${seoDesc}">
<meta property="twitter:image" content="${seoOgImage}">`;

  // ==========================================
  // TAB 3: EXTRATOR DE PALETA DE CORES (CANVAS)
  // ==========================================
  const [paletteImage, setPaletteImage] = useState<string>(
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="35%" stop-color="%2310b981"/><stop offset="70%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="400" height="200" fill="url(%23g)"/></svg>'
  );
  const [extractedColors, setExtractedColors] = useState<string[]>([
    '#06b6d4',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#0f172a',
    '#38bdf8'
  ]);

  const handlePaletteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setPaletteImage(src);
      extractPaletteFromImage(src);
    };
    reader.readAsDataURL(file);
  };

  const extractPaletteFromImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 50, 50);
      const imgData = ctx.getImageData(0, 0, 50, 50).data;
      const colorCounts: Record<string, number> = {};

      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 32) * 32;
        const g = Math.round(imgData[i + 1] / 32) * 32;
        const b = Math.round(imgData[i + 2] / 32) * 32;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map((entry) => entry[0]);

      if (sorted.length > 0) {
        setExtractedColors(sorted);
      }
    };
    img.src = src;
  };

  // ==========================================
  // TAB 4: DECODIFICADOR & INSPETOR JWT
  // ==========================================
  const DEFAULT_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2Fwb2xsb18wMDEiLCJuYW1lIjoiQXBvbGxvIExhIFBsYXRhIiwicm9sZSI6ImNvbWFuZGFudGUiLCJpYXQiOjE3MDM2OTg4MDAsImV4cCI6MTgwMDAwMDAwMH0.3e4f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f';

  const [jwtInput, setJwtInput] = useState<string>(DEFAULT_JWT);
  const [jwtHeader, setJwtHeader] = useState<string>('');
  const [jwtPayload, setJwtPayload] = useState<string>('');
  const [jwtSignature, setJwtSignature] = useState<string>('');
  const [jwtStatus, setJwtStatus] = useState<{ isValidFormat: boolean; isExpired: boolean; expDate: string | null }>({
    isValidFormat: true,
    isExpired: false,
    expDate: null
  });

  const decodeJwt = (token: string) => {
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        setJwtStatus({ isValidFormat: false, isExpired: false, expDate: null });
        setJwtHeader('// Formato JWT Inválido (Esperado: 3 partes separadas por ponto)');
        setJwtPayload('// Formato JWT Inválido');
        setJwtSignature('');
        return;
      }

      const decodeBase64 = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const headerObj = JSON.parse(decodeBase64(parts[0]));
      const payloadObj = JSON.parse(decodeBase64(parts[1]));

      setJwtHeader(JSON.stringify(headerObj, null, 2));
      setJwtPayload(JSON.stringify(payloadObj, null, 2));
      setJwtSignature(parts[2]);

      let isExpired = false;
      let expDate = null;
      if (payloadObj.exp) {
        const expMs = payloadObj.exp * 1000;
        isExpired = Date.now() > expMs;
        expDate = new Date(expMs).toLocaleString('pt-BR');
      }

      setJwtStatus({
        isValidFormat: true,
        isExpired,
        expDate
      });
    } catch {
      setJwtStatus({ isValidFormat: false, isExpired: false, expDate: null });
      setJwtHeader('// Erro ao decodificar Base64');
      setJwtPayload('// Erro no payload');
      setJwtSignature('');
    }
  };

  useEffect(() => {
    decodeJwt(jwtInput);
  }, [jwtInput]);

  // ==========================================
  // TAB 5: GERADOR DE FAVICON & ÍCONES WEB
  // ==========================================
  const [faviconLetter, setFaviconLetter] = useState('V5');
  const [faviconBg, setFaviconBg] = useState('#06b6d4');
  const [faviconTextColor, setFaviconTextColor] = useState('#020617');
  const [faviconShape, setFaviconShape] = useState<'round' | 'rounded' | 'square'>('rounded');
  const faviconCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawFavicon = (size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Formato
    ctx.fillStyle = faviconBg;
    if (faviconShape === 'round') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (faviconShape === 'rounded') {
      const radius = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    // Texto / Letra
    ctx.fillStyle = faviconTextColor;
    ctx.font = `bold ${Math.round(size * 0.48)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(faviconLetter, size / 2, size / 2);

    return canvas.toDataURL('image/png');
  };

  const downloadFavicon = (size: number) => {
    const dataUrl = drawFavicon(size);
    const link = document.createElement('a');
    link.download = `favicon-${size}x${size}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Suíte Webmaster, SEO & Mídia
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Compressor de Imagens, Metatags SEO & Inspetor JWT
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ferramentas essenciais de alta velocidade para desenvolvedores web, especialistas de SEO e designers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('image-compressor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'image-compressor'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Comprimir Imagem</span>
          </button>

          <button
            onClick={() => setActiveTab('seo-meta-preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seo-meta-preview'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Metatags SEO</span>
          </button>

          <button
            onClick={() => setActiveTab('color-palette')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'color-palette'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>Extrair Cores</span>
          </button>

          <button
            onClick={() => setActiveTab('jwt-inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'jwt-inspector'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Inspetor JWT</span>
          </button>

          <button
            onClick={() => setActiveTab('favicon-gen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favicon-gen'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gerar Favicon</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6 relative z-10">
        {/* ========================================================= */}
        {/* TAB 1: COMPRESSOR DE IMAGENS                              */}
        {/* ========================================================= */}
        {activeTab === 'image-compressor' && (
          <div className="space-y-6">
            {!origImageSrc ? (
              <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-12 text-center bg-slate-950/60 transition-all flex flex-col items-center justify-center">
                <FileImage className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-sm font-bold text-slate-200">Arraste ou Selecione uma Imagem para Otimizar</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Compressão 100% no navegador (Client-side Canvas/WebP). Suporta PNG, JPEG, WEBP.
                </p>
                <label className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-xl cursor-pointer transition shadow-lg shadow-cyan-500/20">
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                  Selecionar Imagem
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controles de Compressão */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-bold">Formato de Saída:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setOutputFormat('image/webp')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                            outputFormat === 'image/webp'
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          WebP (Recomendado)
                        </button>
                        <button
                          onClick={() => setOutputFormat('image/jpeg')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                            outputFormat === 'image/jpeg'
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          JPEG
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Qualidade de Compressão:</span>
                        <span className="text-cyan-400 font-bold">{compressionQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Escala de Resolução:</span>
                        <span className="text-cyan-400 font-bold">{scalePercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={100}
                        step={5}
                        value={scalePercent}
                        onChange={(e) => setScalePercent(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Comparativo de Tamanho */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-mono text-slate-400 font-bold">Economia de Armazenamento:</div>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Tamanho Original:</span>
                        <span className="text-slate-200 font-bold">{(origFileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                        <span className="text-emerald-400 block text-[10px]">Tamanho Comprimido:</span>
                        <span className="text-emerald-300 font-bold">{(compressedSize / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>

                    {origFileSize > 0 && compressedSize > 0 && (
                      <div className="text-center p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-400 font-bold">
                        🎉 Redução de {Math.max(0, Math.round(((origFileSize - compressedSize) / origFileSize) * 100))}% no tamanho do arquivo!
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <label className="flex-1 py-2 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono cursor-pointer transition">
                        Nova Imagem
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {compressedSrc && (
                        <a
                          href={compressedSrc}
                          download={`apollo-compressed.${outputFormat === 'image/webp' ? 'webp' : 'jpg'}`}
                          className="flex-1 py-2 text-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar Imagem</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Previews Lado a Lado */}
                <div className="lg:col-span-7 flex flex-col justify-center items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 mb-3 block">Pré-visualização da Imagem Otimizada:</span>
                  {compressedSrc && (
                    <img
                      src={compressedSrc}
                      alt="Otimizada"
                      className="max-h-[320px] rounded-lg object-contain border border-slate-800 shadow-xl"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: METATAGS SEO & OPEN GRAPH                          */}
        {/* ========================================================= */}
        {activeTab === 'seo-meta-preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulário de Metatags */}
            <div className="lg:col-span-6 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Título da Página (SEO Title):</span>
                  <span className={seoTitle.length > 60 ? 'text-amber-400' : 'text-slate-500'}>
                    {seoTitle.length}/60 caracteres
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Meta Descrição (Snippet):</span>
                  <span className={seoDesc.length > 160 ? 'text-amber-400' : 'text-slate-500'}>
                    {seoDesc.length}/160 caracteres
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">URL Canônica:</label>
                  <input
                    type="text"
                    value={seoUrl}
                    onChange={(e) => setSeoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Imagem Open Graph (URL):</label>
                  <input
                    type="text"
                    value={seoOgImage}
                    onChange={(e) => setSeoOgImage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Código Gerado */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 font-bold">
                    <Code className="w-3.5 h-3.5 text-cyan-400" /> Tags HTML Prontas para o &lt;head&gt;:
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedMetaTags, 'meta-tags')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'meta-tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Tags</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-3 rounded-lg overflow-x-auto max-h-36">
                  {generatedMetaTags}
                </pre>
              </div>
            </div>

            {/* Simulador de Card Preview */}
            <div className="lg:col-span-6 space-y-3">
              {/* Seletor de Plataforma */}
              <div className="flex gap-1.5 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewPlatform('google')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition ${
                    previewPlatform === 'google'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Google SERP
                </button>
                <button
                  onClick={() => setPreviewPlatform('whatsapp')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition ${
                    previewPlatform === 'whatsapp'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setPreviewPlatform('twitter')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition ${
                    previewPlatform === 'twitter'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Twitter / X
                </button>
              </div>

              {/* Preview Card */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[300px]">
                {previewPlatform === 'google' && (
                  <div className="max-w-md w-full bg-[#202124] p-4 rounded-xl text-left font-sans shadow-lg border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-[#bdc1c6] mb-1">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] font-bold text-slate-950">
                        V5
                      </div>
                      <span className="truncate">{seoUrl}</span>
                    </div>
                    <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1 mb-1">
                      {seoTitle}
                    </div>
                    <div className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                      {seoDesc}
                    </div>
                  </div>
                )}

                {previewPlatform === 'whatsapp' && (
                  <div className="max-w-xs w-full bg-[#1f2c34] rounded-2xl overflow-hidden shadow-2xl border border-[#2a3942] text-left">
                    <div className="h-32 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                      <div className="text-xs font-mono text-slate-400">Preview Imagem OG (1200x630)</div>
                    </div>
                    <div className="p-3 bg-[#111b21] space-y-1">
                      <div className="text-xs font-bold text-slate-100 line-clamp-1">{seoTitle}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{seoDesc}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{seoUrl.replace('https://', '')}</div>
                    </div>
                  </div>
                )}

                {previewPlatform === 'twitter' && (
                  <div className="max-w-sm w-full bg-black rounded-2xl border border-slate-800 overflow-hidden text-left shadow-2xl">
                    <div className="h-36 bg-slate-900 flex items-center justify-center text-xs font-mono text-slate-500">
                      Card de Imagem Ampla (Twitter Large)
                    </div>
                    <div className="p-3 space-y-1 bg-slate-950">
                      <div className="text-[11px] text-slate-500 font-mono truncate">{seoUrl.replace('https://', '')}</div>
                      <div className="text-xs font-bold text-slate-100 line-clamp-1">{seoTitle}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{seoDesc}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EXTRATOR DE PALETA DE CORES                        */}
        {/* ========================================================= */}
        {activeTab === 'color-palette' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                Selecione uma imagem para extrair automaticamente as 6 cores primárias dominantes:
              </span>
              <label className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-xl cursor-pointer transition shadow-lg shadow-cyan-500/20">
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                Upload de Imagem
                <input type="file" accept="image/*" onChange={handlePaletteUpload} className="hidden" />
              </label>
            </div>

            {/* Grid de Cores Extraídas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {extractedColors.map((hex, idx) => (
                <div
                  key={idx}
                  onClick={() => copyToClipboard(hex, `hex-${idx}`)}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer group flex flex-col items-center"
                >
                  <div
                    style={{ backgroundColor: hex }}
                    className="w-full h-16 rounded-lg mb-2 shadow-inner border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 flex items-center gap-1">
                    {hex}
                    {copiedKey === `hex-${idx}` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">Tom #{idx + 1}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 text-center font-mono">
              💡 Processamento de pixel cluster sampling via HTML5 Canvas 100% no cliente.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: INSPETOR & DECODIFICADOR JWT                       */}
        {/* ========================================================= */}
        {activeTab === 'jwt-inspector' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block font-bold mb-1">
                Cole o Token JWT (JSON Web Token):
              </label>
              <textarea
                rows={3}
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Status Card */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {jwtStatus.isValidFormat ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Formato JWT Válido (RFC 7519)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Formato Inválido
                  </span>
                )}
              </div>

              {jwtStatus.expDate && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expiração: </span>
                  <span className={jwtStatus.isExpired ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {jwtStatus.expDate} {jwtStatus.isExpired ? '(EXPIRADO)' : '(VÁLIDO)'}
                  </span>
                </div>
              )}
            </div>

            {/* Painéis Decodificados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Header */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-rose-400 font-bold">HEADER (Algoritmo & Tipo):</span>
                  <button
                    onClick={() => copyToClipboard(jwtHeader, 'jwt-h')}
                    className="text-xs font-mono text-slate-500 hover:text-white"
                  >
                    {copiedKey === 'jwt-h' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="text-xs font-mono text-rose-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
                  {jwtHeader}
                </pre>
              </div>

              {/* Payload */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">PAYLOAD (Dados & Claims):</span>
                  <button
                    onClick={() => copyToClipboard(jwtPayload, 'jwt-p')}
                    className="text-xs font-mono text-slate-500 hover:text-white"
                  >
                    {copiedKey === 'jwt-p' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto max-h-56">
                  {jwtPayload}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: GERADOR DE FAVICON                                 */}
        {/* ========================================================= */}
        {activeTab === 'favicon-gen' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block font-bold mb-1">
                  Texto / Iniciais do Favicon (1 a 2 letras):
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={faviconLetter}
                  onChange={(e) => setFaviconLetter(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Cor de Fundo:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={faviconBg}
                      onChange={(e) => setFaviconBg(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{faviconBg}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Cor do Texto:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={faviconTextColor}
                      onChange={(e) => setFaviconTextColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{faviconTextColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Formato:</label>
                <div className="flex gap-2">
                  {(['rounded', 'round', 'square'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFaviconShape(s)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                        faviconShape === s
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {s === 'rounded' ? 'Arredondado' : s === 'round' ? 'Círculo' : 'Quadrado'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Previews & Downloads */}
            <div className="lg:col-span-6 flex flex-col justify-between p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <span className="text-xs font-mono text-slate-400">Pré-visualização do Ícone (192px):</span>
                <div
                  style={{
                    backgroundColor: faviconBg,
                    color: faviconTextColor,
                    borderRadius: faviconShape === 'round' ? '9999px' : faviconShape === 'rounded' ? '28px' : '0px'
                  }}
                  className="w-32 h-32 flex items-center justify-center text-4xl font-black shadow-2xl transition-all"
                >
                  {faviconLetter}
                </div>
              </div>

              {/* Botões de Download em Lote */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => downloadFavicon(32)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-mono flex items-center justify-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>32x32</span>
                </button>
                <button
                  onClick={() => downloadFavicon(192)}
                  className="py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-1 transition shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-3 h-3" />
                  <span>192x192</span>
                </button>
                <button
                  onClick={() => downloadFavicon(512)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-mono flex items-center justify-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>512x512</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
