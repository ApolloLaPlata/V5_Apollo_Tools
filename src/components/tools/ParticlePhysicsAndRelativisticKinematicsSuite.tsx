'use client';

import React, { useState, useMemo } from 'react';
import {
  Atom,
  Zap,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Info,
  Sliders,
  Eye,
  Activity,
  Flame,
  Circle,
  Layers,
  Search,
  BarChart2,
  Maximize2,
  Crosshair,
  Share2
} from 'lucide-react';

export function ParticlePhysicsAndRelativisticKinematicsSuite({
  defaultTab = 'standard-model-particles-explorer'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'standard-model' | 'mandelstam' | 'breit-wigner' | 'feynman' | 'bethe-bloch'
  >(() => {
    if (defaultTab === 'mandelstam-variables-kinematics-calc' || defaultTab === 'mandelstam') return 'mandelstam';
    if (defaultTab === 'breit-wigner-decay-resonance-calc' || defaultTab === 'breit-wigner') return 'breit-wigner';
    if (defaultTab === 'feynman-diagram-svg-builder' || defaultTab === 'feynman') return 'feynman';
    if (defaultTab === 'bethe-bloch-stopping-power-calc' || defaultTab === 'bethe-bloch') return 'bethe-bloch';
    return 'standard-model';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: EXPLORADOR DO MODELO PADRÃO DA FÍSICA DE PARTÍCULAS         */
  /* -------------------------------------------------------------------------- */
  interface SM_Particle {
    symbol: string;
    name: string;
    type: 'quark' | 'lepton' | 'gauge-boson' | 'scalar-boson';
    gen: 1 | 2 | 3 | 0;
    mass: string;
    charge: string;
    spin: string;
    color: string;
    desc: string;
  }

  const SM_PARTICLES: SM_Particle[] = [
    // Quarks
    { symbol: 'u', name: 'Up', type: 'quark', gen: 1, mass: '2.16 MeV/c²', charge: '+2/3', spin: '1/2', color: '#38bdf8', desc: 'Constituinte dos prótons (uud) e nêutrons (udd).' },
    { symbol: 'd', name: 'Down', type: 'quark', gen: 1, mass: '4.67 MeV/c²', charge: '-1/3', spin: '1/2', color: '#38bdf8', desc: 'Férmion estável que compõe a matéria bariônica cotidiana.' },
    { symbol: 'c', name: 'Charm', type: 'quark', gen: 2, mass: '1.27 GeV/c²', charge: '+2/3', spin: '1/2', color: '#38bdf8', desc: 'Descoberto na revolução de novembro de 1974 através do méson J/ψ.' },
    { symbol: 's', name: 'Strange', type: 'quark', gen: 2, mass: '93.4 MeV/c²', charge: '-1/3', spin: '1/2', color: '#38bdf8', desc: 'Possui número quântico de estranheza S=-1, presente em hiperons e káons.' },
    { symbol: 't', name: 'Top', type: 'quark', gen: 3, mass: '172.69 GeV/c²', charge: '+2/3', spin: '1/2', color: '#38bdf8', desc: 'Partícula elementar mais massiva do universo, decai antes de hadronizar.' },
    { symbol: 'b', name: 'Bottom', type: 'quark', gen: 3, mass: '4.18 GeV/c²', charge: '-1/3', spin: '1/2', color: '#38bdf8', desc: 'Crucial para estudos de violação de simetria CP em mésons B.' },

    // Léptons
    { symbol: 'e⁻', name: 'Elétron', type: 'lepton', gen: 1, mass: '0.511 MeV/c²', charge: '-1', spin: '1/2', color: '#4ade80', desc: 'Lepton carregado estável, base da estrutura atômica e química.' },
    { symbol: 'νₑ', name: 'Neutrino do Elétron', type: 'lepton', gen: 1, mass: '< 0.8 eV/c²', charge: '0', spin: '1/2', color: '#4ade80', desc: 'Partícula neutra quase sem massa, interage apenas via força fraca.' },
    { symbol: 'μ⁻', name: 'Múon', type: 'lepton', gen: 2, mass: '105.66 MeV/c²', charge: '-1', spin: '1/2', color: '#4ade80', desc: 'Elétron pesado com tempo de vida de 2.2 microssegundos.' },
    { symbol: 'ν_μ', name: 'Neutrino do Múon', type: 'lepton', gen: 2, mass: '< 0.19 MeV/c²', charge: '0', spin: '1/2', color: '#4ade80', desc: 'Emitido no decaimento de píons carregados e múons.' },
    { symbol: 'τ⁻', name: 'Tau', type: 'lepton', gen: 3, mass: '1.777 GeV/c²', charge: '-1', spin: '1/2', color: '#4ade80', desc: 'Lepton extremamente massivo capaz de decair em hádrons.' },
    { symbol: 'ν_τ', name: 'Neutrino do Tau', type: 'lepton', gen: 3, mass: '< 18.2 MeV/c²', charge: '0', spin: '1/2', color: '#4ade80', desc: 'Último méson/lepton do modelo padrão confirmado pelo DONUT (2000).' },

    // Bósons de Calibre (Gauge)
    { symbol: 'γ', name: 'Fóton', type: 'gauge-boson', gen: 0, mass: '0', charge: '0', spin: '1', color: '#facc15', desc: 'Mediador da força eletromagnética com alcance infinito (QED).' },
    { symbol: 'g', name: 'Glúon', type: 'gauge-boson', gen: 0, mass: '0', charge: '0', spin: '1', color: '#facc15', desc: 'Mediador da força forte cromodinâmica (QCD) com 8 cargas de cor.' },
    { symbol: 'W±', name: 'Bóson W', type: 'gauge-boson', gen: 0, mass: '80.379 GeV/c²', charge: '±1', spin: '1', color: '#facc15', desc: 'Media interações de corrente carregada fraca (decaimento beta).' },
    { symbol: 'Z⁰', name: 'Bóson Z', type: 'gauge-boson', gen: 0, mass: '91.188 GeV/c²', charge: '0', spin: '1', color: '#facc15', desc: 'Media interações de corrente neutra fraca no Modelo Eletrofraco.' },

    // Bóson Escalar
    { symbol: 'H⁰', name: 'Bóson de Higgs', type: 'scalar-boson', gen: 0, mass: '125.25 GeV/c²', charge: '0', spin: '0', color: '#c084fc', desc: 'Gera massa para férmions e bósons W/Z por quebra espontânea de simetria eletrofraca.' }
  ];

  const [selectedParticle, setSelectedParticle] = useState<SM_Particle>(SM_PARTICLES[0]);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredParticles = useMemo(() => {
    if (filterType === 'all') return SM_PARTICLES;
    return SM_PARTICLES.filter((p) => p.type === filterType);
  }, [filterType]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: VARIÁVEIS DE MANDELSTAM (CINEMÁTICA RELATIVÍSTICA 2->2)     */
  /* -------------------------------------------------------------------------- */
  const [mass1, setMass1] = useState<number>(0.938); // Próton m1 (GeV)
  const [mass2, setMass2] = useState<number>(0.938); // Próton m2 (GeV)
  const [beamEnergyE1, setBeamEnergyE1] = useState<number>(7000); // E1 (GeV no LHC = 7 TeV)
  const [scatterThetaDeg, setScatterThetaDeg] = useState<number>(45); // Ângulo de espalhamento theta CM

  const mandelstamResults = useMemo(() => {
    const m1 = Math.max(0.0005, mass1);
    const m2 = Math.max(0.0005, mass2);
    const E1 = Math.max(m1, beamEnergyE1);

    // Sistema de Centro de Massa em colisão de feixes simétricos (LHC: E1 = E2 = E_beam)
    // s = (p1 + p2)^2 = (E1 + E2)^2 - (p1 + p2)^2
    // Para feixes contrapropagantes no CM: s = 4 * E_beam^2
    const s = 4 * E1 * E1; // GeV^2
    const sqrtS_TeV = (Math.sqrt(s) / 1000).toFixed(2); // TeV

    // Momento no centro de massa p* = sqrt(E1^2 - m1^2)
    const p_star = Math.sqrt(Math.max(0, E1 * E1 - m1 * m1));

    // Variável t = (p1 - p3)^2 = -2 * p*^2 * (1 - cos(theta)) para espalhamento elástico
    const thetaRad = (scatterThetaDeg * Math.PI) / 180;
    const t = -2 * p_star * p_star * (1 - Math.cos(thetaRad));

    // Variável u = (p1 - p4)^2 = -2 * p*^2 * (1 + cos(theta))
    const u = -2 * p_star * p_star * (1 + Math.cos(thetaRad));

    // Verificação de conservação: s + t + u = sum(m_i^2) = 4 * m1^2
    const sumMandelstam = s + t + u;
    const sumMassesSq = 2 * (m1 * m1 + m2 * m2);

    return {
      s: s.toExponential(4),
      sqrtS_TeV,
      t: t.toExponential(4),
      u: u.toExponential(4),
      sumMandelstam: sumMandelstam.toFixed(2),
      sumMassesSq: sumMassesSq.toFixed(2),
      p_star: p_star.toFixed(1)
    };
  }, [mass1, mass2, beamEnergyE1, scatterThetaDeg]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: RESSONÂNCIA DE BREIT-WIGNER & TEMPO DE VIDA HEISENBERG       */
  /* -------------------------------------------------------------------------- */
  const RESONANCES: { [key: string]: { name: string; massGeV: number; widthGeV: number } } = {
    z_boson: { name: 'Bóson Z⁰ (LEP / LHC)', massGeV: 91.1876, widthGeV: 2.4952 },
    w_boson: { name: 'Bóson W±', massGeV: 80.379, widthGeV: 2.085 },
    higgs: { name: 'Bóson de Higgs (H⁰)', massGeV: 125.25, widthGeV: 0.00407 },
    j_psi: { name: 'Méson J/ψ (Charmônio)', massGeV: 3.0969, widthGeV: 0.0000929 }
  };

  const [selectedResonanceKey, setSelectedResonanceKey] = useState<string>('z_boson');
  const [resonanceEnergyE, setResonanceEnergyE] = useState<number>(91.2); // GeV

  const breitWignerResults = useMemo(() => {
    const res = RESONANCES[selectedResonanceKey];
    const M = res.massGeV;
    const Gamma = res.widthGeV;
    const E = Math.max(0.1, resonanceEnergyE);

    // Seção de choque relativa Breit-Wigner não-relativística/relativística
    // sigma(E) proportional to (Gamma^2 / 4) / ((E - M)^2 + Gamma^2 / 4)
    const gammaHalf = Gamma / 2;
    const deltaE = E - M;
    const denominator = deltaE * deltaE + gammaHalf * gammaHalf;
    const bwShape = (gammaHalf * gammaHalf) / denominator;

    // Tempo de vida tau = hbar / Gamma
    // hbar = 6.582119569e-25 GeV * s
    const hbar = 6.582119569e-25;
    const lifetimeSeconds = hbar / Gamma;

    return {
      res,
      M: M.toFixed(4),
      Gamma: Gamma.toFixed(4),
      bwShapePercent: (bwShape * 100).toFixed(1),
      lifetimeSci: lifetimeSeconds.toExponential(3)
    };
  }, [selectedResonanceKey, resonanceEnergyE]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: CONSTRUTOR DE DIAGRAMAS DE FEYNMAN EM SVG                    */
  /* -------------------------------------------------------------------------- */
  const FEYNMAN_PRESETS: { [key: string]: { name: string; type: string; desc: string; svgCode: React.ReactNode } } = {
    ee_mumu: {
      name: 'Aniquilação e⁻ e⁺ → μ⁻ μ⁺ (Canal s)',
      type: 'QED',
      desc: 'Um elétron e um pósitron aniquilam-se em um fóton virtual γ, que se materializa em um par múon-antimúon.',
      svgCode: (
        <svg viewBox="0 0 300 180" className="w-full max-w-sm h-44">
          {/* Elétron de entrada */}
          <line x1="30" y1="30" x2="110" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
          <polygon points="75,56 80,63 70,60" fill="#38bdf8" />
          <text x="25" y="25" fill="#38bdf8" fontSize="11" fontFamily="monospace">e⁻</text>

          {/* Pósitron de entrada */}
          <line x1="30" y1="150" x2="110" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
          <polygon points="65,123 70,116 75,124" fill="#38bdf8" />
          <text x="25" y="165" fill="#38bdf8" fontSize="11" fontFamily="monospace">e⁺</text>

          {/* Vórtice 1 */}
          <circle cx="110" cy="90" r="4" fill="#facc15" />

          {/* Fóton virtual intermediário (onda) */}
          <path d="M 110,90 Q 125,75 140,90 T 170,90 T 190,90" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
          <text x="145" y="75" fill="#facc15" fontSize="10" fontFamily="monospace">γ*</text>

          {/* Vórtice 2 */}
          <circle cx="190" cy="90" r="4" fill="#facc15" />

          {/* Múon de saída */}
          <line x1="190" y1="90" x2="270" y2="30" stroke="#4ade80" strokeWidth="2.5" />
          <polygon points="225,64 235,60 230,69" fill="#4ade80" />
          <text x="275" y="25" fill="#4ade80" fontSize="11" fontFamily="monospace">μ⁻</text>

          {/* Antimúon de saída */}
          <line x1="190" y1="90" x2="270" y2="150" stroke="#4ade80" strokeWidth="2.5" />
          <polygon points="230,116 235,124 225,120" fill="#4ade80" />
          <text x="275" y="165" fill="#4ade80" fontSize="11" fontFamily="monospace">μ⁺</text>
        </svg>
      )
    },
    beta_decay: {
      name: 'Decaimento Beta do Nêutron (n → p e⁻ ν̄)',
      type: 'Eletrofraco',
      desc: 'Um quark d do nêutron transforma-se em um quark u emitindo um bóson W⁻, que decai em um elétron e antineutrino.',
      svgCode: (
        <svg viewBox="0 0 300 180" className="w-full max-w-sm h-44">
          {/* Nêutron / Quark d */}
          <line x1="30" y1="90" x2="120" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
          <polygon points="80,87 88,90 80,93" fill="#38bdf8" />
          <text x="20" y="94" fill="#38bdf8" fontSize="11" fontFamily="monospace">d (n)</text>

          {/* Vórtice fraco */}
          <circle cx="120" cy="90" r="4" fill="#facc15" />

          {/* Quark u / Próton */}
          <line x1="120" y1="90" x2="270" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
          <polygon points="190,62 198,59 194,67" fill="#38bdf8" />
          <text x="275" y="30" fill="#38bdf8" fontSize="11" fontFamily="monospace">u (p)</text>

          {/* Bóson W⁻ virtual */}
          <path d="M 120,90 Q 140,115 160,115 T 190,130" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="3 3" />
          <text x="145" y="130" fill="#facc15" fontSize="10" fontFamily="monospace">W⁻</text>

          {/* Vórtice lépton */}
          <circle cx="190" cy="130" r="4" fill="#facc15" />

          {/* Elétron */}
          <line x1="190" y1="130" x2="270" y2="105" stroke="#4ade80" strokeWidth="2.5" />
          <polygon points="230,118 238,116 234,123" fill="#4ade80" />
          <text x="275" y="108" fill="#4ade80" fontSize="11" fontFamily="monospace">e⁻</text>

          {/* Antineutrino */}
          <line x1="190" y1="130" x2="270" y2="160" stroke="#a855f7" strokeWidth="2.5" />
          <polygon points="226,144 234,147 230,140" fill="#a855f7" />
          <text x="275" y="165" fill="#a855f7" fontSize="11" fontFamily="monospace">ν̄ₑ</text>
        </svg>
      )
    },
    compton: {
      name: 'Espalhamento Compton (e⁻ γ → e⁻ γ)',
      type: 'QED',
      desc: 'Um fóton incide sobre um elétron em repouso, transferindo momento e emergindo com comprimento de onda aumentado.',
      svgCode: (
        <svg viewBox="0 0 300 180" className="w-full max-w-sm h-44">
          <line x1="30" y1="140" x2="110" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="25" y="155" fill="#38bdf8" fontSize="11" fontFamily="monospace">e⁻ (in)</text>

          <path d="M 30,40 Q 50,55 70,55 T 110,90" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
          <text x="25" y="35" fill="#facc15" fontSize="11" fontFamily="monospace">γ (in)</text>

          <circle cx="110" cy="90" r="4" fill="#facc15" />
          <line x1="110" y1="90" x2="190" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="190" cy="90" r="4" fill="#facc15" />

          <path d="M 190,90 Q 220,55 240,40 T 270,30" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
          <text x="275" y="30" fill="#facc15" fontSize="11" fontFamily="monospace">γ (out)</text>

          <line x1="190" y1="90" x2="270" y2="150" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="275" y="160" fill="#38bdf8" fontSize="11" fontFamily="monospace">e⁻ (out)</text>
        </svg>
      )
    }
  };

  const [selectedFeynmanKey, setSelectedFeynmanKey] = useState<string>('ee_mumu');

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: PERDA DE ENERGIA BETHE-BLOCH & PICO DE BRAGG                */
  /* -------------------------------------------------------------------------- */
  const TARGET_MATERIALS: { [key: string]: { name: string; Z: number; A: number; rho: number; I_eV: number } } = {
    water: { name: 'Água / Tecido Biológico (H₂O)', Z: 7.42, A: 12.5, rho: 1.0, I_eV: 75.0 },
    silicon: { name: 'Silício (Detector Semicondutor)', Z: 14, A: 28.08, rho: 2.33, I_eV: 173.0 },
    lead: { name: 'Chumbo (Blindagem Pb)', Z: 82, A: 207.2, rho: 11.34, I_eV: 823.0 },
    air: { name: 'Ar (STP)', Z: 7.3, A: 14.4, rho: 0.0012, I_eV: 85.7 }
  };

  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string>('water');
  const [projectileType, setProjectileType] = useState<'proton' | 'muon' | 'alpha'>('proton');
  const [projectileKineticEnergyMeV, setProjectileKineticEnergyMeV] = useState<number>(150); // 150 MeV típico de próton-terapia

  const betheBlochResults = useMemo(() => {
    const mat = TARGET_MATERIALS[selectedMaterialKey];
    const T_MeV = Math.max(1.0, projectileKineticEnergyMeV);

    let M_proj_MeV = 938.272; // Próton
    let z_charge = 1;
    if (projectileType === 'muon') {
      M_proj_MeV = 105.66;
      z_charge = 1;
    } else if (projectileType === 'alpha') {
      M_proj_MeV = 3727.38;
      z_charge = 2;
    }

    // Fatores relativísticos
    // E_total = T + M
    const E_total = T_MeV + M_proj_MeV;
    const gamma = E_total / M_proj_MeV;
    const beta = Math.sqrt(Math.max(0, 1 - 1 / (gamma * gamma)));

    // Constante K = 4 * pi * N_A * r_e^2 * m_e * c^2 = 0.307075 MeV * cm^2 / mol
    const K = 0.307075;
    const m_e_c2 = 0.5109989; // MeV
    const I_MeV = mat.I_eV * 1e-6; // MeV

    // W_max = (2 * m_e * c^2 * beta^2 * gamma^2) / (1 + 2 * gamma * (m_e / M) + (m_e / M)^2)
    const ratio_m = m_e_c2 / M_proj_MeV;
    const W_max = (2 * m_e_c2 * beta * beta * gamma * gamma) / (1 + 2 * gamma * ratio_m + ratio_m * ratio_m);

    // Termo logarítmico Bethe-Bloch
    const logTerm = Math.log((2 * m_e_c2 * beta * beta * gamma * gamma * W_max) / (I_MeV * I_MeV));
    const stoppingPower_mass =
      ((K * z_charge * z_charge * mat.Z) / (mat.A * beta * beta)) *
      (0.5 * logTerm - beta * beta); // MeV * cm^2 / g

    const stoppingPower_linear = Math.max(0.1, stoppingPower_mass * mat.rho); // MeV / cm

    // Alcance aproximado (Range R em cm via aproximação CSDA)
    // R ~ T / (2 * dE/dx) na média
    const approxRangeCm = T_MeV / (stoppingPower_linear * 1.6);

    return {
      mat,
      beta: beta.toFixed(4),
      gamma: gamma.toFixed(2),
      stoppingPowerLinear: stoppingPower_linear.toFixed(2),
      stoppingPowerMass: stoppingPower_mass.toFixed(2),
      approxRangeCm: approxRangeCm.toFixed(2)
    };
  }, [selectedMaterialKey, projectileType, projectileKineticEnergyMeV]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-500/20 via-slate-800 to-cyan-500/20 border border-purple-500/40 text-purple-400 shadow-inner">
            <Atom className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                CAPITANIA #11 · SUÍTE #92
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                470 FERRAMENTAS
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Física de Partículas, Modelo Padrão & Cinemática Relativística
            </h2>
            <p className="text-sm text-slate-400">
              Explorador do Modelo Padrão (Quarks & Léptons), Variáveis de Mandelstam, Ressonâncias Breit-Wigner, Diagramas de Feynman em SVG e Poder de Frenagem Bethe-Bloch.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA SUÍTE */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('standard-model')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'standard-model'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Atom className="w-4 h-4" />
          <span>Modelo Padrão</span>
        </button>

        <button
          onClick={() => setActiveTab('mandelstam')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mandelstam'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Variáveis de Mandelstam (s, t, u)</span>
        </button>

        <button
          onClick={() => setActiveTab('breit-wigner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'breit-wigner'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Ressonância Breit-Wigner & Vida Média</span>
        </button>

        <button
          onClick={() => setActiveTab('feynman')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'feynman'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Diagramas de Feynman (SVG)</span>
        </button>

        <button
          onClick={() => setActiveTab('bethe-bloch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'bethe-bloch'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Fórmula Bethe-Bloch & Pico de Bragg</span>
        </button>
      </div>

      {/* ABA 1: EXPLORADOR DO MODELO PADRÃO */}
      {activeTab === 'standard-model' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Atom className="w-5 h-5 text-purple-400" />
                Matriz de Partículas Elementares (17 Blocos Fundamentais)
              </h3>
              <div className="flex gap-1.5 text-xs">
                {['all', 'quark', 'lepton', 'gauge-boson', 'scalar-boson'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg font-mono capitalize transition ${
                      filterType === t
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {t === 'all' ? 'Todos' : t.replace('-boson', '')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {filteredParticles.map((p) => {
                const isSelected = selectedParticle.symbol === p.symbol;
                return (
                  <button
                    key={p.symbol}
                    onClick={() => setSelectedParticle(p)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-between min-h-[90px] ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 shadow-lg ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{p.type.replace('-boson', '')}</span>
                    <span className="text-2xl font-black font-mono my-1" style={{ color: p.color }}>
                      {p.symbol}
                    </span>
                    <span className="text-xs font-medium text-slate-300 truncate w-full">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Ficha Quântica Detalhada
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-4xl font-mono font-black" style={{ color: selectedParticle.color }}>
                {selectedParticle.symbol}
              </div>
              <div className="text-lg font-bold text-slate-100 mt-1">{selectedParticle.name}</div>
              <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">{selectedParticle.type}</div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Massa de Repouso:</span>
                <span className="text-purple-300 font-bold">{selectedParticle.mass}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Carga Elétrica (Q):</span>
                <span className="text-cyan-300 font-bold">{selectedParticle.charge} e</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Spin Intrínseco (J):</span>
                <span className="text-amber-300 font-bold">{selectedParticle.spin} ħ</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed p-3 rounded-xl bg-slate-950 border border-slate-800">
              {selectedParticle.desc}
            </p>
          </div>
        </div>
      )}

      {/* ABA 2: VARIÁVEIS DE MANDELSTAM */}
      {activeTab === 'mandelstam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              Parâmetros de Colisão 2 → 2 Relativística
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              As variáveis invariantes de Lorentz de Mandelstam (s, t, u) descrevem a energia de centro de massa e o quadrado da transferência de momento quadri-vetorial.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Energia do Feixe (E_beam por feixe)</span>
                  <span className="text-cyan-400">{beamEnergyE1} GeV</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="7000"
                  step="50"
                  value={beamEnergyE1}
                  onChange={(e) => setBeamEnergyE1(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Ângulo de Espalhamento no CM (θ*)</span>
                  <span className="text-cyan-400">{scatterThetaDeg}°</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="179"
                  step="1"
                  value={scatterThetaDeg}
                  onChange={(e) => setScatterThetaDeg(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 mb-1 block">Massa Partícula 1 (m₁)</label>
                  <input
                    type="number"
                    value={mass1}
                    onChange={(e) => setMass1(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500">GeV/c² (Próton ~0.938)</span>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Massa Partícula 2 (m₂)</label>
                  <input
                    type="number"
                    value={mass2}
                    onChange={(e) => setMass2(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500">GeV/c²</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Invariantes Cinemáticos de Mandelstam
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Canal s (CM Energy²)</div>
                <div className="text-xl font-mono font-bold text-cyan-300">{mandelstamResults.s}</div>
                <div className="text-xs text-slate-500 mt-1">√s = {mandelstamResults.sqrtS_TeV} TeV</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Canal t (Transferência q²)</div>
                <div className="text-xl font-mono font-bold text-purple-300">{mandelstamResults.t}</div>
                <div className="text-xs text-slate-500 mt-1">GeV² (Ângulo θ={scatterThetaDeg}°)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Canal Cruzado u</div>
                <div className="text-xl font-mono font-bold text-amber-300">{mandelstamResults.u}</div>
                <div className="text-xs text-slate-500 mt-1">GeV²</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold">Identidade de Mandelstam (s + t + u = Σ mᵢ²):</div>
              <div className="flex justify-between">
                <span>s + t + u calculado:</span>
                <span className="text-cyan-400 font-bold">{mandelstamResults.sumMandelstam} GeV²</span>
              </div>
              <div className="flex justify-between">
                <span>Soma teórica das massas quadráticas:</span>
                <span className="text-emerald-400 font-bold">{mandelstamResults.sumMassesSq} GeV²</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: RESSONÂNCIA DE BREIT-WIGNER */}
      {activeTab === 'breit-wigner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Seleção de Bóson & Energia de Teste
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A distribuição relativística de Breit-Wigner modela o pico da seção de choque de produção de partículas instáveis de vida ultracurta com largura de decaimento natural Γ.
            </p>

            <div className="space-y-2">
              {Object.entries(RESONANCES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedResonanceKey(key);
                    setResonanceEnergyE(val.massGeV);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex justify-between items-center ${
                    selectedResonanceKey === key
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-slate-200">{val.name}</span>
                  <span className="font-mono text-slate-500 text-[10px]">M={val.massGeV} GeV</span>
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Energia de Centro de Massa (E)</span>
                <span className="text-amber-400">{resonanceEnergyE} GeV</span>
              </div>
              <input
                type="range"
                min={breitWignerResults.res.massGeV - breitWignerResults.res.widthGeV * 4}
                max={breitWignerResults.res.massGeV + breitWignerResults.res.widthGeV * 4}
                step={breitWignerResults.res.widthGeV / 20}
                value={resonanceEnergyE}
                onChange={(e) => setResonanceEnergyE(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Perfil de Ressonância & Tempo de Vida Heisenberg
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Massa de Ressonância (M)</div>
                <div className="text-xl font-mono font-bold text-amber-300">{breitWignerResults.M} GeV</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Largura Total (Γ - FWHM)</div>
                <div className="text-xl font-mono font-bold text-purple-300">{breitWignerResults.Gamma} GeV</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Tempo de Vida Médio (τ)</div>
                <div className="text-xl font-mono font-bold text-cyan-300">{breitWignerResults.lifetimeSci} s</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Intensidade Relativa da Seção de Choque σ(E):</span>
                <span className="text-amber-400 font-bold">{breitWignerResults.bwShapePercent}% do pico máximo</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200"
                  style={{ width: `${breitWignerResults.bwShapePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: DIAGRAMAS DE FEYNMAN EM SVG */}
      {activeTab === 'feynman' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Processos da Teoria Quântica de Campos
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diagramas de Feynman representam amplitudes de espalhamento perturbativas com propagadores virtuais e vértices de acoplamento da QED e Modelo Eletrofraco.
            </p>

            <div className="space-y-2">
              {Object.entries(FEYNMAN_PRESETS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFeynmanKey(key)}
                  className={`w-full p-3 rounded-xl text-left text-xs transition border ${
                    selectedFeynmanKey === key
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-200">{val.name}</span>
                    <span className="font-mono text-indigo-400">{val.type}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{val.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-1">
                <Eye className="w-5 h-5 text-indigo-400" />
                Renderizador Vetorial SVG do Diagrama
              </h3>
              <p className="text-xs text-slate-400">
                {FEYNMAN_PRESETS[selectedFeynmanKey].name}
              </p>
            </div>

            <div className="flex justify-center p-6 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              {FEYNMAN_PRESETS[selectedFeynmanKey].svgCode}
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <span>Convenção: Linha Azul = Férmion · Linha Amarela = Fóton/Gauge</span>
              <button
                onClick={() => copyToClipboard(FEYNMAN_PRESETS[selectedFeynmanKey].desc)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Descrição</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: BETHE-BLOCH & PICO DE BRAGG */}
      {activeTab === 'bethe-bloch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Projétil Ionizante & Meio Material
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A fórmula de Bethe-Bloch calcula a perda média de energia (-dE/dx) de partículas carregadas pesadas por ionização e excitação eletrônica do meio, gerando o Pico de Bragg no final do alcance.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Partícula Projétil:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['proton', 'muon', 'alpha'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProjectileType(p)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold capitalize transition border ${
                      projectileType === p
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Material Alvo (Absorvedor):
              </label>
              <div className="space-y-1.5">
                {Object.entries(TARGET_MATERIALS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMaterialKey(key)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex justify-between items-center ${
                      selectedMaterialKey === key
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-slate-200">{val.name}</span>
                    <span className="font-mono text-slate-500 text-[10px]">Z={val.Z} · ρ={val.rho} g/cm³</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Energia Cinética Inicial (T)</span>
                <span className="text-rose-400">{projectileKineticEnergyMeV} MeV</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={projectileKineticEnergyMeV}
                onChange={(e) => setProjectileKineticEnergyMeV(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-rose-400" />
              Poder de Frenagem & Alcance no Tecido
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Poder de Frenagem Linear</div>
                <div className="text-2xl font-mono font-bold text-rose-300">{betheBlochResults.stoppingPowerLinear}</div>
                <div className="text-xs text-slate-500 mt-1">MeV / cm</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Alcance Estimado (Range)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{betheBlochResults.approxRangeCm} cm</div>
                <div className="text-xs text-slate-500 mt-1">Profundidade do Pico de Bragg</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Velocidade Relativística (β)</div>
                <div className="text-2xl font-mono font-bold text-amber-300">{betheBlochResults.beta} c</div>
                <div className="text-xs text-slate-500 mt-1">Fator γ = {betheBlochResults.gamma}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200/90 leading-relaxed">
              <span className="font-bold">Princípio Clínico da Terapia por Prótons:</span> Ao contrário dos raios-X e elétrons que perdem energia continuamente na entrada, prótons pesados depositam a maior parte de sua dose na profundidade final exata do tumor (o Pico de Bragg), preservando os tecidos sadios adjacentes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ParticlePhysicsAndRelativisticKinematicsSuite;
