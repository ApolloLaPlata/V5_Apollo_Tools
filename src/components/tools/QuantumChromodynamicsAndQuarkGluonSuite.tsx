'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Activity,
  Layers,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Info,
  Radio,
  Eye,
  BarChart2,
  Maximize2,
  Circle,
  Share2,
  Compass,
  Zap,
  Globe,
  Atom
} from 'lucide-react';

export function QuantumChromodynamicsAndQuarkGluonSuite({
  defaultTab = 'asymptotic-freedom'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'asymptotic-freedom' | 'cornell-potential' | 'qgp-thermodynamics' | 'deep-inelastic' | 'chiral-symmetry'
  >(() => {
    if (defaultTab === 'cornell-potential-quark-confinement-tool' || defaultTab === 'cornell-potential') return 'cornell-potential';
    if (defaultTab === 'quark-gluon-plasma-thermodynamics-tool' || defaultTab === 'qgp-thermodynamics') return 'qgp-thermodynamics';
    if (defaultTab === 'drell-yan-deep-inelastic-scattering-tool' || defaultTab === 'deep-inelastic') return 'deep-inelastic';
    if (defaultTab === 'chiral-symmetry-breaking-pion-mass-tool' || defaultTab === 'chiral-symmetry') return 'chiral-symmetry';
    return 'asymptotic-freedom';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Constantes Fundamentais */
  const HBAR_C_GEV_FM = 0.197327; // hbar * c em GeV * fm
  const STRING_TENSION_NEWTONS_PER_GEV_FM = 160218; // 1 GeV/fm ~ 1.6e5 N

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: LIBERDADE ASSINTÓTICA & RUNNING COUPLING α_s(Q²) DA QCD      */
  /* -------------------------------------------------------------------------- */
  const [energyScaleQGev, setEnergyScaleQGev] = useState<number>(91.1876); // Escala Z0
  const [numFlavors, setNumFlavors] = useState<number>(5); // 5 sabores ativos (u,d,s,c,b)
  const [lambdaQcdMev, setLambdaQcdMev] = useState<number>(210); // Lambda_MSbar ~ 210 MeV

  const qcdPresets = [
    { label: 'Bóson Z⁰ (LEP / LHC Padrão)', Q: 91.1876, nf: 5, desc: 'Ponto de calibração canônico mundial: αs(MZ) = 0.1180' },
    { label: 'Quark Top (Colisões de Alta Energia)', Q: 173.0, nf: 6, desc: 'Escala mais alta do Modelo Padrão: acoplamento mais fraco' },
    { label: 'Bottomônio Υ (Mésons de Quark b)', Q: 9.46, nf: 5, desc: 'Escala do méson bottom-antibottom: αs ≈ 0.18' },
    { label: 'Charmônio J/ψ (Descoberta da Revolução de Novembro)', Q: 3.10, nf: 4, desc: 'Fronteira entre regime perturbativo e confinamento: αs ≈ 0.25' },
    { label: 'Regime Confinante Não-Perturbativo', Q: 1.2, nf: 3, desc: 'Teoria de perturbação colapsa com acoplamento forte αs > 0.4' }
  ];

  const qcdRunningData = useMemo(() => {
    const Q = Math.max(0.3, energyScaleQGev);
    const Lambda = lambdaQcdMev / 1000; // GeV
    const nf = numFlavors;

    // Coeficientes da função beta da QCD
    // beta0 = 11 - (2/3)*nf
    const beta0 = 11 - (2 / 3) * nf;
    // beta1 = 102 - (38/3)*nf
    const beta1 = 102 - (38 / 3) * nf;

    // Logarítmo de expansão L = ln(Q^2 / Lambda^2) = 2 * ln(Q / Lambda)
    const logQ2Lambda2 = 2 * Math.log(Math.max(1.05, Q / Lambda));

    // αs 1-loop: (4 * pi) / (beta0 * L)
    const alpha_s_1loop = (4 * Math.PI) / (beta0 * logQ2Lambda2);

    // αs 2-loops: (4 * pi) / (beta0 * L) * [ 1 - (beta1 / beta0^2) * ln(L) / L ]
    const correction_2loop = 1 - (beta1 / (beta0 * beta0)) * (Math.log(Math.max(0.1, logQ2Lambda2)) / logQ2Lambda2);
    const alpha_s_2loop = alpha_s_1loop * Math.max(0.5, correction_2loop);

    // Geração de pontos para gráfico de evolução de αs vs log(Q)
    const curvePoints: { q: number; alpha: number }[] = [];
    for (let i = 0; i <= 30; i++) {
      const qVal = Math.pow(10, -0.2 + (i / 30) * 2.7); // de ~0.6 GeV a 300 GeV
      const l = 2 * Math.log(Math.max(1.05, qVal / Lambda));
      const a = (4 * Math.PI) / (beta0 * l);
      curvePoints.push({ q: qVal, alpha: Math.min(1.2, Math.max(0.05, a)) });
    }

    return {
      beta0,
      beta1,
      alpha_s_1loop,
      alpha_s_2loop,
      curvePoints
    };
  }, [energyScaleQGev, numFlavors, lambdaQcdMev]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: POTENCIAL DE CORNELL & CONFINAMENTO DE QUARKS                */
  /* -------------------------------------------------------------------------- */
  const [stringTensionGevFm, setStringTensionGevFm] = useState<number>(1.0); // sigma ~ 1.0 GeV/fm
  const [coulombAlphaS, setCoulombAlphaS] = useState<number>(0.25); // alpha_s efetivo
  const [probeDistanceFm, setProbeDistanceFm] = useState<number>(0.5); // 0.5 fm

  const cornellPresets = [
    { label: 'Charmônio J/ψ (c c-barra)', sigma: 1.0, alpha: 0.28, r: 0.40, desc: 'Raio médio e potencial efetivo do estado fundamental do charmônio' },
    { label: 'Bottomônio Υ (b b-barra)', sigma: 1.0, alpha: 0.20, r: 0.22, desc: 'Estado menor e mais ligado: domina a atração Coulombiana de 1 glúon' },
    { label: 'Quebra de Corda (Hadronização)', sigma: 1.0, alpha: 0.35, r: 1.20, desc: 'Ponto crítico onde a energia elástica cria um novo par q q-barra' },
    { label: 'Regime Coulombiano Assintótico', sigma: 0.5, alpha: 0.15, r: 0.08, desc: 'Distâncias muito curtas onde o tubo de fluxo ainda não se formou' },
    { label: 'Méson Leve Píon/Rô (u d-barra)', sigma: 0.9, alpha: 0.40, r: 0.70, desc: 'Separação média de quarks leves em mésons cotidianos' }
  ];

  const cornellData = useMemo(() => {
    const sigma = stringTensionGevFm; // GeV / fm
    const alpha_s = coulombAlphaS;
    const r = Math.max(0.01, probeDistanceFm); // fm

    // Potencial de Cornell: V(r) = - (4/3) * (alpha_s * hbar_c) / r + sigma * r
    // Em GeV:
    const v_coulomb_gev = - (4 / 3) * (alpha_s * HBAR_C_GEV_FM) / r;
    const v_linear_gev = sigma * r;
    const v_total_gev = v_coulomb_gev + v_linear_gev;

    // Força restauradora entre os quarks F(r) = - dV/dr = - [ (4/3) * alpha_s * hbar_c / r^2 + sigma ]
    const force_gev_fm = (4 / 3) * (alpha_s * HBAR_C_GEV_FM) / (r * r) + sigma;
    const force_newtons = force_gev_fm * STRING_TENSION_NEWTONS_PER_GEV_FM;

    // Ponto de equilíbrio onde V_coulomb = V_linear: r_eq = sqrt(4 * alpha_s * hbar_c / (3 * sigma))
    const r_crossover_fm = Math.sqrt((4 * alpha_s * HBAR_C_GEV_FM) / (3 * sigma));

    // Curva de V(r) para o plot
    const potentialPoints: { r: number; v: number }[] = [];
    for (let i = 1; i <= 40; i++) {
      const rVal = (i / 40) * 1.5; // 0 a 1.5 fm
      const vc = - (4 / 3) * (alpha_s * HBAR_C_GEV_FM) / rVal;
      const vl = sigma * rVal;
      potentialPoints.push({ r: rVal, v: Math.max(-2, Math.min(2.5, vc + vl)) });
    }

    return {
      v_coulomb_gev,
      v_linear_gev,
      v_total_gev,
      force_newtons,
      r_crossover_fm,
      potentialPoints
    };
  }, [stringTensionGevFm, coulombAlphaS, probeDistanceFm]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: TERMODINÂMICA DO PLASMA DE QUARKS-GLÚONS (QGP - ALICE/RHIC)  */
  /* -------------------------------------------------------------------------- */
  const [qgpTempMev, setQgpTempMev] = useState<number>(250); // 250 MeV (típico RHIC/LHC)
  const [activeQuarkFlavorsQgp, setActiveQuarkFlavorsQgp] = useState<number>(3); // u, d, s

  const qgpPresets = [
    { label: 'Temperatura Crítica de Transição (Tc)', T: 155, desc: 'Ponto de fusão de prótons/nêutrons e desconfinamento quiral' },
    { label: 'Colisão Au+Au no RHIC (STAR)', T: 250, desc: 'Descoberta do líquido perfeito fortemente acoplado (sQGP)' },
    { label: 'Colisão Pb+Pb no LHC (ALICE)', T: 450, desc: 'Densidade de energia 100x superior à matéria nuclear comum' },
    { label: 'Universo Primordial (10 µs após Big Bang)', T: 200, desc: 'Sopa primordial antes da hadronização cosmológica' },
    { label: 'Interior Denso de Estrela de Nêutrons', T: 40, desc: 'Fase de matéria de quarks fria e comprimida' }
  ];

  const qgpData = useMemo(() => {
    const T_Mev = qgpTempMev;
    const T_Gev = T_Mev / 1000;
    const nf = activeQuarkFlavorsQgp;

    // Graus de liberdade de Stefan-Boltzmann:
    // Glúons: 8 cores * 2 spins = 16
    // Quarks: nf * 3 cores * 2 spins * 2 (antipartículas) * (7/8) = 10.5 * nf
    const g_eff = 16 + 10.5 * nf; // 47.5 para 3 sabores

    // Densidade de energia Stefan-Boltzmann: epsilon = g_eff * (pi^2 / 30) * T^4
    // Em GeV / fm^3: T^4 em GeV^4 dividido por (hbar*c)^3
    const epsilon_gev_fm3 = g_eff * (Math.pow(Math.PI, 2) / 30) * (Math.pow(T_Gev, 4) / Math.pow(HBAR_C_GEV_FM, 3));

    // Pressão do QGP P = (1/3) * epsilon - B (onde saco B ~ (0.15 GeV)^4 / (hbar*c)^3)
    const B_bag = Math.pow(0.155, 4) / Math.pow(HBAR_C_GEV_FM, 3);
    const pressure_gev_fm3 = Math.max(0, (1 / 3) * epsilon_gev_fm3 - B_bag);

    // Densidade de entropia s = (epsilon + P) / T
    const s_entropy_fm3 = (epsilon_gev_fm3 + pressure_gev_fm3) / T_Gev;

    // Limite KSS de viscosidade cisalhante mínima (eta / s >= 1 / 4pi)
    const kss_ratio = 1 / (4 * Math.PI); // ~0.0796 hbar / kB

    // Temperatura em Kelvin (1 eV = 11604.5 K => 1 MeV = 1.16045e10 K)
    const temp_kelvin = T_Mev * 1.16045e10;

    // Comparação com a densidade nuclear normal rho_0 ~ 0.16 GeV/fm^3
    const ratio_nuclear = epsilon_gev_fm3 / 0.16;

    return {
      g_eff,
      epsilon_gev_fm3,
      pressure_gev_fm3,
      s_entropy_fm3,
      kss_ratio,
      temp_kelvin,
      ratio_nuclear,
      isDeconfined: T_Mev >= 155
    };
  }, [qgpTempMev, activeQuarkFlavorsQgp]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: ESPALHAMENTO INELÁSTICO PROFUNDO (DIS) & DRELL-YAN            */
  /* -------------------------------------------------------------------------- */
  const [bjorkenX, setBjorkenX] = useState<number>(0.25); // Fração de momento x
  const [transferQ2Gev2, setTransferQ2Gev2] = useState<number>(10); // Q^2 em GeV^2
  const [electronEnergyBeamGev, setElectronEnergyBeamGev] = useState<number>(27.5); // Feixe HERA

  const disPresets = [
    { label: 'Experimento SLAC (1969 - Descoberta dos Quarks)', x: 0.25, Q2: 3.5, E: 20.0, desc: 'Evidência experimental pioneira de constituintes pontuais (pártons)' },
    { label: 'Colisor HERA ep (DESY - Pártons em Baixo x)', x: 0.005, Q2: 25.0, E: 27.5, desc: 'Saturação de glúons e mar de quarks no próton' },
    { label: 'Drell-Yan Bóson Z no LHC (13 TeV)', x: 0.007, Q2: 8300, E: 6500, desc: 'Produção ressonante de Z0 a partir de aniquilação q q-barra' },
    { label: 'Quark de Valência Dominante (Alto x)', x: 0.65, Q2: 50.0, E: 50.0, desc: 'Fração onde quase todo o momento é carregado pelos quarks u e d' }
  ];

  const disData = useMemo(() => {
    const x = Math.max(0.0001, Math.min(0.95, bjorkenX));
    const Q2 = Math.max(1.0, transferQ2Gev2);
    const M_p = 0.938272; // Massa do próton em GeV

    // Resolução espacial do fóton virtual probe: lambda = hbar_c / sqrt(Q^2) em femtômetros
    const spatialResolutionFm = HBAR_C_GEV_FM / Math.sqrt(Q2);

    // Massa invariante do sistema hadrônico final W^2 = M_p^2 + Q^2 * (1-x)/x
    const W2 = Math.pow(M_p, 2) + Q2 * ((1 - x) / x);
    const W_Gev = Math.sqrt(Math.max(0, W2));

    // Parametrização aproximada das funções de estrutura F2(x) do próton
    // F2(x) ~ x * [ (4/9)*u(x) + (1/9)*d(x) + ... ]
    // Forma fenomenológica padrão: F2(x) ~ C * x^0.15 * (1-x)^3.5 + mar em baixo x
    const valencePart = 1.2 * Math.pow(x, 0.6) * Math.pow(1 - x, 3.5);
    const seaPart = 0.18 * Math.pow(x, -0.2) * Math.pow(1 - x, 7);
    const F2 = valencePart + seaPart;

    // Relação de Callan-Gross para férmions de spin 1/2: 2 * x * F1(x) = F2(x)
    const F1 = F2 / (2 * x);

    return {
      spatialResolutionFm,
      W_Gev,
      F2,
      F1
    };
  }, [bjorkenX, transferQ2Gev2, electronEnergyBeamGev]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: QUEBRA DE SIMETRIA QUIRAL & MASSA DO PÍON (RELAÇÃO GMOR)     */
  /* -------------------------------------------------------------------------- */
  const [quarkUpMassMev, setQuarkUpMassMev] = useState<number>(2.16); // m_u ~ 2.16 MeV
  const [quarkDownMassMev, setQuarkDownMassMev] = useState<number>(4.67); // m_d ~ 4.67 MeV
  const [quarkCondensateMev, setQuarkCondensateMev] = useState<number>(250); // <qq>^(1/3) ~ 250 MeV
  const [pionDecayConstMev, setPionDecayConstMev] = useState<number>(92.4); // f_pi ~ 92.4 MeV

  const gmorPresets = [
    { label: 'Vácuo Físico da QCD (PDG 2024)', mu: 2.16, md: 4.67, qq: 250, desc: 'Reproduz com precisão a massa do píon físico de 139.57 MeV' },
    { label: 'Limite Quiral Exato (mu = md = 0)', mu: 0.0, md: 0.0, qq: 250, desc: 'Píons como bósons de Goldstone sem massa perfeitos (m_pi = 0)' },
    { label: 'Lattice QCD com Quarks Pesados', mu: 15.0, md: 15.0, qq: 250, desc: 'Simulações computacionais em rede com píons mais pesados (~350 MeV)' },
    { label: 'Méson Kaon GMOR (Quark Strange)', mu: 2.16, md: 93.4, qq: 250, desc: 'Massa do méson estranho K± (m_K ≈ 495 MeV) pela mesma relação' }
  ];

  const gmorData = useMemo(() => {
    const mu = quarkUpMassMev;
    const md = quarkDownMassMev;
    const qq_scale = quarkCondensateMev;
    const f_pi = pionDecayConstMev;

    // Relação de Gell-Mann-Oakes-Renner:
    // m_pi^2 * f_pi^2 = - (m_u + m_d) * <0| q_bar q |0>
    // onde o condensado quiral é <0| q_bar q |0> = - (qq_scale)^3
    const condensate = Math.pow(qq_scale, 3); // MeV^3
    const m_pi_sq = ((mu + md) * condensate) / Math.pow(f_pi, 2);
    const m_pi_mev = Math.sqrt(Math.max(0, m_pi_sq));

    // Fração da massa do próton gerada pela massa de corrente dos quarks
    // Massa nua dos 3 quarks de valência: 2*mu + md = ~9.0 MeV
    const bareQuarkMassMev = 2 * mu + md;
    const protonMassMev = 938.272;
    const bareMassFractionPct = (bareQuarkMassMev / protonMassMev) * 100;
    const qcdBindingEnergyPct = 100 - bareMassFractionPct;

    return {
      m_pi_mev,
      bareQuarkMassMev,
      bareMassFractionPct,
      qcdBindingEnergyPct
    };
  }, [quarkUpMassMev, quarkDownMassMev, quarkCondensateMev, pionDecayConstMev]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl">
      {/* CABEÇALHO DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-cyan-500/20 border border-rose-500/30 text-rose-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Cromodinâmica Quântica (QCD) & Confinamento de Quarks
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60 rounded-full">
                Força Forte & Pártons
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Liberdade assintótica αs(Q²), potencial de confinamento de Cornell, termodinâmica do plasma QGP, espalhamento DIS e quebra quiral GMOR
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE AS 5 FERRAMENTAS */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('asymptotic-freedom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'asymptotic-freedom'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Liberdade Assintótica
          </button>

          <button
            onClick={() => setActiveTab('cornell-potential')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'cornell-potential'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Potencial de Cornell
          </button>

          <button
            onClick={() => setActiveTab('qgp-thermodynamics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'qgp-thermodynamics'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Plasma QGP (ALICE)
          </button>

          <button
            onClick={() => setActiveTab('deep-inelastic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'deep-inelastic'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Espalhamento DIS (HERA)
          </button>

          <button
            onClick={() => setActiveTab('chiral-symmetry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'chiral-symmetry'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            Simetria Quiral (GMOR)
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS FERRAMENTAS */}
      <div className="mt-6">
        {/* ========================================================================= */}
        {/* ABA 1: LIBERDADE ASSINTÓTICA & RUNNING COUPLING DA QCD                    */}
        {/* ========================================================================= */}
        {activeTab === 'asymptotic-freedom' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Escala de Energia */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Escala de Transferência de Momento Q
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Escala de Energia (Q):</span>
                        <span className="font-mono text-rose-300">{energyScaleQGev.toFixed(2)} GeV</span>
                      </div>
                      <input
                        type="range"
                        min="-0.2"
                        max="2.5"
                        step="0.02"
                        value={Math.log10(Math.max(0.5, energyScaleQGev))}
                        onChange={(e) => setEnergyScaleQGev(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>1 GeV</span>
                        <span>10 GeV</span>
                        <span>91.2 GeV (MZ)</span>
                        <span>300 GeV</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Sabores de Quarks Ativos (n_f):</span>
                        <span className="font-mono text-amber-300">{numFlavors} sabores</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="6"
                        step="1"
                        value={numFlavors}
                        onChange={(e) => setNumFlavors(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Escala Fundamental da QCD (Λ_MSbar):</span>
                        <span className="font-mono text-cyan-300">{lambdaQcdMev} MeV</span>
                      </div>
                      <input
                        type="range"
                        min="150"
                        max="300"
                        step="5"
                        value={lambdaQcdMev}
                        onChange={(e) => setLambdaQcdMev(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Escalas de Calibração Observacional
                  </h4>
                  <div className="space-y-1.5">
                    {qcdPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setEnergyScaleQGev(preset.Q);
                          setNumFlavors(preset.nf);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-rose-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gráfico do Running Coupling e Métricas */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Curva de Acoplamento Corrente α_s(Q²) (Gross-Politzer-Wilczek)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      α_s(2-loop) = {qcdRunningData.alpha_s_2loop.toFixed(4)}
                    </span>
                  </div>

                  {/* Curva de Liberdade Assintótica */}
                  <div className="w-full h-44 bg-black/70 rounded-xl border border-slate-800 relative flex items-center overflow-hidden px-2">
                    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid */}
                      <line x1="0" y1="100" x2="300" y2="100" stroke="#1e293b" strokeWidth="1" />
                      <line x1="100" y1="0" x2="100" y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="200" y1="0" x2="200" y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Curva de decaimento assintótico */}
                      <polyline
                        points={qcdRunningData.curvePoints.map((p, idx) => `${idx * 10},${(120 - p.alpha * 100).toFixed(1)}`).join(' ')}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                      />
                    </svg>

                    <div className="absolute top-2 left-3 text-[10px] font-mono text-amber-400">
                      Confinamento (Q → Λ_QCD)
                    </div>
                    <div className="absolute top-2 right-3 text-[10px] font-mono text-cyan-300">
                      Liberdade Assintótica (Q &gt;&gt; 100 GeV)
                    </div>
                  </div>
                </div>

                {/* Métricas Numéricas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Constante α_s (2-Loops):</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      {qcdRunningData.alpha_s_2loop.toFixed(4)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Alta Precisão</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Constante α_s (1-Loop):</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {qcdRunningData.alpha_s_1loop.toFixed(4)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">4π / β₀ ln(Q²/Λ²)</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Coeficiente β₀:</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {qcdRunningData.beta0.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">11 - 2/3 nf &gt; 0</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Regime da Teoria:</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {qcdRunningData.alpha_s_2loop < 0.25 ? 'Perturbativo Livre' : 'Não-Perturbativo'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Validade de Feynman</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Comprimento de Onda Probe:</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {(HBAR_C_GEV_FM / energyScaleQGev).toFixed(4)} fm
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">λ = ħc / Q</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Anti-blindagem de Glúons:</span>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                      Ativa (Cor SU(3))
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Inverso da QED</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Constante de Acoplamento QCD alpha_s(Q = ${energyScaleQGev} GeV) = ${qcdRunningData.alpha_s_2loop.toFixed(4)}\nBeta0: ${qcdRunningData.beta0.toFixed(2)}\nLambda_QCD: ${lambdaQcdMev} MeV`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Liberdade Assintótica
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: POTENCIAL DE CORNELL & CONFINAMENTO DE QUARKS                      */}
        {/* ========================================================================= */}
        {activeTab === 'cornell-potential' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles do Tubo de Fluxo */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros da Corda Cromodinâmica
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Distância entre Quarks (r):</span>
                        <span className="font-mono text-rose-300">{probeDistanceFm.toFixed(2)} fm</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1.5"
                        step="0.02"
                        value={probeDistanceFm}
                        onChange={(e) => setProbeDistanceFm(parseFloat(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>0.05 fm (1 glúon)</span>
                        <span>0.5 fm (Transição)</span>
                        <span>1.5 fm (Hadronização)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Tensão da Corda Linear (σ):</span>
                        <span className="font-mono text-amber-300">{stringTensionGevFm.toFixed(2)} GeV/fm</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={stringTensionGevFm}
                        onChange={(e) => setStringTensionGevFm(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">
                        1.0 GeV/fm ≈ 160.000 Newtons (~16 toneladas de força)
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Acoplamento Coulombiano Efetivo (α_s):</span>
                        <span className="font-mono text-cyan-300">{coulombAlphaS.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.5"
                        step="0.01"
                        value={coulombAlphaS}
                        onChange={(e) => setCoulombAlphaS(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Estados Ligados Quarkônio
                  </h4>
                  <div className="space-y-1.5">
                    {cornellPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setStringTensionGevFm(preset.sigma);
                          setCoulombAlphaS(preset.alpha);
                          setProbeDistanceFm(preset.r);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-rose-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Curva de Potencial e Força de Confinamento */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> Curva do Potencial de Cornell V(r) = -4αs/3r + σr
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      V(r) = {cornellData.v_total_gev.toFixed(3)} GeV
                    </span>
                  </div>

                  {/* Gráfico do Potencial */}
                  <div className="w-full h-44 bg-black/70 rounded-xl border border-slate-800 relative flex items-center overflow-hidden px-2">
                    <svg viewBox="0 -2 1.5 4.5" className="w-full h-full" preserveAspectRatio="none">
                      {/* Eixo V = 0 */}
                      <line x1="0" y1="0" x2="1.5" y2="0" stroke="#1e293b" strokeWidth="0.04" />
                      {/* Ponto de Crossover */}
                      <line
                        x1={cornellData.r_crossover_fm}
                        y1="-2"
                        x2={cornellData.r_crossover_fm}
                        y2="2.5"
                        stroke="#f59e0b"
                        strokeWidth="0.02"
                        strokeDasharray="0.05 0.05"
                      />

                      {/* Curva V(r) */}
                      <polyline
                        points={cornellData.potentialPoints.map(p => `${p.r.toFixed(3)},${(2.5 - p.v).toFixed(3)}`).join(' ')}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="0.04"
                      />
                    </svg>

                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-300">
                      Coulombiano: -4αs / 3r
                    </div>
                    <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-300">
                      Confinamento Linear: σ × r
                    </div>
                  </div>
                </div>

                {/* Métricas de Força */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Força de Confinamento:</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      {(cornellData.force_newtons / 1000).toFixed(1)} kN
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{(cornellData.force_newtons / 9800).toFixed(1)} toneladas!</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Energia Linear da Corda:</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      +{cornellData.v_linear_gev.toFixed(3)} GeV
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Tubo de Fluxo Gluônico</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Atração Coulombiana:</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {cornellData.v_coulomb_gev.toFixed(3)} GeV
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">1 Glúon (Casimir CF=4/3)</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-1">
                    <Info className="w-4 h-4" /> Por que é Impossível Isolar um Quark Livre?
                  </div>
                  Puxar dois quarks para longe estica o tubo de fluxo com uma força de <span className="text-amber-300 font-mono">~16 toneladas</span>. Quando a energia acumulada na corda atinge <span className="text-rose-300 font-mono">~2m_π</span>, a corda se rompe criando um novo par quark-antiquark do vácuo, gerando dois mésons em vez de quarks isolados.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: TERMODINÂMICA DO PLASMA DE QUARKS-GLÚONS (QGP - ALICE/RHIC)        */}
        {/* ========================================================================= */}
        {activeTab === 'qgp-thermodynamics' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Temperatura */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Temperatura do Meio Nuclear
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Temperatura (T):</span>
                        <span className="font-mono text-rose-300">{qgpTempMev} MeV ({(qgpData.temp_kelvin / 1e12).toFixed(2)} Trilhões K)</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="600"
                        step="5"
                        value={qgpTempMev}
                        onChange={(e) => setQgpTempMev(parseInt(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>50 MeV</span>
                        <span>155 MeV (Tc Transição)</span>
                        <span>600 MeV (LHC)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Sabores Desconfinados:</span>
                        <span className="font-mono text-amber-300">{activeQuarkFlavorsQgp === 3 ? 'u, d, s (3 Sabores)' : 'u, d (2 Sabores)'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveQuarkFlavorsQgp(2)}
                          className={`flex-1 py-1 px-2 rounded border text-xs ${activeQuarkFlavorsQgp === 2 ? 'bg-rose-600/30 border-rose-500 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          2 Sabores (u, d)
                        </button>
                        <button
                          onClick={() => setActiveQuarkFlavorsQgp(3)}
                          className={`flex-1 py-1 px-2 rounded border text-xs ${activeQuarkFlavorsQgp === 3 ? 'bg-rose-600/30 border-rose-500 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          3 Sabores (u, d, s)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Experimentos de Íons Pesados Relativísticos
                  </h4>
                  <div className="space-y-1.5">
                    {qgpPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQgpTempMev(preset.T)}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-rose-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Termodinâmica do QGP */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Fase Termodinâmica da Matéria Forte
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${qgpData.isDeconfined ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                      {qgpData.isDeconfined ? 'Plasma Desconfinado (QGP)' : 'Gás de Hádrons Confinado'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Densidade de Energia (ε):</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {qgpData.epsilon_gev_fm3.toFixed(2)} GeV/fm³
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{qgpData.ratio_nuclear.toFixed(1)}x a matéria nuclear</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Temperatura Absoluta:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {(qgpData.temp_kelvin / 1e12).toFixed(2)} Trilhões K
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">120.000x o núcleo solar</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Pressão Termodinâmica:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {qgpData.pressure_gev_fm3.toFixed(2)} GeV/fm³
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">(1/3)ε - B_bag</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Graus de Liberdade (g_eff):</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {qgpData.g_eff}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">16 glúons + 31.5 quarks</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Viscosidade Mínima KSS:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        η/s ≈ 1 / 4π
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Fluido mais perfeito</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Densidade de Entropia (s):</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {qgpData.s_entropy_fm3.toFixed(1)} fm⁻³
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">(ε + P) / T</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Temperatura QGP: ${qgpTempMev} MeV (${(qgpData.temp_kelvin / 1e12).toFixed(2)} Trilhoes K)\nDensidade de Energia: ${qgpData.epsilon_gev_fm3.toFixed(2)} GeV/fm3 (${qgpData.ratio_nuclear.toFixed(1)}x nuclear)\nGraus de Liberdade: ${qgpData.g_eff}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas Termodinâmicas do QGP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: ESPALHAMENTO INELÁSTICO PROFUNDO (DIS) & DRELL-YAN                 */}
        {/* ========================================================================= */}
        {activeTab === 'deep-inelastic' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles Cinemáticos */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Cinemática Relativística do Párton
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Fração de Momento de Bjorken (x):</span>
                        <span className="font-mono text-rose-300">x = {bjorkenX.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="-0.05"
                        step="0.02"
                        value={Math.log10(Math.max(0.001, bjorkenX))}
                        onChange={(e) => setBjorkenX(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>0.001 (Mar Denso)</span>
                        <span>0.1</span>
                        <span>0.9 (Valência)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Transferência de Momento Q² (GeV²):</span>
                        <span className="font-mono text-cyan-300">{transferQ2Gev2.toFixed(1)} GeV²</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="4"
                        step="0.05"
                        value={Math.log10(transferQ2Gev2)}
                        onChange={(e) => setTransferQ2Gev2(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Experimentos Canônicos de DIS
                  </h4>
                  <div className="space-y-1.5">
                    {disPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setBjorkenX(preset.x);
                          setTransferQ2Gev2(preset.Q2);
                          setElectronEnergyBeamGev(preset.E);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-rose-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas do DIS */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Sondagem do Interior do Próton
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      Resolução λ = {disData.spatialResolutionFm.toFixed(4)} fm
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Função Estrutura F₂(x):</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {disData.F2.toFixed(3)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Densidade de Carga</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Relação Callan-Gross 2xF₁:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {(2 * bjorkenX * disData.F1).toFixed(3)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Prova Spin 1/2</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Resolução Espacial (λ):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {disData.spatialResolutionFm.toFixed(4)} fm
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">ħc / √Q²</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Massa Invariante W:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {disData.W_Gev.toFixed(2)} GeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Estado Hadrônico X</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Composição do Próton:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        50% Glúons + 50% Quarks
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Regra de Soma</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Fração de Momento x:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {(bjorkenX * 100).toFixed(1)}% do Próton
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Q² / (2P·q)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: QUEBRA DE SIMETRIA QUIRAL & MASSA DO PÍON (RELAÇÃO GMOR)            */}
        {/* ========================================================================= */}
        {activeTab === 'chiral-symmetry' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Massas Nuas de Quarks */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Massas de Corrente dos Quarks
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa do Quark Up (m_u):</span>
                        <span className="font-mono text-rose-300">{quarkUpMassMev.toFixed(2)} MeV</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.1"
                        value={quarkUpMassMev}
                        onChange={(e) => setQuarkUpMassMev(parseFloat(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa do Quark Down (m_d):</span>
                        <span className="font-mono text-amber-300">{quarkDownMassMev.toFixed(2)} MeV</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.5"
                        value={quarkDownMassMev}
                        onChange={(e) => setQuarkDownMassMev(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Condensado de Vácuo Quiral |⟨qq̄⟩|¹/³:</span>
                        <span className="font-mono text-cyan-300">{quarkCondensateMev} MeV</span>
                      </div>
                      <input
                        type="range"
                        min="150"
                        max="350"
                        step="5"
                        value={quarkCondensateMev}
                        onChange={(e) => setQuarkCondensateMev(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Cenários de Simetria Quiral
                  </h4>
                  <div className="space-y-1.5">
                    {gmorPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuarkUpMassMev(preset.mu);
                          setQuarkDownMassMev(preset.md);
                          setQuarkCondensateMev(preset.qq);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-rose-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Relação GMOR e Origem da Massa da Matéria */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Atom className="w-4 h-4" /> Relação GMOR: m_π² f_π² = -(m_u + m_d) ⟨qq̄⟩
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      m_π = {gmorData.m_pi_mev.toFixed(2)} MeV
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Massa do Píon Calculada:</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {gmorData.m_pi_mev.toFixed(2)} MeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Pseudo-Goldstone</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Massa Nua dos Quarks:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {gmorData.bareQuarkMassMev.toFixed(2)} MeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">2 m_u + m_d</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Fração da Massa do Próton:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {gmorData.bareMassFractionPct.toFixed(2)}%
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Massa do Higgs</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Energia de Ligação QCD:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        {gmorData.qcdBindingEnergyPct.toFixed(2)}%
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Glúons + E=mc²</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Constante de Decaimento f_π:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {pionDecayConstMev} MeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">π → µ ν</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Condensado Quiral:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        -(250 MeV)³
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Quebra Espontânea</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                    <Info className="w-4 h-4" /> De Onde Vem 99% da Massa do seu Corpo?
                  </div>
                  <p>
                    Os bósons de Higgs geram apenas as massas nuas dos quarks (<span className="text-amber-300 font-mono">~9 MeV</span> para os 3 quarks do próton). Os outros <span className="text-emerald-400 font-mono">99% da massa de todos os átomos</span> provêm da energia cinética dos glúons confinados e da quebra de simetria quiral via <span className="text-white font-bold">E = mc²</span>!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
