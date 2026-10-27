'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Calculator, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  FileSpreadsheet, 
  ArrowRight, 
  DollarSign, 
  Percent, 
  Copy, 
  Check, 
  Scale, 
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TaxAndFiscalSuiteProps {
  defaultTab?: 'das-mei' | 'irrf-carne-leao' | 'difal-icms' | 'simples-fator-r' | 'lucro-presumido';
}

export function TaxAndFiscalSuite({ defaultTab = 'das-mei' }: TaxAndFiscalSuiteProps) {
  const [activeTab, setActiveTab] = useState<'das-mei' | 'irrf-carne-leao' | 'difal-icms' | 'simples-fator-r' | 'lucro-presumido'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // =========================================================================
  // ABA 1: CALCULADORA DAS-MEI 2026 & MONITOR DE LIMITE
  // =========================================================================
  const [minSalary, setMinSalary] = useState<number>(1502.00); // Salário Mínimo 2026 projetado
  const [meiCategory, setMeiCategory] = useState<'commerce' | 'services' | 'mixed' | 'truck'>('services');
  const [accumulatedRevenue, setAccumulatedRevenue] = useState<number>(54000.00);
  const [monthsActive, setMonthsActive] = useState<number>(12);

  // Cálculos do DAS
  const inssRate = meiCategory === 'truck' ? 0.12 : 0.05;
  const inssValue = minSalary * inssRate;
  const icmsValue = (meiCategory === 'commerce' || meiCategory === 'mixed' || meiCategory === 'truck') ? 1.00 : 0.00;
  const issValue = (meiCategory === 'services' || meiCategory === 'mixed') ? 5.00 : 0.00;
  const totalDas = inssValue + icmsValue + issValue;

  // Limite Anual Proporcional
  const annualMaxLimit = meiCategory === 'truck' ? 251600.00 : 81000.00;
  const proportionalLimit = (annualMaxLimit / 12) * monthsActive;
  const monthlyAverageLimit = annualMaxLimit / 12;
  const usagePercentage = proportionalLimit > 0 ? (accumulatedRevenue / proportionalLimit) * 100 : 0;
  const remainingAllowance = proportionalLimit - accumulatedRevenue;

  // =========================================================================
  // ABA 2: IRRF & CARNÊ-LEÃO RECEITA FEDERAL 2026
  // =========================================================================
  const [grossIncome, setGrossIncome] = useState<number>(6500.00);
  const [inssDeduction, setInssDeduction] = useState<number>(750.00);
  const [dependentsCount, setDependentsCount] = useState<number>(1);
  const [alimonyDeduction, setAlimonyDeduction] = useState<number>(0.00);
  const [otherDeductions, setOtherDeductions] = useState<number>(0.00); // Livro-Caixa no Carnê-Leão

  const DEDUCTION_PER_DEPENDENT = 189.59;
  const totalLegalDeductions = inssDeduction + (dependentsCount * DEDUCTION_PER_DEPENDENT) + alimonyDeduction + otherDeductions;
  const taxBaseLegal = Math.max(0, grossIncome - totalLegalDeductions);

  // Cálculo Tabela Progressiva Mensal Oficial RFB
  let irrfTaxRate = 0;
  let irrfDeductionParcel = 0;
  let taxBracketName = 'Faixa 1 (Isento)';

  if (taxBaseLegal <= 2259.20) {
    irrfTaxRate = 0;
    irrfDeductionParcel = 0;
    taxBracketName = 'Faixa 1 - Isento';
  } else if (taxBaseLegal <= 2826.65) {
    irrfTaxRate = 0.075;
    irrfDeductionParcel = 169.44;
    taxBracketName = 'Faixa 2 (7,5%)';
  } else if (taxBaseLegal <= 3751.05) {
    irrfTaxRate = 0.15;
    irrfDeductionParcel = 381.44;
    taxBracketName = 'Faixa 3 (15,0%)';
  } else if (taxBaseLegal <= 4664.68) {
    irrfTaxRate = 0.225;
    irrfDeductionParcel = 662.77;
    taxBracketName = 'Faixa 4 (22,5%)';
  } else {
    irrfTaxRate = 0.275;
    irrfDeductionParcel = 896.00;
    taxBracketName = 'Faixa 5 (27,5%)';
  }

  const rawTaxDue = (taxBaseLegal * irrfTaxRate) - irrfDeductionParcel;
  const netIrrfDue = Math.max(0, rawTaxDue);
  const effectiveIrrfRate = grossIncome > 0 ? (netIrrfDue / grossIncome) * 100 : 0;

  // =========================================================================
  // ABA 3: DIFAL ICMS INTERESTADUAL (EC 87/2015 & LC 190/2022)
  // =========================================================================
  const [productOperationValue, setProductOperationValue] = useState<number>(1000.00);
  const [shippingAndExpenses, setShippingAndExpenses] = useState<number>(80.00);
  const [interstateRate, setInterstateRate] = useState<number>(7.00); // 7% ou 12% ou 4% importado
  const [destinationInternalRate, setDestinationInternalRate] = useState<number>(18.00);
  const [fcpRate, setFcpRate] = useState<number>(2.00); // Fundo Combate à Pobreza (0%, 1%, 2%)

  const totalOperationBase = productOperationValue + shippingAndExpenses;
  const difalPercentage = Math.max(0, destinationInternalRate - interstateRate);
  const difalValue = (totalOperationBase * difalPercentage) / 100;
  const fcpValue = (totalOperationBase * fcpRate) / 100;
  const totalTaxDueDestination = difalValue + fcpValue;
  const originIcmsValue = (totalOperationBase * interstateRate) / 100;

  // =========================================================================
  // ABA 4: SIMPLES NACIONAL & FATOR R (ANEXO III VS V)
  // =========================================================================
  const [rbt12, setRbt12] = useState<number>(180000.00); // Receita Bruta dos últimos 12 meses
  const [payroll12, setPayroll12] = useState<number>(55000.00); // Folha de salários + Pró-labore + encargos dos últimos 12 meses
  const [currentMonthlyRevenue, setCurrentMonthlyRevenue] = useState<number>(20000.00);

  const factorR = rbt12 > 0 ? (payroll12 / rbt12) * 100 : 0;
  const isAnexoIII = factorR >= 28.0;

  // Estimativa de alíquota inicial: Anexo III ~6%, Anexo V ~15.5%
  const estimatedRateAnexoIII = 6.0;
  const estimatedRateAnexoV = 15.5;
  const appliedRate = isAnexoIII ? estimatedRateAnexoIII : estimatedRateAnexoV;
  const estimatedMonthlySimplesTax = (currentMonthlyRevenue * appliedRate) / 100;
  const estimatedSavings = ((currentMonthlyRevenue * estimatedRateAnexoV) / 100) - ((currentMonthlyRevenue * estimatedRateAnexoIII) / 100);

  // Folha mínima necessária para atingir 28%
  const targetPayrollFor28 = rbt12 * 0.28;
  const payrollShortfall = Math.max(0, targetPayrollFor28 - payroll12);

  // =========================================================================
  // ABA 5: SIMULADOR LUCRO PRESUMIDO
  // =========================================================================
  const [quarterlyRevenue, setQuarterlyRevenue] = useState<number>(120000.00); // Faturamento Trimestral
  const [businessActivity, setBusinessActivity] = useState<'services' | 'commerce'>('services');
  const [issCityRate, setIssCityRate] = useState<number>(5.00); // ISS municipal 2% a 5%

  const irpjPresumptionRate = businessActivity === 'services' ? 0.32 : 0.08;
  const csllPresumptionRate = businessActivity === 'services' ? 0.32 : 0.12;

  const irpjBase = quarterlyRevenue * irpjPresumptionRate;
  const csllBase = quarterlyRevenue * csllPresumptionRate;

  // IRPJ: 15% + 10% sobre o que exceder 60k no trimestre
  const irpjNormal = irpjBase * 0.15;
  const irpjAdditional = Math.max(0, irpjBase - 60000.00) * 0.10;
  const totalIrpj = irpjNormal + irpjAdditional;

  // CSLL: 9% sobre a base
  const totalCsll = csllBase * 0.09;

  // PIS (0.65%) e COFINS (3.00%) Cumulativos
  const totalPis = quarterlyRevenue * 0.0065;
  const totalCofins = quarterlyRevenue * 0.0300;

  // ISS Municipal ou ICMS Estimado
  const totalMunicipalIss = (quarterlyRevenue * issCityRate) / 100;

  const totalQuarterlyTaxes = totalIrpj + totalCsll + totalPis + totalCofins + totalMunicipalIss;
  const globalEffectiveRate = quarterlyRevenue > 0 ? (totalQuarterlyTaxes / quarterlyRevenue) * 100 : 0;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Receipt className="w-4 h-4" />
            <span>Capitania #11 · Suíte de Tributos, Cálculos Fiscais & MEI Brasil</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Inteligência Fiscal & Tributária Soberana
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Legislação RFB 2026
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulador de DAS-MEI com teto proporcional, Carnê-Leão e IRRF pela tabela progressiva, DIFAL ICMS interestadual, Fator R do Simples Nacional e Lucro Presumido.
          </p>
        </div>

        {/* Status / Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          <span>EC 87/15 · LC 123/06</span>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('das-mei')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'das-mei'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>DAS-MEI 2026 & Limite</span>
        </button>

        <button
          onClick={() => setActiveTab('irrf-carne-leao')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'irrf-carne-leao'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>IRRF & Carnê-Leão RFB</span>
        </button>

        <button
          onClick={() => setActiveTab('difal-icms')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'difal-icms'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>DIFAL ICMS Interestadual</span>
        </button>

        <button
          onClick={() => setActiveTab('simples-fator-r')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'simples-fator-r'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Fator R Simples Nacional</span>
        </button>

        <button
          onClick={() => setActiveTab('lucro-presumido')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'lucro-presumido'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Simulador Lucro Presumido</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pt-6">
        {/* =================================================================== */}
        {/* ABA 1: DAS-MEI 2026 & LIMITE */}
        {/* =================================================================== */}
        {activeTab === 'das-mei' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Painel de Configuração */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Configurações do MEI:
                </span>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Categoria de Atividade:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMeiCategory('commerce')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                        meiCategory === 'commerce' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Comércio / Indústria</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">INSS 5% + ICMS R$ 1,00</div>
                    </button>

                    <button
                      onClick={() => setMeiCategory('services')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                        meiCategory === 'services' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Prestador de Serviços</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">INSS 5% + ISS R$ 5,00</div>
                    </button>

                    <button
                      onClick={() => setMeiCategory('mixed')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                        meiCategory === 'mixed' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Comércio & Serviços</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">INSS + ICMS + ISS</div>
                    </button>

                    <button
                      onClick={() => setMeiCategory('truck')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                        meiCategory === 'truck' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>MEI Caminhoneiro</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">INSS 12% + Limite 251k</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Salário Mínimo Base (R$):</label>
                    <input
                      type="number"
                      step="1"
                      value={minSalary}
                      onChange={(e) => setMinSalary(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Meses Ativos no Ano (1-12):</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={monthsActive}
                      onChange={(e) => setMonthsActive(parseInt(e.target.value) || 12)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Faturamento Bruto Acumulado no Ano (R$):</label>
                  <input
                    type="number"
                    step="500"
                    value={accumulatedRevenue}
                    onChange={(e) => setAccumulatedRevenue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Painel de Resultados DAS & Limite */}
              <div className="space-y-4">
                {/* Cartão de Valor do DAS */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Guia Mensal DAS-MEI Oficial:</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                      Vencimento dia 20
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {formatCurrency(totalDas)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">INSS Previdência:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(inssValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ICMS Estadual:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(icmsValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ISS Municipal:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(issValue)}</span>
                    </div>
                  </div>
                </div>

                {/* Termômetro de Limite Anual Proporcional */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Teto Proporcional ({monthsActive} meses):</span>
                    <span className="text-white font-bold">{formatCurrency(proportionalLimit)}</span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        usagePercentage > 120 
                          ? 'bg-rose-500' 
                          : usagePercentage > 100 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, usagePercentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Utilizado: {usagePercentage.toFixed(1)}%</span>
                    <span className={`font-bold ${remainingAllowance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {remainingAllowance >= 0 ? `Saldo livre: ${formatCurrency(remainingAllowance)}` : `Excedido em: ${formatCurrency(Math.abs(remainingAllowance))}`}
                    </span>
                  </div>

                  {/* Alerta de Desenquadramento */}
                  {usagePercentage > 120 ? (
                    <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Atenção: Limite excedido em mais de 20%!</strong> Desenquadramento retroativo ao início do ano com cobrança de impostos pelo Simples Nacional como Microempresa (ME).
                      </span>
                    </div>
                  ) : usagePercentage > 100 ? (
                    <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-[11px] text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Aviso: Faturamento excedeu até 20%.</strong> O desenquadramento ocorrerá a partir de 1º de janeiro do ano seguinte com pagamento de DAS complementar sobre o excesso.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Situação Regular. Faturamento dentro da margem permitida do MEI.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: IRRF & CARNÊ-LEÃO */}
        {/* =================================================================== */}
        {activeTab === 'irrf-carne-leao' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Rendimentos & Deduções Mensais:
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Rendimento Bruto Mensal (R$):</label>
                  <input
                    type="number"
                    step="100"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">INSS Recolhido (R$):</label>
                    <input
                      type="number"
                      step="10"
                      value={inssDeduction}
                      onChange={(e) => setInssDeduction(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Número de Dependentes:</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={dependentsCount}
                      onChange={(e) => setDependentsCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Pensão Alimentícia (R$):</label>
                    <input
                      type="number"
                      step="50"
                      value={alimonyDeduction}
                      onChange={(e) => setAlimonyDeduction(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Livro-Caixa / Outros (R$):</label>
                    <input
                      type="number"
                      step="50"
                      value={otherDeductions}
                      onChange={(e) => setOtherDeductions(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Demonstrativo do Imposto Devido */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Imposto de Renda Mensal Devido:</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 text-[10px] font-mono border border-slate-800">
                      {taxBracketName}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {formatCurrency(netIrrfDue)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Base de Cálculo Líquida:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(taxBaseLegal)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Alíquota Efetiva Real:</span>
                      <span className="text-cyan-400 font-bold">{effectiveIrrfRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono text-slate-400">
                  <span className="text-slate-300 font-bold block mb-1">Tabela Progressiva RFB (Mensal):</span>
                  <div className="flex justify-between py-1 border-b border-slate-900 text-[11px]">
                    <span>Até R$ 2.259,20:</span>
                    <span className="text-emerald-400 font-bold">Isento (0%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900 text-[11px]">
                    <span>De R$ 2.259,21 até R$ 2.826,65:</span>
                    <span>7,5% (Deduz R$ 169,44)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900 text-[11px]">
                    <span>De R$ 2.826,66 até R$ 3.751,05:</span>
                    <span>15,0% (Deduz R$ 381,44)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900 text-[11px]">
                    <span>De R$ 3.751,06 até R$ 4.664,68:</span>
                    <span>22,5% (Deduz R$ 662,77)</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px]">
                    <span>Acima de R$ 4.664,68:</span>
                    <span>27,5% (Deduz R$ 896,00)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: DIFAL ICMS INTERESTADUAL */}
        {/* =================================================================== */}
        {activeTab === 'difal-icms' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Dados da Operação Interestadual:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Valor dos Produtos (R$):</label>
                    <input
                      type="number"
                      step="50"
                      value={productOperationValue}
                      onChange={(e) => setProductOperationValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Frete / Despesas (R$):</label>
                    <input
                      type="number"
                      step="10"
                      value={shippingAndExpenses}
                      onChange={(e) => setShippingAndExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Alíquota Interestadual (Origem):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setInterstateRate(7)}
                      className={`p-2 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                        interstateRate === 7 ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      7% (Sul/SE p/ N/NE/CO)
                    </button>
                    <button
                      onClick={() => setInterstateRate(12)}
                      className={`p-2 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                        interstateRate === 12 ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      12% (Demais Rotas)
                    </button>
                    <button
                      onClick={() => setInterstateRate(4)}
                      className={`p-2 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                        interstateRate === 4 ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      4% (Importados)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Alíquota Interna Destino (%):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={destinationInternalRate}
                      onChange={(e) => setDestinationInternalRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Fundo Combate Pobreza FCP (%):</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="4"
                      value={fcpRate}
                      onChange={(e) => setFcpRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Resultado do DIFAL */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Total a Recolher ao Estado de Destino:</span>
                    <span className="text-cyan-400 font-mono font-bold">DIFAL {difalPercentage.toFixed(1)}% + FCP</span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {formatCurrency(totalTaxDueDestination)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">DIFAL Líquido:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(difalValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">FCP Destino:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(fcpValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ICMS Origem:</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(originIcmsValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 leading-relaxed">
                  <span className="text-slate-200 font-bold block mb-1">Normativa Legal (EC 87/2015 & LC 190/2022):</span>
                  Nas vendas a não contribuintes de outro estado, o DIFAL é 100% recolhido em favor da Unidade Federativa de destino da mercadoria através de GNRE ou guia estadual.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: FATOR R SIMPLES NACIONAL */}
        {/* =================================================================== */}
        {activeTab === 'simples-fator-r' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Dados dos Últimos 12 Meses:
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Receita Bruta Acumulada 12 Meses (RBT12):</label>
                  <input
                    type="number"
                    step="5000"
                    value={rbt12}
                    onChange={(e) => setRbt12(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Folha de Salários 12 Meses (com Pró-labore/FGTS):</label>
                  <input
                    type="number"
                    step="2000"
                    value={payroll12}
                    onChange={(e) => setPayroll12(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Faturamento Estimado do Mês Atual (R$):</label>
                  <input
                    type="number"
                    step="1000"
                    value={currentMonthlyRevenue}
                    onChange={(e) => setCurrentMonthlyRevenue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Resultado do Fator R */}
              <div className="space-y-4">
                <div className={`p-5 rounded-2xl bg-slate-950 border space-y-3 ${isAnexoIII ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Enquadramento Tributário:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isAnexoIII ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                      {isAnexoIII ? 'Tributado no ANEXO III (Econômico)' : 'Tributado no ANEXO V (Onoroso)'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-black font-mono text-white">
                      {factorR.toFixed(2)}%
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      (Meta legal: mínimo 28,00%)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Alíquota Inicial Aplicada:</span>
                      <span className={`font-bold ${isAnexoIII ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {appliedRate.toFixed(1)}% ({isAnexoIII ? 'Anexo III' : 'Anexo V'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Imposto Simples Estimado:</span>
                      <span className="text-white font-bold">{formatCurrency(estimatedMonthlySimplesTax)}</span>
                    </div>
                  </div>
                </div>

                {!isAnexoIII && payrollShortfall > 0 && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-300 space-y-1">
                    <span className="font-bold block">💡 Dica de Planejamento Tributário:</span>
                    <span>
                      Aumentando a folha/pró-labore acumulado em <strong>{formatCurrency(payrollShortfall)}</strong>, sua empresa atinge 28% e passa a recolher pelo Anexo III, economizando cerca de <strong>{formatCurrency(estimatedSavings)}/mês</strong> em impostos!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: LUCRO PRESUMIDO */}
        {/* =================================================================== */}
        {activeTab === 'lucro-presumido' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Parâmetros do Trimestre:
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Faturamento Bruto Trimestral (R$):</label>
                  <input
                    type="number"
                    step="5000"
                    value={quarterlyRevenue}
                    onChange={(e) => setQuarterlyRevenue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Ramo de Atividade:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBusinessActivity('services')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                        businessActivity === 'services' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Serviços em Geral</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Presunção 32% IRPJ/CSLL</div>
                    </button>

                    <button
                      onClick={() => setBusinessActivity('commerce')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                        businessActivity === 'commerce' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Comércio / Indústria</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Presunção 8% IRPJ / 12% CSLL</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Alíquota ISS Municipal (%):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="5"
                    value={issCityRate}
                    onChange={(e) => setIssCityRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Demonstrativo Tributário Consolidado */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Carga Tributária Total no Trimestre:</span>
                    <span className="text-cyan-400 font-mono font-bold">{globalEffectiveRate.toFixed(2)}% Efetiva</span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {formatCurrency(totalQuarterlyTaxes)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">IRPJ (15% + Adicional):</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(totalIrpj)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">CSLL (9% sobre base):</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(totalCsll)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PIS (0,65%) + COFINS (3%):</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(totalPis + totalCofins)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ISS Municipal ({issCityRate}%):</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(totalMunicipalIss)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
