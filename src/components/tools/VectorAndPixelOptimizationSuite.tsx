'use client';

import { sanitizeSvg } from '@/lib/utils/svgSanitizer';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Palette, 
  FileCode, 
  Crop, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Paintbrush, 
  Eraser, 
  Maximize2, 
  Grid, 
  Sliders, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

interface VectorAndPixelOptimizationSuiteProps {
  defaultTab?: 'svg-optimizer' | 'svg-data-uri' | 'pixel-art' | 'mesh-gradient' | 'aspect-cropper';
}

export const VectorAndPixelOptimizationSuite: React.FC<VectorAndPixelOptimizationSuiteProps> = ({ defaultTab = 'svg-optimizer' }) => {
  const [activeTab, setActiveTab] = useState<'svg-optimizer' | 'svg-data-uri' | 'pixel-art' | 'mesh-gradient' | 'aspect-cropper'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: OTIMIZADOR E SANITIZADOR DE SVG / PATH
  // ==========================================
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="100" height="100" viewBox="0 0 100 100">
  <!-- Generator: Adobe Illustrator 28.0.0, SVG Export Plug-In -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <cc:Work rdf:about="" />
    </rdf:RDF>
  </metadata>
  <defs>
    <style>.cls-1{fill:#06b6d4;}</style>
  </defs>
  <g id="Layer_1" inkscape:groupmode="layer">
    <path class="cls-1" d="M 50.123456,10.987654 L 85.555555,80.111111 L 14.444444,80.111111 Z" sodipodi:nodetypes="cccc" />
    <circle cx="50.000000" cy="55.000000" r="12.500000" fill="#f59e0b" />
  </g>
</svg>`;

  const [svgInput, setSvgInput] = useState<string>(sampleSvg);
  const [decimalPrecision, setDecimalPrecision] = useState<number>(2);
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);

  const optimizedSvgResult = useMemo(() => {
    if (!svgInput.trim()) return { text: '', origSize: 0, optSize: 0, savings: 0 };
    let cleaned = svgInput;

    if (removeComments) {
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    }

    if (removeMetadata) {
      cleaned = cleaned.replace(/<metadata>[\s\S]*?<\/metadata>/gi, '');
      cleaned = cleaned.replace(/xmlns:(?:inkscape|sodipodi|sketch|adobe)="[^"]*"/gi, '');
      cleaned = cleaned.replace(/(?:inkscape|sodipodi|sketch):[a-z0-9_-]+="[^"]*"/gi, '');
    }

    // Minify decimal precision in path d and coords
    cleaned = cleaned.replace(/(\d+\.\d{3,})/g, (match) => {
      const num = parseFloat(match);
      return num.toFixed(decimalPrecision).replace(/\.?0+$/, '');
    });

    // Remove empty groups and redundant spaces
    cleaned = cleaned.replace(/<g[^>]*>\s*<\/g>/gi, '');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.replace(/>\s+</g, '><');
    cleaned = cleaned.trim();

    const origSize = new Blob([svgInput]).size;
    const optSize = new Blob([cleaned]).size;
    const savings = origSize > 0 ? Math.max(0, ((origSize - optSize) / origSize) * 100) : 0;

    return {
      text: cleaned,
      origSize,
      optSize,
      savings: savings.toFixed(1)
    };
  }, [svgInput, decimalPrecision, removeComments, removeMetadata]);

  // ==========================================
  // FERRAMENTA 2: CONVERSOR SVG PARA CSS DATA URI
  // ==========================================
  const [dataUriInput, setDataUriInput] = useState<string>(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`);

  const dataUriResult = useMemo(() => {
    const raw = dataUriInput.trim();
    if (!raw) return { urlEncoded: '', base64: '', cssBg: '', cssMask: '', htmlImg: '' };

    // Optimized URL encoded data URI (smaller than base64 and better compression)
    const encoded = raw
      .replace(/[\n\r]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/"/g, "'");

    const urlEncoded = `data:image/svg+xml,${encoded}`;

    // Base64 alternative
    let base64 = '';
    try {
      base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(raw)))}`;
    } catch {
      base64 = 'Erro ao codificar Base64';
    }

    const cssBg = `background-image: url("${urlEncoded}");\nbackground-repeat: no-repeat;\nbackground-size: contain;`;
    const cssMask = `mask-image: url("${urlEncoded}");\n-webkit-mask-image: url("${urlEncoded}");\nmask-size: contain;`;
    const htmlImg = `<img src="${urlEncoded}" alt="SVG Icon" width="24" height="24" />`;

    return { urlEncoded, base64, cssBg, cssMask, htmlImg };
  }, [dataUriInput]);

  // ==========================================
  // FERRAMENTA 3: CONSTRUTOR DE PIXEL ART CANVAS 16x16 / 32x32
  // ==========================================
  const [gridSize, setGridSize] = useState<16 | 32>(16);
  const [pixelGrid, setPixelGrid] = useState<string[]>(() => Array(16 * 16).fill('transparent'));
  const [selectedColor, setSelectedColor] = useState<string>('#06b6d4');
  const [pixelTool, setPixelTool] = useState<'brush' | 'eraser' | 'bucket'>('brush');
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  // Paleta de cores Cyber Obsidian
  const palette = [
    '#020617', '#0f172a', '#334155', '#94a3b8', '#f8fafc',
    '#06b6d4', '#0891b2', '#10b981', '#059669', '#8b5cf6',
    '#7c3aed', '#f59e0b', '#d97706', '#ef4444', '#ec4899'
  ];

  const handleGridSizeChange = (newSize: 16 | 32) => {
    setGridSize(newSize);
    setPixelGrid(Array(newSize * newSize).fill('transparent'));
  };

  const setPixelAt = (index: number) => {
    const newGrid = [...pixelGrid];
    if (pixelTool === 'brush') {
      newGrid[index] = selectedColor;
    } else if (pixelTool === 'eraser') {
      newGrid[index] = 'transparent';
    } else if (pixelTool === 'bucket') {
      // Flood Fill
      const targetColor = pixelGrid[index];
      if (targetColor === selectedColor) return;
      
      const queue = [index];
      const visited = new Set<number>();
      
      while (queue.length > 0) {
        const curr = queue.pop()!;
        if (visited.has(curr)) continue;
        visited.add(curr);

        if (newGrid[curr] === targetColor) {
          newGrid[curr] = selectedColor;

          const row = Math.floor(curr / gridSize);
          const col = curr % gridSize;

          if (col > 0) queue.push(curr - 1);
          if (col < gridSize - 1) queue.push(curr + 1);
          if (row > 0) queue.push(curr - gridSize);
          if (row < gridSize - 1) queue.push(curr + gridSize);
        }
      }
    }
    setPixelGrid(newGrid);
  };

  const exportPixelArtPng = () => {
    const exportCanvas = document.createElement('canvas');
    const scale = 32; // 16x16 vira 512x512
    exportCanvas.width = gridSize * scale;
    exportCanvas.height = gridSize * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    for (let i = 0; i < pixelGrid.length; i++) {
      const color = pixelGrid[i];
      if (color && color !== 'transparent') {
        const col = i % gridSize;
        const row = Math.floor(i / gridSize);
        ctx.fillStyle = color;
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `pixel-art-${gridSize}x${gridSize}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // ==========================================
  // FERRAMENTA 4: GERADOR DE MESH GRADIENTS CSS
  // ==========================================
  interface MeshNode {
    id: number;
    x: number;
    y: number;
    color: string;
    radius: number;
  }

  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([
    { id: 1, x: 20, y: 25, color: '#06b6d4', radius: 45 },
    { id: 2, x: 80, y: 20, color: '#8b5cf6', radius: 55 },
    { id: 3, x: 75, y: 80, color: '#f59e0b', radius: 50 },
    { id: 4, x: 25, y: 85, color: '#10b981', radius: 45 }
  ]);
  const [meshBgColor, setMeshBgColor] = useState<string>('#020617');

  const meshCss = useMemo(() => {
    const radials = meshNodes.map(n => 
      `radial-gradient(circle at ${n.x}% ${n.y}%, ${n.color} 0%, transparent ${n.radius}%)`
    ).join(',\n    ');

    return `background-color: ${meshBgColor};\nbackground-image:\n    ${radials};`;
  }, [meshNodes, meshBgColor]);

  // ==========================================
  // FERRAMENTA 5: SIMULADOR DE ENQUADRAMENTO E CORTE SOCIAL
  // ==========================================
  const [cropAspect, setCropAspect] = useState<string>('1:1');
  const [cropImageUrl, setCropImageUrl] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropPanX, setCropPanX] = useState<number>(50);
  const [cropPanY, setCropPanY] = useState<number>(50);

  const aspectRatios: Record<string, { label: string; ratio: number; width: number; height: number }> = {
    '1:1': { label: 'Quadrado Feed Instagram (1:1)', ratio: 1, width: 1080, height: 1080 },
    '9:16': { label: 'Reels / TikTok / Stories (9:16)', ratio: 9 / 16, width: 1080, height: 1920 },
    '16:9': { label: 'YouTube Thumbnail / Twitter (16:9)', ratio: 16 / 9, width: 1920, height: 1080 },
    '4:5': { label: 'Retrato Instagram Feed (4:5)', ratio: 4 / 5, width: 1080, height: 1350 },
    '21:9': { label: 'Banner Ultrawide (21:9)', ratio: 21 / 9, width: 2560, height: 1080 }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCroppedImage = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cropImageUrl;
    img.onload = () => {
      const targetConfig = aspectRatios[cropAspect];
      const canvas = document.createElement('canvas');
      canvas.width = targetConfig.width;
      canvas.height = targetConfig.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image with zoom and pan
      const scaledWidth = img.width * cropZoom;
      const scaledHeight = img.height * cropZoom;
      const dx = (canvas.width - scaledWidth) * (cropPanX / 100);
      const dy = (canvas.height - scaledHeight) * (cropPanY / 100);

      ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);

      const link = document.createElement('a');
      link.download = `cropped-${cropAspect.replace(':', 'x')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <Palette className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-semibold">
                  Capitania #11 · Vector & Pixel Optimization Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                  100% Client-Side Graphics
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Otimização Vetorial SVG, Pixel Art & Design Canvas
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Processamento 100% no navegador via Canvas & SVG DOM</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('svg-optimizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'svg-optimizer'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Otimizador & Sanitizador SVG</span>
          </button>

          <button
            onClick={() => setActiveTab('svg-data-uri')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'svg-data-uri'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>SVG para CSS Data URI</span>
          </button>

          <button
            onClick={() => setActiveTab('pixel-art')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'pixel-art'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Pixel Art Canvas (16x16 / 32x32)</span>
          </button>

          <button
            onClick={() => setActiveTab('mesh-gradient')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'mesh-gradient'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Gerador Mesh Gradients CSS</span>
          </button>

          <button
            onClick={() => setActiveTab('aspect-cropper')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'aspect-cropper'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Crop className="w-4 h-4" />
            <span>Enquadramento Social por Proporções</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: OTIMIZADOR & SANITIZADOR SVG */}
        {/* ========================================================= */}
        {activeTab === 'svg-optimizer' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeComments}
                    onChange={(e) => setRemoveComments(e.target.checked)}
                    className="rounded border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <span>Remover Comentários & Metadados</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeMetadata}
                    onChange={(e) => setRemoveMetadata(e.target.checked)}
                    className="rounded border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <span>Sanitizar Tags Inkscape / Illustrator</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Precisão Decimal:</span>
                  <select
                    value={decimalPrecision}
                    onChange={(e) => setDecimalPrecision(parseInt(e.target.value, 10))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-teal-300 text-xs"
                  >
                    <option value={1}>1 casa (Ultra Leve)</option>
                    <option value={2}>2 casas (Recomendado)</option>
                    <option value={3}>3 casas (Alta Fidelidade)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    {optimizedSvgResult.origSize} B → <strong className="text-teal-400">{optimizedSvgResult.optSize} B</strong>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400">
                    -{optimizedSvgResult.savings}% Redução
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">SVG Original (Entrada):</label>
                  <button
                    onClick={() => setSvgInput(sampleSvg)}
                    className="text-xs text-teal-400 hover:text-teal-300 underline"
                  >
                    Restaurar Exemplo
                  </button>
                </div>
                <textarea
                  value={svgInput}
                  onChange={(e) => setSvgInput(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">SVG Otimizado & Sanitizado:</label>
                  <button
                    onClick={() => copyToClipboard(optimizedSvgResult.text, 'opt-svg')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'opt-svg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar SVG Otimizado</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={optimizedSvgResult.text}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-teal-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Preview Visual */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center gap-8">
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">Preview Original</span>
                <div 
                  className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center p-2 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgInput) }}
                />
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono text-teal-400 block mb-2">Preview Otimizado</span>
                <div 
                  className="w-24 h-24 bg-slate-900 border border-teal-900/60 rounded-xl flex items-center justify-center p-2 overflow-hidden shadow-lg shadow-teal-950/50"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(optimizedSvgResult.text) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: SVG PARA CSS DATA URI */}
        {/* ========================================================= */}
        {activeTab === 'svg-data-uri' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Markup SVG de Entrada:</label>
                <textarea
                  value={dataUriInput}
                  onChange={(e) => setDataUriInput(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                  <span className="text-xs text-slate-400">Renderização Visual do Data URI:</span>
                  <div 
                    className="w-10 h-10 border border-slate-700 rounded-lg bg-slate-900 bg-center bg-no-repeat bg-contain"
                    style={{ backgroundImage: `url("${dataUriResult.urlEncoded}")` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-teal-400">CSS background-image (Percent Encoded Otimizado):</span>
                    <button
                      onClick={() => copyToClipboard(dataUriResult.cssBg, 'css-bg')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'css-bg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-teal-300 overflow-x-auto whitespace-pre-wrap max-h-28">
                    {dataUriResult.cssBg}
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">CSS mask-image (Ícone com cor dinâmica via background-color):</span>
                    <button
                      onClick={() => copyToClipboard(dataUriResult.cssMask, 'css-mask')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'css-mask' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-24">
                    {dataUriResult.cssMask}
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">Base64 Data URI (Formato Tradicional):</span>
                    <button
                      onClick={() => copyToClipboard(dataUriResult.base64, 'uri-b64')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'uri-b64' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap truncate">
                    {dataUriResult.base64}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: PIXEL ART CANVAS (16x16 / 32x32) */}
        {/* ========================================================= */}
        {activeTab === 'pixel-art' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Resolução:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleGridSizeChange(16)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${gridSize === 16 ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    16x16 (Ícone Clássico)
                  </button>
                  <button
                    onClick={() => handleGridSizeChange(32)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${gridSize === 32 ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    32x32 (Sprite Detalhado)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPixelTool('brush')}
                  className={`p-2 rounded-lg text-xs flex items-center gap-1 ${pixelTool === 'brush' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  title="Pincel"
                >
                  <Paintbrush className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPixelTool('eraser')}
                  className={`p-2 rounded-lg text-xs flex items-center gap-1 ${pixelTool === 'eraser' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  title="Borracha"
                >
                  <Eraser className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowGridLines(!showGridLines)}
                  className={`p-2 rounded-lg text-xs flex items-center gap-1 ${showGridLines ? 'bg-slate-800 text-teal-400' : 'bg-slate-900 text-slate-500'}`}
                  title="Linhas da Grade"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPixelGrid(Array(gridSize * gridSize).fill('transparent'))}
                  className="p-2 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900/60 text-xs flex items-center gap-1"
                  title="Limpar Tudo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={exportPixelArtPng}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PNG 512px</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Paleta de Cores */}
              <div className="lg:col-span-1 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <label className="text-xs font-semibold text-slate-300 block">Paleta Cyber Obsidian:</label>
                <div className="grid grid-cols-5 gap-2">
                  {palette.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setSelectedColor(c); setPixelTool('brush'); }}
                      className={`w-8 h-8 rounded-lg border-2 transition ${
                        selectedColor === c && pixelTool === 'brush' ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="text-xs text-slate-400 block mb-1.5">Cor Customizada:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => { setSelectedColor(e.target.value); setPixelTool('brush'); }}
                      className="w-9 h-9 rounded bg-transparent cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-cyan-300">{selectedColor}</span>
                  </div>
                </div>
              </div>

              {/* Grade de Desenho */}
              <div className="lg:col-span-3 flex justify-center bg-slate-950 p-6 rounded-xl border border-slate-800">
                <div 
                  className="inline-grid select-none shadow-2xl rounded-lg overflow-hidden bg-slate-950 border border-slate-700"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    width: gridSize === 16 ? '384px' : '480px',
                    height: gridSize === 16 ? '384px' : '480px'
                  }}
                  onMouseDown={() => setIsMouseDown(true)}
                  onMouseUp={() => setIsMouseDown(false)}
                  onMouseLeave={() => setIsMouseDown(false)}
                >
                  {pixelGrid.map((color, index) => (
                    <div
                      key={index}
                      onMouseDown={() => setPixelAt(index)}
                      onMouseEnter={() => { if (isMouseDown) setPixelAt(index); }}
                      className={`cursor-crosshair transition-colors ${
                        showGridLines ? 'border-[0.5px] border-slate-800/60' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: GERADOR DE MESH GRADIENTS CSS */}
        {/* ========================================================= */}
        {activeTab === 'mesh-gradient' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Pontos de Difusão Cromática</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cor de Fundo Base:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={meshBgColor}
                      onChange={(e) => setMeshBgColor(e.target.value)}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{meshBgColor}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {meshNodes.map((node, i) => (
                    <div key={node.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-teal-400">Ponto #{i + 1}</span>
                        <input
                          type="color"
                          value={node.color}
                          onChange={(e) => {
                            const updated = [...meshNodes];
                            updated[i].color = e.target.value;
                            setMeshNodes(updated);
                          }}
                          className="w-6 h-6 rounded bg-transparent cursor-pointer border-0"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span>Posição X: {node.x}%</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={node.x}
                            onChange={(e) => {
                              const updated = [...meshNodes];
                              updated[i].x = parseInt(e.target.value, 10);
                              setMeshNodes(updated);
                            }}
                            className="w-full accent-teal-500"
                          />
                        </div>
                        <div>
                          <span>Posição Y: {node.y}%</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={node.y}
                            onChange={(e) => {
                              const updated = [...meshNodes];
                              updated[i].y = parseInt(e.target.value, 10);
                              setMeshNodes(updated);
                            }}
                            className="w-full accent-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {/* Visualizador do Mesh Gradient */}
                <div 
                  className="w-full h-72 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundColor: meshBgColor,
                    backgroundImage: meshNodes.map(n => `radial-gradient(circle at ${n.x}% ${n.y}%, ${n.color} 0%, transparent ${n.radius}%)`).join(', ')
                  }}
                >
                  <div className="backdrop-blur-md bg-slate-950/40 p-4 rounded-xl border border-white/10 text-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-teal-300 font-bold block">
                      Preview Mesh Gradient
                    </span>
                    <span className="text-xs text-slate-300 mt-1 block">
                      Renderização Orgânica Fluida
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">Regra CSS Gerada:</span>
                    <button
                      onClick={() => copyToClipboard(meshCss, 'mesh-css')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'mesh-css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>Copiar CSS</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-teal-300 overflow-x-auto whitespace-pre-wrap">
                    {meshCss}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: ENQUADRAMENTO SOCIAL POR PROPORÇÕES */}
        {/* ========================================================= */}
        {activeTab === 'aspect-cropper' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap gap-2">
                {Object.keys(aspectRatios).map((key) => (
                  <button
                    key={key}
                    onClick={() => setCropAspect(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      cropAspect === key ? 'bg-teal-600 text-white shadow-lg shadow-teal-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {aspectRatios[key].label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-400" />
                  <span>Carregar Imagem Local</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button
                  onClick={downloadCroppedImage}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Imagem Enquadrada</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200">Ajustes de Enquadramento</h4>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Zoom ({cropZoom.toFixed(2)}x):</span>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.05}
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value) || 0)}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Deslocamento Horizontal X ({cropPanX}%):</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={cropPanX}
                    onChange={(e) => setCropPanX(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-500"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Deslocamento Vertical Y ({cropPanY}%):</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={cropPanY}
                    onChange={(e) => setCropPanY(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>

              <div className="lg:col-span-3 flex justify-center items-center bg-slate-950 p-6 rounded-xl border border-slate-800 min-h-[380px]">
                {/* Visualizador Moldura */}
                <div 
                  className="relative overflow-hidden rounded-xl border-2 border-dashed border-teal-500/80 shadow-2xl bg-black flex items-center justify-center"
                  style={{
                    aspectRatio: aspectRatios[cropAspect].ratio,
                    maxHeight: '340px',
                    maxWidth: '100%'
                  }}
                >
                  <img
                    src={cropImageUrl}
                    alt="Preview de Corte"
                    className="object-cover transition-transform duration-75 select-none pointer-events-none"
                    style={{
                      transform: `scale(${cropZoom}) translate(${(cropPanX - 50) * 0.5}%, ${(cropPanY - 50) * 0.5}%)`
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-teal-300 border border-teal-500/30">
                    {aspectRatios[cropAspect].width} × {aspectRatios[cropAspect].height}
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
