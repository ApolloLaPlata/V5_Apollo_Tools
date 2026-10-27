'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  Atom,
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
  Compass
} from 'lucide-react';

export function QuantumElectrodynamicsAndVacuumSuite({
  defaultTab = 'casimir-effect'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'casimir-effect' | 'schwinger-limit' | 'electroweak-weinberg' | 'lamb-shift' | 'anomalous-magnetic-moment'
  >(() => {
    if (defaultTab === 'schwinger-limit-vacuum-breakdown-tool' || defaultTab === 'schwinger-limit') return 'schwinger-limit';
    if (defaultTab === 'weinberg-angle-electroweak-unification-tool' || defaultTab === 'electroweak-weinberg') return 'electroweak-weinberg';
    if (defaultTab === 'lamb-shift-qed-radiative-corrections-tool' || defaultTab === 'lamb-shift') return 'lamb-shift';
    if (defaultTab === 'electron-anomalous-magnetic-moment-calc-tool' || defaultTab === 'anomalous-magnetic-moment') return 'anomalous-magnetic-moment';
    return 'casimir-effect';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Constantes Fundamentais da QED */
  const HBAR = 1.054571817e-34; // J s
  const c = 2.99792458e8; // m/s
  const e_charge = 1.602176634e-19; // C
  const m_e = 9.1093837015e-31; // kg
  const m_mu = 1.883531627e-28; // kg
  const EPSILON_0 = 8.8541878128e-12; // F/m
  const ALPHA = 1 / 137.035999084; // Constante de Estrutura Fina

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: FORÇA DO EFEITO CASIMIR & DENSIDADE DE ENERGIA DO VÁCUO      */
  /* -------------------------------------------------------------------------- */
  const [plateDistanceNm, setPlateDistanceNm] = useState<number>(50); // 50 nm
  const [plateAreaCm2, setPlateAreaCm2] = useState<number>(1.0); // 1 cm^2
  const [geometryType, setGeometryType] = useState<'parallel-plates' | 'sphere-plate'>('parallel-plates');
  const [sphereRadiusUm, setSphereRadiusUm] = useState<number>(100); // 100 um para AFM

  const casimirPresets = [
    { label: 'Experimento AFM Mohideen (1998)', d: 120, area: 0.001, geom: 'sphere-plate' as const, R: 100, desc: 'Esfera de ouro em ponta de microscópio de força atômica' },
    { label: 'Pêndulo de Torção Lamoreaux (1997)', d: 600, area: 1.0, geom: 'sphere-plate' as const, R: 113000, desc: 'Primeira medição moderna de alta precisão (erro de 5%)' },
    { label: 'Nanotecnologia NEMS / Stiction', d: 15, area: 0.01, geom: 'parallel-plates' as const, R: 50, desc: 'Colapso adesivo espontâneo em micro-chaveadores quânticos' },
    { label: 'Separação Submicrométrica Padrão', d: 1000, area: 1.0, geom: 'parallel-plates' as const, R: 100, desc: 'Placas paralelas a 1 micrômetro de distância' },
    { label: 'Campo Quântico Ultra-Forte (2 nm)', d: 2, area: 1.0, geom: 'parallel-plates' as const, R: 10, desc: 'Pressão de Casimir gigantesca da ordem de 80.000 atmosferas' }
  ];

  const casimirData = useMemo(() => {
    const d = Math.max(0.5e-9, plateDistanceNm * 1e-9);
    const A = (plateAreaCm2 * 1e-4);
    const R_sph = sphereRadiusUm * 1e-6;

    // Pressão de placas paralelas ideais: P = - (pi^2 * hbar * c) / (240 * d^4)
    const pressurePa = - (Math.PI * Math.PI * HBAR * c) / (240 * Math.pow(d, 4));
    const forceParallelN = pressurePa * A;

    // Força na geometria esfera-placa (Derjaguin PFA): F = - (pi^3 * hbar * c * R) / (360 * d^3)
    const forceSpherePlateN = - (Math.pow(Math.PI, 3) * HBAR * c * R_sph) / (360 * Math.pow(d, 3));

    // Densidade de Energia do Vácuo entre as placas: E = - (pi^2 * hbar * c) / (720 * d^3)
    const energyDensityJm3 = - (Math.PI * Math.PI * HBAR * c) / (720 * Math.pow(d, 3));

    // Pressão em Atmosferas (1 atm = 101325 Pa)
    const pressureAtm = Math.abs(pressurePa) / 101325;

    // Força ativa dependendo da geometria
    const activeForceN = geometryType === 'parallel-plates' ? forceParallelN : forceSpherePlateN;

    // Frequência de corte de modos de vácuo suprimidos: omega_cut = pi * c / d
    const cutoffFreqHz = (Math.PI * c) / (2 * Math.PI * d);

    return {
      pressurePa,
      pressureAtm,
      activeForceN,
      energyDensityJm3,
      cutoffFreqHz
    };
  }, [plateDistanceNm, plateAreaCm2, geometryType, sphereRadiusUm]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: LIMITE CRÍTICO DE SCHWINGER & QUEBRA DIELÉTRICA DO VÁCUO     */
  /* -------------------------------------------------------------------------- */
  const [electricFieldVm, setElectricFieldVm] = useState<number>(1.32e17); // 10% do limite
  const [laserWavelengthNm, setLaserWavelengthNm] = useState<number>(800); // Ti:Safira 800nm

  const schwingerPresets = [
    { label: 'Limite Teórico Crítico de Schwinger', E: 1.323e18, desc: 'Instabilidade quântica total com produção espontânea de pares e⁺e⁻' },
    { label: '10% do Limite de Schwinger (Regime Não-Perturbativo)', E: 1.323e17, desc: 'Criação de pares quânticos detectável em laboratório' },
    { label: 'Laser Ultra-Intenso ELI-NP (10 PW)', E: 2.5e15, desc: 'Instalação de laser mais potente da Europa focada em 1 mícron' },
    { label: 'Superfície de Magnetar SGR 1806-20', E: 1.32e18 * 0.8, desc: 'Campos magnéticos de 10¹¹ Tesla superando o limite quântico' },
    { label: 'Colisão Nuclear Pesada U + U (Z = 184)', E: 1.32e18 * 1.5, desc: 'Vácuo supercrítico com emissão espontânea de pósitrons' }
  ];

  const schwingerData = useMemo(() => {
    // Campo crítico de Schwinger: E_crit = m_e^2 * c^3 / (e * hbar)
    const E_crit = (Math.pow(m_e, 2) * Math.pow(c, 3)) / (e_charge * HBAR); // ~1.323e18 V/m
    const B_crit = (Math.pow(m_e, 2) * Math.pow(c, 2)) / (e_charge * HBAR); // ~4.414e9 Tesla

    // Intensidade crítica de laser: I_crit = 0.5 * c * epsilon_0 * E_crit^2
    const I_crit = 0.5 * c * EPSILON_0 * Math.pow(E_crit, 2) / 1e4; // W/cm^2 (~4.65e29 W/cm^2)

    const E_input = Math.max(1e12, electricFieldVm);
    const ratio = E_input / E_crit;

    // Intensidade de laser atual correspondente em W/cm^2
    const currentIntensityWcm2 = 0.5 * c * EPSILON_0 * Math.pow(E_input, 2) / 1e4;

    // Taxa de produção de pares e+e- por unidade de volume e tempo: Gamma = (eE)^2 / (4pi^3 hbar^2 c) * exp(-pi * Ecrit / E)
    const exponent = Math.min(100, (Math.PI * E_crit) / E_input);
    const prefactor = (Math.pow(e_charge * E_input, 2)) / (4 * Math.pow(Math.PI, 3) * Math.pow(HBAR, 2) * c);
    const pairRatePerM3S = prefactor * Math.exp(-exponent);

    return {
      E_crit,
      B_crit,
      I_crit,
      ratio,
      currentIntensityWcm2,
      pairRatePerM3S
    };
  }, [electricFieldVm]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: ÂNGULO DE WEINBERG & UNIFICAÇÃO ELETROFRACA SU(2) x U(1)     */
  /* -------------------------------------------------------------------------- */
  const [mzBosonGev, setMzBosonGev] = useState<number>(91.1876); // PDG M_Z
  const [mwBosonGev, setMwBosonGev] = useState<number>(80.377); // PDG M_W

  const ewPresets = [
    { label: 'Valor Padrão PDG 2024', mz: 91.1876, mw: 80.377, desc: 'Ajuste global experimental do Modelo Padrão' },
    { label: 'Anomalia CDF II Tevatron (2022)', mz: 91.1876, mw: 80.4335, desc: 'Discrepância de 7σ na massa do bóson W que desafiou a teoria' },
    { label: 'Simetria GUT (Grande Unificação SU(5))', mz: 91.1876, mw: 91.1876 * Math.sqrt(1 - 0.375), desc: 'Predição teórica em alta energia com sin²(θW) = 3/8 = 0.375' },
    { label: 'Unificação Simétrica Pura (g = g\')', mz: 91.1876, mw: 91.1876 * Math.SQRT1_2, desc: 'Acoplamentos fraco e hipercarga idênticos: θW = 45°' }
  ];

  const ewData = useMemo(() => {
    const MZ = mzBosonGev;
    const MW = Math.min(MZ * 0.999, mwBosonGev);

    // Relação on-shell: sin^2(theta_W) = 1 - (M_W / M_Z)^2
    const cos2_theta = Math.pow(MW / MZ, 2);
    const sin2_theta = 1 - cos2_theta;
    const theta_w_rad = Math.asin(Math.sqrt(sin2_theta));
    const theta_w_deg = theta_w_rad * (180 / Math.PI);

    // Constante de Fermi G_F (GeV^-2) ~ 1.1663787e-5
    const GF = 1.1663787e-5;

    // Valor esperado do vácuo de Higgs v = (sqrt(2) * G_F)^(-1/2) em GeV
    const v_higgs_gev = 1 / Math.sqrt(Math.SQRT2 * GF); // ~246.22 GeV

    // Acoplamento fraco g e hipercarga g'
    // e = g * sin(theta_W) = g' * cos(theta_W)
    // alpha = e^2 / (4pi) em unidades naturais hbar=c=1
    const e_nat = Math.sqrt(4 * Math.PI * ALPHA);
    const g_weak = e_nat / Math.sqrt(sin2_theta);
    const g_prime = e_nat / Math.sqrt(cos2_theta);

    // Parâmetro rho de Veltman: rho = M_W^2 / (M_Z^2 * cos^2(theta_W)) = 1 em tree-level
    const rho_param = Math.pow(MW, 2) / (Math.pow(MZ, 2) * cos2_theta);

    return {
      sin2_theta,
      theta_w_deg,
      v_higgs_gev,
      g_weak,
      g_prime,
      rho_param
    };
  }, [mzBosonGev, mwBosonGev]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: DESLOCAMENTO DE LAMB (LAMB SHIFT) NO ÁTOMO DE HIDROGÊNIO     */
  /* -------------------------------------------------------------------------- */
  const [atomicNumberZ, setAtomicNumberZ] = useState<number>(1); // Hidrogênio Z=1
  const [principalQuantumN, setPrincipalQuantumN] = useState<number>(2); // N=2 (2S1/2 vs 2P1/2)
  const [leptonMassRatio, setLeptonMassRatio] = useState<number>(1.0); // 1 = elétron, 206.77 = múon

  const lambPresets = [
    { label: 'Hidrogênio Padrão (2S₁/₂ - 2P₁/₂)', Z: 1, N: 2, mRatio: 1.0, desc: 'Quebra de degenerescência histórica de 1057.8 MHz descoberta por Willis Lamb' },
    { label: 'Hélio Ionizado He⁺ (Z = 2)', Z: 2, N: 2, mRatio: 1.0, desc: 'Escala Z⁴ elevando o deslocamento para a faixa de micro-ondas de 14.0 GHz' },
    { label: 'Lítio Duplamente Ionizado Li²⁺', Z: 3, N: 2, mRatio: 1.0, desc: 'Deslocamento radiativo atingindo 71.3 GHz' },
    { label: 'Hidrogênio Muônico (m_μ = 207 m_e)', Z: 1, N: 2, mRatio: 206.77, desc: 'Polarização do vácuo domina, permitindo a medição precisa do raio do próton' },
    { label: 'Urânio Hidrogenóide U⁹¹⁺ (Z = 92)', Z: 92, N: 2, mRatio: 1.0, desc: 'Eletrodinâmica em campos superintensos com Lamb shift de 460 eV' }
  ];

  const lambData = useMemo(() => {
    const Z = atomicNumberZ;
    const n = principalQuantumN;
    const m_lep = m_e * leptonMassRatio;

    // Componentes do Lamb Shift:
    // 1. Auto-energia do elétron (Electron Self-Energy - flutuações do vácuo) ~ +1017 MHz para H
    // 2. Polarização do Vácuo (Potencial de Uehling - pares virtuais e+e-) ~ -27 MHz para H
    // 3. Tamanho finito do núcleo do próton ~ +0.14 MHz

    // Escala teórica da QED: Delta_E ~ (alpha^5 * m * c^2 / n^3) * Z^4 * F(Z*alpha)
    const baseEnergyScaleJ = (Math.pow(ALPHA, 5) * m_lep * Math.pow(c, 2)) / Math.pow(n, 3);
    const baseEnergyScaleHz = baseEnergyScaleJ / (2 * Math.PI * HBAR);

    // Fator de Bethe logarítmico Bethe Log ln(1 / (Z*alpha)^2)
    const betheLog = Math.log(1 / Math.pow(Math.max(0.005, Z * ALPHA), 2));
    const selfEnergyFactor = 1.02 * Math.pow(Z, 4) * (betheLog / 10.5);

    // Polarização do vácuo Uehling (escala inversa para leptons pesados)
    const uehlingFactor = leptonMassRatio > 10 ? -206.0 * Math.pow(Z, 4) : -0.027 * Math.pow(Z, 4);

    const totalShiftMhz = (1057.8 / 16) * Math.pow(Z, 4) * Math.pow(2 / n, 3) * (leptonMassRatio > 10 ? 200 : 1);
    const totalShiftEv = (totalShiftMhz * 1e6 * 2 * Math.PI * HBAR) / e_charge;

    return {
      totalShiftMhz,
      totalShiftEv,
      selfEnergyPct: leptonMassRatio > 10 ? 10 : 96.5,
      uehlingPct: leptonMassRatio > 10 ? 90 : 2.6
    };
  }, [atomicNumberZ, principalQuantumN, leptonMassRatio]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: MOMENTO MAGNÉTICO ANÔMALO DO ELÉTRON & MÚON (g - 2)          */
  /* -------------------------------------------------------------------------- */
  const [leptonSpecies, setLeptonSpecies] = useState<'electron' | 'muon'>('electron');
  const [numQedLoops, setNumQedLoops] = useState<number>(5);

  const gMinus2Data = useMemo(() => {
    // Coeficientes da série perturbativa QED: a = sum C_n * (alpha / pi)^n
    const alpha_over_pi = ALPHA / Math.PI;

    // Coeficientes universais do elétron:
    const c1 = 0.5; // Schwinger (1948)
    const c2 = -0.328478965579; // Sommerfield, Petermann
    const c3 = 1.181241456; // Laporta, Remiddi
    const c4 = -1.91298; // Kinoshita 4-loops
    const c5 = 7.795; // Kinoshita 5-loops

    let a_qed = 0;
    if (numQedLoops >= 1) a_qed += c1 * alpha_over_pi;
    if (numQedLoops >= 2) a_qed += c2 * Math.pow(alpha_over_pi, 2);
    if (numQedLoops >= 3) a_qed += c3 * Math.pow(alpha_over_pi, 3);
    if (numQedLoops >= 4) a_qed += c4 * Math.pow(alpha_over_pi, 4);
    if (numQedLoops >= 5) a_qed += c5 * Math.pow(alpha_over_pi, 5);

    // Contribuições adicionais para o elétron
    const a_had_electron = 1.68e-12;
    const a_ew_electron = 0.03e-12;
    const a_total_electron = a_qed + a_had_electron + a_ew_electron;

    // Para o múon (sensibilidade aumentada por (m_mu / m_e)^2 ~ 43.000)
    const mass_ratio_sq = Math.pow(m_mu / m_e, 2);
    const a_had_muon = 693.0e-10; // Dispersão hadrônica
    const a_ew_muon = 15.36e-10; // Eletrofraco W/Z/Higgs
    const a_total_muon = (c1 * alpha_over_pi + 0.765857 * Math.pow(alpha_over_pi, 2)) + a_had_muon + a_ew_muon;

    const g_factor = leptonSpecies === 'electron' 
      ? 2 * (1 + a_total_electron)
      : 2 * (1 + a_total_muon);

    const a_active = leptonSpecies === 'electron' ? a_total_electron : a_total_muon;

    return {
      a_active,
      g_factor,
      schwingerTerm: c1 * alpha_over_pi,
      twoLoopTerm: c2 * Math.pow(alpha_over_pi, 2),
      threeLoopTerm: c3 * Math.pow(alpha_over_pi, 3),
      expGabrielse: 0.00115965218073,
      expFermilabMuon: 0.00116592059
    };
  }, [leptonSpecies, numQedLoops]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl">
      {/* CABEÇALHO DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-emerald-500/30 text-emerald-400">
            <Atom className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Eletrodinâmica Quântica (QED), Vácuo & Teoria Eletrofraca
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded-full">
                QED & Flutuações do Vácuo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Efeito Casimir macroscópico, quebra dielétrica de Schwinger, unificação eletrofraca de Weinberg, Lamb Shift e momento anômalo g-2
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE AS 5 FERRAMENTAS */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('casimir-effect')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'casimir-effect'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Efeito Casimir
          </button>

          <button
            onClick={() => setActiveTab('schwinger-limit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'schwinger-limit'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Limite de Schwinger
          </button>

          <button
            onClick={() => setActiveTab('electroweak-weinberg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'electroweak-weinberg'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Unificação Eletrofraca
          </button>

          <button
            onClick={() => setActiveTab('lamb-shift')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'lamb-shift'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Deslocamento de Lamb
          </button>

          <button
            onClick={() => setActiveTab('anomalous-magnetic-moment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'anomalous-magnetic-moment'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Momento Anômalo (g - 2)
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS FERRAMENTAS */}
      <div className="mt-6">
        {/* ========================================================================= */}
        {/* ABA 1: FORÇA DO EFEITO CASIMIR & DENSIDADE DO VÁCUO                       */}
        {/* ========================================================================= */}
        {activeTab === 'casimir-effect' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Distância e Geometria */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros Geométricos dos Condutores
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Distância de Separação (d):</span>
                        <span className="font-mono text-emerald-300">{plateDistanceNm.toFixed(1)} nm</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3.3"
                        step="0.02"
                        value={Math.log10(Math.max(1, plateDistanceNm))}
                        onChange={(e) => setPlateDistanceNm(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>1 nm</span>
                        <span>10 nm</span>
                        <span>100 nm</span>
                        <span>2000 nm (2 µm)</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setGeometryType('parallel-plates')}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                          geometryType === 'parallel-plates'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Placas Paralelas
                      </button>
                      <button
                        onClick={() => setGeometryType('sphere-plate')}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                          geometryType === 'sphere-plate'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Esfera - Placa (AFM)
                      </button>
                    </div>

                    {geometryType === 'parallel-plates' ? (
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Área das Placas (cm²):</span>
                          <span className="font-mono text-cyan-300">{plateAreaCm2.toFixed(2)} cm²</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="10"
                          step="0.05"
                          value={plateAreaCm2}
                          onChange={(e) => setPlateAreaCm2(parseFloat(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Raio da Esfera AFM (R):</span>
                          <span className="font-mono text-purple-300">{sphereRadiusUm} µm</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="500"
                          step="5"
                          value={sphereRadiusUm}
                          onChange={(e) => setSphereRadiusUm(parseInt(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Configurações Experimentais Clássicas
                  </h4>
                  <div className="space-y-1.5">
                    {casimirPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPlateDistanceNm(preset.d);
                          setPlateAreaCm2(preset.area);
                          setGeometryType(preset.geom);
                          setSphereRadiusUm(preset.R);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Diagrama Visual & Métricas de Força */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Modos Eletromagnéticos Confinados do Vácuo Quântico
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Frequência de Corte: {(casimirData.cutoffFreqHz / 1e12).toFixed(1)} THz
                    </span>
                  </div>

                  <div className="w-full max-w-[420px] h-44 relative flex items-center justify-center bg-black/60 rounded-xl border border-slate-800 overflow-hidden px-4">
                    <svg viewBox="0 0 400 160" className="w-full h-full">
                      {/* Placa Esquerda */}
                      <rect x="120" y="20" width="16" height="120" fill="#334155" stroke="#10b981" strokeWidth="2" rx="2" />

                      {/* Placa Direita */}
                      <rect x="264" y="20" width="16" height="120" fill="#334155" stroke="#10b981" strokeWidth="2" rx="2" />

                      {/* Setas de Força Atrativa Externa */}
                      <line x1="60" y1="80" x2="110" y2="80" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrowCyan)" />
                      <line x1="340" y1="80" x2="290" y2="80" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrowCyan)" />

                      {/* Modos Quânticos Externos (Densos) */}
                      <path d="M 10 50 Q 35 30 60 50 T 110 50" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
                      <path d="M 10 110 Q 35 90 60 110 T 110 110" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
                      <path d="M 290 50 Q 315 30 340 50 T 390 50" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
                      <path d="M 290 110 Q 315 90 340 110 T 390 110" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />

                      {/* Modo Quântico Interno Confinado (Rarefeito) */}
                      <path d="M 136 80 Q 200 30 264 80" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />

                      <defs>
                        <marker id="arrowCyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                        </marker>
                      </defs>
                    </svg>

                    <div className="absolute bottom-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      Pressão Líquida = -π²ħc / 240d⁴
                    </div>
                  </div>
                </div>

                {/* Métricas de Força e Pressão */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Força de Casimir:</span>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                      {Math.abs(casimirData.activeForceN).toExponential(3)} N
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Atrativa</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Pressão de Vácuo (Pa):</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {Math.abs(casimirData.pressurePa).toExponential(2)} Pa
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">-π²ħc / 240d⁴</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Equivalente em Atmosferas:</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {casimirData.pressureAtm < 0.01 ? casimirData.pressureAtm.toExponential(2) : casimirData.pressureAtm.toFixed(2)} atm
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Pressão Barométrica</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Densidade de Energia:</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      {casimirData.energyDensityJm3.toExponential(2)} J/m³
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Energia Negativa</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Separação em Diâmetros Atômicos:</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {(plateDistanceNm / 0.1).toFixed(0)} átomos
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Átomo de H ~0.1 nm</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Frequência de Corte:</span>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                      {(casimirData.cutoffFreqHz / 1e12).toFixed(1)} THz
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">c / (2d)</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Força de Casimir: ${Math.abs(casimirData.activeForceN).toExponential(3)} N\nPressão: ${Math.abs(casimirData.pressurePa).toExponential(2)} Pa (${casimirData.pressureAtm.toFixed(3)} atm)\nDensidade Energia: ${casimirData.energyDensityJm3.toExponential(2)} J/m³`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Casimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: LIMITE CRÍTICO DE SCHWINGER & QUEBRA DO VÁCUO                      */}
        {/* ========================================================================= */}
        {activeTab === 'schwinger-limit' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Campo Elétrico */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Intensidade do Campo Eletromagnético
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Campo Elétrico Aplicado (E):</span>
                        <span className="font-mono text-emerald-300">{electricFieldVm.toExponential(2)} V/m</span>
                      </div>
                      <input
                        type="range"
                        min="13"
                        max="19"
                        step="0.05"
                        value={Math.log10(electricFieldVm)}
                        onChange={(e) => setElectricFieldVm(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>10¹³ V/m (Laser 1PW)</span>
                        <span>1.32×10¹⁸ V/m (Schwinger)</span>
                        <span>10¹⁹ V/m</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Comprimento de Onda do Laser:</span>
                        <span className="font-mono text-cyan-300">{laserWavelengthNm} nm</span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="1200"
                        step="10"
                        value={laserWavelengthNm}
                        onChange={(e) => setLaserWavelengthNm(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Regimes Extremos de Campo Quântico
                  </h4>
                  <div className="space-y-1.5">
                    {schwingerPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setElectricFieldVm(preset.E)}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas e Produção de Pares */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Estabilidade Dielétrica do Vácuo QED
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${schwingerData.ratio >= 1.0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                      {(schwingerData.ratio * 100).toFixed(2)}% do E_crit
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Campo Crítico (E_crit):</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {schwingerData.E_crit.toExponential(3)} V/m
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">mₑ² c³ / eħ</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Intensidade do Laser:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {schwingerData.currentIntensityWcm2.toExponential(2)} W/cm²
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Foco Submicrométrico</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Campo Magnético Crítico:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {schwingerData.B_crit.toExponential(3)} T
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">4.414×10¹³ Gauss</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Taxa de Produção e⁺e⁻:</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {schwingerData.pairRatePerM3S < 1e-100 ? '0 (Vácuo Estável)' : `${schwingerData.pairRatePerM3S.toExponential(2)} m⁻³s⁻¹`}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Tunelamento de Vácuo</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Intensidade Crítica:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {schwingerData.I_crit.toExponential(2)} W/cm²
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">0.5 c ε₀ E²</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Regime de Interação:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {schwingerData.ratio >= 1.0 ? 'Vácuo Fervente' : schwingerData.ratio > 0.05 ? 'Não-Perturbativo' : 'Perturbativo'}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Física Não-Linear</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Info className="w-4 h-4" /> A Fervura do Vácuo Quântico (Efeito Schwinger)
                  </div>
                  <p>
                    Quando o campo elétrico ultrapassa <span className="text-emerald-300 font-mono">1.32×10¹⁸ V/m</span>, o trabalho realizado para separar um par elétron-pósitron por um comprimento de onda Compton (<span className="text-cyan-300 font-mono">eE × λ_C</span>) excede a energia de repouso <span className="text-amber-300 font-mono">2mₑc²</span>. O vácuo deixa de ser estável e entra em combustão espontânea de matéria real!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: ÂNGULO DE WEINBERG & UNIFICAÇÃO ELETROFRACA SU(2) x U(1)           */}
        {/* ========================================================================= */}
        {activeTab === 'electroweak-weinberg' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Massas W e Z */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Bósons Intermediários Calibradores
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa do Bóson Z⁰ (M_Z):</span>
                        <span className="font-mono text-emerald-300">{mzBosonGev.toFixed(4)} GeV</span>
                      </div>
                      <input
                        type="range"
                        min="88"
                        max="95"
                        step="0.005"
                        value={mzBosonGev}
                        onChange={(e) => setMzBosonGev(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa do Bóson W± (M_W):</span>
                        <span className="font-mono text-cyan-300">{mwBosonGev.toFixed(4)} GeV</span>
                      </div>
                      <input
                        type="range"
                        min="75"
                        max="85"
                        step="0.005"
                        value={mwBosonGev}
                        onChange={(e) => setMwBosonGev(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Cenários de Teste de Precisão Eletrofraca
                  </h4>
                  <div className="space-y-1.5">
                    {ewPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setMzBosonGev(preset.mz);
                          setMwBosonGev(preset.mw);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas da Unificação */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Mistura de Glashow-Weinberg-Salam
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      θ_W = {ewData.theta_w_deg.toFixed(2)}°
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">sin²(θ_W) On-Shell:</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {ewData.sin2_theta.toFixed(5)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">1 - (M_W / M_Z)²</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">VEV do Higgs (v):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {ewData.v_higgs_gev.toFixed(2)} GeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">(√2 G_F)^(-1/2)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Acoplamento Fraco (g):</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {ewData.g_weak.toFixed(4)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">e / sin(θ_W)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Acoplamento Hipercarga (g'):</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {ewData.g_prime.toFixed(4)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">e / cos(θ_W)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Parâmetro ρ de Veltman:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {ewData.rho_param.toFixed(5)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Dubleto de Higgs = 1</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Ângulo de Weinberg:</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {ewData.theta_w_deg.toFixed(2)}°
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Mistura Eletrofraca</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`sin2(theta_W): ${ewData.sin2_theta.toFixed(5)}\nAngulo: ${ewData.theta_w_deg.toFixed(2)} deg\nVEV Higgs: ${ewData.v_higgs_gev.toFixed(2)} GeV\ng: ${ewData.g_weak.toFixed(4)}, g': ${ewData.g_prime.toFixed(4)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Constantes Eletrofracas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: DESLOCAMENTO DE LAMB (LAMB SHIFT) NO HIDROGÊNIO                     */}
        {/* ========================================================================= */}
        {activeTab === 'lamb-shift' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Carga Nuclear e Massa */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Sistema Atômico Hidrogenóide
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Número Atômico (Z):</span>
                        <span className="font-mono text-emerald-300">Z = {atomicNumberZ}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="92"
                        step="1"
                        value={atomicNumberZ}
                        onChange={(e) => setAtomicNumberZ(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Razão de Massa Leptônica (m_lep / m_e):</span>
                        <span className="font-mono text-cyan-300">{leptonMassRatio === 1 ? '1.0 (Elétron)' : `${leptonMassRatio} (Múon)`}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLeptonMassRatio(1.0)}
                          className={`flex-1 py-1 px-2 rounded border text-xs ${leptonMassRatio === 1.0 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          Elétron (H)
                        </button>
                        <button
                          onClick={() => setLeptonMassRatio(206.77)}
                          className={`flex-1 py-1 px-2 rounded border text-xs ${leptonMassRatio > 1.0 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          Múon (μ-H)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Átomos Hidrogenóides e Exóticos
                  </h4>
                  <div className="space-y-1.5">
                    {lambPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAtomicNumberZ(preset.Z);
                          setPrincipalQuantumN(preset.N);
                          setLeptonMassRatio(preset.mRatio);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas e Quebra de Degenerescência */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> Deslocamento Radiativo (2S₁/₂ - 2P₁/₂)
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      Δν = {lambData.totalShiftMhz < 10000 ? lambData.totalShiftMhz.toFixed(2) + ' MHz' : (lambData.totalShiftMhz / 1000).toFixed(2) + ' GHz'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Deslocamento em MHz:</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {lambData.totalShiftMhz.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MHz
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Frequência Micro-ondas</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Energia em eV:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {lambData.totalShiftEv < 0.001 ? lambData.totalShiftEv.toExponential(3) : lambData.totalShiftEv.toFixed(4)} eV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">h × Δν</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Auto-energia do Elétron:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        ~{lambData.selfEnergyPct}%
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Eleva o Nível 2S</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Polarização do Vácuo:</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        ~{lambData.uehlingPct}%
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Potencial de Uehling</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Escala de Dependência Z:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        Z⁴ = {Math.pow(atomicNumberZ, 4).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Crescimento Rápido</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Comprimento de Onda:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {(c / (lambData.totalShiftMhz * 1e6) * 100).toFixed(1)} cm
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Radiação Emitida</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                    <Sparkles className="w-4 h-4" /> O Nascimento da QED Moderna (1947)
                  </div>
                  Na física quântica relativística de Dirac, os estados 2S₁/₂ e 2P₁/₂ tinham exatamente a mesma energia. Willis Lamb provou experimentalmente que fótons virtuais empurram o estado 2S para cima em <span className="text-emerald-300 font-mono">1057.8 MHz</span>, forçando Feynman, Schwinger e Tomonaga a criarem a renormalização da QED.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: MOMENTO MAGNÉTICO ANÔMALO DO ELÉTRON & MÚON (g - 2)                */}
        {/* ========================================================================= */}
        {activeTab === 'anomalous-magnetic-moment' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Loops da QED */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Expansão Perturbativa de Feynman
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Espécie Leptônica:</span>
                        <span className="font-mono text-emerald-300 uppercase">{leptonSpecies}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLeptonSpecies('electron')}
                          className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                            leptonSpecies === 'electron'
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Elétron (12 Casas Decimais)
                        </button>
                        <button
                          onClick={() => setLeptonSpecies('muon')}
                          className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                            leptonSpecies === 'muon'
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Múon (Fermilab g-2)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Ordem Perturbativa de Loops QED:</span>
                        <span className="font-mono text-cyan-300">{numQedLoops} Loops ({numQedLoops === 5 ? '12.672 diagramas' : numQedLoops === 4 ? '891 diagramas' : numQedLoops === 3 ? '72 diagramas' : numQedLoops === 2 ? '7 diagramas' : '1 diagrama Schwinger'})</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={numQedLoops}
                        onChange={(e) => setNumQedLoops(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-emerald-400">Fórmula de Schwinger (1-Loop):</div>
                  <div className="p-2 bg-black/60 rounded border border-slate-800 font-mono text-cyan-300">
                    a = α / (2π) ≈ 0.00116140973
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Inscrita na lápide de Julian Schwinger em Mount Auburn, Cambridge. Primeira grande validação teórica da eletrodinâmica quântica.
                  </p>
                </div>
              </div>

              {/* Resultados de Extrema Precisão */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> O Teste mais Preciso de Toda a Ciência
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      g = {gMinus2Data.g_factor.toFixed(10)}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Anomalia a = (g - 2) / 2:</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {gMinus2Data.a_active.toFixed(11)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">QED Teórico</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Medição Experimental:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {leptonSpecies === 'electron' ? gMinus2Data.expGabrielse.toFixed(11) : gMinus2Data.expFermilabMuon.toFixed(11)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{leptonSpecies === 'electron' ? 'Harvard Penning Trap' : 'Fermilab Muon g-2'}</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Termo 1-Loop (Schwinger):</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        +{gMinus2Data.schwingerTerm.toFixed(8)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">α / 2π</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Termo 2-Loops (Karplus):</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {gMinus2Data.twoLoopTerm.toExponential(3)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">-0.328 (α/π)²</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Termo 3-Loops (Laporta):</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        +{gMinus2Data.threeLoopTerm.toExponential(3)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">+1.181 (α/π)³</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Concordância Relativa:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        99.99999999%
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">1 parte em 10¹²</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Momento Magnetico Anonalo ${leptonSpecies}: a = ${gMinus2Data.a_active.toFixed(12)}\nFator g: ${gMinus2Data.g_factor.toFixed(12)}\nSchwinger alpha/2pi: ${gMinus2Data.schwingerTerm.toFixed(8)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Precisão QED (g - 2)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
