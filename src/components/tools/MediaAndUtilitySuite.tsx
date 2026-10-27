'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  Keyboard, 
  Monitor, 
  FileEdit, 
  Download, 
  Upload, 
  Sliders, 
  Play, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Sparkles, 
  Trash2,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export type MediaUtilityTab = 'canvas-image' | 'typing-wpm' | 'monitor-tester' | 'notepad-local';

const SAMPLE_TEXTS = [
  "A tecnologia e a inteligência artificial estão redefinindo as fronteiras da produtividade moderna e da soberania digital.",
  "Desenvolver sistemas rápidos e intuitivos requer atenção constante à experiência do usuário e ao desempenho do código.",
  "O método de melhoria contínua transforma pequenos passos diários em grandes conquistas estratégicas a longo prazo.",
  "A clareza de pensamento e o foco disciplinado são as ferramentas mais poderosas de um desenvolvedor de alto nível."
];

export function MediaAndUtilitySuite({ defaultTab = 'canvas-image' }: { defaultTab?: MediaUtilityTab }) {
  const [activeTab, setActiveTab] = useState<MediaUtilityTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
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
  // TAB 1: CANVAS IMAGE RESIZE & FILTERS STATE
  // ==========================================
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(800);
  const [imgHeight, setImgHeight] = useState<number>(600);
  const [keepAspect, setKeepAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(800 / 600);
  const [imgFilter, setImgFilter] = useState<'none' | 'grayscale' | 'sepia' | 'invert'>('none');
  const [imgBrightness, setImgBrightness] = useState<number>(100);
  const [imgContrast, setImgContrast] = useState<number>(100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setImageSrc(url);
        const img = new Image();
        img.onload = () => {
          originalImageRef.current = img;
          setImgWidth(img.width);
          setImgHeight(img.height);
          setAspectRatio(img.width / img.height);
          applyCanvasTransformation(img, img.width, img.height, imgFilter, imgBrightness, imgContrast);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCanvasTransformation = (
    img: HTMLImageElement,
    w: number,
    h: number,
    filter: string,
    brightness: number,
    contrast: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let filterString = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (filter === 'grayscale') filterString += ' grayscale(100%)';
    else if (filter === 'sepia') filterString += ' sepia(100%)';
    else if (filter === 'invert') filterString += ' invert(100%)';

    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, w, h);
  };

  useEffect(() => {
    if (originalImageRef.current) {
      applyCanvasTransformation(
        originalImageRef.current,
        imgWidth,
        imgHeight,
        imgFilter,
        imgBrightness,
        imgContrast
      );
    }
  }, [imgWidth, imgHeight, imgFilter, imgBrightness, imgContrast]);

  const handleWidthChange = (val: number) => {
    setImgWidth(val);
    if (keepAspect && aspectRatio) {
      setImgHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setImgHeight(val);
    if (keepAspect && aspectRatio) {
      setImgWidth(Math.round(val * aspectRatio));
    }
  };

  const downloadProcessedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `v5-tools-image-${imgWidth}x${imgHeight}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ==========================================
  // TAB 2: TESTE DE DIGITAÇÃO WPM STATE
  // ==========================================
  const [targetSentence, setTargetSentence] = useState<string>(SAMPLE_TEXTS[0]);
  const [userInput, setUserInput] = useState<string>('');
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const resetTypingTest = () => {
    const nextIdx = (SAMPLE_TEXTS.indexOf(targetSentence) + 1) % SAMPLE_TEXTS.length;
    setTargetSentence(SAMPLE_TEXTS[nextIdx]);
    setUserInput('');
    setTestStarted(false);
    setStartTime(null);
    setEndTime(null);
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!testStarted) {
      setTestStarted(true);
      setStartTime(Date.now());
    }

    setUserInput(val);

    if (val === targetSentence) {
      setEndTime(Date.now());
    }
  };

  const typingStats = useMemo(() => {
    if (!startTime) return { wpm: 0, accuracy: 100, elapsedSec: 0 };
    const currentEnd = endTime || Date.now();
    const elapsedMinutes = (currentEnd - startTime) / 60000;

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetSentence[i]) {
        correctChars++;
      }
    }

    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
    const wordsTyped = correctChars / 5; // Padrão internacional de 5 caracteres por palavra
    const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    const elapsedSec = Math.round((currentEnd - startTime) / 1000);

    return { wpm, accuracy, elapsedSec };
  }, [userInput, startTime, endTime, targetSentence]);

  // ==========================================
  // TAB 3: TESTADOR DE MONITOR & DEAD PIXELS STATE
  // ==========================================
  const [monitorColor, setMonitorColor] = useState<string>('#FFFFFF');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const colorsToTest = [
    { label: 'Branco Puro', hex: '#FFFFFF', desc: 'Identifica dead pixels escuros e poeira no painel' },
    { label: 'Preto Puro', hex: '#000000', desc: 'Identifica stuck pixels brilhantes e vazamento de backlight' },
    { label: 'Vermelho Primário', hex: '#FF0000', desc: 'Testa subpixels vermelhos' },
    { label: 'Verde Primário', hex: '#00FF00', desc: 'Testa subpixels verdes' },
    { label: 'Azul Primário', hex: '#0000FF', desc: 'Testa subpixels azuis' },
    { label: 'Cinza 50%', hex: '#808080', desc: 'Verifica uniformidade de cinza (Banding e DSE)' }
  ];

  // ==========================================
  // TAB 4: NOTEPAD ONLINE LOCALSTORAGE STATE
  // ==========================================
  const [notepadText, setNotepadText] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('v5_tools_notepad');
      if (saved) {
        setNotepadText(saved);
      }
    } catch {}
  }, []);

  const handleNotepadChange = (val: string) => {
    setNotepadText(val);
    try { localStorage.setItem('v5_tools_notepad', val); } catch {}
  };

  const downloadNotepad = () => {
    const blob = new Blob([notepadText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `nota-apollo-${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const notepadStats = useMemo(() => {
    const chars = notepadText.length;
    const words = notepadText.trim() ? notepadText.trim().split(/\s+/).length : 0;
    const lines = notepadText ? notepadText.split('\n').length : 0;
    return { chars, words, lines };
  }, [notepadText]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Cyberpunk de Fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
              Benchmark Invertexto · Mídia, Hardware & Produtividade
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              100% Client-Side
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
            Mídia Canvas, Teste WPM, Testador de Monitor & Notepad
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Processamento de imagem em Canvas, teste de digitação em tempo real, checagem de tela e bloco de notas local.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('canvas-image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'canvas-image'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Editor Canvas
          </button>
          <button
            onClick={() => setActiveTab('typing-wpm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'typing-wpm'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Teste de Digitação
          </button>
          <button
            onClick={() => setActiveTab('monitor-tester')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'monitor-tester'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Testador de Tela
          </button>
          <button
            onClick={() => setActiveTab('notepad-local')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'notepad-local'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            Bloco de Notas
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="relative z-10 pt-6">

        {/* ========================================================= */}
        {/* TAB 1: CANVAS IMAGE RESIZE & FILTERS */}
        {/* ========================================================= */}
        {activeTab === 'canvas-image' && (
          <div className="space-y-6">
            {!imageSrc ? (
              <div className="p-10 border-2 border-dashed border-slate-700 rounded-3xl text-center bg-slate-950/40 hover:border-cyan-500/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-input"
                />
                <label htmlFor="image-upload-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-base font-bold text-slate-200">
                    Clique para selecionar uma imagem
                  </span>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    PNG, JPG, WebP ou GIF. O processamento ocorre 100% no seu navegador sem envio para servidores.
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Controles de Redimensionamento e Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                      Largura (px)
                    </label>
                    <input
                      type="number"
                      value={imgWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                      Altura (px)
                    </label>
                    <input
                      type="number"
                      value={imgHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepAspect}
                        onChange={(e) => setKeepAspect(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                      />
                      <span>Manter Proporção</span>
                    </label>
                  </div>
                </div>

                {/* Filtros de Cor e Ajustes */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 font-bold mr-2">Filtro:</span>
                    {(['none', 'grayscale', 'sepia', 'invert'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setImgFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                          imgFilter === f ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {f === 'none' ? 'Normal' : f === 'grayscale' ? 'P&B' : f === 'sepia' ? 'Sépia' : 'Inverter'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadProcessedImage}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Imagem Processada</span>
                    </button>
                    <label
                      htmlFor="image-upload-input"
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      Trocar
                    </label>
                  </div>
                </div>

                {/* Preview do Canvas */}
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex justify-center items-center overflow-auto max-h-[500px]">
                  <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl shadow-2xl border border-slate-800" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TESTE DE DIGITAÇÃO WPM */}
        {/* ========================================================= */}
        {activeTab === 'typing-wpm' && (
          <div className="space-y-6">
            {/* Métricas do Teste */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] font-mono text-slate-500 block">Velocidade (PPM / WPM)</span>
                <strong className="text-3xl font-black font-mono text-cyan-400 mt-1 block">
                  {typingStats.wpm}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] font-mono text-slate-500 block">Precisão</span>
                <strong className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
                  {typingStats.accuracy}%
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] font-mono text-slate-500 block">Tempo Decorrido</span>
                <strong className="text-3xl font-black font-mono text-amber-400 mt-1 block">
                  {typingStats.elapsedSec}s
                </strong>
              </div>
            </div>

            {/* Texto Alvo com Destaque de Caracteres */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 leading-relaxed font-mono text-lg sm:text-xl tracking-wide select-none">
              {targetSentence.split('').map((char, idx) => {
                let colorClass = 'text-slate-500';
                if (idx < userInput.length) {
                  colorClass = userInput[idx] === char ? 'text-emerald-400 font-bold' : 'text-rose-500 bg-rose-950/40 rounded';
                } else if (idx === userInput.length) {
                  colorClass = 'text-cyan-400 underline decoration-2 underline-offset-4';
                }
                return (
                  <span key={idx} className={colorClass}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Input de Digitação */}
            <div className="space-y-3">
              <input
                type="text"
                value={userInput}
                onChange={handleTypingChange}
                disabled={Boolean(endTime)}
                placeholder="Comece a digitar o texto acima para iniciar o teste..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-100 font-mono focus:outline-none focus:border-cyan-500 shadow-xl"
              />

              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-500">
                  {endTime ? '🎉 Teste concluído com sucesso!' : testStarted ? 'Cronômetro ativo...' : 'Aguardando digitação...'}
                </span>
                <button
                  onClick={resetTypingTest}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Trocar Texto / Reiniciar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TESTADOR DE MONITOR & TELA */}
        {/* ========================================================= */}
        {activeTab === 'monitor-tester' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-2">
                Como utilizar o Testador de Tela:
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Selecione uma das cores de teste abaixo e clique no botão de <strong>Tela Cheia</strong>. Inspecione visualmente o display procurando por pontos pretos fixos (dead pixels) ou pontinhos brilhantes coloridos travados (stuck pixels). Pressione <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">ESC</kbd> ou clique para sair.
              </p>
            </div>

            {/* Cores de Teste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {colorsToTest.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setMonitorColor(c.hex)}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    monitorColor === c.hex
                      ? 'border-cyan-500 bg-slate-800/80 shadow-lg'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-xl border border-slate-700 flex-shrink-0" 
                    style={{ backgroundColor: c.hex }} 
                  />
                  <div>
                    <strong className="text-xs font-mono text-slate-200 block">{c.label}</strong>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{c.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Painel de Visualização & Botão Fullscreen */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setIsFullScreen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-sm flex items-center gap-2 hover:opacity-95 shadow-xl transition cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Iniciar Teste em Tela Cheia</span>
              </button>

              <div 
                className="w-full h-48 rounded-2xl border border-slate-800 transition-colors shadow-inner"
                style={{ backgroundColor: monitorColor }}
              />
            </div>

            {/* Modal de Tela Cheia Real */}
            {isFullScreen && (
              <div 
                onClick={() => setIsFullScreen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
                style={{ backgroundColor: monitorColor }}
              >
                <div className="bg-black/80 text-white px-4 py-2 rounded-xl text-xs font-mono pointer-events-none opacity-40 hover:opacity-100 transition">
                  Clique ou pressione ESC para sair do teste de tela
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BLOCO DE NOTAS ONLINE LOCALSTORAGE */}
        {/* ========================================================= */}
        {activeTab === 'notepad-local' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <span>{notepadStats.chars} caracteres</span>
                <span>{notepadStats.words} palavras</span>
                <span>{notepadStats.lines} linhas</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadNotepad}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Salvar .txt
                </button>
                <button
                  onClick={() => handleNotepadChange('')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
            </div>

            <textarea
              value={notepadText}
              onChange={(e) => handleNotepadChange(e.target.value)}
              placeholder="Digite suas anotações aqui... O conteúdo é salvo automaticamente no seu navegador via localStorage."
              className="w-full h-96 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed resize-none shadow-2xl"
            />
          </div>
        )}

      </div>
    </div>
  );
}
