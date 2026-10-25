'use client';

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  Fuel, 
  Car, 
  Copy, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  BarChart2, 
  Percent, 
  Layers, 
  Coins, 
  Info, 
  Users 
} from 'lucide-react';

export type FinanceTab = 'juros-compostos' | 'primeiro-milhao' | 'financiamento' | 'gasolina-etanol-viagem';

export function FinanceAndEconomySuite({ defaultTab = 'juros-compostos' }: { defaultTab?: FinanceTab }) {
  const [activeTab, setActiveTab] = useState<FinanceTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // ==========================================
  // TAB 1: JUROS COMPOSTOS STATE
  // ==========================================
  const [initialAmount, setInitialAmount] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [interestRate, setInterestRate] = useState<number>(10); // %
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [timePeriod, setTimePeriod] = useState<number>(10);
  const [periodType, setPeriodType] = useState<'years' | 'months'>('years');

  const compoundResult = useMemo(() => {
    const totalMonths = periodType === 'years' ? timePeriod * 12 : timePeriod;
    const monthlyRate = rateType === 'annual' 
      ? Math.pow(1 + interestRate / 100, 1 / 12) - 1 
      : interestRate / 100;

    let balance = initialAmount;
    let totalInvested = initialAmount;
    const history: { month: number; year: number; balance: number; invested: number; interest: number }[] = [];

    for (let m = 1; m <= totalMonths; m++) {
      const earned = balance * monthlyRate;
      balance += earned + monthlyContribution;
      totalInvested += monthlyContribution;

      if (m % 12 === 0 || m === totalMonths) {
        history.push({
          month: m,
          year: Math.ceil(m / 12),
          balance: Math.round(balance),
          invested: Math.round(totalInvested),
          interest: Math.round(balance - totalInvested)
        });
      }
    }

    const totalInterest = balance - totalInvested;

    return {
      finalBalance: balance,
      totalInvested,
      totalInterest,
      totalMonths,
      history
    };
  }, [initialAmount, monthlyContribution, interestRate, rateType, timePeriod, periodType]);

  // ==========================================
  // TAB 2: PRIMEIRO MILHÃO STATE
  // ==========================================
  const [targetInitial, setTargetInitial] = useState<number>(10000);
  const [targetMonthlyRate, setTargetMonthlyRate] = useState<number>(0.8); // 0.8% ao mês (~10% a.a)
  const [targetMonthlyDeposit, setTargetMonthlyDeposit] = useState<number>(1000);

  const firstMillionEstimate = useMemo(() => {
    const target = 1000000;
    const r = targetMonthlyRate / 100;
    if (r <= 0 || targetMonthlyDeposit <= 0) return null;

    let current = targetInitial;
    let months = 0;
    let totalInvested = targetInitial;

    while (current < target && months < 1200) { // limite de 100 anos
      months++;
      const earned = current * r;
      current += earned + targetMonthlyDeposit;
      totalInvested += targetMonthlyDeposit;
    }

    const years = (months / 12).toFixed(1);
    const totalInterest = current - totalInvested;

    return {
      months,
      years,
      totalInvested,
      totalInterest,
      finalAmount: current
    };
  }, [targetInitial, targetMonthlyRate, targetMonthlyDeposit]);

  // ==========================================
  // TAB 3: SIMULADOR DE FINANCIAMENTO (PRICE VS SAC) STATE
  // ==========================================
  const [financedAmount, setFinancedAmount] = useState<number>(200000);
  const [loanInterestAnnual, setLoanInterestAnnual] = useState<number>(10.5); // % a.a
  const [loanMonths, setLoanMonths] = useState<number>(120); // 10 anos

  const loanComparison = useMemo(() => {
    if (financedAmount <= 0 || loanInterestAnnual <= 0 || loanMonths <= 0) return null;
    const i = Math.pow(1 + loanInterestAnnual / 100, 1 / 12) - 1; // taxa mensal equivalente

    // Tabela Price (Parcelas Fixas)
    // PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
    const pmtPrice = financedAmount * (i * Math.pow(1 + i, loanMonths)) / (Math.pow(1 + i, loanMonths) - 1);
    const totalPrice = pmtPrice * loanMonths;
    const totalInterestPrice = totalPrice - financedAmount;

    // Tabela SAC (Amortização Constante)
    // A = PV / n
    const amortSAC = financedAmount / loanMonths;
    const firstInstallmentSAC = amortSAC + financedAmount * i;
    const lastInstallmentSAC = amortSAC + amortSAC * i;
    const totalInterestSAC = (loanMonths + 1) * financedAmount * i / 2;
    const totalSAC = financedAmount + totalInterestSAC;

    return {
      price: {
        monthlyInstallment: pmtPrice,
        totalPaid: totalPrice,
        totalInterest: totalInterestPrice
      },
      sac: {
        firstInstallment: firstInstallmentSAC,
        lastInstallment: lastInstallmentSAC,
        totalPaid: totalSAC,
        totalInterest: totalInterestSAC,
        savingsVsPrice: totalPrice - totalSAC
      }
    };
  }, [financedAmount, loanInterestAnnual, loanMonths]);

  // ==========================================
  // TAB 4: COMBUSTÍVEL & VIAGEM STATE
  // ==========================================
  const [gasPrice, setGasPrice] = useState<number>(5.89);
  const [ethanolPrice, setEthanolPrice] = useState<number>(3.99);
  const [ratioThreshold, setRatioThreshold] = useState<number>(70); // 70% regra de ouro
  const [tripDistance, setTripDistance] = useState<number>(320); // km
  const [carEfficiency, setCarEfficiency] = useState<number>(11.5); // km/L
  const [tollCost, setTollCost] = useState<number>(45.00); // R$
  const [passengersCount, setPassengersCount] = useState<number>(3);

  const fuelComparison = useMemo(() => {
    if (gasPrice <= 0 || ethanolPrice <= 0) return null;
    const ratio = (ethanolPrice / gasPrice) * 100;
    const isEthanolBetter = ratio < ratioThreshold;
    const maxEthanolRecommended = gasPrice * (ratioThreshold / 100);

    return {
      ratio: ratio.toFixed(1),
      isEthanolBetter,
      maxEthanolRecommended
    };
  }, [gasPrice, ethanolPrice, ratioThreshold]);

  const tripCostResult = useMemo(() => {
    if (tripDistance <= 0 || carEfficiency <= 0 || gasPrice <= 0) return null;
    const litersNeeded = tripDistance / carEfficiency;
    const chosenPrice = (fuelComparison?.isEthanolBetter ? ethanolPrice : gasPrice);
    const fuelTotalCost = litersNeeded * chosenPrice;
    const grandTotal = fuelTotalCost + tollCost;
    const perPassenger = grandTotal / Math.max(1, passengersCount);

    return {
      litersNeeded: Number(litersNeeded.toFixed(2)),
      fuelTotalCost,
      grandTotal,
      perPassenger,
      fuelType: fuelComparison?.isEthanolBetter ? 'Etanol' : 'Gasolina'
    };
  }, [tripDistance, carEfficiency, gasPrice, ethanolPrice, tollCost, passengersCount, fuelComparison]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Cyberpunk de Fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
              Benchmark Invertexto · Finanças & Economia
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              100% Client-Side
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Finanças Pessoais, Juros Compostos & Combustível
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Simulador de investimentos e primeiro milhão, amortização SAC vs Price e comparador de combustível.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('juros-compostos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'juros-compostos'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Juros Compostos
          </button>
          <button
            onClick={() => setActiveTab('primeiro-milhao')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'primeiro-milhao'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            Primeiro Milhão
          </button>
          <button
            onClick={() => setActiveTab('financiamento')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'financiamento'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Price vs SAC
          </button>
          <button
            onClick={() => setActiveTab('gasolina-etanol-viagem')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'gasolina-etanol-viagem'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            Combustível & Viagem
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="relative z-10 pt-6">

        {/* ========================================================= */}
        {/* TAB 1: JUROS COMPOSTOS */}
        {/* ========================================================= */}
        {activeTab === 'juros-compostos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-emerald-400 font-bold mb-1.5">
                  Valor Inicial (R$)
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">
                  Aporte Mensal (R$)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-cyan-400 font-bold">Taxa de Juros (%)</label>
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as any)}
                    className="text-[10px] bg-slate-800 border-none text-slate-300 rounded font-mono px-1.5 py-0.5"
                  >
                    <option value="annual">ao ano (a.a)</option>
                    <option value="monthly">ao mês (a.m)</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={interestRate}
                  step="0.1"
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-amber-400 font-bold">Período</label>
                  <select
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value as any)}
                    className="text-[10px] bg-slate-800 border-none text-slate-300 rounded font-mono px-1.5 py-0.5"
                  >
                    <option value="years">Anos</option>
                    <option value="months">Meses</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Resultado de Destaque */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Montante Final Acumulado
                </span>
                <div className="text-3xl sm:text-5xl font-black text-white mt-1">
                  {formatBRL(compoundResult.finalBalance)}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Investido: <strong className="text-slate-200">{formatBRL(compoundResult.totalInvested)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Total em Juros: <strong className="text-emerald-400">+{formatBRL(compoundResult.totalInterest)}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(formatBRL(compoundResult.finalBalance), 'compound-res')}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap"
              >
                {copiedKey === 'compound-res' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>Copiar Montante</span>
              </button>
            </div>

            {/* Evolução Patrimonial em Barra Gráfica SVG */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-mono text-slate-400 block mb-3 font-bold flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Evolução por Período (Ano a Ano)
              </span>
              <div className="space-y-2">
                {compoundResult.history.slice(-8).map((item, idx) => {
                  const maxVal = compoundResult.finalBalance || 1;
                  const investPercent = (item.invested / maxVal) * 100;
                  const interestPercent = (item.interest / maxVal) * 100;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Ano {item.year} ({item.month}m)</span>
                        <strong className="text-slate-200">{formatBRL(item.balance)}</strong>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full flex overflow-hidden">
                        <div 
                          className="bg-cyan-500/80 h-full" 
                          style={{ width: `${investPercent}%` }} 
                          title={`Investido: ${formatBRL(item.invested)}`}
                        />
                        <div 
                          className="bg-emerald-400 h-full" 
                          style={{ width: `${interestPercent}%` }} 
                          title={`Juros: ${formatBRL(item.interest)}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Capital Investido
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Rendimentos (Juros Compostos)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRIMEIRO MILHÃO */}
        {/* ========================================================= */}
        {activeTab === 'primeiro-milhao' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-amber-400 font-bold mb-1.5">
                  Patrimônio Atual (R$)
                </label>
                <input
                  type="number"
                  value={targetInitial}
                  onChange={(e) => setTargetInitial(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-400 font-bold mb-1.5">
                  Aporte Mensal Previsto (R$)
                </label>
                <input
                  type="number"
                  value={targetMonthlyDeposit}
                  onChange={(e) => setTargetMonthlyDeposit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                  Rentabilidade Média Líquida (% ao mês)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={targetMonthlyRate}
                  onChange={(e) => setTargetMonthlyRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {firstMillionEstimate && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Tempo Estimado para Atingir R$ 1.000.000,00
                </span>
                <div className="text-4xl sm:text-6xl font-black text-white mt-2">
                  {firstMillionEstimate.years} <span className="text-2xl font-normal text-slate-400">anos</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-mono">
                  Aproximadamente <strong>{firstMillionEstimate.months} meses</strong> de disciplina financeira.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mt-6 pt-6 border-t border-slate-800">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-500 block">Do seu próprio bolso:</span>
                    <strong className="text-lg font-mono text-slate-200 mt-0.5 block">
                      {formatBRL(firstMillionEstimate.totalInvested)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-500 block">Juros gerados pelo dinheiro:</span>
                    <strong className="text-lg font-mono text-emerald-400 mt-0.5 block">
                      +{formatBRL(firstMillionEstimate.totalInterest)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SIMULADOR DE FINANCIAMENTO (PRICE VS SAC) */}
        {/* ========================================================= */}
        {activeTab === 'financiamento' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                  Valor Financiado / Empréstimo (R$)
                </label>
                <input
                  type="number"
                  value={financedAmount}
                  onChange={(e) => setFinancedAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-400 font-bold mb-1.5">
                  Taxa de Juros Anual (% a.a)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={loanInterestAnnual}
                  onChange={(e) => setLoanInterestAnnual(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-400 font-bold mb-1.5">
                  Prazo Total (Meses)
                </label>
                <input
                  type="number"
                  value={loanMonths}
                  onChange={(e) => setLoanMonths(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {loanComparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tabela Price */}
                <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Tabela Price (Parcelas Fixas)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800">
                      Constante
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-100">
                    {formatBRL(loanComparison.price.monthlyInstallment)} <span className="text-xs font-normal text-slate-500">/mês</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Pago:</span>
                      <strong className="text-slate-200">{formatBRL(loanComparison.price.totalPaid)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total de Juros:</span>
                      <strong className="text-rose-400">+{formatBRL(loanComparison.price.totalInterest)}</strong>
                    </div>
                  </div>
                </div>

                {/* Tabela SAC */}
                <div className="p-6 rounded-3xl bg-slate-950/80 border border-emerald-500/30 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      Tabela SAC (Amortização Constante)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800">
                      Decrescente
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-100">
                    {formatBRL(loanComparison.sac.firstInstallment)} <span className="text-xs font-normal text-slate-500">↓ até</span> {formatBRL(loanComparison.sac.lastInstallment)}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Pago:</span>
                      <strong className="text-slate-200">{formatBRL(loanComparison.sac.totalPaid)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total de Juros:</span>
                      <strong className="text-emerald-400">+{formatBRL(loanComparison.sac.totalInterest)}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/60 text-emerald-300 font-bold">
                      <span>Economia no SAC:</span>
                      <span>{formatBRL(loanComparison.sac.savingsVsPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COMBUSTÍVEL & VIAGEM */}
        {/* ========================================================= */}
        {activeTab === 'gasolina-etanol-viagem' && (
          <div className="space-y-6">
            {/* Comparador Gasolina vs Etanol */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block mb-4 flex items-center gap-1.5">
                <Fuel className="w-4 h-4" /> Comparador Gasolina vs Etanol (Regra dos 70%)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    Preço da Gasolina (R$/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gasPrice}
                    onChange={(e) => setGasPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    Preço do Etanol (R$/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ethanolPrice}
                    onChange={(e) => setEthanolPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    Proporção Alvo (%)
                  </label>
                  <input
                    type="number"
                    value={ratioThreshold}
                    onChange={(e) => setRatioThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {fuelComparison && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  fuelComparison.isEthanolBetter 
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300'
                }`}>
                  <div>
                    <span className="text-xs font-mono font-bold block">
                      Razão Atual: {fuelComparison.ratio}% (Referência: {ratioThreshold}%)
                    </span>
                    <strong className="text-lg font-bold">
                      {fuelComparison.isEthanolBetter ? 'Abasteça com ETANOL' : 'Abasteça com GASOLINA'}
                    </strong>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Etanol compensa até {formatBRL(fuelComparison.maxEthanolRecommended)}
                  </span>
                </div>
              )}
            </div>

            {/* Calculadora de Custo de Viagem & Rachadinha */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-4 flex items-center gap-1.5">
                <Car className="w-4 h-4" /> Calculadora de Custo de Viagem & Divisão por Passageiro
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">Distância (km)</label>
                  <input
                    type="number"
                    value={tripDistance}
                    onChange={(e) => setTripDistance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">Consumo (km/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carEfficiency}
                    onChange={(e) => setCarEfficiency(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">Pedágios (R$)</label>
                  <input
                    type="number"
                    value={tollCost}
                    onChange={(e) => setTollCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">Passageiros</label>
                  <input
                    type="number"
                    min="1"
                    value={passengersCount}
                    onChange={(e) => setPassengersCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {tripCostResult && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">
                      Combustível ({tripCostResult.fuelType}): {tripCostResult.litersNeeded}L ({formatBRL(tripCostResult.fuelTotalCost)}) + Pedágio: {formatBRL(tollCost)}
                    </span>
                    <div className="text-2xl font-black text-slate-100 mt-0.5">
                      Total: {formatBRL(tripCostResult.grandTotal)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 block font-bold">Por Pessoa ({passengersCount} passageiros):</span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">
                      {formatBRL(tripCostResult.perPassenger)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
