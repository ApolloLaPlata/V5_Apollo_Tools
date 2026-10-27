'use client';

import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Activity, 
  DollarSign, 
  Database, 
  Clock, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  Cpu, 
  Network, 
  Sliders, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Zap,
  Gauge
} from 'lucide-react';

interface ServerBenchmarksAndMetricsSuiteProps {
  defaultTab?: 'qps-calc' | 'network-transfer' | 'cloud-cost' | 'db-pool' | 'sla-downtime';
}

export const ServerBenchmarksAndMetricsSuite: React.FC<ServerBenchmarksAndMetricsSuiteProps> = ({ defaultTab = 'qps-calc' }) => {
  const [activeTab, setActiveTab] = useState<'qps-calc' | 'network-transfer' | 'cloud-cost' | 'db-pool' | 'sla-downtime'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CALCULADORA DE QPS & CONCORRÊNCIA (LEI DE LITTLE)
  // ==========================================
  const [targetRps, setTargetRps] = useState<number>(500); // 500 req/s
  const [avgLatencyMs, setAvgLatencyMs] = useState<number>(80); // 80 ms
  const [p99Multiplier, setP99Multiplier] = useState<number>(2.5); // p99 = 2.5x p50

  const littleLawCalculations = useMemo(() => {
    // L = lambda * W
    // lambda = targetRps (req/s)
    // W = avgLatencyMs / 1000 (segundos)
    const avgLatencySec = avgLatencyMs / 1000;
    const concurrentRequests = Math.round(targetRps * avgLatencySec);
    const p99LatencyMs = Math.round(avgLatencyMs * p99Multiplier);
    const peakConcurrentRequests = Math.round(targetRps * (p99LatencyMs / 1000));

    // Estimativas por runtime
    const nodeJsEventLoopCapacity = concurrentRequests > 500 ? 'Risco de Event Loop lag se houver CPU bounds' : 'Tranquilo em I/O assíncrono';
    const goGoroutinesMemoryMb = ((peakConcurrentRequests * 2.5) / 1024).toFixed(1); // ~2.5KB por goroutine
    const gunicornWorkersNeeded = Math.max(2, Math.ceil(concurrentRequests / 10)); // sync workers em Python

    return {
      concurrentRequests,
      peakConcurrentRequests,
      p99LatencyMs,
      nodeJsEventLoopCapacity,
      goGoroutinesMemoryMb,
      gunicornWorkersNeeded
    };
  }, [targetRps, avgLatencyMs, p99Multiplier]);

  // ==========================================
  // FERRAMENTA 2: ESTIMADOR DE THROUGHPUT & TRANSFERÊNCIA DE REDE
  // ==========================================
  const [dataSizeValue, setDataSizeValue] = useState<number>(50); // 50 GB
  const [dataSizeUnit, setDataSizeUnit] = useState<'MB' | 'GB' | 'TB'>('GB');
  const [bandwidthSpeedMbps, setBandwidthSpeedMbps] = useState<number>(1000); // 1 Gbps
  const [networkRttMs, setNetworkRttMs] = useState<number>(35); // 35 ms

  const networkCalculations = useMemo(() => {
    // Converte tamanho para Megabits
    let totalMegabytes = dataSizeValue;
    if (dataSizeUnit === 'GB') totalMegabytes = dataSizeValue * 1024;
    else if (dataSizeUnit === 'TB') totalMegabytes = dataSizeValue * 1024 * 1024;

    const totalMegabits = totalMegabytes * 8;
    const effectiveSpeedMbps = bandwidthSpeedMbps * 0.95; // 95% eficiência de TCP/IP
    const transferSeconds = Math.max(0.1, totalMegabits / effectiveSpeedMbps);

    // Formatação de tempo
    const formatDuration = (sec: number) => {
      if (sec < 60) return `${sec.toFixed(1)} segundos`;
      const mins = Math.floor(sec / 60);
      const remSec = Math.floor(sec % 60);
      if (mins < 60) return `${mins}m ${remSec}s`;
      const hrs = Math.floor(mins / 60);
      const remMin = mins % 60;
      if (hrs < 24) return `${hrs}h ${remMin}m`;
      const days = Math.floor(hrs / 24);
      const remHrs = hrs % 24;
      return `${days}d ${remHrs}h`;
    };

    // BDP (Bandwidth-Delay Product) = Throughput (bps) * RTT (s)
    const throughputBps = bandwidthSpeedMbps * 1000000;
    const rttSec = networkRttMs / 1000;
    const bdpBits = throughputBps * rttSec;
    const bdpBytes = bdpBits / 8;
    const bdpKilobytes = (bdpBytes / 1024).toFixed(0);

    return {
      transferTimeFormatted: formatDuration(transferSeconds),
      transferSeconds,
      bdpBytes: Math.round(bdpBytes),
      bdpKilobytes,
      effectiveSpeedMbps: effectiveSpeedMbps.toFixed(0)
    };
  }, [dataSizeValue, dataSizeUnit, bandwidthSpeedMbps, networkRttMs]);

  // ==========================================
  // FERRAMENTA 3: COMPARADOR DE CUSTO CLOUD & GPU H100
  // ==========================================
  const [selectedInstanceType, setSelectedInstanceType] = useState<string>('modal-h100');
  const [runtimeHoursPerDay, setRuntimeHoursPerDay] = useState<number>(4);
  const [billingModel, setBillingModel] = useState<'ondemand' | 'spot' | 'reserved'>('ondemand');

  const instanceCatalog = [
    { id: 'aws-c6i-2xlarge', name: 'AWS c6i.2xlarge (8 vCPU / 16GB)', category: 'CPU General', onDemandHourly: 0.34, spotDiscount: 0.65, resDiscount: 0.38 },
    { id: 'aws-r6i-2xlarge', name: 'AWS r6i.2xlarge (8 vCPU / 64GB)', category: 'CPU Memory', onDemandHourly: 0.504, spotDiscount: 0.68, resDiscount: 0.40 },
    { id: 'aws-g5-2xlarge', name: 'AWS g5.2xlarge (Nvidia A10G 24GB)', category: 'GPU Mid-Tier', onDemandHourly: 1.212, spotDiscount: 0.60, resDiscount: 0.35 },
    { id: 'modal-h100', name: 'Modal H100 SXM (Nvidia 80GB V5 Fleet)', category: 'GPU High-End', onDemandHourly: 4.50, spotDiscount: 0.0, resDiscount: 0.20 },
    { id: 'hetzner-dedicated', name: 'Hetzner AX101 Bare-Metal Dedicado', category: 'Bare Metal', onDemandHourly: 0.25, spotDiscount: 0.0, resDiscount: 0.0 }
  ];

  const cloudCostEstimates = useMemo(() => {
    const inst = instanceCatalog.find(i => i.id === selectedInstanceType) || instanceCatalog[0];
    let effectiveHourlyRate = inst.onDemandHourly;

    if (billingModel === 'spot') {
      effectiveHourlyRate = inst.onDemandHourly * (1 - inst.spotDiscount);
    } else if (billingModel === 'reserved') {
      effectiveHourlyRate = inst.onDemandHourly * (1 - inst.resDiscount);
    }

    const dailyCost = effectiveHourlyRate * runtimeHoursPerDay;
    const monthlyCost = dailyCost * 30.5;
    const annualCost = monthlyCost * 12;

    // Custo por 10.000 requisições considerando tempo médio de 3s por inferência
    const inferencesPerHour = 3600 / 3;
    const costPer10kInferences = (effectiveHourlyRate / inferencesPerHour) * 10000;

    return {
      inst,
      effectiveHourlyRate: effectiveHourlyRate.toFixed(3),
      dailyCost: dailyCost.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2),
      annualCost: annualCost.toFixed(2),
      costPer10kInferences: costPer10kInferences.toFixed(2)
    };
  }, [selectedInstanceType, runtimeHoursPerDay, billingModel]);

  // ==========================================
  // FERRAMENTA 4: DIMENSIONADOR DE CONNECTION POOL DE BANCO
  // ==========================================
  const [dbCpuCores, setDbCpuCores] = useState<number>(8); // 8 cores de CPU
  const [spindleType, setSpindleType] = useState<number>(1); // 1 para SSD NVMe
  const [appInstancesCount, setAppInstancesCount] = useState<number>(4); // 4 instâncias de app

  const connectionPoolMetrics = useMemo(() => {
    // Fórmula oficial HikariCP / PostgreSQL:
    // pool_size = (cpu_cores * 2) + effective_spindle_count
    const optimalTotalPool = (dbCpuCores * 2) + spindleType;
    const poolPerInstance = Math.max(1, Math.floor(optimalTotalPool / appInstancesCount));
    const maxConnectionsDbConfig = Math.round(optimalTotalPool * 1.5 + 20); // margem para superuser/backups

    return {
      optimalTotalPool,
      poolPerInstance,
      maxConnectionsDbConfig
    };
  }, [dbCpuCores, spindleType, appInstancesCount]);

  // ==========================================
  // FERRAMENTA 5: CALCULADORA DE DISPONIBILIDADE SLA & DOWNTIME
  // ==========================================
  const [slaPercentage, setSlaPercentage] = useState<number>(99.9); // 99.9% (Three Nines)
  const [serviceMonthlyFeeBrl, setServiceMonthlyFeeBrl] = useState<number>(2500);

  const slaDowntimeMetrics = useMemo(() => {
    const uptimeRatio = slaPercentage / 100;
    const downtimeRatio = 1 - uptimeRatio;

    const secondsPerDay = 86400;
    const secondsPerWeek = secondsPerDay * 7;
    const secondsPerMonth = secondsPerDay * 30.4375;
    const secondsPerYear = secondsPerDay * 365.25;

    const dayDowntimeSec = secondsPerDay * downtimeRatio;
    const weekDowntimeSec = secondsPerWeek * downtimeRatio;
    const monthDowntimeSec = secondsPerMonth * downtimeRatio;
    const yearDowntimeSec = secondsPerYear * downtimeRatio;

    const formatSec = (sec: number) => {
      if (sec < 60) return `${sec.toFixed(1)} segundos`;
      const mins = Math.floor(sec / 60);
      const remSec = Math.floor(sec % 60);
      if (mins < 60) return `${mins}m ${remSec}s`;
      const hrs = Math.floor(mins / 60);
      const remMin = mins % 60;
      if (hrs < 24) return `${hrs}h ${remMin}m`;
      const days = Math.floor(hrs / 24);
      const remHrs = hrs % 24;
      return `${days}d ${remHrs}h`;
    };

    return {
      dayFormatted: formatSec(dayDowntimeSec),
      weekFormatted: formatSec(weekDowntimeSec),
      monthFormatted: formatSec(monthDowntimeSec),
      yearFormatted: formatSec(yearDowntimeSec),
      penaltyRefund20Percent: (serviceMonthlyFeeBrl * 0.20).toFixed(2),
      penaltyRefund50Percent: (serviceMonthlyFeeBrl * 0.50).toFixed(2)
    };
  }, [slaPercentage, serviceMonthlyFeeBrl]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Cabeçalho da Bancada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Desempenho de Servidor, Benchmarks & Métricas
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  Infra & SRE
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Calculadora QPS/RPS com Lei de Little, estimador de throughput e BDP, custos de nuvem/GPU H100, dimensionador de connection pool e métricas SLA.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Soberania */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
            <Gauge className="w-3.5 h-3.5" />
            Little's Law Engine
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Zero Server Load
          </span>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('qps-calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'qps-calc'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>QPS, RPS & Concorrência</span>
        </button>

        <button
          onClick={() => setActiveTab('network-transfer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'network-transfer'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Throughput & BDP de Rede</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud-cost')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'cloud-cost'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Custo Cloud & GPU H100</span>
        </button>

        <button
          onClick={() => setActiveTab('db-pool')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'db-pool'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Pool de Conexão de Banco</span>
        </button>

        <button
          onClick={() => setActiveTab('sla-downtime')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'sla-downtime'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA & Janela de Downtime</span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: CALCULADORA DE QPS & CONCORRÊNCIA (LEI DE LITTLE)
      ======================================================== */}
      {activeTab === 'qps-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Carga */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Parâmetros de Tráfego
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Taxa Alvo de Requisições (RPS / QPS)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={targetRps}
                  onChange={(e) => setTargetRps(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Latência Média de Atendimento (ms)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={avgLatencyMs}
                  onChange={(e) => setAvgLatencyMs(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Multiplicador de Cauda Longa p99 ({p99Multiplier}x)
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="6.0"
                  step="0.5"
                  value={p99Multiplier}
                  onChange={(e) => setP99Multiplier(parseFloat(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Equação Fundamental (Lei de Little):</p>
                <p className="font-mono text-cyan-400">L = λ × W</p>
                <p className="text-[11px] text-slate-500">Concorrência Ativa = Vazão (req/s) × Tempo de Serviço (segundos).</p>
              </div>
            </div>

            {/* Métricas e Dimensionamento de Servidor */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cards de Concorrência */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Concorrência Média (L)</span>
                  <span className="text-3xl font-extrabold font-mono text-cyan-400">
                    {littleLawCalculations.concurrentRequests}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">conexões simultâneas</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Concorrência de Pico (p99)</span>
                  <span className="text-3xl font-extrabold font-mono text-amber-400">
                    {littleLawCalculations.peakConcurrentRequests}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">em {littleLawCalculations.p99LatencyMs}ms</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Workers Python (Gunicorn)</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">
                    {littleLawCalculations.gunicornWorkersNeeded}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">processos sync</span>
                </div>
              </div>

              {/* Análise de Arquitetura por Runtime */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Dimensionamento por Tecnologia de Backend
                </h4>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Node.js (Event Loop Assíncrono)</span>
                      <span className="text-slate-400 text-[11px]">{littleLawCalculations.nodeJsEventLoopCapacity}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      1 Processo + Cluster
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Go (Goroutines Leves)</span>
                      <span className="text-slate-400 text-[11px]">Memória estimada para goroutines: ~{littleLawCalculations.goGoroutinesMemoryMb} MB</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Alta Eficiência
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Python (FastAPI / Uvicorn ASGI)</span>
                      <span className="text-slate-400 text-[11px]">Recomendado: 4 a 8 workers Uvicorn por pod</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Uvicorn Cluster
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: ESTIMADOR DE THROUGHPUT & TRANSFERÊNCIA DE REDE
      ======================================================== */}
      {activeTab === 'network-transfer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Rede */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4" /> Dados & Enlace
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tamanho da Carga</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={dataSizeValue}
                    onChange={(e) => setDataSizeValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-2/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <select
                    value={dataSizeUnit}
                    onChange={(e) => setDataSizeUnit(e.target.value as any)}
                    className="w-1/3 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Largura de Banda da Conexão</label>
                <select
                  value={bandwidthSpeedMbps}
                  onChange={(e) => setBandwidthSpeedMbps(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={50}>50 Mbps (Banda Larga Básica)</option>
                  <option value={300}>300 Mbps (Fibra Óptica Residencial)</option>
                  <option value={1000}>1 Gbps (1.000 Mbps - Padrão Data Center)</option>
                  <option value={10000}>10 Gbps (10.000 Mbps - Backbone Cloud)</option>
                  <option value={40000}>40 Gbps (Interconexão de Clusters GPU)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Latência RTT (Round Trip Time): {networkRttMs} ms
                </label>
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={networkRttMs}
                  onChange={(e) => setNetworkRttMs(parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>5ms (Local)</span>
                  <span>35ms (BR)</span>
                  <span>130ms (US)</span>
                  <span>250ms (Ásia)</span>
                </div>
              </div>
            </div>

            {/* Resultados de Transferência */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs text-slate-400 block">Tempo Teórico de Transferência</span>
                <span className="text-4xl font-extrabold font-mono text-cyan-400">
                  {networkCalculations.transferTimeFormatted}
                </span>
                <p className="text-xs text-slate-500">
                  Calculado com 95% de rendimento efetivo ({networkCalculations.effectiveSpeedMbps} Mbps) descontando overhead de pacotes TCP/IP.
                </p>
              </div>

              {/* Bandwidth Delay Product (BDP) */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Bandwidth-Delay Product (BDP) & Janela TCP
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {networkCalculations.bdpKilobytes} KB em trânsito
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para que a conexão utilize 100% da largura de banda sem interrupções de espera por ACK, a janela de recepção TCP (TCP Receive Window - <code>net.ipv4.tcp_rmem</code>) deve ser de pelo menos <strong>{networkCalculations.bdpKilobytes} KB</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: COMPARADOR DE CUSTO CLOUD & GPU H100
      ======================================================== */}
      {activeTab === 'cloud-cost' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Custo */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Configuração da Frota
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Instância / GPU</label>
                <select
                  value={selectedInstanceType}
                  onChange={(e) => setSelectedInstanceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {instanceCatalog.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Tempo Ativo por Dia</label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{runtimeHoursPerDay}h/dia</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={runtimeHoursPerDay}
                  onChange={(e) => setRuntimeHoursPerDay(parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Modelo de Contratação</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setBillingModel('ondemand')}
                    className={`py-1.5 px-2 rounded-lg font-medium border ${
                      billingModel === 'ondemand'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    On-Demand
                  </button>
                  <button
                    onClick={() => setBillingModel('spot')}
                    className={`py-1.5 px-2 rounded-lg font-medium border ${
                      billingModel === 'spot'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Spot (-60%)
                  </button>
                  <button
                    onClick={() => setBillingModel('reserved')}
                    className={`py-1.5 px-2 rounded-lg font-medium border ${
                      billingModel === 'reserved'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Reserved
                  </button>
                </div>
              </div>
            </div>

            {/* Estimativa de Custos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Taxa Horária Efetiva</span>
                  <span className="text-3xl font-extrabold font-mono text-cyan-400">
                    ${cloudCostEstimates.effectiveHourlyRate}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ hora</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Custo Mensal Estimado</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">
                    ${cloudCostEstimates.monthlyCost}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ mês</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Custo por 10k Inferências</span>
                  <span className="text-3xl font-extrabold font-mono text-amber-400">
                    ${cloudCostEstimates.costPer10kInferences}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">USD</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-white block">Arquitetura V5 Modal H100 Serverless:</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Diferente de instâncias 24/7 ligadas na AWS que custam mais de $3.000/mês ociosas, o despacho na frota <strong>Modal GPU</strong> da Holding V5 escala a zero (zero custo quando sem uso) com inicialização rápida de 2.8s, cobrando frações exatas de centavos por segundo de renderização.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: DIMENSIONADOR DE CONNECTION POOL DE BANCO
      ======================================================== */}
      {activeTab === 'db-pool' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parâmetros de Banco */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4" /> Hardware do Banco
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cores de CPU do Banco (vCPU)</label>
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={dbCpuCores}
                  onChange={(e) => setDbCpuCores(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Armazenamento / Discos</label>
                <select
                  value={spindleType}
                  onChange={(e) => setSpindleType(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={1}>SSD NVMe Moderno / AWS gp3 (Spindle = 1)</option>
                  <option value={2}>RAID 0/10 de SSDs Enterprise (Spindle = 2)</option>
                  <option value={4}>Array de Alto Desempenho SAN (Spindle = 4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Instâncias da Aplicação (Pods / Apps)</label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={appInstancesCount}
                  onChange={(e) => setAppInstancesCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Resultados do Pool */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">Tamanho Ótimo do Pool Total</span>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">
                    {connectionPoolMetrics.optimalTotalPool} conexões
                  </div>
                  <span className="text-xs text-slate-500 block">Fórmula HikariCP: ((CPU × 2) + Spindle)</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">Pool por Instância de App</span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">
                    {connectionPoolMetrics.poolPerInstance} conexões
                  </div>
                  <span className="text-xs text-slate-500 block">Distribuição ideal entre os {appInstancesCount} nós</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Alerta Anti-Saturação de Banco:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mais conexões <strong>NÃO SIGNIFICAM</strong> mais velocidade. Configurar pools de 100 conexões para um servidor de 8 cores obriga a CPU a gastar mais tempo chaveando contexto (Context Switching) do que processando consultas SQL, gerando latências gigantescas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: CALCULADORA DE DISPONIBILIDADE SLA & DOWNTIME
      ======================================================== */}
      {activeTab === 'sla-downtime' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de SLA */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Nível de Serviço (SLA)
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Porcentagem de Uptime Garantida
                </label>
                <select
                  value={slaPercentage}
                  onChange={(e) => setSlaPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value={99.0}>99.0% (Dois Noves - Padrão Básico)</option>
                  <option value={99.5}>99.5% (SLA Convencional)</option>
                  <option value={99.9}>99.9% (Três Noves - Cloud Padrão)</option>
                  <option value={99.95}>99.95% (Alta Disponibilidade)</option>
                  <option value={99.99}>99.99% (Quatro Noves - Missão Crítica)</option>
                  <option value={99.999}>99.999% (Cinco Noves - Telecom Elite)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mensalidade do Contrato (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={serviceMonthlyFeeBrl}
                  onChange={(e) => setServiceMonthlyFeeBrl(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Janelas de Downtime Toleradas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Janela Máxima de Inatividade Tolerada ({slaPercentage}%)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">POR DIA</span>
                    <span className="text-cyan-400 font-bold">{slaDowntimeMetrics.dayFormatted}</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">POR SEMANA</span>
                    <span className="text-cyan-400 font-bold">{slaDowntimeMetrics.weekFormatted}</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">POR MÊS</span>
                    <span className="text-amber-400 font-bold">{slaDowntimeMetrics.monthFormatted}</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">POR ANO</span>
                    <span className="text-rose-400 font-bold">{slaDowntimeMetrics.yearFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Multas Contratuais */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Simulação de Crédito de Violação de SLA (Service Level Agreement):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Quebra Nível 1 (20% Reembolso)</span>
                    <span className="text-amber-400 font-bold">R$ {slaDowntimeMetrics.penaltyRefund20Percent}</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Quebra Crítica (50% Reembolso)</span>
                    <span className="text-rose-400 font-bold">R$ {slaDowntimeMetrics.penaltyRefund50Percent}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
