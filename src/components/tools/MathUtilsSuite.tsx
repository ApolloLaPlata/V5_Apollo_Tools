'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Percent, 
  Divide, 
  Calendar, 
  Copy, 
  Check, 
  Hash, 
  ArrowRightLeft, 
  Sparkles, 
  Plus, 
  Minus, 
  Layers, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export type MathTabType = 
  | 'porcentagem' 
  | 'regra3' 
  | 'extenso' 
  | 'romanos' 
  | 'mmc-mdc' 
  | 'datas' 
  | 'fatorar' 
  | 'resto-divisao' 
  | 'operacoes-datas';

export function MathUtilsSuite({ defaultTab = 'porcentagem' }: { defaultTab?: MathTabType }) {
  const [activeTab, setActiveTab] = useState<MathTabType>(defaultTab);
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

  // --- DIFERENÇA DE DATAS STATE ---
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  // --- 4DEVS: FATORAÇÃO EM PRIMOS STATE ---
  const [numFatorar, setNumFatorar] = useState('360');

  // --- 4DEVS: RESTO DA DIVISÃO STATE ---
  const [dividendoInput, setDividendoInput] = useState('250');
  const [divisorInput, setDivisorInput] = useState('7');

  // --- 4DEVS: OPERAÇÕES DE DATAS (SOMAR / SUBTRAIR) STATE ---
  const [dataBase, setDataBase] = useState(new Date().toISOString().slice(0, 10));
  const [operacaoTipo, setOperacaoTipo] = useState<'somar' | 'subtrair'>('somar');
  const [qtdDias, setQtdDias] = useState('15');
  const [qtdSemanas, setQtdSemanas] = useState('0');
  const [qtdMeses, setQtdMeses] = useState('0');
  const [qtdAnos, setQtdAnos] = useState('0');
  const [apenasDiasUteis, setApenasDiasUteis] = useState(false);

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

  // --- 4DEVS: FATORAÇÃO EM PRIMOS COMPUTED ---
  const fatoracao = useMemo(() => {
    const n = parseInt(numFatorar, 10);
    if (isNaN(n) || n <= 0) return null;
    if (n === 1) {
      return {
        n: 1,
        steps: [{ current: 1, prime: 1 }],
        canonical: '1 (Não é primo nem composto)',
        isPrime: false,
        divisores: [1],
        totalDivisores: 1
      };
    }

    let temp = n;
    const steps: { current: number; prime: number }[] = [];
    const factorCount: Record<number, number> = {};

    let d = 2;
    while (d * d <= temp) {
      if (temp % d === 0) {
        steps.push({ current: temp, prime: d });
        factorCount[d] = (factorCount[d] || 0) + 1;
        temp = Math.floor(temp / d);
      } else {
        d = d === 2 ? 3 : d + 2;
      }
    }
    if (temp > 1) {
      steps.push({ current: temp, prime: temp });
      factorCount[temp] = (factorCount[temp] || 0) + 1;
    }
    steps.push({ current: 1, prime: 0 });

    const superscripts: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    const toSuper = (num: number) => String(num).split('').map((c) => superscripts[c] || c).join('');

    const canonical = Object.entries(factorCount)
      .map(([p, exp]) => (exp > 1 ? `${p}${toSuper(exp)}` : `${p}`))
      .join(' × ');

    const isPrime = steps.length === 2 && steps[0].prime === n;

    // Divisores de n
    const divisores: number[] = [];
    for (let i = 1; i * i <= n; i++) {
      if (n % i === 0) {
        divisores.push(i);
        if (i * i !== n) divisores.push(n / i);
      }
    }
    divisores.sort((a, b) => a - b);

    return {
      n,
      steps,
      canonical,
      isPrime,
      divisores,
      totalDivisores: divisores.length
    };
  }, [numFatorar]);

  // --- 4DEVS: RESTO DA DIVISÃO COMPUTED ---
  const restoDivisao = useMemo(() => {
    const a = parseInt(dividendoInput, 10);
    const b = parseInt(divisorInput, 10);
    if (isNaN(a) || isNaN(b) || b === 0) return null;
    const quociente = Math.floor(a / b);
    const resto = a % b;
    const exata = resto === 0;
    return {
      dividendo: a,
      divisor: b,
      quociente,
      resto,
      exata,
      provaReal: `${a} = (${b} × ${quociente}) + ${resto}`
    };
  }, [dividendoInput, divisorInput]);

  // --- 4DEVS: OPERAÇÕES DE DATAS COMPUTED ---
  const dataCalculada = useMemo(() => {
    if (!dataBase) return null;
    const parts = dataBase.split('-').map(Number);
    if (parts.length !== 3) return null;
    let d = new Date(parts[0], parts[1] - 1, parts[2]);

    const anos = parseInt(qtdAnos, 10) || 0;
    const meses = parseInt(qtdMeses, 10) || 0;
    const semanas = parseInt(qtdSemanas, 10) || 0;
    const dias = parseInt(qtdDias, 10) || 0;

    const mult = operacaoTipo === 'somar' ? 1 : -1;

    // Aplicar anos e meses
    if (anos !== 0) d.setFullYear(d.getFullYear() + anos * mult);
    if (meses !== 0) d.setMonth(d.getMonth() + meses * mult);

    // Semanas para dias
    const totalDiasNormais = semanas * 7;
    if (totalDiasNormais > 0) {
      d.setDate(d.getDate() + totalDiasNormais * mult);
    }

    // Dias (corridos ou apenas dias úteis)
    if (dias > 0) {
      if (apenasDiasUteis) {
        let count = 0;
        while (count < dias) {
          d.setDate(d.getDate() + 1 * mult);
          const dayOfWeek = d.getDay();
          // 0 = Domingo, 6 = Sábado
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
          }
        }
      } else {
        d.setDate(d.getDate() + dias * mult);
      }
    }

    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const mesesAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const diaFmt = String(d.getDate()).padStart(2, '0');
    const mesFmt = String(d.getMonth() + 1).padStart(2, '0');
    const anoFmt = d.getFullYear();

    return {
      dataFormatada: `${diaFmt}/${mesFmt}/${anoFmt}`,
      dataIso: `${anoFmt}-${mesFmt}-${diaFmt}`,
      diaSemana: diasSemana[d.getDay()],
      descricaoExtenso: `${diasSemana[d.getDay()]}, ${diaFmt} de ${mesesAno[d.getMonth()]} de ${anoFmt}`
    };
  }, [dataBase, operacaoTipo, qtdDias, qtdSemanas, qtdMeses, qtdAnos, apenasDiasUteis]);

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
              Suíte de Matemática Avançada & Operações Temporais
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              4DEVS & INVERTEXTO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Fatoração em primos, resto da divisão euclidiana, somar/subtrair datas e utilitários matemáticos de precisão.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'fatorar', label: 'Fatorar Número (Primos)', badge: '4Devs' },
          { id: 'resto-divisao', label: 'Resto da Divisão (%)', badge: '4Devs' },
          { id: 'operacoes-datas', label: 'Somar/Subtrair Datas', badge: '4Devs' },
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === tab.id ? 'bg-slate-950/40 text-slate-900 font-extrabold' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4DEVS: ABA FATORAÇÃO EM PRIMOS */}
      {activeTab === 'fatorar' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Número Inteiro para Decomposição
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000000000"
                  value={numFatorar}
                  onChange={(e) => setNumFatorar(e.target.value)}
                  placeholder="Ex: 360"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={() => setNumFatorar(String(Math.floor(Math.random() * 950 + 10)))}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all whitespace-nowrap"
                >
                  Número Aleatório
                </button>
              </div>
            </div>

            {fatoracao && (
              <div className="space-y-4 pt-2">
                {/* Cartão de Fatoração Canônica */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 font-medium">Forma Fatorada Canônica:</span>
                    {fatoracao.isPrime ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        NÚMERO PRIMO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                        NÚMERO COMPOSTO
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-cyan-300 tracking-wide mt-1">
                    {fatoracao.n} = {fatoracao.canonical}
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${fatoracao.n} = ${fatoracao.canonical}`, 'fatoracao')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Copiar Fatoração"
                  >
                    {copiedKey === 'fatoracao' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Tabela Didática de Divisões Sucessivas */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
                    Decomposição Passo a Passo (Divisões Sucessivas):
                  </span>
                  <div className="font-mono text-sm max-h-48 overflow-y-auto space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {fatoracao.steps.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-800/40 py-0.5">
                        <span className="text-slate-300">{st.current}</span>
                        {st.prime > 0 ? (
                          <span className="text-emerald-400 font-bold">| {st.prime}</span>
                        ) : (
                          <span className="text-slate-600">| fim</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divisores do Número */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Todos os Divisores ({fatoracao.totalDivisores}):
                    </span>
                    <button
                      onClick={() => copyToClipboard(fatoracao.divisores.join(', '), 'divisores')}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Copiar todos
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {fatoracao.divisores.join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4DEVS: ABA RESTO DA DIVISÃO */}
      {activeTab === 'resto-divisao' && (
        <div className="max-w-xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Dividendo (a)</label>
              <input
                type="number"
                value={dividendoInput}
                onChange={(e) => setDividendoInput(e.target.value)}
                placeholder="Ex: 250"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Divisor (b)</label>
              <input
                type="number"
                value={divisorInput}
                onChange={(e) => setDivisorInput(e.target.value)}
                placeholder="Ex: 7"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {restoDivisao && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-900/90 rounded-xl border border-cyan-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Quociente Inteiro</span>
                  <span className="font-mono text-3xl font-extrabold text-white">{restoDivisao.quociente}</span>
                </div>
                <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Resto (Módulo %)</span>
                  <span className="font-mono text-3xl font-extrabold text-emerald-300">{restoDivisao.resto}</span>
                </div>
              </div>

              {/* Status de Exatidão */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Classificação da Divisão:</span>
                {restoDivisao.exata ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Divisão Exata (Resto Zero)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400">
                    Divisão Não Exata (Resto {restoDivisao.resto})
                  </span>
                )}
              </div>

              {/* Prova Real Euclidiana */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 relative">
                <span className="text-xs text-slate-400 block mb-1">Teorema da Divisão Euclidiana:</span>
                <span className="text-base font-mono font-bold text-cyan-300">{restoDivisao.provaReal}</span>
                <button
                  onClick={() => copyToClipboard(restoDivisao.provaReal, 'provaReal')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Copiar Prova Real"
                >
                  {copiedKey === 'provaReal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4DEVS: ABA OPERAÇÕES DE DATAS (SOMAR / SUBTRAIR) */}
      {activeTab === 'operacoes-datas' && (
        <div className="max-w-2xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Data Inicial</label>
              <input
                type="date"
                value={dataBase}
                onChange={(e) => setDataBase(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Operação Desejada</label>
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => setOperacaoTipo('somar')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    operacaoTipo === 'somar' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Somar (+ Prazo)
                </button>
                <button
                  onClick={() => setOperacaoTipo('subtrair')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    operacaoTipo === 'subtrair' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> Subtrair (- Retroativo)
                </button>
              </div>
            </div>
          </div>

          {/* Grid de Incrementos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dias</label>
              <input
                type="number"
                min="0"
                value={qtdDias}
                onChange={(e) => setQtdDias(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm text-center focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Semanas</label>
              <input
                type="number"
                min="0"
                value={qtdSemanas}
                onChange={(e) => setQtdSemanas(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm text-center focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Meses</label>
              <input
                type="number"
                min="0"
                value={qtdMeses}
                onChange={(e) => setQtdMeses(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm text-center focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Anos</label>
              <input
                type="number"
                min="0"
                value={qtdAnos}
                onChange={(e) => setQtdAnos(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm text-center focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Toggle Dias Úteis */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={apenasDiasUteis}
              onChange={(e) => setApenasDiasUteis(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-xs text-slate-300">
              Considerar apenas <strong>dias úteis</strong> para a contagem de dias (ignora sábados e domingos).
            </span>
          </label>

          {/* Resultado da Data */}
          {dataCalculada && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 relative">
              <span className="text-xs text-slate-400 block mb-1 font-medium">Data Resultante Calculada:</span>
              <div className="text-3xl font-mono font-extrabold text-white tracking-tight">
                {dataCalculada.dataFormatada}
              </div>
              <p className="text-xs font-semibold text-cyan-400 mt-1">
                {dataCalculada.descricaoExtenso}
              </p>
              <button
                onClick={() => copyToClipboard(dataCalculada.dataFormatada, 'dataCalculada')}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Copiar Data"
              >
                {copiedKey === 'dataCalculada' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA: PORCENTAGEM */}
      {activeTab === 'porcentagem' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Quanto é X% de Y?</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pct1}
                onChange={(e) => setPct1(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
              <span className="text-sm font-mono text-slate-500">% de</span>
              <input
                type="number"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Resultado:</span>
              <span className="font-mono text-lg font-bold text-cyan-300">{resPct1.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">A é qual porcentagem de B?</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pctValA}
                onChange={(e) => setPctValA(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
              <span className="text-sm font-mono text-slate-500">de</span>
              <input
                type="number"
                value={pctValB}
                onChange={(e) => setPctValB(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Porcentagem:</span>
              <span className="font-mono text-lg font-bold text-cyan-300">{resPct2.toFixed(2)}%</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Variação Percentual</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={origVal}
                onChange={(e) => setOrigVal(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
              <span className="text-sm font-mono text-slate-500">para</span>
              <input
                type="number"
                value={finalVal}
                onChange={(e) => setFinalVal(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:border-cyan-500"
              />
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Variação:</span>
              <span className={`font-mono text-lg font-bold ${resPctVariacao >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {resPctVariacao >= 0 ? `+${resPctVariacao.toFixed(2)}%` : `${resPctVariacao.toFixed(2)}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: REGRA DE 3 */}
      {activeTab === 'regra3' && (
        <div className="max-w-xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Proporção:</span>
            <button
              onClick={() => setR3Inversa(!r3Inversa)}
              className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all ${
                r3Inversa
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {r3Inversa ? 'Inversamente Proporcional' : 'Diretamente Proporcional'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Valor A</label>
              <input
                type="number"
                value={r3A}
                onChange={(e) => setR3A(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Valor B</label>
              <input
                type="number"
                value={r3B}
                onChange={(e) => setR3B(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">Valor C</label>
              <input
                type="number"
                value={r3C}
                onChange={(e) => setR3C(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-cyan-400">Resultado X</label>
              <div className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-sm font-mono font-bold text-cyan-300 flex items-center justify-between">
                <span>{resRegra3.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: EXTENSO */}
      {activeTab === 'extenso' && (
        <div className="max-w-xl mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Valor Numérico</span>
            <div className="flex gap-2">
              <button
                onClick={() => setModoMonetario(true)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                  modoMonetario ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Monetário (R$)
              </button>
              <button
                onClick={() => setModoMonetario(false)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                  !modoMonetario ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Cardinal
              </button>
            </div>
          </div>
          <input
            type="text"
            value={numExtensoInput}
            onChange={(e) => setNumExtensoInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base font-mono text-white focus:border-cyan-500"
          />
          <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/20 relative">
            <span className="text-xs text-slate-400 block mb-1">Por Extenso:</span>
            <p className="font-mono text-sm font-bold text-cyan-300 pr-8">{numeroPorExtenso}</p>
            <button
              onClick={() => copyToClipboard(numeroPorExtenso, 'extenso')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              {copiedKey === 'extenso' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* ABA: ROMANOS */}
      {activeTab === 'romanos' && (
        <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Arábico para Romano</span>
            <input
              type="number"
              min="1"
              max="3999"
              value={arabicoInput}
              onChange={(e) => setArabicoInput(e.target.value)}
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

      {/* ABA: DIFERENÇA DE DATAS */}
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
