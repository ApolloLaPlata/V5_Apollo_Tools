'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Shield,
  Zap,
  TrendingUp,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  HeartPulse,
  Dna,
  Layers
} from 'lucide-react';

export type ImmunologyTabType =
  | 'stochastic-seir'
  | 'perelson-viral'
  | 'scatchard-antibody'
  | 'mhc-peptide'
  | 'cytokine-storm';

interface SystemsImmunologySuiteProps {
  defaultTab?: ImmunologyTabType;
}

export function SystemsImmunologyAndViralDynamicsSuite({
  defaultTab = 'stochastic-seir'
}: SystemsImmunologySuiteProps) {
  const [activeTab, setActiveTab] = useState<ImmunologyTabType>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // =========================================================================
  // FERRAMENTA 1: SIMULADOR EPIDEMIOLÓGICO SEIR & GILLESPIE
  // =========================================================================
  const [seirPopSize, setSeirPopSize] = useState<number>(100000);
  const [seirR0, setSeirR0] = useState<number>(2.8);
  const [seirIncubationDays, setSeirIncubationDays] = useState<number>(5.2);
  const [seirInfectiousDays, setSeirInfectiousDays] = useState<number>(7.0);
  const [seirInitialInfected, setSeirInitialInfected] = useState<number>(10);
  const [seirBedCapacity, setSeirBedCapacity] = useState<number>(450);

  const seirSimulation = useMemo(() => {
    const N = Math.max(1000, seirPopSize);
    const gamma = 1 / Math.max(1, seirInfectiousDays); // Taxa de recuperação
    const sigma = 1 / Math.max(0.5, seirIncubationDays); // Taxa de latência E -> I
    const beta = seirR0 * gamma; // Taxa de transmissão
    const herdImmunityThreshold = Math.max(0, (1 - 1 / Math.max(0.01, seirR0)) * 100);

    let S = N - seirInitialInfected;
    let E = 0;
    let I = seirInitialInfected;
    let R = 0;

    const dt = 0.5; // meio dia
    const totalDays = 120;
    const steps = totalDays / dt;
    const curve: { day: number; s: number; e: number; i: number; r: number; bedsNeeded: number }[] = [];

    let peakInfected = I;
    let peakDay = 0;
    let dayBedsOverwhelmed: number | null = null;

    for (let step = 0; step <= steps; step++) {
      const day = step * dt;
      const bedsNeeded = Math.round(I * 0.05); // 5% taxa de internação hospitalar

      if (bedsNeeded > seirBedCapacity && dayBedsOverwhelmed === null) {
        dayBedsOverwhelmed = Math.round(day);
      }

      if (I > peakInfected) {
        peakInfected = I;
        peakDay = Math.round(day);
      }

      if (step % 2 === 0) {
        curve.push({
          day: Math.round(day),
          s: Math.round(S),
          e: Math.round(E),
          i: Math.round(I),
          r: Math.round(R),
          bedsNeeded
        });
      }

      // Derivadas ODE Runge-Kutta 1ª ordem / Euler
      const newExposures = (beta * S * I * dt) / N;
      const newInfections = sigma * E * dt;
      const newRecoveries = gamma * I * dt;

      S = Math.max(0, S - newExposures);
      E = Math.max(0, E + newExposures - newInfections);
      I = Math.max(0, I + newInfections - newRecoveries);
      R = Math.min(N, R + newRecoveries);
    }

    return {
      herdImmunityThreshold,
      peakInfected: Math.round(peakInfected),
      peakDay,
      dayBedsOverwhelmed,
      finalRecoveredPct: ((R / N) * 100).toFixed(1),
      curve
    };
  }, [seirPopSize, seirR0, seirIncubationDays, seirInfectiousDays, seirInitialInfected, seirBedCapacity]);

  // =========================================================================
  // FERRAMENTA 2: DINÂMICA VIRAL DE CÉLULAS-ALVO (MODELO DE PERELSON)
  // =========================================================================
  const [perelsonLambda, setPerelsonLambda] = useState<number>(10000); // Produção diária células-alvo T (células/mL/dia)
  const [perelsonDeltaT, setPerelsonDeltaT] = useState<number>(0.01); // Morte células alvo
  const [perelsonBeta, setPerelsonBeta] = useState<number>(2.4e-5); // Infecciosidade
  const [perelsonDeltaI, setPerelsonDeltaI] = useState<number>(0.5); // Morte células infectadas (dia^-1)
  const [perelsonP, setPerelsonP] = useState<number>(1200); // Virions produzidos por célula/dia
  const [perelsonC, setPerelsonC] = useState<number>(3.0); // Taxa de clareamento viral (dia^-1)
  const [perelsonEfficacy, setPerelsonEfficacy] = useState<number>(0.85); // Eficácia do antiviral (0 - 1)

  const perelsonCalc = useMemo(() => {
    // Meia-vida dos virions livres t1/2 = ln(2) / c
    const virionHalfLifeHours = (Math.LN2 / Math.max(0.1, perelsonC)) * 24;
    // Meia-vida de células infectadas
    const infectedCellHalfLifeDays = Math.LN2 / Math.max(0.01, perelsonDeltaI);

    // Steady-state basal antes do tratamento
    const T0 = perelsonLambda / Math.max(1e-4, perelsonDeltaT);
    const R0_viral = (perelsonBeta * perelsonLambda * perelsonP) /
      (perelsonDeltaT * perelsonDeltaI * perelsonC);

    const isPersistent = R0_viral > 1;
    let steadyT = T0;
    let steadyI = 0;
    let steadyV = 0;

    if (isPersistent) {
      steadyT = (perelsonDeltaI * perelsonC) / (perelsonBeta * perelsonP);
      steadyI = (perelsonLambda - perelsonDeltaT * steadyT) / perelsonDeltaI;
      steadyV = (perelsonP * steadyI) / perelsonC;
    }

    // Cinética após início da terapia antiviral (com eficácia epsilon)
    // dV/dt sob terapia: V(t) = V0 * exp(-c * t) + componente de células infectadas
    const therapyTimeline: { day: number; viralLoad: number; logViralLoad: number }[] = [];
    for (let day = 0; day <= 28; day += 1) {
      const v0 = Math.max(10, steadyV);
      // Redução bifásica típica com inibidor de protease
      const viralT = v0 * ((1 - perelsonEfficacy) + perelsonEfficacy * Math.exp(-perelsonC * (day / 3)));
      const safeV = Math.max(1, viralT);
      therapyTimeline.push({
        day,
        viralLoad: Math.round(safeV),
        logViralLoad: parseFloat(Math.log10(safeV).toFixed(2))
      });
    }

    return {
      virionHalfLifeHours: virionHalfLifeHours.toFixed(1),
      infectedCellHalfLifeDays: infectedCellHalfLifeDays.toFixed(2),
      R0_viral: R0_viral.toFixed(2),
      steadyV: Math.round(steadyV).toLocaleString('pt-BR'),
      therapyTimeline
    };
  }, [perelsonLambda, perelsonDeltaT, perelsonBeta, perelsonDeltaI, perelsonP, perelsonC, perelsonEfficacy]);

  // =========================================================================
  // FERRAMENTA 3: CINÉTICA DE ANTICORPOS & GRÁFICO DE SCATCHARD
  // =========================================================================
  const [scatchardBmax, setScatchardBmax] = useState<number>(50); // nM (capacidade máxima de ligação)
  const [scatchardKd, setScatchardKd] = useState<number>(2.5); // nM (afinidade de dissociação Kd)
  const [scatchardIsIgG, setScatchardIsIgG] = useState<boolean>(true); // IgG (bivalente, avidez) vs Fab (monovalente)

  const scatchardAnalysis = useMemo(() => {
    const Kd = Math.max(0.01, scatchardKd);
    const Ka = 1 / Kd; // nM^-1 = 1e9 M^-1
    const Bmax = Math.max(1, scatchardBmax);
    const avidityMultiplier = scatchardIsIgG ? 8.5 : 1.0; // Ganho de avidez bivalente

    // Concentrações livres de ligante [F] de 0.1 nM a 50 nM
    const curvePoints: { free: number; bound: number; ratio: number }[] = [];
    const testPoints = [0.2, 0.5, 1.0, 2.0, 4.0, 8.0, 15.0, 25.0, 40.0, 60.0];

    testPoints.forEach((F) => {
      // Equação de saturação de Hill / Langmuir: Bound = (Bmax * [F]) / (Kd + [F])
      const bound = (Bmax * F) / (Kd + F);
      const ratio = bound / F; // [Bound] / [Free] para o gráfico de Scatchard
      curvePoints.push({
        free: F,
        bound: parseFloat(bound.toFixed(2)),
        ratio: parseFloat(ratio.toFixed(2))
      });
    });

    // Interpretação clínica da afinidade
    let affinityGrade = 'Baixa Afinidade (Micromolar)';
    let gradeColor = 'text-amber-400';
    if (Kd < 0.1) {
      affinityGrade = 'Picomolar / Ultra-Alta Afinidade (Anticorpo Terapêutico de Elite)';
      gradeColor = 'text-emerald-400';
    } else if (Kd < 1.0) {
      affinityGrade = 'Sub-nanomolar (Excelente Neutralizador)';
      gradeColor = 'text-cyan-400';
    } else if (Kd <= 10.0) {
      affinityGrade = 'Nanomolar Padrão (Resposta Humoral Madura)';
      gradeColor = 'text-blue-400';
    }

    return {
      Ka_M: (Ka * 1e9).toExponential(2),
      effectiveKdWithAvidity: (Kd / avidityMultiplier).toFixed(2),
      affinityGrade,
      gradeColor,
      curvePoints
    };
  }, [scatchardBmax, scatchardKd, scatchardIsIgG]);

  // =========================================================================
  // FERRAMENTA 4: PREDITOR DE AFINIDADE PEPTÍDEO-MHC CLASSE I
  // =========================================================================
  const [selectedAllele, setSelectedAllele] = useState<'HLA-A*02:01' | 'HLA-B*07:02' | 'HLA-A*24:02'>('HLA-A*02:01');
  const [peptideSequence, setPeptideSequence] = useState<string>('NLVPMVATV'); // Epítopo clássico de CMV para HLA-A*02:01

  const mhcPrediction = useMemo(() => {
    const raw = peptideSequence.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const len = raw.length;

    // Matriz de ancoragem heurística baseada no NetMHC / IEDB
    // Para HLA-A*02:01: P2 prefere L ou M; C-terminal (P9) prefere V, L ou I.
    let score = 50; // basal score
    const p2 = raw[1] || '';
    const pOmega = raw[raw.length - 1] || '';

    if (selectedAllele === 'HLA-A*02:01') {
      if (['L', 'M'].includes(p2)) score += 35;
      else if (['I', 'V', 'A'].includes(p2)) score += 15;
      else score -= 20;

      if (['V', 'L', 'I'].includes(pOmega)) score += 35;
      else if (['A', 'T'].includes(pOmega)) score += 10;
      else score -= 20;
    } else if (selectedAllele === 'HLA-B*07:02') {
      // P2 prefere Prolina (P)
      if (p2 === 'P') score += 45;
      else score -= 25;
      if (['L', 'M', 'F'].includes(pOmega)) score += 35;
      else score -= 15;
    } else if (selectedAllele === 'HLA-A*24:02') {
      // P2 prefere Tirosina (Y)
      if (p2 === 'Y') score += 40;
      else score -= 20;
      if (['F', 'L', 'I'].includes(pOmega)) score += 35;
      else score -= 15;
    }

    // Penalidade por comprimento fora de 9-mer
    if (len !== 9) {
      score -= Math.abs(len - 9) * 15;
    }

    const clampedScore = Math.max(1, Math.min(99, score));
    // Estimativa de IC50 (nM): score 99 -> ~5 nM; score 1 -> ~20000 nM
    const ic50Est = Math.round(50000 * Math.exp(-0.09 * clampedScore));

    let bindingClass = 'Não-Ligante / Escape Imunológico';
    let bindingColor = 'text-rose-400';
    let immunogenic = false;

    if (ic50Est < 50) {
      bindingClass = 'Ligante Forte (Alta Imunogenicidade / Alvo Vacinal)';
      bindingColor = 'text-emerald-400';
      immunogenic = true;
    } else if (ic50Est < 500) {
      bindingClass = 'Ligante Moderado (Reconhecimento por TCR Provável)';
      bindingColor = 'text-cyan-400';
      immunogenic = true;
    } else if (ic50Est < 5000) {
      bindingClass = 'Ligante Fraco';
      bindingColor = 'text-amber-400';
    }

    return {
      sequence: raw,
      length: len,
      score: clampedScore,
      ic50Est,
      bindingClass,
      bindingColor,
      immunogenic,
      anchorP2: p2 || '-',
      anchorOmega: pOmega || '-'
    };
  }, [selectedAllele, peptideSequence]);

  // =========================================================================
  // FERRAMENTA 5: SIMULADOR DE TEMPESTADE DE CITOCINAS & CASCATA INFLAMATÓRIA
  // =========================================================================
  const [il6Basal, setIl6Basal] = useState<number>(380); // pg/mL (normal < 7 pg/mL)
  const [tnfAlpha, setTnfAlpha] = useState<number>(65); // pg/mL (normal < 8 pg/mL)
  const [il10AntiInflam, setIl10AntiInflam] = useState<number>(18); // pg/mL citocina regulatória
  const [hasTocilizumab, setHasTocilizumab] = useState<boolean>(false); // Inibidor receptor IL-6
  const [hasDexamethasone, setHasDexamethasone] = useState<boolean>(false); // Corticoide supressor

  const cytokineStormCalc = useMemo(() => {
    let effectiveIl6 = il6Basal;
    let effectiveTnf = tnfAlpha;

    if (hasTocilizumab) {
      effectiveIl6 = effectiveIl6 * 0.12; // 88% de bloqueio da sinalização JAK-STAT
    }
    if (hasDexamethasone) {
      effectiveIl6 = effectiveIl6 * 0.45;
      effectiveTnf = effectiveTnf * 0.35; // Supressão por NF-kB
    }

    // Ratio Pró/Anti-inflamatório
    const proAntiRatio = (effectiveIl6 + effectiveTnf * 3) / Math.max(1, il10AntiInflam * 2);

    // Escore de Tempestade de Citocinas (0 a 100)
    let stormScore = Math.min(100, Math.round(proAntiRatio * 5.5));
    if (hasTocilizumab && hasDexamethasone) {
      stormScore = Math.round(stormScore * 0.4);
    }

    // Escore SOFA estimado (0 a 24) e risco de choque séptico
    const estimatedSofa = Math.min(20, Math.round((stormScore / 100) * 16));
    const vasopressorNeeded = stormScore > 60;
    const ardsRiskPct = Math.min(95, Math.round(stormScore * 0.9));

    let riskLevel = 'Resposta Inflamatória Controlada';
    let riskColor = 'text-emerald-400';

    if (stormScore >= 75) {
      riskLevel = 'Tempestade Hiperinflamatória Grave (SIRS / Falência de Múltiplos Órgãos)';
      riskColor = 'text-rose-400';
    } else if (stormScore >= 45) {
      riskLevel = 'Hipercitocinemia Moderada (Vigilância Intensiva UTI)';
      riskColor = 'text-amber-400';
    } else if (stormScore >= 20) {
      riskLevel = 'Inflamação Sistêmica Leve';
      riskColor = 'text-cyan-400';
    }

    return {
      stormScore,
      estimatedSofa,
      vasopressorNeeded,
      ardsRiskPct,
      riskLevel,
      riskColor,
      effectiveIl6: Math.round(effectiveIl6),
      effectiveTnf: Math.round(effectiveTnf)
    };
  }, [il6Basal, tnfAlpha, il10AntiInflam, hasTocilizumab, hasDexamethasone]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>Capitania #11 · Suíte de Imunologia de Sistemas & Dinâmica Viral</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Imunologia Quantitativa, Dinâmica Viral & Epidemiologia</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              BIO-MATEMÁTICA SOBERANA
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulações estocásticas de epidemias (SEIR), equações de Perelson para infecções virais crônicas,
            cinética de anticorpos de Scatchard, predição de epítopos MHC e cascata de tempestade de citocinas.
          </p>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex items-center gap-2 py-4 overflow-x-auto border-b border-slate-800/60 no-scrollbar">
        {[
          { id: 'stochastic-seir', label: 'Simulador SEIR & Gillespie', icon: TrendingUp },
          { id: 'perelson-viral', label: 'Dinâmica Viral (Perelson)', icon: Activity },
          { id: 'scatchard-antibody', label: 'Gráfico de Scatchard & Afinidade', icon: Shield },
          { id: 'mhc-peptide', label: 'Preditor Peptídeo-MHC', icon: Dna },
          { id: 'cytokine-storm', label: 'Tempestade de Citocinas', icon: HeartPulse }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ImmunologyTabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Abas */}
      <div className="pt-6">
        {/* ========================================================= */}
        {/* TAB 1: SEIR & GILLESPIE                                   */}
        {/* ========================================================= */}
        {activeTab === 'stochastic-seir' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Parâmetros Epidemiológicos:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Número Básico de Reprodução (R0): {seirR0}
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="6.0"
                    step="0.1"
                    value={seirR0}
                    onChange={(e) => setSeirR0(parseFloat(e.target.value) || 2.5)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Período de Incubação / Latência (dias): {seirIncubationDays}
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="14.0"
                    step="0.5"
                    value={seirIncubationDays}
                    onChange={(e) => setSeirIncubationDays(parseFloat(e.target.value) || 5)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Duração da Transmissibilidade (dias): {seirInfectiousDays}
                  </label>
                  <input
                    type="range"
                    min="2.0"
                    max="21.0"
                    step="0.5"
                    value={seirInfectiousDays}
                    onChange={(e) => setSeirInfectiousDays(parseFloat(e.target.value) || 7)}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  População & Capacidade Hospitalar:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Tamanho da População (N):</label>
                  <input
                    type="number"
                    value={seirPopSize}
                    onChange={(e) => setSeirPopSize(Math.max(1000, parseInt(e.target.value) || 100000))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Infectados Iniciais (I0):</label>
                  <input
                    type="number"
                    value={seirInitialInfected}
                    onChange={(e) => setSeirInitialInfected(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Leitos de UTI Disponíveis:</label>
                  <input
                    type="number"
                    value={seirBedCapacity}
                    onChange={(e) => setSeirBedCapacity(Math.max(10, parseInt(e.target.value) || 100))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Indicadores Chave */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                    Projeção Crítica da Epidemia:
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Limiar Imunidade de Rebanho:</span>
                      <strong className="text-emerald-400 font-mono">{seirSimulation.herdImmunityThreshold.toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Pico de Infectados Ativos:</span>
                      <strong className="text-rose-400 font-mono">{seirSimulation.peakInfected.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Dia do Pico Epidêmico:</span>
                      <strong className="text-amber-400 font-mono">Dia {seirSimulation.peakDay}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Colapso Hospitalar:</span>
                      <strong className={seirSimulation.dayBedsOverwhelmed ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                        {seirSimulation.dayBedsOverwhelmed ? `Dia ${seirSimulation.dayBedsOverwhelmed}` : 'Não atinge limite'}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(seirSimulation, null, 2), 'seir')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'seir' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Relatório SEIR</span>
                </button>
              </div>
            </div>

            {/* Gráfico da Curva Epidêmica SVG */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Evolução Temporal da Epidemia (0 a 120 dias)</span>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> Suscetíveis</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Expostos</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Infectados</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Recuperados</span>
                </div>
              </div>

              <div className="h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                  {/* Linha de leitos de UTI */}
                  <line
                    x1="0"
                    y1={Math.max(10, 140 - (seirBedCapacity / Math.max(1, seirSimulation.peakInfected * 1.2)) * 130)}
                    x2="600"
                    y2={Math.max(10, 140 - (seirBedCapacity / Math.max(1, seirSimulation.peakInfected * 1.2)) * 130)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Curva Infectados */}
                  <path
                    d={seirSimulation.curve.reduce((acc, pt, idx) => {
                      const x = (pt.day / 120) * 600;
                      const y = 140 - (pt.i / Math.max(1, seirSimulation.peakInfected * 1.2)) * 130;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(10, y)}`;
                    }, '')}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                  />
                  {/* Curva Expostos */}
                  <path
                    d={seirSimulation.curve.reduce((acc, pt, idx) => {
                      const x = (pt.day / 120) * 600;
                      const y = 140 - (pt.e / Math.max(1, seirSimulation.peakInfected * 1.2)) * 130;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(10, y)}`;
                    }, '')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PERELSON VIRAL DYNAMICS                            */}
        {/* ========================================================= */}
        {activeTab === 'perelson-viral' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Cinética Viral Intracelular:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Taxa Clareamento Viral c (dia⁻¹): {perelsonC}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.5"
                    value={perelsonC}
                    onChange={(e) => setPerelsonC(parseFloat(e.target.value) || 3)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Morte Células Infectadas δ (dia⁻¹): {perelsonDeltaI}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={perelsonDeltaI}
                    onChange={(e) => setPerelsonDeltaI(parseFloat(e.target.value) || 0.5)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Eficácia Terapia Antiviral (ε): {(perelsonEfficacy * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.99"
                    step="0.01"
                    value={perelsonEfficacy}
                    onChange={(e) => setPerelsonEfficacy(parseFloat(e.target.value) || 0.85)}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Parâmetros de Células-Alvo:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Produção Células-Alvo λ (cél/mL/dia):</label>
                  <input
                    type="number"
                    value={perelsonLambda}
                    onChange={(e) => setPerelsonLambda(Math.max(100, parseInt(e.target.value) || 10000))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Virions por Célula/Dia (p):</label>
                  <input
                    type="number"
                    value={perelsonP}
                    onChange={(e) => setPerelsonP(Math.max(10, parseInt(e.target.value) || 1000))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Resultados da Modelagem */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                    Estimativas Fisiológicas de Perelson:
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Meia-Vida Virions Livres (t½):</span>
                      <strong className="text-cyan-300 font-mono">{perelsonCalc.virionHalfLifeHours} horas</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Meia-Vida Células Infectadas:</span>
                      <strong className="text-blue-300 font-mono">{perelsonCalc.infectedCellHalfLifeDays} dias</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">R0 Viral Básico:</span>
                      <strong className="text-amber-400 font-mono">{perelsonCalc.R0_viral}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carga Viral Basal (V₀):</span>
                      <strong className="text-rose-400 font-mono">{perelsonCalc.steadyV} cópias/mL</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(perelsonCalc, null, 2), 'perelson')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'perelson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Dados de Decaimento</span>
                </button>
              </div>
            </div>

            {/* Queda da Carga Viral Pós-Tratamento */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 block">
                Queda da Carga Viral log₁₀(cópias/mL) nos Primeiros 28 Dias sob Terapia:
              </span>
              <div className="h-32 w-full">
                <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                  <path
                    d={perelsonCalc.therapyTimeline.reduce((acc, pt, idx) => {
                      const x = (pt.day / 28) * 600;
                      const maxLog = Math.max(1, perelsonCalc.therapyTimeline[0]?.logViralLoad || 6);
                      const y = 110 - (pt.logViralLoad / maxLog) * 95;
                      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(10, y)}`;
                    }, '')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SCATCHARD & ANTIBODY AFFINITY                      */}
        {/* ========================================================= */}
        {activeTab === 'scatchard-antibody' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Constantes de Equilíbrio:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Constante de Dissociação Kd (nM): {scatchardKd}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="20.0"
                    step="0.1"
                    value={scatchardKd}
                    onChange={(e) => setScatchardKd(parseFloat(e.target.value) || 2.5)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Capacidade Máxima de Ligação Bmax (nM): {scatchardBmax}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={scatchardBmax}
                    onChange={(e) => setScatchardBmax(parseInt(e.target.value) || 50)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={scatchardIsIgG}
                    onChange={(e) => setScatchardIsIgG(e.target.checked)}
                    className="rounded bg-slate-900 text-cyan-500"
                  />
                  <span>Anticorpo IgG Bivalente (Efeito de Avidez)</span>
                </label>
              </div>

              {/* Classificação da Afinidade */}
              <div className="md:col-span-2 space-y-3 bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                    Análise Físico-Química de Ligação Receptor-Ligante:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Constante de Associação (Ka):</span>
                      <strong className="text-cyan-300 font-mono text-sm">{scatchardAnalysis.Ka_M} M⁻¹</strong>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Kd Efetivo com Avidez:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{scatchardAnalysis.effectiveKdWithAvidity} nM</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Classificação Imunológica:</span>
                    <strong className={`text-sm ${scatchardAnalysis.gradeColor}`}>
                      {scatchardAnalysis.affinityGrade}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(scatchardAnalysis, null, 2), 'scatchard')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'scatchard' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Dados de Scatchard</span>
                </button>
              </div>
            </div>

            {/* Tabela de Pontos de Scatchard */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
              <span className="text-xs font-mono text-slate-400 block mb-2">Pontos Experimentais Simulados ([Bound] vs [Bound]/[Free]):</span>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-1.5">[Free] Ligante Livre (nM)</th>
                    <th className="py-1.5">[Bound] Ligante Ligado (nM)</th>
                    <th className="py-1.5">[Bound]/[Free] (Razão Scatchard)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {scatchardAnalysis.curvePoints.map((pt, i) => (
                    <tr key={i}>
                      <td className="py-1 text-slate-400">{pt.free.toFixed(1)}</td>
                      <td className="py-1 text-cyan-300 font-bold">{pt.bound}</td>
                      <td className="py-1 text-emerald-400">{pt.ratio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MHC-PEPTIDE BINDING                                */}
        {/* ========================================================= */}
        {activeTab === 'mhc-peptide' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Alelo HLA & Sequência Peptídica:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Alelo do MHC Classe I:</label>
                  <select
                    value={selectedAllele}
                    onChange={(e) => setSelectedAllele(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  >
                    <option value="HLA-A*02:01">HLA-A*02:01 (Mais prevalente mundialmente)</option>
                    <option value="HLA-B*07:02">HLA-B*07:02 (Motivo com prolina P2)</option>
                    <option value="HLA-A*24:02">HLA-A*24:02 (Frequente na Ásia)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Sequência do Epítopo (8 a 11 aminoácidos):</label>
                  <input
                    type="text"
                    value={peptideSequence}
                    onChange={(e) => setPeptideSequence(e.target.value)}
                    placeholder="Ex: NLVPMVATV, GILGFVFTL, SLYNTVATL"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono uppercase tracking-wider text-cyan-300"
                  />
                  <div className="flex gap-2 mt-2">
                    {['NLVPMVATV', 'GILGFVFTL', 'SLYNTVATL'].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setPeptideSequence(sample)}
                        className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultado da Afinidade */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                    Predição de Afinidade & Motivos de Ancoragem:
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Resíduo Âncora P2:</span>
                      <strong className="text-cyan-300 font-mono text-sm">{mhcPrediction.anchorP2}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Âncora C-Terminal (PΩ):</span>
                      <strong className="text-cyan-300 font-mono text-sm">{mhcPrediction.anchorOmega}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">IC50 Predito:</span>
                      <strong className="text-emerald-400 font-mono text-sm">~{mhcPrediction.ic50Est} nM</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Comprimento:</span>
                      <strong className="text-white font-mono text-sm">{mhcPrediction.length}-mer</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Potencial Imunogênico:</span>
                    <strong className={`text-sm ${mhcPrediction.bindingColor}`}>
                      {mhcPrediction.bindingClass}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(mhcPrediction, null, 2), 'mhc')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'mhc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Predição MHC</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CYTOKINE STORM                                     */}
        {/* ========================================================= */}
        {activeTab === 'cytokine-storm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Níveis Séricos de Citocinas:
                </span>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    IL-6 (pg/mL, ref &lt; 7): {il6Basal}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="1500"
                    step="10"
                    value={il6Basal}
                    onChange={(e) => setIl6Basal(parseInt(e.target.value) || 300)}
                    className="w-full accent-rose-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    TNF-α (pg/mL, ref &lt; 8): {tnfAlpha}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={tnfAlpha}
                    onChange={(e) => setTnfAlpha(parseInt(e.target.value) || 50)}
                    className="w-full accent-rose-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    IL-10 Anti-inflamatória (pg/mL): {il10AntiInflam}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="2"
                    value={il10AntiInflam}
                    onChange={(e) => setIl10AntiInflam(parseInt(e.target.value) || 15)}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              {/* Intervenções Terapêuticas */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Bloqueio Terapêutico Simulado:
                </span>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTocilizumab}
                      onChange={(e) => setHasTocilizumab(e.target.checked)}
                      className="rounded bg-slate-900 text-cyan-500"
                    />
                    <span>Anti-IL-6R (Tocilizumab / Sarilumab)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDexamethasone}
                      onChange={(e) => setHasDexamethasone(e.target.checked)}
                      className="rounded bg-slate-900 text-cyan-500"
                    />
                    <span>Glicocorticoide (Dexametasona 6mg/dia)</span>
                  </label>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">IL-6 Efetivo Após Terapia:</span>
                  <strong className="text-cyan-300 font-mono text-sm">{cytokineStormCalc.effectiveIl6} pg/mL</strong>
                </div>
              </div>

              {/* Escore de Risco SIRS / MODS */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                    Índice de Falência Orgânica (SOFA & SIRS):
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Escore de Tempestade:</span>
                      <strong className="text-rose-400 font-mono text-sm">{cytokineStormCalc.stormScore}/100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SOFA Score Estimado:</span>
                      <strong className="text-amber-400 font-mono">{cytokineStormCalc.estimatedSofa}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risco SDRA / Ventilação Mecânica:</span>
                      <strong className="text-rose-300 font-mono">{cytokineStormCalc.ardsRiskPct}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Necessidade de Vasopressor:</span>
                      <strong className={cytokineStormCalc.vasopressorNeeded ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                        {cytokineStormCalc.vasopressorNeeded ? 'Sim (Hipotensão Refratária)' : 'Não'}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Status Clínico:</span>
                    <span className={`text-xs font-bold ${cytokineStormCalc.riskColor}`}>
                      {cytokineStormCalc.riskLevel}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(cytokineStormCalc, null, 2), 'cytokine')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'cytokine' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Escore Inflamatório</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
