'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Zap, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Info, 
  Binary, 
  Sparkles,
  FileCode2,
  Clock,
  Gauge
} from 'lucide-react';

interface V8MemoryAndGarbageCollectionSuiteProps {
  defaultTab?: 'v8-heap' | 'event-loop-lag' | 'leak-patterns' | 'typedarrays' | 'microtasks';
}

export const V8MemoryAndGarbageCollectionSuite: React.FC<V8MemoryAndGarbageCollectionSuiteProps> = ({ 
  defaultTab = 'v8-heap' 
}) => {
  const [activeTab, setActiveTab] = useState<'v8-heap' | 'event-loop-lag' | 'leak-patterns' | 'typedarrays' | 'microtasks'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: ESTIMADOR E PROFILER DE HEAP V8
  // ==========================================
  const [heapStats, setHeapStats] = useState<{
    usedMb: number;
    totalMb: number;
    limitMb: number;
    isNative: boolean;
  }>({ usedMb: 42, totalMb: 68, limitMb: 4096, isNative: false });

  const [simulatedBuffers, setSimulatedBuffers] = useState<number[]>([]);

  useEffect(() => {
    const updateMemory = () => {
      if (typeof window !== 'undefined' && (performance as any).memory) {
        const mem = (performance as any).memory;
        setHeapStats({
          usedMb: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
          totalMb: Math.round(mem.totalJSHeapSize / (1024 * 1024)),
          limitMb: Math.round(mem.jsHeapSizeLimit / (1024 * 1024)),
          isNative: true
        });
      } else {
        // Estimativa para Safari / Firefox / Edge sem performance.memory exposto
        const bufferSum = simulatedBuffers.reduce((a, b) => a + b, 0);
        setHeapStats({
          usedMb: 35 + bufferSum,
          totalMb: 55 + Math.round(bufferSum * 1.3),
          limitMb: 4096,
          isNative: false
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [simulatedBuffers]);

  const allocateMemoryChunk = (mb: number) => {
    setSimulatedBuffers((prev) => [...prev, mb]);
  };

  const releaseAllocatedMemory = () => {
    setSimulatedBuffers([]);
  };

  // ==========================================
  // FERRAMENTA 2: MEDIDOR DE EVENT LOOP LAG & FRAMES
  // ==========================================
  const [isMonitoringLag, setIsMonitoringLag] = useState<boolean>(true);
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [currentLagMs, setCurrentLagMs] = useState<number>(0);
  const [lagHistory, setLagHistory] = useState<number[]>([16, 17, 16, 16, 18, 16, 17, 16, 16]);
  const lastFrameTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isMonitoringLag) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    let frameCount = 0;
    let lastFpsCalcTime = performance.now();

    const loop = (time: number) => {
      if (lastFrameTimeRef.current > 0) {
        const delta = time - lastFrameTimeRef.current;
        const lag = Math.max(0, delta - 16.67);
        setCurrentLagMs(Math.round(lag));

        frameCount++;
        if (time - lastFpsCalcTime >= 500) {
          const fps = Math.round((frameCount * 1000) / (time - lastFpsCalcTime));
          setCurrentFps(Math.min(120, fps));
          frameCount = 0;
          lastFpsCalcTime = time;

          setLagHistory((prev) => [...prev.slice(-20), Math.round(delta)]);
        }
      }
      lastFrameTimeRef.current = time;
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isMonitoringLag]);

  const blockMainThreadSimulated = (ms: number) => {
    const start = performance.now();
    while (performance.now() - start < ms) {
      // Bloqueio deliberado para demonstrar jank
    }
  };

  // ==========================================
  // FERRAMENTA 3: DETECTOR DE PADRÕES DE MEMORY LEAK
  // ==========================================
  const [selectedLeakPreset, setSelectedLeakPreset] = useState<'closure' | 'listener' | 'timer' | 'detached-dom'>('closure');

  const leakAnalysis = useMemo(() => {
    if (selectedLeakPreset === 'closure') {
      return {
        title: 'Vazamento por Closure Retida (Retained Scope)',
        badCode: `function criarMonitor() {\n  // Aloca 20MB de dados\n  const dadosGigantes = new Array(5000000).fill("v5");\n\n  return function pegarStatus() {\n    // A closure retém 'dadosGigantes' na memória para sempre,\n    // mesmo que utilize apenas o status booleano!\n    return { ativo: true };\n  };\n}`,
        fixedCode: `function criarMonitor() {\n  const dadosGigantes = new Array(5000000).fill("v5");\n  const ativo = true;\n  // Desvincule a referência pesada antes de retornar a closure\n  return function pegarStatus() {\n    return { ativo };\n  };\n}`,
        explanation: 'O V8 retém todo o Context Scope da função pai se qualquer variável interna for referenciada. Limpe referências desnecessárias ou isole escopos pequenos.',
        severity: 'Alto Risco (Retenção Contínua de Heap)'
      };
    } else if (selectedLeakPreset === 'listener') {
      return {
        title: 'Event Listener Órfão no useEffect / Componente',
        badCode: `useEffect(() => {\n  const handleResize = () => setWidth(window.innerWidth);\n  window.addEventListener('resize', handleResize);\n  // FALHA: Esquecer a função de limpeza (cleanup) faz com que\n  // a cada montagem um novo listener acumule no objeto window.\n}, []);`,
        fixedCode: `useEffect(() => {\n  const handleResize = () => setWidth(window.innerWidth);\n  window.addEventListener('resize', handleResize);\n  // CORREÇÃO: Função de cleanup obrigatória no unmount\n  return () => window.removeEventListener('resize', handleResize);\n}, []);`,
        explanation: 'Elementos globais como window e document mantêm ponteiros para as funções de callback e para todos os objetos do componente fechados na closure.',
        severity: 'Crítico em SPAs e Navegação Frequente'
      };
    } else if (selectedLeakPreset === 'timer') {
      return {
        title: 'setInterval / setTimeout Infinito Não Cancelado',
        badCode: `function iniciarPolling() {\n  setInterval(() => {\n    // Faz polling para a API e referencia o estado local\n    fetchDadosAtualizados();\n  }, 2000);\n  // FALHA: O ID do timer é perdido e continua rodando em background\n}`,
        fixedCode: `useEffect(() => {\n  const timerId = setInterval(() => {\n    fetchDadosAtualizados();\n  }, 2000);\n  return () => clearInterval(timerId); // CORREÇÃO\n}, []);`,
        explanation: 'Timers de ciclo contínuo impedem que o Garbage Collector colete o callback e tudo o que estiver em seu escopo de execução.',
        severity: 'Alto Risco (Consumo Acumulativo de CPU & Rede)'
      };
    } else {
      // Detached DOM
      return {
        title: 'Nós do DOM Desanexados (Detached DOM Nodes)',
        badCode: `const cacheBotoes = [];\nfunction removerBotao(elemento) {\n  cacheBotoes.push(elemento); // Mantém ponteiro JS no array global\n  elemento.parentNode.removeChild(elemento); // Remove da árvore visual\n}`,
        fixedCode: `// Use WeakSet ou WeakMap para permitir que o GC limpe o nó desanexado\nconst cacheBotoes = new WeakSet();\nfunction removerBotao(elemento) {\n  cacheBotoes.add(elemento);\n  elemento.remove();\n}`,
        explanation: 'Se um nó do DOM for removido da página mas uma variável JavaScript mantiver sua referência, a árvore inteira de elementos filhos permanecerá na memória.',
        severity: 'Moderado a Grave em Tabelas Densas'
      };
    }
  }, [selectedLeakPreset]);

  // ==========================================
  // FERRAMENTA 4: ALOCADOR E CALCULADORA DE TYPEDARRAYS
  // ==========================================
  const [arrayLength, setArrayLength] = useState<number>(1000000); // 1 Milhão de elementos
  const [typedArrayType, setTypedArrayType] = useState<'Uint8Array' | 'Int16Array' | 'Float32Array' | 'Float64Array'>('Float32Array');

  const typedArrayStats = useMemo(() => {
    let bytesPerElement = 4;
    if (typedArrayType === 'Uint8Array') bytesPerElement = 1;
    else if (typedArrayType === 'Int16Array') bytesPerElement = 2;
    else if (typedArrayType === 'Float32Array') bytesPerElement = 4;
    else if (typedArrayType === 'Float64Array') bytesPerElement = 8;

    const totalBytes = arrayLength * bytesPerElement;
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

    // Comparativo com Array JS padrão de Objetos [{ id, val }]
    // Um array de objetos JS consome aproximadamente 48 a 64 bytes por item devido ao ponteiro, hidden class e shape descriptor
    const jsObjArrayEstimatedBytes = arrayLength * 56;
    const jsObjArrayMb = (jsObjArrayEstimatedBytes / (1024 * 1024)).toFixed(2);
    const savingsPercent = (((jsObjArrayEstimatedBytes - totalBytes) / jsObjArrayEstimatedBytes) * 100).toFixed(1);

    return {
      bytesPerElement,
      totalBytes,
      totalMb,
      jsObjArrayMb,
      savingsPercent
    };
  }, [arrayLength, typedArrayType]);

  // ==========================================
  // FERRAMENTA 5: SIMULADOR DE MICROTAREFAS VS MACROTAREFAS
  // ==========================================
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [isSimulatingEventLoop, setIsSimulatingEventLoop] = useState<boolean>(false);

  const runEventLoopSimulation = () => {
    setIsSimulatingEventLoop(true);
    setExecutionLog([]);

    const log: string[] = [];

    // Passo 1: Síncrono 1
    log.push('1. [SÍNCRONO] Início do Script Principal (Call Stack)');

    // Agendar Macrotarefa (setTimeout)
    setTimeout(() => {
      setExecutionLog((prev) => [...prev, '4. [MACROTAREFA] setTimeout(fn, 0) executado da Task Queue']);
      setIsSimulatingEventLoop(false);
    }, 0);

    // Agendar Microtarefa (Promise)
    Promise.resolve().then(() => {
      setExecutionLog((prev) => [...prev, '3. [MICROTAREFA] Promise.then() executado da Microtask Queue']);
    });

    // Passo 2: Síncrono 2
    log.push('2. [SÍNCRONO] Fim do Script Principal (Call Stack)');
    setExecutionLog(log);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HEADER DA SUÍTE */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-lg border border-amber-500/30">
              <Cpu className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Profiling de Memória, V8 & Event Loop
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  Etapa 62 · 320 Ferramentas!
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Profiler de Heap do V8, medidor de Event Loop Lag, detector de Memory Leaks, TypedArrays e simulação de microtarefas.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('v8-heap')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'v8-heap'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Heap V8 & GC
          </button>
          <button
            onClick={() => setActiveTab('event-loop-lag')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'event-loop-lag'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Event Loop Lag
          </button>
          <button
            onClick={() => setActiveTab('leak-patterns')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'leak-patterns'
                ? 'bg-red-500 text-slate-950 shadow-md shadow-red-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Memory Leaks
          </button>
          <button
            onClick={() => setActiveTab('typedarrays')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'typedarrays'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            TypedArrays
          </button>
          <button
            onClick={() => setActiveTab('microtasks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'microtasks'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Microtasks Queue
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ========================================================= */}
        {/* TAB 1: HEAP V8 & GARBAGE COLLECTION                       */}
        {/* ========================================================= */}
        {activeTab === 'v8-heap' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ESTATÍSTICAS DO HEAP */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                    <Gauge className="w-4 h-4" /> Alocação de Memória V8
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    heapStats.isNative ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {heapStats.isNative ? 'API Nativa Chromium' : 'Estimador Sintético'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Heap Em Uso (usedJSHeapSize):</span>
                      <span className="text-amber-400 font-bold">{heapStats.usedMb} MB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${Math.min(100, (heapStats.usedMb / heapStats.totalMb) * 100)}%` }}
                        className="bg-amber-500 h-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Heap Alocado (Total)</span>
                      <span className="font-bold text-slate-200">{heapStats.totalMb} MB</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Teto Máximo (Limit)</span>
                      <span className="font-bold text-slate-400">{heapStats.limitMb} MB</span>
                    </div>
                  </div>
                </div>

                {/* TESTES DE ALOCAÇÃO */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Simulação de Carga no Heap:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => allocateMemoryChunk(25)}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-amber-300 font-medium"
                    >
                      + Alocar 25 MB
                    </button>
                    <button
                      onClick={() => allocateMemoryChunk(50)}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-amber-300 font-medium"
                    >
                      + Alocar 50 MB
                    </button>
                  </div>

                  {simulatedBuffers.length > 0 && (
                    <button
                      onClick={releaseAllocatedMemory}
                      className="w-full py-1.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 text-rose-300 text-xs rounded font-semibold transition-all mt-2"
                    >
                      Liberar Buffers Alocados ({simulatedBuffers.reduce((a, b) => a + b, 0)} MB)
                    </button>
                  )}
                </div>
              </div>

              {/* CICLOS DO GARBAGE COLLECTOR V8 */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Arquitetura de Gerenciamento de Memória do V8 (Chrome / Node.js)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Sparkles className="w-4 h-4" /> Minor GC (Scavenger / Cheney Algorithm)
                    </div>
                    <p className="text-xs text-slate-300">
                      Opera na <strong>Young Generation</strong> (Eden Space / Semi-spaces). Coleta objetos de vida curta (closures temporárias, variáveis de loop).
                    </p>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Pausa na UI: ~1 a 2 ms (Quase imperceptível)
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Layers className="w-4 h-4" /> Major GC (Mark-Sweep-Compact / Orinoco)
                    </div>
                    <p className="text-xs text-slate-300">
                      Opera na <strong>Old Generation</strong>. Identifica objetos sobreviventes de múltiplos ciclos e desfragmenta os blocos de memória contíguos.
                    </p>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Pausa na UI: ~10 a 50 ms (Risco de queda de FPS)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica de Alta Performance:</strong> Evite instanciar objetos curtos repetidamente dentro de <code>requestAnimationFrame</code> ou loops de render. Reutilize buffers para manter o Scavenger zerado.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MEDIDOR DE EVENT LOOP LAG                         */}
        {/* ========================================================= */}
        {activeTab === 'event-loop-lag' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TELEMETRIA AO VIVO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Frequência de Renderização
                  </h3>
                  <button
                    onClick={() => setIsMonitoringLag(!isMonitoringLag)}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    {isMonitoringLag ? 'Pausar' : 'Retomar'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Taxa de Frames</span>
                    <span className="text-2xl font-bold text-white">{currentFps} FPS</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Atraso da Thread (Lag)</span>
                    <span className={`text-2xl font-bold ${currentLagMs > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {currentLagMs} ms
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Simular Bloqueio da Thread Principal (Jank):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => blockMainThreadSimulated(50)}
                      className="py-1.5 bg-slate-900 hover:bg-orange-950/40 border border-slate-700 text-xs text-orange-300 rounded font-medium"
                    >
                      Travar 50 ms
                    </button>
                    <button
                      onClick={() => blockMainThreadSimulated(150)}
                      className="py-1.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-700 text-xs text-rose-300 rounded font-medium"
                    >
                      Travar 150 ms (Long Task)
                    </button>
                  </div>
                </div>
              </div>

              {/* HISTÓRICO DE FRAME DELTA */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Delta Entre Frames Consecutivos (Alvo: 16.6 ms)
                </span>

                <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-end gap-1.5 overflow-hidden">
                  {lagHistory.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        style={{ height: `${Math.min(100, (val / 60) * 100)}%` }}
                        className={`w-full rounded-t transition-all ${
                          val > 40 ? 'bg-rose-500' : val > 22 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-[9px] text-slate-500 font-mono">{val}ms</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400">
                  Qualquer tarefa JavaScript que execute por mais de <strong>50 ms</strong> é classificada como uma <strong>Long Task</strong> pela W3C, degradando a pontuação de <strong>Interaction to Next Paint (INP)</strong> nos Core Web Vitals do Google.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DETECTOR DE PADRÕES DE MEMORY LEAK                 */}
        {/* ========================================================= */}
        {activeTab === 'leak-patterns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SELEÇÃO DO PADRÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Padrões Críticos de Vazamento de Memória
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedLeakPreset('closure')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      selectedLeakPreset === 'closure' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    1. Closure Retida
                  </button>
                  <button
                    onClick={() => setSelectedLeakPreset('listener')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      selectedLeakPreset === 'listener' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    2. Event Listener Órfão
                  </button>
                  <button
                    onClick={() => setSelectedLeakPreset('timer')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      selectedLeakPreset === 'timer' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    3. setInterval Esquecido
                  </button>
                  <button
                    onClick={() => setSelectedLeakPreset('detached-dom')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      selectedLeakPreset === 'detached-dom' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    4. Nós DOM Desanexados
                  </button>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-xs font-bold text-white block">{leakAnalysis.title}</span>
                  <span className="text-[11px] text-rose-400 font-semibold block">{leakAnalysis.severity}</span>
                  <p className="text-xs text-slate-300 pt-1">{leakAnalysis.explanation}</p>
                </div>
              </div>

              {/* COMPARAÇÃO DE CÓDIGO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Código com Vazamento de Memória (Vulnerável)
                  </span>
                  <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-rose-300 font-mono whitespace-pre-wrap overflow-x-auto">
                    {leakAnalysis.badCode}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Código Corrigido (Amigável ao GC)
                    </span>
                    <button
                      onClick={() => copyToClipboard(leakAnalysis.fixedCode, 'fixed-code')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'fixed-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto">
                    {leakAnalysis.fixedCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ALOCADOR E CALCULADORA DE TYPEDARRAYS             */}
        {/* ========================================================= */}
        {activeTab === 'typedarrays' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONFIGURAÇÃO DA ESTRUTURA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Binary className="w-4 h-4" /> Dimensionamento de Buffer Binário
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Tipo de TypedArray:
                  </label>
                  <select
                    value={typedArrayType}
                    onChange={(e) => setTypedArrayType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Uint8Array">Uint8Array (1 byte - Imagens / Bytes puros)</option>
                    <option value="Int16Array">Int16Array (2 bytes - Áudio PCM 16-bit)</option>
                    <option value="Float32Array">Float32Array (4 bytes - WebGL / IA Embeddings)</option>
                    <option value="Float64Array">Float64Array (8 bytes - Precisão Dupla IEEE 754)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Quantidade de Elementos no Array:</span>
                    <span className="text-cyan-400 font-bold">{arrayLength.toLocaleString()} itens</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={10000000}
                    step={100000}
                    value={arrayLength}
                    onChange={(e) => setArrayLength(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>100K itens</span>
                    <span>1 Milhão</span>
                    <span>10 Milhões</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                  Os TypedArrays alocam memória contígua e plana diretamente no ArrayBuffer sem o overhead de wrappers de objetos do JavaScript, permitindo transferências de custo zero via <code>postMessage(buffer, [buffer])</code> (Transferable Objects).
                </div>
              </div>

              {/* COMPARATIVO DE CONSUMO DE MEMÓRIA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Eficiência: TypedArray vs Array de Objetos JS
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                    <span className="text-[10px] text-slate-500 block">TypedArray Plano</span>
                    <span className="text-xl font-bold text-cyan-400">{typedArrayStats.totalMb} MB</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{typedArrayStats.bytesPerElement} bytes/item</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                    <span className="text-[10px] text-slate-500 block">Array de Objetos JS</span>
                    <span className="text-xl font-bold text-rose-400">{typedArrayStats.jsObjArrayMb} MB</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">~56 bytes/objeto</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-300 font-bold block">Redução de Consumo de RAM:</span>
                    <span className="text-[11px] text-slate-400">Elimina pausas do Garbage Collector</span>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-400">-{typedArrayStats.savingsPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SIMULADOR DE MICROTAREFAS VS MACROTAREFAS          */}
        {/* ========================================================= */}
        {activeTab === 'microtasks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CÓDIGO DA SIMULAÇÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Script de Teste do Event Loop
                  </h3>
                  <button
                    onClick={runEventLoopSimulation}
                    disabled={isSimulatingEventLoop}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Executar Código
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-purple-200 font-mono whitespace-pre-wrap">
{`console.log("1. Síncrono 1");

setTimeout(() => {
  console.log("4. Macrotarefa (setTimeout)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Microtarefa (Promise)");
});

console.log("2. Síncrono 2");`}
                </pre>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
                  <span className="font-semibold text-white block">Regra da Especificação HTML:</span>
                  <p className="text-[11px] text-slate-400">
                    O motor V8 executa todo o código síncrono da Call Stack. Em seguida, esvazia <strong>completamente a Microtask Queue</strong> (Promises, <code>queueMicrotask</code>) antes de renderizar a tela e só então processa a próxima <strong>Macrotarefa</strong> da Task Queue (setTimeout, setInterval).
                  </p>
                </div>
              </div>

              {/* TIMELINE DE SAÍDA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-3">
                    Ordem Real de Execução no Console
                  </span>

                  <div className="space-y-2">
                    {executionLog.length === 0 ? (
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500 text-center">
                        Clique em "Executar Código" para rodar a simulação ao vivo.
                      </div>
                    ) : (
                      executionLog.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-2 text-slate-200"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          {item}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-slate-500">
                  Entender o ciclo microtarefa vs macrotarefa previne deadlocks de UI e re-renderizações desnecessárias em React.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
