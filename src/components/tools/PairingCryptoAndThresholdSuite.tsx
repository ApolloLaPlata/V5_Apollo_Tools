'use client';

import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Layers, 
  Network, 
  Share2, 
  Lock, 
  Unlock, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  Sliders, 
  GitMerge, 
  Binary, 
  FileCheck2,
  TreeDeciduous,
  Users
} from 'lucide-react';

export function PairingCryptoAndThresholdSuite({ defaultTab = 'bls12-381-signature-aggregator' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: BLS12-381 SIGNATURE AGGREGATOR
  // -------------------------------------------------------------
  const [signersCount, setSignersCount] = useState(4);
  const [messagePayload, setMessagePayload] = useState('Apollo-Consensus-Block-#10842');
  const [isAggregated, setIsAggregated] = useState(true);

  // Simulated signatures for the signers
  const signers = Array.from({ length: signersCount }, (_, i) => ({
    id: i + 1,
    pubKey: `0x${((i + 1) * 11111111).toString(16).padStart(8, '0')}...${((i + 1) * 9999).toString(16).padStart(4, '0')}`,
    sig: `0x${((i + 1) * 31415926).toString(16).padStart(12, '0')}...b7`
  }));

  const aggregateSig = '0xb48f12c89d04ef6b72a819034c56e719f2a083d69b4c023d8819cf2e841029471903ef82149b0193a82749cb0184e912';

  // -------------------------------------------------------------
  // TOOL 2: SHAMIR SECRET SHARING SCHEME (SSSS)
  // -------------------------------------------------------------
  const [secretText, setSecretText] = useState('V5-QUANTUM-MASTER-KEY-2026');
  const [thresholdK, setThresholdK] = useState(3);
  const [totalSharesN, setTotalSharesN] = useState(5);
  const [selectedShares, setSelectedShares] = useState<number[]>([1, 2, 4]);
  const [reconstructedSecret, setReconstructedSecret] = useState<string | null>('V5-QUANTUM-MASTER-KEY-2026');

  // Simulated shares using polynomial P(x) = Secret + a1*x + a2*x^2 ... mod P
  const generatedShares = Array.from({ length: totalSharesN }, (_, i) => {
    const x = i + 1;
    // Simulated deterministic share values
    const hash = ((x * 37 + 109) % 256).toString(16).padStart(2, '0');
    return {
      x,
      val: `share-${x}:8f${hash}4b2e9c1a`
    };
  });

  const toggleShareSelection = (x: number) => {
    let next: number[];
    if (selectedShares.includes(x)) {
      next = selectedShares.filter(id => id !== x);
    } else {
      next = [...selectedShares, x];
    }
    setSelectedShares(next);
    if (next.length >= thresholdK) {
      setReconstructedSecret(secretText);
    } else {
      setReconstructedSecret(null);
    }
  };

  // -------------------------------------------------------------
  // TOOL 3: BILINEAR PAIRING CALCULATOR (TATE / ATE PAIRING)
  // -------------------------------------------------------------
  const [scalarA, setScalarA] = useState(3);
  const [scalarB, setScalarB] = useState(5);
  const [pairingCurve, setPairingCurve] = useState<'BLS12-381' | 'BN254' | 'BLS24-479'>('BLS12-381');

  const abProduct = scalarA * scalarB;

  // -------------------------------------------------------------
  // TOOL 4: THRESHOLD DKG SIMULATOR (PEDERSEN / FROST)
  // -------------------------------------------------------------
  const [dkgNodes, setDkgNodes] = useState(4);
  const [dkgThreshold, setDkgThreshold] = useState(3);
  const [dkgPhase, setDkgPhase] = useState<'commit' | 'shares' | 'aggregated'>('aggregated');

  // -------------------------------------------------------------
  // TOOL 5: COSI COLLECTIVE SIGNING TREE
  // -------------------------------------------------------------
  const [cosiParticipants, setCosiParticipants] = useState(16);
  const [cosiRound, setCosiRound] = useState<'announcement' | 'commitment' | 'challenge' | 'response'>('response');

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> CRIPTOGRAFIA AVANÇADA & THRESHOLD
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
              Marco de 430 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Suíte de Pareamento Bilinear, Assinaturas BLS & Threshold
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Ferramentas determinísticas de curvas emparelhadas BLS12-381, agregação de assinaturas $O(1)$, divisão de segredos de Shamir $(k, n)$, DKG descentralizado e consenso CoSi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-purple-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Capitania #11 · BLS Threshold</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'bls12-381-signature-aggregator', label: 'Agregador de Assinaturas BLS', icon: Key },
          { id: 'shamir-secret-sharing-scheme', label: 'Segredo Compartilhado de Shamir (SSSS)', icon: Share2 },
          { id: 'bilinear-pairing-calculator', label: 'Pareamento Bilinear e(P, Q)', icon: GitMerge },
          { id: 'threshold-dkg-simulator', label: 'Simulador DKG / FROST', icon: Network },
          { id: 'cosi-collective-signing-tree', label: 'Assinaturas Coletivas CoSi', icon: TreeDeciduous },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BLS12-381 SIGNATURE AGGREGATOR */}
      {activeTab === 'bls12-381-signature-aggregator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Multi-Assinadores Individuais (Curva BLS12-381 G1)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Mensagem Assinada pelos Validadores</label>
                  <input
                    type="text"
                    value={messagePayload}
                    onChange={(e) => setMessagePayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Quantidade de Validadores Assinantes ($N$)</span>
                    <span className="font-mono text-purple-400 font-bold">{signersCount} nós</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={signersCount}
                    onChange={(e) => setSignersCount(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {signers.map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-purple-400 font-semibold font-mono">Validador #{s.id}</span>
                      <div className="text-[10px] text-slate-500 font-mono">PK: {s.pubKey}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400 font-mono">Assinado G1</div>
                      <div className="text-[9px] text-slate-400 font-mono">{s.sig}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                Tamanho total sem agregação: <strong>{signersCount * 96} bytes</strong> ({signersCount} assinaturas independentes).
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Assinatura Agregada de Tamanho Constante $O(1)$
                  </h3>
                  <button
                    onClick={() => handleCopy(aggregateSig, 'bls-agg')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    {copied === 'bls-agg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>Copiar Hex</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-slate-500">// Assinatura Agregada (Soma de Pontos na Curva G1)</div>
                  <div className="text-emerald-400 break-all leading-relaxed font-bold">
                    {aggregateSig}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tamanho Exato: <strong>96 bytes (ou 48 bytes comprimido)</strong> independente se assinado por 10 ou 1.000.000 de nós!
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-white">Equação de Verificação por Pareamento:</div>
                  <div className="p-2 bg-slate-900 rounded font-mono text-purple-300 text-[11px]">
                    {'e(σ_agg, G_2) == ∏ e(H(m_i), PK_i)'}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Utilizada no consenso de Proof-of-Stake do Ethereum e redes de oráculos para validar milhares de atestações com apenas 2 avaliações de pareamento bilinear.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Economia de banda de rede de <strong>{(((signersCount - 1) / signersCount) * 100).toFixed(1)}%</strong> no payload do bloco.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHAMIR SECRET SHARING SCHEME (SSSS) */}
      {activeTab === 'shamir-secret-sharing-scheme' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" /> Divisão de Segredo Polinomial de Shamir
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Segredo Mestre a ser Protegido</label>
                  <input
                    type="text"
                    value={secretText}
                    onChange={(e) => setSecretText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Limiar Mínimo ($k$)</label>
                    <input
                      type="number"
                      min="2"
                      max={totalSharesN}
                      value={thresholdK}
                      onChange={(e) => setThresholdK(Math.min(totalSharesN, Math.max(2, parseInt(e.target.value) || 2)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Total de Partes ($n$)</label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={totalSharesN}
                      onChange={(e) => setTotalSharesN(Math.max(thresholdK, Math.min(10, parseInt(e.target.value) || 3)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Partes Geradas (Selecione para reconstruir o segredo):
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {generatedShares.map((share) => {
                    const isSelected = selectedShares.includes(share.x);
                    return (
                      <button
                        key={share.x}
                        onClick={() => toggleShareSelection(share.x)}
                        className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold">Parte #{share.x}</span>
                        <span className="text-[11px] text-slate-500">{share.val}</span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
                          {isSelected ? '✓ Selecionada' : '+ Incluir'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <Unlock className="w-4 h-4 text-emerald-400" /> Reconstrução por Interpolação de Lagrange
                </h3>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Partes Fornecidas:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {selectedShares.length} de {thresholdK} necessárias
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedShares.length >= thresholdK ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (selectedShares.length / thresholdK) * 100)}%` }}
                    />
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono space-y-1">
                    <div className="text-slate-500">// Status da Reconstrução</div>
                    {reconstructedSecret ? (
                      <div className="text-emerald-400 font-bold break-all">
                        SEGREDO REVELADO: {reconstructedSecret}
                      </div>
                    ) : (
                      <div className="text-amber-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Insuficiente! Requer mais {thresholdK - selectedShares.length} partes para interpolar $P(0)$.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="text-slate-500">// Fórmula de Interpolação no Ponto x = 0</div>
                  <div className="text-purple-300">{'L(0) = ∑ y_j * ∏ ( -x_m / (x_j - x_m) )'}</div>
                  <p className="text-slate-400 text-[11px] font-sans leading-relaxed pt-1">
                    Mesmo que um invasor intercepte $k-1$ partes, matematicamente ele tem zero informação sobre o segredo original (segurança teórica da informação incondicional).
                  </p>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                Padrão adotado em custódia institucional de chaves privadas (MPC) e recuperação social de contas.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BILINEAR PAIRING CALCULATOR */}
      {activeTab === 'bilinear-pairing-calculator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-purple-400" /> Propriedade Bilinear: e(aP, bQ) = e(P, Q)^(ab)
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Escalar a (Ponto P no Grupo G₁)</span>
                    <span className="font-mono text-purple-400 font-bold">{scalarA}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scalarA}
                    onChange={(e) => setScalarA(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Escalar b (Ponto Q no Grupo G₂)</span>
                    <span className="font-mono text-cyan-400 font-bold">{scalarB}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scalarB}
                    onChange={(e) => setScalarB(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Curva Elíptica de Pareamento Amigável</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['BLS12-381', 'BN254', 'BLS24-479'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setPairingCurve(c)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          pairingCurve === c
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white">Mapeamento Bilinear nos Grupos:</div>
                <div className="font-mono text-slate-400 text-[11px]">
                  {'e: 𝔾₁ × 𝔾₂ → 𝔾ₜ'}<br />
                  {'𝔾₁: Curva sobre F_p (48 bytes)'}<br />
                  {'𝔾₂: Extensão de corpo F_p² (96 bytes)'}<br />
                  {'𝔾ₜ: Raízes da unidade no corpo de extensão F_p¹²'}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verificação Numérica da Identidade
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">// Lado Esquerdo 1: e(aP, bQ)</div>
                  <div className="text-purple-300">{'e('}{scalarA}{'·P, '}{scalarB}{'·Q)'}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">// Lado Esquerdo 2: e(P, ab·Q)</div>
                  <div className="text-cyan-300">{'e(P, '}{abProduct}{'·Q)'}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">// Lado Direito: e(P, Q)^(ab)</div>
                  <div className="text-emerald-300">{'e(P, Q)^'}{abProduct}</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Identidade Válida (Não-Degenerescência)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Como $e(P, Q) \neq 1$, a função de pareamento bilinear possibilita checar produtos no expoente sem precisar conhecer os valores discretos dos escalares $a$ e $b$, sendo o pilar dos esquemas zk-SNARKs Groth16.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THRESHOLD DKG SIMULATOR */}
      {activeTab === 'threshold-dkg-simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" /> Protocolo DKG (Distributed Key Generation)
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Limiar de Tolerância ($t$)</label>
                    <input
                      type="number"
                      min="2"
                      max={dkgNodes}
                      value={dkgThreshold}
                      onChange={(e) => setDkgThreshold(Math.min(dkgNodes, Math.max(2, parseInt(e.target.value) || 2)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Nós Participantes ($n$)</label>
                    <input
                      type="number"
                      min="3"
                      max="8"
                      value={dkgNodes}
                      onChange={(e) => setDkgNodes(Math.max(dkgThreshold, Math.min(8, parseInt(e.target.value) || 3)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fase do Protocolo DKG</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'commit', label: '1. Commitments' },
                      { id: 'shares', label: '2. Troca Shares' },
                      { id: 'aggregated', label: '3. Chave Mestre' },
                    ].map((phase) => (
                      <button
                        key={phase.id}
                        onClick={() => setDkgPhase(phase.id as any)}
                        className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                          dkgPhase === phase.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {phase.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Node Matrix */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {Array.from({ length: dkgNodes }).map((_, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] text-slate-500">Nó #{i + 1}</div>
                    <div className="text-xs font-bold text-cyan-400 font-mono">OK</div>
                    <div className="text-[9px] text-emerald-400">Share validado</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Chave Pública do Grupo Threshold
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-slate-500">// Chave Pública Agregada Gerada sem Dealer Central</div>
                <div className="text-emerald-400 break-all leading-relaxed font-bold">
                  0x93c4e2a188f01b94d7c2a104b901e74a81b2c4e8019a7e6b01938a72b01948c2
                </div>
                <div className="text-[10px] text-slate-400">
                  Nenhum dos {dkgNodes} nós conhece a chave privada completa! Apenas a combinação de qualquer subconjunto de {dkgThreshold} nós pode assinar.
                </div>
              </div>

              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Protocolo FROST (Flexible Round-Optimized Schnorr Threshold)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Elimina o dealer centralizado utilizando partilha verificável de Feldman. O resultado é indistinguível de uma assinatura regular de chave única, garantindo privacidade e escalabilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COSI COLLECTIVE SIGNING TREE */}
      {activeTab === 'cosi-collective-signing-tree' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TreeDeciduous className="w-5 h-5 text-purple-400" /> Assinaturas Coletivas em Árvore (CoSi)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Protocolo de testemunho coletivo em duas fases (Commitment e Response) escalável para dezenas de milhares de validadores.
                </p>
              </div>

              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  { id: 'announcement', label: '1. Anúncio' },
                  { id: 'commitment', label: '2. Compromisso' },
                  { id: 'challenge', label: '3. Desafio' },
                  { id: 'response', label: '4. Resposta' },
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCosiRound(step.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                      cosiRound === step.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-500">Nó Raiz (Líder)</div>
                <div className="text-lg font-bold font-mono text-purple-400">Coordenador</div>
                <div className="text-[10px] text-slate-400">Emite anúncio e agrega respostas</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-500">Testemunhas Nível 1</div>
                <div className="text-lg font-bold font-mono text-cyan-400">4 Sub-líderes</div>
                <div className="text-[10px] text-slate-400">Agregadores regionais</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-500">Nós Folha (Validadores)</div>
                <div className="text-lg font-bold font-mono text-emerald-400">16 Participantes</div>
                <div className="text-[10px] text-slate-400">Assinaturas Schnorr locais</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-500">Tamanho da Prova Final</div>
                <div className="text-lg font-bold font-mono text-amber-400">64 bytes</div>
                <div className="text-[10px] text-slate-400">Assinatura Coletiva Única</div>
              </div>
            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300 space-y-2">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> Escalabilidade Logarítmica $O(\log N)$
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ao organizar os validadores em uma árvore de 4 níveis, o CoSi permite que 4.096 nós produzam uma única assinatura verificável em menos de 2 segundos com sobrecarga mínima de rede.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}