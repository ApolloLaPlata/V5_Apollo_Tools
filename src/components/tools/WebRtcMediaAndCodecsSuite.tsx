'use client';

import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Activity, 
  Headphones, 
  Video, 
  Server, 
  Layers, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Gauge,
  Wifi,
  DollarSign
} from 'lucide-react';

interface WebRtcMediaAndCodecsSuiteProps {
  defaultTab?: 'jitter-buffer' | 'audio-codecs' | 'video-matrix' | 'turn-relay' | 'rtp-inspector';
}

export const WebRtcMediaAndCodecsSuite: React.FC<WebRtcMediaAndCodecsSuiteProps> = ({ 
  defaultTab = 'jitter-buffer' 
}) => {
  const [activeTab, setActiveTab] = useState<'jitter-buffer' | 'audio-codecs' | 'video-matrix' | 'turn-relay' | 'rtp-inspector'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: CALCULADORA DE JITTER BUFFER, LATÊNCIA & MOS SCORE
  // =========================================================================
  const [rttMs, setRttMs] = useState<number>(45);
  const [jitterMs, setJitterMs] = useState<number>(12);
  const [packetLossPercent, setPacketLossPercent] = useState<number>(0.8);

  const mosEvaluation = useMemo(() => {
    // Modelo simplificado baseado no ITU-T G.107 E-Model
    // Jitter buffer dinâmico geralmente adiciona 2x a 3x o jitter
    const jitterBufferDelay = Math.max(20, jitterMs * 2.5);
    const oneWayDelay = (rttMs / 2) + jitterBufferDelay;

    // Fator de degradação por atraso (Id)
    let id = 0;
    if (oneWayDelay > 150) {
      id = 0.024 * oneWayDelay + 0.11 * (oneWayDelay - 150);
    } else {
      id = 0.024 * oneWayDelay;
    }

    // Fator de degradação por perda de pacotes (Ie)
    const ie = packetLossPercent * 3.5;

    // Fator R básico
    let rFactor = 93.2 - id - ie;
    rFactor = Math.max(0, Math.min(100, rFactor));

    // Conversão R-factor para MOS (1.0 a 4.5)
    let mos = 1.0;
    if (rFactor < 0) {
      mos = 1.0;
    } else if (rFactor > 100) {
      mos = 4.5;
    } else {
      mos = 1 + (0.035 * rFactor) + (rFactor * (rFactor - 60) * (100 - rFactor) * 0.000007);
    }
    mos = Math.max(1.0, Math.min(4.5, mos));

    let status = 'Excelente';
    let statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (mos < 2.6) {
      status = 'Muito Ruim (Inaceitável)';
      statusColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    } else if (mos < 3.6) {
      status = 'Ruim (Perceptível)';
      statusColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    } else if (mos < 4.0) {
      status = 'Bom (Tolerável)';
      statusColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }

    return {
      jitterBufferDelay: Math.round(jitterBufferDelay),
      oneWayDelay: Math.round(oneWayDelay),
      rFactor: Math.round(rFactor * 10) / 10,
      mos: Math.round(mos * 100) / 100,
      status,
      statusColor
    };
  }, [rttMs, jitterMs, packetLossPercent]);

  // =========================================================================
  // FERRAMENTA 2: COMPARADOR DE CODECS DE ÁUDIO & OVERHEAD RTP
  // =========================================================================
  const AUDIO_CODECS = [
    { name: 'Opus (Voz HD WebRTC)', defaultBitrate: 32, minBitrate: 6, maxBitrate: 510, sampleRate: 48000, desc: 'Padrão ouro WebRTC, adaptativo, supressão de ruído nativa' },
    { name: 'G.711 μ-law (PCMU)', defaultBitrate: 64, minBitrate: 64, maxBitrate: 64, sampleRate: 8000, desc: 'Telefonia pública PSTN legada, sem compressão perceptual' },
    { name: 'G.722 (Wideband HD)', defaultBitrate: 64, minBitrate: 64, maxBitrate: 64, sampleRate: 16000, desc: 'Alta definição para centrais PBX e VoIP corporativo' },
    { name: 'AAC-LC (Música / Rádio)', defaultBitrate: 128, minBitrate: 64, maxBitrate: 320, sampleRate: 44100, desc: 'Ideal para transmissão de áudio estéreo de alta fidelidade' }
  ];

  const [selectedCodecIdx, setSelectedCodecIdx] = useState<number>(0);
  const [ptimeMs, setPtimeMs] = useState<number>(20); // 20ms = 50 pacotes/segundo
  const [customAudioBitrate, setCustomAudioBitrate] = useState<number>(32);

  const audioBandwidthCalc = useMemo(() => {
    const codec = AUDIO_CODECS[selectedCodecIdx];
    const bitrate = codec.minBitrate === codec.maxBitrate ? codec.defaultBitrate : customAudioBitrate;
    const packetsPerSec = 1000 / ptimeMs;

    // Overhead por pacote: Ethernet (14B) + IPv4 (20B) + UDP (8B) + RTP (12B) = 54 bytes
    const headerBytesPerPacket = 54;
    const headerBitrateKbps = (packetsPerSec * headerBytesPerPacket * 8) / 1000;
    const totalBitrateKbps = bitrate + headerBitrateKbps;

    // Consumo de dados
    const megabytesPerHour = (totalBitrateKbps * 1000 / 8 * 3600) / (1024 * 1024);

    return {
      payloadBitrateKbps: bitrate,
      packetsPerSec,
      headerBitrateKbps: Math.round(headerBitrateKbps * 10) / 10,
      totalBitrateKbps: Math.round(totalBitrateKbps * 10) / 10,
      megabytesPerHour: Math.round(megabytesPerHour * 10) / 10
    };
  }, [selectedCodecIdx, ptimeMs, customAudioBitrate]);

  // =========================================================================
  // FERRAMENTA 3: MATRIZ DE BITRATES DE VÍDEO (AV1 / VP9 / H.264)
  // =========================================================================
  const [videoResolution, setVideoResolution] = useState<'4K' | '1080p' | '720p' | '480p'>('1080p');
  const [videoFps, setVideoFps] = useState<30 | 60>(30);
  const [videoCodec, setVideoCodec] = useState<'AV1' | 'VP9' | 'H.265' | 'H.264'>('VP9');

  const videoBitrateCalc = useMemo(() => {
    // Bitrate base para H.264 30fps em kbps
    const baseBitrates: Record<string, number> = {
      '4K': 12000,
      '1080p': 3500,
      '720p': 1800,
      '480p': 800
    };

    let bitrate = baseBitrates[videoResolution] || 3500;
    if (videoFps === 60) bitrate *= 1.45;

    // Fator de eficiência por codec
    if (videoCodec === 'AV1') bitrate *= 0.55; // 45% mais eficiente que H.264
    else if (videoCodec === 'VP9' || videoCodec === 'H.265') bitrate *= 0.70; // 30% mais eficiente

    bitrate = Math.round(bitrate);
    const mbps = (bitrate / 1000).toFixed(2);
    const gigabytesPerHour = ((bitrate * 1000 / 8 * 3600) / (1024 * 1024 * 1024)).toFixed(2);
    const monthly10hWeekGb = (parseFloat(gigabytesPerHour) * 40).toFixed(1);

    return {
      bitrateKbps: bitrate,
      bitrateMbps: mbps,
      gigabytesPerHour,
      monthly10hWeekGb
    };
  }, [videoResolution, videoFps, videoCodec]);

  // =========================================================================
  // FERRAMENTA 4: CALCULADORA DE OVERHEAD DE SERVIDORES TURN RELAY (RFC 5766)
  // =========================================================================
  const [concurrentUsers, setConcurrentUsers] = useState<number>(500);
  const [turnRelayPercent, setTurnRelayPercent] = useState<number>(18); // 15-20% padrão WebRTC
  const [averageStreamBitrateKbps, setAverageStreamBitrateKbps] = useState<number>(1200); // 1.2 Mbps áudio+vídeo
  const [dailyHours, setDailyHours] = useState<number>(4);

  const turnCostCalc = useMemo(() => {
    const relayedUsers = Math.round((concurrentUsers * turnRelayPercent) / 100);
    const turnThroughputMbps = (relayedUsers * averageStreamBitrateKbps) / 1000;
    
    // Tráfego diário em Gigabytes
    const dailyGb = (turnThroughputMbps * 1000000 / 8 * dailyHours * 3600) / (1024 * 1024 * 1024);
    const monthlyTb = (dailyGb * 30) / 1024;

    // Custos estimados de Egress
    const awsCost = Math.round(monthlyTb * 1024 * 0.08); // ~$0.08 por GB
    const digitalOceanCost = Math.round(monthlyTb * 1024 * 0.01); // ~$0.01 por GB
    const baremetalCost = Math.round(35 + (monthlyTb > 20 ? (monthlyTb - 20) * 1.5 : 0)); // Servidor Hetzner fixo

    return {
      relayedUsers,
      turnThroughputMbps: turnThroughputMbps.toFixed(1),
      dailyGb: Math.round(dailyGb),
      monthlyTb: monthlyTb.toFixed(2),
      awsCost,
      digitalOceanCost,
      baremetalCost
    };
  }, [concurrentUsers, turnRelayPercent, averageStreamBitrateKbps, dailyHours]);

  // =========================================================================
  // FERRAMENTA 5: PARSER & INSPETOR DE CABEÇALHOS RTP (RFC 3550)
  // =========================================================================
  // Exemplo oficial de cabeçalho RTP de 12 bytes: 80 60 0a 1f 00 48 e1 20 12 34 56 78
  const defaultRtpHex = '80600A1F0048E12012345678';
  const [rtpHexInput, setRtpHexInput] = useState<string>(defaultRtpHex);

  const parsedRtp = useMemo(() => {
    const clean = rtpHexInput.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length < 24) return { error: 'Cabeçalho incompleto (mínimo de 12 bytes / 24 hex)' };

    const b0 = parseInt(clean.substring(0, 2), 16);
    const b1 = parseInt(clean.substring(2, 4), 16);
    const seqNum = parseInt(clean.substring(4, 8), 16);
    const timestamp = parseInt(clean.substring(8, 16), 16);
    const ssrc = clean.substring(16, 24).toUpperCase();

    const version = (b0 >> 6) & 0x03;
    const padding = (b0 >> 5) & 0x01;
    const extension = (b0 >> 4) & 0x01;
    const csrcCount = b0 & 0x0f;

    const marker = (b1 >> 7) & 0x01;
    const payloadType = b1 & 0x7f;

    const ptNames: Record<number, string> = {
      0: 'PCMU (G.711 μ-law)',
      8: 'PCMA (G.711 A-law)',
      9: 'G.722 HD Voice',
      96: 'Dinâmico (geralmente Opus ou VP8)',
      97: 'Dinâmico (RTX Retransmission)',
      98: 'Dinâmico (VP9)',
      102: 'Dinâmico (H.264)',
      111: 'Dinâmico (Opus 48kHz)'
    };

    return {
      version,
      padding: padding === 1,
      extension: extension === 1,
      csrcCount,
      marker: marker === 1,
      payloadType,
      payloadName: ptNames[payloadType] || `Dinâmico / Custom (${payloadType})`,
      sequenceNumber: seqNum,
      timestamp,
      ssrc: `0x${ssrc}`
    };
  }, [rtpHexInput]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 text-slate-200">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Suíte de WebRTC Real-Time Media & Codecs de Áudio/Vídeo
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                  Etapa 66 · 340 Ferramentas
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Calculadora de Jitter Buffer & MOS ITU-T, comparador de codecs Opus/G.711, matriz de vídeo AV1/VP9, custos TURN e parser de cabeçalho RTP.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('jitter-buffer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'jitter-buffer' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Jitter & MOS Score
          </button>

          <button
            onClick={() => setActiveTab('audio-codecs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'audio-codecs' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            Codecs de Áudio
          </button>

          <button
            onClick={() => setActiveTab('video-matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'video-matrix' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Matriz de Vídeo
          </button>

          <button
            onClick={() => setActiveTab('turn-relay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'turn-relay' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Custos TURN Relay
          </button>

          <button
            onClick={() => setActiveTab('rtp-inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'rtp-inspector' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Cabeçalho RTP
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: JITTER BUFFER & MOS SCORE ITU-T
      ===================================================================== */}
      {activeTab === 'jitter-buffer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Latência RTT de Rede ({rttMs} ms)</label>
              <input
                type="range"
                min="5"
                max="400"
                value={rttMs}
                onChange={e => setRttMs(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>5ms (LAN)</span>
                <span>400ms (Satélite)</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Variação de Jitter ({jitterMs} ms)</label>
              <input
                type="range"
                min="0"
                max="80"
                value={jitterMs}
                onChange={e => setJitterMs(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>0ms (Fibra)</span>
                <span>80ms (4G Instável)</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Perda de Pacotes ({packetLossPercent}%)</label>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={packetLossPercent}
                onChange={e => setPacketLossPercent(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>0% (Perfeito)</span>
                <span>15% (Crítico)</span>
              </div>
            </div>
          </div>

          {/* PAINEL DE MOS SCORE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center ${mosEvaluation.statusColor}`}>
              <div className="text-[11px] font-mono uppercase tracking-wider mb-1">Qualidade Percebida (MOS)</div>
              <div className="text-4xl font-extrabold font-mono">{mosEvaluation.mos} <span className="text-sm font-normal">/ 4.5</span></div>
              <div className="text-xs font-semibold mt-1">{mosEvaluation.status}</div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col justify-center font-mono text-xs">
              <span className="text-slate-400">Jitter Buffer Estimado:</span>
              <span className="text-xl font-bold text-cyan-400 mt-1">{mosEvaluation.jitterBufferDelay} ms</span>
              <span className="text-[10px] text-slate-500 mt-1">Tolerância dinâmica a rajadas</span>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col justify-center font-mono text-xs">
              <span className="text-slate-400">Atraso Unidirecional (One-Way):</span>
              <span className="text-xl font-bold text-amber-400 mt-1">{mosEvaluation.oneWayDelay} ms</span>
              <span className="text-[10px] text-slate-500 mt-1">Tempo boca-ao-ouvido real</span>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col justify-center font-mono text-xs">
              <span className="text-slate-400">Fator R (ITU-T G.107):</span>
              <span className="text-xl font-bold text-white mt-1">{mosEvaluation.rFactor} <span className="text-xs text-slate-500">/ 100</span></span>
              <span className="text-[10px] text-slate-500 mt-1">Índice E-Model telecom</span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: COMPARADOR DE CODECS DE ÁUDIO & OVERHEAD
      ===================================================================== */}
      {activeTab === 'audio-codecs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Codec de Voz / Áudio</label>
              <select
                value={selectedCodecIdx}
                onChange={e => setSelectedCodecIdx(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
              >
                {AUDIO_CODECS.map((c, idx) => (
                  <option key={idx} value={idx}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Tempo de Pacote (ptime: {ptimeMs} ms)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 40, 60].map(pt => (
                  <button
                    key={pt}
                    onClick={() => setPtimeMs(pt)}
                    className={`py-1.5 text-xs font-mono rounded border ${
                      ptimeMs === pt 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {pt}ms
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Bitrate Customizado ({audioBandwidthCalc.payloadBitrateKbps} kbps)
              </label>
              <input
                type="range"
                min="8"
                max="128"
                value={customAudioBitrate}
                disabled={AUDIO_CODECS[selectedCodecIdx].minBitrate === AUDIO_CODECS[selectedCodecIdx].maxBitrate}
                onChange={e => setCustomAudioBitrate(Number(e.target.value))}
                className="w-full accent-cyan-400 disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">PAYLOAD DE ÁUDIO</div>
              <div className="text-xl font-bold text-white font-mono mt-1">{audioBandwidthCalc.payloadBitrateKbps} kbps</div>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">SOBRECARGA RTP/UDP/IP</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">+{audioBandwidthCalc.headerBitrateKbps} kbps</div>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">LARGURA TOTAL NA REDE</div>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{audioBandwidthCalc.totalBitrateKbps} kbps</div>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">CONSUMO POR HORA</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{audioBandwidthCalc.megabytesPerHour} MB/h</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: MATRIZ DE VÍDEO & FPS
      ===================================================================== */}
      {activeTab === 'video-matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Resolução de Vídeo</label>
              <div className="grid grid-cols-4 gap-1">
                {(['4K', '1080p', '720p', '480p'] as const).map(res => (
                  <button
                    key={res}
                    onClick={() => setVideoResolution(res)}
                    className={`py-1.5 text-xs font-mono rounded border ${
                      videoResolution === res 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Taxa de Quadros (FPS)</label>
              <div className="grid grid-cols-2 gap-2">
                {[30, 60].map(fps => (
                  <button
                    key={fps}
                    onClick={() => setVideoFps(fps as any)}
                    className={`py-1.5 text-xs font-mono rounded border ${
                      videoFps === fps 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Codec de Vídeo</label>
              <div className="grid grid-cols-4 gap-1">
                {(['AV1', 'VP9', 'H.265', 'H.264'] as const).map(cod => (
                  <button
                    key={cod}
                    onClick={() => setVideoCodec(cod)}
                    className={`py-1.5 text-xs font-mono rounded border ${
                      videoCodec === cod 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400">BITRATE RECOMENDADO</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{videoBitrateCalc.bitrateMbps} Mbps</div>
              <div className="text-[11px] text-slate-500 mt-0.5">({videoBitrateCalc.bitrateKbps} kbps)</div>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400">TRÁFEGO POR HORA</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{videoBitrateCalc.gigabytesPerHour} GB/h</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Stream contínuo de videoconferência</div>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400">CONSUMO MENSAL (10H/SEM)</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{videoBitrateCalc.monthly10hWeekGb} GB/mês</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Baseado em 40 horas mensais</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: TURN RELAY OVERHEAD & CLOUD COSTS
      ===================================================================== */}
      {activeTab === 'turn-relay' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Usuários Simultâneos</label>
              <input
                type="number"
                value={concurrentUsers}
                onChange={e => setConcurrentUsers(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">% que necessita TURN Relay</label>
              <input
                type="number"
                value={turnRelayPercent}
                onChange={e => setTurnRelayPercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-amber-300"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Bitrate Médio Stream (kbps)</label>
              <input
                type="number"
                value={averageStreamBitrateKbps}
                onChange={e => setAverageStreamBitrateKbps(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Horas de Uso Diário</label>
              <input
                type="number"
                value={dailyHours}
                onChange={e => setDailyHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* CUSTOS DE INFRAESTRUTURA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400">TRÁFEGO TURN RELAY</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{turnCostCalc.monthlyTb} TB/mês</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{turnCostCalc.relayedUsers} streams retransmitidos ({turnCostCalc.turnThroughputMbps} Mbps contínuos)</div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl border border-rose-500/20 text-center font-mono">
              <div className="text-[10px] text-slate-400">ESTIMATIVA AWS EGRESS</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">${turnCostCalc.awsCost} /mês</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cobrança padrão $0.08 por GB de egress</div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl border border-emerald-500/20 text-center font-mono">
              <div className="text-[10px] text-slate-400">BARE-METAL DEDICADO COTURN</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">~${turnCostCalc.baremetalCost} /mês</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Instância dedicada com 20TB inclusos (Hetzner)</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: PARSER & INSPETOR DE CABEÇALHO RTP (RFC 3550)
      ===================================================================== */}
      {activeTab === 'rtp-inspector' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Dump Hexadecimal do Cabeçalho RTP (12 Bytes)
              </label>
              <button
                onClick={() => setRtpHexInput(defaultRtpHex)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Restaurar Exemplo
              </button>
            </div>
            <input
              type="text"
              value={rtpHexInput}
              onChange={e => setRtpHexInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {'error' in parsedRtp ? (
            <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono">
              {parsedRtp.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Versão RTP:</span>
                <div className="text-lg font-bold text-cyan-400 mt-1">v{parsedRtp.version} (RFC 3550)</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Payload Type:</span>
                <div className="text-lg font-bold text-amber-400 mt-1">PT {parsedRtp.payloadType}</div>
                <div className="text-[10px] text-slate-500 truncate">{parsedRtp.payloadName}</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Sequence Number:</span>
                <div className="text-lg font-bold text-white mt-1">#{parsedRtp.sequenceNumber}</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">SSRC (Stream ID):</span>
                <div className="text-lg font-bold text-emerald-400 mt-1 truncate">{parsedRtp.ssrc}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
