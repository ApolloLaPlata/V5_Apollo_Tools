'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Video, 
  Cpu, 
  Image as ImageIcon, 
  Activity, 
  Play, 
  Square, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  Sparkles,
  Zap,
  Sliders,
  Clock,
  DollarSign
} from 'lucide-react';

interface MediaAndAudioStudioSuiteProps {
  defaultTab?: 'audio-synthesizer' | 'waveform-visualizer' | 'video-frames' | 'render-calculator' | 'favicon-pack';
}

export const MediaAndAudioStudioSuite: React.FC<MediaAndAudioStudioSuiteProps> = ({ defaultTab = 'audio-synthesizer' }) => {
  const [activeTab, setActiveTab] = useState<'audio-synthesizer' | 'waveform-visualizer' | 'video-frames' | 'render-calculator' | 'favicon-pack'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: SINTETIZADOR & EXPORTADOR DE ÁUDIO WAV 16-BIT PCM
  // ==========================================
  const [synthType, setSynthType] = useState<'sine' | 'square' | 'sawtooth' | 'triangle' | 'white-noise'>('sine');
  const [synthFreq, setSynthFreq] = useState<number>(440); // 440 Hz = Lá padrão
  const [synthDuration, setSynthDuration] = useState<number>(3); // 3 segundos
  const [synthVolume, setSynthVolume] = useState<number>(0.5);
  const [isPlayingSynth, setIsPlayingSynth] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioNode | null>(null);

  const stopAudio = () => {
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    if (activeSourceRef.current) {
      try {
        (activeSourceRef.current as any).stop?.();
        activeSourceRef.current.disconnect();
      } catch {}
      activeSourceRef.current = null;
    }
    setIsPlayingSynth(false);
  };

  const playSynthesizer = () => {
    stopAudio();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(synthVolume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (synthType === 'white-noise') {
      const bufferSize = ctx.sampleRate * synthDuration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * synthVolume;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.connect(gainNode);
      whiteNoise.start();
      activeSourceRef.current = whiteNoise;
      setIsPlayingSynth(true);
      whiteNoise.onended = () => setIsPlayingSynth(false);
    } else {
      const osc = ctx.createOscillator();
      osc.type = synthType;
      osc.frequency.setValueAtTime(synthFreq, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      activeSourceRef.current = osc;
      setIsPlayingSynth(true);
      osc.stop(ctx.currentTime + synthDuration);
      osc.onended = () => setIsPlayingSynth(false);
    }
  };

  const exportWavFile = () => {
    const sampleRate = 44100;
    const numChannels = 1;
    const numSamples = sampleRate * synthDuration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // Escreve cabeçalho RIFF/WAVE
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true); // 16 bits
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Gera amostras PCM
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      let sample = 0;
      const t = i / sampleRate;
      if (synthType === 'white-noise') {
        sample = (Math.random() * 2 - 1) * synthVolume;
      } else if (synthType === 'sine') {
        sample = Math.sin(2 * Math.PI * synthFreq * t) * synthVolume;
      } else if (synthType === 'square') {
        sample = (Math.sin(2 * Math.PI * synthFreq * t) >= 0 ? 1 : -1) * synthVolume;
      } else if (synthType === 'sawtooth') {
        sample = (2 * (t * synthFreq - Math.floor(0.5 + t * synthFreq))) * synthVolume;
      } else if (synthType === 'triangle') {
        sample = (2 * Math.abs(2 * (t * synthFreq - Math.floor(0.5 + t * synthFreq))) - 1) * synthVolume;
      }
      const s = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apollo-${synthType}-${synthFreq}Hz.wav`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ==========================================
  // FERRAMENTA 2: VISUALIZADOR DE FORMAS DE ONDA DE ÁUDIO SVG
  // ==========================================
  const [waveBarsCount, setWaveBarsCount] = useState<number>(48);
  const [waveHeight, setWaveHeight] = useState<number>(100);
  const [waveColorStart, setWaveColorStart] = useState<string>('#06b6d4');
  const [waveColorEnd, setWaveColorEnd] = useState<string>('#3b82f6');
  const [waveSeed, setWaveSeed] = useState<number>(42);

  const waveBars = React.useMemo(() => {
    const bars: number[] = [];
    for (let i = 0; i < waveBarsCount; i++) {
      const normalized = i / waveBarsCount;
      // Curva em sino com modulação harmônica
      const envelope = Math.sin(normalized * Math.PI);
      const pseudoNoise = (Math.sin(i * 1.7 + waveSeed) * 0.4 + 0.6);
      const h = Math.max(10, Math.round(envelope * pseudoNoise * (waveHeight - 10)));
      bars.push(h);
    }
    return bars;
  }, [waveBarsCount, waveHeight, waveSeed]);

  const svgWaveformCode = React.useMemo(() => {
    const width = waveBarsCount * 8;
    const rects = waveBars.map((h, i) => {
      const x = i * 8;
      const y = (waveHeight - h) / 2;
      return `  <rect x="${x}" y="${y.toFixed(1)}" width="5" height="${h}" rx="2.5" fill="url(#waveGrad)" />`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${waveHeight}" width="${width}" height="${waveHeight}">
  <defs>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${waveColorStart}" />
      <stop offset="100%" stop-color="${waveColorEnd}" />
    </linearGradient>
  </defs>
${rects}
</svg>`;
  }, [waveBars, waveBarsCount, waveHeight, waveColorStart, waveColorEnd]);

  // ==========================================
  // FERRAMENTA 3: EXTRATOR DE FRAMES DE VÍDEO (HTML5 + CANVAS)
  // ==========================================
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setCapturedFrames([]);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 0);
    }
  };

  const seekVideo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentVideoTime(time);
    }
  };

  const captureCurrentFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedFrames(prev => [dataUrl, ...prev]);
    }
  };

  // ==========================================
  // FERRAMENTA 4: CALCULADORA DE TEMPO & CUSTO DE RENDERIZAÇÃO
  // ==========================================
  const [totalFrames, setTotalFrames] = useState<number>(1800); // 1 minuto a 30fps
  const [secondsPerFrame, setSecondsPerFrame] = useState<number>(4.5); // 4.5s por frame
  const [localPowerWatts, setLocalPowerWatts] = useState<number>(450); // 450W PC Gamer
  const [energyCostKwh, setEnergyCostKwh] = useState<number>(0.95); // R$ 0,95 por kWh Brasil
  const [cloudGpuCostPerHour, setCloudGpuCostPerHour] = useState<number>(2.40); // Modal H100 $2.40/h

  const renderMetrics = React.useMemo(() => {
    const totalSeconds = totalFrames * secondsPerFrame;
    const totalHours = totalSeconds / 3600;
    const localKwh = (localPowerWatts * totalHours) / 1000;
    const localEnergyCostBrl = localKwh * energyCostKwh;
    const cloudTotalCostUsd = totalHours * cloudGpuCostPerHour;
    const cloudTotalCostBrl = cloudTotalCostUsd * 5.80; // Dólar aproximado

    // Horas e minutos formatados
    const hrs = Math.floor(totalHours);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    return {
      totalHours,
      formattedTime: `${hrs}h ${mins}min`,
      localEnergyCostBrl,
      cloudTotalCostUsd,
      cloudTotalCostBrl,
      speedupH100: Math.max(1, (secondsPerFrame / 0.8)).toFixed(1)
    };
  }, [totalFrames, secondsPerFrame, localPowerWatts, energyCostKwh, cloudGpuCostPerHour]);

  // ==========================================
  // FERRAMENTA 5: GERADOR DE PACOTES DE FAVICON MULTI-RESOLUÇÃO
  // ==========================================
  const [faviconSourceImage, setFaviconSourceImage] = useState<string | null>(null);
  const [faviconSizes, setFaviconSizes] = useState<{ size: number; label: string; dataUrl: string }[]>([]);

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;
      setFaviconSourceImage(src);

      const img = new Image();
      img.onload = () => {
        const targets = [
          { size: 16, label: '16x16 (Tab Browser)' },
          { size: 32, label: '32x32 (Padrão Desktop)' },
          { size: 48, label: '48x48 (Windows Shortcut)' },
          { size: 180, label: '180x180 (Apple Touch Icon)' },
          { size: 192, label: '192x192 (Android / PWA)' }
        ];

        const generated = targets.map(t => {
          const cvs = document.createElement('canvas');
          cvs.width = t.size;
          cvs.height = t.size;
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, t.size, t.size);
          }
          return {
            size: t.size,
            label: t.label,
            dataUrl: cvs.toDataURL('image/png')
          };
        });

        setFaviconSizes(generated);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const htmlHeadSnippet = `<!-- Apollo Favicons Pack -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">`;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Mídia, Vídeo & Áudio Studio
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="w-7 h-7 text-cyan-400" />
            Suíte de Mídia & Áudio Studio
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Sintetizador WAV 16-bit PCM, visualizador de formas de onda em SVG, extrator de frames de vídeo, calculadora de render GPU e pacote Favicon.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('audio-synthesizer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'audio-synthesizer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          Sintetizador & Exportador WAV PCM
        </button>

        <button
          onClick={() => setActiveTab('waveform-visualizer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'waveform-visualizer'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Visualizador de Formas de Onda SVG
        </button>

        <button
          onClick={() => setActiveTab('video-frames')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'video-frames'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          Extrator de Frames de Vídeo
        </button>

        <button
          onClick={() => setActiveTab('render-calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'render-calculator'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Calculadora de Render GPU/CPU
        </button>

        <button
          onClick={() => setActiveTab('favicon-pack')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'favicon-pack'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Gerador de Favicons em Lote
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: SINTETIZADOR & EXPORTADOR WAV PCM */}
        {activeTab === 'audio-synthesizer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Forma de Onda / Tipo de Som:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'sine', label: 'Senoidal' },
                      { id: 'square', label: 'Quadrada' },
                      { id: 'sawtooth', label: 'Dente Serra' },
                      { id: 'triangle', label: 'Triangular' },
                      { id: 'white-noise', label: 'Ruído Branco' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { stopAudio(); setSynthType(t.id as any); }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          synthType === t.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {synthType !== 'white-noise' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">
                        Frequência Fundamental: <span className="text-cyan-400 font-mono">{synthFreq} Hz</span>
                      </label>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Presets:</span>
                        <button onClick={() => setSynthFreq(440)} className="hover:text-cyan-400">440Hz (Lá)</button>
                        <span>·</span>
                        <button onClick={() => setSynthFreq(528)} className="hover:text-cyan-400">528Hz (Cura)</button>
                        <span>·</span>
                        <button onClick={() => setSynthFreq(1000)} className="hover:text-cyan-400">1kHz (Beep)</button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={2000}
                      step={5}
                      value={synthFreq}
                      onChange={(e) => setSynthFreq(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Duração do Áudio: <span className="text-cyan-400 font-mono">{synthDuration}s</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={synthDuration}
                      onChange={(e) => setSynthDuration(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Volume: <span className="text-cyan-400 font-mono">{Math.round(synthVolume * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={synthVolume}
                      onChange={(e) => setSynthVolume(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {isPlayingSynth ? (
                    <button
                      onClick={stopAudio}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 text-xs font-semibold transition-all"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Interromper Reprodução
                    </button>
                  ) : (
                    <button
                      onClick={playSynthesizer}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-semibold transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Tocar Sinal Sintetizado
                    </button>
                  )}

                  <button
                    onClick={exportWavFile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Baixar WAV (16-bit PCM 44.1kHz)
                  </button>
                </div>
              </div>

              {/* Informações de Especificação de Áudio */}
              <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Especificações do Sinal WAV Gerado
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2 font-mono">
                    <li>· Taxa de Amostragem: <strong className="text-slate-200">44.100 Hz (CD Quality)</strong></li>
                    <li>· Resolução de Bits: <strong className="text-slate-200">16-bit PCM Linear</strong></li>
                    <li>· Canais de Áudio: <strong className="text-slate-200">1 Canal (Mono)</strong></li>
                    <li>· Cabeçalho: <strong className="text-slate-200">RIFF / WAVE nativo</strong></li>
                    <li>· Tamanho do Arquivo: <strong className="text-cyan-400">{((44 + 44100 * synthDuration * 2) / 1024).toFixed(1)} KB</strong></li>
                  </ul>
                </div>

                <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300/80">
                  Ideal para criação de efeitos sonoros, bips de censura, ruído para isolamento acústico e calibração de monitores de áudio.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: VISUALIZADOR DE FORMAS DE ONDA DE ÁUDIO SVG */}
        {activeTab === 'waveform-visualizer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Barras Harmônicas: {waveBarsCount}
                </label>
                <input
                  type="range"
                  min={16}
                  max={96}
                  step={4}
                  value={waveBarsCount}
                  onChange={(e) => setWaveBarsCount(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Altura da Onda: {waveHeight}px
                </label>
                <input
                  type="range"
                  min={40}
                  max={160}
                  step={10}
                  value={waveHeight}
                  onChange={(e) => setWaveHeight(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Gradiente Início:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={waveColorStart}
                    onChange={(e) => setWaveColorStart(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-mono">{waveColorStart}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Gradiente Fim:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={waveColorEnd}
                    onChange={(e) => setWaveColorEnd(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-mono">{waveColorEnd}</span>
                </div>
              </div>
            </div>

            {/* Visualização da Onda */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: svgWaveformCode }} />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setWaveSeed(Math.random() * 1000)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-all"
              >
                Gerar Novo Padrão de Onda
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(svgWaveformCode, 'svg-waveform')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-blue-300 transition-all"
                >
                  {copiedKey === 'svg-waveform' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'svg-waveform' ? 'SVG Copiado!' : 'Copiar Código SVG'}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([svgWaveformCode], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `waveform-${Date.now()}.svg`;
                    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar SVG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: EXTRATOR DE FRAMES DE VÍDEO */}
        {activeTab === 'video-frames' && (
          <div className="space-y-6">
            {!videoSrc ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <Video className="w-12 h-12 text-purple-400 mb-3 opacity-60" />
                <h3 className="text-sm font-semibold text-white mb-1">Carregue um Arquivo de Vídeo</h3>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  O vídeo será reproduzido 100% no seu navegador com acesso instantâneo aos quadros exatos. Nenhum dado sobe para a internet.
                </p>
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-medium transition-all">
                  Selecionar Vídeo (.mp4, .webm, .mov)
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Player de Vídeo e Controles */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="rounded-xl overflow-hidden bg-black border border-slate-800 max-h-80 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src={videoSrc}
                        onLoadedMetadata={handleLoadedMetadata}
                        controls={false}
                        className="w-full max-h-80 object-contain"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>Tempo: {currentVideoTime.toFixed(2)}s</span>
                        <span>Duração: {videoDuration.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={videoDuration || 10}
                        step={0.05}
                        value={currentVideoTime}
                        onChange={(e) => seekVideo(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={captureCurrentFrame}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        Capturar Frame Atual (Resolução Nativa)
                      </button>

                      <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all">
                        Trocar Vídeo
                        <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Galeria de Frames Capturados */}
                  <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-semibold text-slate-200 mb-3">
                      Frames Capturados ({capturedFrames.length})
                    </h4>
                    {capturedFrames.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Nenhum frame capturado ainda. Pause o vídeo e clique em Capturar Frame.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {capturedFrames.map((frame, idx) => (
                          <div key={idx} className="relative group border border-slate-800 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={frame} alt={`Frame ${idx}`} className="w-full h-24 object-cover" />
                            <a
                              href={frame}
                              download={`apollo-frame-${idx + 1}.png`}
                              className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-xs text-purple-300 transition-opacity font-medium"
                            >
                              <Download className="w-3.5 h-3.5" /> Baixar PNG
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>
        )}

        {/* ABA 4: CALCULADORA DE TEMPO & CUSTO DE RENDERIZAÇÃO */}
        {activeTab === 'render-calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Tempo Total Estimado</span>
                <span className="text-xl font-bold text-white font-mono">{renderMetrics.formattedTime}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{renderMetrics.totalHours.toFixed(2)} horas</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Custo Energia Local</span>
                <span className="text-xl font-bold text-amber-400 font-mono">R$ {renderMetrics.localEnergyCostBrl.toFixed(2)}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{localPowerWatts}W @ R$ {energyCostKwh}/kWh</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Custo Nuvem Modal H100</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">${renderMetrics.cloudTotalCostUsd.toFixed(2)} USD</span>
                <span className="text-[11px] text-cyan-500 block mt-0.5">~R$ {renderMetrics.cloudTotalCostBrl.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Aceleração Modal H100</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{renderMetrics.speedupH100}x</span>
                <span className="text-[11px] text-emerald-500 block mt-0.5">Mais rápido que GPU local</span>
              </div>
            </div>

            {/* Parâmetros da Calculadora */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Total de Frames do Projeto:
                </label>
                <input
                  type="number"
                  value={totalFrames}
                  onChange={(e) => setTotalFrames(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Ex: 1.800 frames = 1 min a 30fps</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tempo Médio por Frame (Segundos):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={secondsPerFrame}
                  onChange={(e) => setSecondsPerFrame(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">ComfyUI FLUX ~4.5s na RTX 4090</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Consumo Médio da Máquina (Watts):
                </label>
                <input
                  type="number"
                  value={localPowerWatts}
                  onChange={(e) => setLocalPowerWatts(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">PC com GPU em 100% de carga</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: GERADOR DE PACOTES DE FAVICON EM LOTE */}
        {activeTab === 'favicon-pack' && (
          <div className="space-y-6">
            {!faviconSourceImage ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <ImageIcon className="w-12 h-12 text-emerald-400 mb-3 opacity-60" />
                <h3 className="text-sm font-semibold text-white mb-1">Carregue o Logo ou Ícone Base</h3>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  Envie uma imagem quadrada em alta resolução (PNG, JPG, SVG de preferência 512x512). Geramos automaticamente todas as resoluções de Favicon para web e mobile.
                </p>
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-medium transition-all">
                  Selecionar Imagem do Favicon
                  <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {faviconSizes.map(item => (
                    <div key={item.size} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between text-center">
                      <span className="text-[11px] font-semibold text-slate-300 block mb-2">{item.label}</span>
                      <div className="w-16 h-16 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center justify-center p-2 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.dataUrl} alt={item.label} style={{ width: item.size > 48 ? 48 : item.size, height: item.size > 48 ? 48 : item.size }} className="object-contain" />
                      </div>
                      <a
                        href={item.dataUrl}
                        download={`favicon-${item.size}x${item.size}.png`}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        <Download className="w-3 h-3" /> Baixar PNG
                      </a>
                    </div>
                  ))}
                </div>

                {/* Snippet HTML pronto para copiar */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-400">Snippet HTML para a tag &lt;head&gt;:</span>
                    <button
                      onClick={() => copyToClipboard(htmlHeadSnippet, 'favicon-head')}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      {copiedKey === 'favicon-head' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copiar Snippet HTML
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                    {htmlHeadSnippet}
                  </pre>
                </div>

                <div className="flex justify-end">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all">
                    Carregar Outro Logo
                    <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
