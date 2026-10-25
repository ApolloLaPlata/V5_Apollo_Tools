'use client';

import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Baby, 
  Flame, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Scale, 
  Calendar, 
  Users, 
  Beer, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export type HealthEverydayTab = 'imc-peso' | 'gestacional' | 'churrasco' | 'recibo-promissoria';

// Conversor de número para extenso monetário (PT-BR)
function numeroPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais';
  const centavos = Math.round((valor % 1) * 100);
  const inteiro = Math.floor(valor);

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converterGrupo(n: number): string {
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
  }

  const partesTexto: string[] = [];
  if (inteiro >= 1000000) {
    const milhoes = Math.floor(inteiro / 1000000);
    partesTexto.push(`${converterGrupo(milhoes)} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }
  const milhares = Math.floor((inteiro % 1000000) / 1000);
  if (milhares > 0) {
    partesTexto.push(`${converterGrupo(milhares)} mil`);
  }
  const resto = inteiro % 1000;
  if (resto > 0) {
    partesTexto.push(converterGrupo(resto));
  }

  let textoFinal = partesTexto.join(' e ') || 'zero';
  textoFinal += inteiro === 1 ? ' real' : ' reais';

  if (centavos > 0) {
    textoFinal += ` e ${converterGrupo(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }

  return textoFinal;
}

export function HealthAndEverydaySuite({ defaultTab = 'imc-peso' }: { defaultTab?: HealthEverydayTab }) {
  const [activeTab, setActiveTab] = useState<HealthEverydayTab>(defaultTab);
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

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // TAB 1: CALCULADORA DE IMC STATE
  // ==========================================
  const [imcWeight, setImcWeight] = useState<number>(75);
  const [imcHeight, setImcHeight] = useState<number>(175); // cm
  const [imcGender, setImcGender] = useState<'male' | 'female'>('male');

  const imcResult = useMemo(() => {
    if (imcWeight <= 0 || imcHeight <= 0) return null;
    const heightInMeters = imcHeight / 100;
    const imc = imcWeight / (heightInMeters * heightInMeters);

    let classification = 'Peso Normal';
    let color = 'text-emerald-400';
    let risk = 'Baixo risco de comorbidades';

    if (imc < 18.5) {
      classification = 'Abaixo do Peso (Magreza)';
      color = 'text-amber-400';
      risk = 'Risco de desnutrição e fraqueza';
    } else if (imc >= 18.5 && imc < 24.9) {
      classification = 'Peso Ideal / Normal';
      color = 'text-emerald-400';
      risk = 'Menor risco cardiovascular';
    } else if (imc >= 25 && imc < 29.9) {
      classification = 'Sobrepeso (Pré-obesidade)';
      color = 'text-yellow-400';
      risk = 'Risco aumentado de hipertensão';
    } else if (imc >= 30 && imc < 34.9) {
      classification = 'Obesidade Grau I';
      color = 'text-orange-400';
      risk = 'Risco moderado de doenças crônicas';
    } else if (imc >= 35 && imc < 39.9) {
      classification = 'Obesidade Grau II (Severa)';
      color = 'text-rose-400';
      risk = 'Risco grave de comorbidades';
    } else {
      classification = 'Obesidade Grau III (Mórbida)';
      color = 'text-rose-500';
      risk = 'Risco muito grave / emergência clínica';
    }

    const minNormalWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxNormalWeight = 24.9 * (heightInMeters * heightInMeters);

    // Peso ideal fórmula de Devine
    const idealWeightDevine = imcGender === 'male'
      ? 50 + 2.3 * ((imcHeight / 2.54) - 60)
      : 45.5 + 2.3 * ((imcHeight / 2.54) - 60);

    return {
      imc: Number(imc.toFixed(1)),
      classification,
      color,
      risk,
      minNormalWeight: Number(minNormalWeight.toFixed(1)),
      maxNormalWeight: Number(maxNormalWeight.toFixed(1)),
      idealWeight: Number(idealWeightDevine.toFixed(1))
    };
  }, [imcWeight, imcHeight, imcGender]);

  // ==========================================
  // TAB 2: CALCULADORA GESTACIONAL STATE
  // ==========================================
  const [dumDate, setDumDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 70); // ~10 semanas atrás
    return d.toISOString().split('T')[0];
  });

  const gestationalData = useMemo(() => {
    if (!dumDate) return null;
    const dum = new Date(dumDate + 'T00:00:00');
    const today = new Date();

    if (isNaN(dum.getTime()) || dum > today) return null;

    const diffDays = Math.floor((today.getTime() - dum.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    // Regra de Naegele para DPP: DUM + 7 dias - 3 meses + 1 ano (+ 280 dias)
    const dpp = new Date(dum);
    dpp.setDate(dpp.getDate() + 280);

    // Trimestre
    let trimester = '1º Trimestre (Desenvolvimento fetal inicial)';
    if (weeks >= 14 && weeks <= 27) {
      trimester = '2º Trimestre (Crescimento rápido e movimentos)';
    } else if (weeks >= 28) {
      trimester = '3º Trimestre (Ganho de peso e preparação para o parto)';
    }

    return {
      weeks,
      days,
      totalDays: diffDays,
      dppStr: dpp.toLocaleDateString('pt-BR'),
      trimester,
      progressPercent: Math.min(100, Number(((diffDays / 280) * 100).toFixed(1)))
    };
  }, [dumDate]);

  // ==========================================
  // TAB 3: CALCULADORA DE CHURRASCO STATE
  // ==========================================
  const [menCount, setMenCount] = useState<number>(10);
  const [womenCount, setWomenCount] = useState<number>(8);
  const [kidsCount, setKidsCount] = useState<number>(4);
  const [partyDuration, setPartyDuration] = useState<number>(5); // horas
  const [drinksBeer, setDrinksBeer] = useState<boolean>(true);

  const bbqResult = useMemo(() => {
    // Estimativas por pessoa por hora padrão brasileiro
    const durationFactor = Math.max(1, partyDuration / 4);

    // Carne: Homem 450g, Mulher 300g, Criança 150g (base para 4h)
    const meatTotalKg = ((menCount * 0.45 + womenCount * 0.30 + kidsCount * 0.15) * durationFactor);
    const beefKg = meatTotalKg * 0.50; // 50% picanha/alcatra
    const chickenKg = meatTotalKg * 0.25; // 25% frango/tulipa
    const sausageKg = meatTotalKg * 0.25; // 25% linguiça

    // Bebidas
    // Cerveja: ~1.5L por adulto que bebe (base)
    const beerLitros = drinksBeer ? (menCount * 1.8 + womenCount * 1.0) * durationFactor : 0;
    const beerLata350 = Math.ceil(beerLitros / 0.35);

    // Refrigerante / Suco: 600ml por pessoa
    const totalPeople = menCount + womenCount + kidsCount;
    const sodaLitros = (totalPeople * 0.6) * durationFactor;
    const waterLitros = (totalPeople * 0.4) * durationFactor;

    // Acompanhamentos
    const coalKg = Math.ceil(meatTotalKg * 1.2); // 1.2kg de carvão por kg de carne
    const garlicBreadUnits = Math.ceil(totalPeople * 2);
    const iceBags5kg = Math.ceil((beerLitros + sodaLitros) / 15);

    return {
      meatTotalKg: Number(meatTotalKg.toFixed(1)),
      beefKg: Number(beefKg.toFixed(1)),
      chickenKg: Number(chickenKg.toFixed(1)),
      sausageKg: Number(sausageKg.toFixed(1)),
      beerLata350,
      beerLitros: Number(beerLitros.toFixed(1)),
      sodaLitros: Number(sodaLitros.toFixed(1)),
      waterLitros: Number(waterLitros.toFixed(1)),
      coalKg,
      garlicBreadUnits,
      iceBags5kg,
      totalPeople
    };
  }, [menCount, womenCount, kidsCount, partyDuration, drinksBeer]);

  // ==========================================
  // TAB 4: RECIBO & NOTA PROMISSÓRIA STATE
  // ==========================================
  const [docType, setDocType] = useState<'recibo' | 'promissoria'>('recibo');
  const [docAmount, setDocAmount] = useState<number>(1500.00);
  const [docPayer, setDocPayer] = useState<string>('Carlos Eduardo da Silva');
  const [docPayerDoc, setDocPayerDoc] = useState<string>('123.456.789-00');
  const [docReceiver, setDocReceiver] = useState<string>('Holding V5 Apollo Serviços Digitais Ltda');
  const [docReceiverDoc, setDocReceiverDoc] = useState<string>('12.345.678/0001-90');
  const [docDescription, setDocDescription] = useState<string>('Serviços de desenvolvimento de software e infraestrutura de IA');
  const [docCity, setDocCity] = useState<string>('São Paulo - SP');
  const [docDueDate, setDocDueDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const amountInWords = useMemo(() => {
    return numeroPorExtenso(docAmount);
  }, [docAmount]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Cyberpunk de Fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase tracking-wider">
              Benchmark Invertexto · Saúde & Vida Cotidiana
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              100% Client-Side
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-400" />
            Saúde, Churrasco & Documentos para Impressão
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Classificação de IMC OMS, cálculo gestacional Naegele, calculadora de churrasco e emissor de recibo A4.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('imc-peso')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'imc-peso'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            IMC & Peso Ideal
          </button>
          <button
            onClick={() => setActiveTab('gestacional')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'gestacional'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            Gestacional & Parto
          </button>
          <button
            onClick={() => setActiveTab('churrasco')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'churrasco'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Churrascômetro
          </button>
          <button
            onClick={() => setActiveTab('recibo-promissoria')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'recibo-promissoria'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Recibo & Promissória A4
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="relative z-10 pt-6">

        {/* ========================================================= */}
        {/* TAB 1: IMC & PESO IDEAL */}
        {/* ========================================================= */}
        {activeTab === 'imc-peso' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                  Peso Corporal (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={imcWeight}
                  onChange={(e) => setImcWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-rose-400 font-bold mb-1.5">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={imcHeight}
                  onChange={(e) => setImcHeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                  Sexo Biológico
                </label>
                <select
                  value={imcGender}
                  onChange={(e) => setImcGender(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </div>
            </div>

            {imcResult && (
              <div className="space-y-6">
                {/* Cartão de Destaque do IMC */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div>
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                      Seu Índice de Massa Corporal (IMC)
                    </span>
                    <div className="text-4xl sm:text-6xl font-black text-white mt-1">
                      {imcResult.imc} <span className="text-sm font-mono text-slate-500">kg/m²</span>
                    </div>
                    <div className={`text-lg sm:text-xl font-bold mt-1 ${imcResult.color}`}>
                      {imcResult.classification}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {imcResult.risk} (Conforme diretrizes da OMS)
                    </p>
                  </div>

                  <div className="text-right p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs font-mono text-slate-500 block">Faixa de Peso Saudável:</span>
                    <strong className="text-base font-mono text-emerald-400 block mt-0.5">
                      {imcResult.minNormalWeight} kg a {imcResult.maxNormalWeight} kg
                    </strong>
                    <span className="text-xs font-mono text-slate-500 block mt-2">Peso Ideal Estimado (Devine):</span>
                    <strong className="text-base font-mono text-cyan-300 block mt-0.5">
                      {imcResult.idealWeight} kg
                    </strong>
                  </div>
                </div>

                {/* Tabela de Classificação OMS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">&lt; 18.5</span>
                    <strong className="text-amber-400 block mt-0.5">Abaixo</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">18.5 - 24.9</span>
                    <strong className="text-emerald-400 block mt-0.5">Normal</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">25 - 29.9</span>
                    <strong className="text-yellow-400 block mt-0.5">Sobrepeso</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">30 - 34.9</span>
                    <strong className="text-orange-400 block mt-0.5">Obesidade I</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">35 - 39.9</span>
                    <strong className="text-rose-400 block mt-0.5">Obesidade II</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">&gt; 40.0</span>
                    <strong className="text-rose-500 block mt-0.5">Obesidade III</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CALCULADORA GESTACIONAL & PARTO */}
        {/* ========================================================= */}
        {activeTab === 'gestacional' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-md">
              <label className="block text-xs font-mono text-rose-400 font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Data da Última Menstruação (DUM)
              </label>
              <input
                type="date"
                value={dumDate}
                onChange={(e) => setDumDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            {gestationalData && (
              <div className="space-y-6">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                        Idade Gestacional Atual
                      </span>
                      <div className="text-4xl sm:text-6xl font-black text-white mt-1">
                        {gestationalData.weeks} <span className="text-xl font-normal text-slate-400">semanas e</span> {gestationalData.days} <span className="text-xl font-normal text-slate-400">dias</span>
                      </div>
                      <p className="text-sm font-bold text-rose-300 mt-2">
                        {gestationalData.trimester}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
                      <span className="text-xs font-mono text-slate-400 block">Data Provável do Parto (DPP):</span>
                      <strong className="text-2xl font-mono text-rose-400 block mt-1">
                        {gestationalData.dppStr}
                      </strong>
                      <span className="text-[11px] font-mono text-slate-500 block mt-1">
                        Cálculo pela Regra de Naegele (40 semanas)
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso da Gestação */}
                  <div className="mt-6 pt-6 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>Progresso Gestacional</span>
                      <strong>{gestationalData.progressPercent}% concluído ({gestationalData.totalDays}/280 dias)</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${gestationalData.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CHURRASCÔMETRO */}
        {/* ========================================================= */}
        {activeTab === 'churrasco' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">Homens</label>
                <input
                  type="number"
                  min="0"
                  value={menCount}
                  onChange={(e) => setMenCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-rose-400 font-bold mb-1.5">Mulheres</label>
                <input
                  type="number"
                  min="0"
                  value={womenCount}
                  onChange={(e) => setWomenCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-400 font-bold mb-1.5">Crianças</label>
                <input
                  type="number"
                  min="0"
                  value={kidsCount}
                  onChange={(e) => setKidsCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-emerald-400 font-bold mb-1.5">Duração (Horas)</label>
                <input
                  type="number"
                  min="1"
                  value={partyDuration}
                  onChange={(e) => setPartyDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Resultado do Churrasco */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Carnes */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Carnes ({bbqResult.meatTotalKg} kg total)
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carne Bovina (Picanha/Alcatra):</span>
                    <strong className="text-slate-100">{bbqResult.beefKg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frango (Tulipa/Coxinha):</span>
                    <strong className="text-slate-100">{bbqResult.chickenKg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Linguiça Toscana:</span>
                    <strong className="text-slate-100">{bbqResult.sausageKg} kg</strong>
                  </div>
                </div>
              </div>

              {/* Bebidas */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                    <Beer className="w-4 h-4" /> Bebidas
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cerveja (Latas 350ml):</span>
                    <strong className="text-amber-400 font-bold">{bbqResult.beerLata350} latas ({bbqResult.beerLitros}L)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Refrigerante / Suco:</span>
                    <strong className="text-slate-100">{bbqResult.sodaLitros} Litros</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Água Mineral:</span>
                    <strong className="text-slate-100">{bbqResult.waterLitros} Litros</strong>
                  </div>
                </div>
              </div>

              {/* Suprimentos & Acompanhamentos */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Suprimentos
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carvão:</span>
                    <strong className="text-slate-100">{bbqResult.coalKg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pão de Alho:</span>
                    <strong className="text-slate-100">{bbqResult.garlicBreadUnits} unidades</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sacos de Gelo (5kg):</span>
                    <strong className="text-slate-100">{bbqResult.iceBags5kg} sacos</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RECIBO & NOTA PROMISSÓRIA ONLINE (A4 PRINT) */}
        {/* ========================================================= */}
        {activeTab === 'recibo-promissoria' && (
          <div className="space-y-6">
            {/* Controles do Documento */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocType('recibo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    docType === 'recibo' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Recibo de Pagamento
                </button>
                <button
                  onClick={() => setDocType('promissoria')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    docType === 'promissoria' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Nota Promissória
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>

            {/* Inputs de Configuração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={docAmount}
                  onChange={(e) => setDocAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1">Data / Vencimento</label>
                <input
                  type="date"
                  value={docDueDate}
                  onChange={(e) => setDocDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1">
                  {docType === 'recibo' ? 'Nome do Pagador' : 'Nome do Emitente / Devedor'}
                </label>
                <input
                  type="text"
                  value={docPayer}
                  onChange={(e) => setDocPayer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={docPayerDoc}
                  onChange={(e) => setDocPayerDoc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1">
                  {docType === 'recibo' ? 'Nome do Beneficiário' : 'Nome do Credor'}
                </label>
                <input
                  type="text"
                  value={docReceiver}
                  onChange={(e) => setDocReceiver(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1">Cidade - UF</label>
                <input
                  type="text"
                  value={docCity}
                  onChange={(e) => setDocCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1">Referente a / Descrição</label>
                <input
                  type="text"
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Documento Estilizado Pré-visualização / Impressão */}
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-300 max-w-3xl mx-auto font-serif">
              {docType === 'recibo' ? (
                <div className="space-y-6">
                  <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center">
                    <h3 className="text-2xl font-bold tracking-wider uppercase font-sans">RECIBO DE PAGAMENTO</h3>
                    <div className="text-xl font-bold font-mono bg-slate-100 px-3 py-1 border border-slate-300 rounded">
                      R$ {docAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <p className="text-base leading-relaxed text-justify">
                    Recebi(emos) de <strong>{docPayer || '_______________________'}</strong>, 
                    inscrito(a) no CPF/CNPJ nº <strong>{docPayerDoc || '_______________'}</strong>, 
                    a quantia de <strong>R$ {docAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({amountInWords}), 
                    referente a <strong>{docDescription || 'prestação de serviços'}</strong>.
                  </p>

                  <p className="text-sm text-slate-600">
                    E, para firmeza e como prova de haver recebido a referida importância, firmo(amos) o presente recibo.
                  </p>

                  <div className="pt-10 flex flex-col items-end">
                    <p className="text-sm">{docCity}, {new Date(docDueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    <div className="mt-12 border-t border-slate-900 w-72 text-center pt-1 text-sm font-sans">
                      <strong>{docReceiver}</strong>
                      <span className="block text-xs text-slate-600">{docReceiverDoc}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold tracking-wider uppercase font-sans">NOTA PROMISSÓRIA</h3>
                      <span className="text-xs font-mono text-slate-600">Conforme Decreto nº 57.663/1966 (Lei Uniforme)</span>
                    </div>
                    <div className="text-xl font-bold font-mono bg-slate-100 px-3 py-1 border border-slate-300 rounded">
                      R$ {docAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <p className="text-base leading-relaxed text-justify">
                    No dia <strong>{new Date(docDueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>, pagarei(emos) por esta única via de NOTA PROMISSÓRIA a <strong>{docReceiver || '_______________________'}</strong> (CNPJ/CPF nº {docReceiverDoc || '________________'}), ou à sua ordem, a quantia de <strong>R$ {docAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({amountInWords}), em moeda corrente deste país.
                  </p>

                  <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-sans">
                    <div className="space-y-1">
                      <strong className="block text-slate-800">EMITENTE (DEVEDOR):</strong>
                      <p>Nome: {docPayer}</p>
                      <p>CPF/CNPJ: {docPayerDoc}</p>
                      <p>Praça de Pagamento: {docCity}</p>
                    </div>

                    <div className="flex flex-col justify-end items-center">
                      <div className="border-t border-slate-900 w-full text-center pt-1">
                        <strong>Assinatura do Emitente</strong>
                      </div>
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
