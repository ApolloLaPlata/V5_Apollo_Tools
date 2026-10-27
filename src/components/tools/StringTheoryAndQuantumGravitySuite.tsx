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
  Circle
} from 'lucide-react';

export function StringTheoryAndQuantumGravitySuite({
  defaultTab = 'string-planck-scale'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'string-planck-scale' | 'calabi-yau' | 'ads-cft-duality' | 'd-branes' | 'loop-quantum-gravity'
  >(() => {
    if (defaultTab === 'calabi-yau-compactification-euler-calc-tool' || defaultTab === 'calabi-yau') return 'calabi-yau';
    if (defaultTab === 'ads-cft-maldacena-duality-calc-tool' || defaultTab === 'ads-cft-duality') return 'ads-cft-duality';
    if (defaultTab === 'd-brane-ramond-charge-tension-tool' || defaultTab === 'd-branes') return 'd-branes';
    if (defaultTab === 'loop-quantum-gravity-area-spectrum-tool' || defaultTab === 'loop-quantum-gravity') return 'loop-quantum-gravity';
    return 'string-planck-scale';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Constantes Fundamentais da Gravidade Quântica */
  const HBAR = 1.054571817e-34; // J s
  const c = 2.99792458e8; // m/s
  const G = 6.67430e-11; // m^3 / (kg s^2)
  const K_B = 1.380649e-23; // J / K
  const PLANCK_LENGTH = 1.616255e-35; // m
  const PLANCK_TIME = 5.391247e-44; // s
  const PLANCK_MASS_GEV = 1.22091e19; // GeV

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: TENSÃO FUNDAMENTAL DA CORDA & ESCALA DE PLANCK               */
  /* -------------------------------------------------------------------------- */
  const [stringReggeSlopeGev2, setStringReggeSlopeGev2] = useState<number>(1e-36); // alpha' em GeV^-2
  const [stringCouplingGs, setStringCouplingGs] = useState<number>(0.1); // gs

  const stringPresets = [
    { label: 'Cordas Heteróticas Tradicionais (GUT)', alphaPrime: 2.5e-33, gs: 0.1, desc: 'Escala de unificação GUT Ms ≈ 2×10¹⁶ GeV' },
    { label: 'Cordas na Escala de Planck (Ms = Mp)', alphaPrime: 6.7e-39, gs: 1.0, desc: 'Gravidade quântica direta com comprimento de Planck elementar' },
    { label: 'Cenário ADD / TeV-Strings', alphaPrime: 0.01, gs: 0.05, desc: 'Grandes dimensões extras milimétricas com Ms ~ 10 TeV no alcance de colisores' },
    { label: 'Teoria-M em 11 Dimensões (Acoplamento Forte)', alphaPrime: 1e-38, gs: 10.0, desc: 'A 11ª dimensão espacial se abre com raio R11 = gs * ls' },
    { label: 'Regime Perturbativo Fraco', alphaPrime: 1e-34, gs: 0.01, desc: 'Expansão de superfícies de Riemann de ordem superior convergem rapidamente' }
  ];

  const stringData = useMemo(() => {
    const alpha_prime = Math.max(1e-45, stringReggeSlopeGev2);
    const gs = Math.max(0.001, stringCouplingGs);

    // Comprimento da corda ls = sqrt(alpha') em metros
    // Conversão de 1/GeV para metros: hbar * c = 0.197327e-15 GeV * m
    const hbar_c_m = 1.97327e-16; // GeV * m
    const ls_meters = Math.sqrt(alpha_prime) * hbar_c_m;

    // Massa característica da corda Ms = 1 / sqrt(alpha') em GeV
    const Ms_Gev = 1 / Math.sqrt(alpha_prime);

    // Tensão fundamental da corda T = 1 / (2 * pi * alpha')
    // Em Joules / metro ou Newtons:
    // T_newton = c^4 / (2 * pi * G_eff) ou (1 / 2pi) * (Ms * c^2) / ls
    const T_newtons = (Math.pow(c, 4)) / (2 * Math.PI * G * Math.pow(Math.max(1e-35, ls_meters) / PLANCK_LENGTH, 2));

    // Temperatura de Hagedorn T_H = Ms / (4 * pi) em Kelvin
    const TH_Gev = Ms_Gev / (4 * Math.PI);
    const TH_Kelvin = (TH_Gev * 1e9 * 1.6021766e-19) / K_B;

    // Raio da 11ª dimensão da Teoria-M: R11 = gs * ls
    const R11_meters = gs * ls_meters;

    return {
      ls_meters,
      Ms_Gev,
      T_newtons,
      TH_Gev,
      TH_Kelvin,
      R11_meters
    };
  }, [stringReggeSlopeGev2, stringCouplingGs]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: COMPACTIFICAÇÃO EM CALABI-YAU 6D & NÚMEROS DE HODGE          */
  /* -------------------------------------------------------------------------- */
  const [h11Kähler, setH11Kähler] = useState<number>(14);
  const [h21Complex, setH21Complex] = useState<number>(23);
  const [discreteQuotientZ, setDiscreteQuotientZ] = useState<number>(3); // Z3 quotient

  const cyPresets = [
    { label: 'Variedade de Tian-Yau (3 Gerações Exatas)', h11: 14, h21: 23, mod: 3, desc: 'Quociente por Z3 gerando exatamente 3 gerações de quarks/léptons' },
    { label: 'Quíntica de Fermat em P⁴', h11: 1, h21: 101, mod: 1, desc: 'Calabi-Yau clássica com Euler χ = -200 e 100 gerações' },
    { label: 'Espelho da Quíntica (Mirror Quintic)', h11: 101, h21: 1, mod: 1, desc: 'Dualidade de espelho trocando h11 por h21 com Euler χ = +200' },
    { label: 'Bissetriz CICY (Intersecção Completa)', h11: 2, h21: 86, mod: 1, desc: 'Variedade definida por polinômios multivariados em espaços projetivos' },
    { label: 'Toro 6D Trivial T⁶', h11: 9, h21: 9, mod: 1, desc: 'Sem curvatura com Euler χ = 0 e supersimetria máxima N = 4' }
  ];

  const cyData = useMemo(() => {
    const h11 = Math.max(1, h11Kähler);
    const h21 = Math.max(0, h21Complex);
    const zMod = Math.max(1, discreteQuotientZ);

    // Característica de Euler original: chi = 2 * (h11 - h21)
    const chi_raw = 2 * (h11 - h21);

    // Após quociente discreto livre de ponto fixo: chi_mod = chi / zMod
    const chi_mod = chi_raw / zMod;

    // Número de gerações de férmions: N_g = |chi_mod| / 2
    const num_generations = Math.abs(chi_mod) / 2;

    // Dimensão total do espaço de moduli = h11 (tamanho) + h21 (forma)
    const total_moduli = h11 + h21;

    return {
      chi_raw,
      chi_mod,
      num_generations,
      total_moduli,
      isThreeGenerations: Math.abs(num_generations - 3.0) < 0.01
    };
  }, [h11Kähler, h21Complex, discreteQuotientZ]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: DUALIDADE HOLOGRÁFICA ADS/CFT DE MALDACENA                   */
  /* -------------------------------------------------------------------------- */
  const [numColorsN, setNumColorsN] = useState<number>(100); // N de SU(N)
  const [thooftCouplingLambda, setThooftCouplingLambda] = useState<number>(25.0); // lambda = g_YM^2 * N

  const adsPresets = [
    { label: 'Supergravidade Clássica SUGRA (Grande N)', N: 1000, lambda: 100.0, desc: 'Regime onde o espaço AdS5 é suave e a relatividade clássica se aplica' },
    { label: 'Grande N Intermediário', N: 100, lambda: 25.0, desc: 'Raio de AdS bem maior que a escala de cordas' },
    { label: 'Regime Perturbativo Fraco de Yang-Mills', N: 10, lambda: 0.5, desc: 'Diagramas de Feynman planares convergem na fronteira 4D' },
    { label: 'Limite de Cordas Tensas (R ~ ls)', N: 5, lambda: 1.0, desc: 'Correções quânticas de cordas de alta ordem dominam o bulk' }
  ];

  const adsData = useMemo(() => {
    const N = Math.max(2, numColorsN);
    const lambda = Math.max(0.01, thooftCouplingLambda);

    // Relação de 't Hooft: lambda = g_YM^2 * N = 4 * pi * gs * N
    const gs = lambda / (4 * Math.PI * N);
    const g_ym_sq = lambda / N;

    // Raio de AdS em unidades da escala de corda: R / ls = (4 * pi * lambda)^(1/4) = (lambda)^(1/4) dependendo da convenção
    // Convenção de Maldacena: R^4 = 4 * pi * gs * N * alpha'^2 = lambda * alpha'^2
    const radius_over_ls = Math.pow(lambda, 0.25);

    // Entropia térmica de buraco negro AdS5 vs Gás de Glúons livre na fronteira
    // S_BH / S_free = 3 / 4 (O famoso resultado 3/4 de Gubser, Klebanov e Polyakov para acoplamento infinito!)
    const entropy_ratio_sugra = 0.75;

    // Viscosidade cisalhante mínima holográfica eta/s = hbar / (4pi kB)
    const kss_viscosity = 1 / (4 * Math.PI);

    return {
      gs,
      g_ym_sq,
      radius_over_ls,
      entropy_ratio_sugra,
      kss_viscosity,
      isSugraValid: lambda > 10 && N > 50
    };
  }, [numColorsN, thooftCouplingLambda]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: D-BRANAS, TENSÃO & CARGA DE RAMOND-RAMOND (BPS)              */
  /* -------------------------------------------------------------------------- */
  const [spatialDimensionP, setSpatialDimensionP] = useState<number>(3); // D3-brana
  const [dBraneCountN, setDBraneCountN] = useState<number>(1); // 1 D-brana isolada

  const dBranePresets = [
    { p: 3, N: 1, label: 'D3-Brana Única (Nosso Universo Braneworld)', desc: 'Brana com 3 dimensões espaciais + tempo suportando o Modelo Padrão' },
    { p: 3, N: 3, label: 'Pilha de 3 D3-Branas (Grupo de Gauge U(3))', desc: 'Promove a simetria de gauge para matrizes não-abelianas SU(3) de cor' },
    { p: 1, N: 1, label: 'D1-Brana (D-String Dual S)', desc: 'Corda eletricamente carregada sob o campo de tensor B de Ramond' },
    { p: 0, N: 1, label: 'D0-Brana (Partícula / Matriz Teoria-M)', desc: 'Ponto com massa não-perturbativa 1 / (gs * ls)' },
    { p: 7, N: 1, label: 'D7-Brana (Teoria-F de Vafa)', desc: 'Defeito de codimensão 2 com quebra de simetria conforme' }
  ];

  const dBraneData = useMemo(() => {
    const p = spatialDimensionP;
    const N = dBraneCountN;
    const gs = stringCouplingGs;
    const ls = stringData.ls_meters;

    // Tensão da Dp-brana: T_p = 1 / [ gs * (2*pi)^p * ls^(p+1) ]
    // Em unidades de energia / volume_p:
    const denom = gs * Math.pow(2 * Math.PI, p) * Math.pow(Math.max(1e-35, ls), p + 1);
    const Tp_joules_per_m_p = (HBAR * c) / denom;

    // Condição BPS: atração gravitacional = repulsão de Ramond-Ramond
    // Força líquida estática F_net = 0
    const isBpsStable = true;

    // Grupo de Gauge gerado pelas cordas abertas na pilha:
    const gaugeGroup = N === 1 ? 'U(1)' : `U(${N}) [SU(${N}) × U(1)]`;

    return {
      Tp_joules_per_m_p,
      isBpsStable,
      gaugeGroup,
      p
    };
  }, [spatialDimensionP, dBraneCountN, stringCouplingGs, stringData.ls_meters]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: ESPECTRO DE ÁREA EM LOOP QUANTUM GRAVITY (LQG)               */
  /* -------------------------------------------------------------------------- */
  const [immirziGamma, setImmirziGamma] = useState<number>(0.274); // ln(2) / (pi * sqrt(3))
  const [spinValues, setSpinValues] = useState<number[]>([0.5, 0.5, 0.5, 1.0]); // Punições da rede de spin

  const lqgPresets = [
    { label: 'Quantum Mínimo de Área (1 Punção j = 1/2)', spins: [0.5], gamma: 0.274, desc: 'Menor pedaço discreto indivisível de espaço no universo' },
    { label: 'Superfície Triangulada (3 Punções j = 1/2)', spins: [0.5, 0.5, 0.5], gamma: 0.274, desc: 'Três arestas poliméricas perfurando a superfície' },
    { label: 'Punções de Spin Misto (j = 1/2, 1, 3/2)', spins: [0.5, 1.0, 1.5], gamma: 0.274, desc: 'Representações de dimensão 2, 3 e 4 de SU(2)' },
    { label: 'Ajuste de Modos Quasinormais (Dreyer)', spins: [0.5], gamma: 0.2375, desc: 'Parâmetro de Immirzi derivado de vibrações de buraco negro ln(3)/(2pi*sqrt(2))' },
    { label: 'Rede de Spin Densa (6 Arestas Elementares)', spins: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], gamma: 0.274, desc: 'Superfície macroscópica como soma de quanta discretos' }
  ];

  const lqgData = useMemo(() => {
    const gamma = immirziGamma;
    const lP_sq = Math.pow(PLANCK_LENGTH, 2); // ~2.61e-70 m^2

    // Fórmula de Autovalores de Área de Rovelli-Smolin:
    // A = 8 * pi * gamma * lP^2 * sum_i sqrt(j_i * (j_i + 1))
    let casimirSum = 0;
    for (const j of spinValues) {
      casimirSum += Math.sqrt(j * (j + 1));
    }

    const totalAreaM2 = 8 * Math.PI * gamma * lP_sq * casimirSum;

    // Área elementar de Planck A_Planck = lP^2
    const areaInPlanckUnits = totalAreaM2 / lP_sq;

    // Quantum mínimo não-nulo para j = 1/2:
    const j_min = 0.5;
    const deltaMinAreaM2 = 8 * Math.PI * gamma * lP_sq * Math.sqrt(j_min * (j_min + 1));

    // Entropia de Bekenstein-Hawking resultante: S = A / (4 * lP^2)
    const entropy_nat = totalAreaM2 / (4 * lP_sq);

    return {
      totalAreaM2,
      areaInPlanckUnits,
      deltaMinAreaM2,
      entropy_nat,
      numPunctures: spinValues.length
    };
  }, [immirziGamma, spinValues]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl">
      {/* CABEÇALHO DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400">
            <Orbit className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Teoria de Cordas, Gravidade Quântica & Holografia AdS/CFT
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-full">
                Além do Modelo Padrão
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Escala de Planck e tensão de cordas, compactificação em Calabi-Yau 6D, dualidade de Maldacena, D-branas BPS e geometria discreta em Loop Quantum Gravity
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE AS 5 FERRAMENTAS */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('string-planck-scale')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'string-planck-scale'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            Escala de Cordas & Planck
          </button>

          <button
            onClick={() => setActiveTab('calabi-yau')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'calabi-yau'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            Calabi-Yau 6D
          </button>

          <button
            onClick={() => setActiveTab('ads-cft-duality')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'ads-cft-duality'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Dualidade AdS/CFT
          </button>

          <button
            onClick={() => setActiveTab('d-branes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'd-branes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            D-Branas & Cargas BPS
          </button>

          <button
            onClick={() => setActiveTab('loop-quantum-gravity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'loop-quantum-gravity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Geometria LQG
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS FERRAMENTAS */}
      <div className="mt-6">
        {/* ========================================================================= */}
        {/* ABA 1: TENSÃO DA CORDA & ESCALA DE PLANCK                                 */}
        {/* ========================================================================= */}
        {activeTab === 'string-planck-scale' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles da Escala Fundamental */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros de Inclinação α' & Acoplamento
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Massa Característica da Corda (M_s):</span>
                        <span className="font-mono text-indigo-300">{stringData.Ms_Gev.toExponential(3)} GeV</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="19"
                        step="0.1"
                        value={Math.log10(stringData.Ms_Gev)}
                        onChange={(e) => {
                          const ms = Math.pow(10, parseFloat(e.target.value));
                          setStringReggeSlopeGev2(1 / (ms * ms));
                        }}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>10³ GeV (1 TeV)</span>
                        <span>10¹⁶ GeV (GUT)</span>
                        <span>1.22×10¹⁹ GeV (Planck)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Constante de Acoplamento da Corda (g_s = e^Φ):</span>
                        <span className="font-mono text-cyan-300">{stringCouplingGs.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="1.3"
                        step="0.05"
                        value={Math.log10(stringCouplingGs)}
                        onChange={(e) => setStringCouplingGs(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>0.001 (Perturbativo)</span>
                        <span>1.0 (Auto-dual)</span>
                        <span>20.0 (Teoria-M 11D)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Regimes Teóricos da Unificação
                  </h4>
                  <div className="space-y-1.5">
                    {stringPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setStringReggeSlopeGev2(preset.alphaPrime);
                          setStringCouplingGs(preset.gs);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas da Escala de Planck */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Orbit className="w-4 h-4" /> Escala Mínima do Espaço-Tempo
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      ℓ_s = {stringData.ls_meters.toExponential(3)} m
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Comprimento da Corda (ℓ_s):</span>
                      <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                        {stringData.ls_meters.toExponential(3)} m
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">√α'</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Massa de Planck (M_P):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        1.22×10¹⁹ GeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">√(ħc / G)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Tensão da Corda (T):</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {stringData.T_newtons.toExponential(2)} N
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">1 / (2πα')</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Temperatura de Hagedorn:</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {stringData.TH_Gev.toExponential(2)} GeV
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Limite Térmico Máximo</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Raio 11ª Dimensão (R₁₁):</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {stringData.R11_meters.toExponential(3)} m
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">g_s × ℓ_s (Teoria-M)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Tempo de Planck (t_P):</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        5.39×10⁻⁴⁴ s
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">ℓ_P / c</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-400 mb-1">
                    <Sparkles className="w-4 h-4" /> A Eliminação das Singularidades Infinitas
                  </div>
                  Em teorias de partículas pontuais, interações a distâncias zero ($r \to 0$) geram probabilidades infinitas. Na teoria de cordas, a extensão unidimensional finita $\ell_s$ suaviza os vértices de interação, tornando a gravidade quântica finita e renormalizável sem divergências ultravioleta.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: COMPACTIFICAÇÃO EM CALABI-YAU 6D & NÚMEROS DE HODGE                 */}
        {/* ========================================================================= */}
        {activeTab === 'calabi-yau' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Números de Hodge */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Topologia da Variedade de Calabi-Yau 6D
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Módulos de Kähler h¹'¹ (Tamanho dos Ciclos):</span>
                        <span className="font-mono text-indigo-300">{h11Kähler}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="120"
                        step="1"
                        value={h11Kähler}
                        onChange={(e) => setH11Kähler(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Módulos Complexos h²'¹ (Forma da Variedade):</span>
                        <span className="font-mono text-cyan-300">{h21Complex}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="1"
                        value={h21Complex}
                        onChange={(e) => setH21Complex(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Quociente de Simetria Discreta (ℤ_n):</span>
                        <span className="font-mono text-amber-300">ℤ_{discreteQuotientZ}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="1"
                        value={discreteQuotientZ}
                        onChange={(e) => setDiscreteQuotientZ(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Variedades de Calabi-Yau Famosas
                  </h4>
                  <div className="space-y-1.5">
                    {cyPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setH11Kähler(preset.h11);
                          setH21Complex(preset.h21);
                          setDiscreteQuotientZ(preset.mod);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Geração de Férmions e Geometria */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Circle className="w-4 h-4" /> Topologia e o Número de Famílias Quânticas
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${cyData.isThreeGenerations ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                      {cyData.isThreeGenerations ? '✓ 3 Famílias Exatas do Modelo Padrão' : `${cyData.num_generations.toFixed(1)} Famílias`}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Gerações de Férmions (N_g):</span>
                      <div className={`text-sm font-bold font-mono mt-0.5 ${cyData.isThreeGenerations ? 'text-emerald-400' : 'text-indigo-300'}`}>
                        {cyData.num_generations.toFixed(0)} Gerações
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">|χ| / 2 (Elétron/Múon/Tau)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Euler Efetivo (χ_mod):</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {cyData.chi_mod.toFixed(0)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">χ / |ℤ_n|</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Euler da Variedade Mãe:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {cyData.chi_raw}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">2(h¹'¹ - h²'¹)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Espaço de Moduli Total:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {cyData.total_moduli} campos sem massa
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">h¹'¹ + h²'¹</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Simetria de Espelho Dual:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        χ_mirror = {-cyData.chi_raw}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">h¹'¹ ↔ h²'¹</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Holonomia da Variedade:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        SU(3) Estrito
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Preserva N = 1 SUSY</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Topologia Calabi-Yau: h1,1 = ${h11Kähler}, h2,1 = ${h21Complex}\nEuler: ${cyData.chi_raw} (Modulado: ${cyData.chi_mod})\nGeracoes de Fermions: ${cyData.num_generations}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Calabi-Yau
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: DUALIDADE HOLOGRÁFICA ADS/CFT DE MALDACENA                         */}
        {/* ========================================================================= */}
        {activeTab === 'ads-cft-duality' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de N e 't Hooft Lambda */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros de Gauge SU(N) & Acoplamento
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Número de Cores (N) de SU(N):</span>
                        <span className="font-mono text-indigo-300">N = {numColorsN}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="2000"
                        step="5"
                        value={numColorsN}
                        onChange={(e) => setNumColorsN(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Acoplamento de 't Hooft (λ = g_YM² N):</span>
                        <span className="font-mono text-cyan-300">λ = {thooftCouplingLambda.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="200"
                        step="0.5"
                        value={thooftCouplingLambda}
                        onChange={(e) => setThooftCouplingLambda(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Regimes Holográficos
                  </h4>
                  <div className="space-y-1.5">
                    {adsPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setNumColorsN(preset.N);
                          setThooftCouplingLambda(preset.lambda);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas Holográficas */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Dicionário Holográfico Bulk ↔ Fronteira
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      R / ℓ_s = {adsData.radius_over_ls.toFixed(2)}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Raio de AdS₅ × S⁵:</span>
                      <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                        {adsData.radius_over_ls.toFixed(2)} ℓ_s
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">λ^(1/4)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Acoplamento de Cordas (g_s):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {adsData.gs.toExponential(3)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">λ / (4πN)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Razão de Entropia Térmica:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        S_BH / S_free = 3/4
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Fórmula de Gubser</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Viscosidade Mínima KSS:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        η/s = 1 / 4π
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Fluido Perfeito Dual</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Validade da Supergravidade:</span>
                      <div className={`text-sm font-bold font-mono mt-0.5 ${adsData.isSugraValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {adsData.isSugraValid ? 'Espaço Suave Einstein' : 'Correções Quânticas'}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">λ &gt;&gt; 1 &amp; N &gt;&gt; 1</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Entropia Ryu-Takayanagi:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        Área(γ_A) / 4G₅
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Emaranhamento Bulk</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-400 mb-1">
                    <Info className="w-4 h-4" /> O Princípio Holográfico
                  </div>
                  O espaço tridimensional com gravidade pode ser uma ilusão matemática projetada a partir de uma teoria quântica plana sem gravidade vivendo na fronteira! Um buraco negro no interior 5D se comporta exatamente como um plasma quente na fronteira 4D.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: D-BRANAS, TENSÃO & CARGA DE RAMOND-RAMOND (BPS)                    */}
        {/* ========================================================================= */}
        {activeTab === 'd-branes' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Brana */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Dimensão Espacial da Brana (p)
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Dimensão Espacial da Brana:</span>
                        <span className="font-mono text-indigo-300 font-bold">D{spatialDimensionP}-Brana</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="7"
                        step="1"
                        value={spatialDimensionP}
                        onChange={(e) => setSpatialDimensionP(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>D0 (Partícula)</span>
                        <span>D1 (Corda)</span>
                        <span>D3 (Universo)</span>
                        <span>D7</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Número de Branas Coincidentes na Pilha (N):</span>
                        <span className="font-mono text-cyan-300">N = {dBraneCountN}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={dBraneCountN}
                        onChange={(e) => setDBraneCountN(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Configurações de Branas Canônicas
                  </h4>
                  <div className="space-y-1.5">
                    {dBranePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSpatialDimensionP(preset.p);
                          setDBraneCountN(preset.N);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas das Branas */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Propriedades da D{dBraneData.p}-Brana
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      Grupo: {dBraneData.gaugeGroup}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Grupo de Gauge na Pilha:</span>
                      <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                        {dBraneData.gaugeGroup}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Cordas Abertas</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Tensão Tp:</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {dBraneData.Tp_joules_per_m_p.toExponential(2)} J/m^{dBraneData.p}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">∝ 1 / (g_s ℓ_s^{dBraneData.p + 1})</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Condição BPS (Equilíbrio):</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        F_grav = F_RR (F_net = 0)
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Supersimétrico Estável</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Condições de Contorno:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        Dirichlet ⊥ / Neumann ∥
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Pontas das Cordas</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Escala de Tensão não-perturbariva:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        1 / g_s (Soliton)
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Polchinski (1995)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Carga de Ramond:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        Forma p+1 de Gauge
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Potencial C_(p+1)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: ESPECTRO DE ÁREA EM LOOP QUANTUM GRAVITY (LQG)                     */}
        {/* ========================================================================= */}
        {activeTab === 'loop-quantum-gravity' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Redes de Spin */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetro de Immirzi & Redes de Spin
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Parâmetro de Barbero-Immirzi (γ):</span>
                        <span className="font-mono text-indigo-300">{immirziGamma.toFixed(4)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.5"
                        step="0.005"
                        value={immirziGamma}
                        onChange={(e) => setImmirziGamma(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        ln(2) / (π√3) ≈ 0.2740 calibra exatamente a entropia Bekenstein-Hawking S = A/4.
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Punições da Rede de Spin na Superfície:</span>
                        <span className="font-mono text-cyan-300">{lqgData.numPunctures} arestas perfurando</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-black/60 rounded border border-slate-800">
                        {spinValues.map((j, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-mono">
                            j = {j === 0.5 ? '1/2' : j === 1.5 ? '3/2' : j}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Espectros Canônicos de LQG
                  </h4>
                  <div className="space-y-1.5">
                    {lqgPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSpinValues(preset.spins);
                          setImmirziGamma(preset.gamma);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Espectro de Rovelli-Smolin */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Espectro Discreto de Área: A = 8πγ ℓ_P² ∑ √(j(j+1))
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      Rovelli-Smolin (1995)
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Área Quântica Total:</span>
                      <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                        {lqgData.totalAreaM2.toExponential(3)} m²
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{lqgData.areaInPlanckUnits.toFixed(1)} ℓ_P²</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Quantum Mínimo de Área (Δ):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {lqgData.deltaMinAreaM2.toExponential(3)} m²
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">1 punção j = 1/2</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Entropia do Horizonte:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        {lqgData.entropy_nat.toFixed(2)} k_B
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">A / (4 ℓ_P²)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Grupo de Conexão:</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        SU(2) Ashtekar
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Conexão de Gauge</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Cosmologia em Laços:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        Big Bounce
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Sem Singularidade</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Natureza do Espaço:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        Polímero Granular
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Não-Contínuo</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Espectro de Area LQG: ${lqgData.totalAreaM2.toExponential(3)} m2 (${lqgData.areaInPlanckUnits.toFixed(1)} lP^2)\nQuantum Minimo: ${lqgData.deltaMinAreaM2.toExponential(3)} m2\nImmirzi: ${immirziGamma}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Métricas de Gravidade Quântica (LQG)
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
