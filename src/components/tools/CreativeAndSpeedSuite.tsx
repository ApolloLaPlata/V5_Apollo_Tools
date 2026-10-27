'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Globe, 
  BookOpen, 
  DollarSign, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Eraser, 
  Copy, 
  Check, 
  Clock, 
  Sun, 
  Moon, 
  Search,
  Sparkles,
  Sliders,
  TrendingUp
} from 'lucide-react';

export type CreativeSpeedTab = 'whiteboard' | 'speed-reader' | 'world-clock' | 'rhyme-finder' | 'min-salary';

export function CreativeAndSpeedSuite({ defaultTab = 'whiteboard' }: { defaultTab?: CreativeSpeedTab }) {
  const [activeTab, setActiveTab] = useState<CreativeSpeedTab>(defaultTab);
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
  // TAB 1: WHITEBOARD & CANVAS DRAWING
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#06b6d4'); // Ciano default
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (activeTab === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && !canvas.getAttribute('data-initialized')) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvas.setAttribute('data-initialized', 'true');
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#090d16' : color;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `apollo-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ==========================================
  // TAB 2: RSVP SPEED READER (SPRITZ-STYLE)
  // ==========================================
  const [speedText, setSpeedText] = useState(
    'A mente que se abre a uma nova ideia jamais voltará ao seu tamanho original. A velocidade de absorção da informação combinada com o foco visual permite absorver parágrafos inteiros em poucos segundos sem fadiga ocular. Esta técnica de RSVP alinha o ponto de fixação focal no centro da retina, multiplicando a velocidade de leitura.'
  );
  const [wpm, setWpm] = useState<number>(350);
  const [isPlayingRsvp, setIsPlayingRsvp] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const words = speedText.trim().split(/\s+/).filter(Boolean);

  useEffect(() => {
    let timer: any;
    if (isPlayingRsvp && words.length > 0) {
      const intervalMs = (60 / wpm) * 1000;
      timer = setInterval(() => {
        setWordIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlayingRsvp(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlayingRsvp, wpm, words.length]);

  const currentWord = words[wordIndex] || '';
  const midPoint = Math.floor(currentWord.length / 2);
  const leftPart = currentWord.slice(0, midPoint);
  const focalChar = currentWord.charAt(midPoint) || '';
  const rightPart = currentWord.slice(midPoint + 1);

  // ==========================================
  // TAB 3: WORLD CLOCK & FUSOS HORÁRIOS
  // ==========================================
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const WORLD_CITIES = [
    { city: 'Brasília (Brasil)', timezone: 'America/Sao_Paulo', flag: '🇧🇷', utc: 'UTC-3' },
    { city: 'Nova York (EUA)', timezone: 'America/New_York', flag: '🇺🇸', utc: 'UTC-4' },
    { city: 'Londres (Reino Unido)', timezone: 'Europe/London', flag: '🇬🇧', utc: 'UTC+1' },
    { city: 'Paris / Berlim (Europa Central)', timezone: 'Europe/Paris', flag: '🇪🇺', utc: 'UTC+2' },
    { city: 'Dubai (Emirados Árabes)', timezone: 'Asia/Dubai', flag: '🇦🇪', utc: 'UTC+4' },
    { city: 'Tóquio (Japão)', timezone: 'Asia/Tokyo', flag: '🇯🇵', utc: 'UTC+9' },
    { city: 'Sydney (Austrália)', timezone: 'Australia/Sydney', flag: '🇦🇺', utc: 'UTC+11' }
  ];

  const formatCityTime = (tz: string) => {
    try {
      const timeStr = currentTime.toLocaleTimeString('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = currentTime.toLocaleDateString('pt-BR', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short' });
      const hour = parseInt(currentTime.toLocaleTimeString('pt-BR', { timeZone: tz, hour: '2-digit', hour12: false }), 10);
      const isDay = hour >= 6 && hour < 18;
      return { timeStr, dateStr, isDay };
    } catch {
      return { timeStr: '--:--:--', dateStr: '--/--', isDay: true };
    }
  };

  // ==========================================
  // TAB 4: DICIONÁRIO DE RIMAS PT-BR
  // ==========================================
  const [rhymeQuery, setRhymeQuery] = useState('criação');
  const [rhymeResults, setRhymeResults] = useState<string[]>([]);

  const RHYME_DATABASE: Record<string, string[]> = {
    'ão': ['visão', 'emoção', 'inovação', 'direção', 'conversão', 'solução', 'paixão', 'missão', 'união', 'perfeição', 'atração', 'foguete', 'produção', 'expansão', 'retenção', 'ação', 'intenção', 'inspiração', 'conexão', 'revolução'],
    'ar': ['brilhar', 'voar', 'conquistar', 'focar', 'destacar', 'alcançar', 'criar', 'inovar', 'transformar', 'sonhar', 'vencer', 'lançar', 'avançar', 'gravar', 'acelerar', 'ganhar', 'operar', 'superar'],
    'er': ['vencer', 'poder', 'saber', 'viver', 'crescer', 'fazer', 'acontecer', 'compreender', 'entender', 'conhecer', 'valer', 'correr', 'pertencer'],
    'ir': ['subir', 'evoluir', 'seguir', 'partir', 'abrir', 'construir', 'atingir', 'decidir', 'sorrir', 'fluir', 'progredir', 'expandir', 'conduzir'],
    'ente': ['urgente', 'potente', 'mente', 'presente', 'quente', 'inteligente', 'diferente', 'eficiente', 'valente', 'consciente', 'crescente', 'gerente'],
    'eza': ['certeza', 'realeza', 'riqueza', 'clareza', 'nobreza', 'beleza', 'leveza', 'firmeza', 'natureza', 'fortaleza', 'surpresa'],
    'al': ['real', 'digital', 'genial', 'essencial', 'sensacional', 'leal', 'potencial', 'final', 'crucial', 'universal', 'espacial', 'global', 'sensual', 'atual'],
    'ivo': ['ativo', 'criativo', 'expressivo', 'decisivo', 'vivo', 'assertivo', 'definitivo', 'produtivo', 'positivo', 'coletivo', 'atrativo'],
    'ade': ['cidade', 'verdade', 'liberdade', 'velocidade', 'agilidade', 'autoridade', 'habilidade', 'lealdade', 'prosperidade', 'intensidade', 'realidade']
  };

  const handleSearchRhymes = () => {
    const q = rhymeQuery.trim().toLowerCase();
    if (!q) {
      setRhymeResults([]);
      return;
    }

    // Procura por sufixos conhecidos
    for (const suffix of ['ente', 'eza', 'ivo', 'ade', 'ão', 'ar', 'er', 'ir', 'al']) {
      if (q.endsWith(suffix)) {
        const matches = (RHYME_DATABASE[suffix] || []).filter((w) => w.toLowerCase() !== q);
        setRhymeResults(matches);
        return;
      }
    }

    // Fallback de rima por terminação de 2 a 3 letras
    const tail2 = q.slice(-2);
    const genericMatches: string[] = [];
    Object.values(RHYME_DATABASE).flat().forEach((word) => {
      if (word.endsWith(tail2) && word !== q && !genericMatches.includes(word)) {
        genericMatches.push(word);
      }
    });

    setRhymeResults(genericMatches.length > 0 ? genericMatches : ['perfeição', 'sensacional', 'produtivo', 'avançar', 'eficiente', 'clareza']);
  };

  useEffect(() => {
    handleSearchRhymes();
  }, [rhymeQuery]);

  // ==========================================
  // TAB 5: HISTÓRICO DO SALÁRIO MÍNIMO NACIONAL
  // ==========================================
  const SALARY_HISTORY = [
    { ano: '2026', valor: 'R$ 1.502,00', vigencia: '01/01/2026', lei: 'Orçamento Federal 2026', aumento: '+5.9%' },
    { ano: '2025', valor: 'R$ 1.418,00', vigencia: '01/01/2025', lei: 'Decreto 12.338/2024', aumento: '+6.9%' },
    { ano: '2024', valor: 'R$ 1.412,00', vigencia: '01/01/2024', lei: 'Decreto 11.864/2023', aumento: '+6.97%' },
    { ano: '2023 (Mai)', valor: 'R$ 1.320,00', vigencia: '01/05/2023', lei: 'MP 1.172/2023', aumento: '+1.38%' },
    { ano: '2023 (Jan)', valor: 'R$ 1.302,00', vigencia: '01/01/2023', lei: 'MP 1.143/2022', aumento: '+7.42%' },
    { ano: '2022', valor: 'R$ 1.212,00', vigencia: '01/01/2022', lei: 'MP 1.091/2021', aumento: '+10.18%' },
    { ano: '2021', valor: 'R$ 1.100,00', vigencia: '01/01/2021', lei: 'MP 1.021/2020', aumento: '+5.26%' },
    { ano: '2020', valor: 'R$ 1.045,00', vigencia: '01/02/2020', lei: 'MP 919/2020', aumento: '+0.58%' },
    { ano: '2019', valor: 'R$ 998,00', vigencia: '01/01/2019', lei: 'Decreto 9.661/2018', aumento: '+4.61%' },
    { ano: '2018', valor: 'R$ 954,00', vigencia: '01/01/2018', lei: 'Decreto 9.255/2017', aumento: '+1.81%' },
    { ano: '2015', valor: 'R$ 788,00', vigencia: '01/01/2015', lei: 'Decreto 8.381/2014', aumento: '+8.84%' },
    { ano: '2010', valor: 'R$ 510,00', vigencia: '01/01/2010', lei: 'Lei 12.255/2010', aumento: '+9.68%' },
    { ano: '2005', valor: 'R$ 300,00', vigencia: '01/05/2005', lei: 'MP 248/2005', aumento: '+15.38%' },
    { ano: '2000', valor: 'R$ 151,00', vigencia: '03/04/2000', lei: 'MP 2.019/2000', aumento: '+11.03%' },
    { ano: '1994 (Real)', valor: 'R$ 64,79', vigencia: '01/07/1994', lei: 'Plano Real / Lei 8.880', aumento: 'Implantação R$' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Suíte Criativa & Utilidades Avançadas
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Whiteboard Canvas, Leitura RSVP & Utilidades Rápidas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ferramentas interativas client-side com lousa gráfica, leitura acelerada, relógio mundial e dados históricos.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'whiteboard'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Desenhar</span>
          </button>

          <button
            onClick={() => setActiveTab('speed-reader')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'speed-reader'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Leitura RSVP</span>
          </button>

          <button
            onClick={() => setActiveTab('world-clock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'world-clock'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Relógio Mundial</span>
          </button>

          <button
            onClick={() => setActiveTab('rhyme-finder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rhyme-finder'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rimas PT-BR</span>
          </button>

          <button
            onClick={() => setActiveTab('min-salary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'min-salary'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Salário Mínimo</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6 relative z-10">
        {/* ========================================================= */}
        {/* TAB 1: WHITEBOARD CANVAS                                   */}
        {/* ========================================================= */}
        {activeTab === 'whiteboard' && (
          <div className="space-y-4">
            {/* Toolbar Superior */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Paleta de Cores */}
                <span className="text-xs font-mono text-slate-400 mr-1">Cor:</span>
                {['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      !isEraser && color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}

                <div className="h-5 w-[1px] bg-slate-800 mx-1" />

                {/* Borracha */}
                <button
                  onClick={() => setIsEraser(!isEraser)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                    isEraser
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Borracha</span>
                </button>

                {/* Espessura do Pincel */}
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs font-mono text-slate-400">Tamanho:</span>
                  <input
                    type="range"
                    min={2}
                    max={24}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-cyan-400 w-5">{brushSize}px</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
                <button
                  onClick={downloadCanvas}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PNG</span>
                </button>
              </div>
            </div>

            {/* Canvas Interativo */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#090d16] flex justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={900}
                height={480}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full max-w-full cursor-crosshair touch-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center font-mono">
              💡 Desenhe wireframes, anotações ou assinaturas. 100% renderizado na GPU local via HTML5 Canvas.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RSVP SPEED READER                                  */}
        {/* ========================================================= */}
        {activeTab === 'speed-reader' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input de Texto */}
            <div className="lg:col-span-6 space-y-3">
              <label className="text-xs font-mono text-slate-400 block font-bold">
                Texto para Leitura Acelerada (Cole seu conteúdo):
              </label>
              <textarea
                value={speedText}
                onChange={(e) => {
                  setSpeedText(e.target.value);
                  setWordIndex(0);
                  setIsPlayingRsvp(false);
                }}
                rows={8}
                placeholder="Cole um artigo, notícia ou roteiro aqui..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed"
              />

              {/* Controles de Velocidade */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Velocidade:
                  </span>
                  <span className="text-cyan-400 font-bold text-sm">{wpm} Palavras / Minuto</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={800}
                  step={25}
                  value={wpm}
                  onChange={(e) => setWpm(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>150 (Calmo)</span>
                  <span>350 (Produtivo)</span>
                  <span>550 (Veloz)</span>
                  <span>800 (Spritz Ultra)</span>
                </div>
              </div>
            </div>

            {/* Visualizador Focal RSVP */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden shadow-2xl">
                {/* Linhas Guia de Fixação Óptica */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-500/50 rounded-full" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-500/50 rounded-full" />

                {/* Palavra em Foco com ORP (Optimal Recognition Point) */}
                <div className="text-3xl sm:text-4xl font-mono tracking-wide flex items-center justify-center">
                  <span className="text-slate-400 text-right min-w-[120px]">{leftPart}</span>
                  <span className="text-cyan-400 font-extrabold px-0.5 text-4xl sm:text-5xl border-b-2 border-cyan-400">
                    {focalChar || '—'}
                  </span>
                  <span className="text-slate-400 text-left min-w-[120px]">{rightPart}</span>
                </div>

                {/* Progresso de Palavras */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Palavra {wordIndex + 1} de {words.length}</span>
                  <span>{Math.round(((wordIndex + 1) / (words.length || 1)) * 100)}% concluído</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingRsvp(!isPlayingRsvp)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl ${
                    isPlayingRsvp
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                  }`}
                >
                  {isPlayingRsvp ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pausar Leitura</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{wordIndex >= words.length - 1 ? 'Recomeçar Leitura' : 'Iniciar Leitura RSVP'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsPlayingRsvp(false);
                    setWordIndex(0);
                  }}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RELÓGIO MUNDIAL                                     */}
        {/* ========================================================= */}
        {activeTab === 'world-clock' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WORLD_CITIES.map((c) => {
                const { timeStr, dateStr, isDay } = formatCityTime(c.timezone);
                return (
                  <div
                    key={c.city}
                    className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1">
                        {isDay ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-cyan-400" />}
                        {c.utc}
                      </span>
                    </div>

                    <div className="my-3">
                      <div className="text-2xl font-black font-mono tracking-tight text-white">
                        {timeStr}
                      </div>
                      <div className="text-xs font-medium text-slate-300 mt-0.5">{c.city}</div>
                      <div className="text-[11px] font-mono text-slate-500 capitalize">{dateStr}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                      Horário Oficial Local
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DICIONÁRIO DE RIMAS PT-BR                           */}
        {/* ========================================================= */}
        {activeTab === 'rhyme-finder' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Digite uma palavra para rimar (ex: criação, vencer, brilhante, liberdade)..."
                  value={rhymeQuery}
                  onChange={(e) => setRhymeQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <button
                onClick={handleSearchRhymes}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Encontrar Rimas</span>
              </button>
            </div>

            {/* Resultados em Tags */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-400">
                  Rimas encontradas para <strong className="text-cyan-400 font-bold">"{rhymeQuery}"</strong>:
                </span>
                <span className="text-[11px] font-mono text-slate-500">{rhymeResults.length} palavras</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {rhymeResults.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyToClipboard(r, `rhyme-${idx}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-cyan-400 flex items-center gap-1.5 transition group cursor-pointer"
                  >
                    <span>{r}</span>
                    {copiedKey === `rhyme-${idx}` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-600 group-hover:text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              💡 Excelente para criação de títulos virais, rimas de hooks de retenção e roteiros para TikTok e Reels.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TABELA DO SALÁRIO MÍNIMO                           */}
        {/* ========================================================= */}
        {activeTab === 'min-salary' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">Salário Mínimo Vigente (2026):</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">R$ 1.502,00</div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-500">
                <span>Base legal: Proposta Orçamentária Federal 2026</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Ano</th>
                    <th className="py-2.5 px-4">Valor Nominal</th>
                    <th className="py-2.5 px-4">Vigência</th>
                    <th className="py-2.5 px-4">Legislação / Decreto</th>
                    <th className="py-2.5 px-4 text-right">Variação (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {SALARY_HISTORY.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2 px-4 font-bold text-slate-200">{row.ano}</td>
                      <td className="py-2 px-4 text-cyan-400 font-bold">{row.valor}</td>
                      <td className="py-2 px-4 text-slate-400">{row.vigencia}</td>
                      <td className="py-2 px-4 text-slate-500">{row.lei}</td>
                      <td className="py-2 px-4 text-right text-emerald-400">{row.aumento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
