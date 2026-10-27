'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Cpu, 
  Activity, 
  Layers, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Hash, 
  ArrowRight,
  HelpCircle,
  Binary
} from 'lucide-react';

interface HomomorphicAndZkpSuiteProps {
  defaultTab?: 'paillier-homomorphic' | 'bfv-ring-lwe' | 'zk-snarks' | 'bulletproofs' | 'privacy-paradigms';
}

export const HomomorphicAndZkpSuite: React.FC<HomomorphicAndZkpSuiteProps> = ({ 
  defaultTab = 'paillier-homomorphic' 
}) => {
  const [activeTab, setActiveTab] = useState<'paillier-homomorphic' | 'bfv-ring-lwe' | 'zk-snarks' | 'bulletproofs' | 'privacy-paradigms'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Helper para MDC (Maior Divisor Comum)
  const gcd = (a: bigint, b: bigint): bigint => {
    while (b > BigInt(0)) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  // Inverso modular
  const modInverse = (a: bigint, m: bigint): bigint => {
    let [m0, x0, x1] = [m, BigInt(0), BigInt(1)];
    if (m === BigInt(1)) return BigInt(0);
    while (a > BigInt(1)) {
      const q = a / m;
      let t = m;
      m = a % m;
      a = t;
      t = x0;
      x0 = x1 - q * x0;
      x1 = t;
    }
    if (x1 < BigInt(0)) x1 += m0;
    return x1;
  };

  // Exponenciação modular segura
  const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
    let res = BigInt(1);
    base = base % mod;
    while (exp > BigInt(0)) {
      if (exp % BigInt(2) === BigInt(1)) res = (res * base) % mod;
      exp = exp / BigInt(2);
      base = (base * base) % mod;
    }
    return res;
  };

  // =========================================================================
  // FERRAMENTA 1: CRIPTOSSISTEMA HOMOMÓRFICO ADITIVO DE PAILLIER (1999)
  // =========================================================================
  const [paillierM1, setPaillierM1] = useState<number>(45);
  const [paillierM2, setPaillierM2] = useState<number>(30);
  const [scalarK, setScalarK] = useState<number>(3);

  // Parâmetros Paillier simplificados para demonstração matemática exata
  const paillierData = useMemo(() => {
    const p = BigInt(61);
    const q = BigInt(53);
    const n = p * q;
    const n2 = n * n;
    const lambda = ((p - BigInt(1)) * (q - BigInt(1))) / gcd(p - BigInt(1), q - BigInt(1));
    const g = n + BigInt(1);

    // L(u) = (u - 1) / n
    const L = (u: bigint) => (u - BigInt(1)) / n;
    const u = modPow(g, lambda, n2);
    const mu = modInverse(L(u), n);

    // Cifragem Paillier: c = g^m * r^n mod n^2
    const r1 = BigInt(17);
    const r2 = BigInt(23);

    const m1Big = BigInt(paillierM1);
    const m2Big = BigInt(paillierM2);
    const kBig = BigInt(scalarK);

    const c1 = (modPow(g, m1Big, n2) * modPow(r1, n, n2)) % n2;
    const c2 = (modPow(g, m2Big, n2) * modPow(r2, n, n2)) % n2;

    // Homomorfismo Aditivo: c_sum = c1 * c2 mod n^2
    const cSum = (c1 * c2) % n2;

    // Homomorfismo Escalar: c_scaled = c1^k mod n^2
    const cScaled = modPow(c1, kBig, n2);

    // Decifragem: m = L(c^lambda mod n^2) * mu mod n
    const decrypt = (c: bigint) => {
      const cLambda = modPow(c, lambda, n2);
      return (L(cLambda) * mu) % n;
    };

    const decryptedSum = decrypt(cSum);
    const decryptedScaled = decrypt(cScaled);

    return {
      n: n.toString(),
      n2: n2.toString(),
      c1: c1.toString(),
      c2: c2.toString(),
      cSum: cSum.toString(),
      cScaled: cScaled.toString(),
      decryptedSum: Number(decryptedSum),
      decryptedScaled: Number(decryptedScaled),
      expectedSum: paillierM1 + paillierM2,
      expectedScaled: paillierM1 * scalarK
    };
  }, [paillierM1, paillierM2, scalarK]);

  // =========================================================================
  // FERRAMENTA 2: AVALIADOR BFV RING-LWE & NOISE BUDGET
  // =========================================================================
  const [polyDegreeN, setPolyDegreeN] = useState<number>(2048);
  const [multDepth, setMultDepth] = useState<number>(2);

  const bfvStats = useMemo(() => {
    // Parâmetros típicos BFV (Brakerski-Fan-Vercauteren)
    const totalNoiseBudgetBits = polyDegreeN === 1024 ? 27 : polyDegreeN === 2048 ? 54 : 109;
    const noisePerMultiplicationBits = 18; // cada multiplicação polinomial consome ruído substancial
    const noisePerAdditionBits = 0.5;

    const consumedBits = multDepth * noisePerMultiplicationBits;
    const remainingBudgetBits = Math.max(0, totalNoiseBudgetBits - consumedBits);
    const budgetPercent = (remainingBudgetBits / totalNoiseBudgetBits) * 100;
    const isExhausted = remainingBudgetBits <= 0;

    return {
      totalNoiseBudgetBits,
      consumedBits,
      remainingBudgetBits: remainingBudgetBits.toFixed(1),
      budgetPercent: budgetPercent.toFixed(1),
      isExhausted,
      ringModuloQ: polyDegreeN === 1024 ? '128-bit Solinas' : polyDegreeN === 2048 ? '218-bit RNS' : '438-bit Multi-Prime'
    };
  }, [polyDegreeN, multDepth]);

  // =========================================================================
  // FERRAMENTA 3: VERIFICADOR zk-SNARKs GROTH16
  // =========================================================================
  const [secretPreimage, setSecretPreimage] = useState<number>(42);
  const [isTamperedProof, setIsTamperedProof] = useState<boolean>(false);

  const groth16Proof = useMemo(() => {
    // Curva BN254 / Alt-bn128
    const publicStatement = secretPreimage * secretPreimage + 7; // R1CS constraint: x^2 + 7 = y
    const piA = isTamperedProof 
      ? '0x1a8f9b... [G1 Alterado / Assinatura Corrompida]' 
      : '0x2bf98e1049c8821aa904b771e830c241904aef7710bca90849204128aae091f0';
    const piB = '0x10948b8129034afc...0x892a40b12e987110 [G2 128 bytes]';
    const piC = '0x74a01948beef2133... [G1 64 bytes]';
    const isValid = !isTamperedProof;

    return {
      publicStatement,
      piA,
      piB,
      piC,
      isValid,
      pairingEquation: 'e(pi_A, pi_B) = e(alpha, beta) * e(x * gamma, delta) * e(pi_C, delta)'
    };
  }, [secretPreimage, isTamperedProof]);

  // =========================================================================
  // FERRAMENTA 4: GERADOR DE BULLETPROOFS RANGE PROOFS
  // =========================================================================
  const [bulletproofValue, setBulletproofValue] = useState<number>(25000); // R$ 25.000 confidenciais
  const [rangeBits, setRangeBits] = useState<number>(32); // [0, 2^32 - 1]

  const bulletproofStats = useMemo(() => {
    const maxValue = Math.pow(2, rangeBits) - 1;
    const isWithinRange = bulletproofValue >= 0 && bulletproofValue <= maxValue;
    // Tamanho da prova logarítmica: 2 * log2(n) + 9 elementos de grupo
    const groupElements = 2 * Math.log2(rangeBits) + 9;
    const proofBytes = Math.round(groupElements * 32); // elementos Ristretto de 32 bytes

    return {
      maxValue: maxValue.toLocaleString(),
      isWithinRange,
      proofBytes,
      pedersenCommitment: `0x7f4019a2b8... [C = ${bulletproofValue}*G + r*H]`,
      trustedSetupNeeded: 'Nenhum (Zero Trusted Setup / Transparente)'
    };
  }, [bulletproofValue, rangeBits]);

  // =========================================================================
  // FERRAMENTA 5: COMPARADOR DE PARADIGMAS DE PRIVACIDADE
  // =========================================================================
  const privacyParadigms = [
    {
      name: 'FHE (Fully Homomorphic Encryption)',
      schemes: 'BFV, CKKS, BGV, TFHE',
      coreConcept: 'Permite operações matemáticas arbitrárias sobre dados cifrados sem revelar as entradas.',
      overhead: '1.000x a 100.000x',
      hardwareSpecial: 'Nenhum (pura criptografia Ring-LWE)',
      trustedSetup: 'Não',
      bestUse: 'IA confidencial em nuvem, análise de DNA e scoring bancário cego.'
    },
    {
      name: 'ZKP (Zero-Knowledge Proofs)',
      schemes: 'Groth16, Plonk, zk-STARKs, Bulletproofs',
      coreConcept: 'Permite provar a validade matemática de uma afirmação sem revelar o segredo em si.',
      overhead: '10x a 100x na geração / 1x na verificação',
      hardwareSpecial: 'Nenhum',
      trustedSetup: 'Depende (Groth16: Sim / STARKs: Não / Bulletproofs: Não)',
      bestUse: 'Identidade soberana (SSI), transações anônimas, Rollups Layer 2.'
    },
    {
      name: 'MPC (Secure Multi-Party Computation)',
      schemes: 'Shamir Secret Sharing, Garbled Circuits',
      coreConcept: 'Divide os dados em frações entre múltiplos servidores independentes para computação conjunta.',
      overhead: 'Limitado por latência de rede',
      hardwareSpecial: 'Nenhum',
      trustedSetup: 'Não',
      bestUse: 'Custódia de chaves privadas (Wallets sem seed phrase) e leilões cegos.'
    },
    {
      name: 'TEE (Confidential Computing)',
      schemes: 'Intel SGX, AMD SEV, AWS Nitro',
      coreConcept: 'Enclave de hardware isolado da memória do SO e hypervisor com atestação criptográfica.',
      overhead: '1.1x a 1.5x (Quase nativo)',
      hardwareSpecial: 'Sim (CPUs corporativas dedicadas)',
      trustedSetup: 'Confiança no fabricante da CPU (Intel/AMD)',
      bestUse: 'Processamento confidencial de alta performance em larga escala.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header da Suíte */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                Homomorphic Encryption · ZKP
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
                Privacy-Preserving Tech
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                Marco 370 Ferramentas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
              Suíte de Criptografia Homomórfica & Zero-Knowledge Proofs (ZKP)
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Execute cálculos diretamente sobre dados cifrados e valide afirmações sem revelar segredos: simulador homomórfico aditivo de Paillier, avaliação BFV Ring-LWE com Noise Budget, verificador zk-SNARKs Groth16 e provas de intervalo Bulletproofs.
            </p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800 text-sm scrollbar-thin">
          <button
            onClick={() => setActiveTab('paillier-homomorphic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'paillier-homomorphic'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-4 h-4" />
            1. Homomórfico Aditivo (Paillier)
          </button>
          <button
            onClick={() => setActiveTab('bfv-ring-lwe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'bfv-ring-lwe'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Binary className="w-4 h-4" />
            2. BFV Ring-LWE & Noise Budget
          </button>
          <button
            onClick={() => setActiveTab('zk-snarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'zk-snarks'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            3. zk-SNARKs Groth16
          </button>
          <button
            onClick={() => setActiveTab('bulletproofs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'bulletproofs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            4. Bulletproofs Range Proofs
          </button>
          <button
            onClick={() => setActiveTab('privacy-paradigms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'privacy-paradigms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            5. Comparador FHE vs ZKP vs MPC
          </button>
        </div>
      </div>

      {/* ABA 1: HOMOMÓRFICO ADITIVO DE PAILLIER */}
      {activeTab === 'paillier-homomorphic' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Criptossistema Homomórfico Aditivo de Paillier (1999)
              </h2>
              <p className="text-slate-400 text-sm">
                Multiplique ciphertexts no domínio criptográfico para somar números secretos sem decifrá-los: D(E(m1) * E(m2) mod n^2) = m1 + m2.
              </p>
            </div>
          </div>

          {/* Entradas de Números Secretos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Mensagem Secreta 1 (m1):</label>
              <input
                type="number"
                min="1"
                max="500"
                value={paillierM1}
                onChange={e => setPaillierM1(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Mensagem Secreta 2 (m2):</label>
              <input
                type="number"
                min="1"
                max="500"
                value={paillierM2}
                onChange={e => setPaillierM2(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Escalar Multiplicativo (k):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={scalarK}
                onChange={e => setScalarK(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Demonstração Matemática Passo a Passo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1">
                OPERAÇÃO HOMOMÓRFICA 1: SOMA DIRETA (E(m1) * E(m2))
              </span>
              <div>
                <span className="text-slate-500 block">Ciphertext E(m1):</span>
                <span className="text-cyan-300 font-semibold">{paillierData.c1}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ciphertext E(m2):</span>
                <span className="text-cyan-300 font-semibold">{paillierData.c2}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block mb-1">PRODUTO CIPHERTEXT (E_sum):</span>
                <span className="text-amber-400 font-bold break-all">{paillierData.cSum}</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800 p-2.5 rounded text-emerald-300 flex items-center justify-between">
                <span>Resultado Decifrado D(E_sum):</span>
                <span className="text-base font-bold text-emerald-400">{paillierData.decryptedSum} (Esperado: {paillierData.expectedSum})</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <span className="text-indigo-400 font-bold block border-b border-slate-800 pb-1">
                OPERAÇÃO HOMOMÓRFICA 2: ESCALAR (E(m1)^k)
              </span>
              <div>
                <span className="text-slate-500 block">Ciphertext Original E(m1):</span>
                <span className="text-cyan-300 font-semibold">{paillierData.c1}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fator Escalar:</span>
                <span className="text-white font-bold">{scalarK}x</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block mb-1">POTÊNCIA CIPHERTEXT (E_scaled):</span>
                <span className="text-amber-400 font-bold break-all">{paillierData.cScaled}</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800 p-2.5 rounded text-emerald-300 flex items-center justify-between">
                <span>Resultado Decifrado D(E_scaled):</span>
                <span className="text-base font-bold text-emerald-400">{paillierData.decryptedScaled} (Esperado: {paillierData.expectedScaled})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: BFV RING-LWE & NOISE BUDGET */}
      {activeTab === 'bfv-ring-lwe' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Binary className="w-5 h-5 text-cyan-400" />
                Avaliador BFV (Brakerski-Fan-Vercauteren) Ring-LWE & Noise Budget
              </h2>
              <p className="text-slate-400 text-sm">
                Monitore o consumo do orçamento de ruído em operações criptografadas simultâneas de adição e multiplicação em FHE.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPolyDegreeN(1024)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  polyDegreeN === 1024 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                N = 1024 (Rápido)
              </button>
              <button
                onClick={() => setPolyDegreeN(2048)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  polyDegreeN === 2048 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                N = 2048 (Padrão)
              </button>
              <button
                onClick={() => setPolyDegreeN(4096)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  polyDegreeN === 4096 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                N = 4096 (Deep FHE)
              </button>
            </div>
          </div>

          {/* Ajuste de Profundidade Multiplicativa */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Profundidade de Multiplicações Homomórficas Consecutivas (Depth L):</span>
              <span className="text-cyan-400 font-bold font-mono">{multDepth} multiplicações</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={multDepth}
              onChange={e => setMultDepth(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Barra de Progresso do Noise Budget */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">ORÇAMENTO DE RUÍDO RESTANTE (NOISE BUDGET):</span>
              <span className={`font-bold ${bfvStats.isExhausted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {bfvStats.remainingBudgetBits} / {bfvStats.totalNoiseBudgetBits} bits ({bfvStats.budgetPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  bfvStats.isExhausted ? 'bg-rose-500' :
                  Number(bfvStats.budgetPercent) < 30 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, Number(bfvStats.budgetPercent)))}%` }}
              ></div>
            </div>

            {bfvStats.isExhausted ? (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ORÇAMENTO ESGOTADO: O ruído acumulado ultrapassou o módulo q. A decifragem resultará em corrupção a menos que seja executado o procedimento de <strong>Bootstrapping</strong>.</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>ORÇAMENTO SEGURO: A decifragem recuperará o polinômio exato com 100% de precisão matemática.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: zk-SNARKs GROTH16 */}
      {activeTab === 'zk-snarks' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-cyan-400" />
                Verificador zk-SNARKs (Protocolo Groth16 sobre Curva BN254)
              </h2>
              <p className="text-slate-400 text-sm">
                Valide o conhecimento de um segredo (testemunha w) sem expor seu valor usando pareamentos bilineares na curva elíptica.
              </p>
            </div>
            <button
              onClick={() => setIsTamperedProof(!isTamperedProof)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isTamperedProof ? 'bg-rose-600 text-white font-bold' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isTamperedProof ? 'Restaurar Prova Original' : 'Corromper Prova (Simular Ataque)'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block">SEGREDO OCULTO DO PROVADOR (WITNESS w):</span>
                <span className="text-white font-bold text-sm">w = {secretPreimage} (CONFIDENCIAL)</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block">DECLARAÇÃO PÚBLICA VERIFICÁVEL (y = w^2 + 7):</span>
                <span className="text-cyan-400 font-bold text-sm">y = {groth16Proof.publicStatement}</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="text-slate-400">PONTOS DA PROVA ZK (ELEMENTOS DE GRUPO GROTH16):</div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 break-all text-indigo-300">
                pi_A (G1): {groth16Proof.piA}
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 break-all text-indigo-300">
                pi_B (G2): {groth16Proof.piB}
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 break-all text-indigo-300">
                pi_C (G1): {groth16Proof.piC}
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
              groth16Proof.isValid
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800 text-rose-400'
            }`}>
              {groth16Proof.isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">PAREAMENTO BILINEAR VÁLIDO (VERIFICAÇÃO SUCESSO):</span>
                    <span className="font-sans font-normal text-slate-300">
                      A prova confirma com certeza matemática que o provador conhece o segredo w tal que w^2 + 7 = {groth16Proof.publicStatement}, sem vazar 1 único bit sobre o valor real de w!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">PAREAMENTO INVÁLIDO (FALHA CRIPTOGRÁFICA):</span>
                    <span className="font-sans font-normal text-slate-300">
                      e(pi_A, pi_B) não satisfaz o produto do target group. Prova forjada ou rejeitada pelo verificador!
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: BULLETPROOFS RANGE PROOFS */}
      {activeTab === 'bulletproofs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Gerador de Bulletproofs Range Proofs (Zero Trusted Setup)
              </h2>
              <p className="text-slate-400 text-sm">
                Comprove que um valor financeiro secreto v está no intervalo [0, 2^n - 1] sem revelar o saldo e sem cerimônia de setup confiável.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Valor Financeiro Confidencial (v):</label>
              <input
                type="number"
                min="0"
                value={bulletproofValue}
                onChange={e => setBulletproofValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tamanho do Intervalo em Bits (n):</label>
              <select
                value={rangeBits}
                onChange={e => setRangeBits(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              >
                <option value={16}>16 bits (0 a 65.535)</option>
                <option value={32}>32 bits (0 a 4.294.967.295)</option>
                <option value={64}>64 bits (Padrão Financeiro Confidencial)</option>
              </select>
            </div>
          </div>

          {/* Cards de Métricas Bulletproofs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Tamanho da Prova</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{bulletproofStats.proofBytes} Bytes</div>
              <div className="text-[10px] text-slate-500 mt-1">O(log n) ultra compacto</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Trusted Setup</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">{bulletproofStats.trustedSetupNeeded}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Limite Máximo</div>
              <div className="text-sm font-bold text-white mt-1">{bulletproofStats.maxValue}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Status da Prova</div>
              <div className={`text-sm font-bold mt-1 ${bulletproofStats.isWithinRange ? 'text-emerald-400' : 'text-rose-400'}`}>
                {bulletproofStats.isWithinRange ? 'Válida no Intervalo' : 'Fora do Intervalo'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: COMPARADOR DE PARADIGMAS */}
      {activeTab === 'privacy-paradigms' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Matriz Comparativa: FHE vs ZKP vs MPC vs TEE
              </h2>
              <p className="text-slate-400 text-sm">
                Guia de decisão arquitetural para computação confidencial e preservação soberana de privacidade.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tecnologia</th>
                  <th className="py-3 px-4">Esquemas & Padrões</th>
                  <th className="py-3 px-4">Overhead Computacional</th>
                  <th className="py-3 px-4">Hardware Específico</th>
                  <th className="py-3 px-4">Casos de Uso Primários</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {privacyParadigms.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-4 text-cyan-300">{p.schemes}</td>
                    <td className="py-3 px-4 text-amber-300 font-semibold">{p.overhead}</td>
                    <td className="py-3 px-4 text-slate-400">{p.hardwareSpecial}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{p.bestUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
