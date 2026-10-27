'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Cpu, 
  Layers, 
  Mic, 
  Binary, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  DollarSign, 
  Sliders, 
  Zap, 
  HardDrive, 
  Maximize2, 
  Gauge, 
  ArrowRight,
  TrendingDown,
  Volume2,
  FileText,
  Search
} from 'lucide-react';

interface AiTelemetryAndTokenEconomicsSuiteProps {
  defaultTab?: 'token-pricing' | 'vram-estimator' | 'context-visualizer' | 'tts-stt' | 'rag-similarity';
}

interface LlmPreset {
  name: string;
  provider: string;
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion: number;
  contextWindow: number;
  description: string;
}

const LLM_PRESETS: LlmPreset[] = [
  {
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    cachedInputPerMillion: 1.25,
    contextWindow: 128000,
    description: 'Multimodal carro-chefe para raciocínio complexo e coding avançado.'
  },
  {
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    cachedInputPerMillion: 0.30,
    contextWindow: 200000,
    description: 'Padrão ouro em engenharia de software e análise técnica aprofundada.'
  },
  {
    name: 'Google Gemini 2.0 Flash',
    provider: 'Google',
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    cachedInputPerMillion: 0.025,
    contextWindow: 1048576,
    description: 'Ultra-rápido, baixíssima latência e 1M de tokens com custo mínimo.'
  },
  {
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google',
    inputPerMillion: 1.25,
    outputPerMillion: 5.00,
    cachedInputPerMillion: 0.3125,
    contextWindow: 2097152,
    description: 'Contexto gigante de 2M tokens ideal para bases inteiras de código.'
  },
  {
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    inputPerMillion: 0.14,
    outputPerMillion: 0.28,
    cachedInputPerMillion: 0.014,
    contextWindow: 64000,
    description: 'Arquitetura MoE soberana com altíssimo custo-benefício.'
  },
  {
    name: 'Meta Llama 3.3 70B (Serverless)',
    provider: 'Together / Groq',
    inputPerMillion: 0.59,
    outputPerMillion: 0.79,
    cachedInputPerMillion: 0.59,
    contextWindow: 128000,
    description: 'Open weights de alta performance em provedores serverless.'
  },
  {
    name: 'MiniMax H3 (V5 Apollo API)',
    provider: 'V5 Apollo Gateway',
    inputPerMillion: 0.20,
    outputPerMillion: 0.60,
    cachedInputPerMillion: 0.10,
    contextWindow: 128000,
    description: 'Acelerado na frota Modal GPU H100 com tier dedicado.'
  }
];

