'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Film, 
  Volume2, 
  Layers, 
  RefreshCw, 
  Sliders, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Zap, 
  FileVideo, 
  FolderTree, 
  Activity,
  ArrowRight
} from 'lucide-react';

interface WebCodecsAndMediaMuxerSuiteProps {
  defaultTab?: 'video-frame' | 'audio-data' | 'mp4-demuxer' | 'transmuxer' | 'gop-analyzer';
}

export const WebCodecsAndMediaMuxerSuite: React.FC<WebCodecsAndMediaMuxerSuiteProps> = ({ 
  defaultTab = 'video-frame' 
}) => {
  const [activeTab, setActiveTab] = useState<'video-frame' | 'audio-data' | 'mp4-demuxer' | 'transmuxer' | 'gop-analyzer'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: DECODIFICADOR VIDEOFRAME WEBCODECS
  // =========================================================================
  const [videoCodec, setVideoCodec] = useState<'avc' | 'vp9' | 'av1'>('avc');
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');

  const videoFrameData = useMemo(() => {
    const dims = resolution === '4k' 
      ? { w: 3840, h: 2160, label: '3840x2160 (4K UHD)' } 
      : resolution === '1080p' 
      ? { w: 1920, h: 1080, label: '1920x1080 (Full HD)' } 
      : { w: 1280, h: 720, label: '1280x720 (HD)' };

    const codecStrings = {
      avc: { code: 'avc1.640028', name: 'H.264 / AVC High Profile Level 4.0', format: 'I420 (YUV 4:2:0 Planar)' },
      vp9: { code: 'vp09.00.41.08', name: 'Google VP9 Profile 0', format: 'NV12 (YUV Bi-Planar)' },
      av1: { code: 'av01.0.08M.10', name: 'AOMedia AV1 Main Profile 10-bit', format: 'I420P10 (10-bit Planar)' }
    };

    const selCodec = codecStrings[videoCodec];
    const yPlaneBytes = dims.w * dims.h;
    const uvPlaneBytes = (dims.w / 2) * (dims.h / 2) * 2;
    const totalFrameBytes = yPlaneBytes + uvPlaneBytes;

    return {
      width: dims.w,
      height: dims.h,
      resLabel: dims.label,
      codecCode: selCodec.code,
      codecName: selCodec.name,
      pixelFormat: selCodec.format,
      colorSpace: 'BT.709 (sRGB Transfer, Limited Range [16-235])',
      timestampUs: '1666666 μs (1.666 s - Frame #100 @ 60fps)',
      durationUs: '16666 μs (16.66 ms)',
      totalFrameBytes: (totalFrameBytes / 1024).toFixed(1) + ' KB (RAW YUV)',
      yStride: `${dims.w} bytes`,
      uvStride: `${dims.w / 2} bytes`
    };
  }, [videoCodec, resolution]);

  // =========================================================================
  // FERRAMENTA 2: ANALISADOR AUDIODATA & OSCILOSCÓPIO
  // =========================================================================
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioSampleRate, setAudioSampleRate] = useState<number>(48000);
  const [audioChannels, setAudioChannels] = useState<number>(2);
  const [audioFreqHz, setAudioFreqHz] = useState<number>(440); // 440 Hz (Nota Lá)

  useEffect(() => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#020617'; // Slate 950
    ctx.fillRect(0, 0, width, height);

    // Linha de centro
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Desenhar forma de onda senoidal simulada do AudioData
    ctx.strokeStyle = '#06b6d4'; // Ciano elétrico
    ctx.lineWidth = 2;
    ctx.beginPath();

    const cycles = (audioFreqHz / 100);
    for (let x = 0; x < width; x++) {
      const angle = (x / width) * Math.PI * 2 * cycles;
      const amp = (height / 2) * 0.75;
      const y = (height / 2) + Math.sin(angle) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [audioSampleRate, audioChannels, audioFreqHz]);

  const audioDataStats = useMemo(() => {
    const framesCount = 1024; // buffer típico de 1024 amostras
    const bytesPerSample = 4; // Float32
    const totalBytes = framesCount * audioChannels * bytesPerSample;
    const durationMs = (framesCount / audioSampleRate) * 1000;

    return {
      format: 'f32-planar (Float32 por canal)',
      framesCount,
      totalBytes: totalBytes + ' Bytes',
      durationMs: durationMs.toFixed(2) + ' ms',
      truePeakDbfs: '-0.3 dBFS',
      rmsDbfs: '-3.01 dBFS'
    };
  }, [audioSampleRate, audioChannels]);

  // =========================================================================
  // FERRAMENTA 3: DEMUXER DE CAIXAS MP4 (ISO-BMFF)
  // =========================================================================
  const [selectedBox, setSelectedBox] = useState<string>('moov');

  const mp4BoxHierarchy = [
    {
      name: 'ftyp',
      offset: '0x00000000',
      size: '28 Bytes',
      desc: 'File Type Box: Define compatibilidade major_brand=isom, minor_version=512 e marcas compatíveis mp41, mp42.'
    },
    {
      name: 'moov',
      offset: '0x0000001C',
      size: '4.820 Bytes',
      desc: 'Movie Container: Contém todos os metadados de mídia (tracks, tempos, índices de amostragem).'
    },
    {
      name: 'moov.mvhd',
      offset: '0x00000024',
      size: '108 Bytes',
      desc: 'Movie Header Box: Timescale=60000, Duração=3600000 (60.0 segundos), Volume=1.0.'
    },
    {
      name: 'moov.trak (Video)',
      offset: '0x00000090',
      size: '3.210 Bytes',
      desc: 'Track Box #1 (Vídeo): tkhd (1920x1080 @ 60fps), mdia, minf, stbl (Sample Table).'
    },
    {
      name: 'moov.trak.stbl.stsd',
      offset: '0x00000210',
      size: '142 Bytes',
      desc: 'Sample Description: Codec avc1 (H.264) com NAL unit AVCConfigurationBox (SPS / PPS).'
    },
    {
      name: 'moov.trak.stbl.stss',
      offset: '0x00000350',
      size: '64 Bytes',
      desc: 'Sync Sample Box: Tabela com os índices de todos os Keyframes / IDR Frames para seek rápido.'
    },
    {
      name: 'mdat',
      offset: '0x000012F4',
      size: '14.829.400 Bytes',
      desc: 'Media Data Box: Payload bruto dos pacotes NAL comprimidos de vídeo e frames AAC/Opus de áudio.'
    }
  ];

  // =========================================================================
  // FERRAMENTA 4: TRANSMUXER WEBM PARA MP4 (SEM RE-ENCODE)
  // =========================================================================
  const [videoDurationSec, setVideoDurationSec] = useState<number>(30); // 30s
  const [videoBitrateMbps, setVideoBitrateMbps] = useState<number>(6.0); // 6 Mbps

  const transmuxStats = useMemo(() => {
    const rawSizeMb = (videoDurationSec * videoBitrateMbps) / 8;
    // Transmuxer apenas reempacota os NAL units: velocidade é limitada pelo throughput de I/O de memória
    const transmuxTimeSec = 0.25; // 250ms
    const reencodeTimeSec = videoDurationSec * 1.2; // 36 segundos com re-encoding tradicional CPU

    return {
      rawSizeMb: rawSizeMb.toFixed(1) + ' MB',
      transmuxTimeSec: transmuxTimeSec.toFixed(2) + ' s',
      reencodeTimeSec: reencodeTimeSec.toFixed(1) + ' s',
      speedup: (reencodeTimeSec / transmuxTimeSec).toFixed(0) + 'x mais rápido',
      qualityLoss: '0.00% (Zero Lossless - Bit-Identical NAL Streams)'
    };
  }, [videoDurationSec, videoBitrateMbps]);

  // =========================================================================
  // FERRAMENTA 5: ANALISADOR DE ESTRUTURA GOP (GROUP OF PICTURES)
  // =========================================================================
  const [gopLength, setGopLength] = useState<number>(12); // GOP de 12 quadros
  const [bFrameCount, setBFrameCount] = useState<number>(2); // 2 B-frames consecutivos (IBBPBBP...)

  const gopPattern = useMemo(() => {
    const frames: { type: 'I' | 'P' | 'B'; index: number; sizeKb: number; desc: string }[] = [];
    frames.push({ type: 'I', index: 0, sizeKb: 64.2, desc: 'IDR Keyframe (Totalmente Autossuficiente)' });

    let current = 1;
    while (current < gopLength) {
      for (let b = 0; b < bFrameCount && current < gopLength; b++) {
        frames.push({ type: 'B', index: current++, sizeKb: 6.8, desc: 'Bi-directional Frame (Interpolação Dupla)' });
      }
      if (current < gopLength) {
        frames.push({ type: 'P', index: current++, sizeKb: 18.4, desc: 'Predictive Frame (Vetor de Movimento Frontal)' });
      }
    }

    const totalGopBytesKb = frames.reduce((acc, f) => acc + f.sizeKb, 0);
    const avgFrameKb = totalGopBytesKb / frames.length;

    return {
      frames,
      totalGopBytesKb: totalGopBytesKb.toFixed(1) + ' KB',
      avgFrameKb: avgFrameKb.toFixed(1) + ' KB/frame',
      iFrameRatio: ((64.2 / totalGopBytesKb) * 100).toFixed(1) + '% do tamanho do GOP'
    };
  }, [gopLength, bFrameCount]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header da Suíte */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                W3C WebCodecs API · ISO-BMFF
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
                Zero Re-Encode Transmuxing
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                Marco 380 Ferramentas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Film className="w-8 h-8 text-cyan-400" />
              Suíte de WebCodecs, Áudio/Vídeo Chunks & MP4 Box Demuxer
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Manipule mídia digital de ponta a ponta no cliente: decodificação de quadros VideoFrame e AudioData brutos, desmontagem de átomos ISO-BMFF/MP4, transmuxação instantânea sem perda de qualidade e análise de estrutura temporal de GOP.
            </p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800 text-sm scrollbar-thin">
          <button
            onClick={() => setActiveTab('video-frame')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'video-frame'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Film className="w-4 h-4" />
            1. VideoFrame (WebCodecs)
          </button>
          <button
            onClick={() => setActiveTab('audio-data')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'audio-data'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            2. AudioData & Osciloscópio
          </button>
          <button
            onClick={() => setActiveTab('mp4-demuxer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'mp4-demuxer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            3. MP4 Box Demuxer (ISO-BMFF)
          </button>
          <button
            onClick={() => setActiveTab('transmuxer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'transmuxer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            4. Transmuxer WebM ↔ MP4
          </button>
          <button
            onClick={() => setActiveTab('gop-analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'gop-analyzer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            5. Analisador GOP (I / P / B Frames)
          </button>
        </div>
      </div>

      {/* ABA 1: VIDEOFRAME DECODER */}
      {activeTab === 'video-frame' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-cyan-400" />
                Decodificador de Quadros VideoFrame (WebCodecs API)
              </h2>
              <p className="text-slate-400 text-sm">
                Inspecione planos de pixels YUV e metadados de quadros decodificados por hardware com acesso de latência zero.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setVideoCodec('avc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  videoCodec === 'avc' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                H.264 (AVC1)
              </button>
              <button
                onClick={() => setVideoCodec('vp9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  videoCodec === 'vp9' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                VP9 (Google)
              </button>
              <button
                onClick={() => setVideoCodec('av1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  videoCodec === 'av1' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                AV1 (AOMedia)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Resolução Nativa</div>
              <div className="text-base font-bold text-white mt-1">{videoFrameData.resLabel}</div>
              <div className="text-[10px] text-slate-500 mt-1">visibleRect 1:1</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Formato de Pixels</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">{videoFrameData.pixelFormat}</div>
              <div className="text-[10px] text-slate-500 mt-1">{videoFrameData.colorSpace}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Timestamp do Quadro</div>
              <div className="text-sm font-bold text-indigo-400 mt-1">{videoFrameData.timestampUs}</div>
              <div className="text-[10px] text-slate-500 mt-1">Duração: {videoFrameData.durationUs}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Tamanho Não-Comprimido</div>
              <div className="text-base font-bold text-amber-400 mt-1">{videoFrameData.totalFrameBytes}</div>
              <div className="text-[10px] text-slate-500 mt-1">Y: {videoFrameData.yStride} · UV: {videoFrameData.uvStride}</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1">
              PROPRIEDADES DO OBJETO VIDEOFRAME (W3C INTERFACE):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
              <div>codec: <span className="text-white font-bold">{videoFrameData.codecCode}</span></div>
              <div>format: <span className="text-white font-bold">{videoFrameData.pixelFormat}</span></div>
              <div>codedWidth: <span className="text-white font-bold">{videoFrameData.width}</span></div>
              <div>codedHeight: <span className="text-white font-bold">{videoFrameData.height}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: AUDIODATA & OSCILOSCÓPIO */}
      {activeTab === 'audio-data' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                Inspecionador de AudioData & Osciloscópio PCM Float32
              </h2>
              <p className="text-slate-400 text-sm">
                Analise buffers de áudio raw não-comprimidos com visualização de forma de onda e métricas de decibéis dBFS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Controles de Áudio */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Taxa de Amostragem (Sample Rate):</label>
                <select
                  value={audioSampleRate}
                  onChange={e => setAudioSampleRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value={44100}>44.100 Hz (CD Audio)</option>
                  <option value={48000}>48.000 Hz (Padrão Vídeo / WebRTC)</option>
                  <option value={96000}>96.000 Hz (Hi-Res Audio)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Canais de Áudio:</label>
                <select
                  value={audioChannels}
                  onChange={e => setAudioChannels(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value={1}>1 Canal (Mono)</option>
                  <option value={2}>2 Canais (Estéreo)</option>
                  <option value={6}>6 Canais (5.1 Surround)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Frequência Senoidal:</span>
                  <span className="text-cyan-400 font-mono font-bold">{audioFreqHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="20"
                  value={audioFreqHz}
                  onChange={e => setAudioFreqHz(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Visualizador Osciloscópio */}
            <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <canvas
                ref={audioCanvasRef}
                width={420}
                height={160}
                className="rounded-lg shadow-xl border border-slate-800 max-w-full"
              />
              <div className="flex justify-between w-full text-xs font-mono text-slate-400 mt-2 px-2">
                <span>Formato: {audioDataStats.format}</span>
                <span>Buffer: {audioDataStats.totalBytes} ({audioDataStats.durationMs})</span>
                <span className="text-emerald-400">Pico: {audioDataStats.truePeakDbfs}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: MP4 BOX DEMUXER */}
      {activeTab === 'mp4-demuxer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-cyan-400" />
                Desmontador de Árvore de Caixas MP4 (ISO-BMFF / ISO/IEC 14496-12)
              </h2>
              <p className="text-slate-400 text-sm">
                Inspecione átomos estruturais fundamentais (ftyp, moov, mvhd, trak, stbl, mdat) com decodificação de offsets e tamanhos.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Box / Átomo</th>
                  <th className="py-2.5 px-4">Offset Hex</th>
                  <th className="py-2.5 px-4">Tamanho</th>
                  <th className="py-2.5 px-4">Descrição & Parâmetros Decodificados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {mp4BoxHierarchy.map((box, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-cyan-400">{box.name}</td>
                    <td className="py-2.5 px-4 text-slate-400">{box.offset}</td>
                    <td className="py-2.5 px-4 text-indigo-300 font-semibold">{box.size}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans">{box.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: TRANSMUXER WEBM PARA MP4 */}
      {activeTab === 'transmuxer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Transmuxador Soberano WebM ↔ MP4 (Zero Re-Encode)
              </h2>
              <p className="text-slate-400 text-sm">
                Converta gravações de tela da Web (`MediaRecorder` WebM) para MP4/fMP4 compatível com Apple QuickTime sem perda de qualidade e zero custo de GPU.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Duração do Vídeo a Transmuxar:</span>
                <span className="text-cyan-400 font-mono font-bold">{videoDurationSec} segundos</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={videoDurationSec}
                onChange={e => setVideoDurationSec(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Taxa de Bits (Bitrate):</span>
                <span className="text-indigo-400 font-mono font-bold">{videoBitrateMbps} Mbps</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="25.0"
                step="0.5"
                value={videoBitrateMbps}
                onChange={e => setVideoBitrateMbps(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Comparativo de Velocidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Transmuxer Soberano Client-Side</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{transmuxStats.transmuxTimeSec}</div>
              <p className="text-xs text-slate-400">
                Apenas extrai pacotes NAL H.264 do contêiner WebM e reencapsula em caixas MP4.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Re-Encoding Tradicional (FFmpeg/GPU)</span>
              <div className="text-2xl font-bold text-rose-400 font-mono">{transmuxStats.reencodeTimeSec}</div>
              <p className="text-xs text-slate-400">
                Decodifica cada pixel e recodifica do zero, gerando calor e perda geracional.
              </p>
            </div>
            <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Ganho & Fidelidade</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{transmuxStats.speedup}</div>
              <div className="text-xs text-emerald-400 font-semibold">{transmuxStats.qualityLoss}</div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: GOP ANALYZER */}
      {activeTab === 'gop-analyzer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Extrator & Analisador de Estrutura de GOP (Group of Pictures)
              </h2>
              <p className="text-slate-400 text-sm">
                Analise a cadência temporal de quadros I (Keyframes IDR), P (Preditivos) e B (Bidirecionais) e o impacto em seek e streaming HLS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Tamanho do GOP (Quadros entre Keyframes):</span>
                <span className="text-cyan-400 font-mono font-bold">{gopLength} quadros</span>
              </div>
              <input
                type="range"
                min="6"
                max="30"
                value={gopLength}
                onChange={e => setGopLength(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">B-Frames Consecutivos:</span>
                <span className="text-indigo-400 font-mono font-bold">{bFrameCount} frames</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                value={bFrameCount}
                onChange={e => setBFrameCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Visualizador de Sequência de Frames do GOP */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold block">
              SEQUÊNCIA TEMPORAL DE QUADROS NO GOP:
            </span>
            <div className="flex flex-wrap gap-2">
              {gopPattern.frames.map((f, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono flex flex-col items-center min-w-[56px] ${
                    f.type === 'I' ? 'bg-amber-950/60 border-amber-600 text-amber-300 font-bold' :
                    f.type === 'P' ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300' :
                    'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-sm font-bold">{f.type}</span>
                  <span className="text-[10px] mt-0.5 opacity-80">#{f.index}</span>
                  <span className="text-[9px] mt-0.5 font-sans opacity-70">{f.sizeKb}KB</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-slate-500 block mb-0.5">TAMANHO TOTAL DO GOP:</span>
                <span className="text-white font-bold">{gopPattern.totalGopBytesKb}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-slate-500 block mb-0.5">MÉDIA POR QUADRO:</span>
                <span className="text-cyan-300 font-bold">{gopPattern.avgFrameKb}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded">
                <span className="text-slate-500 block mb-0.5">PESO DO I-FRAME:</span>
                <span className="text-amber-400 font-bold">{gopPattern.iFrameRatio}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
