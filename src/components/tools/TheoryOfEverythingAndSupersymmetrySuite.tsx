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
  ShieldAlert
} from 'lucide-react';

export function TheoryOfEverythingAndSupersymmetrySuite({
  defaultTab = 'susy-mssm'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'susy-mssm' | 'neutrino-seesaw' | 'string-landscape' | 'chern-simons' | 'desitter-thermodynamics'
  >(() => {
    if (defaultTab === 'neutrino-seesaw-mechanism' || defaultTab === 'neutrino-seesaw') return 'neutrino-seesaw';
    if (defaultTab === 'string-landscape-multiverse-vacuum' || defaultTab === 'string-landscape') return 'string-landscape';
    if (defaultTab === 'chern-simons-topological-invariants' || defaultTab === 'chern-simons') return 'chern-simons';
    if (defaultTab === 'desitter-spacetime-thermodynamics' || defaultTab === 'desitter-thermodynamics') return 'desitter-thermodynamics';
    return 'susy-mssm';
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 1: QUEBRA DE SUPERSIMETRIA (SUSY MSSM) & ESPECTRO DE ESPARTÍCULAS
  // -------------------------------------------------------------
  const [mSusy, setMSusy] = useState<number>(2500); // GeV
  const [tanBeta, setTanBeta] = useState<number>(10);
  const [muParam, setMuParam] = useState<number>(600); // GeV
  const [m1Bino, setM1Bino] = useState<number>(350); // GeV
  const [m2Wino, setM2Wino] = useState<number>(700); // GeV
  const [m3Gluino, setM3Gluino] = useState<number>(2200); // GeV
  const [atMix, setAtMix] = useState<number>(3000); // GeV (Stop trilinear)

  const susyCalculations = useMemo(() => {
    // Massa do Higgs leve no MSSM com correções radiativas de 1-loop (top/stop)
    const mZ = 91.1876; // GeV
    const mt = 172.76; // GeV
    const v = 246.22; // GeV
    const beta = Math.atan(tanBeta);
    const cos2Beta = Math.cos(2 * beta);

    const xt = atMix - muParam / tanBeta;
    const xt2OverM2 = (xt * xt) / (mSusy * mSusy);
    const radCorrection =
      ((3 * Math.pow(mt, 4)) / (2 * Math.PI * Math.PI * v * v)) *
      (Math.log((mSusy * mSusy) / (mt * mt)) + xt2OverM2 * (1 - xt2OverM2 / 12));

    const mh2Tree = mZ * mZ * cos2Beta * cos2Beta;
    const mhTotal = Math.sqrt(Math.max(0, mh2Tree + radCorrection));

    // Massa do LSP (Lightest Neutralino chi1_0) - aproximação diagonal dominante
    const neutralino1 = Math.min(Math.abs(m1Bino), Math.abs(muParam) * 0.95);
    const neutralino2 = Math.min(Math.max(Math.abs(m1Bino), Math.abs(m2Wino)), Math.abs(muParam) * 1.05);
    const chargino1 = Math.min(Math.abs(m2Wino), Math.abs(muParam));

    // Massas de Squarks e Sleptons aproximadas
    const mStop1 = Math.sqrt(Math.max(0, mSusy * mSusy + mt * mt - Math.abs(mt * xt)));
    const mStop2 = Math.sqrt(mSusy * mSusy + mt * mt + Math.abs(mt * xt));
    const mSelectron = Math.sqrt(mSusy * mSusy * 0.7);

    // Densidade relíquia térmica estimada de matéria escura Omega_DM * h^2
    // Se LSP for Bino puro: aniquilação via t-channel slepton exchange ~ m_chi^2 / m_slep^4
    const sigmaAnn = 1e-26 / (1 + Math.pow(neutralino1 / 500, 2)); // cm^3/s approx
    const omegaDM = (0.12 * (3e-26)) / Math.max(1e-28, sigmaAnn);
    const reliqueStatus =
      omegaDM > 0.14 ? 'Sobredensidade (Universo Fechado/Incompatível)' :
      omegaDM < 0.10 ? 'Subdensidade (Requer Matéria Escura adicional)' : 'Conforme com Planck 2018 (Ω_c h² ≈ 0.120)';

    return {
      mhTotal,
      neutralino1,
      neutralino2,
      chargino1,
      mStop1,
      mStop2,
      mSelectron,
      omegaDM: Math.min(1.5, omegaDM),
      reliqueStatus,
      xt
    };
  }, [mSusy, tanBeta, muParam, m1Bino, m2Wino, atMix]);

  // -------------------------------------------------------------
  // TAB 2: MECANISMO DE GANGORRA (SEESAW) & MASSA DOS NEUTRINOS
  // -------------------------------------------------------------
  const [log10MR, setLog10MR] = useState<number>(14); // log10(M_R in GeV), escala GUT 10^14
  const [yukawaNu, setYukawaNu] = useState<number>(0.1);
  const [seesawType, setSeesawType] = useState<'type1' | 'type2' | 'type3'>('type1');

  const seesawCalculations = useMemo(() => {
    const vHiggs = 246.22; // GeV
    const MR = Math.pow(10, log10MR); // GeV

    // Massa de Dirac dos neutrinos
    const mDirac = (yukawaNu * vHiggs) / Math.SQRT2; // GeV

    // Tipo I: m_nu = m_D^2 / M_R
    // Tipo II: acoplamento de triplete escalar Delta com VEV v_L ~ v^2 / M_Delta
    // Tipo III: tripletes de férmions Sigma_R
    let mNuLightGeV = 0;
    if (seesawType === 'type1') {
      mNuLightGeV = (mDirac * mDirac) / MR;
    } else if (seesawType === 'type2') {
      mNuLightGeV = (mDirac * mDirac * 1.5) / MR;
    } else {
      mNuLightGeV = (mDirac * mDirac * 0.8) / MR;
    }

    const mNuLightEV = mNuLightGeV * 1e9; // 1 GeV = 10^9 eV
    const mNuLightMilliEV = mNuLightEV * 1000;

    // Delta m^2 atmosférico (~ 2.5e-3 eV^2) -> m_nu3 ~ 0.05 eV
    // Delta m^2 solar (~ 7.5e-5 eV^2) -> m_nu2 ~ 0.0086 eV
    const planckLimitEV = 0.12; // sum m_nu < 0.12 eV (Planck 2018 + BAO)
    const isWithinPlanck = mNuLightEV < planckLimitEV;

    // Assimetria de Leptogênese térmica (parâmetro de violação CP epsilon_1)
    // epsilon_1 ~ (3 / 16*pi) * (M_1 / v^2) * m_nu_atm
    const epsilonCP = (3 / (16 * Math.PI)) * (MR / Math.pow(vHiggs, 2)) * 0.05 * 1e-9;
    const baryonAsymmetryEtaB = Math.min(1e-8, Math.abs(epsilonCP) * 1e-2);

    return {
      mDirac,
      mNuLightEV,
      mNuLightMilliEV,
      isWithinPlanck,
      MR,
      epsilonCP,
      baryonAsymmetryEtaB
    };
  }, [log10MR, yukawaNu, seesawType]);

  // -------------------------------------------------------------
  // TAB 3: PAISAGEM DE CORDAS (STRING LANDSCAPE) & VÁCUOS DE CALABI-YAU
  // -------------------------------------------------------------
  const [b3Cycles, setB3Cycles] = useState<number>(100); // 2*(h2,1 + 1)
  const [fluxStates, setFluxStates] = useState<number>(10); // estados quânticos por ciclo
  const [lambdaBare, setLambdaBare] = useState<number>(-1.0); // energia de vácuo nua em M_P^4

  const landscapeCalculations = useMemo(() => {
    // Número total de vácuos Bousso-Polchinski: N_vac = (2*K)^b3 ou K^b3
    // Usamos notação logarítmica para evitar overflow de 10^500
    const log10TotalVacua = b3Cycles * Math.log10(fluxStates);
    
    // Espaçamento médio de vácuo: delta_Lambda ~ 1 / N_vac
    // Constante cosmológica observada Lambda_obs / M_P^4 ~ 10^-122
    const log10ObsLambda = -122;
    const fineTuningRatio = Math.max(0, log10TotalVacua - 122);

    // Janela antrópica de Weinberg para formação de estruturas
    // Lambda_min ~ -10^-121, Lambda_max ~ +10^-120
    const weinbergAllowedProb = 1 - Math.exp(-Math.pow(10, Math.min(2, log10TotalVacua - 120)));

    return {
      log10TotalVacua,
      fineTuningRatio,
      weinbergAllowedProb,
      landscapeString: log10TotalVacua >= 500 ? '10^500+ (Paisagem Canônica de Susskind)' : `10^${log10TotalVacua.toFixed(0)} Vácuos de Calabi-Yau`
    };
  }, [b3Cycles, fluxStates, lambdaBare]);

  // -------------------------------------------------------------
  // TAB 4: TEORIA DE CHERN-SIMONS & TERMOS TOPOLÓGICOS
  // -------------------------------------------------------------
  const [csLevelK, setCsLevelK] = useState<number>(2); // nível k in Z
  const [gaugeGroup, setGaugeGroup] = useState<'SU(2)' | 'SU(3)' | 'U(1)'>('SU(2)');
  const [knotType, setKnotType] = useState<'trefoil' | 'figure8' | 'hopf'>('trefoil');

  const chernSimonsCalculations = useMemo(() => {
    // Número dual de Coxeter c_v
    const cV = gaugeGroup === 'SU(2)' ? 2 : gaugeGroup === 'SU(3)' ? 3 : 0;
    const effectiveLevel = csLevelK + cV;
    const qPhase = (2 * Math.PI) / effectiveLevel; // q = exp(2*pi*i / (k+cV))

    // Polinômio de Jones V(q) para nós clássicos
    // Trefoil (3_1): V(t) = -t^-4 + t^-3 + t^-1
    // Figure-8 (4_1): V(t) = t^2 - t + 1 - t^-1 + t^-2
    // Hopf link (2_1^2): V(t) = -t^(5/2) - t^(1/2)
    let jonesEval = '';
    let anyonPhaseRad = Math.PI / csLevelK; // fase estatística fracionária theta = pi/k
    let hallConductance = `(1 / ${csLevelK}) · (e²/h)`;

    if (knotType === 'trefoil') {
      jonesEval = `V_{3₁}(q) = -q⁻⁴ + q⁻³ + q⁻¹ [q = e^{i·${qPhase.toFixed(3)}}]`;
    } else if (knotType === 'figure8') {
      jonesEval = `V_{4₁}(q) = q² - q + 1 - q⁻¹ + q⁻² (Nó Amfiquiral)`;
    } else {
      jonesEval = `V_{Hopf}(q) = -q^{5/2} - q^{1/2} (Enlace de 2 Círculos)`;
    }

    return {
      cV,
      effectiveLevel,
      qPhase,
      jonesEval,
      anyonPhaseRad,
      anyonPhaseDeg: (anyonPhaseRad * 180) / Math.PI,
      hallConductance
    };
  }, [csLevelK, gaugeGroup, knotType]);

  // -------------------------------------------------------------
  // TAB 5: TERMODINÂMICA DO ESPAÇO DE DE SITTER
  // -------------------------------------------------------------
  const [h0Value, setH0Value] = useState<number>(67.4); // km/s/Mpc (Planck 2018)

  const deSitterCalculations = useMemo(() => {
    // Conversão de H0 para s^-1
    // 1 Mpc = 3.085677581e19 km
    const H0Si = (h0Value * 1e3) / 3.085677581e22; // s^-1
    const c = 2.99792458e8; // m/s
    const hbar = 1.054571817e-34; // J s
    const kB = 1.380649e-23; // J/K
    const G = 6.6743e-11; // m^3 kg^-1 s^-2
    const lP = Math.sqrt((hbar * G) / Math.pow(c, 3)); // Planck length ~ 1.616e-35 m

    // Raio do horizonte cosmológico de De Sitter r_dS = c / H
    const rDSMeters = c / H0Si;
    const rDSGigaLy = (rDSMeters / 9.461e15) / 1e9; // bilhões de anos-luz

    // Área do horizonte cosmológico A = 4 * pi * r_dS^2
    const horizonArea = 4 * Math.PI * rDSMeters * rDSMeters;

    // Temperatura de Gibbons-Hawking T_dS = hbar * H / (2 * pi * kB)
    const tGibbonsHawking = (hbar * H0Si) / (2 * Math.PI * kB);

    // Entropia de De Sitter S_dS = kB * A / (4 * lP^2)
    const sDeSitterInKB = horizonArea / (4 * lP * lP);
    const log10SDeSitter = Math.log10(sDeSitterInKB);

    // Constante Cosmológica Lambda = 3 * H^2 / c^2
    const lambdaCosmo = (3 * H0Si * H0Si) / (c * c);

    return {
      rDSMeters,
      rDSGigaLy,
      horizonArea,
      tGibbonsHawking,
      sDeSitterInKB,
      log10SDeSitter,
      lambdaCosmo
    };
  }, [h0Value]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
              Capitania #11 · Grande Marco 500 Ferramentas
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Teoria de Tudo & Supersimetria
            </span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            Suíte de Teoria de Tudo, Supersimetria & Espaço de De Sitter
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Modelagem da quebra de SUSY MSSM, mecanismo de gangorra para neutrinos, densidade da Paisagem de Cordas (10⁵⁰⁰ vácuos), invariantes de Chern-Simons e horizonte de De Sitter.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const report = `[Relatório Teórico - Etapa 98 (Marco 500 Ferramentas)]\n` +
                `- Higgs Leve mh: ${susyCalculations.mhTotal.toFixed(2)} GeV (Alvo: 125.1 GeV)\n` +
                `- Massa Neutrino Leve (Seesaw Tipo I): ${susyCalculations.mStop1 ? (seesawCalculations.mNuLightMilliEV).toFixed(3) : 0} meV\n` +
                `- Vácuos da Paisagem de Cordas: 10^${landscapeCalculations.log10TotalVacua.toFixed(0)}\n` +
                `- Nível Chern-Simons k: ${csLevelK} (${gaugeGroup}) -> Fase Anyônica: ${chernSimonsCalculations.anyonPhaseDeg.toFixed(1)}°\n` +
                `- Horizonte de De Sitter: ${deSitterCalculations.rDSGigaLy.toFixed(2)} Gly | T_dS: ${deSitterCalculations.tGibbonsHawking.toExponential(3)} K | S_dS: 10^${deSitterCalculations.log10SDeSitter.toFixed(1)} k_B`;
              copyToClipboard(report);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-xs font-mono text-purple-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 p-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl relative z-10">
        <button
          onClick={() => setActiveTab('susy-mssm')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'susy-mssm'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Quebra SUSY & MSSM
        </button>

        <button
          onClick={() => setActiveTab('neutrino-seesaw')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'neutrino-seesaw'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Mecanismo Gangorra (Seesaw)
        </button>

        <button
          onClick={() => setActiveTab('string-landscape')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'string-landscape'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          Paisagem de Cordas (10⁵⁰⁰)
        </button>

        <button
          onClick={() => setActiveTab('chern-simons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'chern-simons'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Invariantes Chern-Simons
        </button>

        <button
          onClick={() => setActiveTab('desitter-thermodynamics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'desitter-thermodynamics'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Espaço de De Sitter
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6 relative z-10">
        {/* ========================================================================= */}
        {/* 1. QUEBRA DE SUPERSIMETRIA & MSSM */}
        {/* ========================================================================= */}
        {activeTab === 'susy-mssm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros de Quebra Suave (MSSM)
                  </h3>
                  <button
                    onClick={() => {
                      setMSusy(2500);
                      setTanBeta(10);
                      setMuParam(600);
                      setM1Bino(350);
                      setM2Wino(700);
                      setM3Gluino(2200);
                      setAtMix(3000);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Escala de SUSY (M_SUSY):</span>
                    <span className="text-purple-400 font-bold">{mSusy} GeV</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="6000"
                    step="100"
                    value={mSusy}
                    onChange={(e) => setMSusy(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Razão de VEVs (tan β = v_u / v_d):</span>
                    <span className="text-purple-400 font-bold">{tanBeta}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={tanBeta}
                    onChange={(e) => setTanBeta(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Massa de Higgsino (μ):</span>
                    <span className="text-purple-400 font-bold">{muParam} GeV</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    step="50"
                    value={muParam}
                    onChange={(e) => setMuParam(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Massa de Gaugino Bino (M₁):</span>
                    <span className="text-purple-400 font-bold">{m1Bino} GeV</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="25"
                    value={m1Bino}
                    onChange={(e) => setM1Bino(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Trilinear Stop Mixing (A_t):</span>
                    <span className="text-purple-400 font-bold">{atMix} GeV</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="6000"
                    step="100"
                    value={atMix}
                    onChange={(e) => setAtMix(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Visualização do Espectro */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-900/60 border border-purple-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Massa Higgs Leve (m_h)</span>
                    <span className="text-xl font-bold font-mono text-purple-300">
                      {susyCalculations.mhTotal.toFixed(2)} GeV
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Alvo LHC: 125.10 ± 0.14 GeV
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">LSP (Neutrino Mais Leve χ̃₁⁰)</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      {susyCalculations.neutralino1.toFixed(1)} GeV
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Candidato Matéria Escura
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Stop Leve (t̃₁)</span>
                    <span className="text-xl font-bold font-mono text-pink-400">
                      {susyCalculations.mStop1.toFixed(1)} GeV
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Squark de 3ª Geração
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Chargino Mais Leve (χ̃₁⁺)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {susyCalculations.chargino1.toFixed(1)} GeV
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Wino / Higgsino carregado
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl col-span-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Densidade Térmica Relíquia (Ω_χ h²)</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {susyCalculations.omegaDM.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {susyCalculations.reliqueStatus}
                    </span>
                  </div>
                </div>

                {/* Gráfico do Espectro de Massa SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
                    <span>Hierarquia de Massas das Espartículas (MSSM)</span>
                    <span className="text-purple-400">Eixo Y: Energia (GeV)</span>
                  </div>

                  <svg viewBox="0 0 600 180" className="w-full h-44 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Linhas de grade horizontais */}
                    <line x1="50" y1="150" x2="570" y2="150" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="50" y1="90" x2="570" y2="90" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="50" y1="30" x2="570" y2="30" stroke="#334155" strokeDasharray="3 3" />

                    <text x="15" y="153" fill="#64748b" fontSize="10" fontFamily="monospace">0</text>
                    <text x="10" y="93" fill="#64748b" fontSize="10" fontFamily="monospace">2000</text>
                    <text x="10" y="33" fill="#64748b" fontSize="10" fontFamily="monospace">4000</text>

                    {/* Barra 1: Higgs Leve (h) */}
                    <g transform="translate(80, 0)">
                      <rect
                        x="0"
                        y={150 - (susyCalculations.mhTotal / 4000) * 120}
                        width="45"
                        height={(susyCalculations.mhTotal / 4000) * 120}
                        fill="#a855f7"
                        rx="4"
                      />
                      <text x="22" y="165" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">h (Higgs)</text>
                      <text x="22" y={145 - (susyCalculations.mhTotal / 4000) * 120} textAnchor="middle" fill="#d8b4fe" fontSize="9" fontFamily="monospace">
                        {susyCalculations.mhTotal.toFixed(0)}
                      </text>
                    </g>

                    {/* Barra 2: Neutralino 1 (LSP) */}
                    <g transform="translate(160, 0)">
                      <rect
                        x="0"
                        y={150 - (susyCalculations.neutralino1 / 4000) * 120}
                        width="45"
                        height={(susyCalculations.neutralino1 / 4000) * 120}
                        fill="#06b6d4"
                        rx="4"
                      />
                      <text x="22" y="165" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">χ̃₁⁰ (LSP)</text>
                      <text x="22" y={145 - (susyCalculations.neutralino1 / 4000) * 120} textAnchor="middle" fill="#67e8f9" fontSize="9" fontFamily="monospace">
                        {susyCalculations.neutralino1.toFixed(0)}
                      </text>
                    </g>

                    {/* Barra 3: Chargino 1 */}
                    <g transform="translate(240, 0)">
                      <rect
                        x="0"
                        y={150 - (susyCalculations.chargino1 / 4000) * 120}
                        width="45"
                        height={(susyCalculations.chargino1 / 4000) * 120}
                        fill="#f59e0b"
                        rx="4"
                      />
                      <text x="22" y="165" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">χ̃₁⁺</text>
                      <text x="22" y={145 - (susyCalculations.chargino1 / 4000) * 120} textAnchor="middle" fill="#fcd34d" fontSize="9" fontFamily="monospace">
                        {susyCalculations.chargino1.toFixed(0)}
                      </text>
                    </g>

                    {/* Barra 4: Stop Leve t1 */}
                    <g transform="translate(320, 0)">
                      <rect
                        x="0"
                        y={150 - (susyCalculations.mStop1 / 4000) * 120}
                        width="45"
                        height={(susyCalculations.mStop1 / 4000) * 120}
                        fill="#ec4899"
                        rx="4"
                      />
                      <text x="22" y="165" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">t̃₁ (Stop)</text>
                      <text x="22" y={145 - (susyCalculations.mStop1 / 4000) * 120} textAnchor="middle" fill="#f472b6" fontSize="9" fontFamily="monospace">
                        {susyCalculations.mStop1.toFixed(0)}
                      </text>
                    </g>

                    {/* Barra 5: Gluino g */}
                    <g transform="translate(400, 0)">
                      <rect
                        x="0"
                        y={150 - (m3Gluino / 4000) * 120}
                        width="45"
                        height={(m3Gluino / 4000) * 120}
                        fill="#10b981"
                        rx="4"
                      />
                      <text x="22" y="165" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">g̃ (Gluino)</text>
                      <text x="22" y={145 - (m3Gluino / 4000) * 120} textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace">
                        {m3Gluino}
                      </text>
                    </g>

                    {/* Barra 6: Stop Pesado t2 */}
                    <g transform="translate(480, 0)">
                      <rect
                        x="0"
                        y={150 - (Math.min(3900, susyCalculations.mStop2) / 4000) * 120}
                        width="45"
                        height={(Math.min(3900, susyCalculations.mStop2) / 4000) * 120}
                        fill="#6366f1"
                        rx="4"
                      />
                      <text x="22" y="165" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">t̃₂ (Heavy)</text>
                      <text x="22" y={145 - (Math.min(3900, susyCalculations.mStop2) / 4000) * 120} textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">
                        {susyCalculations.mStop2.toFixed(0)}
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MECANISMO DE GANGORRA (SEESAW) & NEUTRINOS */}
        {/* ========================================================================= */}
        {activeTab === 'neutrino-seesaw' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Parâmetros da Gangorra de Majorana
                  </h3>
                  <button
                    onClick={() => {
                      setLog10MR(14);
                      setYukawaNu(0.1);
                      setSeesawType('type1');
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">Variante do Mecanismo:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['type1', 'type2', 'type3'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSeesawType(type)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                          seesawType === type
                            ? 'bg-cyan-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {type === 'type1' ? 'Tipo I (N_R)' : type === 'type2' ? 'Tipo II (Δ)' : 'Tipo III (Σ)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Escala de Majorana (M_R):</span>
                    <span className="text-cyan-400 font-bold">10^{log10MR} GeV</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="16"
                    step="0.5"
                    value={log10MR}
                    onChange={(e) => setLog10MR(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Escala GUT canônica: 10¹⁴ a 10¹⁵ GeV
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Acoplamento de Yukawa (y_ν):</span>
                    <span className="text-cyan-400 font-bold">{yukawaNu}</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="1.0"
                    step="0.01"
                    value={yukawaNu}
                    onChange={(e) => setYukawaNu(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Massa do Neutrino Leve (m_ν)</span>
                    <span className="text-2xl font-black font-mono text-cyan-300">
                      {seesawCalculations.mNuLightMilliEV.toFixed(2)} meV
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Equivalente a {seesawCalculations.mNuLightEV.toExponential(3)} eV
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Conformidade Cosmológica</span>
                    <span className={`text-xl font-bold font-mono ${seesawCalculations.isWithinPlanck ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {seesawCalculations.isWithinPlanck ? '✓ Permitido (Planck)' : '✗ Excede Limite (∑m_ν < 0.12 eV)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Limite cosmológico de Planck 2018: &lt; 120 meV
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Massa de Dirac (m_D = y_ν · v / √2)</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {seesawCalculations.mDirac.toFixed(2)} GeV
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      VEV eletrofraco v = 246.2 GeV
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Assimetria Bariônica (Leptogênese)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      η_B ~ {seesawCalculations.baryonAsymmetryEtaB.toExponential(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Valor observado no Universo: ~ 6 × 10⁻¹⁰
                    </span>
                  </div>
                </div>

                {/* Diagrama Conceitual da Gangorra SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    Balanço da Gangorra: m_ν · M_R = m_D² (Constante Eletrofraca)
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Pivô da gangorra */}
                    <polygon points="250,70 235,110 265,110" fill="#475569" />
                    {/* Tábua da gangorra inclinada */}
                    <line x1="70" y1="40" x2="430" y2="100" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" />

                    {/* Peso leve (Neutrino leve m_nu) */}
                    <circle cx="90" cy="30" r="14" fill="#a855f7" />
                    <text x="90" y="34" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">m_ν</text>
                    <text x="90" y="10" textAnchor="middle" fill="#d8b4fe" fontSize="10" fontFamily="monospace">
                      {seesawCalculations.mNuLightMilliEV.toFixed(1)} meV (Subindo)
                    </text>

                    {/* Peso pesado (Férmion de Majorana M_R) */}
                    <circle cx="410" cy="108" r="24" fill="#0ea5e9" />
                    <text x="410" y="112" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">M_R</text>
                    <text x="410" y="75" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      10^{log10MR} GeV (Descendo)
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PAISAGEM DE CORDAS & VÁCUOS (10⁵⁰⁰) */}
        {/* ========================================================================= */}
        {activeTab === 'string-landscape' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                    <Orbit className="w-4 h-4" /> Parâmetros de Compactificação de Fluxo
                  </h3>
                  <button
                    onClick={() => {
                      setB3Cycles(100);
                      setFluxStates(10);
                      setLambdaBare(-1.0);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Ciclos de 3-Esferas em Calabi-Yau (b₃):</span>
                    <span className="text-pink-400 font-bold">{b3Cycles} ciclos</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={b3Cycles}
                    onChange={(e) => setB3Cycles(Number(e.target.value))}
                    className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Tipicamente b₃ = 2 · (h²¹ + 1) varia de 50 a centenas
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Estados de Fluxo por Ciclo (K):</span>
                    <span className="text-pink-400 font-bold">{fluxStates}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={fluxStates}
                    onChange={(e) => setFluxStates(Number(e.target.value))}
                    className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Painel do Multiverso */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-pink-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Densidade da Paisagem de Cordas (Bousso-Polchinski)</span>
                  <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
                    {landscapeCalculations.landscapeString}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    Com {b3Cycles} ciclos independentes e {fluxStates} quanta de fluxo possíveis em cada ciclo, o número de geometrias de vácuo metaestáveis é aproximadamente K^b₃ = 10^{landscapeCalculations.log10TotalVacua.toFixed(0)}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Espaçamento entre Vácuos</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      ΔΛ ~ 10^{(-landscapeCalculations.log10TotalVacua).toFixed(0)} M_P⁴
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Explica a constante cosmológica minúscula (~10⁻¹²² M_P⁴)
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Janela Antrópica de Weinberg</span>
                    <span className="text-lg font-bold font-mono text-amber-400">
                      -10⁻¹²¹ &lt; Λ &lt; 10⁻¹²⁰
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Probabilidade de vida inteligente: {landscapeCalculations.weinbergAllowedProb > 0.99 ? '100% Garantida no Multiverso' : 'Sub-amostrada'}
                    </span>
                  </div>
                </div>

                {/* Mapa Estocástico da Paisagem SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    Distribuição Estocástica de Vácuos & Ponto Antrópico (Nosso Universo)
                  </div>
                  <svg viewBox="0 0 500 130" className="w-full h-32 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Eixo Zero */}
                    <line x1="50" y1="65" x2="470" y2="65" stroke="#475569" strokeWidth="1.5" />
                    <text x="260" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">Λ = 0</text>

                    {/* Faixa Antrópica Estreita */}
                    <rect x="252" y="15" width="16" height="100" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeDasharray="2 2" />
                    <text x="260" y="125" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace">Janela de Vida</text>

                    {/* Pontos de Vácuo Simulados */}
                    {[...Array(40)].map((_, i) => {
                      const seed = (i * 137.5) % 400 + 60;
                      const yPos = (Math.sin(i * 1.7) * 45) + 65;
                      return (
                        <circle
                          key={i}
                          cx={seed}
                          cy={yPos}
                          r="2.5"
                          fill={Math.abs(seed - 260) < 15 ? '#38bdf8' : '#64748b'}
                          opacity={0.7}
                        />
                      );
                    })}

                    {/* Nosso Universo */}
                    <circle cx="262" cy="63" r="5" fill="#f43f5e" />
                    <circle cx="262" cy="63" r="10" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="262" y="45" textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="bold">Nosso Vácuo</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. INVARIANTES TOPOLÓGICOS DE CHERN-SIMONS */}
        {/* ========================================================================= */}
        {activeTab === 'chern-simons' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Parâmetros de Gauge & Topologia
                  </h3>
                  <button
                    onClick={() => {
                      setCsLevelK(2);
                      setGaugeGroup('SU(2)');
                      setKnotType('trefoil');
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">Grupo de Calibre (G):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['SU(2)', 'SU(3)', 'U(1)'] as const).map((group) => (
                      <button
                        key={group}
                        onClick={() => setGaugeGroup(group)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                          gaugeGroup === group
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">Nó Topológico (Knot/Link):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['trefoil', 'figure8', 'hopf'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setKnotType(k)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                          knotType === k
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {k === 'trefoil' ? 'Trevo 3₁' : k === 'figure8' ? 'Oito 4₁' : 'Hopf Link'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Nível Quântico de Chern-Simons (k ∈ ℤ):</span>
                    <span className="text-emerald-400 font-bold">k = {csLevelK}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={csLevelK}
                    onChange={(e) => setCsLevelK(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Quantização invariante sob transformações de gauge grandes (π₃(G) = ℤ)
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Invariante de Witten-Reshetikhin-Turaev & Polinômio de Jones</span>
                  <span className="text-lg font-bold font-mono text-emerald-300 block mt-1">
                    {chernSimonsCalculations.jonesEval}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    Nível efetivo com dual Coxeter number: k + c_v = {chernSimonsCalculations.effectiveLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Fase Estatística Anyônica (θ)</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      {chernSimonsCalculations.anyonPhaseDeg.toFixed(1)}° (π/{csLevelK})
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Estatística fracionária em 2+1 Dimensões
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Condutância Hall Quântica (FQHE)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {chernSimonsCalculations.hallConductance}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Estados de Laughlin com platô topológico
                    </span>
                  </div>
                </div>

                {/* Nó SVG Ilustrativo */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-slate-300 font-bold">Topologia Tridimensional</div>
                    <div className="text-[11px] text-slate-500 max-w-xs">
                      Ação S_CS = (k/4π) ∫ Tr(A ∧ dA + 2/3 A³) gera invariantes invariantes sob difeomorfismos independentes da métrica de fundo g_μν.
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path
                        d="M 50,15 C 65,15 85,35 75,55 C 65,75 35,75 25,55 C 15,35 35,15 50,15 Z"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeDasharray="6 3"
                      />
                      <circle cx="50" cy="50" r="12" fill="none" stroke="#06b6d4" strokeWidth="4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TERMODINÂMICA DO ESPAÇO DE DE SITTER */}
        {/* ========================================================================= */}
        {activeTab === 'desitter-thermodynamics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Parâmetros do Universo Acelerado
                  </h3>
                  <button
                    onClick={() => {
                      setH0Value(67.4);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Constante de Hubble Atual (H₀):</span>
                    <span className="text-amber-400 font-bold">{h0Value} km/s/Mpc</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="0.5"
                    value={h0Value}
                    onChange={(e) => setH0Value(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Valor Planck CMB: 67.4 | SH0ES Cefeidas: 73.0 (Tensão de Hubble)
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Raio do Horizonte de De Sitter (r_dS = c/H)</span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      {deSitterCalculations.rDSGigaLy.toFixed(2)} Gly
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {deSitterCalculations.rDSMeters.toExponential(3)} metros (~4.4 Gpc)
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Temperatura de Gibbons-Hawking (T_dS)</span>
                    <span className="text-2xl font-black font-mono text-cyan-400">
                      {deSitterCalculations.tGibbonsHawking.toExponential(3)} K
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Radiação térmica do horizonte cosmológico
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Entropia Cósmica Holográfica (S_dS)</span>
                    <span className="text-2xl font-black font-mono text-pink-400">
                      10^{deSitterCalculations.log10SDeSitter.toFixed(1)} k_B
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Limite máximo de informação no Universo observável
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Constante Cosmológica Efetiva (Λ)</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {deSitterCalculations.lambdaCosmo.toExponential(3)} m⁻²
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Energia escura com w = -1 exato
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Cenário Assintótico: Morte Térmica & Vácuo de De Sitter Puro
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    À medida que todas as galáxias além do Grupo Local cruzam o horizonte de eventos cosmológico r_dS ({deSitterCalculations.rDSGigaLy.toFixed(1)} bilhões de anos-luz), o Universo se aproxima assintoticamente de uma geometria De Sitter estrita mantida à temperatura ultra-fria de {deSitterCalculations.tGibbonsHawking.toExponential(2)} Kelvin, saturando a entropia holográfica máxima de Bekenstein-Hawking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-purple-400" />
          <span>Fórmulas analíticas derivadas do MSSM, Teoria de Cordas KKLT e Cosmologia de De Sitter.</span>
        </div>
        <div className="text-slate-400">
          Holding V5 Apollo · 100% Client-Side Engine
        </div>
      </div>
    </div>
  );
}
