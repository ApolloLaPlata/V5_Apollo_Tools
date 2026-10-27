'use client';

import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  PiggyBank, 
  Calculator, 
  DollarSign, 
  Percent, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  Info, 
  Scale, 
  Car, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface InvestmentAndFinanceBrasilSuiteProps {
  defaultTab?: 'cdi-lci-lca' | 'tesouro-direto' | 'inflation-ipca' | 'salario-liquido' | 'financiamento-cet';
}

export const InvestmentAndFinanceBrasilSuite: React.FC<InvestmentAndFinanceBrasilSuiteProps> = ({ defaultTab = 'cdi-lci-lca' }) => {
  const [activeTab, setActiveTab] = useState<'cdi-lci-lca' | 'tesouro-direto' | 'inflation-ipca' | 'salario-liquido' | 'financiamento-cet'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: COMPARADOR CDB VS LCI/LCA (IR REGRESSIVO)
  // ==========================================
  const [cdiRateAnnual, setCdiRateAnnual] = useState<number>(10.75); // Taxa CDI % a.a.
  const [cdbPercentCdi, setCdbPercentCdi] = useState<number>(110); // CDB 110% do CDI
  const [lciPercentCdi, setLciPercentCdi] = useState<number>(90); // LCI 90% do CDI (isento)
  const [investmentDays, setInvestmentDays] = useState<number>(365); // 1 ano

  const cdiComparison = useMemo(() => {
    // Tabela regressiva de IR para renda fixa Brasil
    let irTaxPercent = 22.5;
    if (investmentDays > 720) irTaxPercent = 15.0;
    else if (investmentDays > 360) irTaxPercent = 17.5;
    else if (investmentDays > 180) irTaxPercent = 20.0;

    // Rentabilidade bruta CDB
    const cdbGrossRate = (cdiRateAnnual * cdbPercentCdi) / 100;
    const cdbNetRate = cdbGrossRate * (1 - irTaxPercent / 100);

    // Rentabilidade LCI/LCA (isenta de IR)
    const lciNetRate = (cdiRateAnnual * lciPercentCdi) / 100;

    // LCI equivalente ao CDB
    const equivalentLciPercent = (cdbPercentCdi * (1 - irTaxPercent / 100)).toFixed(1);

    const winner = cdbNetRate > lciNetRate ? 'CDB' : 'LCI/LCA';

    return {
      irTaxPercent,
      cdbGrossRate: cdbGrossRate.toFixed(2),
      cdbNetRate: cdbNetRate.toFixed(2),
      lciNetRate: lciNetRate.toFixed(2),
      equivalentLciPercent,
      winner
    };
  }, [cdiRateAnnual, cdbPercentCdi, lciPercentCdi, investmentDays]);

  // ==========================================
  // FERRAMENTA 2: SIMULADOR DE TESOURO DIRETO B3
  // ==========================================
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [monthsTerm, setMonthsTerm] = useState<number>(36); // 3 anos
  const [treasuryType, setTreasuryType] = useState<'selic' | 'prefixado' | 'ipca'>('selic');
  const [expectedAnnualRate, setExpectedAnnualRate] = useState<number>(11.25); // 11.25% a.a.

  const treasurySimulation = useMemo(() => {
    const monthlyRate = Math.pow(1 + expectedAnnualRate / 100, 1 / 12) - 1;
    let totalInvested = initialAmount;
    let balance = initialAmount;

    for (let m = 1; m <= monthsTerm; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      totalInvested += monthlyContribution;
    }

    const totalGrossProfit = balance - totalInvested;
    // IR regressivo (36 meses > 720 dias => 15% IR)
    const irRate = monthsTerm > 24 ? 0.15 : monthsTerm > 12 ? 0.175 : 0.20;
    const irAmount = totalGrossProfit * irRate;
    // Taxa B3 de 0.20% a.a. sobre o saldo
    const b3CustodyFee = (balance * 0.002 * (monthsTerm / 12));
    const finalNetBalance = balance - irAmount - b3CustodyFee;

    return {
      totalInvested,
      grossBalance: balance,
      totalGrossProfit,
      irAmount,
      b3CustodyFee,
      finalNetBalance
    };
  }, [initialAmount, monthlyContribution, monthsTerm, expectedAnnualRate]);

  // ==========================================
  // FERRAMENTA 3: CORRETOR DE INFLAÇÃO IPCA HISTÓRICA
  // ==========================================
  const [originalValueBrl, setOriginalValueBrl] = useState<number>(1000);
  const [inflationYears, setInflationYears] = useState<number>(5); // 5 anos atrás
  const [averageAnnualIpca, setAverageAnnualIpca] = useState<number>(5.5); // 5.5% a.a. média

  const inflationMetrics = useMemo(() => {
    const factor = Math.pow(1 + averageAnnualIpca / 100, inflationYears);
    const correctedValue = originalValueBrl * factor;
    const purchasingPowerLossPercent = ((1 - (1 / factor)) * 100).toFixed(1);

    return {
      correctedValue,
      accumulatedInflationPercent: ((factor - 1) * 100).toFixed(1),
      purchasingPowerLossPercent
    };
  }, [originalValueBrl, inflationYears, averageAnnualIpca]);

  // ==========================================
  // FERRAMENTA 4: CALCULADORA DE SALÁRIO LÍQUIDO CLT 2026
  // ==========================================
  const [grossSalary, setGrossSalary] = useState<number>(6500);
  const [dependentsCount, setDependentsCount] = useState<number>(1);
  const [otherDiscounts, setOtherDiscounts] = useState<number>(250); // VT, Plano de Saúde

  const salaryCalculation = useMemo(() => {
    // Tabela progressiva de INSS 2026 oficial (Salário Mínimo R$ 1.502)
    // Faixa 1: até 1.502,00 -> 7.5%
    // Faixa 2: 1.502,01 até 2.800,00 -> 9%
    // Faixa 3: 2.800,01 até 4.200,00 -> 12%
    // Faixa 4: 4.200,01 até 8.157,41 (Teto) -> 14%
    let inss = 0;
    const tetoInss = 8157.41;
    const baseInss = Math.min(grossSalary, tetoInss);

    if (baseInss <= 1502.00) {
      inss = baseInss * 0.075;
    } else if (baseInss <= 2800.00) {
      inss = (1502.00 * 0.075) + ((baseInss - 1502.00) * 0.09);
    } else if (baseInss <= 4200.00) {
      inss = (1502.00 * 0.075) + ((2800.00 - 1502.00) * 0.09) + ((baseInss - 2800.00) * 0.12);
    } else {
      inss = (1502.00 * 0.075) + ((2800.00 - 1502.00) * 0.09) + ((4200.00 - 2800.00) * 0.12) + ((baseInss - 4200.00) * 0.14);
    }

    // Base de cálculo do IRRF
    const dependentDeduction = dependentsCount * 189.59;
    const baseIrrf = Math.max(0, grossSalary - inss - dependentDeduction);

    // Tabela progressiva IRRF RFB
    let irrf = 0;
    if (baseIrrf <= 2259.20) {
      irrf = 0;
    } else if (baseIrrf <= 2826.65) {
      irrf = (baseIrrf * 0.075) - 169.44;
    } else if (baseIrrf <= 3751.05) {
      irrf = (baseIrrf * 0.15) - 381.44;
    } else if (baseIrrf <= 4664.68) {
      irrf = (baseIrrf * 0.225) - 662.77;
    } else {
      irrf = (baseIrrf * 0.275) - 896.00;
    }
    irrf = Math.max(0, irrf);

    const totalDiscounts = inss + irrf + otherDiscounts;
    const netSalary = Math.max(0, grossSalary - totalDiscounts);
    const effectiveDiscountPercent = ((totalDiscounts / grossSalary) * 100).toFixed(1);

    return {
      inss,
      irrf,
      totalDiscounts,
      netSalary,
      effectiveDiscountPercent
    };
  }, [grossSalary, dependentsCount, otherDiscounts]);

  // ==========================================
  // FERRAMENTA 5: CALCULADORA DE CET DE FINANCIAMENTO
  // ==========================================
  const [financedAmount, setFinancedAmount] = useState<number>(45000); // R$ 45.000
  const [contractNominalRateMonth, setContractNominalRateMonth] = useState<number>(1.49); // 1.49% a.m.
  const [monthsInstallments, setMonthsInstallments] = useState<number>(48); // 48 parcelas
  const [tacAndIofFees, setTacAndIofFees] = useState<number>(2400); // Tarifas embutidas

  const financingCetMetrics = useMemo(() => {
    const rNominal = contractNominalRateMonth / 100;
    // Parcela pura pelo sistema Price
    const pureInstallment = financedAmount * (rNominal / (1 - Math.pow(1 + rNominal, -monthsInstallments)));

    // Parcela real com tarifas embutidas no saldo devedor
    const totalFinancedWithFees = financedAmount + tacAndIofFees;
    const realInstallment = totalFinancedWithFees * (rNominal / (1 - Math.pow(1 + rNominal, -monthsInstallments)));

    const totalPaid = realInstallment * monthsInstallments;
    const totalInterestPaid = totalPaid - financedAmount;

    // Estimativa da taxa efetiva mensal real (CET mensal aproximado)
    const cetEstimatedMonthlyRate = (contractNominalRateMonth * (1 + (tacAndIofFees / financedAmount) / (monthsInstallments / 12))).toFixed(2);
    const cetEstimatedAnnualRate = (Math.pow(1 + Number(cetEstimatedMonthlyRate) / 100, 12) - 1) * 100;

    return {
      pureInstallment,
      realInstallment,
      totalPaid,
      totalInterestPaid,
      cetEstimatedMonthlyRate,
      cetEstimatedAnnualRate: cetEstimatedAnnualRate.toFixed(2)
    };
  }, [financedAmount, contractNominalRateMonth, monthsInstallments, tacAndIofFees]);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Finanças & Investimentos Brasil
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Landmark className="w-7 h-7 text-cyan-400" />
            Suíte de Cálculos Financeiros & Investimentos Brasil
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Comparador CDB vs LCI/LCA, simulador Tesouro Direto B3, corretor de inflação IPCA, salário líquido CLT 2026 e cálculo CET de financiamento.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('cdi-lci-lca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'cdi-lci-lca'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          CDB vs LCI/LCA (IR Regressivo)
        </button>

        <button
          onClick={() => setActiveTab('tesouro-direto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'tesouro-direto'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Simulador Tesouro Direto B3
        </button>

        <button
          onClick={() => setActiveTab('inflation-ipca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'inflation-ipca'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          Corretor de Inflação IPCA
        </button>

        <button
          onClick={() => setActiveTab('salario-liquido')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'salario-liquido'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Salário Líquido CLT 2026
        </button>

        <button
          onClick={() => setActiveTab('financiamento-cet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'financiamento-cet'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          Custo Efetivo Total (CET)
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: COMPARADOR CDB VS LCI/LCA */}
        {activeTab === 'cdi-lci-lca' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Taxa CDI Atual (% a.a.):</label>
                <input
                  type="number"
                  step="0.05"
                  value={cdiRateAnnual}
                  onChange={(e) => setCdiRateAnnual(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Rentabilidade CDB (% CDI):</label>
                <input
                  type="number"
                  value={cdbPercentCdi}
                  onChange={(e) => setCdbPercentCdi(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Rentabilidade LCI/LCA (% CDI):</label>
                <input
                  type="number"
                  value={lciPercentCdi}
                  onChange={(e) => setLciPercentCdi(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Prazo de Aplicação (Dias):</label>
                <input
                  type="number"
                  value={investmentDays}
                  onChange={(e) => setInvestmentDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Resultado do Comparativo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">CDB Líquido (Após IR {cdiComparison.irTaxPercent}%)</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{cdiComparison.cdbNetRate}%</span>
                <span className="text-[11px] text-slate-500 block mt-1">Bruto: {cdiComparison.cdbGrossRate}% a.a.</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">LCI / LCA Líquido (Isento de IR)</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{cdiComparison.lciNetRate}%</span>
                <span className="text-[11px] text-slate-500 block mt-1">100% Isento para Pessoa Física</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Opção Mais Vantajosa</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{cdiComparison.winner}</span>
                <span className="text-[11px] text-slate-500 block mt-1">LCI equivalente: {cdiComparison.equivalentLciPercent}% do CDI</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SIMULADOR TESOURO DIRETO B3 */}
        {activeTab === 'tesouro-direto' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Aporte Inicial (R$):</label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Aporte Mensal (R$):</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Prazo (Meses):</label>
                <input
                  type="number"
                  value={monthsTerm}
                  onChange={(e) => setMonthsTerm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Taxa Esperada (% a.a.):</label>
                <input
                  type="number"
                  step="0.25"
                  value={expectedAnnualRate}
                  onChange={(e) => setExpectedAnnualRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Métricas do Tesouro */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Total Investido</span>
                <span className="text-xl font-bold text-white font-mono">
                  R$ {treasurySimulation.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Rendimento Bruto</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">
                  +R$ {treasurySimulation.totalGrossProfit.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Imposto de Renda (IRRF)</span>
                <span className="text-xl font-bold text-red-400 font-mono">
                  -R$ {treasurySimulation.irAmount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block">Custódia B3: R$ {treasurySimulation.b3CustodyFee.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Valor Líquido a Resgatar</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  R$ {treasurySimulation.finalNetBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: CORRETOR DE INFLAÇÃO IPCA HISTÓRICA */}
        {activeTab === 'inflation-ipca' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Valor Original (R$):</label>
                <input
                  type="number"
                  value={originalValueBrl}
                  onChange={(e) => setOriginalValueBrl(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Anos Decorridos:</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={inflationYears}
                  onChange={(e) => setInflationYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">IPCA Médio Anual (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={averageAnnualIpca}
                  onChange={(e) => setAverageAnnualIpca(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Valor Atualizado (Poder de Compra)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  R$ {inflationMetrics.correctedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Inflação Acumulada no Período</span>
                <span className="text-2xl font-black text-red-400 font-mono">
                  +{inflationMetrics.accumulatedInflationPercent}%
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Perda do Poder de Compra do Real</span>
                <span className="text-2xl font-black text-purple-400 font-mono">
                  -{inflationMetrics.purchasingPowerLossPercent}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: SALÁRIO LÍQUIDO CLT 2026 */}
        {activeTab === 'salario-liquido' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Salário Bruto (R$):</label>
                <input
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Dependentes:</label>
                <input
                  type="number"
                  min={0}
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Outros Descontos (VT / Plano):</label>
                <input
                  type="number"
                  value={otherDiscounts}
                  onChange={(e) => setOtherDiscounts(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Demonstrativo de Pagamento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Desconto INSS 2026</span>
                <span className="text-xl font-bold text-red-400 font-mono">
                  -R$ {salaryCalculation.inss.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">Faixas Progressivas</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Desconto IRRF</span>
                <span className="text-xl font-bold text-red-400 font-mono">
                  -R$ {salaryCalculation.irrf.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">Tabela RFB</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Total de Descontos</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  -R$ {salaryCalculation.totalDiscounts.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">{salaryCalculation.effectiveDiscountPercent}% do bruto</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Salário Líquido na Conta</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  R$ {salaryCalculation.netSalary.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-500 block">Valor a receber</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: CALCULADORA DE CET DE FINANCIAMENTO */}
        {activeTab === 'financiamento-cet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Valor do Bem Financiado (R$):</label>
                <input
                  type="number"
                  value={financedAmount}
                  onChange={(e) => setFinancedAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Juros do Contrato (% a.m.):</label>
                <input
                  type="number"
                  step="0.05"
                  value={contractNominalRateMonth}
                  onChange={(e) => setContractNominalRateMonth(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Parcelas (Meses):</label>
                <input
                  type="number"
                  value={monthsInstallments}
                  onChange={(e) => setMonthsInstallments(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Tarifas Embutidas (IOF/TAC R$):</label>
                <input
                  type="number"
                  value={tacAndIofFees}
                  onChange={(e) => setTacAndIofFees(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Valor da Parcela Mensal (com Tarifas)</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  R$ {financingCetMetrics.realInstallment.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Parcela pura sem taxas: R$ {financingCetMetrics.pureInstallment.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Custo Efetivo Total Real (CET)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {financingCetMetrics.cetEstimatedMonthlyRate}% a.m.
                </span>
                <span className="text-[11px] text-amber-500 block mt-1">{financingCetMetrics.cetEstimatedAnnualRate}% ao ano</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Total Pago ao Final</span>
                <span className="text-2xl font-black text-red-400 font-mono">
                  R$ {financingCetMetrics.totalPaid.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Juros + Taxas: +R$ {financingCetMetrics.totalInterestPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
