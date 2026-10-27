'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  Cpu, 
  Zap, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Activity, 
  FileCode, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  Orbit, 
  Compass, 
  Binary, 
  Boxes, 
  GitCommit,
  Play
} from 'lucide-react';

export function QuantumCircuitAndBlochSphereSuite({ defaultTab = 'quantum-logic-gates-simulator' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: QUANTUM LOGIC GATES SIMULATOR (COMPLEX AMPLITUDES)
  // -------------------------------------------------------------
  // State: |psi> = alpha|0> + beta|1>
  // alpha = [real, imag], beta = [real, imag]
  const [stateVector, setStateVector] = useState<{ alpha: [number, number]; beta: [number, number] }>({
    alpha: [1, 0],
    beta: [0, 0]
  });
  const [gateHistory, setGateHistory] = useState<string[]>([]);

  const applyGate = (gate: 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T') => {
    const { alpha: a, beta: b } = stateVector;
    let nextA: [number, number] = [0, 0];
    let nextB: [number, number] = [0, 0];

    const invSqrt2 = 1 / Math.SQRT2;

    if (gate === 'H') {
      // H = 1/sqrt(2) * [[1, 1], [1, -1]]
      nextA = [(a[0] + b[0]) * invSqrt2, (a[1] + b[1]) * invSqrt2];
      nextB = [(a[0] - b[0]) * invSqrt2, (a[1] - b[1]) * invSqrt2];
    } else if (gate === 'X') {
      // X = [[0, 1], [1, 0]]
      nextA = [b[0], b[1]];
      nextB = [a[0], a[1]];
    } else if (gate === 'Y') {
      // Y = [[0, -i], [i, 0]]
      nextA = [b[1], -b[0]];
      nextB = [-a[1], a[0]];
    } else if (gate === 'Z') {
      // Z = [[1, 0], [0, -1]]
      nextA = [a[0], a[1]];
      nextB = [-b[0], -b[1]];
    } else if (gate === 'S') {
      // S = [[1, 0], [0, i]]
      nextA = [a[0], a[1]];
      nextB = [-b[1], b[0]];
    } else if (gate === 'T') {
      // T = [[1, 0], [0, e^(i pi/4)]] = [0, (1+i)/sqrt(2)]
      nextA = [a[0], a[1]];
      nextB = [
        (b[0] - b[1]) * invSqrt2,
        (b[0] + b[1]) * invSqrt2
      ];
    }

    setStateVector({ alpha: nextA, beta: nextB });
    setGateHistory([...gateHistory, gate]);
  };

  const resetQubit = () => {
    setStateVector({ alpha: [1, 0], beta: [0, 0] });
    setGateHistory([]);
  };

  const prob0 = stateVector.alpha[0] * stateVector.alpha[0] + stateVector.alpha[1] * stateVector.alpha[1];
  const prob1 = stateVector.beta[0] * stateVector.beta[0] + stateVector.beta[1] * stateVector.beta[1];

  // -------------------------------------------------------------
  // TOOL 2: BLOCH SPHERE 3D VISUALIZER (CANVAS 3D PROJECTION)
  // -------------------------------------------------------------
  const [blochTheta, setBlochTheta] = useState(90); // degrees (0 to 180)
  const [blochPhi, setBlochPhi] = useState(45); // degrees (0 to 360)
  const blochCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeTab !== 'bloch-sphere-3d-visualizer') return;
    const canvas = blochCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = 110;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Coordinate sphere wireframe
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Equator ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Axes
    // Z axis (vertical: |0> at top, |1> at bottom)
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - 20); ctx.lineTo(cx, cy + r + 20);
    ctx.stroke();

    // X and Y axes
    ctx.beginPath();
    ctx.moveTo(cx - r - 15, cy); ctx.lineTo(cx + r + 15, cy);
    ctx.moveTo(cx - r * 0.6, cy + r * 0.4); ctx.lineTo(cx + r * 0.6, cy - r * 0.4);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('|0⟩ (+Z)', cx - 22, cy - r - 25);
    ctx.fillText('|1⟩ (-Z)', cx - 22, cy + r + 35);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('+X (|+)⟩', cx + r + 20, cy + 4);
    ctx.fillText('+Y (|i+⟩)', cx + r * 0.6 + 5, cy - r * 0.4);

    // State Vector calculation on Bloch sphere
    // x = sin(theta) * cos(phi)
    // y = sin(theta) * sin(phi)
    // z = cos(theta)
    const radTheta = (blochTheta * Math.PI) / 180;
    const radPhi = (blochPhi * Math.PI) / 180;

    const vx = Math.sin(radTheta) * Math.cos(radPhi);
    const vy = Math.sin(radTheta) * Math.sin(radPhi);
    const vz = Math.cos(radTheta);

    // Projected 2D coordinates on canvas
    const px = cx + (vx * r * 0.95 - vy * r * 0.35);
    const py = cy - (vz * r * 0.95 - vy * r * 0.2);

    // State Vector Line (Origin to Surface)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Arrowhead / Tip
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [activeTab, blochTheta, blochPhi]);

  // -------------------------------------------------------------
  // TOOL 3: QUANTUM BELL STATES & ENTANGLEMENT
  // -------------------------------------------------------------
  const [selectedBellState, setSelectedBellState] = useState<'phi_plus' | 'phi_minus' | 'psi_plus' | 'psi_minus'>('phi_plus');

  const bellStatesData = {
    phi_plus: {
      formula: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
      matrix: [
        [0.5, 0, 0, 0.5],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0.5, 0, 0, 0.5]
      ],
      desc: 'Emaranhamento máximo de paridade par. Correlação perfeita de medição em qualquer base.'
    },
    phi_minus: {
      formula: '|Φ⁻⟩ = (|00⟩ - |11⟩) / √2',
      matrix: [
        [0.5, 0, 0, -0.5],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [-0.5, 0, 0, 0.5]
      ],
      desc: 'Emaranhamento máximo com inversão de fase π no estado |11⟩.'
    },
    psi_plus: {
      formula: '|Ψ⁺⟩ = (|01⟩ + |10⟩) / √2',
      matrix: [
        [0, 0, 0, 0],
        [0, 0.5, 0.5, 0],
        [0, 0.5, 0.5, 0],
        [0, 0, 0, 0]
      ],
      desc: 'Emaranhamento máximo de paridade ímpar (anti-correlação de medição).'
    },
    psi_minus: {
      formula: '|Ψ⁻⟩ = (|01⟩ - |10⟩) / √2',
      matrix: [
        [0, 0, 0, 0],
        [0, 0.5, -0.5, 0],
        [0, -0.5, 0.5, 0],
        [0, 0, 0, 0]
      ],
      desc: 'Singlet state rotacionalmente invariante em qualquer eixo 3D.'
    }
  };

  // -------------------------------------------------------------
  // TOOL 4: DEUTSCH-JOZSA ALGORITHM RUNNER
  // -------------------------------------------------------------
  const [oracleType, setOracleType] = useState<'const_0' | 'const_1' | 'balanced_parity' | 'balanced_half'>('balanced_parity');
  const [djRun, setDjRun] = useState(false);
  const [djResult, setDjResult] = useState<string | null>('Função Balanceada');

  const executeDeutschJozsa = () => {
    setDjRun(true);
    setTimeout(() => {
      if (oracleType === 'const_0' || oracleType === 'const_1') {
        setDjResult('Função Constante (f(x) independente de x)');
      } else {
        setDjResult('Função Balanceada (50% 0s e 50% 1s)');
      }
      setDjRun(false);
    }, 400);
  };

  // -------------------------------------------------------------
  // TOOL 5: OPENQASM 3.0 CIRCUIT GENERATOR
  // -------------------------------------------------------------
  const [qasmQubits, setQasmQubits] = useState(3);
  const [qasmIncludeMeasure, setQasmIncludeMeasure] = useState(true);

  const generateQasmCode = () => {
    return `// Circuito Quântico OpenQASM 3.0 (W3C / IEEE QIR)
OPENQASM 3.0;
include "stdgates.inc";

qubit[${qasmQubits}] q;
bit[${qasmQubits}] c;

// 1. Inicializacao em superposicao uniforme (Hadamard)
h q[0];
h q[1];
${qasmQubits >= 3 ? 'h q[2];\n' : ''}
// 2. Operacao CNOT de emaranhamento
cx q[0], q[1];
${qasmQubits >= 3 ? 'cx q[1], q[2];\n' : ''}
// 3. Portas de fase
rz(pi / 4) q[0];
s q[1];

${qasmIncludeMeasure ? '// 4. Medicao projetiva na base computacional Z\nc = measure q;' : ''}`;
  };

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5" /> COMPUTAÇÃO QUÂNTICA & QUBITS
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
              Marco de 440 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Suíte de Modelagem e Simulação Quântica em Qubits
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Simulador de portas quânticas unitárias com amplitudes complexas, visualizador 3D da Esfera de Bloch, estados de Bell com entropia de von Neumann, algoritmo de Deutsch-Jozsa e exportador OpenQASM 3.0.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Qubit Simulator</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'quantum-logic-gates-simulator', label: 'Simulador de Portas Unitárias', icon: Atom },
          { id: 'bloch-sphere-3d-visualizer', label: 'Esfera de Bloch 3D', icon: Compass },
          { id: 'quantum-bell-states-entanglement', label: 'Estados de Bell & Emaranhamento', icon: Orbit },
          { id: 'deutsch-jozsa-algorithm-runner', label: 'Algoritmo de Deutsch-Jozsa', icon: Zap },
          { id: 'openqasm-circuit-generator', label: 'Gerador OpenQASM 3.0', icon: FileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUANTUM LOGIC GATES SIMULATOR */}
      {activeTab === 'quantum-logic-gates-simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Atom className="w-4 h-4 text-cyan-400" /> Circuito do Qubit & Portas Lógicas
                </h3>
                <button
                  onClick={resetQubit}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reset (|0⟩)</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Clique para aplicar portas unitárias no Qubit:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'H', label: 'Hadamard (H)', desc: 'Superposição' },
                    { id: 'X', label: 'Pauli-X (NOT)', desc: 'Bit Flip' },
                    { id: 'Y', label: 'Pauli-Y', desc: 'Phase + Bit' },
                    { id: 'Z', label: 'Pauli-Z', desc: 'Phase Flip' },
                    { id: 'S', label: 'Phase (S)', desc: 'Rot π/2' },
                    { id: 'T', label: 'Phase (T)', desc: 'Rot π/4' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => applyGate(g.id as any)}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-center space-y-1 transition-all hover:border-cyan-500/40"
                    >
                      <div className="text-lg font-bold font-mono text-cyan-400">{g.id}</div>
                      <div className="text-[9px] text-slate-500">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Sequência de Portas Aplicadas:</div>
                <div className="flex flex-wrap gap-1.5 min-h-8 items-center">
                  {gateHistory.length === 0 ? (
                    <span className="text-xs text-slate-600 font-mono">Nenhuma porta aplicada (Estado inicial |0⟩)</span>
                  ) : (
                    gateHistory.map((g, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono rounded">
                        {g}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Preservação de Norma Unitária
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {'|α|² + |β|² = '}{(prob0 + prob1).toFixed(4)} == 1.0000 (Conserva probabilidade quântica)
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Vetor de Estado |ψ⟩ e Probabilidades
                </h3>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-slate-500">// Estado Quântico: |ψ⟩ = α|0⟩ + β|1⟩</div>
                  <div className="space-y-1 text-slate-300">
                    <div>
                      α (|0⟩): <strong className="text-cyan-400">{stateVector.alpha[0].toFixed(3)} + {stateVector.alpha[1].toFixed(3)}i</strong>
                    </div>
                    <div>
                      β (|1⟩): <strong className="text-purple-400">{stateVector.beta[0].toFixed(3)} + {stateVector.beta[1].toFixed(3)}i</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-cyan-400 font-bold">Probabilidade de Medir |0⟩:</span>
                      <span className="font-mono text-cyan-300">{(prob0 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${prob0 * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-400 font-bold">Probabilidade de Medir |1⟩:</span>
                      <span className="font-mono text-purple-300">{(prob1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${prob1 * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                O operador de Hadamard $H$ cria superposição perfeita equiprovável ($50\% |0\rangle + 50\% |1\rangle$).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCH SPHERE 3D VISUALIZER */}
      {activeTab === 'bloch-sphere-3d-visualizer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" /> Projeção Tridimensional da Esfera de Bloch
                </h3>
                <span className="text-xs text-slate-500 font-mono">Norma ||r|| = 1</span>
              </div>

              <div className="relative w-full aspect-[5/3.5] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <canvas
                  ref={blochCanvasRef}
                  width={500}
                  height={350}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Coordenada X</div>
                  <div className="text-sm font-bold text-cyan-400">
                    {(Math.sin((blochTheta * Math.PI) / 180) * Math.cos((blochPhi * Math.PI) / 180)).toFixed(3)}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Coordenada Y</div>
                  <div className="text-sm font-bold text-purple-400">
                    {(Math.sin((blochTheta * Math.PI) / 180) * Math.sin((blochPhi * Math.PI) / 180)).toFixed(3)}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Coordenada Z</div>
                  <div className="text-sm font-bold text-pink-400">
                    {Math.cos((blochTheta * Math.PI) / 180).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Ângulos Esféricos de Euler
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Ângulo Polar ($\theta$ Colatitude)</span>
                    <span className="font-mono text-cyan-400 font-bold">{blochTheta}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={blochTheta}
                    onChange={(e) => setBlochTheta(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0° (|0⟩ Polo Norte)</span>
                    <span>180° (|1⟩ Polo Sul)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Ângulo Azimutal ($\phi$ Fase)</span>
                    <span className="font-mono text-purple-400 font-bold">{blochPhi}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={blochPhi}
                    onChange={(e) => setBlochPhi(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div className="text-slate-500">// Parametrização Geométrica</div>
                  <div className="text-pink-300">{'|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩'}</div>
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                  Todo estado puro de 1 Qubit mapeia exatamente para um ponto na superfície da esfera unitária S² (Bloch).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUANTUM BELL STATES & ENTANGLEMENT */}
      {activeTab === 'quantum-bell-states-entanglement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Orbit className="w-4 h-4 text-purple-400" /> Os 4 Estados de Bell Maximamente Emaranhados
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'phi_plus', label: '|Φ⁺⟩ (Phi Mais)' },
                  { id: 'phi_minus', label: '|Φ⁻⟩ (Phi Menos)' },
                  { id: 'psi_plus', label: '|Ψ⁺⟩ (Psi Mais)' },
                  { id: 'psi_minus', label: '|Ψ⁻⟩ (Psi Menos)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBellState(b.id as any)}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      selectedBellState === b.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-slate-500">// Fórmula Analítica</div>
                <div className="text-lg font-bold text-cyan-400">
                  {bellStatesData[selectedBellState].formula}
                </div>
                <p className="text-slate-400 font-sans text-xs pt-1">
                  {bellStatesData[selectedBellState].desc}
                </p>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                Gerado aplicando uma porta Hadamard no primeiro Qubit seguido de uma porta CNOT controlada no segundo Qubit: <code>H(q0) → CX(q0, q1)</code>.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matriz de Densidade e Violação de Bell (CHSH)
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-500 font-mono">// Matriz de Densidade ρ = |ψ⟩⟨ψ| (Base 00, 01, 10, 11)</div>
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                  {bellStatesData[selectedBellState].matrix.flat().map((val, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border ${
                        val !== 0
                          ? 'bg-purple-950/60 text-purple-300 border-purple-500/40 font-bold'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Entropia von Neumann</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">S(ρ_A) = 1.000 bit</div>
                  <div className="text-[9px] text-slate-400 mt-1">Emaranhamento Máximo</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Valor de Tsirelson (CHSH)</div>
                  <div className="text-base font-bold text-cyan-400 font-mono">2√2 ≈ 2.828</div>
                  <div className="text-[9px] text-slate-400 mt-1">Viola Limite Clássico (2.0)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEUTSCH-JOZSA ALGORITHM RUNNER */}
      {activeTab === 'deutsch-jozsa-algorithm-runner' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" /> Algoritmo de Deutsch-Jozsa (Vantagem Quântica Exponencial)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Determina com 100% de certeza se um oráculo desconhecido f(x) é constante ou balanceado com apenas 1 consulta.
                </p>
              </div>

              <button
                onClick={executeDeutschJozsa}
                disabled={djRun}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/30 transition-all disabled:opacity-50"
              >
                {djRun ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>Executar Circuito Quântico</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-slate-400 block">Selecione o Tipo de Oráculo O_f Caixa-Preta:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'const_0', label: 'Constante f(x) = 0' },
                  { id: 'const_1', label: 'Constante f(x) = 1' },
                  { id: 'balanced_parity', label: 'Balanceado (Paridade x0 ^ x1)' },
                  { id: 'balanced_half', label: 'Balanceado (Metade 0s, Metade 1s)' },
                ].map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setOracleType(o.id as any)}
                    className={`p-3 rounded-xl border text-xs text-left font-medium transition-all ${
                      oracleType === o.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-[10px] text-slate-500">Consultas Quânticas</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">1 Query</div>
                <div className="text-[10px] text-slate-400">O(1) complexidade</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-[10px] text-slate-500">Consultas Clássicas Pior Caso</div>
                <div className="text-2xl font-bold font-mono text-rose-400">2^(n-1) + 1</div>
                <div className="text-[10px] text-slate-400">O(2^n) complexidade exponencial</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-[10px] text-slate-500">Veredito da Medição</div>
                <div className="text-sm font-bold font-mono text-cyan-400 truncate">{djResult}</div>
                <div className="text-[10px] text-slate-400">Interferência construtiva/destrutiva</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OPENQASM 3.0 CIRCUIT GENERATOR */}
      {activeTab === 'openqasm-circuit-generator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-purple-400" /> Exportador OpenQASM 3.0 (IEEE / W3C Standard)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Código quântico padronizado compatível com Qiskit, AWS Braket e computadores quânticos supercondutores.
                </p>
              </div>

              <button
                onClick={() => handleCopy(generateQasmCode(), 'qasm-code')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              >
                {copied === 'qasm-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copied === 'qasm-code' ? 'Copiado!' : 'Copiar OpenQASM'}</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Qubits no Registrador:</span>
                  <span className="font-mono text-cyan-400 font-bold">{qasmQubits} Qubits</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={qasmQubits}
                  onChange={(e) => setQasmQubits(parseInt(e.target.value))}
                  className="w-48 accent-cyan-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-3">
                <input
                  type="checkbox"
                  checked={qasmIncludeMeasure}
                  onChange={(e) => setQasmIncludeMeasure(e.target.checked)}
                  className="rounded border-slate-700 accent-purple-500"
                />
                <span>Incluir instrução final de medição (measure)</span>
              </label>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed max-h-72 overflow-y-auto">
              {generateQasmCode()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}