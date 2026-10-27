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
  Brain
} from 'lucide-react';

export function BiologicalNeuralNetworksAndElectrophysiologySuite({
  defaultTab = 'hodgkin-huxley'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'hodgkin-huxley' | 'izhikevich' | 'stdp-plasticity' | 'cable-theory' | 'connectome'
  >(() => {
    if (defaultTab === 'izhikevich-spiking-neuron-modeler' || defaultTab === 'izhikevich') return 'izhikevich';
    if (defaultTab === 'synaptic-stdp-plasticity-calc' || defaultTab === 'stdp-plasticity') return 'stdp-plasticity';
    if (defaultTab === 'cable-theory-dendritic-attenuation-calc' || defaultTab === 'cable-theory') return 'cable-theory';
    if (defaultTab === 'connectome-graph-centrality-calc' || defaultTab === 'connectome') return 'connectome';
    return 'hodgkin-huxley';
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 1: MODELO DE HODGKIN-HUXLEY (POTENCIAL DE AÇÃO)
  // -------------------------------------------------------------
  const [injCurrent, setInjCurrent] = useState<number>(10); // microA/cm^2
  const [gNaMax, setGNaMax] = useState<number>(120); // mS/cm^2
  const [gKMax, setGKMax] = useState<number>(36); // mS/cm^2
  const [tempCelsius, setTempCelsius] = useState<number>(6.3); // Graus C (temperatura lula original)

  const hhCalculations = useMemo(() => {
    // Parâmetros canônicos do modelo Hodgkin-Huxley (1952)
    const eNa = 50.0; // mV
    const eK = -77.0; // mV
    const eL = -54.387; // mV
    const gL = 0.3; // mS/cm^2
    const cm = 1.0; // microF/cm^2

    // Fator de escala de temperatura Q10 = 3^( (T - 6.3) / 10 )
    const phi = Math.pow(3, (tempCelsius - 6.3) / 10);

    // Condições iniciais no repouso (V = -65 mV)
    let v = -65.0;
    // Funções de taxa de transição
    const alphaM = (v: number) => (phi * 0.1 * (v + 40)) / (1 - Math.exp(-(v + 40) / 10));
    const betaM = (v: number) => phi * 4.0 * Math.exp(-(v + 65) / 18);
    const alphaH = (v: number) => phi * 0.07 * Math.exp(-(v + 65) / 20);
    const betaH = (v: number) => phi * 1.0 / (1 + Math.exp(-(v + 35) / 10));
    const alphaN = (v: number) => (phi * 0.01 * (v + 55)) / (1 - Math.exp(-(v + 55) / 10));
    const betaN = (v: number) => phi * 0.125 * Math.exp(-(v + 65) / 80);

    let m = alphaM(v) / (alphaM(v) + betaM(v));
    let h = alphaH(v) / (alphaH(v) + betaH(v));
    let n = alphaN(v) / (alphaN(v) + betaN(v));

    const dt = 0.04; // ms
    const totalSteps = 400; // 16 ms de simulação
    const trajectory: { t: number; v: number }[] = [];
    let maxV = -100;
    let minV = 100;

    for (let step = 0; step < totalSteps; step++) {
      const t = step * dt;
      // Injeta corrente entre t = 2 ms e t = 12 ms
      const iApp = t >= 2.0 && t <= 12.0 ? injCurrent : 0;

      const iNa = gNaMax * Math.pow(m, 3) * h * (v - eNa);
      const iK = gKMax * Math.pow(n, 4) * (v - eK);
      const iLeak = gL * (v - eL);

      const dv = (iApp - iNa - iK - iLeak) / cm;
      const dm = alphaM(v) * (1 - m) - betaM(v) * m;
      const dh = alphaH(v) * (1 - h) - betaH(v) * h;
      const dn = alphaN(v) * (1 - n) - betaN(v) * n;

      v += dv * dt;
      m += dm * dt;
      h += dh * dt;
      n += dn * dt;

      if (v > maxV) maxV = v;
      if (v < minV) minV = v;
      if (step % 2 === 0) {
        trajectory.push({ t, v });
      }
    }

    const hasSpike = maxV > 0;

    return {
      trajectory,
      maxV,
      minV,
      hasSpike,
      restingV: -65.0
    };
  }, [injCurrent, gNaMax, gKMax, tempCelsius]);

  // -------------------------------------------------------------
  // TAB 2: NEURÔNIO SPIKING DE IZHIKEVICH
  // -------------------------------------------------------------
  const [izPreset, setIzPreset] = useState<'RS' | 'IB' | 'CH' | 'FS'>('RS');
  const [izCurrent, setIzCurrent] = useState<number>(10);

  const izhikevichCalculations = useMemo(() => {
    // Parâmetros do modelo Izhikevich: v' = 0.04v^2 + 5v + 140 - u + I
    // u' = a(bv - u)
    let a = 0.02;
    let b = 0.2;
    let c = -65.0;
    let d = 8.0;

    if (izPreset === 'IB') {
      a = 0.02; b = 0.2; c = -55.0; d = 4.0;
    } else if (izPreset === 'CH') {
      a = 0.02; b = 0.2; c = -50.0; d = 2.0;
    } else if (izPreset === 'FS') {
      a = 0.1; b = 0.2; c = -65.0; d = 2.0;
    }

    let v = -65.0;
    let u = b * v;
    const dt = 0.2; // ms
    const totalSteps = 500; // 100 ms
    const spikes: { t: number; v: number }[] = [];
    let spikeCount = 0;

    for (let step = 0; step < totalSteps; step++) {
      const t = step * dt;
      const iApp = t > 10 ? izCurrent : 0;

      // Integração de Euler simplificada em 2 sub-passos para estabilidade
      v += 0.5 * (0.04 * v * v + 5 * v + 140 - u + iApp) * dt;
      v += 0.5 * (0.04 * v * v + 5 * v + 140 - u + iApp) * dt;
      u += a * (b * v - u) * dt;

      if (v >= 30.0) {
        spikes.push({ t, v: 30.0 });
        v = c;
        u += d;
        spikeCount++;
      } else {
        spikes.push({ t, v });
      }
    }

    const firingFreqHz = (spikeCount / 0.09); // em 90 ms de corrente ativa

    return {
      spikes,
      spikeCount,
      firingFreqHz,
      a, b, c, d
    };
  }, [izPreset, izCurrent]);

  // -------------------------------------------------------------
  // TAB 3: PLASTICIDADE SINÁPTICA STDP (BI & POO)
  // -------------------------------------------------------------
  const [deltaTTimeMs, setDeltaTTimeMs] = useState<number>(10); // ms (t_post - t_pre)
  const [initialWeight, setInitialWeight] = useState<number>(1.0); // peso arbitrário
  const [aPlus, setAPlus] = useState<number>(0.05); // amplitude LTP
  const [aMinus, setAMinus] = useState<number>(0.055); // amplitude LTD (levemente maior para estabilidade)

  const stdpCalculations = useMemo(() => {
    const tauPlus = 16.8; // ms
    const tauMinus = 33.7; // ms

    let deltaW = 0;
    if (deltaTTimeMs > 0) {
      // Causal: Pré antes de Pós -> Potenciação de Longa Duração (LTP)
      deltaW = aPlus * Math.exp(-deltaTTimeMs / tauPlus);
    } else if (deltaTTimeMs < 0) {
      // Anti-causal: Pós antes de Pré -> Depressão de Longa Duração (LTD)
      deltaW = -aMinus * Math.exp(deltaTTimeMs / tauMinus);
    } else {
      deltaW = 0;
    }

    const newWeight = Math.max(0, initialWeight * (1 + deltaW));
    const deltaWPercent = deltaW * 100;

    let regime = 'Sem Alteração (Δt = 0)';
    let regimeColor = 'text-slate-400';
    if (deltaTTimeMs > 0) {
      regime = 'LTP: Potenciação Causal (Reforço Sináptico Hebbiano)';
      regimeColor = 'text-emerald-400';
    } else if (deltaTTimeMs < 0) {
      regime = 'LTD: Depressão Anti-Causal (Enfraquecimento Sináptico)';
      regimeColor = 'text-rose-400';
    }

    return {
      deltaW,
      deltaWPercent,
      newWeight,
      regime,
      regimeColor
    };
  }, [deltaTTimeMs, initialWeight, aPlus, aMinus]);

  // -------------------------------------------------------------
  // TAB 4: TEORIA DE CABOS DENDRÍTICOS DE RALL
  // -------------------------------------------------------------
  const [dendriteDiameterMicrons, setDendriteDiameterMicrons] = useState<number>(2.0); // micrometros
  const [rmSpecificOhmCm2, setRmSpecificOhmCm2] = useState<number>(20000); // Ohm cm^2 (resistência de membrana)
  const [riSpecificOhmCm, setRiSpecificOhmCm] = useState<number>(150); // Ohm cm (resistividade citoplasmática axial)
  const [distanceFromSomaMicrons, setDistanceFromSomaMicrons] = useState<number>(300); // micrometros

  const cableCalculations = useMemo(() => {
    // Diâmetro em cm: d = d_um * 1e-4
    const dCm = dendriteDiameterMicrons * 1e-4;

    // Constante de espaço eletrotônica lambda = sqrt( (d * R_m) / (4 * R_i) ) em cm
    const lambdaCm = Math.sqrt((dCm * rmSpecificOhmCm2) / (4 * riSpecificOhmCm));
    const lambdaMicrons = lambdaCm * 1e4;

    // Constante de tempo de membrana tau_m = R_m * C_m (C_m = 1 microF/cm^2 = 1e-6 F/cm^2)
    const cmFarad = 1e-6;
    const tauMSec = rmSpecificOhmCm2 * cmFarad; // segundos
    const tauMMs = tauMSec * 1000; // ms

    // Decaimento eletrotônico estacionário V(x) = V_0 * exp(-x / lambda)
    const electrotonicDistanceX = distanceFromSomaMicrons / lambdaMicrons;
    const voltageAttenuationFraction = Math.exp(-electrotonicDistanceX);
    const voltageRemainingPercent = voltageAttenuationFraction * 100;

    return {
      lambdaMicrons,
      tauMMs,
      electrotonicDistanceX,
      voltageAttenuationFraction,
      voltageRemainingPercent
    };
  }, [dendriteDiameterMicrons, rmSpecificOhmCm2, riSpecificOhmCm, distanceFromSomaMicrons]);

  // -------------------------------------------------------------
  // TAB 5: GRAFOS DO CONECTOMA & SMALL-WORLDNESS
  // -------------------------------------------------------------
  const [clusteringC, setClusteringC] = useState<number>(0.52); // coeficiente de agrupamento
  const [pathLengthL, setPathLengthL] = useState<number>(2.3); // comprimento médio de caminho
  const [cRandom, setCRandom] = useState<number>(0.12); // rede aleatória de controle
  const [lRandom, setLRandom] = useState<number>(2.0); // rede aleatória de controle

  const connectomeCalculations = useMemo(() => {
    // Razão de agrupamento gamma = C / C_rand
    const gamma = clusteringC / cRandom;
    // Razão de caminho lambda = L / L_rand
    const lambda = pathLengthL / lRandom;

    // Métrica de Mundo Pequeno (Small-Worldness sigma = gamma / lambda de Humphries & Gurney 2008)
    const sigmaSmallWorld = gamma / lambda;
    const isSmallWorld = sigmaSmallWorld > 1.0;

    let verdict = 'Topologia Aleatória / Desconectada';
    if (sigmaSmallWorld > 2.0) {
      verdict = 'Conectoma Small-World Canônico (Máxima Eficiência Global & Local)';
    } else if (sigmaSmallWorld > 1.0) {
      verdict = 'Small-World Moderado (Rede Cortical Típica)';
    }

    return {
      gamma,
      lambda,
      sigmaSmallWorld,
      isSmallWorld,
      verdict
    };
  }, [clusteringC, pathLengthL, cRandom, lRandom]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              Capitania #11 · Início do 2º Centenário (Etapa 101)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              515 Ferramentas Ativas
            </span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
            Suíte de Redes Neurais Biológicas, Conectoma & Eletrofisiologia
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulação de potenciais de ação de Hodgkin-Huxley, disparos corticais de Izhikevich, plasticidade sináptica STDP, atenuação dendrítica de Rall e grafos do conectoma cerebral.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const report = `[Relatório Neuroeletrofisiológico - Etapa 101 (Marco 515 Ferramentas)]\n` +
                `- Hodgkin-Huxley (I_inj = ${injCurrent} µA/cm²): Pico V = ${hhCalculations.maxV.toFixed(1)} mV | Disparo: ${hhCalculations.hasSpike ? 'SIM' : 'NÃO'}\n` +
                `- Izhikevich (${izPreset}): Frequência de Disparo = ${izhikevichCalculations.firingFreqHz.toFixed(1)} Hz (${izhikevichCalculations.spikeCount} spikes)\n` +
                `- Plasticidade STDP (Δt = ${deltaTTimeMs} ms): Δw = ${stdpCalculations.deltaWPercent.toFixed(1)}% | Regime: ${stdpCalculations.regime}\n` +
                `- Teoria de Cabos de Rall (d = ${dendriteDiameterMicrons} µm, x = ${distanceFromSomaMicrons} µm): λ = ${cableCalculations.lambdaMicrons.toFixed(0)} µm | Tensão Remanescente: ${cableCalculations.voltageRemainingPercent.toFixed(1)}%\n` +
                `- Conectoma Cerebral: Small-Worldness σ = ${connectomeCalculations.sigmaSmallWorld.toFixed(2)} | Veredito: ${connectomeCalculations.verdict}`;
              copyToClipboard(report);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 p-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl relative z-10">
        <button
          onClick={() => setActiveTab('hodgkin-huxley')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'hodgkin-huxley'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Hodgkin-Huxley (Action Potential)
        </button>

        <button
          onClick={() => setActiveTab('izhikevich')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'izhikevich'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Neurônio Izhikevich
        </button>

        <button
          onClick={() => setActiveTab('stdp-plasticity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'stdp-plasticity'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          Plasticidade Sináptica (STDP)
        </button>

        <button
          onClick={() => setActiveTab('cable-theory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'cable-theory'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Cabos Dendríticos de Rall
        </button>

        <button
          onClick={() => setActiveTab('connectome')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'connectome'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Conectoma & Small-World
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6 relative z-10">
        {/* ========================================================================= */}
        {/* 1. HODGKIN-HUXLEY (POTENCIAL DE AÇÃO) */}
        {/* ========================================================================= */}
        {activeTab === 'hodgkin-huxley' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Parâmetros Eletrofisiológicos
                  </h3>
                  <button
                    onClick={() => {
                      setInjCurrent(10);
                      setGNaMax(120);
                      setGKMax(36);
                      setTempCelsius(6.3);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Corrente Injetada (I_inj):</span>
                    <span className="text-cyan-400 font-bold">{injCurrent} µA/cm²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={injCurrent}
                    onChange={(e) => setInjCurrent(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Limiar de disparo típico: ~ 6 a 8 µA/cm²
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Condutância Máxima de Sódio (g_Na):</span>
                    <span className="text-cyan-400 font-bold">{gNaMax} mS/cm²</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    step="5"
                    value={gNaMax}
                    onChange={(e) => setGNaMax(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Condutância Máxima de Potássio (g_K):</span>
                    <span className="text-cyan-400 font-bold">{gKMax} mS/cm²</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="2"
                    value={gKMax}
                    onChange={(e) => setGKMax(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Temperatura da Membrana (T):</span>
                    <span className="text-cyan-400 font-bold">{tempCelsius}°C (Q10 = 3)</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="0.5"
                    value={tempCelsius}
                    onChange={(e) => setTempCelsius(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados & Gráfico */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Pico do Potencial de Ação</span>
                    <span className="text-2xl font-black font-mono text-cyan-300">
                      {hhCalculations.maxV.toFixed(1)} mV
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {hhCalculations.hasSpike ? '✓ Espícula Despolarizante Disparada' : '✗ Sub-limiar (Apenas Resposta Passiva)'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Hiperpolarização Pós-Disparo</span>
                    <span className="text-2xl font-bold font-mono text-purple-400">
                      {hhCalculations.minV.toFixed(1)} mV
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Período refratário relativo mediado por g_K
                    </span>
                  </div>
                </div>

                {/* Trajetória Temporal SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Curva do Potencial de Membrana V(t) [Hodgkin-Huxley 1952]</span>
                    <span className="text-cyan-400">Escala de 0 a 16 ms</span>
                  </div>
                  <svg viewBox="0 0 500 130" className="w-full h-32 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    {/* Linha de Repouso (-65 mV) e Linha Zero (0 mV) */}
                    <line x1="30" y1="95" x2="480" y2="95" stroke="#334155" strokeDasharray="3 3" />
                    <text x="10" y="98" fill="#64748b" fontSize="9" fontFamily="monospace">-65</text>

                    <line x1="30" y1="40" x2="480" y2="40" stroke="#475569" strokeDasharray="2 2" />
                    <text x="15" y="43" fill="#94a3b8" fontSize="9" fontFamily="monospace">0</text>

                    {/* Curva de voltagem */}
                    <path
                      d={hhCalculations.trajectory.reduce((acc, pt, idx) => {
                        const x = 30 + (pt.t / 16.0) * 440;
                        // Mapeia -80 mV a +50 mV para Y = 115 a 15
                        const y = 115 - ((pt.v + 80) / 130) * 100;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                      }, '')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. NEURÔNIO SPIKING DE IZHIKEVICH */}
        {/* ========================================================================= */}
        {activeTab === 'izhikevich' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Tipos de Disparo Cortical
                  </h3>
                  <button
                    onClick={() => {
                      setIzPreset('RS');
                      setIzCurrent(10);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">Preset de Neurônio Cortical:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'RS', label: 'Regular Spiking (RS - Piramidal)' },
                      { id: 'IB', label: 'Intrinsically Bursting (IB)' },
                      { id: 'CH', label: 'Chattering (CH - Alta Freq.)' },
                      { id: 'FS', label: 'Fast Spiking (FS - Interneurônio)' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setIzPreset(p.id as any)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-mono text-left transition ${
                          izPreset === p.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Corrente de Entrada (I):</span>
                    <span className="text-indigo-400 font-bold">{izCurrent} pA</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="1"
                    value={izCurrent}
                    onChange={(e) => setIzCurrent(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 space-y-1">
                  <div>Parâmetros do Modelo:</div>
                  <div className="text-indigo-300">a = {izhikevichCalculations.a} | b = {izhikevichCalculations.b} | c = {izhikevichCalculations.c} mV | d = {izhikevichCalculations.d}</div>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-indigo-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Frequência de Disparo</span>
                    <span className="text-2xl font-black font-mono text-indigo-300">
                      {izhikevichCalculations.firingFreqHz.toFixed(1)} Hz
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {izhikevichCalculations.spikeCount} potenciais em 90 ms
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Dinâmica de Adaptação de Frequência</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      {izPreset === 'RS' ? 'Adaptação Tônica' : izPreset === 'IB' ? 'Ráfagas em Salvas' : izPreset === 'CH' ? 'Trens de Disparos' : 'Sem Adaptação (Alta Freq)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Variável de recuperação lenta u(t)
                    </span>
                  </div>
                </div>

                {/* Trem de Espículas SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Trem de Espículas V(t) [Izhikevich 2003]</span>
                    <span className="text-indigo-400">Escala de 0 a 100 ms</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    <path
                      d={izhikevichCalculations.spikes.reduce((acc, pt, idx) => {
                        const x = 20 + (pt.t / 100.0) * 460;
                        const y = 105 - ((pt.v + 80) / 120) * 90;
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                      }, '')}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PLASTICIDADE SINÁPTICA STDP */}
        {/* ========================================================================= */}
        {activeTab === 'stdp-plasticity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Temporização Pré/Pós-Sináptica
                  </h3>
                  <button
                    onClick={() => {
                      setDeltaTTimeMs(10);
                      setInitialWeight(1.0);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Diferença Temporal (Δt = t_pós - t_pré):</span>
                    <span className="text-purple-400 font-bold">{deltaTTimeMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="1"
                    value={deltaTTimeMs}
                    onChange={(e) => setDeltaTTimeMs(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Δt &gt; 0: Pré dispara antes de Pós (Causal) | Δt &lt; 0: Pós antes de Pré (Anti-causal)
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Peso Sináptico Inicial (w_old):</span>
                    <span className="text-purple-400 font-bold">{initialWeight.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-purple-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Variação do Peso Sináptico (Δw)</span>
                    <span className={`text-2xl font-black font-mono ${stdpCalculations.deltaW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stdpCalculations.deltaW >= 0 ? `+${stdpCalculations.deltaWPercent.toFixed(1)}%` : `${stdpCalculations.deltaWPercent.toFixed(1)}%`}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Novo Peso w_new = {stdpCalculations.newWeight.toFixed(3)}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Regime Hebbiano</span>
                    <span className={`text-sm font-bold font-mono block mt-1 ${stdpCalculations.regimeColor}`}>
                      {stdpCalculations.regime}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-2">
                      Bi & Poo (1998) - Janela Causal Assimétrica
                    </span>
                  </div>
                </div>

                {/* Gráfico Curva STDP SVG */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between">
                    <span>Curva de Aprendizado Sináptico STDP (Δw vs Δt)</span>
                    <span className="text-purple-400">Janela de ±60 ms</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full h-28 bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                    <line x1="30" y1="60" x2="470" y2="60" stroke="#334155" />
                    <line x1="250" y1="10" x2="250" y2="110" stroke="#334155" strokeDasharray="2 2" />
                    <text x="255" y="18" fill="#64748b" fontSize="9" fontFamily="monospace">Δt = 0</text>

                    {/* Ramo LTD (esquerda, negativo) */}
                    <path
                      d="M 50,60 Q 230,62 245,105"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                    />

                    {/* Ramo LTP (direita, positivo) */}
                    <path
                      d="M 255,15 Q 270,58 450,60"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {/* Ponto atual */}
                    <circle
                      cx={250 + (deltaTTimeMs / 60) * 195}
                      cy={60 - (stdpCalculations.deltaW / 0.05) * 45}
                      r="5"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CABOS DENDRÍTICOS DE RALL */}
        {/* ========================================================================= */}
        {activeTab === 'cable-theory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Geometria Dendrítica
                  </h3>
                  <button
                    onClick={() => {
                      setDendriteDiameterMicrons(2.0);
                      setDistanceFromSomaMicrons(300);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Diâmetro do Dendrito (d):</span>
                    <span className="text-emerald-400 font-bold">{dendriteDiameterMicrons} µm</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.5"
                    value={dendriteDiameterMicrons}
                    onChange={(e) => setDendriteDiameterMicrons(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Distância da Sinapse até o Soma (x):</span>
                    <span className="text-emerald-400 font-bold">{distanceFromSomaMicrons} µm</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="20"
                    value={distanceFromSomaMicrons}
                    onChange={(e) => setDistanceFromSomaMicrons(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Constante de Espaço (λ)</span>
                    <span className="text-2xl font-black font-mono text-emerald-300">
                      {cableCalculations.lambdaMicrons.toFixed(0)} µm
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Distância onde V cai para 37% de V_0
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Tensão que Atinge o Soma</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {cableCalculations.voltageRemainingPercent.toFixed(1)}% de V_0
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Distância eletrotônica X = {cableCalculations.electrotonicDistanceX.toFixed(2)} λ
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl col-span-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Constante de Tempo de Membrana (τ_m)</span>
                    <span className="text-lg font-bold font-mono text-purple-400">
                      {cableCalculations.tauMMs.toFixed(1)} ms
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Filtro passa-baixa dendrítico: atenua potenciais pós-sinápticos excitatórios (EPSPs) de alta frequência.
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Equação de Cabos de Rall (1959)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A estrutura ramificada da árvore dendrítica não atua como mero condutor passivo; a constante de espaço λ = √( (d · R_m) / (4 · R_i) ) determina a eficácia com que sinapses em espinhas distais conseguem modular o montículo axônico (axon initial segment) no soma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. GRAFOS DO CONECTOMA & SMALL-WORLD */}
        {/* ========================================================================= */}
        {activeTab === 'connectome' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Topologia de Rede Cortical
                  </h3>
                  <button
                    onClick={() => {
                      setClusteringC(0.52);
                      setPathLengthL(2.3);
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Coeficiente de Agrupamento (C):</span>
                    <span className="text-pink-400 font-bold">{clusteringC.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.02"
                    value={clusteringC}
                    onChange={(e) => setClusteringC(Number(e.target.value))}
                    className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Segregação funcional / processamento local
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Comprimento Médio de Caminho (L):</span>
                    <span className="text-pink-400 font-bold">{pathLengthL.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="6.0"
                    step="0.1"
                    value={pathLengthL}
                    onChange={(e) => setPathLengthL(Number(e.target.value))}
                    className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Integração global / velocidade de trânsito inter-hemisférico
                  </span>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-pink-500/30 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Coeficiente de Mundo Pequeno (Small-Worldness σ)</span>
                  <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
                    σ = {connectomeCalculations.sigmaSmallWorld.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    {connectomeCalculations.verdict}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Razão de Agrupamento (γ = C/C_rand)</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      {connectomeCalculations.gamma.toFixed(2)}x
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Altamente clusterizado em relação ao acaso
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Razão de Caminho (λ = L/L_rand)</span>
                    <span className="text-xl font-bold font-mono text-purple-400">
                      {connectomeCalculations.lambda.toFixed(2)}x
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Caminhos curtos comparáveis a redes aleatórias
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-300 font-bold mb-1">
                    Conectômica do Cérebro Humano (HCP / Sporns)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A propriedade Small-World permite que o cérebro maximize simultaneamente a segregação funcional em módulos especializados (visão, motricidade, linguagem) e a integração cognitiva global através de hubs de alto tráfego (Precúneo, Córtex Cingulado Posterior e Ínsula).
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
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fórmulas de eletrofisiologia derivadas de Hodgkin-Huxley (1952), Izhikevich (2003) e Rall (1959).</span>
        </div>
        <div className="text-slate-400">
          Holding V5 Apollo · 100% Client-Side Engine
        </div>
      </div>
    </div>
  );
}
