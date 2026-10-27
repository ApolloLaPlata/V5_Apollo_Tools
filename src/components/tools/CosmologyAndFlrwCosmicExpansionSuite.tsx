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
  Share2
} from 'lucide-react';

export function CosmologyAndFlrwCosmicExpansionSuite({
  defaultTab = 'flrw-cosmology'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'flrw-cosmology' | 'distance-ladder' | 'cmb-power-spectrum' | 'bao-ruler' | 'dark-energy-eos'
  >(() => {
    if (defaultTab === 'cosmological-distance-ladder-tool' || defaultTab === 'distance-ladder') return 'distance-ladder';
    if (defaultTab === 'cmb-power-spectrum-acoustic-peaks-tool' || defaultTab === 'cmb-power-spectrum') return 'cmb-power-spectrum';
    if (defaultTab === 'baryon-acoustic-oscillations-ruler-tool' || defaultTab === 'bao-ruler') return 'bao-ruler';
    if (defaultTab === 'dark-energy-equation-of-state-tool' || defaultTab === 'dark-energy-eos') return 'dark-energy-eos';
    return 'flrw-cosmology';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Constantes Universais */
  const c_kms = 299792.458; // km/s
  const G = 6.67430e-11; // m^3 / (kg s^2)
  const MPC_TO_METERS = 3.085677581e22;

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: EXPANSÃO CÓSMICA FLRW & DENSIDADES DE FRIEDMANN              */
  /* -------------------------------------------------------------------------- */
  const [hubbleH0, setHubbleH0] = useState<number>(67.4); // km/s/Mpc (Planck 2018)
  const [omegaMatter, setOmegaMatter] = useState<number>(0.315);
  const [omegaLambda, setOmegaLambda] = useState<number>(0.685);
  const [omegaRadiation, setOmegaRadiation] = useState<number>(0.00009); // radiação fótons + neutrinos

  const flrwPresets = [
    { label: 'Planck 2018 (ΛCDM Padrão)', H0: 67.4, Om: 0.315, Ol: 0.685, desc: 'Modelo cosmológico de concordância com geometria plana' },
    { label: 'SH0ES / HST (Tensão de Hubble)', H0: 73.04, Om: 0.300, Ol: 0.700, desc: 'Medição local via Cefeidas e Supernovas Ia com discrepância de 5σ' },
    { label: 'Einstein-de Sitter (Matéria Pura)', H0: 50.0, Om: 1.000, Ol: 0.000, desc: 'Modelo clássico de universo dominado por matéria sem constante cosmológica' },
    { label: 'Universo de de Sitter (Vácuo Puro)', H0: 70.0, Om: 0.000, Ol: 1.000, desc: 'Expansão puramente exponencial impulsionada por energia escura' },
    { label: 'Universo Hiperdenso Fechado', H0: 60.0, Om: 1.400, Ol: 0.050, desc: 'Geometria esférica fechada que culmina em colapso Big Crunch' }
  ];

  const flrwData = useMemo(() => {
    const H0 = hubbleH0;
    const Om = omegaMatter;
    const Ol = omegaLambda;
    const Or = omegaRadiation;
    const Ok = 1 - (Om + Ol + Or);

    // E(z) e taxa de expansão H(z)
    const Ez = (z: number) => {
      const zp1 = 1 + z;
      return Math.sqrt(Math.max(1e-12, Or * Math.pow(zp1, 4) + Om * Math.pow(zp1, 3) + Ok * Math.pow(zp1, 2) + Ol));
    };

    // Parâmetro de desaceleração atual q0
    const q0 = 0.5 * Om + Or - Ol;

    // Redshift de transição desaceleração -> aceleração (onde q(z) = 0)
    let z_trans = 0;
    if (Ol > 0 && Om > 0) {
      z_trans = Math.max(0, Math.pow((2 * Ol) / Om, 1 / 3) - 1);
    }

    // Densidade Crítica Atual (kg/m^3)
    // H0 in 1/s = H0 * 1000 / MPC_TO_METERS
    const H0_si = (H0 * 1000) / MPC_TO_METERS;
    const rho_crit = (3 * H0_si * H0_si) / (8 * Math.PI * G);

    // Idade do Universo t0 (integração numérica pelo método dos trapézios)
    let t0_integral = 0;
    const nSteps = 1000;
    const zMax = 2000;
    for (let i = 0; i < nSteps; i++) {
      const z1 = (i / nSteps) * zMax;
      const z2 = ((i + 1) / nSteps) * zMax;
      const f1 = 1 / ((1 + z1) * Ez(z1));
      const f2 = 1 / ((1 + z2) * Ez(z2));
      t0_integral += 0.5 * (f1 + f2) * (z2 - z1);
    }
    // Converter de 1/H0 para Bilhões de Anos (Ga)
    // 1 / H0 [s] = MPC_TO_METERS / (H0 * 1000)
    const sec_in_year = 365.25 * 86400;
    const t0_years = (t0_integral * MPC_TO_METERS) / (H0 * 1000 * sec_in_year);
    const ageOfUniverseGa = t0_years / 1e9;

    // Pontos do fator de escala a(t) vs tempo cósmico
    const scaleFactorPoints: { t: number; a: number }[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = (i / 30) * 25; // 0 a 25 Ga
      // Aproximação analítica para LCDM plano
      const a = Ol > 0 && Om > 0 
        ? Math.pow(Math.sinh((1.5 * Math.sqrt(Ol) * H0_si * t * 1e9 * sec_in_year)), 2 / 3) * Math.pow(Om / Ol, 1 / 3)
        : Math.pow(t / Math.max(0.1, ageOfUniverseGa), 2 / 3);
      scaleFactorPoints.push({ t, a: Math.min(3.5, a) });
    }

    return {
      Ok,
      q0,
      z_trans,
      rho_crit,
      ageOfUniverseGa,
      scaleFactorPoints
    };
  }, [hubbleH0, omegaMatter, omegaLambda, omegaRadiation]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: ESCADA DE DISTÂNCIAS CÓSMICAS (dL, dA, dc, LOOKBACK)         */
  /* -------------------------------------------------------------------------- */
  const [targetRedshift, setTargetRedshift] = useState<number>(1.5);
  const [sourcePhysicalSizeKpc, setSourcePhysicalSizeKpc] = useState<number>(30); // 30 kpc (galáxia padrão)

  const distancePresets = [
    { label: 'Supernova SN 1987A (LMC)', z: 0.00013, size: 0.01, desc: 'Supernova próxima na Grande Nuvem de Magalhães' },
    { label: 'Quasar Próximo 3C 273', z: 0.158, size: 50, desc: 'Primeiro quasar identificado na história da astronomia' },
    { label: 'Supernova Ia Perlmutter (Aceleração)', z: 0.50, size: 25, desc: 'Marco da descoberta da expansão acelerada do cosmos' },
    { label: 'Galáxia Espiral Típica em z = 1.5', z: 1.50, size: 30, desc: 'Ponto próximo ao mínimo da distância de diâmetro angular' },
    { label: 'JWST JADES-GS-z14-0 (Galáxia Primordial)', z: 14.32, size: 1.6, desc: 'Recorde observacional de galáxia formada 290 Ma pós Big Bang' },
    { label: 'Radiação Cósmica de Fundo (CMB / Desacoplamento)', z: 1100, size: 150, desc: 'Superfície de último espalhamento fóton-bárion' }
  ];

  const distanceData = useMemo(() => {
    const H0 = hubbleH0;
    const Om = omegaMatter;
    const Ol = omegaLambda;
    const Or = omegaRadiation;
    const Ok = 1 - (Om + Ol + Or);
    const z = Math.max(0.00001, targetRedshift);

    const Ez = (zVal: number) => {
      const zp1 = 1 + zVal;
      return Math.sqrt(Math.max(1e-12, Or * Math.pow(zp1, 4) + Om * Math.pow(zp1, 3) + Ok * Math.pow(zp1, 2) + Ol));
    };

    // Integração da distância comóvel dc = (c/H0) * int_0^z dz'/E(z')
    let dc_integral = 0;
    let lookback_integral = 0;
    const n = 500;
    for (let i = 0; i < n; i++) {
      const z1 = (i / n) * z;
      const z2 = ((i + 1) / n) * z;
      const ez1 = Ez(z1);
      const ez2 = Ez(z2);
      dc_integral += 0.5 * (1 / ez1 + 1 / ez2) * (z2 - z1);
      lookback_integral += 0.5 * (1 / ((1 + z1) * ez1) + 1 / ((1 + z2) * ez2)) * (z2 - z1);
    }

    const D_H = c_kms / H0; // Distância de Hubble em Mpc
    const dc_Mpc = D_H * dc_integral;

    // Distância transversa comóvel dM
    let dM_Mpc = dc_Mpc;
    if (Math.abs(Ok) > 1e-4) {
      const sqrtOk = Math.sqrt(Math.abs(Ok));
      if (Ok > 0) {
        dM_Mpc = (D_H / sqrtOk) * Math.sinh(sqrtOk * dc_Mpc / D_H);
      } else {
        dM_Mpc = (D_H / sqrtOk) * Math.sin(sqrtOk * dc_Mpc / D_H);
      }
    }

    // Distância de luminosidade dL = (1 + z) * dM
    const dL_Mpc = (1 + z) * dM_Mpc;

    // Módulo de distância mu = 5 * log10(dL / 10 pc) = 5 * log10(dL_Mpc) + 25
    const distance_modulus = 5 * Math.log10(Math.max(1e-5, dL_Mpc)) + 25;

    // Distância de diâmetro angular dA = dM / (1 + z)
    const dA_Mpc = dM_Mpc / (1 + z);

    // Tamanho angular aparente de um objeto em segundos de arco (arcsec)
    // theta = (D_prop / dA) radianos
    const theta_rad = (sourcePhysicalSizeKpc / 1000) / dA_Mpc;
    const theta_arcsec = theta_rad * (180 * 3600 / Math.PI);

    // Lookback time em bilhões de anos
    const sec_in_year = 365.25 * 86400;
    const lookback_time_Ga = (lookback_integral * MPC_TO_METERS) / (H0 * 1000 * sec_in_year * 1e9);

    return {
      dc_Mpc,
      dL_Mpc,
      dA_Mpc,
      distance_modulus,
      theta_arcsec,
      lookback_time_Ga,
      H_at_z: H0 * Ez(z)
    };
  }, [hubbleH0, omegaMatter, omegaLambda, omegaRadiation, targetRedshift, sourcePhysicalSizeKpc]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: SIMULADOR DE PICOS ACÚSTICOS DA CMB (PLANCK / WMAP)          */
  /* -------------------------------------------------------------------------- */
  const [baryonDensity, setBaryonDensity] = useState<number>(0.02237); // Omega_b * h^2
  const [cdmDensity, setCdmDensity] = useState<number>(0.1200); // Omega_c * h^2
  const [spectralIndex, setSpectralIndex] = useState<number>(0.965); // n_s
  const [curvShift, setCurvShift] = useState<number>(0); // Deslocamento de curvatura

  const cmbCurvePoints = useMemo(() => {
    // Modelo sintético e fenomenológico dos picos acústicos da CMB
    // D_l = l(l+1)/(2pi) * C_l em microKelvin^2
    const points: { l: number; Dl: number }[] = [];
    const h = hubbleH0 / 100;
    const ob = baryonDensity / (h * h);
    const oc = cdmDensity / (h * h);

    // Posição angular do 1º pico: l1 ~ 220 / sqrt(1 - Ok)
    const l1 = 220 + curvShift * 40;
    const l2 = l1 * 2.45;
    const l3 = l1 * 3.68;

    for (let l = 2; l <= 2000; l += 15) {
      // Platô de Sachs-Wolfe de baixos multipolos (l < 50)
      const sw = 900 * Math.pow(l / 10, spectralIndex - 1);

      // Picos acústicos com amortecimento de Silk exponencial
      const silk_damping = Math.exp(-Math.pow(l / 1200, 1.25));

      // 1º Pico (Compressão primordial)
      const p1 = 4800 * (1 + (ob - 0.049) * 4) * Math.exp(-Math.pow((l - l1) / 85, 2));

      // 2º Pico (Rarefação - suprimido por mais bárions)
      const p2 = 2400 * (1 - (ob - 0.049) * 6) * Math.exp(-Math.pow((l - l2) / 120, 2));

      // 3º Pico (2ª Compressão - amplificado por matéria escura fria)
      const p3 = 2600 * (1 + (oc - 0.26) * 3) * Math.exp(-Math.pow((l - l3) / 150, 2));

      // Cauda de altos multipolos
      const tail = 1200 * Math.exp(-Math.pow((l - 1350) / 250, 2));

      const Dl = (sw + (p1 + p2 + p3 + tail) * silk_damping);
      points.push({ l, Dl });
    }

    return points;
  }, [baryonDensity, cdmDensity, spectralIndex, curvShift, hubbleH0]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: OSCILAÇÕES ACÚSTICAS DE BÁRIONS (BAO) & RÉGUA CÓSMICA        */
  /* -------------------------------------------------------------------------- */
  const [soundHorizonMpc, setSoundHorizonMpc] = useState<number>(147.2); // r_s em Mpc (Planck)
  const [baoProbeRedshift, setBaoProbeRedshift] = useState<number>(0.57); // BOSS LRG

  const baoSurveys = [
    { name: 'SDSS-III BOSS (Galáxias LRG)', z: 0.57, desc: 'Amostra de 1.2 milhão de galáxias vermelhas massivas' },
    { name: 'DESI 2024 (Data Release 1)', z: 0.71, desc: 'Levantamento espectroscópico de energia escura mais preciso' },
    { name: 'eBOSS Quasares', z: 1.48, desc: 'Mapeamento de quasares luminosos em redshifts intermediários' },
    { name: 'Floresta Lyman-Alfa (Lyman-α)', z: 2.33, desc: 'Absorção de gás hidrogênio neutro intergaláctico' },
    { name: 'WiggleZ Dark Energy Survey', z: 0.44, desc: 'Galáxias jovens com alta formação estelar (blue emission)' }
  ];

  const baoData = useMemo(() => {
    const H0 = hubbleH0;
    const Om = omegaMatter;
    const Ol = omegaLambda;
    const z = Math.max(0.01, baoProbeRedshift);
    const rs = soundHorizonMpc;

    const Ez = Math.sqrt(Om * Math.pow(1 + z, 3) + Ol);
    const Hz = H0 * Ez;

    // Distância transversa comóvel dM(z)
    let dM_integral = 0;
    const n = 300;
    for (let i = 0; i < n; i++) {
      const z1 = (i / n) * z;
      const z2 = ((i + 1) / n) * z;
      const ez1 = Math.sqrt(Om * Math.pow(1 + z1, 3) + Ol);
      const ez2 = Math.sqrt(Om * Math.pow(1 + z2, 3) + Ol);
      dM_integral += 0.5 * (1 / ez1 + 1 / ez2) * (z2 - z1);
    }
    const dM_Mpc = (c_kms / H0) * dM_integral;
    const dA_Mpc = dM_Mpc / (1 + z);

    // Escala angular transversal theta_BAO = rs / ((1+z) * dA) = rs / dM
    const theta_bao_rad = rs / dM_Mpc;
    const theta_bao_deg = theta_bao_rad * (180 / Math.PI);

    // Escala radial Delta_z_BAO = rs * H(z) / c
    const delta_z_bao = (rs * Hz) / c_kms;

    // Distância esférica equivalente DV(z) = [c * z * dM^2 / H(z)]^(1/3)
    const DV_Mpc = Math.pow((c_kms * z * Math.pow(dM_Mpc, 2)) / Hz, 1 / 3);
    const DV_over_rs = DV_Mpc / rs;

    return {
      Hz,
      dM_Mpc,
      dA_Mpc,
      theta_bao_deg,
      delta_z_bao,
      DV_Mpc,
      DV_over_rs
    };
  }, [hubbleH0, omegaMatter, omegaLambda, soundHorizonMpc, baoProbeRedshift]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: EQUAÇÃO DE ESTADO DA ENERGIA ESCURA (CPL w0/wa & BIG RIP)   */
  /* -------------------------------------------------------------------------- */
  const [w0Param, setW0Param] = useState<number>(-1.0); // Constante cosmológica w0 = -1
  const [waParam, setWaParam] = useState<number>(0.0); // wa = 0

  const dePresets = [
    { label: 'Constante Cosmológica ΛCDM', w0: -1.0, wa: 0.0, desc: 'Energia de ponto zero estática e imutável (Einstein 1917)' },
    { label: 'Quintessência Dinâmica', w0: -0.85, wa: 0.15, desc: 'Campo escalar homogêneo que relaxa ao longo do tempo cósmico' },
    { label: 'Energia Fantasma (Big Rip)', w0: -1.15, wa: -0.10, desc: 'Densidade cresce sem limite, culminando na desintegração atômica do cosmos' },
    { label: 'Indicação DESI 2024 (DR1)', w0: -0.83, wa: -0.75, desc: 'Cruzamento da barreira fantasma sugerido pela combinação DESI + CMB' },
    { label: 'Gás de Chaplygin Efetivo', w0: -0.70, wa: 0.40, desc: 'Unificação teórica exótica entre matéria escura e energia escura' }
  ];

  const deData = useMemo(() => {
    const w0 = w0Param;
    const wa = waParam;
    const H0 = hubbleH0;
    const Om = omegaMatter;
    const Ode0 = omegaLambda;

    // Curva w(z) = w0 + wa * z / (1 + z)
    const wPoints: { z: number; w: number; rho_ratio: number }[] = [];
    for (let i = 0; i <= 20; i++) {
      const z = (i / 20) * 3.0;
      const wz = w0 + wa * (z / (1 + z));
      // rho_DE(z) / rho_DE0 = (1+z)^(3*(1+w0+wa)) * exp(-3*wa*z/(1+z))
      const rho_ratio = Math.pow(1 + z, 3 * (1 + w0 + wa)) * Math.exp((-3 * wa * z) / (1 + z));
      wPoints.push({ z, w: wz, rho_ratio });
    }

    // Parâmetro de desaceleração atual q0_de = 0.5 * Om + 0.5 * (1 + 3*w0) * Ode0
    const q0_de = 0.5 * Om + 0.5 * (1 + 3 * w0) * Ode0;

    // Classificação e destino final
    let fate = 'Big Freeze (Expansão Eterna Suave)';
    let ripTimeGa = 0;

    if (w0 < -1.0) {
      fate = 'Big Rip (Grande Ruptura Cósmica)';
      // Tempo até o Big Rip t_rip ~ 2 / (3 * |1+w| * H0 * sqrt(Ode))
      const H0_si = (H0 * 1000) / MPC_TO_METERS;
      const sec_in_year = 365.25 * 86400;
      const t_rip_sec = 2 / (3 * Math.abs(1 + w0) * H0_si * Math.sqrt(Ode0));
      ripTimeGa = (t_rip_sec / sec_in_year) / 1e9;
    } else if (w0 > -0.33) {
      fate = 'Desaceleração Futura / Big Crunch Potencial';
    }

    return {
      w0,
      wa,
      q0_de,
      fate,
      ripTimeGa,
      wPoints
    };
  }, [w0Param, waParam, hubbleH0, omegaMatter, omegaLambda]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 text-slate-100 shadow-2xl">
      {/* CABEÇALHO DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-emerald-500/20 border border-purple-500/30 text-purple-400">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Cosmologia Observacional, Métrica FLRW & CMB
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60 rounded-full">
                Cosmologia de Precisão
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Expansão de Friedmann, escada cósmica de distâncias, picos acústicos da CMB Planck, régua padrão BAO e equação de estado da energia escura
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE AS 5 FERRAMENTAS */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('flrw-cosmology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'flrw-cosmology'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            FLRW & Friedmann
          </button>

          <button
            onClick={() => setActiveTab('distance-ladder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'distance-ladder'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Escada de Distâncias (dL/dA)
          </button>

          <button
            onClick={() => setActiveTab('cmb-power-spectrum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'cmb-power-spectrum'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Picos Acústicos CMB
          </button>

          <button
            onClick={() => setActiveTab('bao-ruler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'bao-ruler'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            Régua Padrão BAO
          </button>

          <button
            onClick={() => setActiveTab('dark-energy-eos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'dark-energy-eos'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Energia Escura (w₀/wₐ)
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS FERRAMENTAS */}
      <div className="mt-6">
        {/* ========================================================================= */}
        {/* ABA 1: EXPANSÃO CÓSMICA FLRW & DENSIDADES DE FRIEDMANN                     */}
        {/* ========================================================================= */}
        {activeTab === 'flrw-cosmology' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Parâmetros Cosmológicos */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros de Densidade & Hubble
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Constante de Hubble Atual (H₀):</span>
                        <span className="font-mono text-purple-300">{hubbleH0.toFixed(2)} km/s/Mpc</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        step="0.1"
                        value={hubbleH0}
                        onChange={(e) => setHubbleH0(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Densidade de Matéria (Ωm):</span>
                        <span className="font-mono text-cyan-300">{omegaMatter.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.005"
                        value={omegaMatter}
                        onChange={(e) => setOmegaMatter(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Densidade de Energia Escura (ΩΛ):</span>
                        <span className="font-mono text-amber-300">{omegaLambda.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.005"
                        value={omegaLambda}
                        onChange={(e) => setOmegaLambda(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Curvatura Espacial (Ωk):</span>
                      <span className={`font-mono font-bold ${Math.abs(flrwData.Ok) < 0.001 ? 'text-emerald-400' : flrwData.Ok > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {flrwData.Ok.toFixed(4)} ({Math.abs(flrwData.Ok) < 0.001 ? 'Plano / Euclidiano' : flrwData.Ok > 0 ? 'Aberto / Hiperbólico' : 'Fechado / Esférico'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Presets Cosmológicos */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Modelos Cosmológicos Canônicos
                  </h4>
                  <div className="space-y-1.5">
                    {flrwPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setHubbleH0(preset.H0);
                          setOmegaMatter(preset.Om);
                          setOmegaLambda(preset.Ol);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-purple-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultados e Gráfico a(t) */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> Evolução do Fator de Escala Cósmico a(t)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Idade do Universo: {flrwData.ageOfUniverseGa.toFixed(2)} Ga
                    </span>
                  </div>

                  {/* Gráfico do Fator de Escala */}
                  <div className="w-full h-44 bg-black/60 rounded-xl border border-slate-800 relative flex items-center overflow-hidden px-2">
                    <svg viewBox="0 0 25 3.5" className="w-full h-full" preserveAspectRatio="none">
                      {/* Eixo Presente (t0) */}
                      <line
                        x1={flrwData.ageOfUniverseGa}
                        y1="0"
                        x2={flrwData.ageOfUniverseGa}
                        y2="3.5"
                        stroke="#38bdf8"
                        strokeWidth="0.08"
                        strokeDasharray="0.1 0.1"
                        opacity="0.6"
                      />
                      {/* Linha a = 1 (Hoje) */}
                      <line x1="0" y1="1.0" x2="25" y2="1.0" stroke="#1e293b" strokeWidth="0.04" />

                      {/* Curva a(t) */}
                      <polyline
                        points={flrwData.scaleFactorPoints.map(p => `${p.t.toFixed(2)},${(3.5 - p.a).toFixed(2)}`).join(' ')}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="0.1"
                      />
                    </svg>

                    <div className="absolute top-2 left-3 text-[10px] font-mono text-purple-300">
                      Big Bang (t = 0)
                    </div>
                    <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
                      Futuro Cósmico (t &gt; 13.8 Ga)
                    </div>
                  </div>
                </div>

                {/* Métricas Cosmológicas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Idade do Universo (t₀):</span>
                    <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                      {flrwData.ageOfUniverseGa.toFixed(3)} Ga
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Bilhões de Anos</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Desaceleração Atual (q₀):</span>
                    <div className={`text-sm font-bold font-mono mt-0.5 ${flrwData.q0 < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {flrwData.q0.toFixed(3)} ({flrwData.q0 < 0 ? 'Acelerando' : 'Desacelerando'})
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">0.5Ωm - ΩΛ</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Transição Desaceleração:</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      z_tr = {flrwData.z_trans > 0 ? flrwData.z_trans.toFixed(2) : 'N/A'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">~6 Ga atrás</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Densidade Crítica (ρ_crit):</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {flrwData.rho_crit.toExponential(3)} kg/m³
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">~5 átomos H / m³</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Tempo de Hubble (1/H₀):</span>
                    <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                      {(977.8 / hubbleH0).toFixed(2)} Ga
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Escala de Tempo</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Raio de Hubble (c/H₀):</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      {(c_kms / hubbleH0).toFixed(0)} Mpc
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{(c_kms / hubbleH0 * 3.26156).toFixed(0)} Mly</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Idade do Universo: ${flrwData.ageOfUniverseGa.toFixed(3)} Ga\nH0: ${hubbleH0} km/s/Mpc\nOmega_m: ${omegaMatter}, Omega_Lambda: ${omegaLambda}\nq0: ${flrwData.q0.toFixed(3)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Parâmetros de Friedmann
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: ESCADA DE DISTÂNCIAS CÓSMICAS (dL, dA, dc, LOOKBACK TIME)          */}
        {/* ========================================================================= */}
        {activeTab === 'distance-ladder' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de Redshift */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Alvo Cósmico & Redshift (z)
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Redshift do Objeto (z):</span>
                        <span className="font-mono text-purple-300">z = {targetRedshift.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="3.04"
                        step="0.01"
                        value={Math.log10(Math.max(0.01, targetRedshift))}
                        onChange={(e) => setTargetRedshift(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>z = 0.01</span>
                        <span>z = 1</span>
                        <span>z = 10</span>
                        <span>z = 1100 (CMB)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Tamanho Físico Intrínseco do Objeto (kpc):</span>
                        <span className="font-mono text-cyan-300">{sourcePhysicalSizeKpc} kpc</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="200"
                        step="0.5"
                        value={sourcePhysicalSizeKpc}
                        onChange={(e) => setSourcePhysicalSizeKpc(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets de Objetos Celestes */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Amostras Cósmicas Reais
                  </h4>
                  <div className="space-y-1.5">
                    {distancePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTargetRedshift(preset.z);
                          setSourcePhysicalSizeKpc(preset.size);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-purple-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas de Distâncias Relativísticas */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Medidas de Distância no Espaço Curvo
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      H(z) = {distanceData.H_at_z.toFixed(1)} km/s/Mpc
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Distância Comóvel (dc):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {distanceData.dc_Mpc.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Mpc
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{(distanceData.dc_Mpc * 3.26156).toFixed(0)} Mly</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Distância Luminosidade (dL):</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {distanceData.dL_Mpc.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Mpc
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">(1 + z) dc</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Diâmetro Angular (dA):</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {distanceData.dA_Mpc.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Mpc
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">dc / (1 + z)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Módulo de Distância (μ):</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {distanceData.distance_modulus.toFixed(2)} mag
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">m - M (Supernovas)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Lookback Time (tL):</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {distanceData.lookback_time_Ga.toFixed(3)} Ga
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Idade dos Fótons</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Tamanho Angular no Céu:</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {distanceData.theta_arcsec < 60 ? distanceData.theta_arcsec.toFixed(2) + '"' : (distanceData.theta_arcsec / 60).toFixed(2) + "'"}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">D_prop / dA</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-400">
                    <Info className="w-4 h-4" /> A Ilusão Óptica da Distância de Diâmetro Angular dA(z)
                  </div>
                  <p>
                    Diferente da física euclidiana cotidiana onde objetos mais distantes sempre parecem menores, em um universo em expansão <span className="text-cyan-300 font-mono">dA(z)</span> atinge um máximo em <span className="text-amber-300 font-mono">z ≈ 1.6</span>. Para <span className="text-emerald-300 font-mono">z &gt; 1.6</span>, a emissão ocorreu quando o universo era tão pequeno que o objeto aparenta ter um tamanho angular <span className="text-white font-bold">maior</span> no céu!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: SIMULADOR DE PICOS ACÚSTICOS DA CMB (PLANCK / WMAP)                */}
        {/* ========================================================================= */}
        {activeTab === 'cmb-power-spectrum' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sliders de Densidade Bariônica e Escura */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros do Plasma Primordial
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Densidade Bariônica Física (Ωb h²):</span>
                        <span className="font-mono text-cyan-300">{baryonDensity.toFixed(5)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.015"
                        max="0.035"
                        step="0.0005"
                        value={baryonDensity}
                        onChange={(e) => setBaryonDensity(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        Controla a assimetria entre compressões e rarefações (altura relativa do 1º e 2º picos).
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Densidade de Matéria Escura Fria (Ωc h²):</span>
                        <span className="font-mono text-purple-300">{cdmDensity.toFixed(4)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.08"
                        max="0.18"
                        step="0.002"
                        value={cdmDensity}
                        onChange={(e) => setCdmDensity(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        Aprofunda os poços de potencial gravitacional, sustentando a altura do 3º pico acústico.
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Índice Espectral Primordial (n_s):</span>
                        <span className="font-mono text-amber-300">{spectralIndex.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.90"
                        max="1.05"
                        step="0.005"
                        value={spectralIndex}
                        onChange={(e) => setSpectralIndex(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Curvatura Espacial (Deslocamento Angular):</span>
                        <span className="font-mono text-emerald-300">{curvShift > 0 ? `+${curvShift}` : curvShift}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={curvShift}
                        onChange={(e) => setCurvShift(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        Desloca horizontalmente os picos: ℓ₁ ≈ 220 confirma universo plano.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Espectro Angular CMB Planck */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4" /> Espectro de Potência de Temperatura D_ℓ = ℓ(ℓ+1)C_ℓ / 2π
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Planck 2018 Data Fit
                    </span>
                  </div>

                  {/* Visualizador de Espectro CMB */}
                  <div className="w-full h-52 bg-black/70 rounded-xl border border-slate-800 relative flex items-center overflow-hidden px-2">
                    <svg viewBox="0 0 2000 6500" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid de Multipolos */}
                      <line x1="220" y1="0" x2="220" y2="6500" stroke="#06b6d4" strokeWidth="15" strokeDasharray="50 50" opacity="0.3" />
                      <line x1="540" y1="0" x2="540" y2="6500" stroke="#f59e0b" strokeWidth="15" strokeDasharray="50 50" opacity="0.3" />
                      <line x1="800" y1="0" x2="800" y2="6500" stroke="#8b5cf6" strokeWidth="15" strokeDasharray="50 50" opacity="0.3" />

                      {/* Curva D_l */}
                      <path
                        d={`M 0 6500 ${cmbCurvePoints.map(p => `L ${p.l} ${(6500 - p.Dl).toFixed(1)}`).join(' ')}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="24"
                      />
                    </svg>

                    <div className="absolute top-2 left-16 text-[10px] font-mono text-cyan-300">
                      1º Pico (ℓ ≈ 220)
                    </div>
                    <div className="absolute top-12 left-44 text-[10px] font-mono text-amber-300">
                      2º Pico (ℓ ≈ 540)
                    </div>
                    <div className="absolute top-16 left-72 text-[10px] font-mono text-purple-300">
                      3º Pico (ℓ ≈ 800)
                    </div>
                  </div>
                </div>

                {/* Explicação dos 3 Picos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-cyan-400 mb-1">1º Pico: Curvatura Espacial</div>
                    <p className="text-[11px] text-slate-400">
                      Localizado exatamente em ℓ ≈ 220 (escala angular de 1 grau), provando que o universo é geometricamente plano com precisão de 0.4%.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-amber-400 mb-1">2º Pico: Densidade Bariônica</div>
                    <p className="text-[11px] text-slate-400">
                      Rarefação primordial. A razão de alturas com o 1º pico mede diretamente a densidade de átomos comuns no universo (~4.9%).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-purple-400 mb-1">3º Pico: Matéria Escura</div>
                    <p className="text-[11px] text-slate-400">
                      Segunda compressão. Sua amplitude elevada demonstra que a matéria escura fria é 5 vezes mais abundante que os bárions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: OSCILAÇÕES ACÚSTICAS DE BÁRIONS (BAO) & RÉGUA CÓSMICA               */}
        {/* ========================================================================= */}
        {activeTab === 'bao-ruler' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles de BAO */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parâmetros da Régua Acústica
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Horizonte Sonoro no Desacoplamento (r_s):</span>
                        <span className="font-mono text-purple-300">{soundHorizonMpc.toFixed(1)} Mpc</span>
                      </div>
                      <input
                        type="range"
                        min="130"
                        max="165"
                        step="0.2"
                        value={soundHorizonMpc}
                        onChange={(e) => setSoundHorizonMpc(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        Régua padrão cósmica congelada em z ≈ 1060 (~480 milhões de anos-luz).
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Redshift de Sondagem de Galáxias (z):</span>
                        <span className="font-mono text-cyan-300">z = {baoProbeRedshift.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.5"
                        step="0.01"
                        value={baoProbeRedshift}
                        onChange={(e) => setBaoProbeRedshift(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Surveys de BAO */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Grandes Campanhas de Mapeamento (Surveys)
                  </h4>
                  <div className="space-y-1.5">
                    {baoSurveys.map((survey, idx) => (
                      <button
                        key={idx}
                        onClick={() => setBaoProbeRedshift(survey.z)}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-purple-500/40 transition-all text-xs"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-200">{survey.name}</span>
                          <span className="font-mono text-purple-400">z = {survey.z}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{survey.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medições da Régua BAO */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Orbit className="w-4 h-4" /> Deformação Relativística da Casca Acústica
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      r_s = {soundHorizonMpc} Mpc
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Escala Angular (θ_BAO):</span>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                        {baoData.theta_bao_deg.toFixed(3)}°
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">r_s / dM(z)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Intervalo Radial (Δz_BAO):</span>
                      <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        Δz = {baoData.delta_z_bao.toFixed(4)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">r_s H(z) / c</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Taxa de Hubble Local:</span>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {baoData.Hz.toFixed(1)} km/s/Mpc
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">H(z = {baoProbeRedshift.toFixed(2)})</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Distância Esférica D_V:</span>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {baoData.DV_Mpc.toFixed(0)} Mpc
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">[cz dM² / H(z)]^(1/3)</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Razão Canônica D_V / r_s:</span>
                      <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                        {baoData.DV_over_rs.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Observável DESI/BOSS</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400">Distância Transversa (dM):</span>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {baoData.dM_Mpc.toFixed(0)} Mpc
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Plano do Céu</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-400 mb-1">
                    <Sparkles className="w-4 h-4" /> A Régua Mágica do Universo
                  </div>
                  Ondas sonoras no plasma primordial viajaram por 380.000 anos até o desacoplamento, criando um excesso esférico de matéria a <span className="text-cyan-300 font-mono">~150 Mpc</span> de cada poço primordial. Esse anel congelado é medido hoje na distribuição de galáxias como uma régua de comprimento absoluto.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: EQUAÇÃO DE ESTADO DA ENERGIA ESCURA (CPL w0/wa & BIG RIP)          */}
        {/* ========================================================================= */}
        {activeTab === 'dark-energy-eos' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Controles CPL */}
              <div className="w-full lg:w-5/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Parametrização CPL: w(z) = w₀ + wₐ z/(1+z)
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Equação de Estado Hoje (w₀ = P/ρc²):</span>
                        <span className="font-mono text-purple-300">{w0Param.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.5"
                        max="-0.4"
                        step="0.01"
                        value={w0Param}
                        onChange={(e) => setW0Param(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>-1.5 (Fantasma)</span>
                        <span>-1.0 (ΛCDM)</span>
                        <span>-0.4 (Quintessência)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Derivada Temporal Dinâmica (wₐ):</span>
                        <span className="font-mono text-cyan-300">{waParam.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.5"
                        max="1.5"
                        step="0.02"
                        value={waParam}
                        onChange={(e) => setWaParam(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets de Modelos de Energia Escura */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Modelos Teóricos & Observacionais
                  </h4>
                  <div className="space-y-1.5">
                    {dePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setW0Param(preset.w0);
                          setWaParam(preset.wa);
                        }}
                        className="w-full p-2 text-left rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-purple-500/40 transition-all text-xs"
                      >
                        <div className="font-medium text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Destino Cósmico & Métricas */}
              <div className="w-full lg:w-7/12 space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Diagnóstico do Destino Final do Universo
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${w0Param < -1.0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'}`}>
                      {deData.fate}
                    </span>
                  </div>

                  {/* Curva w(z) */}
                  <div className="w-full h-44 bg-black/70 rounded-xl border border-slate-800 relative flex items-center overflow-hidden px-2">
                    <svg viewBox="0 -1.8 3 1.6" className="w-full h-full" preserveAspectRatio="none">
                      {/* Linha Crítica w = -1 */}
                      <line x1="0" y1="-1.0" x2="3" y2="-1.0" stroke="#f59e0b" strokeWidth="0.02" strokeDasharray="0.05 0.05" />

                      {/* Curva de w(z) */}
                      <polyline
                        points={deData.wPoints.map(p => `${p.z.toFixed(2)},${p.w.toFixed(3)}`).join(' ')}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="0.04"
                      />
                    </svg>

                    <div className="absolute top-2 left-3 text-[10px] font-mono text-purple-300">
                      w(z=0) = {w0Param.toFixed(2)}
                    </div>
                    <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-400">
                      Linha de Fronteira Fantasma (w = -1)
                    </div>
                  </div>
                </div>

                {/* Métricas do Destino */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Desaceleração Atual:</span>
                    <div className={`text-sm font-bold font-mono mt-0.5 ${deData.q0_de < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      q₀ = {deData.q0_de.toFixed(3)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{deData.q0_de < 0 ? 'Acelerando' : 'Desacelerando'}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Tempo até o Big Rip:</span>
                    <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                      {deData.ripTimeGa > 0 ? `${deData.ripTimeGa.toFixed(1)} Ga` : 'Infinito'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{deData.ripTimeGa > 0 ? 'Ruptura Atômica' : 'Sem Big Rip'}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Densidade em z = 1:</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {(deData.wPoints.find(p => p.z >= 1.0)?.rho_ratio || 1.0).toFixed(2)}x ρ_DE0
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Relativa a Hoje</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(`Equação de Estado Energia Escura CPL: w0 = ${w0Param}, wa = ${waParam}\nDestino Cósmico: ${deData.fate}\nq0: ${deData.q0_de.toFixed(3)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Diagnóstico de Energia Escura
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
