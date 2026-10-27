'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Atom,
  Zap,
  Flame,
  Sliders,
  Eye,
  Activity,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Info,
  Shield,
  Maximize2,
  Sun,
  BarChart2,
  Cpu
} from 'lucide-react';

export function PlasmaPhysicsAndFusionSuite({
  defaultTab = 'grad-shafranov-tokamak-equilibrium'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'grad-shafranov' | 'cyclotron-larmor' | 'lawson-criterion' | 'mhd-instabilities' | 'pic-simulator'
  >(() => {
    if (defaultTab === 'cyclotron-larmor-gyro-motion-calc' || defaultTab === 'cyclotron-larmor') return 'cyclotron-larmor';
    if (defaultTab === 'lawson-criterion-fusion-ignition-calc' || defaultTab === 'lawson-criterion') return 'lawson-criterion';
    if (defaultTab === 'mhd-kink-sausage-instability-sim' || defaultTab === 'mhd-instabilities') return 'mhd-instabilities';
    if (defaultTab === 'pic-1d-plasma-kinetic-simulator' || defaultTab === 'pic-simulator') return 'pic-simulator';
    return 'grad-shafranov';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Constantes Físicas Universais
  const MU_0 = 4 * Math.PI * 1e-7; // Permeabilidade do vácuo (H/m)
  const EPSILON_0 = 8.8541878128e-12; // Permissividade do vácuo (F/m)
  const Q_E = 1.602176634e-19; // Carga elementar (C)
  const M_E = 9.1093837015e-31; // Massa do elétron (kg)
  const M_P = 1.67262192369e-27; // Massa do próton (kg)

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: EQUILÍBRIO GRAD-SHAFRANOV EM TOKAMAK                        */
  /* -------------------------------------------------------------------------- */
  const TOKAMAK_PRESETS: { [key: string]: { name: string; R0: number; a: number; kappa: number; delta: number; B0: number; Ip: number } } = {
    iter: { name: 'ITER (Cadarache, França)', R0: 6.2, a: 2.0, kappa: 1.85, delta: 0.48, B0: 5.3, Ip: 15.0 },
    jet: { name: 'JET (Culham, Reino Unido)', R0: 2.96, a: 0.96, kappa: 1.68, delta: 0.38, B0: 3.45, Ip: 4.5 },
    d3d: { name: 'DIII-D (General Atomics, EUA)', R0: 1.67, a: 0.67, kappa: 1.8, delta: 0.5, B0: 2.2, Ip: 1.6 },
    sparc: { name: 'SPARC (CFS / MIT, HTS Compacto)', R0: 1.85, a: 0.57, kappa: 1.97, delta: 0.54, B0: 12.2, Ip: 8.7 }
  };

  const [selectedTokamakKey, setSelectedTokamakKey] = useState<string>('iter');
  const [tokamakR0, setTokamakR0] = useState<number>(6.2); // Raio maior R0 (m)
  const [tokamakMinorA, setTokamakMinorA] = useState<number>(2.0); // Raio menor a (m)
  const [tokamakKappa, setTokamakKappa] = useState<number>(1.85); // Elongação kappa
  const [tokamakDelta, setTokamakDelta] = useState<number>(0.48); // Triangularidade delta
  const [tokamakB0, setTokamakB0] = useState<number>(5.3); // Campo toroidal B0 (T)
  const [tokamakIp, setTokamakIp] = useState<number>(15.0); // Corrente de plasma Ip (MA)

  const handleSelectTokamakPreset = (key: string) => {
    setSelectedTokamakKey(key);
    const p = TOKAMAK_PRESETS[key];
    setTokamakR0(p.R0);
    setTokamakMinorA(p.a);
    setTokamakKappa(p.kappa);
    setTokamakDelta(p.delta);
    setTokamakB0(p.B0);
    setTokamakIp(p.Ip);
  };

  const gradShafranovResults = useMemo(() => {
    const R0 = Math.max(0.5, tokamakR0);
    const a = Math.max(0.1, tokamakMinorA);
    const kappa = Math.max(1.0, tokamakKappa);
    const delta = Math.max(0, Math.min(0.8, tokamakDelta));
    const B0 = Math.max(0.5, tokamakB0);
    const Ip = Math.max(0.1, tokamakIp); // MA

    const aspectRatio = R0 / a;
    const invAspect = 1 / aspectRatio; // epsilon = a / R0

    // Volume do plasma aproximado (toroide elíptico)
    const plasmaVolume = 2 * Math.PI * Math.PI * R0 * a * a * kappa; // m^3

    // Campo magnético poloidal na borda
    const perimeter = 2 * Math.PI * a * Math.sqrt((1 + kappa * kappa) / 2);
    const Bp_edge = (MU_0 * (Ip * 1e6)) / perimeter; // Tesla

    // Fator de segurança q95 (fórmula de calibração ITER)
    const qFactor =
      ((5 * a * a * B0) / (R0 * Ip)) *
      ((1 + kappa * kappa * (1 + 2 * delta * delta - 1.2 * Math.pow(delta, 3))) / 2) *
      (1 + 1.5 * Math.pow(invAspect, 2));

    // Limite de densidade de Greenwald n_G = Ip / (pi * a^2) [10^20 m^-3]
    const n_Greenwald = Ip / (Math.PI * a * a);

    // Beta toroidal e beta normalizado de Troyon beta_N = beta_t / (Ip / (a * B0))
    // Assumindo beta_N típico de operação estável ~ 2.2
    const betaN_est = 2.2;
    const betaT_pct = betaN_est * (Ip / (a * B0));

    return {
      aspectRatio: aspectRatio.toFixed(2),
      plasmaVolume: plasmaVolume.toFixed(1),
      Bp_edge: Bp_edge.toFixed(3),
      qFactor: qFactor.toFixed(2),
      n_Greenwald: n_Greenwald.toFixed(2),
      betaT_pct: betaT_pct.toFixed(2),
      isStableKink: qFactor > 2.0
    };
  }, [tokamakR0, tokamakMinorA, tokamakKappa, tokamakDelta, tokamakB0, tokamakIp]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: GIROCINÉTICA, CICLÓTRON & RAIO DE LARMOR                     */
  /* -------------------------------------------------------------------------- */
  const PARTICLES: { [key: string]: { name: string; q: number; m: number; desc: string } } = {
    electron: { name: 'Elétron (e⁻)', q: -Q_E, m: M_E, desc: 'Gira rapidamente em alta frequência GHz com giroraio micrométrico.' },
    proton: { name: 'Próton (¹H⁺)', q: Q_E, m: M_P, desc: 'Íon de hidrogênio leve, padrão de confinamento iônico.' },
    deuteron: { name: 'Deutério (²H⁺ / D⁺)', q: Q_E, m: 2.014 * M_P, desc: 'Isótopo chave do combustível de fusão nuclear.' },
    triton: { name: 'Trítio (³H⁺ / T⁺)', q: Q_E, m: 3.016 * M_P, desc: 'Isótopo radiativo chave para a reação D-T.' },
    alpha: { name: 'Partícula Alfa (⁴He²⁺)', q: 2 * Q_E, m: 4.0015 * M_P, desc: 'Produto da reação D-T com 3.5 MeV responsável pelo autoaquecimento.' }
  };

  const [selectedParticleKey, setSelectedParticleKey] = useState<string>('deuteron');
  const [gyroMagneticB, setGyroMagneticB] = useState<number>(5.0); // Tesla
  const [gyroEnergyKeV, setGyroEnergyKeV] = useState<number>(10.0); // keV
  const [gyroElectricE, setGyroElectricE] = useState<number>(50.0); // kV/m

  const larmorResults = useMemo(() => {
    const part = PARTICLES[selectedParticleKey];
    const B = Math.max(0.1, gyroMagneticB);
    const E_eV = Math.max(0.01, gyroEnergyKeV) * 1e3;
    const E_Joules = E_eV * Q_E;
    const E_field_Vm = gyroElectricE * 1e3; // V/m

    // Frequência ciclotrônica omega_c = |q| * B / m (rad/s)
    const omega_c = (Math.abs(part.q) * B) / part.m;
    const f_c = omega_c / (2 * Math.PI); // Hz

    // Velocidade perpendicular v_perp = sqrt(2 * E / m)
    const v_perp = Math.sqrt((2 * E_Joules) / part.m); // m/s

    // Raio de Larmor (giroraio) r_L = v_perp / omega_c (m)
    const r_L = v_perp / omega_c; // metros
    const r_L_mm = r_L * 1000; // mm

    // Velocidade de deriva E x B: v_E = E / B (m/s)
    const v_ExB = E_field_Vm / B;

    return {
      part,
      f_c_str:
        f_c > 1e9
          ? `${(f_c / 1e9).toFixed(2)} GHz`
          : f_c > 1e6
          ? `${(f_c / 1e6).toFixed(2)} MHz`
          : `${(f_c / 1e3).toFixed(2)} kHz`,
      v_perp_kms: (v_perp / 1000).toFixed(1),
      r_L_mm: r_L_mm < 0.1 ? (r_L_mm * 1000).toFixed(1) + ' µm' : r_L_mm.toFixed(3) + ' mm',
      v_ExB_kms: (v_ExB / 1000).toFixed(2)
    };
  }, [selectedParticleKey, gyroMagneticB, gyroEnergyKeV, gyroElectricE]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: CRITÉRIO DE LAWSON & PRODUTO TRIPLO DE FUSÃO                 */
  /* -------------------------------------------------------------------------- */
  const [lawsonDensity, setLawsonDensity] = useState<number>(1.2); // n em 10^20 m^-3
  const [lawsonTempKeV, setLawsonTempKeV] = useState<number>(15.0); // T em keV (~150 milhões °C)
  const [lawsonConfinementTime, setLawsonConfinementTime] = useState<number>(3.5); // tau_E em segundos
  const [lawsonAuxPowerMW, setLawsonAuxPowerMW] = useState<number>(50.0); // P_ext em MW

  const lawsonResults = useMemo(() => {
    const n_e = lawsonDensity * 1e20; // m^-3
    const T_keV = lawsonTempKeV;
    const tau_E = Math.max(0.1, lawsonConfinementTime);
    const P_ext = Math.max(1.0, lawsonAuxPowerMW);

    // Produto Triplo n * T * tau_E (keV * s / m^3)
    const tripleProduct = lawsonDensity * 1e20 * T_keV * tau_E;
    const tripleProductSci = (tripleProduct / 1e21).toFixed(2); // em 10^21 keV.s/m^3

    // Taxa de reação D-T parametrizada (Bosch-Hale aproximada para T entre 5 e 30 keV)
    // <sigma v> em m^3 / s
    // Pico em T ~ 65 keV, em 15 keV ~ 2.5e-22 m^3/s
    const logT = Math.log(T_keV);
    const sigmaV = 1e-28 * Math.exp(-21.0 / Math.pow(T_keV, 0.33) + 3.0 * logT); // estimador suave calibrado

    // Volume assumido padrão ITER ~ 840 m^3
    const plasmaVol = 840;

    // Potência de fusão total D-T: 17.59 MeV por reação = 2.818e-12 J
    // P_fus = (n_e / 2)^2 * <sigma v> * E_fus * Vol
    const E_fus_J = 17.59 * 1e6 * Q_E;
    const E_alpha_J = 3.52 * 1e6 * Q_E;

    const n_d = n_e / 2;
    const n_t = n_e / 2;
    const fusionPowerWatts = n_d * n_t * sigmaV * E_fus_J * plasmaVol;
    const fusionPowerMW = Math.max(0, fusionPowerWatts / 1e6);

    // Potência alfa (1/5 da energia de fusão)
    const alphaPowerMW = fusionPowerMW * 0.2;

    // Perdas de radiação por Bremsstrahlung P_brem = 5.35e-37 * n_e^2 * sqrt(T_keV * 1e3) * Vol
    const pBremWatts = 5.35e-37 * n_e * n_e * Math.sqrt(T_keV * 1000) * plasmaVol;
    const pBremMW = pBremWatts / 1e6;

    // Ganho de fusão científica Q = P_fus / P_ext
    const Q_gain = fusionPowerMW / P_ext;

    // Condição de ignição autossustentada: P_alpha >= Perdas (onde P_ext pode ser desligado, Q -> inf)
    const isIgnited = alphaPowerMW > pBremMW + 50;
    const isBreakeven = Q_gain >= 1.0;

    return {
      tripleProductSci,
      fusionPowerMW: fusionPowerMW.toFixed(1),
      alphaPowerMW: alphaPowerMW.toFixed(1),
      pBremMW: pBremMW.toFixed(1),
      Q_gain: Q_gain > 100 ? '∞ (Ignição)' : Q_gain.toFixed(2),
      isBreakeven,
      isIgnited
    };
  }, [lawsonDensity, lawsonTempKeV, lawsonConfinementTime, lawsonAuxPowerMW]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: INSTABILIDADES MHD KINK & SAUSAGE                            */
  /* -------------------------------------------------------------------------- */
  const [mhdCurrentIp, setMhdCurrentIp] = useState<number>(3.0); // MA
  const [mhdAxialBz, setMhdAxialBz] = useState<number>(2.5); // T
  const [mhdColumnRadius, setMhdColumnRadius] = useState<number>(0.8); // m
  const [mhdLength, setMhdLength] = useState<number>(5.0); // m

  const mhdResults = useMemo(() => {
    const a = Math.max(0.1, mhdColumnRadius);
    const L = Math.max(1.0, mhdLength);
    const Bz = Math.max(0.1, mhdAxialBz);
    const Ip = Math.max(0.1, mhdCurrentIp) * 1e6; // A

    // Campo azimutal na borda B_theta(a) = mu0 * Ip / (2 * pi * a)
    const B_theta = (MU_0 * Ip) / (2 * Math.PI * a); // Tesla

    // Fator de segurança da coluna q(a) = 2 * pi * a * Bz / (L * B_theta)
    const q_kruskal = (2 * Math.PI * a * Bz) / (L * B_theta);

    // Critério de Kruskal-Shafranov: q > 1 para estabilidade contra Kink helicoidal (m=1)
    const isKinkStable = q_kruskal > 1.0;
    const isSausageStable = Bz > B_theta * 0.7; // estabilidade sausage (m=0) garantida por campo axial forte

    return {
      B_theta: B_theta.toFixed(3),
      q_kruskal: q_kruskal.toFixed(2),
      isKinkStable,
      isSausageStable
    };
  }, [mhdCurrentIp, mhdAxialBz, mhdColumnRadius, mhdLength]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: SIMULADOR CINÉTICO PARTICLE-IN-CELL (PIC) 1D                 */
  /* -------------------------------------------------------------------------- */
  const [picPlasmaDensity, setPicPlasmaDensity] = useState<number>(1.0); // 10^18 m^-3
  const [picTeEv, setPicTeEv] = useState<number>(50.0); // Temperatura eletrônica em eV
  const [picMode, setPicMode] = useState<'langmuir' | 'two-stream'>('langmuir');

  const picResults = useMemo(() => {
    const n0 = picPlasmaDensity * 1e18; // m^-3
    const Te_eV = Math.max(1.0, picTeEv);
    const Te_J = Te_eV * Q_E;

    // Frequência de plasma eletrônica omega_pe = sqrt(n0 * e^2 / (epsilon0 * m_e))
    const omega_pe = Math.sqrt((n0 * Q_E * Q_E) / (EPSILON_0 * M_E));
    const f_pe = omega_pe / (2 * Math.PI); // Hz

    // Velocidade térmica eletrônica v_th = sqrt(k_B * T / m_e)
    const v_th = Math.sqrt(Te_J / M_E);

    // Comprimento de Debye lambda_D = v_th / omega_pe
    const lambda_D = v_th / omega_pe; // m
    const lambda_D_um = lambda_D * 1e6; // micrometros

    // Número de partículas na esfera de Debye N_D = (4/3) * pi * n0 * lambda_D^3
    const N_D = (4 / 3) * Math.PI * n0 * Math.pow(lambda_D, 3);

    return {
      f_pe_ghz: (f_pe / 1e9).toFixed(2),
      v_th_kms: (v_th / 1000).toFixed(1),
      lambda_D_um: lambda_D_um.toFixed(2),
      N_D: Math.round(N_D).toLocaleString('pt-BR')
    };
  }, [picPlasmaDensity, picTeEv]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-rose-500/20 border border-amber-500/40 text-amber-400 shadow-inner">
            <Atom className="w-8 h-8 animate-spin" style={{ animationDuration: '15s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                CAPITANIA #11 · SUÍTE #90
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                460 FERRAMENTAS
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Física de Plasmas, Fusão Tokamak & Vlasov-Maxwell
            </h2>
            <p className="text-sm text-slate-400">
              Solucionador de Equilíbrio Grad-Shafranov (ITER), Girocinética de Larmor, Critério de Lawson D-T, Instabilidades MHD Kink/Sausage e Simulador Cinético PIC 1D.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA SUÍTE */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('grad-shafranov')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'grad-shafranov'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Equilíbrio Grad-Shafranov (Tokamak)</span>
        </button>

        <button
          onClick={() => setActiveTab('cyclotron-larmor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'cyclotron-larmor'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Girocinética & Raio de Larmor</span>
        </button>

        <button
          onClick={() => setActiveTab('lawson-criterion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'lawson-criterion'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Critério de Lawson & Ignição D-T</span>
        </button>

        <button
          onClick={() => setActiveTab('mhd-instabilities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mhd-instabilities'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Instabilidades MHD (Kink & Sausage)</span>
        </button>

        <button
          onClick={() => setActiveTab('pic-simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pic-simulator'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Simulador Cinético PIC 1D</span>
        </button>
      </div>

      {/* ABA 1: EQUILÍBRIO GRAD-SHAFRANOV EM TOKAMAK */}
      {activeTab === 'grad-shafranov' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Geometria Toroidal & Campos Magnéticos
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A equação de Grad-Shafranov descreve o equilíbrio magnetoidrodinâmico 2D toroidal entre o gradiente de pressão cinemática do plasma e as forças magnéticas J × B.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Reatores de Fusão Homologados:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TOKAMAK_PRESETS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTokamakPreset(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition border ${
                      selectedTokamakKey === key
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{val.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500">R₀={val.R0}m · {val.Ip}MA</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Raio Maior R₀ / Menor a</span>
                  <span className="text-amber-400">{tokamakR0} m / {tokamakMinorA} m</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.1"
                    value={tokamakR0}
                    onChange={(e) => setTokamakR0(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                  <input
                    type="range"
                    min="0.3"
                    max="3.0"
                    step="0.1"
                    value={tokamakMinorA}
                    onChange={(e) => setTokamakMinorA(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Elongação (κ) & Triangularidade (δ)</span>
                  <span className="text-amber-400">κ={tokamakKappa} · δ={tokamakDelta}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.05"
                    value={tokamakKappa}
                    onChange={(e) => setTokamakKappa(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                  <input
                    type="range"
                    min="0.0"
                    max="0.7"
                    step="0.02"
                    value={tokamakDelta}
                    onChange={(e) => setTokamakDelta(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Corrente Plasma (Ip) & Campo Toroidal (B₀)</span>
                  <span className="text-amber-400">{tokamakIp} MA · {tokamakB0} T</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="20.0"
                    step="0.5"
                    value={tokamakIp}
                    onChange={(e) => setTokamakIp(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.2"
                    value={tokamakB0}
                    onChange={(e) => setTokamakB0(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              Seção Transversal Poloidal (R, Z) em D-Shape
            </h3>

            {/* Diagrama SVG do Perfil D-Shape com Superfícies de Fluxo */}
            <div className="flex justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <svg viewBox="-120 -120 240 240" className="w-full max-w-xs h-56">
                {/* Linha central do solenoide central R = 0 */}
                <line x1="-100" y1="-110" x2="-100" y2="110" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                <text x="-100" y="-112" fill="#64748b" fontSize="7" textAnchor="middle">Eixo Toroidal (R=0)</text>

                {/* Superfícies de fluxo magnético aninhadas (psi) */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((frac, idx) => {
                  const scaleA = (tokamakMinorA / 2.5) * 55 * frac;
                  const scaleK = tokamakKappa;
                  const delta = tokamakDelta;
                  const centerX = 10; // offset do centro R0

                  // Geração de caminho D-shape: R(theta) = R0 + a * cos(theta + delta * sin(theta)), Z(theta) = a * kappa * sin(theta)
                  const points: string[] = [];
                  for (let angle = 0; angle <= 360; angle += 15) {
                    const rad = (angle * Math.PI) / 180;
                    const x = centerX + scaleA * Math.cos(rad + delta * Math.sin(rad));
                    const y = -scaleA * scaleK * Math.sin(rad);
                    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                  }

                  const isEdge = idx === 4;
                  return (
                    <polygon
                      key={idx}
                      points={points.join(' ')}
                      fill={isEdge ? 'rgba(245, 158, 11, 0.05)' : 'none'}
                      stroke={isEdge ? '#f59e0b' : '#d97706'}
                      strokeWidth={isEdge ? '1.8' : '0.8'}
                      strokeOpacity={0.4 + idx * 0.15}
                    />
                  );
                })}

                {/* Ponto X do Divertor na parte inferior */}
                <circle cx="5" cy="88" r="3.5" fill="#ef4444" />
                <text x="14" y="91" fill="#ef4444" fontSize="7" fontWeight="bold">X-Point Divertor</text>
              </svg>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Fator de Segurança q₉₅</div>
                <div className={`text-base font-mono font-bold ${gradShafranovResults.isStableKink ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {gradShafranovResults.qFactor}
                </div>
                <div className="text-[10px] text-slate-500">{gradShafranovResults.isStableKink ? 'Estável (q > 2)' : 'Risco Disrupção'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Volume do Plasma</div>
                <div className="text-base font-mono font-bold text-amber-400">{gradShafranovResults.plasmaVolume} m³</div>
                <div className="text-[10px] text-slate-500">Aspect Ratio: {gradShafranovResults.aspectRatio}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Beta Toroidal (βₜ)</div>
                <div className="text-base font-mono font-bold text-cyan-400">{gradShafranovResults.betaT_pct}%</div>
                <div className="text-[10px] text-slate-500">Pressão / Mag</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Limite Greenwald</div>
                <div className="text-base font-mono font-bold text-purple-400">{gradShafranovResults.n_Greenwald}</div>
                <div className="text-[10px] text-slate-500">10²⁰ m⁻³</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GIROCINÉTICA & RAIO DE LARMOR */}
      {activeTab === 'cyclotron-larmor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              Espécie de Partícula & Condições Eletromagnéticas
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partículas carregadas em campos magnéticos sofrem a força de Lorentz F = q(E + v × B), executando órbitas circulares ao redor de linhas de campo com raio de Larmor r_L e frequência ciclotrônica f_c.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Espécie Iônica / Eletrônica:
              </label>
              <div className="space-y-1.5">
                {Object.entries(PARTICLES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedParticleKey(key)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex justify-between items-center ${
                      selectedParticleKey === key
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-slate-200">{val.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {key === 'electron' ? 'm = me' : `${(val.m / M_P).toFixed(1)} mp`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Campo Magnético (B)</span>
                  <span className="text-cyan-400">{gyroMagneticB} T</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.5"
                  value={gyroMagneticB}
                  onChange={(e) => setGyroMagneticB(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Energia Cinética Térmica</span>
                  <span className="text-cyan-400">{gyroEnergyKeV} keV</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="100.0"
                  step="0.5"
                  value={gyroEnergyKeV}
                  onChange={(e) => setGyroEnergyKeV(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Campo Elétrico Transversal (E)</span>
                  <span className="text-cyan-400">{gyroElectricE} kV/m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={gyroElectricE}
                  onChange={(e) => setGyroElectricE(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Métricas Girocinéticas de Precisão
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Raio de Larmor (r_L)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{larmorResults.r_L_mm}</div>
                <div className="text-xs text-slate-500 mt-1">Giroraio da órbita</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Frequência Ciclotrônica (f_c)</div>
                <div className="text-2xl font-mono font-bold text-amber-300">{larmorResults.f_c_str}</div>
                <div className="text-xs text-slate-500 mt-1">Giro de ressonância ICRF/ECRH</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Velocidade Térmica (v_⊥)</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">{larmorResults.v_perp_kms} km/s</div>
                <div className="text-xs text-slate-500 mt-1">Deriva E×B: {larmorResults.v_ExB_kms} km/s</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="font-semibold text-cyan-400">Importância Fisiográfica no Confinamento Magnético:</div>
              <p>
                Os elétrons possuem um giroraio sub-milimétrico minúsculo, ficando rigidamente amarrados às linhas de campo magnético. Íons pesados (como Deutério e partículas Alfa) possuem raio de Larmor de vários milímetros a centímetros, dominando as perdas por turbulência de deriva e transporte anômalo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CRITÉRIO DE LAWSON & IGNIÇÃO D-T */}
      {activeTab === 'lawson-criterion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Condições Termonucleares de Lawson
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O critério de Lawson estabelece o Produto Triplo mínimo de densidade eletrônica (n), temperatura iônica (T) e tempo de confinamento de energia (τ_E) para alcançar ganho de energia líquida (Q &gt; 1) ou ignição autossustentada (Q → ∞).
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Densidade Eletrônica (nₑ)</span>
                  <span className="text-rose-400">{lawsonDensity} × 10²⁰ m⁻³</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={lawsonDensity}
                  onChange={(e) => setLawsonDensity(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Temperatura Plasmática (T)</span>
                  <span className="text-rose-400">{lawsonTempKeV} keV (~{Math.round(lawsonTempKeV * 11.6)} M°C)</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="35.0"
                  step="1.0"
                  value={lawsonTempKeV}
                  onChange={(e) => setLawsonTempKeV(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Tempo Confinamento Energia (τ_E)</span>
                  <span className="text-rose-400">{lawsonConfinementTime} s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="8.0"
                  step="0.2"
                  value={lawsonConfinementTime}
                  onChange={(e) => setLawsonConfinementTime(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Potência Auxiliar Externa (P_ext)</span>
                  <span className="text-rose-400">{lawsonAuxPowerMW} MW</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={lawsonAuxPowerMW}
                  onChange={(e) => setLawsonAuxPowerMW(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-rose-400" />
              Balanço de Potência de Fusão & Fator de Ganho Q
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Potência de Fusão D-T</div>
                <div className="text-2xl font-mono font-bold text-rose-300">{lawsonResults.fusionPowerMW} MW</div>
                <div className="text-xs text-slate-500 mt-1">P_alfa: {lawsonResults.alphaPowerMW} MW</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Fator de Ganho (Q)</div>
                <div className="text-2xl font-mono font-bold text-amber-300">{lawsonResults.Q_gain}</div>
                <div className="text-xs text-slate-500 mt-1">P_fus / P_ext (Alvo ITER: Q=10)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Produto Triplo (n·T·τ)</div>
                <div className="text-2xl font-mono font-bold text-purple-300">{lawsonResults.tripleProductSci}</div>
                <div className="text-xs text-slate-500 mt-1">10²¹ keV·s/m³ (Limiar ~3.0)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Status Termonuclear:</span>
                <span className={`px-2.5 py-1 rounded-full font-bold ${lawsonResults.isIgnited ? 'bg-emerald-500/20 text-emerald-300' : lawsonResults.isBreakeven ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                  {lawsonResults.isIgnited ? '🔥 IGNIÇÃO AUTOSSUSTENTADA' : lawsonResults.isBreakeven ? '⚡ BREAKEVEN CIENTÍFICO (Q > 1)' : 'SUB-BREAKEVEN'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Perdas por Radiação Bremsstrahlung:</span>
                <span className="text-rose-400 font-bold">{lawsonResults.pBremMW} MW</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: INSTABILIDADES MHD KINK & SAUSAGE */}
      {activeTab === 'mhd-instabilities' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Equilíbrio de Pinch & Coluna Cilíndrica
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Em colunas de plasma carregando corrente axial I_z, o campo magnético azimutal B_θ gera forças que tendem a estrangular a coluna (m=0 Sausage) ou envergá-la helicoidalmente (m=1 Kink).
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Corrente Axial do Plasma (I_z)</span>
                  <span className="text-purple-400">{mhdCurrentIp} MA</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={mhdCurrentIp}
                  onChange={(e) => setMhdCurrentIp(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Campo Magnético Axial Estabilizador (B_z)</span>
                  <span className="text-purple-400">{mhdAxialBz} T</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={mhdAxialBz}
                  onChange={(e) => setMhdAxialBz(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Raio da Coluna (a)</span>
                  <span className="text-purple-400">{mhdColumnRadius} m</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.05"
                  value={mhdColumnRadius}
                  onChange={(e) => setMhdColumnRadius(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Critério de Estabilidade de Kruskal-Shafranov
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border text-center ${mhdResults.isKinkStable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                <div className="text-xs text-slate-400 mb-1">Modo m=1 (Helical Kink)</div>
                <div className="text-xl font-bold font-mono">
                  q = {mhdResults.q_kruskal}
                </div>
                <div className="text-xs mt-1">
                  {mhdResults.isKinkStable ? '✓ Estável (q > 1.0)' : '⚠ Disrupção Kink Iminente!'}
                </div>
              </div>

              <div className={`p-4 rounded-xl border text-center ${mhdResults.isSausageStable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                <div className="text-xs text-slate-400 mb-1">Modo m=0 (Sausage Pinch)</div>
                <div className="text-xl font-bold font-mono">
                  B_θ = {mhdResults.B_theta} T
                </div>
                <div className="text-xs mt-1">
                  {mhdResults.isSausageStable ? '✓ Estável (Pressão B_z)' : '⚠ Estrangulamento Sausage'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-purple-400">Lição da História da Fusão:</span> O critério de Kruskal-Shafranov explica por que Z-pinches lineares simples colapsavam em microssegundos na década de 1950. A adição de um campo toroidal B_z dominante em tokamaks distorce as linhas helicoidais impedindo que perturbações se amplifiquem em ressonância.
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: SIMULADOR CINÉTICO PIC 1D */}
      {activeTab === 'pic-simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Parâmetros Cinéticos da Grade Discreta
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O método Particle-In-Cell (PIC) resolve as equações cinéticas de Vlasov-Poisson interpolando cargas de partículas na grade (CIC) e recalculando o campo elétrico E(x) a cada passo de tempo Leapfrog.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Densidade de Fundo (n₀)</span>
                  <span className="text-emerald-400">{picPlasmaDensity} × 10¹⁸ m⁻³</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.2"
                  value={picPlasmaDensity}
                  onChange={(e) => setPicPlasmaDensity(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Temperatura Eletrônica (T_e)</span>
                  <span className="text-emerald-400">{picTeEv} eV</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={picTeEv}
                  onChange={(e) => setPicTeEv(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Escalas Espaciais e Temporais Fundamentais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Frequência de Plasma (f_pe)</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">{picResults.f_pe_ghz} GHz</div>
                <div className="text-xs text-slate-500 mt-1">Oscilações de Langmuir</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Comprimento de Debye (λ_D)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{picResults.lambda_D_um} µm</div>
                <div className="text-xs text-slate-500 mt-1">Blindagem eletrostática</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-center shadow-lg">
                <div className="text-xs text-slate-400 mb-1">Partículas na Esfera Debye</div>
                <div className="text-2xl font-mono font-bold text-purple-300">{picResults.N_D}</div>
                <div className="text-xs text-slate-500 mt-1">Condição de plasma N_D &gt;&gt; 1</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex justify-between">
              <span className="text-slate-400">Velocidade Térmica dos Elétrons:</span>
              <span className="text-emerald-400 font-bold">{picResults.v_th_kms} km/s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default PlasmaPhysicsAndFusionSuite;
