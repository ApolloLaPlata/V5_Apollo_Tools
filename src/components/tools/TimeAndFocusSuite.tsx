'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Timer, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  Coffee, 
  Brain, 
  Calendar, 
  Hourglass, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export type TimeFocusTabType = 'cronometro' | 'pomodoro' | 'calculadora-horas' | 'contagem-regressiva';

interface LapItem {
  id: number;
  lapTime: number;
  totalTime: number;
}

export function TimeAndFocusSuite({ defaultTab = 'cronometro' }: { defaultTab?: TimeFocusTabType }) {
  const [activeTab, setActiveTab] = useState<TimeFocusTabType>(defaultTab);
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
  // 1. CRONÔMETRO DE ALTA PRECISÃO STATE
  // ==========================================
  const [chronoTime, setChronoTime] = useState<number>(0);
  const [chronoRunning, setChronoRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const chronoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chronoStartRef = useRef<number>(0);
  const chronoAccumulatedRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);

  const startChrono = () => {
    if (!chronoRunning) {
      setChronoRunning(true);
      chronoStartRef.current = Date.now();
      chronoIntervalRef.current = setInterval(() => {
        const now = Date.now();
        setChronoTime(chronoAccumulatedRef.current + (now - chronoStartRef.current));
      }, 10);
    }
  };

  const pauseChrono = () => {
    if (chronoRunning) {
      setChronoRunning(false);
      if (chronoIntervalRef.current) clearInterval(chronoIntervalRef.current);
      chronoAccumulatedRef.current += Date.now() - chronoStartRef.current;
      setChronoTime(chronoAccumulatedRef.current);
    }
  };

  const resetChrono = () => {
    setChronoRunning(false);
    if (chronoIntervalRef.current) clearInterval(chronoIntervalRef.current);
    chronoAccumulatedRef.current = 0;
    lastLapTimeRef.current = 0;
    setChronoTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    if (chronoTime === 0) return;
    const currentTotal = chronoTime;
    const lapDuration = currentTotal - lastLapTimeRef.current;
    lastLapTimeRef.current = currentTotal;
    setLaps([
      { id: laps.length + 1, lapTime: lapDuration, totalTime: currentTotal },
      ...laps
    ]);
  };

  useEffect(() => {
    return () => {
      if (chronoIntervalRef.current) clearInterval(chronoIntervalRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${hours > 0 ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  };

  // ==========================================
  // 2. POMODORO TIMER STATE
  // ==========================================
  type PomodoroMode = 'foco' | 'curto' | 'longo';
  const [pomoMode, setPomoMode] = useState<PomodoroMode>('foco');
  const [pomoTimeLeft, setPomoTimeLeft] = useState<number>(25 * 60);
  const [pomoRunning, setPomoRunning] = useState<boolean>(false);
  const [pomoCiclos, setPomoCiclos] = useState<number>(0);

  const POMO_CONFIG: Record<PomodoroMode, { label: string; duracao: number; cor: string; icon: any }> = {
    foco: { label: 'Foco Produtivo', duracao: 25 * 60, cor: '#06b6d4', icon: Brain },
    curto: { label: 'Descanso Curto', duracao: 5 * 60, cor: '#10b981', icon: Coffee },
    longo: { label: 'Descanso Longo', duracao: 15 * 60, cor: '#8b5cf6', icon: Coffee }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomoRunning && pomoTimeLeft > 0) {
      timer = setInterval(() => {
        setPomoTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (pomoRunning && pomoTimeLeft === 0) {
      setPomoRunning(false);
      playBeep();
      if (pomoMode === 'foco') {
        const nextCiclo = pomoCiclos + 1;
        setPomoCiclos(nextCiclo);
        if (nextCiclo % 4 === 0) {
          setPomoMode('longo');
          setPomoTimeLeft(POMO_CONFIG.longo.duracao);
        } else {
          setPomoMode('curto');
          setPomoTimeLeft(POMO_CONFIG.curto.duracao);
        }
      } else {
        setPomoMode('foco');
        setPomoTimeLeft(POMO_CONFIG.foco.duracao);
      }
    }
    return () => clearInterval(timer);
  }, [pomoRunning, pomoTimeLeft, pomoMode, pomoCiclos]);

  const switchPomoMode = (mode: PomodoroMode) => {
    setPomoRunning(false);
    setPomoMode(mode);
    setPomoTimeLeft(POMO_CONFIG[mode].duracao);
  };

  const resetPomo = () => {
    setPomoRunning(false);
    setPomoTimeLeft(POMO_CONFIG[pomoMode].duracao);
  };

  const pomoTotal = POMO_CONFIG[pomoMode].duracao;
  const pomoProgress = ((pomoTotal - pomoTimeLeft) / pomoTotal) * 100;
  const pomoMinutes = Math.floor(pomoTimeLeft / 60);
  const pomoSeconds = pomoTimeLeft % 60;
  const pomoTimeFormatted = `${String(pomoMinutes).padStart(2, '0')}:${String(pomoSeconds).padStart(2, '0')}`;

  // ==========================================
  // 3. CALCULADORA DE HORAS & PONTO STATE
  // ==========================================
  const [pontoEntrada1, setPontoEntrada1] = useState('08:00');
  const [pontoSaida1, setPontoSaida1] = useState('12:00');
  const [pontoEntrada2, setPontoEntrada2] = useState('13:00');
  const [pontoSaida2, setPontoSaida2] = useState('17:48');
  const [jornadaPadraoMinutos, setJornadaPadraoMinutos] = useState<number>(528); // 8h48 = 528 min

  // Horas Avulsas (Soma / Subtração)
  const [horaA, setHoraA] = useState('03:45');
  const [horaB, setHoraB] = useState('02:30');
  const [opHoras, setOpHoras] = useState<'somar' | 'subtrair'>('somar');

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  const minutesToTime = (min: number) => {
    const isNegative = min < 0;
    const absMin = Math.abs(min);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    const str = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return isNegative ? `-${str}` : str;
  };

  const pontoCalculos = useMemo(() => {
    const e1 = timeToMinutes(pontoEntrada1);
    const s1 = timeToMinutes(pontoSaida1);
    const e2 = timeToMinutes(pontoEntrada2);
    const s2 = timeToMinutes(pontoSaida2);

    const turno1 = Math.max(0, s1 - e1);
    const intervalo = Math.max(0, e2 - s1);
    const turno2 = Math.max(0, s2 - e2);
    const totalTrabalhado = turno1 + turno2;
    const saldo = totalTrabalhado - jornadaPadraoMinutos;

    return {
      turno1Str: minutesToTime(turno1),
      turno2Str: minutesToTime(turno2),
      intervaloStr: minutesToTime(intervalo),
      totalStr: minutesToTime(totalTrabalhado),
      saldoStr: minutesToTime(saldo),
      saldoPositivo: saldo >= 0,
      totalMinutos: totalTrabalhado
    };
  }, [pontoEntrada1, pontoSaida1, pontoEntrada2, pontoSaida2, jornadaPadraoMinutos]);

  const avulsoCalculo = useMemo(() => {
    const a = timeToMinutes(horaA);
    const b = timeToMinutes(horaB);
    const res = opHoras === 'somar' ? a + b : a - b;
    return minutesToTime(res);
  }, [horaA, horaB, opHoras]);

  // ==========================================
  // 4. CONTAGEM REGRESSIVA STATE
  // ==========================================
  const [eventoNome, setEventoNome] = useState('Ano Novo 2027');
  const [eventoData, setEventoData] = useState('2027-01-01T00:00');
  const [countdownResult, setCountdownResult] = useState<{
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
    finalizado: boolean;
  } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(eventoData).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target)) {
        setCountdownResult(null);
        return;
      }

      if (diff <= 0) {
        setCountdownResult({ dias: 0, horas: 0, minutos: 0, segundos: 0, finalizado: true });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const dias = Math.floor(totalSec / (3600 * 24));
      const horas = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutos = Math.floor((totalSec % 3600) / 60);
      const segundos = totalSec % 60;

      setCountdownResult({ dias, horas, minutos, segundos, finalizado: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventoData]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Tempo, Foco & Produtividade
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              INVERTEXTO SOBERANO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cronômetro de precisão com voltas, Pomodoro 25/5 com áudio nativo, calculadora de horas e ponto, e contagem regressiva.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'cronometro', label: 'Cronômetro com Voltas', icon: Timer },
          { id: 'pomodoro', label: 'Pomodoro Timer (25/5)', icon: Brain },
          { id: 'calculadora-horas', label: 'Calculadora de Horas & Ponto', icon: Clock },
          { id: 'contagem-regressiva', label: 'Contagem Regressiva', icon: Hourglass }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          ABA 1: CRONÔMETRO DE ALTA PRECISÃO
      ========================================== */}
      {activeTab === 'cronometro' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-8 bg-slate-950/90 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 shadow-2xl">
            {/* Display de Tempo Grande */}
            <div className="text-5xl sm:text-7xl font-mono font-black text-white tracking-wider select-none">
              {formatTime(chronoTime)}
            </div>

            {/* Controles Principais */}
            <div className="flex items-center gap-3">
              {!chronoRunning ? (
                <button
                  onClick={startChrono}
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Iniciar
                </button>
              ) : (
                <button
                  onClick={pauseChrono}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Pause className="w-4 h-4 fill-slate-950" /> Pausar
                </button>
              )}

              <button
                onClick={recordLap}
                disabled={!chronoRunning}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-40"
              >
                <Flag className="w-4 h-4" /> Volta (Lap)
              </button>

              <button
                onClick={resetChrono}
                disabled={chronoTime === 0}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-40"
                title="Zerar Cronômetro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Histórico de Voltas */}
          {laps.length > 0 && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Voltas Registradas ({laps.length})
                </span>
                <button
                  onClick={() => copyToClipboard(laps.map(l => `Volta ${l.id}: ${formatTime(l.lapTime)} (Total: ${formatTime(l.totalTime)})`).join('\n'), 'lapsCopy')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'lapsCopy' ? 'Copiado!' : 'Copiar Histórico'}
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {laps.map((lap) => (
                  <div
                    key={lap.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-xs"
                  >
                    <span className="text-slate-400 font-bold">Volta #{lap.id}</span>
                    <span className="text-cyan-300 font-semibold">+{formatTime(lap.lapTime)}</span>
                    <span className="text-slate-300">{formatTime(lap.totalTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          ABA 2: POMODORO TIMER (25/5)
      ========================================== */}
      {activeTab === 'pomodoro' && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Seletor de Modos do Pomodoro */}
          <div className="grid grid-cols-3 gap-2">
            {(['foco', 'curto', 'longo'] as const).map((m) => {
              const cfg = POMO_CONFIG[m];
              const isSelected = pomoMode === m;
              return (
                <button
                  key={m}
                  onClick={() => switchPomoMode(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Círculo do Pomodoro com Barra de Progresso SVG */}
          <div className="p-8 bg-slate-950/90 border border-slate-800 rounded-3xl flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Trilho de fundo */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Barra de progresso circular */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={POMO_CONFIG[pomoMode].cor}
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * pomoProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Informações centrais */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  {POMO_CONFIG[pomoMode].label}
                </span>
                <span className="text-5xl font-mono font-black text-white tracking-tight">
                  {pomoTimeFormatted}
                </span>
                <span className="text-[11px] font-mono text-cyan-400 mt-2">
                  Ciclos Concluídos: 🍅 {pomoCiclos}
                </span>
              </div>
            </div>

            {/* Controles do Pomodoro */}
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setPomoRunning(!pomoRunning)}
                className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {pomoRunning ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                {pomoRunning ? 'Pausar' : 'Iniciar Foco'}
              </button>

              <button
                onClick={resetPomo}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Reiniciar Tempo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 3: CALCULADORA DE HORAS & PONTO
      ========================================== */}
      {activeTab === 'calculadora-horas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cálculo de Ponto Diário (7 colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Cartão de Ponto Diário
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold">Jornada:</span>
                  {[
                    { label: '8h48', min: 528 },
                    { label: '8h00', min: 480 },
                    { label: '6h00', min: 360 }
                  ].map((j) => (
                    <button
                      key={j.label}
                      onClick={() => setJornadaPadraoMinutos(j.min)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        jornadaPadraoMinutos === j.min
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {j.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batidas de Ponto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Entrada 1</label>
                  <input
                    type="time"
                    value={pontoEntrada1}
                    onChange={(e) => setPontoEntrada1(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Saída Almoço</label>
                  <input
                    type="time"
                    value={pontoSaida1}
                    onChange={(e) => setPontoSaida1(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Retorno Almoço</label>
                  <input
                    type="time"
                    value={pontoEntrada2}
                    onChange={(e) => setPontoEntrada2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Saída Final</label>
                  <input
                    type="time"
                    value={pontoSaida2}
                    onChange={(e) => setPontoSaida2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Métricas Calculadas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">1º Turno</span>
                  <span className="text-sm font-mono font-bold text-white">{pontoCalculos.turno1Str}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Intervalo</span>
                  <span className="text-sm font-mono font-bold text-white">{pontoCalculos.intervaloStr}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">2º Turno</span>
                  <span className="text-sm font-mono font-bold text-white">{pontoCalculos.turno2Str}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 text-center">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 block">Total Trabalhado</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">{pontoCalculos.totalStr}</span>
                </div>
              </div>

              {/* Saldo de Horas */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Saldo do Dia (vs Jornada):</span>
                  <div className={`text-2xl font-mono font-extrabold ${pontoCalculos.saldoPositivo ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pontoCalculos.saldoStr}
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  pontoCalculos.saldoPositivo ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {pontoCalculos.saldoPositivo ? 'HORAS EXTRAS' : 'HORAS A COMPENSAR'}
                </span>
              </div>
            </div>
          </div>

          {/* Calculadora de Horas Avulsas (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
              <span className="text-xs font-bold uppercase text-cyan-400 block border-b border-slate-800 pb-2">
                Somar ou Subtrair Horas Avulsas
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hora A (hh:mm)</label>
                  <input
                    type="time"
                    value={horaA}
                    onChange={(e) => setHoraA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hora B (hh:mm)</label>
                  <input
                    type="time"
                    value={horaB}
                    onChange={(e) => setHoraB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => setOpHoras('somar')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                    opHoras === 'somar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Somar (+)
                </button>
                <button
                  onClick={() => setOpHoras('subtrair')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                    opHoras === 'subtrair' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Subtrair (-)
                </button>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resultado:</span>
                <span className="text-2xl font-mono font-black text-cyan-300">{avulsoCalculo}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 4: CONTAGEM REGRESSIVA PARA EVENTOS
      ========================================== */}
      {activeTab === 'contagem-regressiva' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nome do Evento</label>
              <input
                type="text"
                value={eventoNome}
                onChange={(e) => setEventoNome(e.target.value)}
                placeholder="Ex: Lançamento do SaaS..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data e Hora do Evento</label>
              <input
                type="datetime-local"
                value={eventoData}
                onChange={(e) => setEventoData(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Cards Dinâmicos do Countdown */}
          {countdownResult && (
            <div className="p-8 bg-slate-950/90 border border-slate-800 rounded-3xl space-y-6 text-center shadow-2xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                  Tempo Restante Para:
                </span>
                <h3 className="text-2xl font-black text-white">{eventoNome || 'Evento'}</h3>
              </div>

              {countdownResult.finalizado ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-lg">
                  🎉 O Evento Já Começou!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-3xl sm:text-5xl font-mono font-black text-white block">
                      {countdownResult.dias}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">Dias</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-3xl sm:text-5xl font-mono font-black text-cyan-300 block">
                      {String(countdownResult.horas).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">Horas</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-3xl sm:text-5xl font-mono font-black text-emerald-300 block">
                      {String(countdownResult.minutos).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">Minutos</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-3xl sm:text-5xl font-mono font-black text-amber-300 block">
                      {String(countdownResult.segundos).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">Segundos</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
