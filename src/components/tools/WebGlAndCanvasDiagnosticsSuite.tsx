'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Layers, 
  Sparkles, 
  Eye, 
  Sliders, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Maximize2,
  Box,
  Palette,
  Monitor
} from 'lucide-react';

interface WebGlAndCanvasDiagnosticsSuiteProps {
  defaultTab?: 'webgl-detector' | 'canvas-imagedata' | 'offscreencanvas-worker' | 'color-gamut' | 'matrix-3d';
}

export const WebGlAndCanvasDiagnosticsSuite: React.FC<WebGlAndCanvasDiagnosticsSuiteProps> = ({ 
  defaultTab = 'webgl-detector' 
}) => {
  const [activeTab, setActiveTab] = useState<'webgl-detector' | 'canvas-imagedata' | 'offscreencanvas-worker' | 'color-gamut' | 'matrix-3d'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: DETECTOR & DIAGNÓSTICO WEBGL 1.0 & 2.0
  // =========================================================================
  const [webglInfo, setWebglInfo] = useState<{
    supported: boolean;
    version: string;
    renderer: string;
    vendor: string;
    unmaskedRenderer: string;
    unmaskedVendor: string;
    shadingLanguageVersion: string;
    maxTextureSize: number;
    maxViewportDims: string;
    maxSamples: number;
    extensionsCount: number;
  }>({
    supported: false,
    version: 'Detectando...',
    renderer: '',
    vendor: '',
    unmaskedRenderer: '',
    unmaskedVendor: '',
    shadingLanguageVersion: '',
    maxTextureSize: 0,
    maxViewportDims: '',
    maxSamples: 0,
    extensionsCount: 0
  });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;

      if (!gl) {
        setWebglInfo(prev => ({ ...prev, supported: false, version: 'Não suportado no navegador' }));
        return;
      }

      const isWebgl2 = 'WebGL2RenderingContext' in window && gl instanceof WebGL2RenderingContext;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      const renderer = gl.getParameter(gl.RENDERER) || 'Desconhecido';
      const vendor = gl.getParameter(gl.VENDOR) || 'Desconhecido';
      const unmaskedRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : renderer;
      const unmaskedVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : vendor;
      const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '';
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
      const viewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
      const maxSamples = isWebgl2 ? (gl as any).getParameter((gl as any).MAX_SAMPLES) : 4;
      const extensions = gl.getSupportedExtensions() || [];

      setWebglInfo({
        supported: true,
        version: isWebgl2 ? 'WebGL 2.0 (OpenGL ES 3.0)' : 'WebGL 1.0 (OpenGL ES 2.0)',
        renderer,
        vendor,
        unmaskedRenderer,
        unmaskedVendor,
        shadingLanguageVersion,
        maxTextureSize,
        maxViewportDims: viewportDims ? `${viewportDims[0]}x${viewportDims[1]}` : 'N/A',
        maxSamples: maxSamples || 4,
        extensionsCount: extensions.length
      });
    } catch (e) {
      console.error('WebGL detection error:', e);
    }
  }, []);

  // =========================================================================
  // FERRAMENTA 2: MANIPULADOR DE MATRIZ DE PIXELS IMAGEDATA & SOBEL
  // =========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasFilter, setCanvasFilter] = useState<'normal' | 'grayscale' | 'invert' | 'threshold' | 'sobel'>('normal');
  const [thresholdVal, setThresholdVal] = useState<number>(128);

  const drawAndFilterCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Desenhar padrão de teste vetorial de alta definição
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Gradiente de fundo
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2);
    ctx.fill();

    // Texto central
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('APOLLO 5', w / 2, h / 2 - 10);
    ctx.font = '12px monospace';
    ctx.fillText('PIXEL MATRIX', w / 2, h / 2 + 15);

    if (canvasFilter === 'normal') return;

    // Obter ImageData para manipulação direta de pixels
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    if (canvasFilter === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        // ITU-R BT.709 luminância perceptiva
        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
    } else if (canvasFilter === 'invert') {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    } else if (canvasFilter === 'threshold') {
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        const v = gray >= thresholdVal ? 255 : 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
    } else if (canvasFilter === 'sobel') {
      // Convolução de bordas Sobel 3x3
      const grayscale = new Uint8ClampedArray(w * h);
      for (let i = 0; i < data.length; i += 4) {
        grayscale[i / 4] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          // Sobel Gx e Gy
          const gx = 
            -1 * grayscale[idx - w - 1] + 1 * grayscale[idx - w + 1] +
            -2 * grayscale[idx - 1]     + 2 * grayscale[idx + 1] +
            -1 * grayscale[idx + w - 1] + 1 * grayscale[idx + w + 1];

          const gy = 
            -1 * grayscale[idx - w - 1] - 2 * grayscale[idx - w] - 1 * grayscale[idx - w + 1] +
             1 * grayscale[idx + w - 1] + 2 * grayscale[idx + w] + 1 * grayscale[idx + w + 1];

          const g = Math.min(255, Math.hypot(gx, gy));
          const p = idx * 4;
          data[p] = g;
          data[p + 1] = g;
          data[p + 2] = g;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  useEffect(() => {
    drawAndFilterCanvas();
  }, [canvasFilter, thresholdVal]);

  // =========================================================================
  // FERRAMENTA 3: SIMULADOR DE OFFSCREENCANVAS & WORKER JANK-FREE
  // =========================================================================
  const [workerSimRunning, setWorkerSimRunning] = useState<boolean>(true);
  const [mainThreadBlockActive, setMainThreadBlockActive] = useState<boolean>(false);
  const [simulatedFpsMain, setSimulatedFpsMain] = useState<number>(60);
  const [simulatedFpsWorker, setSimulatedFpsWorker] = useState<number>(60);

  const triggerMainThreadJank = () => {
    setMainThreadBlockActive(true);
    setSimulatedFpsMain(14);
    setTimeout(() => {
      setSimulatedFpsMain(60);
      setMainThreadBlockActive(false);
    }, 1800);
  };

  // =========================================================================
  // FERRAMENTA 4: ANALISADOR DE GAMUT DISPLAY-P3 VS SRGB
  // =========================================================================
  const [p3Support, setP3Support] = useState<boolean>(false);
  const [sampleHexColor, setSampleHexColor] = useState<string>('#ff0033');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setP3Support(window.matchMedia('(color-gamut: p3)').matches);
    }
  }, []);

  const colorCalculations = useMemo(() => {
    const hex = sampleHexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

    // Estimativa de Display-P3 equivalente (CSS Color 4)
    const p3Color = `color(display-p3 ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)})`;

    return {
      r, g, b,
      p3Color,
      luminance: (0.2126 * r + 0.7152 * g + 0.0722 * b).toFixed(3)
    };
  }, [sampleHexColor]);

  // =========================================================================
  // FERRAMENTA 5: CONSTRUTOR DE MATRIZ DE TRANSFORMAÇÃO 3D (CSS MATRIX3D)
  // =========================================================================
  const [rotX, setRotX] = useState<number>(20);
  const [rotY, setRotY] = useState<number>(35);
  const [rotZ, setRotZ] = useState<number>(0);
  const [transZ, setTransZ] = useState<number>(0);
  const [perspective, setPerspective] = useState<number>(600);

  const matrix3dCss = useMemo(() => {
    const degToRad = (d: number) => (d * Math.PI) / 180;
    const rx = degToRad(rotX);
    const ry = degToRad(rotY);
    const rz = degToRad(rotZ);

    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);

    // Multiplicação de matrizes de rotação Euler Z * Y * X
    const m11 = cosY * cosZ;
    const m12 = cosY * sinZ;
    const m13 = -sinY;
    const m14 = 0;

    const m21 = sinX * sinY * cosZ - cosX * sinZ;
    const m22 = sinX * sinY * sinZ + cosX * cosZ;
    const m23 = sinX * cosY;
    const m24 = 0;

    const m31 = cosX * sinY * cosZ + sinX * sinZ;
    const m32 = cosX * sinY * sinZ - sinX * cosZ;
    const m33 = cosX * cosY;
    const m34 = 0;

    const m41 = 0;
    const m42 = 0;
    const m43 = transZ;
    const m44 = 1;

    const values = [
      m11.toFixed(4), m12.toFixed(4), m13.toFixed(4), m14,
      m21.toFixed(4), m22.toFixed(4), m23.toFixed(4), m24,
      m31.toFixed(4), m32.toFixed(4), m33.toFixed(4), m34,
      m41, m42, m43, m44
    ];

    return `matrix3d(${values.join(', ')})`;
  }, [rotX, rotY, rotZ, transZ]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 text-slate-200">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Suíte de Web Standards, HTML5 Canvas & WebGL Diagnostics
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono">
                  Etapa 68 · 350 Ferramentas
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Diagnóstico WebGL 2.0 unmasked, manipulador de convolução Sobel ImageData, OffscreenCanvas jank-free, Display-P3 e CSS matrix3d.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('webgl-detector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'webgl-detector' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            WebGL 2.0 Unmasked
          </button>

          <button
            onClick={() => setActiveTab('canvas-imagedata')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'canvas-imagedata' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            ImageData & Sobel
          </button>

          <button
            onClick={() => setActiveTab('offscreencanvas-worker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'offscreencanvas-worker' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            OffscreenCanvas
          </button>

          <button
            onClick={() => setActiveTab('color-gamut')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'color-gamut' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Display-P3 Gamut
          </button>

          <button
            onClick={() => setActiveTab('matrix-3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix-3d' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            CSS matrix3d()
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: DETECTOR WEBGL 2.0 UNMASKED
      ===================================================================== */}
      {activeTab === 'webgl-detector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-slate-400">Versão Suportada:</span>
              <div className="text-sm font-bold text-violet-400 mt-1">{webglInfo.version}</div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs col-span-2">
              <span className="text-slate-400">Placa Gráfica (Unmasked GPU):</span>
              <div className="text-sm font-bold text-white mt-1 truncate">{webglInfo.unmaskedRenderer || 'N/A'}</div>
              <div className="text-[10px] text-slate-500">{webglInfo.unmaskedVendor}</div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-slate-400">Max Texture Size:</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">{webglInfo.maxTextureSize} x {webglInfo.maxTextureSize} px</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">GLSL Shader Language:</span>
              <span className="text-cyan-300">{webglInfo.shadingLanguageVersion || 'GLSL ES 3.00'}</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Max MSAA Antialiasing Samples:</span>
              <span className="text-amber-300 font-bold">{webglInfo.maxSamples}x Samples</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Extensões WebGL Ativas:</span>
              <span className="text-white font-bold">{webglInfo.extensionsCount} extensões</span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: MANIPULADOR DE PIXELS IMAGEDATA & SOBEL
      ===================================================================== */}
      {activeTab === 'canvas-imagedata' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'normal', label: 'Original' },
                { id: 'grayscale', label: 'Luminância BT.709' },
                { id: 'invert', label: 'Inversão' },
                { id: 'threshold', label: 'Binarização (Threshold)' },
                { id: 'sobel', label: 'Filtro Sobel (Bordas)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCanvasFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    canvasFilter === f.id 
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 font-bold' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {canvasFilter === 'threshold' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Limiar: {thresholdVal}</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={thresholdVal}
                  onChange={e => setThresholdVal(Number(e.target.value))}
                  className="accent-violet-400"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-slate-800">
            <canvas
              ref={canvasRef}
              width={380}
              height={220}
              className="rounded-xl border border-slate-700 shadow-2xl"
            />
            <div className="text-[11px] text-slate-400 font-mono mt-3">
              Buffer 380x220 = 83.600 pixels ({83600 * 4} bytes em Uint8ClampedArray)
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SIMULADOR DE OFFSCREENCANVAS JANK-FREE
      ===================================================================== */}
      {activeTab === 'offscreencanvas-worker' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <b>Vantagem de Arquitetura:</b> Ao transferir o contexto de renderização para um Web Worker via <code className="text-cyan-300">canvas.transferControlToOffscreen()</code>, mesmo que a Main Thread do navegador congele com scripts pesados, as animações e gráficos continuam rodando fluidamente a 60 FPS.
            </div>
            <button
              onClick={triggerMainThreadJank}
              disabled={mainThreadBlockActive}
              className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold font-mono disabled:opacity-50"
            >
              {mainThreadBlockActive ? 'Main Thread Travada...' : 'Simular Bloqueio da UI'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 text-center font-mono space-y-2">
              <span className="text-xs text-slate-400">Canvas na Main Thread (Tradicional):</span>
              <div className={`text-3xl font-extrabold ${mainThreadBlockActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simulatedFpsMain} FPS
              </div>
              <div className="text-[11px] text-slate-500">
                {mainThreadBlockActive ? 'Jank detectado! Frame drops críticos.' : 'Fluido (sujeito a jank de scripts)'}
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 text-center font-mono space-y-2">
              <span className="text-xs text-slate-400">OffscreenCanvas em Web Worker:</span>
              <div className="text-3xl font-extrabold text-cyan-400">
                {simulatedFpsWorker} FPS Constante
              </div>
              <div className="text-[11px] text-slate-500">
                Zero jank! Render independente da thread da UI.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: DISPLAY-P3 GAMUT VS SRGB
      ===================================================================== */}
      {activeTab === 'color-gamut' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300">Suporte a Wide Gamut Display-P3 no seu Monitor:</span>
              <div className="text-xs text-slate-400 font-mono mt-0.5">matchMedia('(color-gamut: p3)')</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              p3Support ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {p3Support ? 'Monitor Display-P3 Ativo (+50% cores)' : 'Gamut sRGB Padrão'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4">
              <label className="text-xs font-semibold text-slate-300 block">Cor de Teste Hexadecimal</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={sampleHexColor}
                  onChange={e => setSampleHexColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={sampleHexColor}
                  onChange={e => setSampleHexColor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white flex-1"
                />
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">CSS Color 4 (Display-P3):</span>
                  <span className="text-cyan-300 select-all font-bold">{colorCalculations.p3Color}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Luminância Relativa:</span>
                  <span className="text-amber-300">{colorCalculations.luminance}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div 
                className="w-24 h-24 rounded-2xl shadow-2xl border border-white/20 transition-all"
                style={{ backgroundColor: sampleHexColor }}
              />
              <span className="text-xs text-slate-400 font-mono">
                Visualização de amostra cromática pura
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: CONSTRUTOR DE MATRIZ DE TRANSFORMAÇÃO CSS MATRIX3D()
      ===================================================================== */}
      {activeTab === 'matrix-3d' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rotação X ({rotX}°)</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotX}
                onChange={e => setRotX(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rotação Y ({rotY}°)</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotY}
                onChange={e => setRotY(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rotação Z ({rotZ}°)</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotZ}
                onChange={e => setRotZ(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Perspectiva ({perspective}px)</label>
              <input
                type="range"
                min="200"
                max="1200"
                value={perspective}
                onChange={e => setPerspective(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* VIEWPORT 3D INTERATIVO */}
            <div 
              className="h-64 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden"
              style={{ perspective: `${perspective}px` }}
            >
              <div
                className="w-32 h-32 bg-gradient-to-br from-cyan-500/40 via-violet-500/40 to-amber-500/40 border-2 border-cyan-400 rounded-2xl flex flex-col items-center justify-center font-mono text-xs font-bold text-white shadow-2xl backdrop-blur-md transition-transform"
                style={{ transform: matrix3dCss }}
              >
                <span>APOLLO 5</span>
                <span className="text-[10px] text-cyan-300 font-normal mt-1">3D MATRIX</span>
              </div>
            </div>

            {/* CÓDIGO CSS GERADO */}
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">CSS transform: matrix3d(...)</span>
                <button
                  onClick={() => copyToClipboard(`transform: perspective(${perspective}px) ${matrix3dCss};`, 'matrix3d-css')}
                  className="text-xs text-violet-400 hover:text-violet-300 font-mono flex items-center gap-1"
                >
                  {copiedKey === 'matrix3d-css' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar CSS
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-violet-300 break-all select-all border border-slate-800 leading-relaxed">
                transform: perspective({perspective}px) {matrix3dCss};
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
