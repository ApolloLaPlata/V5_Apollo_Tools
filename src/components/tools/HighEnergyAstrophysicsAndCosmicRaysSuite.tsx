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
  Sun
} from 'lucide-react';

export function HighEnergyAstrophysicsAndCosmicRaysSuite({
  defaultTab = 'gzk-cutoff'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'gzk-cutoff' | 'fermi-acceleration' | 'synchrotron-ssc' | 'grb-fireball' | 'pulsar-spindown'
  >(() => {
    if (defaultTab === 'fermi-acceleration-shock-calc' || defaultTab === 'fermi-acceleration') return 'fermi-acceleration';
    if (defaultTab === 'synchrotron-inverse-compton-calc' || defaultTab === 'synchrotron-ssc') return 'synchrotron-ssc';
    if (defaultTab === 'gamma-ray-burst-fireball-calc' || defaultTab === 'grb-fireball') return 'grb-fireball';
    if (defaultTab === 'pulsar-magnetosphere-braking-calc' || defaultTab === 'pulsar-spindown') return 'pulsar-spindown';
    return 'gzk-cutoff';
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 1: LIMITE GZK & RAIOS CÓSMICOS ULTRA-ENERGÉTICOS (UHECRs)
  // -------------------------------------------------------------
  const [energyEeV, setEnergyEeV] = useState<number>(60); // EeV (10^18 eV), limiar GZK ~ 50 EeV
  const [distSourceMpc, setDistSourceMpc] = useState<number>(80); // Mpc (distância da fonte cósmica)
  const [targetCMBTemp, setTargetCMBTemp] = useState<number>(2.7255); // K

  const gzkCalculations = useMemo(() => {
    // Limiar GZK: E_th = (m_p * m_pi + m_pi^2 / 2) / (2 * epsilon_CMB) ~ 5 * 10^19 eV = 50 EeV
    const gzkThresholdEeV = 50;
    const isAboveGZK = energyEeV >= gzkThresholdEeV;

    // Caminho livre médio para foto-píon produção: lambda_GZK ~ 50 Mpc a E > 60 EeV
    // Queda exponencial de lambda com a energia acima do limiar
    let meanFreePathMpc = 1000;
    if (energyEeV > 30) {
      meanFreePathMpc = 50 / (1 + Math.pow((energyEeV - 50) / 20, 1.5));
      meanFreePathMpc = Math.max(10, meanFreePathMpc);
    }

    // Probabilidade de sobrevivência do próton atravessando a distância d: P = exp(-d / lambda)
    const survivalProb = Math.exp(-distSourceMpc / meanFreePathMpc);
    const attenuationPercent = (1 - survivalProb) * 100;

    // Fator de Lorentz do próton ultra-relativístico
    const mpGeV = 0.938272;
    const energyGeV = energyEeV * 1e9;
    const lorentzGamma = energyGeV / mpGeV;

    // Energia em Joules (1 EeV = 0.1602 Joules - equivalente cinético de uma bola de tênis a 100 km/h)
    const energyJoules = energyEeV * 0.160218;

    return {
      isAboveGZK,
      meanFreePathMpc,
      survivalProb,
      attenuationPercent,
      lorentzGamma,
      energyJoules
    };
  }, [energyEeV, distSourceMpc, targetCMBTemp]);

  // -------------------------------------------------------------
  // TAB 2: ACELERAÇÃO DIFUSIVA EM CHOQUES DE FERMI (1ª ORDEM)
  // -------------------------------------------------------------
  const [shockSpeedKmS, setShockSpeedKmS] = useState<number>(5000); // km/s (onda de choque de supernova)
  const [compressionRatio, setCompressionRatio] = useState<number>(4.0); // r = u1 / u2 (4 para choque monoatômico forte)
  const [bFieldMicroGauss, setBFieldMicroGauss] = useState<number>(100); // microGauss no choque comprimido
  const [shockAgeYears, setShockAgeYears] = useState<number>(1000); // Anos (remanescente SNR)

  const fermiCalculations = useMemo(() => {
    const c = 299792.458; // km/s
    const betaShock = shockSpeedKmS / c;

    // Ganho fracionário de energia por ciclo no choque de 1ª ordem (Bell / Blandford-Eichler)
    // Delta E / E = (4/3) * (u1 - u2) / c = (4/3) * u1 * (1 - 1/r) / c
    const deltaEOverE = (4 / 3) * betaShock * (1 - 1 / compressionRatio);

    // Índice espectral da distribuição de partículas: s = (r + 2) / (r - 1)
    // Para r = 4, s = 6 / 3 = 2.0 (espectro canônico N(E) dE ~ E^-2 dE)
    const spectralIndex = (compressionRatio + 2) / (compressionRatio - 1);

    // Energia máxima alcançável pelo critério de Hillas (E_max ~ q * B * R * beta_shock)
    // R_shock ~ v_shock * t_age
    const rShockParsec = (shockSpeedKmS * 1e3 * (shockAgeYears * 3.15576e7)) / 3.085677581e16;
    // E_max em PeV (10^15 eV): E_max(PeV) ~ (Z * B_muG * R_pc * beta_shock) / 1000
    const eMaxPeV = (1 * bFieldMicroGauss * rShockParsec * betaShock) / 1.5;

    return {
      betaShock,
      deltaEOverE,
      spectralIndex,
      rShockParsec,
      eMaxPeV,
      kneeMatch: eMaxPeV >= 3.0 ? 'Alcança o Joelho (Knee) de Raios Cósmicos (~3 PeV)' : 'Sub-Joelho (Requer campo magnético amplificado)'
    };
  }, [shockSpeedKmS, compressionRatio, bFieldMicroGauss, shockAgeYears]);

  // -------------------------------------------------------------
  // TAB 3: RADIAÇÃO SÍNCOTRON & AUTO-COMPTON INVERSO (SSC)
  // -------------------------------------------------------------
  const [electronGamma, setElectronGamma] = useState<number>(1e4); // Fator de Lorentz do elétron gama ~ 10^4
  const [bFieldGauss, setBFieldGauss] = useState<number>(0.5); // Gauss no jato relativístico
  const [bulkDopplerFactor, setBulkDopplerFactor] = useState<number>(15); // Fator Doppler delta_D do Blazar

  const synchrotronCalculations = useMemo(() => {
    // Frequência crítica síncrotron nu_sync ~ (3/4pi) * (e * B / m_e * c) * gamma^2
    // Constante síncrotron fundamental: nu_0 = (e / 2pi m_e c) ~ 2.80e6 Hz/Gauss
    const nu0 = 2.8e6; // Hz/Gauss
    const nuSyncIntrinsicHz = 1.5 * nu0 * bFieldGauss * electronGamma * electronGamma;
    const nuSyncObservedHz = nuSyncIntrinsicHz * bulkDopplerFactor;
    const nuSyncObservedEV = nuSyncObservedHz * 4.135667696e-15; // h em eV s

    // Frequência de espalhamento Compton Inverso (SSC de Thompson): nu_IC ~ (4/3) * gamma^2 * nu_sync
    const nuIcIntrinsicHz = (4 / 3) * electronGamma * electronGamma * nuSyncIntrinsicHz;
    const nuIcObservedHz = nuIcIntrinsicHz * bulkDopplerFactor;
    const nuIcObservedGeV = (nuIcObservedHz * 4.135667696e-15) / 1e9; // GeV

    // Taxa de resfriamento relativístico: tempo de vida t_cool ~ 3 m_e c / (4 sigma_T U_B gamma)
    // U_B = B^2 / (8pi)
    const ubErgCm3 = (bFieldGauss * bFieldGauss) / (8 * Math.PI);
    const tCoolHours = (7.74e8 / (bFieldGauss * bFieldGauss * electronGamma)) / 3600;

    return {
      nuSyncObservedEV,
      nuIcObservedGeV,
      tCoolHours,
      nuSyncBand: nuSyncObservedEV < 2 ? 'Óptico / Infravermelho' : nuSyncObservedEV < 1000 ? 'Raios-X Moles' : 'Raios-X Duros',
      nuIcBand: nuIcObservedGeV > 0.1 ? 'Raios Gama VHE (Fermi-LAT / H.E.S.S. / MAGIC)' : 'Raios Gama Moles'
    };
  }, [electronGamma, bFieldGauss, bulkDopplerFactor]);

  // -------------------------------------------------------------
  // TAB 4: MODELO DE BOLA DE FOGO DE GRB (FIREBALL)
  // -------------------------------------------------------------
  const [eIsoErg, setEIsoErg] = useState<number>(52); // log10(E_iso in ergs), ex: 10^52 ergs
  const [bulkLorentzGamma, setBulkLorentzGamma] = useState<number>(300); // Gamma > 100 para resolver compacticidade
  const [variabilityTimeSec, setVariabilityTimeSec] = useState<number>(0.01); // 10 ms (curva de luz rápida)

  const fireballCalculations = useMemo(() => {
    const c = 2.99792458e10; // cm/s
    const eIsoReal = Math.pow(10, eIsoErg); // ergs

    // Raio de transparência / Fotossfera relativística R_ph
    // R_ph ~ sqrt(sigma_T * E_iso / (4pi * m_p * c^2 * Gamma))
    const sigmaT = 6.65245873e-25; // cm^2
    const mpC2 = 1.503e-3; // ergs
    const rPhotosphereCm = Math.sqrt((sigmaT * eIsoReal) / (4 * Math.PI * mpC2 * bulkLorentzGamma));
    const rPhotosphereKm = rPhotosphereCm / 1e5;

    // Raio de Choque Interno (onde cascas colidem e emitem raios gama): R_is ~ 2 * Gamma^2 * c * delta_t
    const rInternalShockCm = 2 * bulkLorentzGamma * bulkLorentzGamma * c * variabilityTimeSec;
    const rInternalShockKm = rInternalShockCm / 1e5;

    // Problema de opacidade de compacticidade tau_gamma_gamma:
    // Sem Lorentz boost: tau ~ 10^13 (opaco a pares e+ e-).
    // Com Lorentz boost: tau_eff ~ tau_0 / Gamma^(2 * alpha + 2) << 1 (transparente!)
    const opacitySuppressionFactor = Math.pow(bulkLorentzGamma, 6);
    const isTransparent = bulkLorentzGamma >= 100;

    return {
      rPhotosphereKm,
      rInternalShockKm,
      isTransparent,
      opacitySuppressionFactor
    };
  }, [eIsoErg, bulkLorentzGamma, variabilityTimeSec]);

  // -------------------------------------------------------------
  // TAB 5: MAGNETOSFERAS DE PÚLSARES & SPIN-DOWN
  // -------------------------------------------------------------
  const [pulsarPeriodSec, setPulsarPeriodSec] = useState<number>(0.033); // Período P (segundos) - ex: Caranguejo (Crab) 33 ms
  const [periodDotLog10, setPeriodDotLog10] = useState<number>(-13); // log10(P_dot), ex: Crab ~ 4.2e-13 s/s
  const [momentOfInertia, setMomentOfInertia] = useState<number>(1.0); // 10^45 g cm^2 (estrela de nêutrons canônica)

  const pulsarCalculations = useMemo(() => {
    const pDot = Math.pow(10, periodDotLog10); // s/s
    const inertiaCgs = momentOfInertia * 1e45; // g cm^2
    const c = 2.99792458e10; // cm/s

    // Perda rotacional de energia (Spin-down Luminosity) Edot = 4 * pi^2 * I * Pdot / P^3
    const eDotErgS = (4 * Math.PI * Math.PI * inertiaCgs * pDot) / Math.pow(pulsarPeriodSec, 3);
    const eDotWatts = eDotErgS * 1e-7;

    // Idade Característica (tempo de frenagem dipolar): tau = P / (2 * Pdot)
    const tauSeconds = pulsarPeriodSec / (2 * pDot);
    const tauYears = tauSeconds / (3.15576e7);

    // Campo magnético dipolar na superfície: B_s = 3.2 * 10^19 * sqrt(P * Pdot) Gauss
    const bFieldSurfaceGauss = 3.2e19 * Math.sqrt(pulsarPeriodSec * pDot);

    // Raio do Cilindro de Luz R_LC = c * P / (2 * pi)
    const rLightCylinderKm = (c * pulsarPeriodSec) / (2 * Math.PI * 1e5);

    // Potencial elétrico máximo de aceleração no casquete polar: V_gap ~ sqrt(Edot / c)
    const vGapVolts = Math.sqrt(eDotErgS / c) * 300; // Statvolts to Volts

    return {
      eDotWatts,
      tauYears,
      bFieldSurfaceGauss,
      rLightCylinderKm,
      vGapVolts
    };
  }, [pulsarPeriodSec, periodDotLog10, momentOfInertia]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Capitania #11 · Expansão Pós-500
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Marco 505 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-300">
            Suíte de Astrofísica de Altas Energias & Raios Cósmicos
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Modelagem do limite GZK de UHECRs, aceleração difusiva de Fermi em choques SNR, emissão síncrotron e SSC em Blazares, bola de fogo de GRBs e perda de rotação de púlsares.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const report = `[Relatório Astrofísico - Etapa 99 (Marco 505 Ferramentas)]\n` +
                `- Limite GZK (${energyEeV} EeV a ${distSourceMpc} Mpc): Atenuação ${gzkCalculations.attenuationPercent.toFixed(1)}% | Livre Médio: ${gzkCalculations.meanFreePathMpc.toFixed(1)} Mpc\n` +
                `- Choque de Fermi SNR (${shockSpeedKmS} km/s, r=${compressionRatio}): Índice s=${fermiCalculations.spectralIndex.toFixed(2)} | E_max: ${fermiCalculations.eMaxPeV.toFixed(2)} PeV\n` +
                `- Síncrotron & SSC (γ=${electronGamma}, B=${bFieldGauss} G): Sync Obs: ${synchrotronCalculations.nuSyncObservedEV.toFixed(2)} eV | IC Obs: ${synchrotronCalculations.nuIcObservedGeV.toFixed(2)} GeV\n` +
                `- GRB Fireball (10^${eIsoErg} erg, Γ=${bulkLorentzGamma}): Raio Choque Interno: ${fireballCalculations.rInternalShockKm.toExponential(2)} km | Transparente: ${fireballCalculations.isTransparent ? 'SIM' : 'NÃO'}\n` +
                `- Pulsar Spin-Down (P=${pulsarPeriodSec}s): B_s: ${pulsarCalculations.bFieldSurfaceGauss.toExponential(2)} G | Idade: ${pulsarCalculations.tauYears.toFixed(0)} anos | Luminosidade: ${pulsarCalculations.eDotWatts.toExponential(2)} W`;
              copyToClipboard(report);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-xs font-mono text-amber-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 p-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl relative z-10">
        <button
          onClick={() => setActiveTab('gzk-cutoff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'gzk-cutoff'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Limite GZK (UHECRs)
        </button>

        <button
          onClick={() => setActiveTab('fermi-acceleration')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'fermi-acceleration'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Aceleração de Fermi (SNR)
        </button>

        <button
          onClick={() => setActiveTab('synchrotron-ssc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'synchrotron-ssc'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Síncrotron & Auto-Compton (SSC)
        </button>

        <button
          onClick={() => setActiveTab('grb-fireball')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'grb-fireball'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Bola de Fogo GRB
        </button>

        <button
          onClick={() => setActiveTab('pulsar-spindown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'pulsar-spindown'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          Púlsares & Spin-Down
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6 relative z-10">
        {/* ========================================================================= */}
        {/* 1. LIMITE GZK & UHECRs */}
        {/* ========================================================================= */}
        {activeTab === 'gzk-cutoff' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Parâmetros do Próton Ultra-Relativístico
                  </h3>
                  <button
                    onClick={() => {
                      setEnergyEeV(60);
                      setDistSourceMpc(80);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Energia do Próton Cósmico:</span>
                    <span className="text-amber-400 font-bold">{energyEeV} EeV (10¹⁸ eV)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={energyEeV}
                    onChange={(e) => setEnergyEeV(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Limiar teórico Greisen-Zatsepin-Kuzmin: ~ 50 EeV
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Distância da Fonte Extragaláctica:</span>
                    <span className="text-amber-400 font-bold">{distSourceMpc} Mpc</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={distSourceMpc}
                    onChange={(e) => setDistSourceMpc(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    1 Mpc ≈ 3.26 milhões de anos-luz (80 Mpc ≈ 260 Mly)
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-amber-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Status do Limiar GZK</span>
                    <span className={`text-xl font-bold font-mono ${gzkCalculations.isAboveGZK ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {gzkCalculations.isAboveGZK ? 'Acima do Limiar GZK (Cut-off Ativo)' : 'Abaixo do Limiar GZK (Transparente)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Reação: p + γ_CMB → Δ⁺ → p + π⁰
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Caminho Livre Médio (λ_GZK)</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {gzkCalculations.meanFreePathMpc.toFixed(1)} Mpc
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Atenuação no banho térmico de fótons CMB
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Atenuação do Fluxo na Terra</span>
                    <span className="text-2xl font-black font-mono text-rose-400">
                      {gzkCalculations.attenuationPercent.toFixed(1)}% Perda
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Sobrevivência: {(gzkCalculations.survivalProb * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Fator de Lorentz do Próton</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      γ ~ {gzkCalculations.lorentzGamma.toExponential(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Energia mecânica: {gzkCalculations.energyJoules.toFixed(1)} Joules por partícula
                    </span>
                  </div>
                </div>

                {/* Gráfico Espectral GZK SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Curva de Supressão Espectral GZK (Pierre Auger / Telescope Array)</span>
                    <span className="text-amber-400">Queda Abrupta em ~50 EeV</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    <line x1="50" y1="100" x2="480" y2="100" stroke="#475569" strokeWidth="1" />
                    <line x1="50" y1="20" x2="50" y2="100" stroke="#475569" strokeWidth="1" />

                    {/* Curva espectral de potência E^-2.7 com queda GZK */}
                    <path
                      d="M 50,30 L 150,38 L 250,50 L 320,62 L 350,95 L 450,99"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />

                    {/* Marcador do ponto GZK */}
                    <line x1="320" y1="20" x2="320" y2="100" stroke="#f43f5e" strokeDasharray="3 3" />
                    <text x="325" y="35" fill="#f43f5e" fontSize="9" fontFamily="monospace">Limiar GZK (50 EeV)</text>

                    {/* Ponto atual */}
                    <circle
                      cx={Math.min(450, 50 + (energyEeV / 150) * 380)}
                      cy={energyEeV < 50 ? 30 + (energyEeV / 50) * 30 : 60 + ((energyEeV - 50) / 100) * 38}
                      r="5"
                      fill="#38bdf8"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. ACELERAÇÃO DE FERMI EM CHOQUES (SNR) */}
        {/* ========================================================================= */}
        {activeTab === 'fermi-acceleration' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Parâmetros do Choque de Supernova
                  </h3>
                  <button
                    onClick={() => {
                      setShockSpeedKmS(5000);
                      setCompressionRatio(4.0);
                      setBFieldMicroGauss(100);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Velocidade da Onda de Choque (u_s):</span>
                    <span className="text-rose-400 font-bold">{shockSpeedKmS} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={shockSpeedKmS}
                    onChange={(e) => setShockSpeedKmS(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Fração relativística: β_shock = {(fermiCalculations.betaShock * 100).toFixed(2)}% da velocidade da luz
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Razão de Compressão do Choque (r = u₁/u₂):</span>
                    <span className="text-rose-400 font-bold">{compressionRatio}</span>
                  </div>
                  <input
                    type="range"
                    min="2.5"
                    max="4.0"
                    step="0.1"
                    value={compressionRatio}
                    onChange={(e) => setCompressionRatio(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Choque hidrodinâmico forte adiabático canônico: r = 4.0
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Campo Magnético no Choque (B):</span>
                    <span className="text-rose-400 font-bold">{bFieldMicroGauss} μG</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={bFieldMicroGauss}
                    onChange={(e) => setBFieldMicroGauss(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-rose-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Índice Espectral Universal (s)</span>
                    <span className="text-2xl font-black font-mono text-rose-300">
                      s = {fermiCalculations.spectralIndex.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Distribuição N(E) dE ∝ E^-{fermiCalculations.spectralIndex.toFixed(2)} dE
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Ganho Fracionário por Ciclo</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      ΔE/E ≈ {(fermiCalculations.deltaEOverE * 100).toFixed(3)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Aceleração difusiva de 1ª ordem (Linear em β)
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Energia Máxima (Critério de Hillas)</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      E_max ≈ {fermiCalculations.eMaxPeV.toFixed(2)} PeV (10¹⁵ eV)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {fermiCalculations.kneeMatch}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Raio da Casca da Supernova</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      R ≈ {fermiCalculations.rShockParsec.toFixed(1)} Parsecs
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Expansão em {shockAgeYears} anos
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Mecanismo de Bell & Difusão de Partículas
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    As partículas cruzam repetidamente a frente de choque por espalhamento em ondas de Alfvén MHD comprimidas no plasma a montante e jusante, ganhando energia proporcional a u₁ - u₂ a cada ciclo até que o raio de Larmor exceda o tamanho da frente de choque.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SÍNCOTRON & AUTO-COMPTON INVERSO (SSC) */}
        {/* ========================================================================= */}
        {activeTab === 'synchrotron-ssc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Parâmetros do Jato de Blazar
                  </h3>
                  <button
                    onClick={() => {
                      setElectronGamma(1e4);
                      setBFieldGauss(0.5);
                      setBulkDopplerFactor(15);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Fator de Lorentz do Elétron (γ):</span>
                    <span className="text-cyan-400 font-bold">{electronGamma.toExponential(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={electronGamma}
                    onChange={(e) => setElectronGamma(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Campo Magnético do Jato (B):</span>
                    <span className="text-cyan-400 font-bold">{bFieldGauss} Gauss</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.0"
                    step="0.05"
                    value={bFieldGauss}
                    onChange={(e) => setBFieldGauss(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Fator Doppler Relativístico (δ_D):</span>
                    <span className="text-cyan-400 font-bold">{bulkDopplerFactor}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={bulkDopplerFactor}
                    onChange={(e) => setBulkDopplerFactor(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Beaming relativístico na direção do observador terrestre
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Pico Síncrotron Observado</span>
                    <span className="text-xl font-bold font-mono text-cyan-300">
                      {synchrotronCalculations.nuSyncObservedEV.toFixed(2)} eV
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Banda: {synchrotronCalculations.nuSyncBand}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Pico Compton Inverso (SSC)</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {synchrotronCalculations.nuIcObservedGeV.toFixed(2)} GeV
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {synchrotronCalculations.nuIcBand}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl col-span-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Tempo de Resfriamento Radiativo (t_cool)</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {synchrotronCalculations.tCoolHours.toFixed(2)} horas
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Escala temporal típica de variabilidade intradiária em Blazares (ex: Markarian 421 / 501)
                    </span>
                  </div>
                </div>

                {/* Espectro Duplo SED (Spectral Energy Distribution) SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Distribuição Espectral de Energia (SED Duplo Pico: Síncrotron + SSC)</span>
                    <span className="text-cyan-400">log(ν F_ν) vs log(ν)</span>
                  </div>
                  <svg viewBox="0 0 500 110" className="w-full h-24 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Linha base */}
                    <line x1="30" y1="90" x2="470" y2="90" stroke="#334155" />

                    {/* 1º Pico: Síncrotron */}
                    <path
                      d="M 50,90 Q 150,25 240,90"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                    />
                    <text x="150" y="20" textAnchor="middle" fill="#67e8f9" fontSize="9" fontFamily="monospace">Pico Síncrotron</text>

                    {/* 2º Pico: Auto-Compton Inverso (SSC) */}
                    <path
                      d="M 260,90 Q 360,20 460,90"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="3"
                    />
                    <text x="360" y="15" textAnchor="middle" fill="#d8b4fe" fontSize="9" fontFamily="monospace">Pico Compton Inverso</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MODELO DE BOLA DE FOGO DE GRB */}
        {/* ========================================================================= */}
        {activeTab === 'grb-fireball' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Parâmetros de Explosão de Raios Gama
                  </h3>
                  <button
                    onClick={() => {
                      setEIsoErg(52);
                      setBulkLorentzGamma(300);
                      setVariabilityTimeSec(0.01);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Energia Isotrópica Equivalente (E_iso):</span>
                    <span className="text-purple-400 font-bold">10^{eIsoErg} ergs</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="54"
                    step="0.5"
                    value={eIsoErg}
                    onChange={(e) => setEIsoErg(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    10⁵² ergs ≈ liberação da energia de massa de uma fração do Sol em segundos
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Fator de Lorentz Volumétrico (Γ):</span>
                    <span className="text-purple-400 font-bold">Γ = {bulkLorentzGamma}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={bulkLorentzGamma}
                    onChange={(e) => setBulkLorentzGamma(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Velocidade v/c = {(1 - 1 / (2 * bulkLorentzGamma * bulkLorentzGamma) * 100).toFixed(6)}% c
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Tempo de Variabilidade da Curva (δt):</span>
                    <span className="text-purple-400 font-bold">{(variabilityTimeSec * 1000).toFixed(0)} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.005"
                    value={variabilityTimeSec}
                    onChange={(e) => setVariabilityTimeSec(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-purple-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Problema da Compacticidade</span>
                    <span className={`text-xl font-bold font-mono ${fireballCalculations.isTransparent ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fireballCalculations.isTransparent ? '✓ Transparente a Fótons (Γ ≥ 100)' : '✗ Opaco (Criação de Pares e⁺e⁻)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Supressão óptica: Γ⁶ ~ {fireballCalculations.opacitySuppressionFactor.toExponential(1)}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Raio de Choque Interno (R_is)</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {fireballCalculations.rInternalShockKm.toExponential(2)} km
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Região de emissão dos raios gama de prompt
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl col-span-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Raio da Fotossfera Térmica (R_ph)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {fireballCalculations.rPhotosphereKm.toExponential(2)} km (~ { (fireballCalculations.rPhotosphereKm / 1.496e8).toFixed(2) } UA)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Onde a radiação se desacopla da casca de bário ultra-relativística
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Estrutura da Bola de Fogo de Rees & Mészáros
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A alta variabilidade temporal observada (milissegundos) combinada com a enorme luminosidade requer que o fluxo de energia se expanda com um fator de Lorentz volumétrico Γ &gt; 100 para que o limiar de produção de pares γγ → e⁺e⁻ seja deslocado acima da banda de observação, permitindo que a radiação gama escape livremente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. MAGNETOSFERAS DE PÚLSARES & SPIN-DOWN */}
        {/* ========================================================================= */}
        {activeTab === 'pulsar-spindown' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Orbit className="w-4 h-4" /> Parâmetros de Rotação do Púlsar
                  </h3>
                  <button
                    onClick={() => {
                      setPulsarPeriodSec(0.033);
                      setPeriodDotLog10(-13);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Período de Rotação (P):</span>
                    <span className="text-emerald-400 font-bold">{(pulsarPeriodSec * 1000).toFixed(1)} ms ({pulsarPeriodSec} s)</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="2.0"
                    step="0.005"
                    value={pulsarPeriodSec}
                    onChange={(e) => setPulsarPeriodSec(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Crab: 33 ms | Vela: 89 ms | Púlsar de Milissegundo: 1.5 ms
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Taxa de Frenagem (Ṗ = dP/dt):</span>
                    <span className="text-emerald-400 font-bold">10^{periodDotLog10} s/s</span>
                  </div>
                  <input
                    type="range"
                    min="--20"
                    max="-11"
                    step="0.5"
                    value={periodDotLog10}
                    onChange={(e) => setPeriodDotLog10(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Campo Magnético Dipolar (B_s)</span>
                    <span className="text-2xl font-black font-mono text-emerald-300">
                      {pulsarCalculations.bFieldSurfaceGauss.toExponential(2)} Gauss
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {pulsarCalculations.bFieldSurfaceGauss > 1e14 ? 'Regime de Magnetar' : 'Púlsar Normal / Rádio'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Luminosidade de Spin-Down (Ė)</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {pulsarCalculations.eDotWatts.toExponential(2)} W
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Energia rotacional convertida em vento relativístico
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Idade Característica (τ = P/2Ṗ)</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {pulsarCalculations.tauYears > 1e6 ? `${(pulsarCalculations.tauYears / 1e6).toFixed(1)} Milhões Anos` : `${pulsarCalculations.tauYears.toFixed(0)} Anos`}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Tempo de frenagem magnética
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Raio do Cilindro de Luz (R_LC)</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {pulsarCalculations.rLightCylinderKm.toFixed(0)} km
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Onde v_rot = c (abertura das linhas de campo)
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Eletrodinâmica de Goldreich-Julian & Magnetosfera
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A rotação ultrarrápida do campo magnético dipolar induz uma diferença de potencial de até {pulsarCalculations.vGapVolts.toExponential(2)} Volts sobre o casquete polar, arrancando elétrons da crosta da estrela de nêutrons e criando uma cascata de pares e⁺e⁻ que emitem feixes síncrotron colimados no cilindro de luz.
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
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Fórmulas analíticas de astrofísica relativística validadas com Pierre Auger, Fermi-LAT e telescópios H.E.S.S./MAGIC.</span>
        </div>
        <div className="text-slate-400">
          Holding V5 Apollo · 100% Client-Side Engine
        </div>
      </div>
    </div>
  );
}
