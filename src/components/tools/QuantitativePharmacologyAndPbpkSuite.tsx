'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Compass,
  Activity,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  BarChart2,
  Orbit,
  Zap,
  Flame,
  Radio,
  Eye,
  Layers,
  Share2,
  Atom,
  Circle,
  HelpCircle,
  ShieldAlert,
  Sun,
  Dna,
  Telescope,
  Brain,
  Pill,
  HeartPulse
} from 'lucide-react';

export function QuantitativePharmacologyAndPbpkSuite({
  defaultTab = 'one-compartment'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'one-compartment' | 'two-compartment' | 'pbpk-partition' | 'hill-equation' | 'lipinski-qsar'
  >(() => {
    if (defaultTab === 'two-compartment-oral-absorption-calc' || defaultTab === 'two-compartment') return 'two-compartment';
    if (defaultTab === 'pbpk-tissue-partition-calc' || defaultTab === 'pbpk-partition') return 'pbpk-partition';
    if (defaultTab === 'hill-equation-dose-response-calc' || defaultTab === 'hill-equation') return 'hill-equation';
    if (defaultTab === 'qsar-lipinski-druglikeness-calc' || defaultTab === 'lipinski-qsar') return 'lipinski-qsar';
    return 'one-compartment';
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 1: FARMACOCINÉTICA MONOCOMPARTIMENTAL (IV BOLUS & INFUSÃO)
  // -------------------------------------------------------------
  const [doseMg, setDoseMg] = useState<number>(500); // mg
  const [volumeDistL, setVolumeDistL] = useState<number>(35); // Litros (Vd)
  const [clearanceLPerH, setClearanceLPerH] = useState<number>(3.5); // L/h (CL)
  const [dosingIntervalHours, setDosingIntervalHours] = useState<number>(12); // Intervalo tau (horas)
  const [adminRoute, setAdminRoute] = useState<'bolus' | 'infusion'>('bolus');
  const [infusionDurationH, setInfusionDurationH] = useState<number>(1.0); // horas

  const oneCompCalculations = useMemo(() => {
    // Constante de eliminação: k_e = CL / V_d (h^-1)
    const ke = clearanceLPerH / volumeDistL;
    // Meia-vida de eliminação: t_1/2 = ln(2) / k_e
    const halfLifeH = Math.log(2) / ke;

    // Concentração inicial pico (C_0 = Dose / V_d) em mg/L (ou µg/mL)
    const c0 = doseMg / volumeDistL;

    // Concentração de estado estacionário média para doses repetidas:
    // C_ss_avg = Dose / (CL * tau)
    const cssAvg = doseMg / (clearanceLPerH * dosingIntervalHours);

    // Fator de acúmulo: R_acc = 1 / (1 - exp(-k_e * tau))
    const accumulationFactor = 1 / (1 - Math.exp(-ke * dosingIntervalHours));
    const cssMax = c0 * accumulationFactor;
    const cssMin = cssMax * Math.exp(-ke * dosingIntervalHours);

    // Infusão contínua: C_ss = R_0 / CL (onde R_0 = Dose / t_inf)
    const r0Infusion = doseMg / infusionDurationH;
    const cssInfusion = r0Infusion / clearanceLPerH;

    // Curva temporal de concentração (0 a 48 horas)
    const timePoints: { t: number; c: number }[] = [];
    const dt = 0.5;
    for (let t = 0; t <= 48; t += dt) {
      // Simulação de dose repetida no estado estacionário
      const tInDose = t % dosingIntervalHours;
      const cCurrent = cssMax * Math.exp(-ke * tInDose);
      timePoints.push({ t, c: cCurrent });
    }

    return {
      ke,
      halfLifeH,
      c0,
      cssAvg,
      cssMax,
      cssMin,
      cssInfusion,
      accumulationFactor,
      timePoints
    };
  }, [doseMg, volumeDistL, clearanceLPerH, dosingIntervalHours, adminRoute, infusionDurationH]);

  // -------------------------------------------------------------
  // TAB 2: BICOMPARTIMENTAL COM ABSORÇÃO ORAL (BATEMAN)
  // -------------------------------------------------------------
  const [oralDoseMg, setOralDoseMg] = useState<number>(250); // mg
  const [bioavailabilityF, setBioavailabilityF] = useState<number>(0.85); // F (0 a 1)
  const [kaRateH, setKaRateH] = useState<number>(1.5); // h^-1 (taxa de absorção oral)
  const [vCentralL, setVCentralL] = useState<number>(15); // V1 (L)
  const [vPeripheralL, setVPeripheralL] = useState<number>(30); // V2 (L)
  const [intercompQLH, setIntercompQLH] = useState<number>(4.0); // Q (L/h)
  const [clearanceOralLH, setClearanceOralLH] = useState<number>(2.5); // CL (L/h)

  const twoCompCalculations = useMemo(() => {
    // Micro-constantes de transferência
    const k10 = clearanceOralLH / vCentralL;
    const k12 = intercompQLH / vCentralL;
    const k21 = intercompQLH / vPeripheralL;

    // Raízes macroscópicas alpha e beta
    const a0 = k10 * k21;
    const a1 = k10 + k12 + k21;
    const disc = Math.sqrt(Math.max(0, a1 * a1 - 4 * a0));
    const alpha = (a1 + disc) / 2; // fase de distribuição rápida
    const beta = (a1 - disc) / 2; // fase de eliminação lenta terminal

    const tHalfAlpha = Math.log(2) / alpha;
    const tHalfBeta = Math.log(2) / beta;

    // Tempo de pico de absorção oral T_max (aproximação monocompartimental dominante com ka e beta)
    const tMaxH = Math.log(kaRateH / beta) / (kaRateH - beta);

    // Concentração máxima C_max (Bateman)
    const cMax =
      ((bioavailabilityF * oralDoseMg * kaRateH) / (vCentralL * (kaRateH - beta))) *
      (Math.exp(-beta * tMaxH) - Math.exp(-kaRateH * tMaxH));

    // Curva oral (0 a 24 horas)
    const oralPoints: { t: number; c: number }[] = [];
    for (let t = 0; t <= 24; t += 0.25) {
      const cT =
        ((bioavailabilityF * oralDoseMg * kaRateH) / (vCentralL * (kaRateH - beta))) *
        Math.max(0, Math.exp(-beta * t) - Math.exp(-kaRateH * t));
      oralPoints.push({ t, c: cT });
    }

    return {
      alpha,
      beta,
      tHalfAlpha,
      tHalfBeta,
      tMaxH,
      cMax,
      oralPoints
    };
  }, [oralDoseMg, bioavailabilityF, kaRateH, vCentralL, vPeripheralL, intercompQLH, clearanceOralLH]);

  // -------------------------------------------------------------
  // TAB 3: PARTIÇÃO TECIDUAL MECANICISTA PBPK (RODGERS-ROWLAND)
  // -------------------------------------------------------------
  const [drugType, setDrugType] = useState<'neutral' | 'basic' | 'acidic'>('basic');
  const [logPValue, setLogPValue] = useState<number>(3.2); // lipofilicidade octanol/água
  const [pKaValue, setPKaValue] = useState<number>(8.5);
  const [fractionUnboundPlasma, setFractionUnboundPlasma] = useState<number>(0.1); // f_u (10% livre)

  const pbpkCalculations = useMemo(() => {
    // Estimativa mecanicista simplificada de K_p (Tecido / Plasma)
    // baseada em lipofilicidade (LogP), ionização pH 7.4 e fração livre f_u
    const pHeff = 7.4;
    let ionizationFactor = 1.0;
    if (drugType === 'basic') {
      // Cátions ligam-se a fosfolipídios ácidos celulares (ex: tecido cerebral e renal)
      ionizationFactor = 1 + Math.pow(10, pKaValue - pHeff);
    } else if (drugType === 'acidic') {
      // Ânions têm partição intracelular reduzida
      ionizationFactor = 1 / (1 + Math.pow(10, pHeff - pKaValue));
    }

    // Coeficientes de partição para órgãos-chave
    // Cérebro: barreira hematoencefálica (BHE) favorece neutros/lipofílicos sem cargas excessivas
    const kpBrain = Math.max(0.05, fractionUnboundPlasma * (0.8 + 0.15 * Math.pow(10, Math.min(3, logPValue * 0.4))));
    // Fígado: rico em fosfolipídios e lipídios neutros
    const kpLiver = Math.max(0.5, fractionUnboundPlasma * (2.0 + 0.8 * Math.pow(10, Math.min(2.5, logPValue * 0.5)) * (drugType === 'basic' ? 2.5 : 1.0)));
    // Rins: alta perfusão e retenção iônica
    const kpKidney = Math.max(0.4, fractionUnboundPlasma * (1.5 + 0.5 * ionizationFactor));
    // Adiposo: dominado estritamente por lipídios neutros triglicerídeos
    const kpAdipose = Math.max(0.2, fractionUnboundPlasma * (0.3 + 0.9 * Math.pow(10, Math.min(4, logPValue * 0.85))));
    // Músculo: maior volume corpóreo
    const kpMuscle = Math.max(0.3, fractionUnboundPlasma * (1.1 + 0.3 * ionizationFactor));

    // Volume de distribuição PBPK em estado estacionário no humano 70 kg:
    // V_ss = V_p + sum( V_t * K_p )
    const vp = 3.0; // Volume plasmático (L)
    const vssEstL = vp + (1.4 * kpBrain) + (1.8 * kpLiver) + (0.3 * kpKidney) + (14.0 * kpAdipose) + (29.0 * kpMuscle);

    return {
      kpBrain,
      kpLiver,
      kpKidney,
      kpAdipose,
      kpMuscle,
      vssEstL,
      bhePermeability: kpBrain > 0.4 ? 'Alta Penetração na BHE (Ação no SNC)' : 'Baixa Permeabilidade BHE (Periférico)'
    };
  }, [drugType, logPValue, pKaValue, fractionUnboundPlasma]);

  // -------------------------------------------------------------
  // TAB 4: CURVAS FARMACODINÂMICAS SIGMOIDES DE HILL
  // -------------------------------------------------------------
  const [ec50NanoMolar, setEc50NanoMolar] = useState<number>(50); // nM (potência)
  const [hillCoeff, setHillCoeff] = useState<number>(1.5); // n_H (cooperatividade)
  const [eMaxPercent, setEMaxPercent] = useState<number>(100); // % eficácia máxima
  const [antagonistConc, setAntagonistConc] = useState<number>(0); // nM de antagonista competitivo
  const [antagonistKb, setAntagonistKb] = useState<number>(20); // nM constante de dissociação do antagonista

  const hillCalculations = useMemo(() => {
    // Equação de Schild: deslocamento da potência na presença de antagonista competitivo
    // EC_50' = EC_50 * (1 + [B] / K_B)
    const doseRatio = 1 + antagonistConc / antagonistKb;
    const apparentEc50 = ec50NanoMolar * doseRatio;

    // Curva semi-logarítmica de concentração-resposta (0.1 nM a 10.000 nM)
    const curvePoints: { logC: number; c: number; effect: number; effectShifted: number }[] = [];
    for (let logC = -1; logC <= 4; logC += 0.1) {
      const conc = Math.pow(10, logC);
      // Efeito sem antagonista
      const effect = (eMaxPercent * Math.pow(conc, hillCoeff)) / (Math.pow(ec50NanoMolar, hillCoeff) + Math.pow(conc, hillCoeff));
      // Efeito com antagonista competitivo
      const effectShifted = (eMaxPercent * Math.pow(conc, hillCoeff)) / (Math.pow(apparentEc50, hillCoeff) + Math.pow(conc, hillCoeff));
      curvePoints.push({ logC, c: conc, effect, effectShifted });
    }

    return {
      doseRatio,
      apparentEc50,
      curvePoints
    };
  }, [ec50NanoMolar, hillCoeff, eMaxPercent, antagonistConc, antagonistKb]);

  // -------------------------------------------------------------
  // TAB 5: AVALIADOR QSAR & REGRA DOS CINCO DE LIPINSKI (RO5)
  // -------------------------------------------------------------
  const [molWeight, setMolWeight] = useState<number>(385); // Da (limite: 500)
  const [logPInput, setLogPInput] = useState<number>(2.8); // limite: 5.0
  const [hbdCount, setHbdCount] = useState<number>(2); // Donors (limite: 5)
  const [hbaCount, setHbaCount] = useState<number>(6); // Acceptors (limite: 10)
  const [tpsaArea, setTpsaArea] = useState<number>(75); // Å^2 (Veber: <= 140)
  const [rotBonds, setRotBonds] = useState<number>(4); // Veber: <= 10

  const lipinskiCalculations = useMemo(() => {
    let violations = 0;
    const violationList: string[] = [];

    if (molWeight > 500) { violations++; violationList.push('Massa Molecular > 500 Da'); }
    if (logPInput > 5.0) { violations++; violationList.push('LogP > 5.0 (Excessivamente Lipofílico)'); }
    if (hbdCount > 5) { violations++; violationList.push('Doadores de H (HBD) > 5'); }
    if (hbaCount > 10) { violations++; violationList.push('Aceptores de H (HBA) > 10'); }

    // Critérios de Veber
    let veberPassed = true;
    if (tpsaArea > 140) { veberPassed = false; violationList.push('TPSA > 140 Å² (Penetração Celular Comprometida)'); }
    if (rotBonds > 10) { veberPassed = false; violationList.push('Ligações Rotacionáveis > 10 (Flexibilidade Excessiva)'); }

    const isLipinskiCompliant = violations <= 1; // 1 violação ainda é tolerada em fármacos orais

    let druglikenessVerdict = 'Excelente Biodisponibilidade Oral Estimada (Regra de 5 Total)';
    let verdictColor = 'text-emerald-400';
    if (violations === 1) {
      druglikenessVerdict = 'Biodisponibilidade Oral Moderada (1 Violação Lipinski)';
      verdictColor = 'text-amber-400';
    } else if (violations >= 2) {
      druglikenessVerdict = 'Baixa Biodisponibilidade Oral (Candidato a Injetável/IV)';
      verdictColor = 'text-rose-400';
    }

    return {
      violations,
      violationList,
      veberPassed,
      isLipinskiCompliant,
      druglikenessVerdict,
      verdictColor
    };
  }, [molWeight, logPInput, hbdCount, hbaCount, tpsaArea, rotBonds]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
              Capitania #11 · Farmacometria & Bioengenharia
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Marco 520 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-400">
            Suíte de Farmacologia Quantitativa, PBPK & Modelagem QSAR
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulação farmacocinética mono e bicompartimental, partição tecidual PBPK de Rodgers-Rowland, curvas sigmoides de Hill e triagem QSAR de Lipinski.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const report = `[Relatório Farmacológico - Etapa 102 (Marco 520 Ferramentas)]\n` +
                `- PK Monocompartimental (Dose = ${doseMg} mg, CL = ${clearanceLPerH} L/h, Vd = ${volumeDistL} L): t_1/2 = ${oneCompCalculations.halfLifeH.toFixed(1)} h | C_ss_avg = ${oneCompCalculations.cssAvg.toFixed(2)} µg/mL\n` +
                `- PK Bicompartimental Oral (Bateman): T_max = ${twoCompCalculations.tMaxH.toFixed(2)} h | C_max = ${twoCompCalculations.cMax.toFixed(2)} µg/mL | t_1/2_beta = ${twoCompCalculations.tHalfBeta.toFixed(1)} h\n` +
                `- PBPK Rodgers-Rowland (LogP = ${logPValue}, fu = ${fractionUnboundPlasma}): V_ss = ${pbpkCalculations.vssEstL.toFixed(1)} L | Kp Cérebro = ${pbpkCalculations.kpBrain.toFixed(3)} (${pbpkCalculations.bhePermeability})\n` +
                `- Farmacodinâmica Hill: EC_50 = ${hillCalculations.apparentEc50.toFixed(1)} nM (Shift = ${hillCalculations.doseRatio.toFixed(2)}x) | Hill n_H = ${hillCoeff}\n` +
                `- QSAR Lipinski Ro5: Violações = ${lipinskiCalculations.violations} | Veredito: ${lipinskiCalculations.druglikenessVerdict}`;
              copyToClipboard(report);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-xs font-mono text-rose-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 p-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl relative z-10">
        <button
          onClick={() => setActiveTab('one-compartment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'one-compartment'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          PK Monocompartimental
        </button>

        <button
          onClick={() => setActiveTab('two-compartment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'two-compartment'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          PK Oral (Bateman)
        </button>

        <button
          onClick={() => setActiveTab('pbpk-partition')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'pbpk-partition'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          Partição PBPK (Órgãos)
        </button>

        <button
          onClick={() => setActiveTab('hill-equation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'hill-equation'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Dose-Resposta (Hill)
        </button>

        <button
          onClick={() => setActiveTab('lipinski-qsar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'lipinski-qsar'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          Drug-likeness (Lipinski Ro5)
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6 relative z-10">
        {/* ========================================================================= */}
        {/* 1. PK MONOCOMPARTIMENTAL */}
        {/* ========================================================================= */}
        {activeTab === 'one-compartment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Parâmetros Farmacocinéticos
                  </h3>
                  <button
                    onClick={() => {
                      setDoseMg(500);
                      setVolumeDistL(35);
                      setClearanceLPerH(3.5);
                      setDosingIntervalHours(12);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Dose por Administração:</span>
                    <span className="text-rose-400 font-bold">{doseMg} mg</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="50"
                    value={doseMg}
                    onChange={(e) => setDoseMg(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Volume de Distribuição (V_d):</span>
                    <span className="text-rose-400 font-bold">{volumeDistL} L</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={volumeDistL}
                    onChange={(e) => setVolumeDistL(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Clearance Sistêmico (CL):</span>
                    <span className="text-rose-400 font-bold">{clearanceLPerH} L/h</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20.0"
                    step="0.5"
                    value={clearanceLPerH}
                    onChange={(e) => setClearanceLPerH(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Intervalo de Posologia (τ):</span>
                    <span className="text-rose-400 font-bold">A cada {dosingIntervalHours} horas</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    step="2"
                    value={dosingIntervalHours}
                    onChange={(e) => setDosingIntervalHours(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-rose-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Meia-Vida de Eliminação (t₁/₂)</span>
                    <span className="text-2xl font-black font-mono text-rose-300">
                      {oneCompCalculations.halfLifeH.toFixed(1)} horas
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      k_e = {oneCompCalculations.ke.toFixed(3)} h⁻¹
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">C_ss Média no Equilíbrio</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {oneCompCalculations.cssAvg.toFixed(2)} µg/mL
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Faixa: {oneCompCalculations.cssMin.toFixed(2)} a {oneCompCalculations.cssMax.toFixed(2)} µg/mL
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Pico Inicial (C₀ = Dose / V_d)</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {oneCompCalculations.c0.toFixed(2)} µg/mL
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Concentração imediata pós-bolus
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Índice de Acúmulo (R_acc)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {oneCompCalculations.accumulationFactor.toFixed(2)}x
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Acúmulo corporal até o estado estacionário
                    </span>
                  </div>
                </div>

                {/* Gráfico Curva Doses Múltiplas SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Perfil Temporal de Doses Repetidas C(t) no Estado Estacionário</span>
                    <span className="text-rose-400">Escala de 0 a 48h</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Linha de C_ss_avg */}
                    <line
                      x1="30"
                      y1={110 - Math.min(100, (oneCompCalculations.cssAvg / (oneCompCalculations.cssMax * 1.2)) * 100)}
                      x2="480"
                      y2={110 - Math.min(100, (oneCompCalculations.cssAvg / (oneCompCalculations.cssMax * 1.2)) * 100)}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                    />
                    <text x="35" y={105 - Math.min(100, (oneCompCalculations.cssAvg / (oneCompCalculations.cssMax * 1.2)) * 100)} fill="#f59e0b" fontSize="8" fontFamily="monospace">C_ss_avg</text>

                    {/* Curva dente de serra */}
                    <path
                      d={oneCompCalculations.timePoints.reduce((acc, pt, idx) => {
                        const x = 30 + (pt.t / 48.0) * 440;
                        const y = 110 - (pt.c / (oneCompCalculations.cssMax * 1.2)) * 95;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                      }, '')}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PK ORAL BICOMPARTIMENTAL (BATEMAN) */}
        {/* ========================================================================= */}
        {activeTab === 'two-compartment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" /> Parâmetros de Absorção & Distribuição
                  </h3>
                  <button
                    onClick={() => {
                      setOralDoseMg(250);
                      setBioavailabilityF(0.85);
                      setKaRateH(1.5);
                      setVCentralL(15);
                      setClearanceOralLH(2.5);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Dose Oral Administrada:</span>
                    <span className="text-cyan-400 font-bold">{oralDoseMg} mg</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={oralDoseMg}
                    onChange={(e) => setOralDoseMg(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Biodisponibilidade Oral (F):</span>
                    <span className="text-cyan-400 font-bold">{(bioavailabilityF * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={bioavailabilityF}
                    onChange={(e) => setBioavailabilityF(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Constante de Absorção (k_a):</span>
                    <span className="text-cyan-400 font-bold">{kaRateH} h⁻¹</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={kaRateH}
                    onChange={(e) => setKaRateH(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Absorção gástrica/intestinal rápida vs lenta
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Tempo de Pico (T_max)</span>
                    <span className="text-2xl font-black font-mono text-cyan-300">
                      {twoCompCalculations.tMaxH.toFixed(2)} horas
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Ponto de equilíbrio dC/dt = 0
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Concentração Pico (C_max)</span>
                    <span className="text-2xl font-bold font-mono text-purple-400">
                      {twoCompCalculations.cMax.toFixed(2)} µg/mL
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Dose absorvida F·D = {(bioavailabilityF * oralDoseMg).toFixed(0)} mg
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Fase de Distribuição (t₁/₂ α)</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {twoCompCalculations.tHalfAlpha.toFixed(2)} horas
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Equilíbrio rápido tecido-sangue
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Meia-Vida Terminal (t₁/₂ β)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {twoCompCalculations.tHalfBeta.toFixed(1)} horas
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Eliminação corporal real
                    </span>
                  </div>
                </div>

                {/* Curva de Bateman Oral SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Curva de Absorção e Eliminação Oral C(t) [Função de Bateman]</span>
                    <span className="text-cyan-400">Escala de 0 a 24h</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Linha T_max */}
                    <line
                      x1={30 + (twoCompCalculations.tMaxH / 24.0) * 440}
                      y1="15"
                      x2={30 + (twoCompCalculations.tMaxH / 24.0) * 440}
                      y2="105"
                      stroke="#06b6d4"
                      strokeDasharray="2 2"
                    />

                    {/* Curva de concentração */}
                    <path
                      d={twoCompCalculations.oralPoints.reduce((acc, pt, idx) => {
                        const x = 30 + (pt.t / 24.0) * 440;
                        const y = 105 - (pt.c / (twoCompCalculations.cMax * 1.15)) * 90;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                      }, '')}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />

                    {/* Ponto C_max */}
                    <circle
                      cx={30 + (twoCompCalculations.tMaxH / 24.0) * 440}
                      cy={105 - (1 / 1.15) * 90}
                      r="4"
                      fill="#f43f5e"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PARTIÇÃO TECIDUAL PBPK */}
        {/* ========================================================================= */}
        {activeTab === 'pbpk-partition' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Propriedades Físico-Químicas do Fármaco
                  </h3>
                  <button
                    onClick={() => {
                      setDrugType('basic');
                      setLogPValue(3.2);
                      setPKaValue(8.5);
                      setFractionUnboundPlasma(0.1);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">Natureza Iônica da Molécula:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['basic', 'neutral', 'acidic'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setDrugType(t)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                          drugType === t
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {t === 'basic' ? 'Base Fraca' : t === 'neutral' ? 'Neutro' : 'Ácido Fraco'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Lipofilicidade (LogP):</span>
                    <span className="text-purple-400 font-bold">{logPValue}</span>
                  </div>
                  <input
                    type="range"
                    min="-1.0"
                    max="5.5"
                    step="0.1"
                    value={logPValue}
                    onChange={(e) => setLogPValue(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Fração Livre no Plasma (f_u):</span>
                    <span className="text-purple-400 font-bold">{(fractionUnboundPlasma * 100).toFixed(0)}% livre</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="1.0"
                    step="0.02"
                    value={fractionUnboundPlasma}
                    onChange={(e) => setFractionUnboundPlasma(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Ligação a proteínas plasmáticas (albumina / AAG): {((1 - fractionUnboundPlasma) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-purple-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Volume de Distribuição PBPK (V_ss)</span>
                  <span className="text-3xl font-black font-mono text-purple-300">
                    {pbpkCalculations.vssEstL.toFixed(1)} Litros
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Equivalente a {(pbpkCalculations.vssEstL / 70.0).toFixed(2)} L/kg no adulto de 70 kg
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px] uppercase">Cérebro (K_p)</div>
                    <div className="text-cyan-400 font-bold text-sm mt-1">{pbpkCalculations.kpBrain.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{pbpkCalculations.bhePermeability}</div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px] uppercase">Fígado (K_p)</div>
                    <div className="text-rose-400 font-bold text-sm mt-1">{pbpkCalculations.kpLiver.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Metabolismo Hepático</div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px] uppercase">Rins (K_p)</div>
                    <div className="text-amber-400 font-bold text-sm mt-1">{pbpkCalculations.kpKidney.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Filtração Glomerular</div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px] uppercase">Tecido Adiposo (K_p)</div>
                    <div className="text-emerald-400 font-bold text-sm mt-1">{pbpkCalculations.kpAdipose.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Depósito Lipídico</div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg col-span-2 sm:col-span-2">
                    <div className="text-slate-400 text-[10px] uppercase">Músculo Esquelético (K_p)</div>
                    <div className="text-indigo-400 font-bold text-sm mt-1">{pbpkCalculations.kpMuscle.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Maior reservatório periférico (29 L)</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Modelo Mecanicista de Rodgers & Rowland (2006)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A partição tecido-plasma resulta do balanço entre ligação hidrofóbica a lipídios neutros, partição eletrostática em fosfolipídios acídicos de membrana celular e partição livre na água intracelular/extracelular modulada pela fração não-ionizada em pH 7.4.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DOSE-RESPOSTA SIGMOIDE DE HILL */}
        {/* ========================================================================= */}
        {activeTab === 'hill-equation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros Farmacodinâmicos
                  </h3>
                  <button
                    onClick={() => {
                      setEc50NanoMolar(50);
                      setHillCoeff(1.5);
                      setEMaxPercent(100);
                      setAntagonistConc(0);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Potência Intrínseca (EC₅₀):</span>
                    <span className="text-emerald-400 font-bold">{ec50NanoMolar} nM</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    step="5"
                    value={ec50NanoMolar}
                    onChange={(e) => setEc50NanoMolar(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Coeficiente de Hill (n_H):</span>
                    <span className="text-emerald-400 font-bold">{hillCoeff}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={hillCoeff}
                    onChange={(e) => setHillCoeff(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    n_H &gt; 1: Cooperatividade Positiva (Chave Liga/Desliga Rápida)
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Concentração de Antagonista Competitivo:</span>
                    <span className="text-emerald-400 font-bold">{antagonistConc} nM</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={antagonistConc}
                    onChange={(e) => setAntagonistConc(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    K_B do antagonista = {antagonistKb} nM (Equação de Schild)
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">EC₅₀ Aparente (com Antagonista)</span>
                    <span className="text-2xl font-black font-mono text-emerald-300">
                      {hillCalculations.apparentEc50.toFixed(1)} nM
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Deslocamento para a direita: {hillCalculations.doseRatio.toFixed(2)}x
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Eficácia Máxima (E_max)</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {eMaxPercent}% Resposta
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Agonista Pleno (Preserva E_max com antagonista competitivo)
                    </span>
                  </div>
                </div>

                {/* Curva Sigmoide Semi-Logarítmica SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Curva Concentração-Efeito Semi-Logarítmica (E vs log[C])</span>
                    <span className="text-emerald-400">Verde: Agonista Puro | Azul: + Antagonista</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    <line x1="30" y1="105" x2="480" y2="105" stroke="#334155" />
                    <line x1="30" y1="15" x2="480" y2="15" stroke="#334155" strokeDasharray="3 3" />
                    <text x="10" y="20" fill="#64748b" fontSize="8" fontFamily="monospace">100%</text>

                    {/* Curva 1: Agonista Puro */}
                    <path
                      d={hillCalculations.curvePoints.reduce((acc, pt, idx) => {
                        const x = 30 + ((pt.logC + 1) / 5.0) * 440;
                        const y = 105 - (pt.effect / 100) * 90;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                      }, '')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {/* Curva 2: Com Antagonista (deslocada) */}
                    {antagonistConc > 0 && (
                      <path
                        d={hillCalculations.curvePoints.reduce((acc, pt, idx) => {
                          const x = 30 + ((pt.logC + 1) / 5.0) * 440;
                          const y = 105 - (pt.effectShifted / 100) * 90;
                          return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                        }, '')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. AVALIADOR QSAR & REGRA DOS CINCO DE LIPINSKI */}
        {/* ========================================================================= */}
        {activeTab === 'lipinski-qsar' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Pill className="w-4 h-4" /> Parâmetros Moleculares (QSAR)
                  </h3>
                  <button
                    onClick={() => {
                      setMolWeight(385);
                      setLogPInput(2.8);
                      setHbdCount(2);
                      setHbaCount(6);
                      setTpsaArea(75);
                      setRotBonds(4);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Peso Molecular (MW):</span>
                    <span className={`font-bold ${molWeight <= 500 ? 'text-amber-400' : 'text-rose-400'}`}>{molWeight} Da</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="800"
                    step="10"
                    value={molWeight}
                    onChange={(e) => setMolWeight(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block">Critério Lipinski: ≤ 500 Da</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Lipofilicidade (LogP):</span>
                    <span className={`font-bold ${logPInput <= 5.0 ? 'text-amber-400' : 'text-rose-400'}`}>{logPInput}</span>
                  </div>
                  <input
                    type="range"
                    min="-1.0"
                    max="8.0"
                    step="0.2"
                    value={logPInput}
                    onChange={(e) => setLogPInput(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block">Critério Lipinski: ≤ 5.0</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Doadores de Hidrogênio (HBD):</span>
                    <span className={`font-bold ${hbdCount <= 5 ? 'text-amber-400' : 'text-rose-400'}`}>{hbdCount}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={hbdCount}
                    onChange={(e) => setHbdCount(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block">Critério Lipinski: ≤ 5</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Aceptores de Hidrogênio (HBA):</span>
                    <span className={`font-bold ${hbaCount <= 10 ? 'text-amber-400' : 'text-rose-400'}`}>{hbaCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={hbaCount}
                    onChange={(e) => setHbaCount(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block">Critério Lipinski: ≤ 10</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span className="text-slate-400">Área Polar Superficial (TPSA):</span>
                    <span className={`font-bold ${tpsaArea <= 140 ? 'text-amber-400' : 'text-rose-400'}`}>{tpsaArea} Å²</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="220"
                    step="5"
                    value={tpsaArea}
                    onChange={(e) => setTpsaArea(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block">Critério Veber: ≤ 140 Å²</span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Avaliação de Drug-Likeness Oral</span>
                  <span className={`text-xl font-bold font-mono block mt-1 ${lipinskiCalculations.verdictColor}`}>
                    {lipinskiCalculations.druglikenessVerdict}
                  </span>
                  <span className="text-xs text-slate-400 block mt-2">
                    Violações da Regra de 5: {lipinskiCalculations.violations} de 4 (Tolerância máxima: 1 violação)
                  </span>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-2">Checklist de Conformidade Físico-Química</div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span>Massa Molecular ≤ 500 Da</span>
                      <span className={molWeight <= 500 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{molWeight <= 500 ? '✓ Aprovado' : '✗ Violado'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span>Lipofilicidade LogP ≤ 5.0</span>
                      <span className={logPInput <= 5.0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{logPInput <= 5.0 ? '✓ Aprovado' : '✗ Violado'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span>Doadores de H (HBD) ≤ 5</span>
                      <span className={hbdCount <= 5 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{hbdCount <= 5 ? '✓ Aprovado' : '✗ Violado'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span>Aceptores de H (HBA) ≤ 10</span>
                      <span className={hbaCount <= 10 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{hbaCount <= 10 ? '✓ Aprovado' : '✗ Violado'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span>Critério Veber TPSA ≤ 140 Å²</span>
                      <span className={tpsaArea <= 140 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{tpsaArea <= 140 ? '✓ Aprovado' : '✗ Violado'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-rose-400" />
          <span>Fórmulas farmacocinéticas e farmacodinâmicas derivadas dos modelos de Bateman, Hill e Rodgers-Rowland.</span>
        </div>
        <div className="text-slate-400">
          Holding V5 Apollo · 100% Client-Side Engine
        </div>
      </div>
    </div>
  );
}
