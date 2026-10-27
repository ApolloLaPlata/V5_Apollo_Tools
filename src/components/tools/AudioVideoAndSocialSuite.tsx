'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Radio, 
  Music, 
  Maximize, 
  Sparkles, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  TrendingUp, 
  Sliders, 
  RotateCcw,
  Video,
  Film,
  Zap
} from 'lucide-react';

export type AudioVideoSocialTab = 'tone-generator' | 'aspect-ratio' | 'bpm-metronome' | 'negative-prompts' | 'engagement-calc';

export function AudioVideoAndSocialSuite({ defaultTab = 'tone-generator' }: { defaultTab?: AudioVideoSocialTab }) {
  const [activeTab, setActiveTab] = useState<AudioVideoSocialTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: GERADOR DE FREQUÊNCIAS & RUÍDO BRANCO (WEB AUDIO API)
  // ==========================================
  const [frequency, setFrequency] = useState<number>(440); // 440Hz (Lá padrão afinação)
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [isPlayingTone, setIsPlayingTone] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.2);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const toggleTone = () => {
    if (isPlayingTone) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlayingTone(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioContextClass();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
        setIsPlayingTone(true);
      } catch (err) {
        console.error('Erro ao iniciar áudio:', err);
      }
    }
  };

  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    }
  }, [frequency]);

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
    };
  }, []);

  // ==========================================
  // TAB 2: CALCULADORA DE ASPECT RATIO & RESOLUÇÃO
  // ==========================================
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [selectedRatio, setSelectedRatio] = useState<string>('16:9');

  const PRESET_RATIOS = [
    { label: '16:9 (YouTube / Widescreen)', w: 16, h: 9, defW: 1920, defH: 1080, name: '16:9' },
    { label: '9:16 (Shorts / Reels / TikTok)', w: 9, h: 16, defW: 1080, defH: 1920, name: '9:16' },
    { label: '1:1 (Quadrado / Feed Insta)', w: 1, h: 1, defW: 1080, defH: 1080, name: '1:1' },
    { label: '4:5 (Retrato Instagram)', w: 4, h: 5, defW: 1080, defH: 1350, name: '4:5' },
    { label: '21:9 (Ultrawide Cinema)', w: 21, h: 9, defW: 2560, defH: 1080, name: '21:9' }
  ];

  const handleRatioSelect = (item: typeof PRESET_RATIOS[0]) => {
    setSelectedRatio(item.name);
    setWidth(item.defW);
    setHeight(item.defH);
  };

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    const parts = selectedRatio.split(':').map(Number);
    if (parts.length === 2 && parts[0] > 0) {
      setHeight(Math.round((newW * parts[1]) / parts[0]));
    }
  };

  const getMegapixels = () => ((width * height) / 1000000).toFixed(2);

  // ==========================================
  // TAB 3: METRÔNOMO & TAP TEMPO BPM
  // ==========================================
  const [bpm, setBpm] = useState<number>(120);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState<boolean>(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const metronomeTimerRef = useRef<any>(null);

  const handleTapTempo = () => {
    const now = Date.now();
    const newTaps = [...tapTimes.slice(-4), now];
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgMs);
      if (calculatedBpm >= 40 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  const playClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  useEffect(() => {
    if (isPlayingMetronome) {
      const intervalMs = (60 / bpm) * 1000;
      metronomeTimerRef.current = setInterval(playClick, intervalMs);
    } else {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    }
    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [isPlayingMetronome, bpm]);

  // ==========================================
  // TAB 4: CONSTRUTOR DE PROMPTS NEGATIVOS (IA)
  // ==========================================
  const [selectedNegatives, setSelectedNegatives] = useState<string[]>([
    'deformed',
    'bad anatomy',
    'extra limbs',
    'blurry',
    'low resolution',
    'watermark',
    'duplicate'
  ]);

  const NEGATIVE_CATEGORIES = {
    'Anatomia Humana': ['deformed', 'bad anatomy', 'extra limbs', 'missing fingers', 'bad hands', 'mutated', 'extra eyes', 'disfigured'],
    'Qualidade & Artefatos': ['low resolution', 'blurry', 'pixelated', 'jpeg artifacts', 'noisy', 'oversaturated', 'underexposed'],
    'Texto & Marcas': ['watermark', 'signature', 'logo', 'text', 'caption', 'username', 'trademark'],
    'Estilo & 3D Falso': ['plastic skin', 'doll', 'cgi render', 'fake look', 'cartoonish', 'unrealistic', 'airbrushed']
  };

  const toggleNegativeTag = (tag: string) => {
    setSelectedNegatives((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const compiledNegativePrompt = selectedNegatives.join(', ');

  // ==========================================
  // TAB 5: CALCULADORA DE ENGAJAMENTO SOCIAL
  // ==========================================
  const [seguidores, setSeguidores] = useState<number>(25000);
  const [curtidas, setCurtidas] = useState<number>(1200);
  const [comentarios, setComentarios] = useState<number>(85);
  const [compartilhamentos, setCompartilhamentos] = useState<number>(45);

  const calculateEngagement = () => {
    if (!seguidores || seguidores <= 0) return { taxa: 0, status: 'Dados insuficientes', color: 'text-slate-400' };
    const totalInteracoes = curtidas + comentarios + compartilhamentos;
    const taxa = Number(((totalInteracoes / seguidores) * 100).toFixed(2));

    let status = 'Baixo (Abaixo da média)';
    let color = 'text-amber-400';

    if (taxa >= 3.5 && taxa < 6) {
      status = 'Bom (Média saudável de mercado)';
      color = 'text-cyan-400';
    } else if (taxa >= 6) {
      status = 'Excelente (Alto engajamento viral)';
      color = 'text-emerald-400';
    }

    return { taxa, status, color };
  };

  const engResult = calculateEngagement();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Suíte Audiovisual, Áudio & Social Media
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Frequências Sonoras, Aspect Ratio, Metrônomo & Prompts IA
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ferramentas com Web Audio API, cálculos de renderização de vídeo e métricas de criadores.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tone-generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tone-generator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Gerar Frequência</span>
          </button>

          <button
            onClick={() => setActiveTab('aspect-ratio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'aspect-ratio'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Aspect Ratio</span>
          </button>

          <button
            onClick={() => setActiveTab('bpm-metronome')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bpm-metronome'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Metrônomo BPM</span>
          </button>

          <button
            onClick={() => setActiveTab('negative-prompts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'negative-prompts'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Prompt Negativo IA</span>
          </button>

          <button
            onClick={() => setActiveTab('engagement-calc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'engagement-calc'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Engajamento Social</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6 relative z-10">
        {/* ========================================================= */}
        {/* TAB 1: GERADOR DE FREQUÊNCIAS                             */}
        {/* ========================================================= */}
        {activeTab === 'tone-generator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400 font-bold">Frequência em Hertz (Hz):</span>
                <span className="text-xl font-mono font-black text-white">{frequency} Hz</span>
              </div>

              <input
                type="range"
                min={20}
                max={20000}
                step={1}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: 'Sub-Grave (60Hz)', hz: 60 },
                  { label: 'Grave (120Hz)', hz: 120 },
                  { label: 'Afinação Lá (440Hz)', hz: 440 },
                  { label: 'Médio (1000Hz)', hz: 1000 },
                  { label: 'Desentupir Speaker (165Hz)', hz: 165 },
                  { label: 'Agudo (10kHz)', hz: 10000 }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setFrequency(item.hz)}
                    className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-mono text-slate-400 block mb-1">Forma de Onda:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sine', 'square', 'sawtooth', 'triangle'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setWaveType(w)}
                      className={`py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                        waveType === w
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {w === 'sine' ? 'Senoidal' : w === 'square' ? 'Quadrada' : w === 'sawtooth' ? 'Dente' : 'Triangular'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controle de Play & Volume */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Volume do Sinal:</span>
                  <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <button
                onClick={toggleTone}
                className={`w-full py-4 rounded-xl font-bold text-sm font-mono flex items-center justify-center gap-2 transition shadow-xl ${
                  isPlayingTone
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                {isPlayingTone ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Interromper Sinal de Áudio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Emitir Frequência ({frequency} Hz)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] font-mono text-slate-500 text-center">
                💡 Síntese sonora senoidal pura 100% no cliente via Web Audio API.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ASPECT RATIO & RESOLUÇÃO                           */}
        {/* ========================================================= */}
        {activeTab === 'aspect-ratio' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_RATIOS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleRatioSelect(item)}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    selectedRatio === item.name
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="text-sm font-mono font-black">{item.name}</span>
                  <span className="text-[10px] opacity-80">{item.defW}x{item.defH}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Largura (Pixels):</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Altura Calculada (Pixels):</label>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-cyan-400 font-bold">
                  {height} px
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Total de Pixels:</span>
                <span className="text-white font-bold">{getMegapixels()} Megapixels</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Padrão:</span>
                <span className="text-cyan-400 font-bold">{width >= 3840 ? '4K Ultra HD' : width >= 1920 ? 'Full HD (1080p)' : 'HD (720p)'}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Bitrate Recomendado:</span>
                <span className="text-emerald-400 font-bold">{width >= 3840 ? '35-45 Mbps' : width >= 1920 ? '12-16 Mbps' : '6 Mbps'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: METRÔNOMO & TAP TEMPO                              */}
        {/* ========================================================= */}
        {activeTab === 'bpm-metronome' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
              <div className="text-5xl font-black font-mono text-cyan-400 tracking-tight">
                {bpm} <span className="text-sm text-slate-500 font-normal">BPM</span>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <input
                  type="range"
                  min={40}
                  max={240}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={() => setIsPlayingMetronome(!isPlayingMetronome)}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition ${
                    isPlayingMetronome
                      ? 'bg-rose-500 text-white'
                      : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  }`}
                >
                  {isPlayingMetronome ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingMetronome ? 'Parar' : 'Iniciar'}</span>
                </button>

                <button
                  onClick={handleTapTempo}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-bold text-xs font-mono transition active:scale-95"
                >
                  TAP TEMPO
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
              <span className="text-slate-400 font-bold block">Tabela de Delay / Reverb para Edição:</span>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">1/4 de Tempo (Semínima):</span>
                  <span className="text-white font-bold">{Math.round(60000 / bpm)} ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">1/8 de Tempo (Colcheia):</span>
                  <span className="text-white font-bold">{Math.round(30000 / bpm)} ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">1/16 de Tempo (Semicolcheia):</span>
                  <span className="text-white font-bold">{Math.round(15000 / bpm)} ms</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                💡 Calcule o tempo de batida para sincronizar cortes de vídeo no Premiere ou efeitos sonoros no V5 Sound.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CONSTRUTOR DE PROMPTS NEGATIVOS                    */}
        {/* ========================================================= */}
        {activeTab === 'negative-prompts' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">Prompt Negativo Compilado:</span>
                <button
                  onClick={() => copyToClipboard(compiledNegativePrompt, 'neg-prompt')}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono flex items-center gap-1 transition"
                >
                  {copiedKey === 'neg-prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Prompt</span>
                </button>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 break-words leading-relaxed">
                {compiledNegativePrompt || '// Nenhum termo negativo selecionado'}
              </div>
            </div>

            {/* Categorias de Tags */}
            <div className="space-y-3">
              {Object.entries(NEGATIVE_CATEGORIES).map(([cat, tags]) => (
                <div key={cat} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 font-bold block mb-2">{cat}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleNegativeTag(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                          selectedNegatives.includes(t)
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CALCULADORA DE ENGAJAMENTO SOCIAL                  */}
        {/* ========================================================= */}
        {activeTab === 'engagement-calc' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold block">Métricas da Postagem:</span>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Seguidores / Inscritos Totais:</label>
                <input
                  type="number"
                  value={seguidores}
                  onChange={(e) => setSeguidores(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Curtidas:</label>
                  <input
                    type="number"
                    value={curtidas}
                    onChange={(e) => setCurtidas(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Comentários:</label>
                  <input
                    type="number"
                    value={comentarios}
                    onChange={(e) => setComentarios(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Shares:</label>
                  <input
                    type="number"
                    value={compartilhamentos}
                    onChange={(e) => setCompartilhamentos(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Resultado do Engajamento */}
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between items-center text-center space-y-3">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Taxa Real de Engajamento:</span>
                <span className={`text-4xl font-black font-mono ${engResult.color}`}>
                  {engResult.taxa}%
                </span>
                <span className="text-xs font-mono text-slate-400 block mt-2 font-bold">
                  {engResult.status}
                </span>
              </div>

              <p className="text-[11px] font-mono text-slate-500 leading-relaxed max-w-xs">
                Média de mercado para Instagram/TikTok: 1.5% a 3.5% (Média), acima de 5% (Viral/Excelente).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
