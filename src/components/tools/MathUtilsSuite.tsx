'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Percent, Divide, Calendar, Copy, Check, RefreshCw, Hash, ArrowRightLeft } from 'lucide-react';

export function MathUtilsSuite({ defaultTab = 'porcentagem' }: { defaultTab?: 'porcentagem' | 'regra3' | 'extenso' | 'romanos' | 'mmc-mdc' | 'datas' }) {
  const [activeTab, setActiveTab] = useState<'porcentagem' | 'regra3' | 'extenso' | 'romanos' | 'mmc-mdc' | 'datas'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // --- PORCENTAGEM STATE ---
  const [pct1, setPct1] = useState('15');
  const [val1, setVal1] = useState('200');
  const [pctValA, setPctValA] = useState('50');
  const [pctValB, setPctValB] = useState('250');
  const [origVal, setOrigVal] = useState('100');
  const [finalVal, setFinalVal] = useState('130');

  // --- REGRA DE 3 STATE ---
  const [r3A, setR3A] = useState('10');
  const [r3B, setR3B] = useState('100');
  const [r3C, setR3C] = useState('25');
  const [r3Inversa, setR3Inversa] = useState(false);

  // --- NÚMERO POR EXTENSO STATE ---
  const [numExtensoInput, setNumExtensoInput] = useState('1450.75');
  const [modoMonetario, setModoMonetario] = useState(true);

  // --- NÚMEROS ROMANOS STATE ---
  const [arabicoInput, setArabicoInput] = useState('2026');
  const [romanoInput, setRomanoInput] = useState('MMXXVI');

  // --- MMC & MDC STATE ---
  const [numMmc1, setNumMmc1] = useState('12');
  const [numMmc2, setNumMmc2] = useState('18');

  // --- DATAS STATE ---
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  // --- CALCULADORA PORCENTAGEM COMPUTED ---
  const resPct1 = useMemo(() => {
    const p = parseFloat(pct1);
    const v = parseFloat(val1);
    return isNaN(p) || isNaN(v) ? 0 : (p / 100) * v;
  }, [pct1, val1]);

  const resPct2 = useMemo(() => {
    const a = parseFloat(pctValA);
    const b = parseFloat(pctValB);
    return isNaN(a) || isNaN(b) || b === 0 ? 0 : (a / b) * 100;
  }, [pctValA, pctValB]);

  const resPctVariacao = useMemo(() => {
    const o = parseFloat(origVal);
    const f = parseFloat(finalVal);
    if (isNaN(o) || isNaN(f) || o === 0) return 0;
    return ((f - o) / o) * 100;
  }, [origVal, finalVal]);

  // --- REGRA DE 3 COMPUTED ---
  const resRegra3 = useMemo(() => {
    const a = parseFloat(r3A);
    const b = parseFloat(r3B);
    const c = parseFloat(r3C);
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0 || c === 0) return 0;
    return r3Inversa ? (a * b) / c : (b * c) / a;
  }, [r3A, r3B, r3C, r3Inversa]);

  // --- NÚMERO POR EXTENSO ALGORITHM ---
  const numeroPorExtenso = useMemo(() => {
    const val = parseFloat(numExtensoInput.replace(',', '.'));
    if (isNaN(val)) return 'Valor inválido';

    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const converterGrupo = (n: number): string => {
      if (n === 0) return '';
      if (n === 100) return 'cem';
      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;
      const partes: string[] = [];

      if (c > 0) partes.push(centenas[c]);
      if (d === 1) {
        partes.push(especiais[u]);
      } else {
        if (d > 1) partes.push(dezenas[d]);
        if (u > 0) partes.push(unidades[u]);
      }
      return partes.join(' e ');
    };

    const inteiro = Math.floor(Math.abs(val));
    const centavos = Math.round((Math.abs(val) - inteiro) * 100);

    if (inteiro === 0 && centavos === 0) {
      return modoMonetario ? 'zero reais' : 'zero';
    }

    const milhares = Math.floor(inteiro / 1000);
    const restoMilhar = inteiro % 1000;
    const partesExtenso: string[] = [];

    if (milhares > 0) {
      if (milhares === 1) {
        partesExtenso.push('mil');
      } else {
        partesExtenso.push(`${converterGrupo(milhares)} mil`);
      }
    }
    if (restoMilhar > 0) {
      partesExtenso.push(converterGrupo(restoMilhar));
    }

    const textoInteiro = partesExtenso.join(restoMilhar < 100 || restoMilhar % 100 === 0 ? ' e ' : ', ');

    if (!modoMonetario) {
      return textoInteiro || 'zero';
    }

    const sufixoReal = inteiro === 1 ? 'real' : 'reais';
    const textoFinal = inteiro > 0 ? `${textoInteiro} ${sufixoReal}` : '';
    const textoCentavos = centavos > 0 ? `${converterGrupo(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}` : '';

    if (textoFinal && textoCentavos) return `${textoFinal} e ${textoCentavos}`;
    return textoFinal || textoCentavos || 'zero reais';
  }, [numExtensoInput, modoMonetario]);

  // --- NÚMEROS ROMANOS CONVERTER ---
  const arabicoParaRomano = (numStr: string): string => {
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num <= 0 || num > 3999) return 'Válido de 1 a 3999';
    const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const syb = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let roman = '';
    let n = num;
    for (let i = 0; i < val.length; i++) {
      while (n >= val[i]) {
        roman += syb[i];
        n -= val[i];
      }
    }
    return roman;
  };

  const romanoParaArabico = (rom: string): number | string => {
    const romanMap: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const clean = rom.toUpperCase().trim();
    let total = 0;
    for (let i = 0; i < clean.length; i++) {
      const current = romanMap[clean[i]];
      const next = romanMap[clean[i + 1]];
      if (!current) return 'Romano inválido';
      if (next && current < next) {
        total -= current;
      } else {
        total += current;
      }
    }
    return total;
  };

  // --- MMC & MDC ALGORITHMS ---
  const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b));
  const mmc = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / mdc(a, b));

  const resMdc = useMemo(() => {
    const a = parseInt(numMmc1, 10);
    const b = parseInt(numMmc2, 10);
    return isNaN(a) || isNaN(b) ? 0 : mdc(a, b);
  }, [numMmc1, numMmc2]);

  const resMmc = useMemo(() => {
    const a = parseInt(numMmc1, 10);
    const b = parseInt(numMmc2, 10);
    return isNaN(a) || isNaN(b) ? 0 : mmc(a, b);
  }, [numMmc1, numMmc2]);

  // --- DATAS DIFFERENCE COMPUTED ---
  const diffDatas = useMemo(() => {
    const d1 = new Date(dataInicio);
    const d2 = new Date(dataFim);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30.4375);
    return { dias, semanas, meses };
  }, [dataInicio, dataFim]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Matemática, Regra de 3 & Cálculos
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              4DEVS & INVERTEXTO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Calculadora de porcentagem, regra de 3 direta e inversa, números por extenso monetário, romanos, MMC e dias entre datas.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'porcentagem', label: 'Porcentagem (%)' },
          { id: 'regra3', label: 'Regra de 3' },
          { id: 'extenso', label: 'Número por Extenso' },
          { id: 'romanos', label: 'Números Romanos' },
          { id: 'mmc-mdc', label: 'MMC & MDC' },
          { id: 'datas', label: 'Contador de Datas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: PORCENTAGEM */}
      {activeTab === 'porcentagem' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quanto é X% de Y? */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-white block">Quanto é X% de Y?</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pct1}
                onChange={(e) => setPct1(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400">% de</span>
              <input
                type="number"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Resultado:</span>
              <span className="font-mono text-base font-bold text-cyan-300">{resPct1.toFixed(2)}</span>
            </div>
          </div>

          {/* X é quantos % de Y? */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-white block">O valor X é quantos % de Y?</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pctValA}
                onChange={(e) => setPctValA(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400">de</span>
              <input
                type="number"
                value={pctValB}
                onChange={(e) => setPctValB(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Equivale a:</span>
              <span className="font-mono text-base font-bold text-emerald-300">{resPct2.toFixed(2)}%</span>
            </div>
          </div>

          {/* Variação Percentual (Aumento / Queda) */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-white block">Variação % (De X para Y)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={origVal}
                onChange={(e) => setOrigVal(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400">para</span>
              <input
                type="number"
                value={finalVal}
                onChange={(e) => setFinalVal(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className={`p-3 bg-slate-900 rounded-xl border flex items-center justify-between ${
              resPctVariacao >= 0 ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'
            }`}>
              <span className="text-xs text-slate-400">Variação:</span>
              <span className="font-mono text-base font-bold">
                {resPctVariacao >= 0 ? `+${resPctVariacao.toFixed(2)}%` : `${resPctVariacao.toFixed(2)}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: REGRA DE 3 */}
      {activeTab === 'regra3' && (
        <div className="max-w-xl mx-auto p-6 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">Regra de Três Simples</span>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={r3Inversa}
                onChange={(e) => setR3Inversa(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
              />
              <span>Inversamente Proporcional</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center text-center">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Valor A</label>
              <input
                type="number"
                value={r3A}
                onChange={(e) => setR3A(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Está Para (B)</label>
              <input
                type="number"
                value={r3B}
                onChange={(e) => setR3B(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Assim Como (C)</label>
              <input
                type="number"
                value={r3C}
                onChange={(e) => setR3C(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-emerald-400">Resultado (X)</label>
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-2 px-3 text-sm font-mono font-bold text-emerald-300">
                {resRegra3.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: NÚMERO POR EXTENSO */}
      {activeTab === 'extenso' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={numExtensoInput}
                onChange={(e) => setNumExtensoInput(e.target.value)}
                placeholder="Ex: 1450.50"
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => setModoMonetario(!modoMonetario)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  modoMonetario ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {modoMonetario ? 'Formato Monetário (R$ Reais)' : 'Número Decimal Puro'}
              </button>
            </div>

            <button
              onClick={() => copyToClipboard(numeroPorExtenso, 'extenso')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              {copiedKey === 'extenso' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey === 'extenso' ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Escrita Por Extenso</span>
            <p className="text-base font-medium text-white capitalize select-all">
              {numeroPorExtenso}
            </p>
          </div>
        </div>
      )}

      {/* ABA: NÚMEROS ROMANOS */}
      {activeTab === 'romanos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Número Arábico para Romano</span>
            <input
              type="number"
              value={arabicoInput}
              onChange={(e) => setArabicoInput(e.target.value)}
              placeholder="Ex: 2026"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Em Romano:</span>
              <span className="font-mono text-lg font-bold text-cyan-300">{arabicoParaRomano(arabicoInput)}</span>
            </div>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Número Romano para Arábico</span>
            <input
              type="text"
              value={romanoInput}
              onChange={(e) => setRomanoInput(e.target.value)}
              placeholder="Ex: MMXXVI"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white uppercase focus:outline-none focus:border-cyan-500"
            />
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Em Arábico:</span>
              <span className="font-mono text-lg font-bold text-emerald-300">{romanoParaArabico(romanoInput)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: MMC & MDC */}
      {activeTab === 'mmc-mdc' && (
        <div className="max-w-xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1/2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Primeiro Número</label>
              <input
                type="number"
                value={numMmc1}
                onChange={(e) => setNumMmc1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>
            <div className="w-1/2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Segundo Número</label>
              <input
                type="number"
                value={numMmc2}
                onChange={(e) => setNumMmc2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">MMC (Mínimo Múltiplo Comum)</span>
              <span className="font-mono text-xl font-black text-white">{resMmc}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">MDC (Máximo Divisor Comum)</span>
              <span className="font-mono text-xl font-black text-white">{resMdc}</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: DATAS */}
      {activeTab === 'datas' && (
        <div className="max-w-xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Data Inicial</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Data Final</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>
          </div>

          {diffDatas && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Dias Corridos</span>
                <span className="text-lg font-mono font-bold text-cyan-300">{diffDatas.dias} dias</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Semanas</span>
                <span className="text-lg font-mono font-bold text-white">{diffDatas.semanas} semanas</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Meses Aprox.</span>
                <span className="text-lg font-mono font-bold text-emerald-300">{diffDatas.meses} meses</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
