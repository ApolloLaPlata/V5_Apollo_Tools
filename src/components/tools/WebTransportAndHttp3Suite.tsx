'use client';

import React, { useState, useMemo } from 'react';
import { 
  Wifi, 
  Send, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Radio, 
  RefreshCw, 
  Copy, 
  Check, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Smartphone, 
  Globe, 
  Zap,
  HelpCircle
} from 'lucide-react';

interface WebTransportAndHttp3SuiteProps {
  defaultTab?: 'webtransport-sim' | 'http3-frames' | 'hol-blocking' | 'quic-cid' | 'conn-migration';
}

export const WebTransportAndHttp3Suite: React.FC<WebTransportAndHttp3SuiteProps> = ({ 
  defaultTab = 'webtransport-sim' 
}) => {
  const [activeTab, setActiveTab] = useState<'webtransport-sim' | 'http3-frames' | 'hol-blocking' | 'quic-cid' | 'conn-migration'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: SIMULADOR DE SESSÕES WEBTRANSPORT
  // =========================================================================
  const [wtMode, setWtMode] = useState<'datagram' | 'uni-stream' | 'bidi-stream'>('datagram');
  const [wtDatagramsSent, setWtDatagramsSent] = useState<number>(142);
  const [wtSimulatedRtt, setWtSimulatedRtt] = useState<number>(18); // ms
  const [wtPacketLossSim, setWtPacketLossSim] = useState<number>(2.5); // %

  const wtStats = useMemo(() => {
    const lost = Math.round((wtDatagramsSent * wtPacketLossSim) / 100);
    const delivered = wtDatagramsSent - lost;
    const reliability = wtMode === 'datagram' ? 'Não Confiável (Unreliable Datagram)' : '100% Confiável (Stream FIFO)';
    const ordering = wtMode === 'datagram' ? 'Sem Ordenação (Zero Head-of-Line)' : 'Totalmente Ordenado por Stream';
    return {
      delivered,
      lost: wtMode === 'datagram' ? lost : 0,
      retransmitted: wtMode !== 'datagram' ? lost : 0,
      reliability,
      ordering,
      throughputBps: Math.round((delivered * 128) / (wtSimulatedRtt / 10)),
    };
  }, [wtMode, wtDatagramsSent, wtSimulatedRtt, wtPacketLossSim]);

  // =========================================================================
  // FERRAMENTA 2: DECODIFICADOR DE FRAMES HTTP/3 (RFC 9114)
  // =========================================================================
  const [selectedFrameType, setSelectedFrameType] = useState<'DATA' | 'HEADERS' | 'SETTINGS' | 'GOAWAY'>('HEADERS');

  const http3FramesCatalog = {
    DATA: {
      typeHex: '0x00',
      name: 'DATA Frame (RFC 9114 Seção 7.2.1)',
      purpose: 'Transporta bytes do corpo da requisição ou resposta HTTP/3 em streams bidirecionais.',
      wireHex: '00 1E 48 65 6C 6C 6F 20 57 6F 72 6C 64 20 66 72 6F 6D 20 56 35 20 41 70 6F 6C 6C 6F 20 54 6F 6F 6C 73',
      decoded: {
        frameType: '0x00 (DATA)',
        lengthVarint: '30 Bytes (0x1E)',
        payloadPreview: '"Hello World from V5 Apollo Tools"'
      }
    },
    HEADERS: {
      typeHex: '0x01',
      name: 'HEADERS Frame (RFC 9114 Seção 7.2.2)',
      purpose: 'Contém campos de cabeçalho comprimidos com o algoritmo QPACK (RFC 9204).',
      wireHex: '01 12 00 00 D1 5F 8B 1D 75 D0 62 0D 26 3D 4C 4D 65 64',
      decoded: {
        frameType: '0x01 (HEADERS)',
        lengthVarint: '18 Bytes (0x12)',
        payloadPreview: 'QPACK Encoded: :method=GET, :scheme=https, :authority=tools.v5apollo.com, :path=/'
      }
    },
    SETTINGS: {
      typeHex: '0x04',
      name: 'SETTINGS Frame (RFC 9114 Seção 7.2.4)',
      purpose: 'Enviado no stream de controle no início da conexão para configurar limites e tabelas QPACK.',
      wireHex: '04 0C 06 40 40 00 01 40 20 00 07 40 00',
      decoded: {
        frameType: '0x04 (SETTINGS)',
        lengthVarint: '12 Bytes (0x0C)',
        payloadPreview: 'QPACK_MAX_TABLE_CAPACITY=4096, MAX_FIELD_SECTION_SIZE=16384, QPACK_BLOCKED_STREAMS=100'
      }
    },
    GOAWAY: {
      typeHex: '0x07',
      name: 'GOAWAY Frame (RFC 9114 Seção 7.2.6)',
      purpose: 'Inicia o encerramento ordenado da conexão indicando o ID do último stream aceito.',
      wireHex: '07 02 04 00',
      decoded: {
        frameType: '0x07 (GOAWAY)',
        lengthVarint: '2 Bytes (0x02)',
        payloadPreview: 'Stream ID: 4 (Nenhum stream com ID > 4 será processado pelo peer)'
      }
    }
  };

  const activeHttp3Frame = http3FramesCatalog[selectedFrameType];

  // =========================================================================
  // FERRAMENTA 3: CALCULADORA DE HEAD-OF-LINE BLOCKING: TCP VS QUIC
  // =========================================================================
  const [lossRate, setLossRate] = useState<number>(3.0); // 3%
  const [baseRttMs, setBaseRttMs] = useState<number>(45); // 45ms
  const [activeConcurrentStreams, setActiveConcurrentStreams] = useState<number>(6);

  const holComparison = useMemo(() => {
    // No TCP, um pacote perdido congela TODOS os fluxos multiplexados (HTTP/2)
    // Probabilidade de bloqueio de conexão no TCP = 1 - (1 - p)^n
    const p = lossRate / 100;
    const tcpHolBlockingProbability = (1 - Math.pow(1 - p, activeConcurrentStreams)) * 100;
    const tcpAvgAddedLatencyMs = (baseRttMs * 1.5) * (tcpHolBlockingProbability / 100);

    // No QUIC, cada stream é independente: apenas o stream que perdeu o pacote sofre retransmissão
    const quicSingleStreamImpact = lossRate;
    const quicOtherStreamsImpact = 0; // zero HoL blocking para streams irmãos

    return {
      tcpHolBlockingProbability: tcpHolBlockingProbability.toFixed(1),
      tcpAvgAddedLatencyMs: tcpAvgAddedLatencyMs.toFixed(1),
      totalTcpLatencyMs: (baseRttMs + tcpAvgAddedLatencyMs).toFixed(1),
      quicSingleStreamImpact: quicSingleStreamImpact.toFixed(1),
      quicOtherStreamsImpact,
      quicLatencyMs: baseRttMs.toFixed(1)
    };
  }, [lossRate, baseRttMs, activeConcurrentStreams]);

  // =========================================================================
  // FERRAMENTA 4: INSPETOR DE CABEÇALHOS E CONNECTION ID (CID) QUIC
  // =========================================================================
  const [headerType, setHeaderType] = useState<'short-1rtt' | 'long-initial'>('short-1rtt');

  const quicPacketData = useMemo(() => {
    if (headerType === 'short-1rtt') {
      return {
        title: '1-RTT Protected Data (Short Header - RFC 9000 Seção 17.3)',
        format: 'Short Header (Header Form Bit = 0)',
        flags: 'Fixed Bit: 1 · Spin Bit: 1 (RTT passivo) · Key Phase: 0 · Packet Number Length: 2 bytes',
        dcid: '0x84f1a2399e2a40b1 (8 bytes)',
        scid: 'Não transmitido no Short Header (otimização de bandwidth)',
        packetNumber: '10482',
        wirePreview: '43 84 F1 A2 39 9E 2A 40 B1 28 F2 [PAYLOAD CIFRADO AES-128-GCM]',
        usageContext: 'Usado para 99% de todo o tráfego de dados após o handshake TLS 1.3 ser concluído.'
      };
    } else {
      return {
        title: 'Initial Packet (Long Header - RFC 9000 Seção 17.2)',
        format: 'Long Header (Header Form Bit = 1)',
        flags: 'Fixed Bit: 1 · Packet Type: 0x00 (Initial) · Reserved Bits: 00 · Packet Number Length: 4 bytes',
        dcid: '0x7b2a9e10ff4031aa5209 (10 bytes)',
        scid: '0x1049cbb8713028ee9931 (10 bytes)',
        packetNumber: '0',
        wirePreview: 'C0 00 00 01 0A 7B 2A 9E 10 FF 40 31 AA 52 09 0A 10 49 CB B8 ...',
        usageContext: 'Usado pelo cliente para disparar o handshake QUIC no primeiro voo (0-RTT/1-RTT).'
      };
    }
  }, [headerType]);

  // =========================================================================
  // FERRAMENTA 5: SIMULADOR DE MIGRAÇÃO DE CONEXÃO QUIC (WI-FI -> 5G)
  // =========================================================================
  const [networkPath, setNetworkPath] = useState<'wifi' | 'cellular'>('wifi');
  const [migrationLogs, setMigrationLogs] = useState<string[]>([
    'Conexão estabelecida via Wi-Fi: 192.168.1.104:54320 -> 104.21.50.12:443',
    'CID Ativo da Sessão: 0x84f1a2399e2a40b1 (Holding V5 Apollo #11)'
  ]);

  const handleToggleNetwork = () => {
    if (networkPath === 'wifi') {
      setNetworkPath('cellular');
      setMigrationLogs(prev => [
        ...prev,
        'EVENTO DE REDE: Desconexão da interface Wi-Fi (wlan0 down)',
        'MIGRAÇÃO QUIC DETECTADA: Nova rota 5G/LTE 179.184.22.80:61204',
        'CLIENTE: Enviando frame PATH_CHALLENGE (8 bytes nonce criptográfico)',
        'SERVIDOR: Resposta com PATH_RESPONSE correspondente',
        'STATUS: Rota validada com SUCESSO! Conexão mantida com ZERO RTT sem reiniciar TLS!'
      ]);
    } else {
      setNetworkPath('wifi');
      setMigrationLogs(prev => [
        ...prev,
        'EVENTO DE REDE: Reconexão de Wi-Fi de alta prioridade (192.168.1.104:54322)',
        'CLIENTE: Migração de volta ao Wi-Fi validada sem perda de pacotes'
      ]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header da Suíte */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                W3C WebTransport · RFC 9114 HTTP/3
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
                QUIC RFC 9000 Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                Marco 365 Ferramentas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              Suíte de WebTransport, HTTP/3 QUIC & UDP Client-Side
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Diagnostique e modele o futuro da rede na web moderna: simulação de datagramas e streams WebTransport W3C, desmontagem de frames HTTP/3 e QPACK, calculador de eliminação de Head-of-Line Blocking e migração transparente de conexão QUIC IP/Porta.
            </p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800 text-sm scrollbar-thin">
          <button
            onClick={() => setActiveTab('webtransport-sim')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'webtransport-sim'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-4 h-4" />
            1. WebTransport (Datagrams vs Streams)
          </button>
          <button
            onClick={() => setActiveTab('http3-frames')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'http3-frames'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. Frames HTTP/3 & QPACK
          </button>
          <button
            onClick={() => setActiveTab('hol-blocking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'hol-blocking'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            3. Head-of-Line Blocking (TCP vs QUIC)
          </button>
          <button
            onClick={() => setActiveTab('quic-cid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'quic-cid'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            4. Inspecionador QUIC CID
          </button>
          <button
            onClick={() => setActiveTab('conn-migration')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'conn-migration'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            5. Migração de Conexão (Wi-Fi ↔ 5G)
          </button>
        </div>
      </div>

      {/* ABA 1: WEBTRANSPORT SIMULATOR */}
      {activeTab === 'webtransport-sim' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Simulador WebTransport W3C: Datagrams vs Streams Multiplexados
              </h2>
              <p className="text-slate-400 text-sm">
                Experimente a flexibilidade da API WebTransport operando sobre HTTP/3: escolha entre datagramas UDP de latência ultra-baixa ou streams confiáveis.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setWtMode('datagram')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  wtMode === 'datagram' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Datagram (UDP Unreliable)
              </button>
              <button
                onClick={() => setWtMode('uni-stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  wtMode === 'uni-stream' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Stream Unidirecional
              </button>
              <button
                onClick={() => setWtMode('bidi-stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  wtMode === 'bidi-stream' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Stream Bidirecional
              </button>
            </div>
          </div>

          {/* Controles de Simulação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Pacotes / Mensagens Enviadas:</span>
                <span className="text-cyan-400 font-mono font-bold">{wtDatagramsSent}</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={wtDatagramsSent}
                onChange={e => setWtDatagramsSent(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Latência RTT da Rede:</span>
                <span className="text-indigo-400 font-mono font-bold">{wtSimulatedRtt} ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={wtSimulatedRtt}
                onChange={e => setWtSimulatedRtt(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Simulação de Perda de Pacotes:</span>
                <span className="text-amber-400 font-mono font-bold">{wtPacketLossSim}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={wtPacketLossSim}
                onChange={e => setWtPacketLossSim(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Cards de Métricas WebTransport */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Pacotes Entregues</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{wtStats.delivered}</div>
              <div className="text-[10px] text-slate-500 mt-1">Recepção no peer</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Pacotes Descartados</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{wtStats.lost}</div>
              <div className="text-[10px] text-slate-500 mt-1">{wtMode === 'datagram' ? 'Sem retransmissão' : '0 (retransmitido)'}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Modelo de Confiabilidade</div>
              <div className="text-xs font-bold text-cyan-300 mt-1 leading-tight">{wtStats.reliability}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Throughput Estimado</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{wtStats.throughputBps.toLocaleString()} B/s</div>
              <div className="text-[10px] text-slate-500 mt-1">Data rate efetivo</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2 font-mono">
            <div className="text-cyan-400 font-bold">EXEMPLO DE CÓDIGO CLIENTE (WEBTRANSPORT API NATIVA):</div>
            <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`const transport = new WebTransport("https://tools.v5apollo.com:4433/stream");
await transport.ready;

${wtMode === 'datagram' ? `// Envio de Datagrama (Zero Overhead, sem bloqueio HoL)
const writer = transport.datagrams.writable.getWriter();
await writer.write(new Uint8Array([0x01, 0x02, 0x03]));` : `// Abertura de Stream Confiável
const stream = await transport.createBidirectionalStream();
const writer = stream.writable.getWriter();
await writer.write(new TextEncoder().encode("Mensagem garantida FIFO"));`}
`}
            </pre>
          </div>
        </div>
      )}

      {/* ABA 2: HTTP/3 FRAMES & QPACK */}
      {activeTab === 'http3-frames' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Decodificador de Frames HTTP/3 (RFC 9114) & Compressão QPACK
              </h2>
              <p className="text-slate-400 text-sm">
                Inspecione os tipos de frame fundamentais do protocolo HTTP/3 encapsulados nos fluxos de dados do QUIC.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedFrameType('DATA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFrameType === 'DATA' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                DATA (0x00)
              </button>
              <button
                onClick={() => setSelectedFrameType('HEADERS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFrameType === 'HEADERS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                HEADERS (0x01)
              </button>
              <button
                onClick={() => setSelectedFrameType('SETTINGS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFrameType === 'SETTINGS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                SETTINGS (0x04)
              </button>
              <button
                onClick={() => setSelectedFrameType('GOAWAY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFrameType === 'GOAWAY' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                GOAWAY (0x07)
              </button>
            </div>
          </div>

          {/* Detalhes do Frame */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">{activeHttp3Frame.typeHex}</span>
                <span className="text-sm font-bold text-white ml-2">{activeHttp3Frame.name}</span>
              </div>
              <span className="text-xs text-slate-400">{activeHttp3Frame.purpose}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>BYTECODE DO FRAME (HEX):</span>
                <button onClick={() => copyToClipboard(activeHttp3Frame.wireHex, 'frame-hex')} className="hover:text-white flex items-center gap-1">
                  {copiedKey === 'frame-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 break-all select-all">
                {activeHttp3Frame.wireHex}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">TIPO DO FRAME:</span>
                <span className="text-white font-bold">{activeHttp3Frame.decoded.frameType}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">COMPRIMENTO (VARINT):</span>
                <span className="text-indigo-300 font-bold">{activeHttp3Frame.decoded.lengthVarint}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">CONTEÚDO / PAYLOAD:</span>
                <span className="text-emerald-400 font-bold truncate block">{activeHttp3Frame.decoded.payloadPreview}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: HEAD-OF-LINE BLOCKING */}
      {activeTab === 'hol-blocking' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Head-of-Line (HoL) Blocking: TCP/TLS vs HTTP/3 QUIC
              </h2>
              <p className="text-slate-400 text-sm">
                Comprove matematicamente como o HTTP/3 elimina o bloqueio de fluxo compartilhado do TCP sob perda de pacotes.
              </p>
            </div>
          </div>

          {/* Controles de Perda e Streams */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Taxa de Perda de Pacotes:</span>
                <span className="text-rose-400 font-mono font-bold">{lossRate}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={lossRate}
                onChange={e => setLossRate(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Latência RTT Base:</span>
                <span className="text-indigo-400 font-mono font-bold">{baseRttMs} ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={baseRttMs}
                onChange={e => setBaseRttMs(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Streams Concorrentes na Conexão:</span>
                <span className="text-cyan-400 font-mono font-bold">{activeConcurrentStreams} streams</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={activeConcurrentStreams}
                onChange={e => setActiveConcurrentStreams(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Comparação Lado a Lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco TCP */}
            <div className="bg-slate-950 border border-rose-900/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
                <span className="font-bold text-rose-400 text-sm">TCP / HTTP/2 (Com HoL Blocking)</span>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                  Fluxo Único de Transporte
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Como todas as {activeConcurrentStreams} streams compartilham o mesmo buffer de janela TCP, a perda de um único pacote paralisa a entrega de TODAS as streams.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">CHANCE DE BLOQUEIO CONEXÃO:</span>
                  <span className="text-rose-400 font-bold text-base">{holComparison.tcpHolBlockingProbability}%</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">LATÊNCIA EFETIVA TOTAL:</span>
                  <span className="text-amber-400 font-bold text-base">{holComparison.totalTcpLatencyMs} ms</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">(+{holComparison.tcpAvgAddedLatencyMs}ms atraso)</span>
                </div>
              </div>
            </div>

            {/* Bloco QUIC */}
            <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                <span className="font-bold text-emerald-400 text-sm">QUIC / HTTP/3 (Zero HoL Blocking)</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Streams Independentes UDP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cada stream tem seu próprio controle de fluxo. Se o Stream #2 perde um pacote, os Streams #1, #3, #4, #5 e #6 continuam sendo entregues imediatamente.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">IMPACTO NAS DEMAIS STREAMS:</span>
                  <span className="text-emerald-400 font-bold text-base">0% Bloqueio</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-1">LATÊNCIA NAS STREAMS LIVRES:</span>
                  <span className="text-emerald-400 font-bold text-base">{holComparison.quicLatencyMs} ms</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">(Zero atraso adicional)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: QUIC CID INSPECTOR */}
      {activeTab === 'quic-cid' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Inspecionador de Cabeçalhos e Connection ID (CID) QUIC (RFC 9000)
              </h2>
              <p className="text-slate-400 text-sm">
                Analise os campos binários de cabeçalho do QUIC: Long Header (Handshake) vs Short Header (1-RTT Protected Data).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setHeaderType('short-1rtt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  headerType === 'short-1rtt' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Short Header (1-RTT)
              </button>
              <button
                onClick={() => setHeaderType('long-initial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  headerType === 'long-initial' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Long Header (Initial)
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-white">{quicPacketData.title}</span>
              <span className="text-xs font-mono text-cyan-400">{quicPacketData.format}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block mb-1">DESTINATION CONNECTION ID (DCID):</span>
                <span className="text-cyan-300 font-bold text-sm">{quicPacketData.dcid}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block mb-1">SOURCE CONNECTION ID (SCID):</span>
                <span className="text-indigo-300 font-bold text-sm">{quicPacketData.scid}</span>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-500 block">FLAGS DO PRIMEIRO BYTE:</span>
              <span className="text-emerald-400 font-bold">{quicPacketData.flags}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono">PREVIEW DE PACOTE EM WIRE (HEX):</span>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 break-all select-all">
                {quicPacketData.wirePreview}
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              Contexto de uso: {quicPacketData.usageContext}
            </p>
          </div>
        </div>
      )}

      {/* ABA 5: CONNECTION MIGRATION */}
      {activeTab === 'conn-migration' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                Simulador de Migração de Conexão QUIC (Wi-Fi ↔ 5G)
              </h2>
              <p className="text-slate-400 text-sm">
                Alterne a rede do dispositivo cliente e visualize como o QUIC preserva a sessão ativa sem interrupção usando Connection IDs (CIDs).
              </p>
            </div>
            <button
              onClick={handleToggleNetwork}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Alternar Rede ({networkPath === 'wifi' ? 'Mudar para 5G' : 'Voltar para Wi-Fi'})
            </button>
          </div>

          {/* Status Visual da Rede */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border transition-all ${
              networkPath === 'wifi'
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white text-sm">Rede Wi-Fi Doméstica / Corporativa</span>
                </div>
                {networkPath === 'wifi' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                    ATIVA
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono space-y-1">
                <div>IP Local: 192.168.1.104 (Porta UDP 54320)</div>
                <div>Status TCP Clássico: {networkPath === 'wifi' ? 'Conectado' : 'ABORTADO (4-tuple inválida)'}</div>
                <div>Status QUIC: <span className="text-emerald-400 font-bold">Conexão Preservada via CID</span></div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              networkPath === 'cellular'
                ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-white text-sm">Rede Celular 5G / LTE Carrier</span>
                </div>
                {networkPath === 'cellular' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800">
                    ATIVA
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono space-y-1">
                <div>IP Remoto: 179.184.22.80 (Porta UDP 61204)</div>
                <div>Tempo de Recuperação TCP: ~850 ms (Handshake completo)</div>
                <div>Tempo de Recuperação QUIC: <span className="text-emerald-400 font-bold">0 ms (Zero RTT)</span></div>
              </div>
            </div>
          </div>

          {/* Terminal de Logs de Migração */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <span className="text-slate-500 block border-b border-slate-800 pb-1">
              LOGS DE EVENTOS DE TRANSIÇÃO QUIC (PATH_CHALLENGE / PATH_RESPONSE):
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
              {migrationLogs.map((log, idx) => (
                <div key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 shrink-0">›</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