export const AiTelemetryAndTokenEconomicsSuite: React.FC<AiTelemetryAndTokenEconomicsSuiteProps> = ({ 
  defaultTab = 'token-pricing' 
}) => {
  const [activeTab, setActiveTab] = useState<'token-pricing' | 'vram-estimator' | 'context-visualizer' | 'tts-stt' | 'rag-similarity'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CALCULADORA DE TOKENS & CUSTOS LLM
  // ==========================================
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const [dailyRequests, setDailyRequests] = useState<number>(3000);
  const [avgInputTokens, setAvgInputTokens] = useState<number>(1800);
  const [avgOutputTokens, setAvgOutputTokens] = useState<number>(450);
  const [cacheHitPercent, setCacheHitPercent] = useState<number>(50);
  const [brlExchangeRate, setBrlExchangeRate] = useState<number>(5.80);

  const tokenCostCalculations = useMemo(() => {
    const model = LLM_PRESETS[selectedModelIndex] || LLM_PRESETS[0];

    const inputCachedTokens = Math.round(avgInputTokens * (cacheHitPercent / 100));
    const inputUncachedTokens = avgInputTokens - inputCachedTokens;

    // Custos por requisição
    const costInputUncachedReq = (inputUncachedTokens / 1_000_000) * model.inputPerMillion;
    const costInputCachedReq = (inputCachedTokens / 1_000_000) * model.cachedInputPerMillion;
    const costOutputReq = (avgOutputTokens / 1_000_000) * model.outputPerMillion;

    const totalCostPerReq = costInputUncachedReq + costInputCachedReq + costOutputReq;

    // Sem cache (para calcular savings)
    const costWithoutCacheReq = ((avgInputTokens / 1_000_000) * model.inputPerMillion) + costOutputReq;
    const savingsPerReq = Math.max(0, costWithoutCacheReq - totalCostPerReq);

    // Diário e Mensal
    const dailyCostUsd = totalCostPerReq * dailyRequests;
    const monthlyCostUsd = dailyCostUsd * 30;
    const monthlyCostBrl = monthlyCostUsd * brlExchangeRate;
    const monthlySavingsUsd = savingsPerReq * dailyRequests * 30;

    // Comparação de custo entre todos os modelos
    const comparison = LLM_PRESETS.map((m) => {
      const inUncached = avgInputTokens * (1 - cacheHitPercent / 100);
      const inCached = avgInputTokens * (cacheHitPercent / 100);
      const reqCost = ((inUncached / 1_000_000) * m.inputPerMillion) + 
                      ((inCached / 1_000_000) * m.cachedInputPerMillion) + 
                      ((avgOutputTokens / 1_000_000) * m.outputPerMillion);
      return {
        name: m.name,
        provider: m.provider,
        costPerReq: reqCost,
        monthlyUsd: reqCost * dailyRequests * 30
      };
    });

    return {
      model,
      totalCostPerReq,
      dailyCostUsd,
      monthlyCostUsd,
      monthlyCostBrl,
      monthlySavingsUsd,
      savingsPercent: costWithoutCacheReq > 0 ? (savingsPerReq / costWithoutCacheReq) * 100 : 0,
      comparison
    };
  }, [selectedModelIndex, dailyRequests, avgInputTokens, avgOutputTokens, cacheHitPercent, brlExchangeRate]);

  // ==========================================
  // FERRAMENTA 2: ESTIMADOR DE VRAM DE GPU (LLM & INFERÊNCIA)
  // ==========================================
  const [modelParamsBillion, setModelParamsBillion] = useState<number>(8); // 8B (ex: Llama 3.1)
  const [precisionType, setPrecisionType] = useState<'fp16' | 'int8' | 'int4' | 'q2k'>('fp16');
  const [activeContextTokens, setActiveContextTokens] = useState<number>(8192);
  const [concurrentBatchSize, setConcurrentBatchSize] = useState<number>(1);
  const [hiddenSizeDim, setHiddenSizeDim] = useState<number>(4096);
  const [modelNumLayers, setModelNumLayers] = useState<number>(32);

  const vramCalculations = useMemo(() => {
    // Bytes por parâmetro dependendo da quantização
    let bytesPerParam = 2.0; // fp16 / bf16
    let precisionName = 'FP16 / BF16 (16-bit)';
    if (precisionType === 'int8') {
      bytesPerParam = 1.0;
      precisionName = 'INT8 / Q8_0 (8-bit)';
    } else if (precisionType === 'int4') {
      bytesPerParam = 0.55; // 4-bit + metadados de escala
      precisionName = 'INT4 / Q4_K_M (4-bit)';
    } else if (precisionType === 'q2k') {
      bytesPerParam = 0.35;
      precisionName = 'Q2_K Extremamente Compacto (2-bit)';
    }

    // 1. Memória dos Pesos (Weights) com 12% de overhead CUDA/runtime
    const weightsGb = (modelParamsBillion * 1e9 * bytesPerParam) / (1024 ** 3);
    const weightsOverheadGb = weightsGb * 1.12;

    // 2. KV Cache por requisição: 2 * layers * hidden_dim * context_len * 2 bytes (FP16 KV Cache padrão)
    // Se GQA (Grouped Query Attention) for usado, divide por 4 a 8. Assumindo GQA de 8x.
    const gqaRatio = 8;
    const kvCacheBytesPerToken = (2 * modelNumLayers * hiddenSizeDim * 2) / gqaRatio;
    const totalKvCacheGb = (kvCacheBytesPerToken * activeContextTokens * concurrentBatchSize) / (1024 ** 3);

    // 3. Buffer de ativações e CUDA Context base (~1.2 GB)
    const cudaBaseOverheadGb = 1.25;

    // VRAM Total Requerida
    const totalRequiredVramGb = weightsOverheadGb + totalKvCacheGb + cudaBaseOverheadGb;

    // Sugestão de Placa
    let gpuRecommendation = '';
    let gpuFits = true;
    if (totalRequiredVramGb <= 12) {
      gpuRecommendation = 'RTX 3060 (12GB) ou RTX 4070 (12GB)';
    } else if (totalRequiredVramGb <= 16) {
      gpuRecommendation = 'RTX 4060 Ti 16GB ou RTX 4080 (16GB)';
    } else if (totalRequiredVramGb <= 24) {
      gpuRecommendation = 'RTX 3090 / RTX 4090 (24GB VRAM)';
    } else if (totalRequiredVramGb <= 48) {
      gpuRecommendation = '2x RTX 3090/4090 (48GB) ou NVIDIA RTX A6000 (48GB)';
    } else if (totalRequiredVramGb <= 80) {
      gpuRecommendation = 'NVIDIA A100 / H100 (80GB SXM5/PCIe)';
    } else {
      const numH100 = Math.ceil(totalRequiredVramGb / 80);
      gpuRecommendation = `Cluster Distribuído com ${numH100}x H100 80GB (vLLM / Tensor Parallelism)`;
      gpuFits = false;
    }

    return {
      precisionName,
      weightsGb: weightsOverheadGb.toFixed(2),
      kvCacheGb: totalKvCacheGb.toFixed(2),
      cudaBaseGb: cudaBaseOverheadGb.toFixed(2),
      totalVramGb: totalRequiredVramGb.toFixed(2),
      gpuRecommendation,
      gpuFits
    };
  }, [modelParamsBillion, precisionType, activeContextTokens, concurrentBatchSize, hiddenSizeDim, modelNumLayers]);

  // ==========================================
  // FERRAMENTA 3: VISUALIZADOR DE JANELA DE CONTEXTO
  // ==========================================
  const [maxWindowTokens, setMaxWindowTokens] = useState<number>(32768);
  const [systemPromptTokens, setSystemPromptTokens] = useState<number>(2400);
  const [chatHistoryTokens, setChatHistoryTokens] = useState<number>(6800);
  const [ragContextTokens, setRagContextTokens] = useState<number>(14200);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(4096);

  const contextWindowCalculations = useMemo(() => {
    const totalConsumed = systemPromptTokens + chatHistoryTokens + ragContextTokens + maxOutputTokens;
    const remainingFreeTokens = Math.max(0, maxWindowTokens - totalConsumed);
    const isOverflowing = totalConsumed > maxWindowTokens;
    const overflowAmount = Math.max(0, totalConsumed - maxWindowTokens);

    const pctSystem = Math.min(100, (systemPromptTokens / maxWindowTokens) * 100);
    const pctHistory = Math.min(100, (chatHistoryTokens / maxWindowTokens) * 100);
    const pctRag = Math.min(100, (ragContextTokens / maxWindowTokens) * 100);
    const pctOutput = Math.min(100, (maxOutputTokens / maxWindowTokens) * 100);
    const pctFree = Math.max(0, (remainingFreeTokens / maxWindowTokens) * 100);

    // Avaliação de risco 'Lost in the Middle'
    let attentionRisk = 'Baixo';
    let attentionDesc = 'Contexto compacto. O modelo consegue correlacionar perfeitamente o início e o fim da mensagem.';
    if (totalConsumed > 64000) {
      attentionRisk = 'Alto';
      attentionDesc = 'Documentos muito longos (>64k) sofrem degradação de atenção no miolo. Priorize chunks menores ou re-ranking.';
    } else if (totalConsumed > 24000) {
      attentionRisk = 'Moderado';
      attentionDesc = 'Atenção boa, mas posicione as instruções cruciais sempre no System Prompt ou logo antes da pergunta final.';
    }

    return {
      totalConsumed,
      remainingFreeTokens,
      isOverflowing,
      overflowAmount,
      pctSystem,
      pctHistory,
      pctRag,
      pctOutput,
      pctFree,
      attentionRisk,
      attentionDesc
    };
  }, [maxWindowTokens, systemPromptTokens, chatHistoryTokens, ragContextTokens, maxOutputTokens]);

  // ==========================================
  // FERRAMENTA 4: ESTIMADOR DE ÁUDIO TTS / STT
  // ==========================================
  const [inputTextSample, setInputTextSample] = useState<string>(
    'Bem-vindo ao ecossistema soberano V5 Apollo Tools. Nossas ferramentas rodam com privacidade total e aceleração de IA sem atrito, fornecendo alta produtividade para desenvolvedores, criadores e empreendedores.'
  );
  const [wordsPerMinute, setWordsPerMinute] = useState<number>(145); // Ritmo padrão em português
  const [ttsEngine, setTtsEngine] = useState<'elevenlabs' | 'openai-tts' | 'cartesia' | 'whisper-stt' | 'kokoro'>(
    'openai-tts'
  );

  const ttsCalculations = useMemo(() => {
    const charCount = inputTextSample.length;
    const words = inputTextSample.trim() ? inputTextSample.trim().split(/\s+/).length : 0;
    
    // Duração em minutos e segundos
    const durationMinutes = words > 0 ? words / wordsPerMinute : 0;
    const durationSeconds = Math.round(durationMinutes * 60);
    const minsPart = Math.floor(durationSeconds / 60);
    const secsPart = durationSeconds % 60;
    const formattedDuration = `${minsPart}m ${secsPart.toString().padStart(2, '0')}s`;

    // Custo por engine
    let costPerUnit = 0;
    let engineLabel = '';
    let pricingUnit = '';

    if (ttsEngine === 'elevenlabs') {
      costPerUnit = (charCount / 1000) * 0.30; // $0.30 / 1k chars Turbo
      engineLabel = 'ElevenLabs Turbo v2.5 ($0.30 / 1k chars)';
      pricingUnit = 'Por caractere';
    } else if (ttsEngine === 'openai-tts') {
      costPerUnit = (charCount / 1000) * 0.015; // $0.015 / 1k chars
      engineLabel = 'OpenAI TTS-1 Standard ($0.015 / 1k chars)';
      pricingUnit = 'Por caractere';
    } else if (ttsEngine === 'cartesia') {
      costPerUnit = (charCount / 1000) * 0.040; // $0.040 / 1k chars
      engineLabel = 'Cartesia Sonic Ultra-Low Latency ($0.040 / 1k chars)';
      pricingUnit = 'Por caractere';
    } else if (ttsEngine === 'whisper-stt') {
      costPerUnit = durationMinutes * 0.006; // $0.006 / minuto
      engineLabel = 'OpenAI Whisper STT Transcrição ($0.006 / minuto)';
      pricingUnit = 'Por minuto de áudio';
    } else if (ttsEngine === 'kokoro') {
      costPerUnit = (charCount / 1000) * 0.005; // $0.005 / 1k chars
      engineLabel = 'Kokoro TTS Open-Source ($0.005 / 1k chars em GPU)';
      pricingUnit = 'Por caractere';
    }

    const costBatch100 = costPerUnit * 100;
    const costBatch1000 = costPerUnit * 1000;

    return {
      charCount,
      words,
      formattedDuration,
      totalSeconds: durationSeconds,
      costPerUnit,
      engineLabel,
      pricingUnit,
      costBatch100,
      costBatch1000
    };
  }, [inputTextSample, wordsPerMinute, ttsEngine]);

  // ==========================================
  // FERRAMENTA 5: CALCULADORA DE SIMILARIDADE SEMÂNTICA RAG
  // ==========================================
  const [vectorAStr, setVectorAStr] = useState<string>('0.74, 0.12, 0.88, 0.35, 0.91, 0.05, 0.62, 0.44');
  const [vectorBStr, setVectorBStr] = useState<string>('0.71, 0.15, 0.82, 0.38, 0.89, 0.08, 0.58, 0.49');

  const ragSimilarityCalculations = useMemo(() => {
    try {
      const vecA = vectorAStr.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
      const vecB = vectorBStr.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));

      if (vecA.length === 0 || vecB.length === 0) {
        return { error: 'Insira números separados por vírgula em ambos os vetores.' };
      }

      if (vecA.length !== vecB.length) {
        return { 
          error: `Dimensões incompatíveis! Vetor A tem ${vecA.length} dimensões e Vetor B tem ${vecB.length}. Vetores devem ter mesmo tamanho.` 
        };
      }

      // 1. Dot Product: sum(a_i * b_i)
      let dotProduct = 0;
      let magA = 0;
      let magB = 0;
      let euclideanSum = 0;
      let manhattanSum = 0;

      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
        euclideanSum += Math.pow(vecA[i] - vecB[i], 2);
        manhattanSum += Math.abs(vecA[i] - vecB[i]);
      }

      const magnitudeA = Math.sqrt(magA);
      const magnitudeB = Math.sqrt(magB);

      // Cosine Similarity
      const cosineSimilarity = (magnitudeA > 0 && magnitudeB > 0) 
        ? dotProduct / (magnitudeA * magnitudeB) 
        : 0;

      // Distância Euclidiana
      const euclideanDistance = Math.sqrt(euclideanSum);

      // Interpretação Semântica
      let semanticLabel = 'Neutro / Pouca Relação';
      let matchColor = 'text-amber-400';
      if (cosineSimilarity >= 0.90) {
        semanticLabel = 'Quase Idêntico (Match Semântico Forte)';
        matchColor = 'text-emerald-400';
      } else if (cosineSimilarity >= 0.75) {
        semanticLabel = 'Alta Similaridade (Chunk Relevante no RAG)';
        matchColor = 'text-cyan-400';
      } else if (cosineSimilarity >= 0.50) {
        semanticLabel = 'Moderadamente Relacionado';
        matchColor = 'text-blue-400';
      } else if (cosineSimilarity < 0.20) {
        semanticLabel = 'Disperso / Não Relacionado';
        matchColor = 'text-rose-400';
      }

      return {
        dimensions: vecA.length,
        cosineSimilarity: cosineSimilarity.toFixed(4),
        cosinePercent: (Math.max(0, cosineSimilarity) * 100).toFixed(1),
        dotProduct: dotProduct.toFixed(4),
        euclideanDistance: euclideanDistance.toFixed(4),
        manhattanDistance: manhattanSum.toFixed(4),
        magnitudeA: magnitudeA.toFixed(4),
        magnitudeB: magnitudeB.toFixed(4),
        semanticLabel,
        matchColor,
        error: null
      };
    } catch {
      return { error: 'Falha ao processar os vetores de embedding.' };
    }
  }, [vectorAStr, vectorBStr]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HEADER DA SUÍTE */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Telemetria de IA, LLMs & GPU Metrics
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Etapa 57
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Calculadoras financeiras de tokens, dimensionamento de VRAM CUDA, análise de janela de contexto e similaridade RAG.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('token-pricing')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'token-pricing'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Preço & Custos LLM
          </button>
          <button
            onClick={() => setActiveTab('vram-estimator')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'vram-estimator'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            VRAM & GPU CUDA
          </button>
          <button
            onClick={() => setActiveTab('context-visualizer')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'context-visualizer'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Janela de Contexto
          </button>
          <button
            onClick={() => setActiveTab('tts-stt')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'tts-stt'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Áudio TTS / STT
          </button>
          <button
            onClick={() => setActiveTab('rag-similarity')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'rag-similarity'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Similaridade RAG
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ========================================================= */}
        {/* TAB 1: PREÇO & CUSTOS LLM (ROI & FinOps de IA)           */}
        {/* ========================================================= */}
        {activeTab === 'token-pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PAINEL DE CONTROLES */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Parâmetros de Volume & Modelo
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Modelo de Inteligência Artificial:
                  </label>
                  <select
                    value={selectedModelIndex}
                    onChange={(e) => setSelectedModelIndex(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {LLM_PRESETS.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {tokenCostCalculations.model.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">
                      Reqs / Dia:
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={dailyRequests}
                      onChange={(e) => setDailyRequests(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">
                      Câmbio USD/BRL:
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      value={brlExchangeRate}
                      onChange={(e) => setBrlExchangeRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Média de Tokens de Input:</span>
                    <span className="text-cyan-400 font-bold">{avgInputTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={32000}
                    step={200}
                    value={avgInputTokens}
                    onChange={(e) => setAvgInputTokens(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Média de Tokens de Output:</span>
                    <span className="text-purple-400 font-bold">{avgOutputTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={8192}
                    step={50}
                    value={avgOutputTokens}
                    onChange={(e) => setAvgOutputTokens(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Prompt Cache Hit (%):</span>
                    <span className="text-emerald-400 font-bold">{cacheHitPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={95}
                    step={5}
                    value={cacheHitPercent}
                    onChange={(e) => setCacheHitPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Prompt caching reduz custos de input em até 75% a 90% para o System Prompt.
                  </p>
                </div>
              </div>

              {/* PAINEL DE RESULTADOS E MÉTRICAS */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Custo por Requisição:</span>
                    <div className="text-2xl font-bold text-cyan-400">
                      ${tokenCostCalculations.totalCostPerReq < 0.001 
                        ? tokenCostCalculations.totalCostPerReq.toFixed(6) 
                        : tokenCostCalculations.totalCostPerReq.toFixed(4)}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      ~R$ {(tokenCostCalculations.totalCostPerReq * brlExchangeRate).toFixed(4)} / chamada
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Fatura Mensal Projetada (30d):</span>
                    <div className="text-2xl font-bold text-white">
                      ${tokenCostCalculations.monthlyCostUsd.toFixed(2)}
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold">
                      R$ {tokenCostCalculations.monthlyCostBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Economia com Caching:</span>
                    <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                      <TrendingDown className="w-5 h-5 text-emerald-400" />
                      ${tokenCostCalculations.monthlySavingsUsd.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {tokenCostCalculations.savingsPercent.toFixed(1)}% de desconto ativo
                    </span>
                  </div>
                </div>

                {/* TABELA COMPARATIVA DE MERCADO */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Comparativo de Custo Mensal com a Mesma Carga ({dailyRequests.toLocaleString()} reqs/dia)
                    </h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(tokenCostCalculations.comparison, null, 2), 'table-json')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-700"
                    >
                      {copiedKey === 'table-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar JSON
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-3">Modelo</th>
                          <th className="py-2 px-3">Provedor</th>
                          <th className="py-2 px-3">Por Chamada ($)</th>
                          <th className="py-2 px-3">Mês (USD)</th>
                          <th className="py-2 px-3">Mês (BRL)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {tokenCostCalculations.comparison.map((item, i) => (
                          <tr key={i} className={`hover:bg-slate-900/60 ${item.name === tokenCostCalculations.model.name ? 'bg-cyan-950/20 font-medium' : ''}`}>
                            <td className="py-2 px-3 text-white flex items-center gap-1.5">
                              {item.name === tokenCostCalculations.model.name && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              )}
                              {item.name}
                            </td>
                            <td className="py-2 px-3 text-slate-400">{item.provider}</td>
                            <td className="py-2 px-3 text-slate-300">${item.costPerReq.toFixed(5)}</td>
                            <td className="py-2 px-3 text-white font-semibold">${item.monthlyUsd.toFixed(2)}</td>
                            <td className="py-2 px-3 text-emerald-400">
                              R$ {(item.monthlyUsd * brlExchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ESTIMADOR DE VRAM DE GPU (CUDA & Infeência)       */}
        {/* ========================================================= */}
        {activeTab === 'vram-estimator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CONTROLES DA ARQUITETURA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Parâmetros do Modelo & Quantização
                </h3>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Parâmetros do Modelo:</span>
                    <span className="text-purple-400 font-bold">{modelParamsBillion}B (Biliões)</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={72}
                    step={1}
                    value={modelParamsBillion}
                    onChange={(e) => setModelParamsBillion(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <button onClick={() => setModelParamsBillion(7)} className="hover:text-cyan-400">7B / 8B</button>
                    <button onClick={() => setModelParamsBillion(14)} className="hover:text-cyan-400">14B</button>
                    <button onClick={() => setModelParamsBillion(32)} className="hover:text-cyan-400">32B (Qwen)</button>
                    <button onClick={() => setModelParamsBillion(70)} className="hover:text-cyan-400">70B (Llama)</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Formato de Quantização:
                  </label>
                  <select
                    value={precisionType}
                    onChange={(e) => setPrecisionType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="fp16">FP16 / BF16 (16-bit) - Alta fidelidade nativa</option>
                    <option value="int8">INT8 / Q8_0 (8-bit) - Equilíbrio ótimo</option>
                    <option value="int4">INT4 / Q4_K_M (4-bit) - Padrão ouro local GGUF</option>
                    <option value="q2k">Q2_K (2-bit) - Perda acentuada de raciocínio</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Contexto Ativo (Tokens):</span>
                    <span className="text-cyan-400 font-bold">{activeContextTokens.toLocaleString()} tokens</span>
                  </div>
                  <select
                    value={activeContextTokens}
                    onChange={(e) => setActiveContextTokens(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={2048}>2.048 tokens (2K)</option>
                    <option value={4096}>4.096 tokens (4K)</option>
                    <option value={8192}>8.192 tokens (8K)</option>
                    <option value={16384}>16.384 tokens (16K)</option>
                    <option value={32768}>32.768 tokens (32K)</option>
                    <option value={65536}>65.536 tokens (64K)</option>
                    <option value={131072}>131.072 tokens (128K)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Requisições Simultâneas (Batch):</span>
                    <span className="text-emerald-400 font-bold">{concurrentBatchSize} req(s)</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={16}
                    step={1}
                    value={concurrentBatchSize}
                    onChange={(e) => setConcurrentBatchSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* RESULTADOS E VRAM TOTAL */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      VRAM Total Mínima Recomendada
                    </span>
                    <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">
                      {vramCalculations.precisionName}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <div className="text-4xl font-extrabold text-white">
                      {vramCalculations.totalVramGb} <span className="text-xl font-normal text-slate-400">GB VRAM</span>
                    </div>
                    {vramCalculations.gpuFits ? (
                      <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cabe em GPU Única
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 bg-rose-950/50 border border-rose-800 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Requer Múltiplas GPUs
                      </span>
                    )}
                  </div>

                  {/* DECOMPOSIÇÃO DE VRAM */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Pesos do Modelo:</span>
                      <div className="text-lg font-bold text-purple-400">{vramCalculations.weightsGb} GB</div>
                      <span className="text-[10px] text-slate-500">Com overhead de tensores</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <span className="text-[11px] text-slate-400 block mb-0.5">KV Cache (Contexto):</span>
                      <div className="text-lg font-bold text-cyan-400">{vramCalculations.kvCacheGb} GB</div>
                      <span className="text-[10px] text-slate-500">Batch {concurrentBatchSize} x {activeContextTokens} tkn</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <span className="text-[11px] text-slate-400 block mb-0.5">CUDA Context Base:</span>
                      <div className="text-lg font-bold text-slate-300">{vramCalculations.cudaBaseGb} GB</div>
                      <span className="text-[10px] text-slate-500">Drivers & PyTorch context</span>
                    </div>
                  </div>

                  {/* RECOMENDAÇÃO DE HARDWARE */}
                  <div className="bg-purple-950/20 border border-purple-800/50 rounded-xl p-4 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                        Recomendação de Hardware / Nuvem
                      </h4>
                      <p className="text-sm text-purple-200 font-semibold mb-1">
                        {vramCalculations.gpuRecommendation}
                      </p>
                      <p className="text-xs text-slate-400">
                        Para inferência em produção com streaming de tokens e alta vazão (throughput), 
                        recomenda-se utilizar engines como <strong>vLLM</strong> ou <strong>TensorRT-LLM</strong> com PagedAttention ativado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VISUALIZADOR DE JANELA DE CONTEXTO                */}
        {/* ========================================================= */}
        {activeTab === 'context-visualizer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ENTRADAS DA JANELA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Composição do Prompt
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Janela Máxima do Modelo:
                  </label>
                  <select
                    value={maxWindowTokens}
                    onChange={(e) => setMaxWindowTokens(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={8192}>8.192 tokens (8K)</option>
                    <option value={16384}>16.384 tokens (16K)</option>
                    <option value={32768}>32.768 tokens (32K)</option>
                    <option value={65536}>65.536 tokens (64K)</option>
                    <option value={128000}>128.000 tokens (128K - GPT-4o / Llama 3)</option>
                    <option value={200000}>200.000 tokens (200K - Claude 3.5)</option>
                    <option value={1000000}>1.000.000 tokens (1M - Gemini 2.0)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>System Prompt & Regras:</span>
                    <span className="text-purple-400 font-bold">{systemPromptTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={16000}
                    step={100}
                    value={systemPromptTokens}
                    onChange={(e) => setSystemPromptTokens(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Histórico de Chat (Turnos):</span>
                    <span className="text-cyan-400 font-bold">{chatHistoryTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={64000}
                    step={200}
                    value={chatHistoryTokens}
                    onChange={(e) => setChatHistoryTokens(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Documentos RAG Injetados:</span>
                    <span className="text-blue-400 font-bold">{ragContextTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={96000}
                    step={500}
                    value={ragContextTokens}
                    onChange={(e) => setRagContextTokens(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Tokens Reservados para Resposta:</span>
                    <span className="text-amber-400 font-bold">{maxOutputTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min={512}
                    max={16384}
                    step={256}
                    value={maxOutputTokens}
                    onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* VISUALIZAÇÃO GRÁFICA DA BARRA */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Ocupação da Janela de Contexto ({contextWindowCalculations.totalConsumed.toLocaleString()} / {maxWindowTokens.toLocaleString()} tokens)
                    </span>
                    {contextWindowCalculations.isOverflowing ? (
                      <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">
                        Estouro de Janela (+{contextWindowCalculations.overflowAmount.toLocaleString()} tokens)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                        {((contextWindowCalculations.totalConsumed / maxWindowTokens) * 100).toFixed(1)}% Utilizado
                      </span>
                    )}
                  </div>

                  {/* BARRA PROPORCIONAL DE TOKENS */}
                  <div className="h-9 w-full bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800 mb-6 p-0.5">
                    <div
                      style={{ width: `${contextWindowCalculations.pctSystem}%` }}
                      className="h-full bg-purple-500 transition-all relative group cursor-pointer"
                      title={`System Prompt: ${systemPromptTokens} tokens`}
                    />
                    <div
                      style={{ width: `${contextWindowCalculations.pctHistory}%` }}
                      className="h-full bg-cyan-500 transition-all relative group cursor-pointer"
                      title={`Histórico de Chat: ${chatHistoryTokens} tokens`}
                    />
                    <div
                      style={{ width: `${contextWindowCalculations.pctRag}%` }}
                      className="h-full bg-blue-500 transition-all relative group cursor-pointer"
                      title={`Documentos RAG: ${ragContextTokens} tokens`}
                    />
                    <div
                      style={{ width: `${contextWindowCalculations.pctOutput}%` }}
                      className="h-full bg-amber-500 transition-all relative group cursor-pointer"
                      title={`Margem de Resposta: ${maxOutputTokens} tokens`}
                    />
                    <div
                      style={{ width: `${contextWindowCalculations.pctFree}%` }}
                      className="h-full bg-slate-800/80 transition-all"
                      title={`Espaço Livre: ${contextWindowCalculations.remainingFreeTokens} tokens`}
                    />
                  </div>

                  {/* LEGENDA E PERCENTUAIS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-xs text-slate-400">System Prompt</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {systemPromptTokens.toLocaleString()} <span className="text-xs text-slate-500 font-normal">({contextWindowCalculations.pctSystem.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                        <span className="text-xs text-slate-400">Histórico Chat</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {chatHistoryTokens.toLocaleString()} <span className="text-xs text-slate-500 font-normal">({contextWindowCalculations.pctHistory.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs text-slate-400">RAG Chunks</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {ragContextTokens.toLocaleString()} <span className="text-xs text-slate-500 font-normal">({contextWindowCalculations.pctRag.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs text-slate-400">Margem Resposta</span>
                      </div>
                      <div className="text-base font-bold text-white">
                        {maxOutputTokens.toLocaleString()} <span className="text-xs text-slate-500 font-normal">({contextWindowCalculations.pctOutput.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* ANÁLISE DE ATENÇÃO (LOST IN THE MIDDLE) */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                        Fator de Atenção & Risco Lost in the Middle: <span className="text-emerald-400">{contextWindowCalculations.attentionRisk}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {contextWindowCalculations.attentionDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ESTIMADOR DE ÁUDIO TTS / STT                       */}
        {/* ========================================================= */}
        {activeTab === 'tts-stt' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ENTRADA DE TEXTO E CONFIGURAÇÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> Texto de Entrada & Motor
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Texto para Simulação de Voz / Narração:
                  </label>
                  <textarea
                    rows={5}
                    value={inputTextSample}
                    onChange={(e) => setInputTextSample(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Cole seu roteiro ou texto aqui..."
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>{ttsCalculations.charCount.toLocaleString()} caracteres</span>
                    <span>{ttsCalculations.words.toLocaleString()} palavras</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Motor de Síntese / Transcrição:
                  </label>
                  <select
                    value={ttsEngine}
                    onChange={(e) => setTtsEngine(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="openai-tts">OpenAI TTS-1 Standard ($0.015 / 1k chars)</option>
                    <option value="elevenlabs">ElevenLabs Turbo v2.5 ($0.30 / 1k chars)</option>
                    <option value="cartesia">Cartesia Sonic Fast ($0.040 / 1k chars)</option>
                    <option value="kokoro">Kokoro TTS Local GPU ($0.005 / 1k chars)</option>
                    <option value="whisper-stt">OpenAI Whisper STT ($0.006 / minuto)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Velocidade de Locução (Palavras/min):</span>
                    <span className="text-amber-400 font-bold">{wordsPerMinute} WPM</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={220}
                    step={5}
                    value={wordsPerMinute}
                    onChange={(e) => setWordsPerMinute(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Calmo (120)</span>
                    <span>Padrão BR (145)</span>
                    <span>Acelerado (180)</span>
                  </div>
                </div>
              </div>

              {/* RESULTADOS DE DURAÇÃO E CUSTOS */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <span className="text-xs text-slate-400 block mb-1">Duração Estimada do Áudio:</span>
                      <div className="text-2xl font-bold text-amber-400">{ttsCalculations.formattedDuration}</div>
                      <span className="text-[11px] text-slate-500">{ttsCalculations.totalSeconds} segundos de áudio</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <span className="text-xs text-slate-400 block mb-1">Custo Desta Execução:</span>
                      <div className="text-2xl font-bold text-white">
                        ${ttsCalculations.costPerUnit < 0.001 
                          ? ttsCalculations.costPerUnit.toFixed(5) 
                          : ttsCalculations.costPerUnit.toFixed(3)}
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        ~R$ {(ttsCalculations.costPerUnit * brlExchangeRate).toFixed(4)} BRL
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <span className="text-xs text-slate-400 block mb-1">Custo Lote de 100 Áudios:</span>
                      <div className="text-2xl font-bold text-cyan-400">
                        ${ttsCalculations.costBatch100.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        ~R$ {(ttsCalculations.costBatch100 * brlExchangeRate).toFixed(2)} BRL
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      Recomendações de Engenharia de Áudio & Podcast
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      <li><strong>Taxa de Amostragem Ideal:</strong> 44.1 kHz ou 48 kHz / 24-bit PCM para pós-produção em estações DAW.</li>
                      <li><strong>Formato Web de Baixa Latência:</strong> Utilize <code>Opus (Ogg container)</code> a 64-96 kbps para streaming de voz em tempo real.</li>
                      <li><strong>Economia Soberana:</strong> Se o volume mensal ultrapassar 5 milhões de caracteres, migrar para instâncias dedicadas de <strong>Kokoro / XTTS v2</strong> em GPU local ou Modal H100 gera mais de 85% de redução de custo em relação a provedores SaaS fechados.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CALCULADORA DE SIMILARIDADE SEMÂNTICA RAG          */}
        {/* ========================================================= */}
        {activeTab === 'rag-similarity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ENTRADAS DOS VETORES */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Vetores de Embedding (Dense)
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Vetor A (Pergunta do Usuário / Query):
                  </label>
                  <textarea
                    rows={3}
                    value={vectorAStr}
                    onChange={(e) => setVectorAStr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Valores separados por vírgula: 0.12, 0.45, ..."
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Vetor B (Documento / Chunk do RAG):
                  </label>
                  <textarea
                    rows={3}
                    value={vectorBStr}
                    onChange={(e) => setVectorBStr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Valores separados por vírgula: 0.14, 0.42, ..."
                  />
                </div>

                {/* PRESETS DE TESTE */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Presets Prontos de Teste:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        setVectorAStr('0.85, 0.10, 0.92, 0.22, 0.78, 0.14, 0.65, 0.41');
                        setVectorBStr('0.83, 0.12, 0.89, 0.25, 0.74, 0.18, 0.62, 0.45');
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300"
                    >
                      Alta Relevância (~0.99)
                    </button>
                    <button
                      onClick={() => {
                        setVectorAStr('0.85, 0.10, 0.92, 0.22, 0.78, 0.14, 0.65, 0.41');
                        setVectorBStr('0.15, 0.75, 0.20, 0.88, 0.30, 0.82, 0.12, 0.79');
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300"
                    >
                      Baixa Relevância (~0.35)
                    </button>
                    <button
                      onClick={() => {
                        setVectorAStr('1, 0, 0, 0');
                        setVectorBStr('0, 1, 0, 0');
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300"
                    >
                      Ortogonal (0.00)
                    </button>
                  </div>
                </div>
              </div>

              {/* RESULTADOS MATEMÁTICOS */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  {ragSimilarityCalculations.error ? (
                    <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {ragSimilarityCalculations.error}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                          Similaridade de Cosseno (Cosine Similarity)
                        </span>
                        <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                          {ragSimilarityCalculations.dimensions} Dimensões
                        </span>
                      </div>

                      <div className="flex items-baseline gap-3 mb-4">
                        <div className="text-4xl font-extrabold text-white">
                          {ragSimilarityCalculations.cosineSimilarity}
                        </div>
                        <span className={`text-xs font-semibold ${ragSimilarityCalculations.matchColor}`}>
                          {ragSimilarityCalculations.semanticLabel} ({ragSimilarityCalculations.cosinePercent}%)
                        </span>
                      </div>

                      {/* BARRA DE COSINE */}
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 mb-6">
                        <div
                          style={{ width: `${ragSimilarityCalculations.cosinePercent}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                        />
                      </div>

                      {/* OUTRAS MÉTRICAS */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Dot Product:</span>
                          <div className="text-base font-bold text-slate-200">
                            {ragSimilarityCalculations.dotProduct}
                          </div>
                          <span className="text-[10px] text-slate-500">A · B</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Dist. Euclidiana (L2):</span>
                          <div className="text-base font-bold text-slate-200">
                            {ragSimilarityCalculations.euclideanDistance}
                          </div>
                          <span className="text-[10px] text-slate-500">Menor = Mais próximo</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Dist. Manhattan (L1):</span>
                          <div className="text-base font-bold text-slate-200">
                            {ragSimilarityCalculations.manhattanDistance}
                          </div>
                          <span className="text-[10px] text-slate-500">Soma das diferenças</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Norma ||A|| / ||B||:</span>
                          <div className="text-base font-bold text-slate-200">
                            {ragSimilarityCalculations.magnitudeA} / {ragSimilarityCalculations.magnitudeB}
                          </div>
                          <span className="text-[10px] text-slate-500">Magnitudes euclidianas</span>
                        </div>
                      </div>

                      <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                            Como os Bancos Vetoriais (pgvector, ChromaDB, Qdrant) Operam
                          </h4>
                          <p className="text-xs text-slate-400">
                            Ao normalizar vetores para norma unitária (||v|| = 1), o <strong>Dot Product</strong> e o <strong>Cosine Similarity</strong> tornam-se matematicamente idênticos, acelerando buscas vetoriais massivas via produto interno (Inner Product <code>&lt;#&gt;</code>) com índices HNSW ou IVFFlat.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
