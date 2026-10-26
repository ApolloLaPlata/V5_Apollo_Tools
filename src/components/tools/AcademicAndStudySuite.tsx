'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Calculator, 
  Timer, 
  Layers, 
  Feather, 
  Copy, 
  Check, 
  RotateCcw, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles, 
  Info, 
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight,
  FileText
} from 'lucide-react';

interface AcademicAndStudySuiteProps {
  defaultTab?: 'abnt-citations' | 'weighted-gpa' | 'study-pomodoro' | 'flashcards-maker' | 'poetic-meter';
}

interface DisciplineItem {
  id: string;
  name: string;
  grade: number;
  weight: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  state?: 'unseen' | 'hard' | 'good' | 'easy';
}

export function AcademicAndStudySuite({ defaultTab = 'abnt-citations' }: AcademicAndStudySuiteProps) {
  const [activeTab, setActiveTab] = useState<'abnt-citations' | 'weighted-gpa' | 'study-pomodoro' | 'flashcards-maker' | 'poetic-meter'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // =========================================================================
  // ABA 1: FORMATADOR ABNT NBR 6023
  // =========================================================================
  const [abntDocType, setAbntDocType] = useState<'book' | 'article' | 'thesis' | 'web'>('book');
  const [abntAuthor, setAbntAuthor] = useState('SILVA, Lucas Ribeiro');
  const [abntSecondAuthor, setAbntSecondAuthor] = useState('');
  const [abntTitle, setAbntTitle] = useState('Inteligência Artificial e Sistemas Autônomos');
  const [abntSubtitle, setAbntSubtitle] = useState('uma introdução prática aos modelos neurais');
  const [abntEdition, setAbntEdition] = useState('2. ed.');
  const [abntCity, setAbntCity] = useState('São Paulo');
  const [abntPublisher, setAbntPublisher] = useState('Editora Científica');
  const [abntYear, setAbntYear] = useState('2025');
  const [abntJournal, setAbntJournal] = useState('Revista Brasileira de Ciência da Computação');
  const [abntVolume, setAbntVolume] = useState('14');
  const [abntNumber, setAbntNumber] = useState('2');
  const [abntPages, setAbntPages] = useState('45-68');
  const [abntMonth, setAbntMonth] = useState('ago.');
  const [abntUrl, setAbntUrl] = useState('https://v5apollo.com/artigos/ia-sistemas');
  const [abntAccessDate, setAbntAccessDate] = useState('25 out. 2026');
  const [abntInstitution, setAbntInstitution] = useState('Universidade de São Paulo');
  const [abntCourse, setAbntCourse] = useState('Engenharia de Software');
  const [abntDegree, setAbntDegree] = useState('Dissertação (Mestrado em Engenharia)');

  const getAbntReference = () => {
    const authors = abntSecondAuthor ? `${abntAuthor.trim()}; ${abntSecondAuthor.trim()}` : abntAuthor.trim();
    const fullTitle = abntSubtitle ? `_${abntTitle.trim()}_: ${abntSubtitle.trim()}` : `_${abntTitle.trim()}_`;
    const plainTitle = abntSubtitle ? `${abntTitle.trim()}: ${abntSubtitle.trim()}` : `${abntTitle.trim()}`;

    if (abntDocType === 'book') {
      const edStr = abntEdition ? ` ${abntEdition.trim()}.` : '';
      return `${authors}. ${plainTitle}.${edStr} ${abntCity}: ${abntPublisher}, ${abntYear}.`;
    }
    if (abntDocType === 'article') {
      return `${authors}. ${abntTitle.trim()}. ${abntJournal}, ${abntCity}, v. ${abntVolume}, n. ${abntNumber}, p. ${abntPages}, ${abntMonth} ${abntYear}.`;
    }
    if (abntDocType === 'thesis') {
      return `${authors}. ${plainTitle}. ${abntYear}. ${abntDegree} - ${abntInstitution}, ${abntCity}, ${abntYear}.`;
    }
    if (abntDocType === 'web') {
      const authStr = authors ? `${authors}. ` : '';
      return `${authStr}${plainTitle}. ${abntPublisher || abntInstitution || 'Website'}, ${abntYear}. Disponível em: <${abntUrl}>. Acesso em: ${abntAccessDate}.`;
    }
    return '';
  };

  const getAbntCitationDirect = () => {
    const mainLastName = abntAuthor.split(',')[0]?.trim().toUpperCase() || 'AUTOR';
    return `(${mainLastName}, ${abntYear || '2025'}, p. ${abntPages.split('-')[0] || '12'})`;
  };

  const getAbntCitationIndirect = () => {
    const mainLastName = abntAuthor.split(',')[0]?.trim().toUpperCase() || 'AUTOR';
    return `Segundo ${mainLastName.charAt(0) + mainLastName.slice(1).toLowerCase()} (${abntYear || '2025'})...`;
  };

  // =========================================================================
  // ABA 2: MÉDIA PONDERADA & ENEM / SISU
  // =========================================================================
  const [gpaMode, setGpaMode] = useState<'discipline' | 'enem'>('discipline');
  const [targetMinGrade, setTargetMinGrade] = useState<number>(7.0);

  const [disciplines, setDisciplines] = useState<DisciplineItem[]>([
    { id: '1', name: 'Prova Teórica P1', grade: 7.5, weight: 2 },
    { id: '2', name: 'Projeto Prático / Lab', grade: 9.0, weight: 3 },
    { id: '3', name: 'Seminário / Artigo', grade: 8.0, weight: 1 },
    { id: '4', name: 'Exame Final P2', grade: 6.5, weight: 4 },
  ]);

  const addDisciplineRow = () => {
    setDisciplines(prev => [
      ...prev,
      { id: Date.now().toString(), name: `Avaliação ${prev.length + 1}`, grade: 7.0, weight: 1 }
    ]);
  };

  const removeDisciplineRow = (id: string) => {
    if (disciplines.length <= 1) return;
    setDisciplines(prev => prev.filter(d => d.id !== id));
  };

  const updateDiscipline = (id: string, field: keyof DisciplineItem, value: any) => {
    setDisciplines(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // Cálculo da média ponderada de disciplinas
  const totalWeight = disciplines.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
  const totalWeightedGrade = disciplines.reduce((acc, curr) => acc + ((Number(curr.grade) || 0) * (Number(curr.weight) || 0)), 0);
  const currentGpa = totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;

  // ENEM / SISU Simulator
  const [enemRedacao, setEnemRedacao] = useState<number>(880);
  const [enemMatematica, setEnemMatematica] = useState<number>(785.4);
  const [enemLinguagens, setEnemLinguagens] = useState<number>(670.2);
  const [enemNatureza, setEnemNatureza] = useState<number>(710.8);
  const [enemHumanas, setEnemHumanas] = useState<number>(725.0);

  const [weightRedacao, setWeightRedacao] = useState<number>(3);
  const [weightMatematica, setWeightMatematica] = useState<number>(4);
  const [weightLinguagens, setWeightLinguagens] = useState<number>(2);
  const [weightNatureza, setWeightNatureza] = useState<number>(3);
  const [weightHumanas, setWeightHumanas] = useState<number>(1);

  const [regionalBonusPercent, setRegionalBonusPercent] = useState<number>(0);
  const [targetCutoffGrade, setTargetCutoffGrade] = useState<number>(760.0);

  const totalEnemWeight = weightRedacao + weightMatematica + weightLinguagens + weightNatureza + weightHumanas;
  const rawEnemScore = totalEnemWeight > 0 
    ? (enemRedacao * weightRedacao + enemMatematica * weightMatematica + enemLinguagens * weightLinguagens + enemNatureza * weightNatureza + enemHumanas * weightHumanas) / totalEnemWeight
    : 0;
  const finalEnemScore = rawEnemScore * (1 + regionalBonusPercent / 100);
  const enemMargin = finalEnemScore - targetCutoffGrade;

  // =========================================================================
  // ABA 3: TEMPORIZADOR POMODORO ACADÊMICO & GERADOR DE RUÍDO BINAURAL
  // =========================================================================
  const [pomodoroMode, setPomodoroMode] = useState<'deep50' | 'classic25' | 'custom'>('deep50');
  const [workMinutes, setWorkMinutes] = useState(50);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(50 * 60);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Áudio Sintetizador Web Audio API (White & Brown Noise)
  const [noiseType, setNoiseType] = useState<'none' | 'white' | 'brown'>('none');
  const [volumeLevel, setVolumeLevel] = useState(0.15);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeftSeconds === 0) {
      // Ciclo concluído
      if (!isBreak) {
        setCompletedCycles(prev => prev + 1);
        setIsBreak(true);
        setTimeLeftSeconds(breakMinutes * 60);
      } else {
        setIsBreak(false);
        setTimeLeftSeconds(workMinutes * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeftSeconds, isBreak, breakMinutes, workMinutes]);

  const selectPomodoroPreset = (mode: 'deep50' | 'classic25') => {
    setPomodoroMode(mode);
    setIsTimerRunning(false);
    setIsBreak(false);
    if (mode === 'deep50') {
      setWorkMinutes(50);
      setBreakMinutes(10);
      setTimeLeftSeconds(50 * 60);
    } else {
      setWorkMinutes(25);
      setBreakMinutes(5);
      setTimeLeftSeconds(25 * 60);
    }
  };

  const toggleNoise = (type: 'none' | 'white' | 'brown') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }

      if (type === 'none') {
        setNoiseType('none');
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Ganho brown
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volumeLevel, ctx.currentTime);

      whiteNoise.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gain;
      setNoiseType(type);
    } catch (e) {
      console.error('Audio Context Error:', e);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolumeLevel(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // =========================================================================
  // ABA 4: GERADOR DE FLASHCARDS & REVISÃO ESPAÇADA
  // =========================================================================
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      front: 'O que define o Ponto de Equilíbrio (Break-Even Point)?',
      back: 'É o momento em que as receitas totais se igualam exatamente aos custos e despesas totais, resultando em lucro líquido zero.',
      hint: 'Economia / Finanças'
    },
    {
      id: '2',
      front: 'Qual a principal diferença entre Citação Direta e Indireta (ABNT)?',
      back: 'A citação direta transcreve ipsis litteris as palavras do autor original (com página). A citação indireta é uma paráfrase com as palavras de quem escreve.',
      hint: 'Metodologia Científica'
    },
    {
      id: '3',
      front: 'O que é a Complexidade Temporal O(1) de um algoritmo?',
      back: 'Significa que o tempo de execução é constante e independe do tamanho dos dados de entrada (n).',
      hint: 'Estruturas de Dados'
    }
  ]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');

  const addFlashcard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      state: 'unseen'
    };
    setFlashcards(prev => [...prev, newCard]);
    setNewFront('');
    setNewBack('');
    setNewHint('');
  };

  const removeFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(c => c.id !== id));
    if (activeCardIndex >= flashcards.length - 1 && activeCardIndex > 0) {
      setActiveCardIndex(activeCardIndex - 1);
    }
    setIsFlipped(false);
  };

  const exportFlashcardsAnki = () => {
    const tsvContent = flashcards.map(c => `${c.front.replace(/\t/g, ' ')}\t${c.back.replace(/\t/g, ' ')}`).join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `v5_flashcards_anki_${new Date().toISOString().slice(0, 10)}.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // ABA 5: ANALISADOR DE MÉTRICA POÉTICA & ESCANSÃO
  // =========================================================================
  const [poemText, setPoemText] = useState(
    'Minha terra tem palmeiras,\nOnde canta o Sabiá;\nAs aves, que aqui gorjeiam,\nNão gorjeiam como lá.'
  );

  const analyzePoemVerse = (verse: string) => {
    const trimmed = verse.trim();
    if (!trimmed) return null;

    // Algoritmo heurístico simplificado de contagem de sílabas poéticas
    // Divide palavras por vogais e considera acentuação final
    const words = trimmed.split(/\s+/);
    let estimatedSyllables = 0;
    const vowelsRegex = /[aeiouáéíóúâêîôûãõàü]/gi;

    words.forEach(w => {
      const matches = w.match(vowelsRegex);
      if (matches) {
        // Encontros vocálicos aproximados
        estimatedSyllables += Math.max(1, matches.length - (w.match(/[aeiou][aeiou]/gi)?.length || 0));
      }
    });

    let meterName = 'Verso Livre';
    if (estimatedSyllables === 5) meterName = 'Redondilha Menor (5 sílabas)';
    else if (estimatedSyllables === 7) meterName = 'Redondilha Maior (7 sílabas)';
    else if (estimatedSyllables === 10) meterName = 'Decassílabo (10 sílabas)';
    else if (estimatedSyllables === 12) meterName = 'Alexandrino / Dodecassílabo (12 sílabas)';
    else if (estimatedSyllables > 0) meterName = `${estimatedSyllables} Sílabas Poéticas`;

    return {
      verse: trimmed,
      syllablesCount: estimatedSyllables,
      meterName
    };
  };

  const verseAnalysis = poemText
    .split('\n')
    .map(v => analyzePoemVerse(v))
    .filter(Boolean);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Capitania #11 · Suíte Acadêmica, Citações ABNT & Estudo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Produtividade Acadêmica & ABNT NBR 6023
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Client-Side Soberano
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formatador ABNT NBR 6023 oficial, média ponderada & simulador ENEM/SISU, timer pomodoro com ruído branco/marrom, flashcards Anki e escansão poética.
          </p>
        </div>

        {/* Status / Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Norma ABNT 6023:2020</span>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('abnt-citations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'abnt-citations'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Formatador ABNT 6023</span>
        </button>

        <button
          onClick={() => setActiveTab('weighted-gpa')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'weighted-gpa'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Média Ponderada & ENEM</span>
        </button>

        <button
          onClick={() => setActiveTab('study-pomodoro')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'study-pomodoro'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Pomodoro 50/10 & Ruído de Foco</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards-maker')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'flashcards-maker'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Flashcards & Anki TSV</span>
        </button>

        <button
          onClick={() => setActiveTab('poetic-meter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'poetic-meter'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Métrica Poética & Sílabas</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pt-6">
        {/* =================================================================== */}
        {/* ABA 1: FORMATADOR ABNT NBR 6023 */}
        {/* =================================================================== */}
        {activeTab === 'abnt-citations' && (
          <div className="space-y-6">
            {/* Seletor de Tipo de Documento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setAbntDocType('book')}
                className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                  abntDocType === 'book'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">📖 Livro Físico / E-book</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Autor, título, edição, editora</div>
              </button>
              <button
                onClick={() => setAbntDocType('article')}
                className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                  abntDocType === 'article'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">📑 Artigo em Periódico</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Revista científica, vol, fascículo</div>
              </button>
              <button
                onClick={() => setAbntDocType('thesis')}
                className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                  abntDocType === 'thesis'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">🎓 TCC / Dissertação / Tese</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Instituição, curso, local e ano</div>
              </button>
              <button
                onClick={() => setAbntDocType('web')}
                className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                  abntDocType === 'web'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">🌐 Artigo Web / Website</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">URL e data de acesso</div>
              </button>
            </div>

            {/* Inputs de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Autor Principal (SOBRENOME, Nome):
                  </label>
                  <input
                    type="text"
                    value={abntAuthor}
                    onChange={(e) => setAbntAuthor(e.target.value)}
                    placeholder="SOBRENOME, Nome"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Segundo Autor (Opcional - SOBRENOME, Nome):
                  </label>
                  <input
                    type="text"
                    value={abntSecondAuthor}
                    onChange={(e) => setAbntSecondAuthor(e.target.value)}
                    placeholder="Deixe em branco se for autor único"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Título da Obra:</label>
                    <input
                      type="text"
                      value={abntTitle}
                      onChange={(e) => setAbntTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Subtítulo (se houver):</label>
                    <input
                      type="text"
                      value={abntSubtitle}
                      onChange={(e) => setAbntSubtitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Cidade:</label>
                    <input
                      type="text"
                      value={abntCity}
                      onChange={(e) => setAbntCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Editora / Portal:</label>
                    <input
                      type="text"
                      value={abntPublisher}
                      onChange={(e) => setAbntPublisher(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Ano:</label>
                    <input
                      type="text"
                      value={abntYear}
                      onChange={(e) => setAbntYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Campos específicos por tipo */}
              <div className="space-y-3">
                {abntDocType === 'book' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Edição:</label>
                    <input
                      type="text"
                      value={abntEdition}
                      onChange={(e) => setAbntEdition(e.target.value)}
                      placeholder="Ex: 2. ed."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                )}

                {abntDocType === 'article' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Nome do Periódico / Revista:</label>
                      <input
                        type="text"
                        value={abntJournal}
                        onChange={(e) => setAbntJournal(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Vol:</label>
                        <input
                          type="text"
                          value={abntVolume}
                          onChange={(e) => setAbntVolume(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Nº/Fasc:</label>
                        <input
                          type="text"
                          value={abntNumber}
                          onChange={(e) => setAbntNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Páginas:</label>
                        <input
                          type="text"
                          value={abntPages}
                          onChange={(e) => setAbntPages(e.target.value)}
                          placeholder="Ex: 45-68"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Mês:</label>
                        <input
                          type="text"
                          value={abntMonth}
                          onChange={(e) => setAbntMonth(e.target.value)}
                          placeholder="ago."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {abntDocType === 'thesis' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Instituição de Ensino:</label>
                      <input
                        type="text"
                        value={abntInstitution}
                        onChange={(e) => setAbntInstitution(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Grau e Curso:</label>
                      <input
                        type="text"
                        value={abntDegree}
                        onChange={(e) => setAbntDegree(e.target.value)}
                        placeholder="Ex: Dissertação (Mestrado em Engenharia)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                  </>
                )}

                {abntDocType === 'web' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Endereço da Página (URL):</label>
                      <input
                        type="url"
                        value={abntUrl}
                        onChange={(e) => setAbntUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Data do Acesso (DD mmm. AAAA):</label>
                      <input
                        type="text"
                        value={abntAccessDate}
                        onChange={(e) => setAbntAccessDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Caixa de Referência Formatada */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Referência Bibliográfica Final (NBR 6023)
                </span>
                <button
                  onClick={() => copyToClipboard(getAbntReference(), 'abnt-ref')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                >
                  {copiedId === 'abnt-ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'abnt-ref' ? 'Copiado!' : 'Copiar Referência'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-sans text-slate-100 select-all leading-relaxed">
                {getAbntReference()}
              </div>

              {/* Citações no Corpo do Texto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">Citação Direta (no texto):</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">{getAbntCitationDirect()}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getAbntCitationDirect(), 'cite-dir')}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedId === 'cite-dir' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">Citação Indireta (paráfrase):</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{getAbntCitationIndirect()}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getAbntCitationIndirect(), 'cite-indir')}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedId === 'cite-indir' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: MÉDIA PONDERADA & SIMULADOR ENEM */}
        {/* =================================================================== */}
        {activeTab === 'weighted-gpa' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setGpaMode('discipline')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  gpaMode === 'discipline'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Média Ponderada Universitária (Disciplinas & Pesos)
              </button>
              <button
                onClick={() => setGpaMode('enem')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  gpaMode === 'enem'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Simulador SISU / ENEM (5 Áreas & Bônus Regional)
              </button>
            </div>

            {gpaMode === 'discipline' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Tabela de Notas e Pesos:</span>
                  <button
                    onClick={addDisciplineRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Linha</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {disciplines.map((disc, idx) => (
                    <div key={disc.id} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="col-span-6 sm:col-span-5">
                        <input
                          type="text"
                          value={disc.name}
                          onChange={(e) => updateDiscipline(disc.id, 'name', e.target.value)}
                          placeholder="Nome da Avaliação"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-slate-500">Nota:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={disc.grade}
                            onChange={(e) => updateDiscipline(disc.id, 'grade', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono text-right"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-slate-500">Peso:</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={disc.weight}
                            onChange={(e) => updateDiscipline(disc.id, 'weight', parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono text-right"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeDisciplineRow(disc.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Painel de Resultados */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Soma de Pesos:</span>
                    <span className="text-xl font-bold font-mono text-white">{totalWeight}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Média Ponderada Atual:</span>
                    <span className={`text-2xl font-black font-mono ${currentGpa >= targetMinGrade ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentGpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Status de Aprovação:</span>
                    <span className={`text-sm font-bold font-mono flex items-center gap-1 mt-1 ${currentGpa >= targetMinGrade ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentGpa >= targetMinGrade ? 'Aprovado por Média' : 'Necessita Avaliação Final'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* MODO ENEM / SISU */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                      Notas das 5 Áreas do ENEM:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Redação (0-1000):</label>
                        <input
                          type="number"
                          step="10"
                          value={enemRedacao}
                          onChange={(e) => setEnemRedacao(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Matemática:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={enemMatematica}
                          onChange={(e) => setEnemMatematica(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Linguagens e Códigos:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={enemLinguagens}
                          onChange={(e) => setEnemLinguagens(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Ciências da Natureza:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={enemNatureza}
                          onChange={(e) => setEnemNatureza(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Ciências Humanas:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={enemHumanas}
                          onChange={(e) => setEnemHumanas(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                      Pesos do Curso & Bônus SISU:
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">Red</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={weightRedacao}
                          onChange={(e) => setWeightRedacao(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">Mat</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={weightMatematica}
                          onChange={(e) => setWeightMatematica(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">Lin</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={weightLinguagens}
                          onChange={(e) => setWeightLinguagens(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">Nat</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={weightNatureza}
                          onChange={(e) => setWeightNatureza(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">Hum</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={weightHumanas}
                          onChange={(e) => setWeightHumanas(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Bônus Regional (%):</label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={regionalBonusPercent}
                          onChange={(e) => setRegionalBonusPercent(parseFloat(e.target.value) || 0)}
                          placeholder="Ex: 10 ou 15"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Nota de Corte Alvo:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={targetCutoffGrade}
                          onChange={(e) => setTargetCutoffGrade(parseFloat(e.target.value) || 0)}
                          placeholder="Ex: 760.0"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Final ENEM */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Média Bruta ENEM:</span>
                    <span className="text-xl font-bold font-mono text-slate-200">{rawEnemScore.toFixed(2)} pts</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Nota Final Ponderada SISU:</span>
                    <span className="text-2xl font-black font-mono text-cyan-400">{finalEnemScore.toFixed(2)} pts</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Margem vs Corte:</span>
                    <span className={`text-xl font-bold font-mono ${enemMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {enemMargin >= 0 ? `+${enemMargin.toFixed(2)} (Apto)` : `${enemMargin.toFixed(2)} (Abaixo)`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: POMODORO 50/10 & RUÍDO DE FOCO */}
        {/* =================================================================== */}
        {activeTab === 'study-pomodoro' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Display do Relógio */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => selectPomodoroPreset('deep50')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      pomodoroMode === 'deep50' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Foco Profundo 50/10
                  </button>
                  <button
                    onClick={() => selectPomodoroPreset('classic25')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      pomodoroMode === 'classic25' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Clássico 25/5
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  {isBreak ? '☕ Pausa Restauradora' : '🧠 Sessão de Hiperfoco'}
                </div>

                {/* Minutos : Segundos */}
                <div className="text-6xl sm:text-7xl font-black font-mono text-white tracking-tighter my-2">
                  {String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0')}:
                  {String(timeLeftSeconds % 60).padStart(2, '0')}
                </div>

                {/* Controles de Play / Pause */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition cursor-pointer shadow-lg ${
                      isTimerRunning
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                        : 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Pausar' : 'Iniciar Foco'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimeLeftSeconds(workMinutes * 60);
                      setIsBreak(false);
                    }}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 text-xs font-mono text-slate-500">
                  Ciclos Concluídos nesta sessão: <strong className="text-cyan-400">{completedCycles}</strong> ({completedCycles * workMinutes} min focados)
                </div>
              </div>

              {/* Gerador de Som Binaural / Ruído de Foco */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <Volume2 className="w-4 h-4" />
                  <span>Sintetizador Web Audio API (Zero Arquivos Externos)</span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Isolamento Acústico de Alta Concentração
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O ruído marrom atenua frequências agudas e distratores externos através de um espectro acústico 1/f², ideal para leitura densa e programação.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => toggleNoise('none')}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      noiseType === 'none'
                        ? 'bg-slate-800 text-white border-slate-600'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Desligado
                  </button>
                  <button
                    onClick={() => toggleNoise('brown')}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      noiseType === 'brown'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Ruído Marrom ⚡
                  </button>
                  <button
                    onClick={() => toggleNoise('white')}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      noiseType === 'white'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Ruído Branco
                  </button>
                </div>

                {noiseType !== 'none' && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Volume:</span>
                      <span>{Math.round(volumeLevel * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.5"
                      step="0.01"
                      value={volumeLevel}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: GERADOR DE FLASHCARDS & EXPORTAÇÃO ANKI */}
        {/* =================================================================== */}
        {activeTab === 'flashcards-maker' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estudo Interativo com Card Flip */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Flashcard {activeCardIndex + 1} de {flashcards.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                        setIsFlipped(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => {
                        setActiveCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                        setIsFlipped(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Próximo
                    </button>
                  </div>
                </div>

                {/* Card Interativo */}
                {flashcards[activeCardIndex] && (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 hover:border-cyan-500 transition-all cursor-pointer flex flex-col justify-between shadow-xl relative group select-none"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{isFlipped ? 'VERSO (RESPOSTA)' : 'FRENTE (PERGUNTA)'}</span>
                      <span className="text-cyan-400/80 group-hover:text-cyan-400 flex items-center gap-1">
                        Clique para virar ↺
                      </span>
                    </div>

                    <div className="py-4 text-center">
                      <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        {isFlipped ? flashcards[activeCardIndex].back : flashcards[activeCardIndex].front}
                      </div>
                      {!isFlipped && flashcards[activeCardIndex].hint && (
                        <div className="mt-3 text-xs font-mono text-slate-500 italic">
                          Dica: {flashcards[activeCardIndex].hint}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                      <span>Holding V5 Apollo · Memorização Ativa</span>
                      <span>Card #{flashcards[activeCardIndex].id}</span>
                    </div>
                  </div>
                )}

                {/* Botão de Exportar para o Anki */}
                <button
                  onClick={exportFlashcardsAnki}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Baralho para Anki (.tsv / Anki Desktop)</span>
                </button>
              </div>

              {/* Criador de Novos Cards */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Criar Novo Flashcard:
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Frente (Pergunta / Conceito):</label>
                  <textarea
                    rows={2}
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Ex: O que é o Teorema de Bayes?"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Verso (Resposta Explicativa):</label>
                  <textarea
                    rows={3}
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Ex: É uma fórmula que calcula a probabilidade condicional de um evento dado o conhecimento prévio de condições relacionadas."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Tag / Dica Opcional:</label>
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="Ex: Probabilidade e Estatística"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={addFlashcard}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer hover:bg-cyan-400"
                >
                  Adicionar ao Baralho Ativo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: MÉTRICA POÉTICA & ESCANSÃO */}
        {/* =================================================================== */}
        {activeTab === 'poetic-meter' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-mono text-cyan-400 font-bold">
                  Insira o Poema ou Versos para Escansão:
                </label>
                <textarea
                  rows={8}
                  value={poemText}
                  onChange={(e) => setPoemText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm font-sans text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
                <span className="text-[11px] font-mono text-slate-500 block">
                  Classifica automaticamente: Redondilha Menor (5), Redondilha Maior (7), Decassílabo (10) e Alexandrino (12).
                </span>
              </div>

              {/* Tabela de Resultados por Verso */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-slate-400 font-bold block mb-1">
                  Escansão Métrica Linha por Linha:
                </span>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {verseAnalysis.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                      <div className="overflow-hidden">
                        <div className="text-xs text-slate-200 font-medium truncate">"{item?.verse}"</div>
                        <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{item?.meterName}</div>
                      </div>
                      <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400 shrink-0">
                        {item?.syllablesCount} síl.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
