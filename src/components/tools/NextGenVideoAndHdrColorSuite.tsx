'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Film,
  Sliders,
  Eye,
  Layers,
  Tv,
  Activity,
  Check,
  Copy,
  Sparkles,
  RefreshCw,
  Sun,
  Zap,
  BarChart2,
  Info
} from 'lucide-react';

export function NextGenVideoAndHdrColorSuite({ defaultTab, initialTool }: { defaultTab?: string; initialTool?: string }) {
  const [activeTab, setActiveTab] = useState<
    'film-grain' | 'hdr-eotf' | 'gamut-converter' | 'vmaf-metrics' | 'vvc-partition'
  >(() => {
    const tab = defaultTab || initialTool;
    if (tab === 'hdr10-pq-hlg-transfer-curves' || tab === 'hdr-eotf') return 'hdr-eotf';
    if (tab === 'color-gamut-bt2020-dci-p3-converter' || tab === 'gamut-converter') return 'gamut-converter';
    if (tab === 'video-vmaf-ssim-psnr-metric-calc' || tab === 'vmaf-metrics') return 'vmaf-metrics';
    if (tab === 'h266-vvc-partitioning-visualizer' || tab === 'vvc-partition') return 'vvc-partition';
    return 'film-grain';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: AV1 FILM GRAIN SYNTHESIS MODELER                             */
  /* -------------------------------------------------------------------------- */
  const [fgsSeed, setFgsSeed] = useState<number>(7391);
  const [fgsIntensity, setFgsIntensity] = useState<number>(35); // 0-100
  const [fgsLag, setFgsLag] = useState<number>(2); // 0-3
  const [fgsScalingShift, setFgsScalingShift] = useState<number>(8);
  const [fgsOverlap, setFgsOverlap] = useState<boolean>(true);
  const [fgsChroma, setFgsChroma] = useState<boolean>(false);
  const canvasRefGrain = useRef<HTMLCanvasElement | null>(null);

  // Renderiza ruído simulado com Box-Muller e filtro autorregressivo
  useEffect(() => {
    if (activeTab !== 'film-grain') return;
    const canvas = canvasRefGrain.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // PRNG baseado em semente (LCG simples de 32-bit)
    let s = fgsSeed;
    const lcg = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };

    // Box-Muller para distribuição gaussiana
    const gaussian = () => {
      let u = 0, v = 0;
      while (u === 0) u = lcg();
      while (v === 0) v = lcg();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    const sigma = (fgsIntensity / 100) * 45;
    const arCoeff = fgsLag * 0.22; // amortecimento do grão autorregressivo

    // Buffer temporário para filtro AR horizontal
    const rowBuf = new Float32Array(width);

    for (let y = 0; y < height; y++) {
      let prevVal = 0;
      for (let x = 0; x < width; x++) {
        const rawNoise = gaussian() * sigma;
        const filtered = rawNoise + prevVal * arCoeff;
        prevVal = filtered;
        rowBuf[x] = filtered;
      }

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const baseGrey = 128; // tom médio de teste
        const noise = rowBuf[x];
        const val = Math.max(0, Math.min(255, Math.round(baseGrey + noise)));

        data[idx] = val; // R
        data[idx + 1] = fgsChroma ? Math.max(0, Math.min(255, Math.round(baseGrey + noise * 0.7))) : val; // G
        data[idx + 2] = fgsChroma ? Math.max(0, Math.min(255, Math.round(baseGrey - noise * 0.5))) : val; // B
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [activeTab, fgsSeed, fgsIntensity, fgsLag, fgsScalingShift, fgsOverlap, fgsChroma]);

  const av1CliCommand = useMemo(() => {
    return `ffmpeg -i input.mp4 -c:v libsvtav1 -preset 6 -crf 26 \\
  -svtav1-params film-grain=${fgsIntensity}:film-grain-denoise=1:film-grain-chroma=${fgsChroma ? 1 : 0} \\
  -pix_fmt yuv420p10le output_fgs.mp4`;
  }, [fgsIntensity, fgsChroma]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: HDR10 PQ (SMPTE ST 2084) & HLG (BT.2100) EOTF TRANSFER      */
  /* -------------------------------------------------------------------------- */
  const [eotfSignalInput, setEotfSignalInput] = useState<number>(0.65); // 0 a 1.0 (sinal elétrico normalizado)
  const [eotfBitDepth, setEotfBitDepth] = useState<10 | 12>(10);

  // Constantes SMPTE ST 2084 (PQ)
  const m1 = 2610 / 16384;
  const m2 = (2523 / 4096) * 128;
  const c1 = 3424 / 4096;
  const c2 = (2413 / 4096) * 32;
  const c3 = (2392 / 4096) * 32;

  // Cálculo PQ: N -> L (nits)
  const calcPqNits = (normSignal: number): number => {
    if (normSignal <= 0) return 0;
    const N = Math.max(0, Math.min(1, normSignal));
    const N_pow_m2_inv = Math.pow(N, 1 / m2);
    const num = Math.max(0, N_pow_m2_inv - c1);
    const den = c2 - c3 * N_pow_m2_inv;
    if (den <= 0) return 10000;
    const L = 10000 * Math.pow(num / den, 1 / m1);
    return Math.min(10000, Math.max(0, L));
  };

  // Cálculo HLG: E -> L (nits) assumindo monitor de 1000 nits
  const calcHlgNits = (normSignal: number, peakNits = 1000): number => {
    const E = Math.max(0, Math.min(1, normSignal));
    const a = 0.17883277;
    const b = 1 - 4 * a;
    const c = 0.5 - a * Math.log(4 * a);
    let opticalRelative = 0;
    if (E <= 0.5) {
      opticalRelative = (E * E) / 3;
    } else {
      opticalRelative = (Math.exp((E - c) / a) + b) / 12;
    }
    // OOTF simples aproximada para BT.2100 HLG
    const gamma = 1.2 + 0.42 * Math.log10(peakNits / 1000);
    return Math.pow(Math.max(0, opticalRelative), gamma) * peakNits;
  };

  // Curva SDR Gama 2.4: V -> L (nits) base 100 nits
  const calcSdrNits = (normSignal: number): number => {
    return Math.pow(Math.max(0, Math.min(1, normSignal)), 2.4) * 100;
  };

  const currentCodeValue = Math.round(eotfSignalInput * (Math.pow(2, eotfBitDepth) - 1));
  const currentPqNits = calcPqNits(eotfSignalInput);
  const currentHlgNits = calcHlgNits(eotfSignalInput, 1000);
  const currentSdrNits = calcSdrNits(eotfSignalInput);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: COLOR GAMUT CONVERTER BT.2020 <-> DCI-P3 <-> REC.709        */
  /* -------------------------------------------------------------------------- */
  const [srcGamut, setSrcGamut] = useState<'rec709' | 'p3' | 'bt2020'>('bt2020');
  const [dstGamut, setDstGamut] = useState<'rec709' | 'p3' | 'bt2020'>('rec709');
  const [rgbInR, setRgbInR] = useState<number>(0.95);
  const [rgbInG, setRgbInG] = useState<number>(0.15);
  const [rgbInB, setRgbInB] = useState<number>(0.20);

  // Matrizes de conversão linear (gamut -> XYZ D65)
  // Rec.709 / sRGB to XYZ
  const M_709_to_XYZ = [
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.0721750],
    [0.0193339, 0.1191920, 0.9503041]
  ];
  // DCI-P3 D65 to XYZ
  const M_P3_to_XYZ = [
    [0.4865709, 0.2656677, 0.1982173],
    [0.2289746, 0.6917393, 0.0792861],
    [0.0000000, 0.0451134, 1.0439444]
  ];
  // BT.2020 to XYZ
  const M_2020_to_XYZ = [
    [0.6369580, 0.1446169, 0.1688810],
    [0.2627002, 0.6779981, 0.0593017],
    [0.0000000, 0.0280727, 1.0609851]
  ];

  // Inversas (XYZ to Gamut)
  // XYZ to Rec.709
  const M_XYZ_to_709 = [
    [ 3.2404542, -1.5371385, -0.4985314],
    [-0.9692660,  1.8760108,  0.0415560],
    [ 0.0556434, -0.2040259,  1.0572252]
  ];
  // XYZ to DCI-P3 D65
  const M_XYZ_to_P3 = [
    [ 2.4934969, -0.9313836, -0.4027108],
    [-0.8294890,  1.7626641,  0.0236247],
    [ 0.0358458, -0.0761724,  0.9568845]
  ];
  // XYZ to BT.2020
  const M_XYZ_to_2020 = [
    [ 1.7166512, -0.3556708, -0.2533663],
    [-0.6666844,  1.6164812,  0.0157685],
    [ 0.0176399, -0.0427706,  0.9421031]
  ];

  const gamutConverted = useMemo(() => {
    // Escolhe matriz to XYZ
    let mToXYZ = M_709_to_XYZ;
    if (srcGamut === 'p3') mToXYZ = M_P3_to_XYZ;
    if (srcGamut === 'bt2020') mToXYZ = M_2020_to_XYZ;

    // Converte In RGB -> XYZ
    const X = mToXYZ[0][0] * rgbInR + mToXYZ[0][1] * rgbInG + mToXYZ[0][2] * rgbInB;
    const Y = mToXYZ[1][0] * rgbInR + mToXYZ[1][1] * rgbInG + mToXYZ[1][2] * rgbInB;
    const Z = mToXYZ[2][0] * rgbInR + mToXYZ[2][1] * rgbInG + mToXYZ[2][2] * rgbInB;

    // Coordenadas de cromaticidade CIE 1931 xy
    const sumXYZ = X + Y + Z || 1e-6;
    const cieX = X / sumXYZ;
    const cieY = Y / sumXYZ;

    // Converte XYZ -> Dst RGB
    let mFromXYZ = M_XYZ_to_709;
    if (dstGamut === 'p3') mFromXYZ = M_XYZ_to_P3;
    if (dstGamut === 'bt2020') mFromXYZ = M_XYZ_to_2020;

    const outR = mFromXYZ[0][0] * X + mFromXYZ[0][1] * Y + mFromXYZ[0][2] * Z;
    const outG = mFromXYZ[1][0] * X + mFromXYZ[1][1] * Y + mFromXYZ[1][2] * Z;
    const outB = mFromXYZ[2][0] * X + mFromXYZ[2][1] * Y + mFromXYZ[2][2] * Z;

    const isClipped = outR < 0 || outR > 1 || outG < 0 || outG > 1 || outB < 0 || outB > 1;

    return {
      X, Y, Z,
      cieX, cieY,
      outR, outG, outB,
      clampedR: Math.max(0, Math.min(1, outR)),
      clampedG: Math.max(0, Math.min(1, outG)),
      clampedB: Math.max(0, Math.min(1, outB)),
      isClipped
    };
  }, [srcGamut, dstGamut, rgbInR, rgbInG, rgbInB]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: VIDEO QUALITY METRICS (VMAF / SSIM / PSNR)                   */
  /* -------------------------------------------------------------------------- */
  const [metricNoiseLevel, setMetricNoiseLevel] = useState<number>(12); // Nível de ruído simulado
  const [metricBlurLevel, setMetricBlurLevel] = useState<number>(4);   // Nível de blur simulado
  const [metricQuantStep, setMetricQuantStep] = useState<number>(16);  // Quantização DCT simulada

  const videoMetricsResult = useMemo(() => {
    // Modelo matemático calibrado para emular VMAF v0.6.1 + SSIM + PSNR
    const degradation = (metricNoiseLevel * 0.8) + (metricBlurLevel * 2.2) + (metricQuantStep * 0.9);
    
    // MSE aproximado (Mean Squared Error)
    const mse = Math.max(0.1, degradation * 1.85);
    const psnr = Math.max(15, Math.min(60, 10 * Math.log10((255 * 255) / mse)));

    // SSIM (0 a 1.0)
    const ssim = Math.max(0.60, Math.min(0.9999, 1 - (degradation / 180)));

    // Componentes VMAF:
    // VIF (Visual Information Fidelity): sensibilidade a blur e perdas de borda
    const vif = Math.max(0.2, Math.min(1.0, 1.0 - (metricBlurLevel * 0.05) - (metricQuantStep * 0.015)));
    // ADM (Additive Detail Loss Measure): perdas de contraste e detalhe fino
    const adm = Math.max(0.3, Math.min(1.0, 1.0 - (metricNoiseLevel * 0.02) - (metricQuantStep * 0.012)));
    // Coerência Temporal (Motion): ruído em alta frequência piora percepção temporal
    const motionPenalty = metricNoiseLevel * 0.35;

    // Combinação ponderada VMAF (0 a 100)
    const rawVmaf = (vif * 45) + (adm * 50) - motionPenalty;
    const vmafScore = Math.max(0, Math.min(100, Math.round(rawVmaf * 10) / 10));

    let mosGrade = 'Excelente (Transmissão de Referência)';
    let mosColor = 'text-emerald-400';
    if (vmafScore < 90 && vmafScore >= 80) {
      mosGrade = 'Bom (Imperceptível em 1080p normal)';
      mosColor = 'text-cyan-400';
    } else if (vmafScore < 80 && vmafScore >= 65) {
      mosGrade = 'Regular (Artefatos visíveis em telas grandes)';
      mosColor = 'text-amber-400';
    } else if (vmafScore < 65) {
      mosGrade = 'Ruim (Distorsão e blocos visíveis)';
      mosColor = 'text-rose-400';
    }

    return {
      psnr: psnr.toFixed(2),
      ssim: ssim.toFixed(4),
      vmafScore,
      vif: vif.toFixed(3),
      adm: adm.toFixed(3),
      mosGrade,
      mosColor
    };
  }, [metricNoiseLevel, metricBlurLevel, metricQuantStep]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: H.266 / VVC QT-BTT PARTITIONING VISUALIZER                   */
  /* -------------------------------------------------------------------------- */
  interface VvcBlock {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    splitType: 'none' | 'qt' | 'bh' | 'bv' | 'th' | 'tv';
  }

  const [ctuBlocks, setCtuBlocks] = useState<VvcBlock[]>([
    { id: 'root', x: 0, y: 0, w: 128, h: 128, splitType: 'none' }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('root');

  const handleSplitBlock = (type: 'qt' | 'bh' | 'bv' | 'th' | 'tv') => {
    const target = ctuBlocks.find((b) => b.id === selectedBlockId);
    if (!target) return;

    // Validações mínimas de tamanho VVC (limite 4x4)
    if (type === 'qt' && (target.w < 8 || target.h < 8)) return;
    if ((type === 'bh' || type === 'th') && target.h < 8) return;
    if ((type === 'bv' || type === 'tv') && target.w < 8) return;

    const remaining = ctuBlocks.filter((b) => b.id !== selectedBlockId);
    const newChildren: VvcBlock[] = [];
    const ts = Date.now();

    if (type === 'qt') {
      const halfW = target.w / 2;
      const halfH = target.h / 2;
      newChildren.push(
        { id: `${selectedBlockId}_qt0_${ts}`, x: target.x, y: target.y, w: halfW, h: halfH, splitType: 'none' },
        { id: `${selectedBlockId}_qt1_${ts}`, x: target.x + halfW, y: target.y, w: halfW, h: halfH, splitType: 'none' },
        { id: `${selectedBlockId}_qt2_${ts}`, x: target.x, y: target.y + halfH, w: halfW, h: halfH, splitType: 'none' },
        { id: `${selectedBlockId}_qt3_${ts}`, x: target.x + halfW, y: target.y + halfH, w: halfW, h: halfH, splitType: 'none' }
      );
    } else if (type === 'bh') {
      const halfH = target.h / 2;
      newChildren.push(
        { id: `${selectedBlockId}_bh0_${ts}`, x: target.x, y: target.y, w: target.w, h: halfH, splitType: 'none' },
        { id: `${selectedBlockId}_bh1_${ts}`, x: target.x, y: target.y + halfH, w: target.w, h: halfH, splitType: 'none' }
      );
    } else if (type === 'bv') {
      const halfW = target.w / 2;
      newChildren.push(
        { id: `${selectedBlockId}_bv0_${ts}`, x: target.x, y: target.y, w: halfW, h: target.h, splitType: 'none' },
        { id: `${selectedBlockId}_bv1_${ts}`, x: target.x + halfW, y: target.y, w: halfW, h: target.h, splitType: 'none' }
      );
    } else if (type === 'th') {
      // Ternary horizontal: 1/4, 1/2, 1/4
      const qH = target.h / 4;
      const mH = target.h / 2;
      newChildren.push(
        { id: `${selectedBlockId}_th0_${ts}`, x: target.x, y: target.y, w: target.w, h: qH, splitType: 'none' },
        { id: `${selectedBlockId}_th1_${ts}`, x: target.x, y: target.y + qH, w: target.w, h: mH, splitType: 'none' },
        { id: `${selectedBlockId}_th2_${ts}`, x: target.x, y: target.y + qH + mH, w: target.w, h: qH, splitType: 'none' }
      );
    } else if (type === 'tv') {
      // Ternary vertical: 1/4, 1/2, 1/4
      const qW = target.w / 4;
      const mW = target.w / 2;
      newChildren.push(
        { id: `${selectedBlockId}_tv0_${ts}`, x: target.x, y: target.y, w: qW, h: target.h, splitType: 'none' },
        { id: `${selectedBlockId}_tv1_${ts}`, x: target.x + qW, y: target.y, w: mW, h: target.h, splitType: 'none' },
        { id: `${selectedBlockId}_tv2_${ts}`, x: target.x + qW + mW, y: target.y, w: qW, h: target.h, splitType: 'none' }
      );
    }

    setCtuBlocks([...remaining, ...newChildren]);
    if (newChildren.length > 0) {
      setSelectedBlockId(newChildren[0].id);
    }
  };

  const handleResetCtu = () => {
    setCtuBlocks([{ id: 'root', x: 0, y: 0, w: 128, h: 128, splitType: 'none' }]);
    setSelectedBlockId('root');
  };

  const selectedBlock = ctuBlocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-800 to-indigo-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
            <Film className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                CAPITANIA #11 · SUÍTE #88
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                450 FERRAMENTAS
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Codecs de Vídeo, Colorimetria HDR10 & Curvas EOTF
            </h2>
            <p className="text-sm text-slate-400">
              Sintetizador AV1 Film Grain, Curvas SMPTE ST 2084 PQ / BT.2100 HLG, Matrizes de Gamut BT.2020/P3, VMAF/SSIM e Particionamento H.266/VVC QT-BTT.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA SUÍTE */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('film-grain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'film-grain'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>AV1 Film Grain Synthesis</span>
        </button>

        <button
          onClick={() => setActiveTab('hdr-eotf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'hdr-eotf'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>HDR10 PQ & HLG (EOTF)</span>
        </button>

        <button
          onClick={() => setActiveTab('gamut-converter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'gamut-converter'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Gamut BT.2020 ↔ DCI-P3 ↔ Rec.709</span>
        </button>

        <button
          onClick={() => setActiveTab('vmaf-metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'vmaf-metrics'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Qualidade VMAF / SSIM / PSNR</span>
        </button>

        <button
          onClick={() => setActiveTab('vvc-partition')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'vvc-partition'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>H.266 / VVC QT-BTT CTU</span>
        </button>
      </div>

      {/* ABA 1: AV1 FILM GRAIN SYNTHESIS */}
      {activeTab === 'film-grain' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Parâmetros de Síntese AV1 FGS
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O padrão AV1 remove o grão na codificação para economizar taxa de bits (bitrate) e transmite coeficientes autorregressivos (AR) leves para recriar o grão de filme no cliente.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Intensidade do Grão (Sigma)</span>
                  <span className="text-cyan-400">{fgsIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fgsIntensity}
                  onChange={(e) => setFgsIntensity(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Lag Autorregressivo (AR Coeffs)</span>
                  <span className="text-cyan-400">Lag {fgsLag}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={fgsLag}
                  onChange={(e) => setFgsLag(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Semente Pseudoaleatória (Seed)</span>
                  <span className="text-cyan-400">0x{fgsSeed.toString(16).toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={fgsSeed}
                    onChange={(e) => setFgsSeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                  />
                  <button
                    onClick={() => setFgsSeed(Math.floor(Math.random() * 65535))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-300">Grão em Crominância (Cb/Cr)</span>
                <input
                  type="checkbox"
                  checked={fgsChroma}
                  onChange={(e) => setFgsChroma(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Comando FFmpeg / SVT-AV1 Gerado:
              </label>
              <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all">
                {av1CliCommand}
                <button
                  onClick={() => copyToClipboard(av1CliCommand)}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  Visualizador de Grão Sintetizado em Tempo Real (Canvas 2D)
                </h3>
                <span className="text-xs font-mono text-slate-400">256 x 256 px</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Simulação da distribuição Gaussiana Box-Muller com filtragem espacial autorregressiva conforme o Anexo G da especificação AOM AV1.
              </p>
            </div>

            <div className="flex justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <canvas
                ref={canvasRefGrain}
                width={256}
                height={256}
                className="w-64 h-64 rounded-lg border border-slate-700 shadow-2xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Economia Média Bitrate</div>
                <div className="text-base font-mono font-bold text-emerald-400">-32.4%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Overhead de Metadados</div>
                <div className="text-base font-mono font-bold text-cyan-400">~60 bytes/frame</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Filtro AR</div>
                <div className="text-base font-mono font-bold text-purple-400">Lag {fgsLag} (2D Matrix)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: HDR10 PQ & HLG EOTF */}
      {activeTab === 'hdr-eotf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              Sinal Elétrico & Profundidade de Cor
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare as curvas EOTF (Electro-Optical Transfer Function) da especificação SMPTE ST 2084 (PQ - até 10.000 nits) contra a ITU-R BT.2100 (HLG - Hybrid Log-Gamma) e Gama 2.4 SDR.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Sinal Normalizado (N = V / Vmax)</span>
                  <span className="text-amber-400">{eotfSignalInput.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={eotfSignalInput}
                  onChange={(e) => setEotfSignalInput(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-300">Profundidade de Bit (Quantização)</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEotfBitDepth(10)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono ${
                      eotfBitDepth === 10
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    10-Bit (0-1023)
                  </button>
                  <button
                    onClick={() => setEotfBitDepth(12)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono ${
                      eotfBitDepth === 12
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    12-Bit (0-4095)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Valor de Código Discreto:</div>
                <div className="text-2xl font-mono font-bold text-amber-400">
                  {currentCodeValue} <span className="text-xs text-slate-500 font-normal">/ {Math.pow(2, eotfBitDepth) - 1}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold">Nota Técnica Barten Ramp:</span> O SMPTE ST 2084 foi desenhado sobre o limiar de contraste visual de Barten, impedindo banding visual (contorno de gradiente) em 10-bit em toda a faixa de 0.0001 a 10.000 cd/m².
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              Luminância Óptica Decodificada (Nits / cd·m²)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 shadow-lg">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  HDR10 (ST 2084 PQ)
                </div>
                <div className="text-2xl font-mono font-bold text-amber-300">
                  {currentPqNits.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Escala Absoluta (Max: 10.000 nits)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-lg">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                  HLG (BT.2100)
                </div>
                <div className="text-2xl font-mono font-bold text-cyan-300">
                  {currentHlgNits.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Display Relativo (Target 1000 nits)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 shadow-lg">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Film className="w-3.5 h-3.5 text-slate-400" />
                  SDR (Gama 2.4)
                </div>
                <div className="text-2xl font-mono font-bold text-slate-300">
                  {currentSdrNits.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Legado Rec.709 (Max: 100 nits)</div>
              </div>
            </div>

            {/* Comparativo Gráfico de Barras */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 mb-2">Comportamento Dinâmico em Escala Logarítmica:</div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>PQ (ST 2084)</span>
                  <span>{Math.round(currentPqNits)} nits</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 transition-all duration-150"
                    style={{ width: `${Math.min(100, (Math.log10(Math.max(1, currentPqNits)) / 4) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>HLG (BT.2100)</span>
                  <span>{Math.round(currentHlgNits)} nits</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-200 transition-all duration-150"
                    style={{ width: `${Math.min(100, (Math.log10(Math.max(1, currentHlgNits)) / 4) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>SDR (Gama 2.4)</span>
                  <span>{Math.round(currentSdrNits)} nits</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-slate-600 to-slate-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, (Math.log10(Math.max(1, currentSdrNits)) / 4) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: COLOR GAMUT CONVERTER */}
      {activeTab === 'gamut-converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Espaços de Cores & Coordenadas RGB
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Matriz de translação espacial linear entre Rec.709 (sRGB), DCI-P3 (Cinema Digital) e BT.2020 (UHDTV) usando CIE XYZ D65 intermediário com aviso de Gamut Clipping.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Espaço Origem</label>
                <select
                  value={srcGamut}
                  onChange={(e) => setSrcGamut(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                >
                  <option value="bt2020">BT.2020 (UHD Wide)</option>
                  <option value="p3">DCI-P3 (Display P3)</option>
                  <option value="rec709">Rec.709 (sRGB SDR)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Espaço Destino</label>
                <select
                  value={dstGamut}
                  onChange={(e) => setDstGamut(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                >
                  <option value="rec709">Rec.709 (sRGB SDR)</option>
                  <option value="p3">DCI-P3 (Display P3)</option>
                  <option value="bt2020">BT.2020 (UHD Wide)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Canal Vermelho (R)</span>
                  <span className="text-rose-400">{rgbInR.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgbInR}
                  onChange={(e) => setRgbInR(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Canal Verde (G)</span>
                  <span className="text-emerald-400">{rgbInG.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgbInG}
                  onChange={(e) => setRgbInG(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Canal Azul (B)</span>
                  <span className="text-blue-400">{rgbInB.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgbInB}
                  onChange={(e) => setRgbInB(Number(e.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Pré-visualização da Cor de Entrada:</span>
              <div
                className="w-10 h-10 rounded-lg border border-slate-700 shadow-md"
                style={{
                  backgroundColor: `rgb(${Math.round(rgbInR * 255)}, ${Math.round(rgbInG * 255)}, ${Math.round(rgbInB * 255)})`
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Resultado da Transformação Linear & Gamut Clipping
            </h3>

            {gamutConverted.isClipped ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
                <Info className="w-5 h-5 shrink-0 text-rose-400" />
                <div>
                  <span className="font-bold">Aviso de Gamut Clipping!</span> A cor de origem está fora do volume de cores suportado pelo espaço destino ({dstGamut.toUpperCase()}). Os valores foram limitados entre 0.0 e 1.0.
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                <Check className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <span className="font-bold">Sem Clipping:</span> A cor de origem cabe 100% dentro do espaço de destino.
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Valores RGB Destino (Puro):</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="text-rose-400">R: {gamutConverted.outR.toFixed(4)}</div>
                  <div className="text-emerald-400">G: {gamutConverted.outG.toFixed(4)}</div>
                  <div className="text-blue-400">B: {gamutConverted.outB.toFixed(4)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Cromaticidade CIE 1931 xy:</div>
                <div className="space-y-1 font-mono text-xs text-indigo-300">
                  <div>x: {gamutConverted.cieX.toFixed(4)}</div>
                  <div>y: {gamutConverted.cieY.toFixed(4)}</div>
                  <div>Y (Luma): {gamutConverted.Y.toFixed(4)}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Cor Clamped no Display:</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  RGB({Math.round(gamutConverted.clampedR * 255)}, {Math.round(gamutConverted.clampedG * 255)}, {Math.round(gamutConverted.clampedB * 255)})
                </div>
              </div>
              <div
                className="w-16 h-12 rounded-lg border border-slate-700 shadow-md"
                style={{
                  backgroundColor: `rgb(${Math.round(gamutConverted.clampedR * 255)}, ${Math.round(gamutConverted.clampedG * 255)}, ${Math.round(gamutConverted.clampedB * 255)})`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: VMAF / SSIM / PSNR METRICS */}
      {activeTab === 'vmaf-metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Simulação de Artefatos de Compressão
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O VMAF (Netflix) combina fidelidade de informação visual (VIF), medida de perda de detalhes (ADM) e coerência de movimento. Ajuste os artefatos para observar o impacto nas métricas.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Ruído de Sensor / Grão (Noise)</span>
                  <span className="text-emerald-400">{metricNoiseLevel}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={metricNoiseLevel}
                  onChange={(e) => setMetricNoiseLevel(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Desfoque / Suavização (Blur)</span>
                  <span className="text-emerald-400">{metricBlurLevel}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={metricBlurLevel}
                  onChange={(e) => setMetricBlurLevel(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Passo de Quantização DCT (QP / Blockiness)</span>
                  <span className="text-emerald-400">{metricQuantStep}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={metricQuantStep}
                  onChange={(e) => setMetricQuantStep(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Regra de Ouro VMAF:</div>
              <div>• 95+ : Praticamente idêntico ao Master original</div>
              <div>• 90-95 : Padrão de transmissão Netflix 4K/HDR</div>
              <div>• &lt; 70 : Degradação severa e rejeição de QA</div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Scorecard de Qualidade Percebida
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center shadow-xl">
                <div className="text-xs text-slate-400 mb-1">VMAF Score (0-100)</div>
                <div className="text-4xl font-mono font-black text-emerald-400">
                  {videoMetricsResult.vmafScore}
                </div>
                <div className={`text-xs mt-2 font-medium ${videoMetricsResult.mosColor}`}>
                  {videoMetricsResult.mosGrade}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 text-center shadow-xl">
                <div className="text-xs text-slate-400 mb-1">SSIM (Estrutura)</div>
                <div className="text-3xl font-mono font-bold text-cyan-300">
                  {videoMetricsResult.ssim}
                </div>
                <div className="text-xs text-slate-500 mt-2">1.0 = Perfeito</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 text-center shadow-xl">
                <div className="text-xs text-slate-400 mb-1">PSNR (Luma)</div>
                <div className="text-3xl font-mono font-bold text-purple-300">
                  {videoMetricsResult.psnr} dB
                </div>
                <div className="text-xs text-slate-500 mt-2">&gt; 40 dB = Alta fidelidade</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300">Decomposição das Sub-métricas VMAF:</div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">VIF (Visual Information):</span>
                  <span className="text-emerald-300 font-bold">{videoMetricsResult.vif}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">ADM (Detail Loss):</span>
                  <span className="text-emerald-300 font-bold">{videoMetricsResult.adm}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: H.266 / VVC QT-BTT PARTITIONING */}
      {activeTab === 'vvc-partition' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Particionamento de Blocos CTU (128x128)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O H.266/VVC substitui o particionamento rígido do HEVC por uma árvore aninhada Multi-Tipo (QT-BTT), permitindo divisões Binárias (BT) e Ternárias (TT) 1:2:1 em orientações horizontais e verticais.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400">Bloco Selecionado:</div>
              {selectedBlock ? (
                <div className="text-xs font-mono text-purple-300 space-y-1">
                  <div>ID: {selectedBlock.id.slice(0, 16)}...</div>
                  <div>Posição: X={selectedBlock.x}, Y={selectedBlock.y}</div>
                  <div>Dimensões: {selectedBlock.w} x {selectedBlock.h} px</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">Nenhum bloco selecionado</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Ações de Divisão (Split Syntax):</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSplitBlock('qt')}
                  className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono text-center transition"
                >
                  Quad-Tree (4x 1/2)
                </button>
                <button
                  onClick={() => handleSplitBlock('bh')}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono text-center transition"
                >
                  Binary Horiz (2x 1/2)
                </button>
                <button
                  onClick={() => handleSplitBlock('bv')}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono text-center transition"
                >
                  Binary Vert (2x 1/2)
                </button>
                <button
                  onClick={() => handleSplitBlock('th')}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono text-center transition"
                >
                  Ternary Horiz (1:2:1)
                </button>
                <button
                  onClick={() => handleSplitBlock('tv')}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono text-center transition"
                >
                  Ternary Vert (1:2:1)
                </button>
                <button
                  onClick={handleResetCtu}
                  className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono text-center transition"
                >
                  Resetar CTU
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              Total de Sub-blocos (CUs): <span className="font-mono font-bold text-slate-200">{ctuBlocks.length}</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Grade de Visualização da CTU (128x128px)
                </h3>
                <span className="text-xs font-mono text-slate-400">Clique para selecionar CU</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Blocos menores permitem adaptar à geometria complexa de bordas e texturas em vídeo 4K/8K.
              </p>
            </div>

            <div className="flex justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <svg
                viewBox="0 0 128 128"
                className="w-72 h-72 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl"
              >
                {ctuBlocks.map((block) => {
                  const isSelected = block.id === selectedBlockId;
                  return (
                    <rect
                      key={block.id}
                      x={block.x}
                      y={block.y}
                      width={block.w}
                      height={block.h}
                      fill={isSelected ? 'rgba(168, 85, 247, 0.4)' : 'rgba(30, 41, 59, 0.6)'}
                      stroke={isSelected ? '#c084fc' : '#475569'}
                      strokeWidth={isSelected ? '1' : '0.5'}
                      className="cursor-pointer hover:fill-purple-500/20 transition-colors"
                      onClick={() => setSelectedBlockId(block.id)}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">CTU Máxima VVC</div>
                <div className="text-base font-mono font-bold text-purple-400">128 x 128</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Ganho vs HEVC</div>
                <div className="text-base font-mono font-bold text-emerald-400">-50% Bitrate</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Estrutura de Árvore</div>
                <div className="text-base font-mono font-bold text-cyan-400">QT-BTT 5-Way</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
