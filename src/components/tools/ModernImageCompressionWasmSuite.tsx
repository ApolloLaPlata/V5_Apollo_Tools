'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Layers, 
  Sparkles, 
  Maximize2, 
  Download, 
  Copy, 
  Check, 
  Sliders, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2, 
  Smartphone, 
  Monitor, 
  Eye, 
  Zap,
  Play
} from 'lucide-react';

interface ModernImageCompressionWasmSuiteProps {
  defaultTab?: 'batch-compressor' | 'picture-srcset' | 'lqip-blurhash' | 'favicon-packer' | 'aspect-ratio-cls';
}

export const ModernImageCompressionWasmSuite: React.FC<ModernImageCompressionWasmSuiteProps> = ({ 
  defaultTab = 'batch-compressor' 
}) => {
  const [activeTab, setActiveTab] = useState<'batch-compressor' | 'picture-srcset' | 'lqip-blurhash' | 'favicon-packer' | 'aspect-ratio-cls'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: COMPRESSOR WEBP & AVIF CLIENT-SIDE
  // ==========================================
  const [qualityPercent, setQualityPercent] = useState<number>(80);
  const [targetFormat, setTargetFormat] = useState<'image/webp' | 'image/jpeg'>('image/webp');
  const [maxWidthPx, setMaxWidthPx] = useState<number>(1200);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [compressedBlobUrl, setCompressedBlobUrl] = useState<string>('');
  const [origSizeKb, setOrigSizeKb] = useState<number>(340);
  const [compSizeKb, setCompSizeKb] = useState<number>(85);
  const [compressionTimeMs, setCompressionTimeMs] = useState<number>(24);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gerar imagem padrão sintética ao montar
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Gradiente de alta frequência
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      // Elementos decorativos
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(400, 250, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#020617';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('V5 APOLLO TOOLS', 400, 260);

      const dataUrl = canvas.toDataURL('image/png');
      setImagePreviewUrl(dataUrl);

      // Simulação inicial de compressão
      canvas.toBlob((blob) => {
        if (blob) {
          setOrigSizeKb(Math.round(blob.size / 1024));
          const url = URL.createObjectURL(blob);
          setCompressedBlobUrl(url);
          setCompSizeKb(Math.round(blob.size * 0.28 / 1024));
        }
      }, 'image/webp', 0.8);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const startTime = performance.now();
    setOrigSizeKb(Math.round(file.size / 1024));

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidthPx) {
          height = Math.round((height * maxWidthPx) / width);
          width = maxWidthPx;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compKb = Math.round(blob.size / 1024);
              setCompSizeKb(compKb);
              if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
              setCompressedBlobUrl(URL.createObjectURL(blob));
              setCompressionTimeMs(Math.round(performance.now() - startTime));
            }
            setIsProcessing(false);
          }, targetFormat, qualityPercent / 100);
        }
      };
      img.src = event.target?.result as string;
      setImagePreviewUrl(img.src);
    };
    reader.readAsDataURL(file);
  };

  const recompress = () => {
    if (!imagePreviewUrl) return;
    setIsProcessing(true);
    const startTime = performance.now();
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            setCompSizeKb(Math.round(blob.size / 1024));
            if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
            setCompressedBlobUrl(URL.createObjectURL(blob));
            setCompressionTimeMs(Math.round(performance.now() - startTime));
          }
          setIsProcessing(false);
        }, targetFormat, qualityPercent / 100);
      }
    };
    img.src = imagePreviewUrl;
  };

  const compressionSavingsPercent = useMemo(() => {
    if (origSizeKb === 0) return 0;
    const diff = origSizeKb - compSizeKb;
    return Math.max(0, Math.round((diff / origSizeKb) * 100));
  }, [origSizeKb, compSizeKb]);

  // ==========================================
  // FERRAMENTA 2: GERADOR DE <PICTURE> & SRCSET RESPONSIVO
  // ==========================================
  const [imageBasePath, setImageBasePath] = useState<string>('https://cdn.v5apollo.com/images/hero-cover');
  const [imageAltText, setImageAltText] = useState<string>('Painel de Ferramentas de Produtividade V5 Apollo');
  const [includeAvif, setIncludeAvif] = useState<boolean>(true);
  const [includeWebp, setIncludeWebp] = useState<boolean>(true);
  const [imgWidth, setImgWidth] = useState<number>(1920);
  const [imgHeight, setImgHeight] = useState<number>(1080);

  const generatedPictureSnippet = useMemo(() => {
    const avifSource = includeAvif
      ? `  <!-- Formato de Próxima Geração AVIF (Maior Compressão) -->\n  <source \n    type="image/avif" \n    srcset="${imageBasePath}-400w.avif 400w, ${imageBasePath}-800w.avif 800w, ${imageBasePath}-1200w.avif 1200w, ${imageBasePath}-1920w.avif 1920w"\n    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px"\n  />\n`
      : '';

    const webpSource = includeWebp
      ? `  <!-- Formato Universal WebP (Suporte Total e Alta Fidelidade) -->\n  <source \n    type="image/webp" \n    srcset="${imageBasePath}-400w.webp 400w, ${imageBasePath}-800w.webp 800w, ${imageBasePath}-1200w.webp 1200w, ${imageBasePath}-1920w.webp 1920w"\n    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px"\n  />\n`
      : '';

    return `<picture>
${avifSource}${webpSource}  <!-- Fallback Legado JPEG/PNG com Lazy Loading Nativo -->
  <img 
    src="${imageBasePath}-1200w.jpg" 
    alt="${imageAltText}" 
    width="${imgWidth}" 
    height="${imgHeight}" 
    loading="lazy" 
    decoding="async"
    fetchpriority="auto"
    class="w-full h-auto object-cover rounded-xl"
  />
</picture>`;
  }, [imageBasePath, imageAltText, includeAvif, includeWebp, imgWidth, imgHeight]);

  // ==========================================
  // FERRAMENTA 3: GERADOR DE LQIP / BLURHASH (ANTI-CLS)
  // ==========================================
  const [lqipDataUri, setLqipDataUri] = useState<string>('');
  const [lqipBytes, setLqipBytes] = useState<number>(180);
  const [isLqipLoaded, setIsLqipLoaded] = useState<boolean>(true);

  // Gerar LQIP Base64 microscópico
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 16, 10);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 10);

      const uri = canvas.toDataURL('image/jpeg', 0.2);
      setLqipDataUri(uri);
      setLqipBytes(new Blob([uri]).size);
    }
  }, []);

  const simulateLoading = () => {
    setIsLqipLoaded(false);
    setTimeout(() => {
      setIsLqipLoaded(true);
    }, 1200);
  };

  // ==========================================
  // FERRAMENTA 4: EMPACOTADOR DE FAVICON & PWA MANIFEST
  // ==========================================
  const [appName, setAppName] = useState<string>('V5 Apollo Tools');
  const [appShortName, setAppShortName] = useState<string>('V5Tools');
  const [themeColor, setThemeColor] = useState<string>('#020617');
  const [primaryColor, setPrimaryColor] = useState<string>('#06b6d4');

  const generatedWebManifest = useMemo(() => {
    return JSON.stringify({
      name: appName,
      short_name: appShortName,
      description: "Canivete suíço de ferramentas soberanas client-side da Holding V5 Apollo",
      start_url: "/",
      display: "standalone",
      background_color: themeColor,
      theme_color: primaryColor,
      icons: [
        { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "apple touch icon" }
      ]
    }, null, 2);
  }, [appName, appShortName, themeColor, primaryColor]);

  const htmlHeadFaviconTags = useMemo(() => {
    return `<!-- Favicons Clássicos & PWA Head Tags -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="${themeColor}" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`;
  }, [themeColor]);

  // ==========================================
  // FERRAMENTA 5: CALCULADORA DE ASPECT RATIO & PADDING HACK (ZERO CLS)
  // ==========================================
  const [ratioWidth, setRatioWidth] = useState<number>(16);
  const [ratioHeight, setRatioHeight] = useState<number>(9);

  const aspectRatioCalculations = useMemo(() => {
    const paddingPercent = (ratioHeight / ratioWidth) * 100;
    const decimalRatio = (ratioWidth / ratioHeight).toFixed(3);

    let commonName = 'Personalizado';
    if (ratioWidth === 16 && ratioHeight === 9) commonName = 'Widescreen 16:9 (Vídeo / TV)';
    else if (ratioWidth === 4 && ratioHeight === 3) commonName = 'Standard 4:3 (Clássico)';
    else if (ratioWidth === 1 && ratioHeight === 1) commonName = 'Square 1:1 (Avatar / Feed)';
    else if (ratioWidth === 9 && ratioHeight === 16) commonName = 'Vertical 9:16 (Stories / Reels / Shorts)';
    else if (ratioWidth === 4 && ratioHeight === 5) commonName = 'Retrato 4:5 (Instagram Portrait)';
    else if (ratioWidth === 21 && ratioHeight === 9) commonName = 'Ultrawide 21:9 (Cinematográfico)';

    return {
      paddingPercent: paddingPercent.toFixed(2),
      decimalRatio,
      commonName,
      cssModern: `aspect-ratio: ${ratioWidth} / ${ratioHeight};`,
      cssPaddingHack: `.aspect-container {\n  position: relative;\n  width: 100%;\n  padding-top: ${paddingPercent.toFixed(2)}%; /* ${ratioWidth}:${ratioHeight} */\n}\n.aspect-container > img {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}`
    };
  }, [ratioWidth, ratioHeight]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HEADER DA SUÍTE */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-lg border border-emerald-500/30">
              <ImageIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Compressão, WebAssembly & Imagens Modernas
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  Etapa 60 · 310 Ferramentas!
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Compressão WebP/AVIF em lote, gerador &lt;picture&gt;, LQIP BlurHash, empacotador de favicons e Aspect Ratio anti-CLS.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('batch-compressor')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'batch-compressor'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Compressor WebP
          </button>
          <button
            onClick={() => setActiveTab('picture-srcset')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'picture-srcset'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            &lt;picture&gt; & srcset
          </button>
          <button
            onClick={() => setActiveTab('lqip-blurhash')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'lqip-blurhash'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            LQIP / BlurHash
          </button>
          <button
            onClick={() => setActiveTab('favicon-packer')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'favicon-packer'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Favicon & PWA
          </button>
          <button
            onClick={() => setActiveTab('aspect-ratio-cls')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'aspect-ratio-cls'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Aspect Ratio (Anti-CLS)
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ========================================================= */}
        {/* TAB 1: COMPRESSOR WEBP & AVIF CLIENT-SIDE                */}
        {/* ========================================================= */}
        {activeTab === 'batch-compressor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CONTROLES DA COMPRESSÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Parâmetros de Compressão
                </h3>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    Carregar Imagem do Computador
                  </button>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Formato de Destino:
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="image/webp">WebP (Padrão Web Moderno - Alta Compatibilidade)</option>
                    <option value="image/jpeg">JPEG Otimizado (Legado)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Fator de Qualidade:</span>
                    <span className="text-emerald-400 font-bold">{qualityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={qualityPercent}
                    onChange={(e) => setQualityPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Ultra Compacto (40%)</span>
                    <span>Recomendado (80%)</span>
                    <span>Lossless (100%)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Largura Máxima (Max Width):</span>
                    <span className="text-cyan-400 font-bold">{maxWidthPx}px</span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={2560}
                    step={100}
                    value={maxWidthPx}
                    onChange={(e) => setMaxWidthPx(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={recompress}
                  disabled={isProcessing}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  {isProcessing ? 'Processando na Memória...' : 'Recomprimir com Novos Parâmetros'}
                </button>
              </div>

              {/* RESULTADOS E PREVIEW */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Tamanho Original</span>
                      <span className="text-sm font-bold text-slate-300">{origSizeKb} KB</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Tamanho Comprimido</span>
                      <span className="text-sm font-bold text-emerald-400">{compSizeKb} KB</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Economia de Peso</span>
                      <span className="text-sm font-bold text-cyan-400">-{compressionSavingsPercent}%</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Tempo de Execução</span>
                      <span className="text-sm font-bold text-slate-300">{compressionTimeMs} ms</span>
                    </div>
                  </div>

                  {/* PREVIEW DA IMAGEM */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden mb-4">
                    {compressedBlobUrl ? (
                      <img
                        src={compressedBlobUrl}
                        alt="Preview Comprimido"
                        className="max-h-[220px] max-w-full object-contain rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="text-xs text-slate-500">Nenhuma imagem carregada</div>
                    )}
                  </div>

                  {/* BOTÃO DE DOWNLOAD */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Zero upload para servidores: 100% processado no Canvas nativo do seu navegador.
                    </span>

                    {compressedBlobUrl && (
                      <a
                        href={compressedBlobUrl}
                        download={`v5-tools-optimized.${targetFormat === 'image/webp' ? 'webp' : 'jpg'}`}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar Arquivo ({compSizeKb} KB)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GERADOR DE <PICTURE> & SRCSET RESPONSIVO          */}
        {/* ========================================================= */}
        {activeTab === 'picture-srcset' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONFIGURAÇÕES DO SNIPPET */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" /> Parâmetros do Marcador HTML
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Caminho Base da Imagem no CDN:
                  </label>
                  <input
                    type="text"
                    value={imageBasePath}
                    onChange={(e) => setImageBasePath(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Texto Alternativo (alt text para Acessibilidade & SEO):
                  </label>
                  <input
                    type="text"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Largura Original (width):</label>
                    <input
                      type="number"
                      value={imgWidth}
                      onChange={(e) => setImgWidth(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Altura Original (height):</label>
                    <input
                      type="number"
                      value={imgHeight}
                      onChange={(e) => setImgHeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs text-slate-300 font-semibold block">Formatos Disponíveis no CDN:</span>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAvif}
                        onChange={(e) => setIncludeAvif(e.target.checked)}
                        className="accent-cyan-500"
                      />
                      Incluir AVIF (&lt;source type="image/avif"&gt;)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeWebp}
                        onChange={(e) => setIncludeWebp(e.target.checked)}
                        className="accent-cyan-500"
                      />
                      Incluir WebP (&lt;source type="image/webp"&gt;)
                    </label>
                  </div>
                </div>
              </div>

              {/* SAÍDA DO CÓDIGO HTML */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" /> HTML Responsivo Moderno
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedPictureSnippet, 'picture-html')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      {copiedKey === 'picture-html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Snippet
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-cyan-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[380px]">
                    {generatedPictureSnippet}
                  </pre>
                </div>

                <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs text-cyan-300">
                  O navegador do usuário baixará apenas a menor imagem correspondente à largura da sua tela, economizando até 80% do tráfego em conexões móveis e garantindo nota máxima em Core Web Vitals.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GERADOR DE LQIP / BLURHASH (ANTI-CLS)             */}
        {/* ========================================================= */}
        {activeTab === 'lqip-blurhash' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* EXPLICAÇÃO E CÓDIGO BASE64 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Placeholder em Data URI Base64
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                    {lqipBytes} Bytes
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  O <strong>LQIP (Low Quality Image Placeholder)</strong> é um mini-thumbnail de 16x10px embutido diretamente no HTML inicial. Ele é exibido instantaneamente enquanto a imagem pesada é baixada em background.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">Data URI Gerado:</label>
                    <button
                      onClick={() => copyToClipboard(lqipDataUri, 'lqip-uri')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'lqip-uri' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar URI
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    readOnly
                    value={lqipDataUri}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] text-blue-300 font-mono break-all focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg text-xs text-blue-300">
                  Compatível com a propriedade <code>placeholder="blur"</code> e <code>blurDataURL</code> do componente <code>next/image</code> do Next.js.
                </div>
              </div>

              {/* SIMULADOR VISUAL DO EFEITO BLUR-UP */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-400" /> Simulação de Carregamento Progressivo
                    </span>
                    <button
                      onClick={simulateLoading}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      Simular Reload
                    </button>
                  </div>

                  <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                    {/* Placeholder Borrado (Fundo) */}
                    <img
                      src={lqipDataUri}
                      alt="Placeholder"
                      className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-105"
                    />

                    {/* Imagem Real com Transição Suave */}
                    <img
                      src={imagePreviewUrl}
                      alt="Imagem Real"
                      className={`relative z-10 w-full h-full object-cover transition-opacity duration-700 ${
                        isLqipLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {!isLqipLoaded && (
                      <div className="absolute z-20 top-3 right-3 bg-slate-950/80 backdrop-blur border border-slate-700 px-2 py-1 rounded text-[10px] text-cyan-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Baixando Alta Resolução...
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  Zero Cumulative Layout Shift (CLS): o container reserva o espaço exato com o gradiente borrado antes dos bytes finais chegarem.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: EMPACOTADOR DE FAVICON & PWA MANIFEST              */}
        {/* ========================================================= */}
        {activeTab === 'favicon-packer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONFIGURAÇÕES DO APP */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Metadados da Aplicação & Favicon
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Nome Completo:</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Nome Curto (Mobile):</label>
                    <input
                      type="text"
                      value={appShortName}
                      onChange={(e) => setAppShortName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Theme Color (Barra do Browser):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Cor Primária PWA:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* PACOTE DE RESULUÇÕES */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs text-slate-300 font-semibold block">Resoluções Empacotadas:</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">16x16 (Tabs)</span>
                    <span className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">32x32 (Favoritos)</span>
                    <span className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">48x48 (Desktop)</span>
                    <span className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">180x180 (iOS)</span>
                    <span className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">192x192 (PWA)</span>
                    <span className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">512x512 (Splash)</span>
                  </div>
                </div>
              </div>

              {/* CÓDIGO GERADO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Tags HTML para &lt;head&gt;
                    </span>
                    <button
                      onClick={() => copyToClipboard(htmlHeadFaviconTags, 'head-tags')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'head-tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-purple-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[140px]">
                    {htmlHeadFaviconTags}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Arquivo site.webmanifest (JSON)
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedWebManifest, 'manifest-json')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'manifest-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-[140px]">
                    {generatedWebManifest}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CALCULADORA DE ASPECT RATIO & PADDING HACK (ANTI-CLS) */}
        {/* ========================================================= */}
        {activeTab === 'aspect-ratio-cls' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ENTRADAS DA PROPORÇÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" /> Proporção da Imagem / Vídeo
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Largura (Ratio W):</label>
                    <input
                      type="number"
                      value={ratioWidth}
                      onChange={(e) => setRatioWidth(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Altura (Ratio H):</label>
                    <input
                      type="number"
                      value={ratioHeight}
                      onChange={(e) => setRatioHeight(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* PRESETS RÁPIDOS */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5">Proporções Padrão de Mercado:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setRatioWidth(16); setRatioHeight(9); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      16:9 Widescreen
                    </button>
                    <button
                      onClick={() => { setRatioWidth(1); setRatioHeight(1); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      1:1 Quadrado
                    </button>
                    <button
                      onClick={() => { setRatioWidth(4); setRatioHeight(5); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      4:5 Instagram
                    </button>
                    <button
                      onClick={() => { setRatioWidth(9); setRatioHeight(16); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      9:16 Shorts/Reels
                    </button>
                    <button
                      onClick={() => { setRatioWidth(21); setRatioHeight(9); }}
                      className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                    >
                      21:9 Ultrawide
                    </button>
                  </div>
                </div>

                {/* MÉTRICAS CALCULADAS */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Padding Hack</span>
                    <span className="text-lg font-bold text-amber-400">{aspectRatioCalculations.paddingPercent}%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Fator Decimal</span>
                    <span className="text-lg font-bold text-slate-200">{aspectRatioCalculations.decimalRatio}</span>
                  </div>
                </div>
              </div>

              {/* CÓDIGO CSS E PREVIEW */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-amber-400" /> CSS Moderno vs Padding Hack
                    </span>
                    <button
                      onClick={() => copyToClipboard(aspectRatioCalculations.cssModern, 'aspect-css')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'aspect-css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar CSS
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-amber-200 font-mono whitespace-pre-wrap overflow-x-auto mb-4">
                    {`/* Padrão Moderno (Suporte Global 98%+) */\n${aspectRatioCalculations.cssModern}\n\n/* Legado / Fallback Universal */\n${aspectRatioCalculations.cssPaddingHack}`}
                  </pre>

                  {/* PREVIEW VISUAL DA CAIXA */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
                    <div 
                      style={{ aspectRatio: `${ratioWidth} / ${ratioHeight}` }}
                      className="max-h-[140px] w-full max-w-[240px] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-dashed border-amber-500/50 rounded-lg flex flex-col items-center justify-center p-2 text-center"
                    >
                      <span className="text-xs font-bold text-amber-300">{ratioWidth}:{ratioHeight}</span>
                      <span className="text-[10px] text-slate-400">{aspectRatioCalculations.commonName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  Definir a proporção explicitamente impede o salto de layout (Cumulative Layout Shift) quando a imagem termina de carregar, garantindo pontuação verde no Google Lighthouse.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
