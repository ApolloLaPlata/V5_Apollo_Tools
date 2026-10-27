'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Cpu, 
  Activity, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Network, 
  HelpCircle,
  FileCheck2,
  TreeDeciduous,
  Clock
} from 'lucide-react';

export function HybridPqcAndStatefulHashSuite({ defaultTab = 'hybrid-kem-xwing-simulator' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: HYBRID KEM X-WING SIMULATOR (X25519 + ML-KEM-768)
  // -------------------------------------------------------------
  const [sessionInfo, setSessionInfo] = useState('Apollo-Secure-Transport-v1');
  const [hybridSecretGenerated, setHybridSecretGenerated] = useState(false);
  const [classicSecretHex, setClassicSecretHex] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [pqcSecretHex, setPqcSecretHex] = useState('7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
  const [derivedMasterKey, setDerivedMasterKey] = useState('0f5a72d3e18bc79e6027a4e9b92284cf67119da8e2456bc9103e5c94fa127a81');

  const generateHybridKdf = () => {
    // Simulated pseudo-random generation of secrets
    const newClassic = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    const newPqc = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    const newDerived = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    
    setClassicSecretHex(newClassic);
    setPqcSecretHex(newPqc);
    setDerivedMasterKey(newDerived);
    setHybridSecretGenerated(true);
  };

  // -------------------------------------------------------------
  // TOOL 2: STATEFUL HASH XMSS & LMS SIGNER
  // -------------------------------------------------------------
  const [statefulScheme, setStatefulScheme] = useState<'XMSS-SHA2_10_256' | 'LMS_SHA256_M32_H10'>('XMSS-SHA2_10_256');
  const [treeHeight, setTreeHeight] = useState<number>(10); // 2^10 = 1024 assinaturas totais
  const [currentKeyIndex, setCurrentKeyIndex] = useState<number>(42);
  const totalSignatures = Math.pow(2, treeHeight);
  const signaturesRemaining = totalSignatures - currentKeyIndex;

  const advanceIndex = () => {
    if (currentKeyIndex < totalSignatures) {
      setCurrentKeyIndex(prev => prev + 1);
    }
  };

  // -------------------------------------------------------------
  // TOOL 3: NSA CNSA 2.0 COMPLIANCE AUDITOR
  // -------------------------------------------------------------
  const [selectedProfile, setSelectedProfile] = useState<'web-browsing' | 'firmware-signing' | 'cloud-storage'>('web-browsing');

  const cnsa2Requirements = {
    'web-browsing': [
      { name: 'KEM / Troca de Chaves', standard: 'ML-KEM-1024 (FIPS 203)', currentLegacy: 'X25519 / ECDH P-384', deadline: 'Obrigatório até 2030', status: 'In Transition' },
      { name: 'Assinaturas Digitais TLS', standard: 'ML-DSA-87 (FIPS 204)', currentLegacy: 'RSA 3072 / ECDSA P-384', deadline: 'Obrigatório até 2030', status: 'In Transition' },
      { name: 'Cifragem Simétrica', standard: 'AES-256 (GCM / CTR)', currentLegacy: 'AES-128 / AES-256', deadline: 'Imediato (CNSA 1.0/2.0)', status: 'Compliant' },
      { name: 'Funções Hash Criptográficas', standard: 'SHA-384 ou SHA-512', currentLegacy: 'SHA-256 / SHA-384', deadline: 'Imediato', status: 'Compliant' },
    ],
    'firmware-signing': [
      { name: 'Assinatura de Firmware & Boot', standard: 'LMS (RFC 8554) ou XMSS (RFC 8391)', currentLegacy: 'RSA-4096 / ECDSA P-384', deadline: 'Obrigatório até 2025/2026', status: 'Urgent Action' },
      { name: 'Raiz de Confiança (Root of Trust)', standard: 'Stateful Hash Trees (NIST SP 800-208)', currentLegacy: 'Chaves Públicas RSA estáticas', deadline: 'Obrigatório até 2026', status: 'In Transition' },
      { name: 'Algoritmo de Hash do Firmware', standard: 'SHA-384 / SHA-512', currentLegacy: 'SHA-256', deadline: 'Imediato', status: 'Compliant' }
    ],
    'cloud-storage': [
      { name: 'Cifragem em Repouso (At-Rest)', standard: 'AES-256-XTS / AES-256-GCM', currentLegacy: 'AES-128-CBC', deadline: 'Imediato', status: 'Compliant' },
      { name: 'Troca de Chaves de Envelopamento', standard: 'ML-KEM-1024', currentLegacy: 'RSA 4096 / ECDH P-521', deadline: 'Obrigatório até 2030', status: 'In Transition' }
    ]
  };

  // -------------------------------------------------------------
  // TOOL 4: TLS 1.3 PQC HANDSHAKE OVERHEAD CALCULATOR
  // -------------------------------------------------------------
  const [selectedKem, setSelectedKem] = useState<'x25519' | 'ml-kem-768' | 'x-wing-hybrid' | 'ml-kem-1024'>('x-wing-hybrid');
  const [rttLatencyMs, setRttLatencyMs] = useState<number>(45); // Latência de rede (45ms)
  const [packetLossPct, setPacketLossPct] = useState<number>(0.5); // 0.5% perda

  const kemSpecs: Record<string, { pkBytes: number; ctBytes: number; desc: string }> = {
    'x25519': { pkBytes: 32, ctBytes: 32, desc: 'Curva elíptica clássica ultra compacta (64B overhead total).' },
    'ml-kem-768': { pkBytes: 1184, ctBytes: 1088, desc: 'Padrão NIST Nível 3 (CRYSTALS-Kyber 768 - 2272B overhead).' },
    'x-wing-hybrid': { pkBytes: 1216, ctBytes: 1120, desc: 'Híbrido X25519 + Kyber-768 (2336B overhead total).' },
    'ml-kem-1024': { pkBytes: 1568, ctBytes: 1568, desc: 'Padrão Militar NSA CNSA 2.0 Nível 5 (3136B overhead).' }
  };

  const currentKem = kemSpecs[selectedKem];
  const totalExchangeBytes = currentKem.pkBytes + currentKem.ctBytes;
  const ethernetMtu = 1500;
  const ipOverhead = 40; // IPv4 + TCP / UDP
  const maxPayloadPerPacket = ethernetMtu - ipOverhead; // ~1460B
  const packetsNeeded = Math.ceil(totalExchangeBytes / maxPayloadPerPacket);
  const extraRttEstimate = packetsNeeded > 1 ? +(rttLatencyMs * (1 + packetLossPct / 100)).toFixed(1) : rttLatencyMs;

  // -------------------------------------------------------------
  // TOOL 5: OTS WOTS+ KEY TREE VISUALIZER
  // -------------------------------------------------------------
  const [wotsParam, setWotsParam] = useState<number>(16); // w = 16 (4 bits por digito)
  const [wotsMessageNibbles] = useState<number[]>([3, 7, 12, 0, 15, 2, 9, 14]);

  const hashChainsRemaining = wotsMessageNibbles.map(nibble => ({
    nibbleHex: nibble.toString(16).toUpperCase(),
    appliedHashes: nibble,
    remainingHashesToPk: (wotsParam - 1) - nibble
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-cyan-400 animate-pulse" /> Criptografia Pós-Quântica Híbrida
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                NIST FIPS 203/204 & NSA CNSA 2.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Suíte de Criptografia Pós-Quântica Híbrida & Stateful Hash
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Encapsulador híbrido X-Wing (X25519 + ML-KEM-768), assinador stateful hash XMSS/LMS com rastreamento monotônico, auditor NSA CNSA 2.0, calculadora de overhead TLS 1.3 e visualizador de árvores WOTS+.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Segurança Soberana</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'hybrid-kem-xwing-simulator', label: 'KEM Híbrido X-Wing (X25519 + Kyber)', icon: ShieldCheck },
          { id: 'stateful-hash-xmss-lms-signer', label: 'Assinaturas Stateful (XMSS / LMS)', icon: Key },
          { id: 'nsa-cnsa-2-compliance-auditor', label: 'Auditor NSA CNSA 2.0', icon: FileCheck2 },
          { id: 'tls13-pqc-handshake-overhead-calc', label: 'Overhead TLS 1.3 PQC', icon: Network },
          { id: 'ots-wots-key-tree-visualizer', label: 'Árvores WOTS+ (Winternitz OTS)', icon: TreeDeciduous },
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

      {/* TAB 1: HYBRID KEM X-WING SIMULATOR */}
      {activeTab === 'hybrid-kem-xwing-simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Esquema KEM Híbrido X-Wing (IETF Draft)
              </h3>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Identificador de Contexto de Sessão</label>
                <input
                  type="text"
                  value={sessionInfo}
                  onChange={(e) => setSessionInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={generateHybridKdf}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" /> Executar Troca de Chaves Híbrida X-Wing
              </button>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dupla Blindagem Criptográfica
                </div>
                <p className="text-[11px] text-slate-400">
                  Mesmo se um computador quântico quebrar o componente clássico X25519, ou se uma fraqueza matemática for descoberta no novo reticulado ML-KEM-768, o segredo compartilhado permanece inviolável enquanto um dos dois esquemas for seguro.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" /> Componentes e Chave Mestra Derivada
                </h3>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">Segredo Clássico (X25519 ECDH):</div>
                  <div className="font-mono text-xs text-slate-300 truncate">{classicSecretHex}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">Segredo Pós-Quântico (ML-KEM-768 Decaps):</div>
                  <div className="font-mono text-xs text-cyan-400 truncate">{pqcSecretHex}</div>
                </div>

                <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 rounded-xl border border-cyan-500/30 space-y-1">
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase">Chave de Sessão Derivada SHA-3/KMAC (K):</div>
                  <div className="font-mono text-xs text-white font-bold truncate">{derivedMasterKey}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                Fórmula de Derivação: <code>K = SHA3_256(ss_classic || ss_pqc || ct_pqc || &apos;\\x5c\\x2f\\x2f\\x5e&apos;)</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATEFUL HASH XMSS & LMS SIGNER */}
      {activeTab === 'stateful-hash-xmss-lms-signer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" /> Parâmetros do Esquema Stateful
              </h3>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Padrão da Árvore de Assinaturas</label>
                <select
                  value={statefulScheme}
                  onChange={(e) => setStatefulScheme(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="XMSS-SHA2_10_256">XMSS (RFC 8391 - Altura 10)</option>
                  <option value="LMS_SHA256_M32_H10">LMS (RFC 8554 / Leighton-Micali)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Altura da Árvore (H)</span>
                  <span className="font-mono text-cyan-400 font-bold">{treeHeight} níveis</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Capacidade total: 2^{treeHeight} = {totalSignatures} assinaturas
                </div>
              </div>

              <button
                onClick={advanceIndex}
                disabled={currentKeyIndex >= totalSignatures}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Consumir 1 Chave OTS (Avançar Índice)
              </button>

              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> AVISO DE SEGURANÇA CRÍTICA
                </div>
                <p className="text-[11px] text-slate-400">
                  Em esquemas stateful, <strong>NUNCA reutilize um índice de chave OTS</strong>. Reutilizar uma mesma folha para assinar duas mensagens diferentes permite forjar assinaturas arbitrárias.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Estado Monotônico da Árvore Merkle
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Índice Atual (OTS Index)</div>
                  <div className="text-3xl font-black text-cyan-400 font-mono mt-1">#{currentKeyIndex}</div>
                  <div className="text-[10px] text-slate-500">Próxima folha a assinar</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Assinaturas Restantes</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{signaturesRemaining}</div>
                  <div className="text-[10px] text-slate-500">De {totalSignatures} totais</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Consumo da Chave</div>
                  <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                    {((currentKeyIndex / totalSignatures) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">Vida útil restante</div>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Índice 0 (Chave Nova)</span>
                  <span>Índice {totalSignatures} (Chave Esgotada)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300" 
                    style={{ width: `${(currentKeyIndex / totalSignatures) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NSA CNSA 2.0 COMPLIANCE AUDITOR */}
      {activeTab === 'nsa-cnsa-2-compliance-auditor' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" /> Matriz de Conformidade NSA CNSA 2.0
              </h3>
              <div className="flex gap-1">
                {(['web-browsing', 'firmware-signing', 'cloud-storage'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedProfile(p)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      selectedProfile === p ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p === 'web-browsing' && 'Navegação Web & TLS'}
                    {p === 'firmware-signing' && 'Firmware & Boot'}
                    {p === 'cloud-storage' && 'Cloud Storage'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {cnsa2Requirements[selectedProfile].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white text-sm">{item.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Padrão Obrigatório CNSA 2.0: <strong className="text-cyan-300 font-mono">{item.standard}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Algoritmo Legado a Substituir: {item.currentLegacy} &bull; {item.deadline}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    item.status === 'Compliant'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'In Transition'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TLS 1.3 PQC HANDSHAKE OVERHEAD CALCULATOR */}
      {activeTab === 'tls13-pqc-handshake-overhead-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" /> Algoritmo KEM Selecionado
              </h3>

              <div className="space-y-1.5">
                {Object.keys(kemSpecs).map(k => (
                  <button
                    key={k}
                    onClick={() => setSelectedKem(k as any)}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      selectedKem === k
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span>{k.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {kemSpecs[k].pkBytes + kemSpecs[k].ctBytes} B
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Latência RTT da Rede</span>
                  <span className="font-mono text-cyan-400 font-bold">{rttLatencyMs} ms</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={rttLatencyMs}
                  onChange={(e) => setRttLatencyMs(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Métricas de Impacto no Handshake TLS 1.3
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tamanho da Troca (Key Share)</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{totalExchangeBytes} B</div>
                  <div className="text-[10px] text-slate-500">PK ({currentKem.pkBytes}B) + CT ({currentKem.ctBytes}B)</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Pacotes TCP / QUIC</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{packetsNeeded} Pkts</div>
                  <div className="text-[10px] text-slate-500">MTU Ethernet 1500B</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Latência Estimada</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{extraRttEstimate} ms</div>
                  <div className="text-[10px] text-slate-500">Handshake 1-RTT</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="font-semibold text-white mb-1">Avaliação de Desempenho de Rede:</div>
                <p className="text-slate-400 leading-relaxed">{currentKem.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OTS WOTS+ KEY TREE VISUALIZER */}
      {activeTab === 'ots-wots-key-tree-visualizer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TreeDeciduous className="w-4 h-4 text-cyan-400" /> Cadeias de Hash WOTS+ (Winternitz OTS)
              </h3>

              <div className="text-xs text-slate-400">
                Cada dígito hexadecimal (nibble de 4 bits, valores 0 a 15) da mensagem define quantas iterações de hash foram aplicadas na assinatura:
              </div>

              <div className="grid grid-cols-4 gap-2">
                {hashChainsRemaining.map((chain, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] text-slate-500">Cadeia #{i}</div>
                    <div className="text-xl font-bold font-mono text-cyan-400">{chain.nibbleHex}</div>
                    <div className="text-[10px] text-slate-400">Hash {chain.appliedHashes} / 15</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verificação pelo Destinatário
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white">Algoritmo de Verificação de Assinatura Única:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  O verificador recebe o valor assinado e aplica exatamente <code>(15 - nibble)</code> operações de hash adicionais até chegar na Chave Pública conhecida. Se o hash final bater, a assinatura é 100% autêntica sem envolver curvas elípticas ou fatoração.
                </p>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                As assinaturas WOTS+ são combinadas com árvores Merkle em esquemas XMSS para fornecer até milhões de assinaturas sob uma única chave pública raiz de 32 bytes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
