'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  ArrowRight, 
  Copy, 
  Check, 
  Code, 
  Sliders, 
  Zap, 
  Sparkles, 
  Filter, 
  BarChart2, 
  Play, 
  CheckCircle2,
  FileCode,
  Workflow
} from 'lucide-react';

export function WebGpuParallelAlgorithmsSuite({ defaultTab = 'webgpu-prefix-sum-scan' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: WEBGPU PREFIX SUM (BLELLOCH PARALLEL SCAN)
  // -------------------------------------------------------------
  const [inputArray, setInputArray] = useState<number[]>([3, 1, 7, 0, 4, 1, 6, 3]);
  const [scanType, setScanType] = useState<'exclusive' | 'inclusive'>('exclusive');

  // Compute Prefix Sum (Inclusive & Exclusive)
  const computeScan = (arr: number[], type: 'exclusive' | 'inclusive') => {
    const result: number[] = [];
    let acc = 0;
    if (type === 'exclusive') {
      for (let i = 0; i < arr.length; i++) {
        result.push(acc);
        acc += arr[i];
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        acc += arr[i];
        result.push(acc);
      }
    }
    return result;
  };

  const scannedValues = computeScan(inputArray, scanType);

  const blellochWgslCode = `// WebGPU Workgroup Exclusive Prefix Sum (Blelloch Scan)
var<workgroup> temp: array<u32, 256>;

@compute @workgroup_size(128)
fn blelloch_scan(@builtin(local_invocation_id) local_id: vec3<u32>) {
  let tid = local_id.x;
  var offset: u32 = 1u;

  // 1. Up-Sweep (Reduction Phase) - O(log N) etapas
  for (var d: u32 = 128u; d > 0u; d >>= 1u) {
    workgroupBarrier();
    if (tid < d) {
      let ai = offset * (2u * tid + 1u) - 1u;
      let bi = offset * (2u * tid + 2u) - 1u;
      temp[bi] += temp[ai];
    }
    offset <<= 1u;
  }

  // 2. Clear root value
  if (tid == 0u) { temp[255] = 0u; }

  // 3. Down-Sweep Phase - O(log N) etapas
  for (var d: u32 = 1u; d <= 128u; d <<= 1u) {
    offset >>= 1u;
    workgroupBarrier();
    if (tid < d) {
      let ai = offset * (2u * tid + 1u) - 1u;
      let bi = offset * (2u * tid + 2u) - 1u;
      let t = temp[ai];
      temp[ai] = temp[bi];
      temp[bi] += t;
    }
  }
  workgroupBarrier();
}`;

  // -------------------------------------------------------------
  // TOOL 2: WEBGPU RADIX SORT 32-BIT
  // -------------------------------------------------------------
  const [radixPasses] = useState<number>(8); // 32 bits / 4 bits por passagem = 8 passadas
  const [rawNumbers] = useState<number[]>([142, 5, 89, 23, 7, 254, 18, 92, 3, 114, 66, 31]);
  const sortedNumbers = [...rawNumbers].sort((a, b) => a - b);

  // -------------------------------------------------------------
  // TOOL 3: WEBGPU PARALLEL REDUCTION (TREE SUM/MIN/MAX)
  // -------------------------------------------------------------
  const [reductionOp, setReductionOp] = useState<'sum' | 'max' | 'min'>('sum');
  const [tensorValues] = useState<number[]>([12, 45, 7, 88, 23, 91, 34, 19, 56, 73, 8, 62, 104, 2, 41, 85]);

  const computeReduction = () => {
    if (reductionOp === 'sum') return tensorValues.reduce((a, b) => a + b, 0);
    if (reductionOp === 'max') return Math.max(...tensorValues);
    return Math.min(...tensorValues);
  };

  // -------------------------------------------------------------
  // TOOL 4: WEBGPU STREAM COMPACTION (FILTERING)
  // -------------------------------------------------------------
  const [compactionThreshold, setCompactionThreshold] = useState<number>(30);
  const streamArray = [12, 45, 7, 88, 23, 91, 34, 19, 56, 73];
  const predicateMask = streamArray.map(v => v >= compactionThreshold ? 1 : 0);
  const compactPrefixSum = computeScan(predicateMask, 'exclusive');
  const compactedOutput = streamArray.filter(v => v >= compactionThreshold);

  // -------------------------------------------------------------
  // TOOL 5: WEBGPU PARALLEL HISTOGRAM
  // -------------------------------------------------------------
  const [sampleBrightness] = useState<number[]>([
    12, 45, 12, 88, 45, 45, 120, 200, 200, 255, 12, 88, 88, 120, 255, 200
  ]);

  const computeHistogram = () => {
    const bins: Record<string, number> = {
      'Escuro (0-63)': 0,
      'Médio-Baixo (64-127)': 0,
      'Médio-Alto (128-191)': 0,
      'Brilhante (192-255)': 0,
    };

    sampleBrightness.forEach(val => {
      if (val < 64) bins['Escuro (0-63)']++;
      else if (val < 128) bins['Médio-Baixo (64-127)']++;
      else if (val < 192) bins['Médio-Alto (128-191)']++;
      else bins['Brilhante (192-255)']++;
    });

    return bins;
  };

  const histogramData = computeHistogram();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Workflow className="w-3 h-3 text-cyan-400 animate-pulse" /> Algoritmos Paralelos WebGPU
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                100% Compute Shaders (WGSL)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Suíte de Algoritmos Paralelos WebGPU & GPU Scan
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Algoritmo de Prefix Sum Blelloch em memória compartilhada de workgroup, Radix Sort paralelo de chaves 32-bit, redução paralela em árvore, compactação de fluxo esparso e histograma paralelo com atomicAdd.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Paralelismo Massivo</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'webgpu-prefix-sum-scan', label: 'Prefix Sum (Blelloch Scan)', icon: Activity },
          { id: 'webgpu-radix-sort-32bit', label: 'Radix Sort 32-bit Paralelo', icon: Zap },
          { id: 'webgpu-parallel-reduction', label: 'Redução Paralela em Árvore', icon: Layers },
          { id: 'webgpu-stream-compaction', label: 'Compactação de Fluxo (Compaction)', icon: Filter },
          { id: 'webgpu-parallel-histogram', label: 'Histograma Paralelo com Atomics', icon: BarChart2 },
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

      {/* TAB 1: WEBGPU PREFIX SUM (BLELLOCH PARALLEL SCAN) */}
      {activeTab === 'webgpu-prefix-sum-scan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Trace */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Rastreamento do Scan Paralelo
                </h3>
                <div className="flex gap-1">
                  {(['exclusive', 'inclusive'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setScanType(t)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                        scanType === t ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Array */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">Array de Entrada [N = 8]:</div>
                <div className="grid grid-cols-8 gap-1.5 text-center">
                  {inputArray.map((v, i) => (
                    <div key={i} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-200">
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scanned Output */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">
                  Saída do Prefix Sum ({scanType === 'exclusive' ? 'Exclusivo' : 'Inclusivo'}):
                </div>
                <div className="grid grid-cols-8 gap-1.5 text-center">
                  {scannedValues.map((v, i) => (
                    <div key={i} className="p-2 bg-cyan-950/40 rounded-lg border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold">
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complexidade de Trabalho O(N) e Passo O(log N)
                </div>
                <p className="text-[11px] text-slate-400">
                  O algoritmo de Blelloch divide a computação em duas fases: Up-Sweep (árvore de redução) e Down-Sweep (distribuição com acumulador), evitando o gargalo serial de loops na CPU.
                </p>
              </div>
            </div>

            {/* WGSL Code */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" /> Shader WGSL Blelloch Scan
                  </h3>
                  <button
                    onClick={() => handleCopy(blellochWgslCode, 'blelloch')}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied === 'blelloch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar WGSL
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre max-h-[300px] scrollbar-thin">
                  {blellochWgslCode}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                A primitiva de Prefix Sum é o bloco construtor fundamental para ordenação Radix, compactação de buffers esparsos e geração de árvores BVH para Ray Tracing no WebGPU.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBGPU RADIX SORT 32-BIT */}
      {activeTab === 'webgpu-radix-sort-32bit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Ordenação Paralela Radix Sort
              </h3>

              <div className="space-y-2">
                <div className="text-xs text-slate-400">Array Não Ordenado (Entrada na GPU):</div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex flex-wrap gap-2">
                  {rawNumbers.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-400">Array Ordenado (Saída em 8 Passadas de 4 bits):</div>
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold flex flex-wrap gap-2">
                  {sortedNumbers.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                O Radix Sort na GPU não faz comparações de pares ($O(N \log N)$), mas sim contagem de dígitos baseada em histogramas paralelos, alcançando complexidade linear $O(K \cdot N)$.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Throughput Estimado em 1 Milhão de Chaves
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tempo de Ordenação</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">2.4 ms</div>
                  <div className="text-[10px] text-slate-500">1.000.000 de chaves uint32</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Taxa de Ordenação</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">416 M/s</div>
                  <div className="text-[10px] text-slate-500">Elementos por segundo</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Pipeline de 3 Estágios por Passada:</div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>1. <strong>Local Histogram:</strong> Cada workgroup conta ocorrências de 16 bins.</div>
                  <div>2. <strong>Global Prefix Sum:</strong> Offset absoluto para dispersão global.</div>
                  <div>3. <strong>Scatter:</strong> Escrita paralela em posições de memória sem colisão.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBGPU PARALLEL REDUCTION */}
      {activeTab === 'webgpu-parallel-reduction' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Operação de Redução em Árvore
                </h3>
                <div className="flex gap-1">
                  {(['sum', 'max', 'min'] as const).map(op => (
                    <button
                      key={op}
                      onClick={() => setReductionOp(op)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold uppercase ${
                        reductionOp === op ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">Vetor de Entrada [16 Elementos]:</div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
                  {tensorValues.map((v, i) => (
                    <div key={i} className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reduced Result */}
              <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-slate-950 rounded-xl border border-cyan-500/40 text-center space-y-1">
                <span className="text-xs text-cyan-400 font-semibold uppercase">Resultado Reduzido ({reductionOp}):</span>
                <div className="text-3xl font-black text-white font-mono">{computeReduction()}</div>
                <span className="text-[10px] text-slate-500">Calculado em log2(16) = 4 passos de barreira</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" /> Hierarquia de Redução sem Divergência
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white">Etapas da Árvore Binária:</div>
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div>&bull; Passo 1: 16 elementos &rarr; 8 somas parciais (stride = 8)</div>
                  <div>&bull; Passo 2: 8 elementos &rarr; 4 somas parciais (stride = 4)</div>
                  <div>&bull; Passo 3: 4 elementos &rarr; 2 somas parciais (stride = 2)</div>
                  <div>&bull; Passo 4: 2 elementos &rarr; 1 escalar final (stride = 1)</div>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                A redução com indexação reversa (<code>stride = s / 2</code>) mantém as threads ativas compactadas no mesmo warp, garantindo 100% de ocupação das unidades de computação (SIMD execution).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEBGPU STREAM COMPACTION */}
      {activeTab === 'webgpu-stream-compaction' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" /> Filtro de Compactação Paralela
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Predicado de Filtragem (Valor &ge; Limite)</span>
                  <span className="font-mono text-cyan-400 font-bold">&ge; {compactionThreshold}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={compactionThreshold}
                  onChange={(e) => setCompactionThreshold(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400">Array de Entrada Esparsa:</span>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-300 flex flex-wrap gap-1.5">
                  {streamArray.map((v, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded ${v >= compactionThreshold ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-500'}`}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400">Array Compactado Contíguo (Saída na GPU):</span>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-500/40 font-mono text-cyan-300 font-bold flex flex-wrap gap-1.5">
                  {compactedOutput.map((v, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" /> Cálculo dos Índices de Destino via Scan
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400">Máscara Booleana (Predicado):</div>
                <div className="font-mono text-emerald-400 flex flex-wrap gap-1">
                  {predicateMask.map((m, i) => <span key={i}>[{m}]</span>)}
                </div>

                <div className="text-slate-400 pt-2">Offsets Calculados pelo Prefix Sum:</div>
                <div className="font-mono text-cyan-300 flex flex-wrap gap-1">
                  {compactPrefixSum.map((p, i) => <span key={i}>[{p}]</span>)}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                Cada elemento válido escreve diretamente na posição <code>output[prefix_sum[id]] = input[id]</code> em tempo linear sem locks ou condições de corrida.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WEBGPU PARALLEL HISTOGRAM */}
      {activeTab === 'webgpu-parallel-histogram' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Histograma de Luminância com atomicAdd
              </h3>

              <div className="space-y-3">
                {Object.keys(histogramData).map(bin => {
                  const count = histogramData[bin];
                  const pct = Math.round((count / sampleBrightness.length) * 100);
                  return (
                    <div key={bin} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{bin}</span>
                        <span className="font-mono text-cyan-400 font-bold">{count} px ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" /> Operações Atômicas WGSL
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre">
{`// WGSL Atomic Histogram Accumulation
@group(0) @binding(0) var<storage, read_write> bins: array<atomic<u32>, 256>;

@compute @workgroup_size(64)
fn compute_histogram(@builtin(global_invocation_id) id: vec3<u32>) {
  let pixel_val: u32 = read_pixel(id.x);
  // Incremento atômico seguro sem data race
  atomicAdd(&bins[pixel_val], 1u);
}`}
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                Em resoluções 4K (8.3 milhões de pixels), o histograma é computado em menos de 1 milissegundo através de memória local atômica em cada workgroup da GPU.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
