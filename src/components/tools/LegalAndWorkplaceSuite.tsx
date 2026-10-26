'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Stethoscope, 
  ShoppingCart, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Sparkles, 
  Printer, 
  RotateCcw, 
  Calculator, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';

export type LegalWorkplaceTab = 'sus-cns' | 'clt-rescission' | 'ecommerce-markup' | 'simple-contract';

export function LegalAndWorkplaceSuite({ defaultTab = 'sus-cns' }: { defaultTab?: LegalWorkplaceTab }) {
  const [activeTab, setActiveTab] = useState<LegalWorkplaceTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: GERADOR & VALIDADOR CARTÃO SUS (CNS)
  // ==========================================
  const [susInput, setSusInput] = useState<string>('');
  const [susResult, setSusResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [generatedSus, setGeneratedSus] = useState<string>('');

  // Algoritmo oficial de validação de CNS (Ministério da Saúde)
  const validateCns = (cns: string) => {
    const clean = cns.replace(/\D/g, '');
    if (clean.length !== 15) {
      return { isValid: false, message: 'O CNS deve conter exatamente 15 dígitos numéricos.' };
    }

    const firstDigit = clean[0];

    // Caso 1: Iniciados em 1 ou 2
    if (firstDigit === '1' || firstDigit === '2') {
      let soma = 0;
      for (let i = 0; i < 11; i++) {
        soma += parseInt(clean[i], 10) * (15 - i);
      }
      let resto = soma % 11;
      let dv = 11 - resto;
      if (dv === 11) dv = 0;

      let esperado = clean.substring(0, 11);
      if (dv === 10) {
        soma += 2;
        resto = soma % 11;
        dv = 11 - resto;
        esperado += '001' + String(dv);
      } else {
        esperado += '000' + String(dv);
      }

      if (clean === esperado) {
        return { isValid: true, message: 'Cartão SUS Válido (Iniciado em 1 ou 2 - Padrão Definitivo)' };
      }
      return { isValid: false, message: 'Dígito verificador do Cartão SUS incorreto.' };
    }

    // Caso 2: Iniciados em 7, 8 ou 9
    if (['7', '8', '9'].includes(firstDigit)) {
      let soma = 0;
      for (let i = 0; i < 15; i++) {
        soma += parseInt(clean[i], 10) * (15 - i);
      }
      if (soma % 11 === 0) {
        return { isValid: true, message: 'Cartão SUS Válido (Iniciado em 7/8/9 - Padrão Provisório)' };
      }
      return { isValid: false, message: 'Soma ponderada do Cartão SUS inválida.' };
    }

    return { isValid: false, message: 'O Cartão SUS deve iniciar em 1, 2, 7, 8 ou 9.' };
  };

  const generateCns = (type: 'definitivo' | 'provisorio') => {
    if (type === 'definitivo') {
      const start = Math.random() > 0.5 ? '1' : '2';
      let base = start;
      for (let i = 0; i < 10; i++) {
        base += Math.floor(Math.random() * 10).toString();
      }
      let soma = 0;
      for (let i = 0; i < 11; i++) {
        soma += parseInt(base[i], 10) * (15 - i);
      }
      let resto = soma % 11;
      let dv = 11 - resto;
      if (dv === 11) dv = 0;

      let cns = base;
      if (dv === 10) {
        soma += 2;
        resto = soma % 11;
        dv = 11 - resto;
        cns += '001' + String(dv);
      } else {
        cns += '000' + String(dv);
      }
      const formatted = `${cns.slice(0, 3)} ${cns.slice(3, 7)} ${cns.slice(7, 11)} ${cns.slice(11, 15)}`;
      setGeneratedSus(formatted);
      setSusInput(cns);
    } else {
      const starts = ['7', '8', '9'];
      const start = starts[Math.floor(Math.random() * starts.length)];
      let base = start;
      for (let i = 0; i < 14; i++) {
        base += Math.floor(Math.random() * 10).toString();
      }
      let soma = 0;
      for (let i = 0; i < 14; i++) {
        soma += parseInt(base[i], 10) * (15 - i);
      }
      let resto = soma % 11;
      let dv = 11 - resto;
      if (dv === 11) dv = 0;
      if (dv === 10) dv = 0;
      const cns = base.slice(0, 14) + String(dv);
      const formatted = `${cns.slice(0, 3)} ${cns.slice(3, 7)} ${cns.slice(7, 11)} ${cns.slice(11, 15)}`;
      setGeneratedSus(formatted);
      setSusInput(cns);
    }
  };

  useEffect(() => {
    if (susInput.replace(/\D/g, '').length === 15) {
      setSusResult(validateCns(susInput));
    } else if (susInput.trim().length > 0) {
      setSusResult({ isValid: false, message: 'Digite os 15 dígitos do Cartão SUS.' });
    } else {
      setSusResult(null);
    }
  }, [susInput]);

  // ==========================================
  // TAB 2: SIMULADOR DE RESCISÃO TRABALHISTA CLT
  // ==========================================
  const [salarioBruto, setSalarioBruto] = useState<number>(3500);
  const [mesesTrabalhados, setMesesTrabalhados] = useState<number>(14);
  const [tipoDemissao, setTipoDemissao] = useState<'sem_justa_causa' | 'pedido_demissao' | 'com_justa_causa' | 'acordo_mutuo'>('sem_justa_causa');
  const [avisoPrevio, setAvisoPrevio] = useState<'indenizado' | 'trabalhado' | 'dispensado'>('indenizado');
  const [saldoFgts, setSaldoFgts] = useState<number>(4200);

  const calculateRescission = () => {
    const valorDia = salarioBruto / 30;
    const saldoSalario = valorDia * 30; // 1 mês cheio base
    const mesesAnoAtual = (mesesTrabalhados % 12) || 12;

    const decimoTerceiro = (salarioBruto / 12) * mesesAnoAtual;
    const feriasProporcionais = (salarioBruto / 12) * mesesAnoAtual;
    const tercoFerias = feriasProporcionais / 3;

    // Aviso Prévio Indenizado (Lei 12.506/2011: 30 dias + 3 dias por ano completo)
    const anosCompletos = Math.floor(mesesTrabalhados / 12);
    const diasAviso = Math.min(90, 30 + anosCompletos * 3);
    const valorAvisoPrevio = avisoPrevio === 'indenizado' ? (salarioBruto / 30) * diasAviso : 0;

    let totalBruto = 0;
    let multaFgts = 0;

    if (tipoDemissao === 'sem_justa_causa') {
      totalBruto = saldoSalario + decimoTerceiro + feriasProporcionais + tercoFerias + valorAvisoPrevio;
      multaFgts = saldoFgts * 0.4;
    } else if (tipoDemissao === 'pedido_demissao') {
      totalBruto = saldoSalario + decimoTerceiro + feriasProporcionais + tercoFerias;
      multaFgts = 0;
    } else if (tipoDemissao === 'com_justa_causa') {
      totalBruto = saldoSalario; // Apenas saldo de salário
      multaFgts = 0;
    } else if (tipoDemissao === 'acordo_mutuo') {
      totalBruto = saldoSalario + decimoTerceiro + feriasProporcionais + tercoFerias + (valorAvisoPrevio / 2);
      multaFgts = saldoFgts * 0.2;
    }

    return {
      saldoSalario,
      decimoTerceiro,
      feriasProporcionais,
      tercoFerias,
      valorAvisoPrevio,
      multaFgts,
      totalGeral: totalBruto + multaFgts
    };
  };

  const rescissionResult = calculateRescission();

  // ==========================================
  // TAB 3: CALCULADORA DE MARGEM & MARKUP E-COMMERCE
  // ==========================================
  const [custoProduto, setCustoProduto] = useState<number>(45);
  const [taxaMarketplacePercent, setTaxaMarketplacePercent] = useState<number>(18); // Shopee / ML
  const [taxaFixaMarketplace, setTaxaFixaMarketplace] = useState<number>(4); // Ex: R$ 4 por item
  const [custoEmbalagemFrete, setCustoEmbalagemFrete] = useState<number>(5);
  const [impostoPercent, setImpostoPercent] = useState<number>(6); // Simples Nacional
  const [margemLucroDesejada, setMargemLucroDesejada] = useState<number>(25); // 25% margem líquida

  const calculateEcommercePrice = () => {
    // Preço Venda = (Custo Total + Taxa Fixa) / (1 - (Taxa Mkt + Imposto + Margem Desejada)/100)
    const taxasPercentuais = (taxaMarketplacePercent + impostoPercent + margemLucroDesejada) / 100;
    if (taxasPercentuais >= 1) return null;

    const custoBase = custoProduto + custoEmbalagemFrete + taxaFixaMarketplace;
    const precoVendaIdeal = custoBase / (1 - taxasPercentuais);

    const valorComissao = (precoVendaIdeal * taxaMarketplacePercent) / 100 + taxaFixaMarketplace;
    const valorImposto = (precoVendaIdeal * impostoPercent) / 100;
    const lucroLiquidoReal = precoVendaIdeal - custoProduto - custoEmbalagemFrete - valorComissao - valorImposto;
    const markupMultiplicador = precoVendaIdeal / (custoProduto || 1);

    return {
      precoVendaIdeal,
      valorComissao,
      valorImposto,
      lucroLiquidoReal,
      markupMultiplicador
    };
  };

  const ecomResult = calculateEcommercePrice();

  // ==========================================
  // TAB 4: EMISSOR DE CONTRATO SIMPLES PARA IMPRESSÃO
  // ==========================================
  const [contratante, setContratante] = useState('Vinícius Miranda de Araújo');
  const [cpfContratante, setCpfContratante] = useState('123.456.789-00');
  const [contratado, setContratado] = useState('Holding V5 Apollo Serviços Digitais');
  const [cnpjContratado, setCnpjContratado] = useState('12.345.678/0001-90');
  const [objetoServico, setObjetoServico] = useState('Desenvolvimento e hospedagem de plataforma de IA generativa com suporte a workflows ComfyUI.');
  const [valorContrato, setValorContrato] = useState('5.000,00');
  const [prazoDias, setPrazoDias] = useState('30');
  const [cidadeContrato, setCidadeContrato] = useState('Goiânia - GO');

  const printContract = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Suíte Trabalhista, Saúde Pública & E-commerce
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Cartão SUS, Rescisão CLT, Markup E-commerce & Contratos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cálculos trabalhistas, regras de faturamento de marketplace e validação oficial do Ministério da Saúde.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('sus-cns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sus-cns'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Cartão SUS (CNS)</span>
          </button>

          <button
            onClick={() => setActiveTab('clt-rescission')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clt-rescission'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Rescisão CLT</span>
          </button>

          <button
            onClick={() => setActiveTab('ecommerce-markup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ecommerce-markup'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Markup E-commerce</span>
          </button>

          <button
            onClick={() => setActiveTab('simple-contract')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simple-contract'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Contrato A4</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6 relative z-10">
        {/* ========================================================= */}
        {/* TAB 1: CARTÃO SUS (CNS)                                   */}
        {/* ========================================================= */}
        {activeTab === 'sus-cns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Validador */}
            <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold block flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" /> Validador Oficial de Cartão SUS (CNS)
              </span>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Digite o CNS (15 dígitos):</label>
                <input
                  type="text"
                  maxLength={19}
                  value={susInput}
                  onChange={(e) => setSusInput(e.target.value)}
                  placeholder="Ex: 123 4567 8901 2345"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {susResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    susResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {susResult.isValid ? (
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{susResult.message}</span>
                </div>
              )}

              <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                Valida a regra oficial de Módulo 11 para cartões definitivos (iniciados em 1 ou 2) e provisórios (iniciados em 7, 8 ou 9).
              </p>
            </div>

            {/* Gerador */}
            <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Gerador de Cartão SUS para Testes de Software (QA)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => generateCns('definitivo')}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition shadow-lg shadow-cyan-500/20"
                >
                  Gerar Definitivo (1/2)
                </button>
                <button
                  onClick={() => generateCns('provisorio')}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition"
                >
                  Gerar Provisório (7/8/9)
                </button>
              </div>

              {generatedSus && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-base font-mono font-black text-cyan-400 tracking-wider">
                    {generatedSus}
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedSus.replace(/\s/g, ''), 'sus-gen')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 text-xs font-mono flex items-center gap-1 transition"
                  >
                    {copiedKey === 'sus-gen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RESCISÃO TRABALHISTA CLT                           */}
        {/* ========================================================= */}
        {activeTab === 'clt-rescission' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Parâmetros */}
            <div className="lg:col-span-5 space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold block">Dados da Contratação CLT:</span>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Último Salário Bruto (R$):</label>
                <input
                  type="number"
                  value={salarioBruto}
                  onChange={(e) => setSalarioBruto(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Meses Trabalhados na Empresa:</label>
                <input
                  type="number"
                  value={mesesTrabalhados}
                  onChange={(e) => setMesesTrabalhados(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Motivo do Desligamento:</label>
                <select
                  value={tipoDemissao}
                  onChange={(e: any) => setTipoDemissao(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="sem_justa_causa">Demissão Sem Justa Causa (Padrão)</option>
                  <option value="pedido_demissao">Pedido de Demissão pelo Empregado</option>
                  <option value="com_justa_causa">Demissão Com Justa Causa</option>
                  <option value="acordo_mutuo">Demissão por Acordo Mútuo (Reforma CLT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Saldo Total do FGTS (R$):</label>
                <input
                  type="number"
                  value={saldoFgts}
                  onChange={(e) => setSaldoFgts(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Resultado do Cálculo */}
            <div className="lg:col-span-7 space-y-3 p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 font-bold block mb-3">Estimativa de Verbas Rescisórias:</span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Saldo de Salário (30 dias):</span>
                    <span className="text-slate-200">R$ {rescissionResult.saldoSalario.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">13º Salário Proporcional:</span>
                    <span className="text-slate-200">R$ {rescissionResult.decimoTerceiro.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Férias Proporcionais + 1/3 Constitucional:</span>
                    <span className="text-slate-200">R$ {(rescissionResult.feriasProporcionais + rescissionResult.tercoFerias).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Aviso Prévio Indenizado:</span>
                    <span className="text-slate-200">R$ {rescissionResult.valorAvisoPrevio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Multa Rescisória FGTS:</span>
                    <span className="text-emerald-400 font-bold">R$ {rescissionResult.multaFgts.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Líquido Estimado a Receber:</span>
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    R$ {rescissionResult.totalGeral.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(rescissionResult.totalGeral.toFixed(2), 'rescisao')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition"
                >
                  {copiedKey === 'rescisao' ? 'Copiado!' : 'Copiar Valor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MARKUP & MARGEM E-COMMERCE                         */}
        {/* ========================================================= */}
        {activeTab === 'ecommerce-markup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold block">Custos & Taxas do Marketplace:</span>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Custo do Produto Fornecedor (R$):</label>
                <input
                  type="number"
                  value={custoProduto}
                  onChange={(e) => setCustoProduto(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Comissão (%) [Shopee/ML]:</label>
                  <input
                    type="number"
                    value={taxaMarketplacePercent}
                    onChange={(e) => setTaxaMarketplacePercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Taxa Fixa (R$/item):</label>
                  <input
                    type="number"
                    value={taxaFixaMarketplace}
                    onChange={(e) => setTaxaFixaMarketplace(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Embalagem + Envio (R$):</label>
                  <input
                    type="number"
                    value={custoEmbalagemFrete}
                    onChange={(e) => setCustoEmbalagemFrete(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Margem Líquida (%):</label>
                  <input
                    type="number"
                    value={margemLucroDesejada}
                    onChange={(e) => setMargemLucroDesejada(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Resultado da Precificação */}
            <div className="lg:col-span-7 p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              {ecomResult ? (
                <>
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-slate-400 font-bold block">Preço de Venda Sugerido:</span>
                    <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/30">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Preço de Anúncio Recomendado:</span>
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        R$ {ecomResult.precoVendaIdeal.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono text-slate-400 ml-2">
                        (Markup {ecomResult.markupMultiplicador.toFixed(2)}x)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Comissão Marketplace Total:</span>
                        <span className="text-rose-400 font-bold">R$ {ecomResult.valorComissao.toFixed(2)}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Lucro Líquido no Bolso:</span>
                        <span className="text-cyan-400 font-bold">R$ {ecomResult.lucroLiquidoReal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-slate-500">
                    💡 Evite prejuízos em campanhas Shopee e Mercado Livre precificando já com as comissões descontadas.
                  </p>
                </>
              ) : (
                <div className="text-xs font-mono text-rose-400">
                  A soma das taxas e da margem desejada excede 100%. Reduza a margem ou custos.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CONTRATO SIMPLES PARA IMPRESSÃO A4                 */}
        {/* ========================================================= */}
        {activeTab === 'simple-contract' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Contratante (Cliente):</label>
                <input
                  type="text"
                  value={contratante}
                  onChange={(e) => setContratante(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Contratado (Prestador):</label>
                <input
                  type="text"
                  value={contratado}
                  onChange={(e) => setContratado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Valor dos Serviços (R$):</label>
                <input
                  type="text"
                  value={valorContrato}
                  onChange={(e) => setValorContrato(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Prazo de Entrega (Dias):</label>
                <input
                  type="text"
                  value={prazoDias}
                  onChange={(e) => setPrazoDias(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Layout A4 Formatado */}
            <div className="p-8 bg-white text-slate-900 rounded-xl shadow-2xl font-serif text-sm leading-relaxed max-w-3xl mx-auto border border-slate-300">
              <h3 className="text-center font-bold text-lg mb-6 uppercase tracking-wider underline">
                Contrato de Prestação de Serviços Digitais
              </h3>

              <p className="mb-4 text-justify">
                <strong>CONTRATANTE:</strong> {contratante}, inscrito(a) no CPF/MF sob o nº {cpfContratante}.
              </p>
              <p className="mb-4 text-justify">
                <strong>CONTRATADO(A):</strong> {contratado}, pessoa jurídica/física inscrita no CNPJ/CPF nº {cnpjContratado}.
              </p>

              <h4 className="font-bold mb-2">CLÁUSULA 1ª - DO OBJETO</h4>
              <p className="mb-4 text-justify">
                O presente instrumento tem por objeto a prestação dos seguintes serviços: <em>{objetoServico}</em>.
              </p>

              <h4 className="font-bold mb-2">CLÁUSULA 2ª - DO VALOR E PAGAMENTO</h4>
              <p className="mb-4 text-justify">
                Pela execução dos serviços ora contratados, o(a) CONTRATANTE pagará ao(à) CONTRATADO(A) a quantia líquida de <strong>R$ {valorContrato}</strong>, a ser quitada mediante transferência bancária ou Pix.
              </p>

              <h4 className="font-bold mb-2">CLÁUSULA 3ª - DO PRAZO</h4>
              <p className="mb-6 text-justify">
                O prazo total estipulado para a conclusão e entrega definitiva dos serviços descritos é de <strong>{prazoDias} dias corridos</strong> a contar da assinatura deste contrato.
              </p>

              <p className="text-right text-xs mb-10">
                {cidadeContrato}, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
              </p>

              <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold">{contratante}</div>
                  <div className="text-slate-600">CONTRATANTE</div>
                </div>
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold">{contratado}</div>
                  <div className="text-slate-600">CONTRATADO(A)</div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={printContract}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-xl shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2 cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Contrato (Formato A4)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
