'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Cpu, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Hash, 
  Sliders, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PostQuantumCryptographySuiteProps {
  defaultTab?: 'kyber-kem' | 'dilithium-dsa' | 'sphincs-hash' | 'pqc-overhead' | 'shor-threat';
}

export const PostQuantumCryptographySuite: React.FC<PostQuantumCryptographySuiteProps> = ({ 
  defaultTab = 'kyber-kem' 
}) => {
  const [activeTab, setActiveTab] = useState<'kyber-kem' | 'dilithium-dsa' | 'sphincs-hash' | 'pqc-overhead' | 'shor-threat'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Helper para gerar hex aleatório seguro
  const generateRandomHex = (bytesCount: number): string => {
    const arr = new Uint8Array(bytesCount);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < bytesCount; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // =========================================================================
  // FERRAMENTA 1: SIMULADOR ML-KEM (CRYSTALS-KYBER FIPS 203)
  // =========================================================================
  const [kyberVariant, setKyberVariant] = useState<'kyber-512' | 'kyber-768' | 'kyber-1024'>('kyber-768');
  const [kyberState, setKyberState] = useState<{
    hasKeys: boolean;
    publicKey: string;
    secretKey: string;
    hasCiphertext: boolean;
    ciphertext: string;
    sharedSecretSender: string;
    sharedSecretReceiver: string;
    verified: boolean;
    stepDetails: string;
  }>({
    hasKeys: false,
    publicKey: '',
    secretKey: '',
    hasCiphertext: false,
    ciphertext: '',
    sharedSecretSender: '',
    sharedSecretReceiver: '',
    verified: false,
    stepDetails: 'Aguardando geração do par de chaves ML-KEM no anel polinomial R_q.'
  });

  const kyberSpecs = useMemo(() => {
    switch (kyberVariant) {
      case 'kyber-512':
        return { name: 'ML-KEM-512 (Kyber-512)', nistLevel: 'Nível 1 (AES-128)', pkSize: 800, skSize: 1632, ctSize: 768, k: 2 };
      case 'kyber-768':
        return { name: 'ML-KEM-768 (Kyber-768)', nistLevel: 'Nível 3 (AES-192)', pkSize: 1184, skSize: 2400, ctSize: 1088, k: 3 };
      case 'kyber-1024':
        return { name: 'ML-KEM-1024 (Kyber-1024)', nistLevel: 'Nível 5 (AES-256)', pkSize: 1568, skSize: 3168, ctSize: 1568, k: 4 };
    }
  }, [kyberVariant]);

  const handleKyberGenerateKeys = () => {
    const pkHex = generateRandomHex(64); // visual representative
    const skHex = generateRandomHex(96);
    setKyberState({
      hasKeys: true,
      publicKey: `0x${pkHex}... [${kyberSpecs.pkSize} bytes compactados em R_q (q=3329)]`,
      secretKey: `0x${skHex}... [${kyberSpecs.skSize} bytes coeficientes de segredo s]`,
      hasCiphertext: false,
      ciphertext: '',
      sharedSecretSender: '',
      sharedSecretReceiver: '',
      verified: false,
      stepDetails: `Par gerado com sucesso para ${kyberSpecs.name}: Matriz A em R_q^(${kyberSpecs.k}x${kyberSpecs.k}) amostrada com SHAKE-128 + ruído CBD (η=2).`
    });
  };

  const handleKyberEncapsulate = () => {
    if (!kyberState.hasKeys) return;
    const ctHex = generateRandomHex(48);
    const ssHex = generateRandomHex(32); // 256 bits shared secret
    setKyberState(prev => ({
      ...prev,
      hasCiphertext: true,
      ciphertext: `0x${ctHex}... [${kyberSpecs.ctSize} bytes de u e v quantizados]`,
      sharedSecretSender: ssHex,
      sharedSecretReceiver: '',
      verified: false,
      stepDetails: 'Encapsulamento executado: vetor de erro r gerado, vetor u = A^T * r + e1, v = t^T * r + e2 + Decompress(m). Segredo K derived via SHA3-256(m, H(pk)).'
    }));
  };

  const handleKyberDecapsulate = () => {
    if (!kyberState.hasCiphertext) return;
    setKyberState(prev => ({
      ...prev,
      sharedSecretReceiver: prev.sharedSecretSender,
      verified: true,
      stepDetails: 'Decapsulamento concluído: mensagem m recuperada via Compress(v - s^T * u). Teste de Fujisaki-Okamoto bem sucedido: Shared Secret idêntico em ambos os lados!'
    }));
  };

  // =========================================================================
  // FERRAMENTA 2: ASSINADOR DIGITAL ML-DSA (CRYSTALS-DILITHIUM FIPS 204)
  // =========================================================================
  const [dsaVariant, setDsaVariant] = useState<'dsa-44' | 'dsa-65' | 'dsa-87'>('dsa-65');
  const [dsaMessage, setDsaMessage] = useState<string>('Autorizacao de transferencia financeira soberana via Holding V5 Apollo #11');
  const [dsaState, setDsaState] = useState<{
    hasKeys: boolean;
    publicKey: string;
    privateKey: string;
    hasSignature: boolean;
    signature: string;
    signatureBytes: number;
    verificationStatus: 'idle' | 'valid' | 'invalid';
  }>({
    hasKeys: false,
    publicKey: '',
    privateKey: '',
    hasSignature: false,
    signature: '',
    signatureBytes: 0,
    verificationStatus: 'idle'
  });

  const dsaSpecs = useMemo(() => {
    switch (dsaVariant) {
      case 'dsa-44':
        return { name: 'ML-DSA-44 (Dilithium-2)', nistLevel: 'Nível 2', pkBytes: 1312, skBytes: 2560, sigBytes: 2420, matrix: '4x4' };
      case 'dsa-65':
        return { name: 'ML-DSA-65 (Dilithium-3)', nistLevel: 'Nível 3', pkBytes: 1952, skBytes: 4032, sigBytes: 3309, matrix: '6x5' };
      case 'dsa-87':
        return { name: 'ML-DSA-87 (Dilithium-5)', nistLevel: 'Nível 5', pkBytes: 2592, skBytes: 4896, sigBytes: 4627, matrix: '8x7' };
    }
  }, [dsaVariant]);

  const handleDsaKeyGen = () => {
    setDsaState({
      hasKeys: true,
      publicKey: `0x${generateRandomHex(32)}... [${dsaSpecs.pkBytes} bytes: seed rho + vetor t1 compactado]`,
      privateKey: `0x${generateRandomHex(48)}... [${dsaSpecs.skBytes} bytes: rho, K, tr, s1, s2, t0]`,
      hasSignature: false,
      signature: '',
      signatureBytes: dsaSpecs.sigBytes,
      verificationStatus: 'idle'
    });
  };

  const handleDsaSign = () => {
    if (!dsaState.hasKeys) return;
    const sigMock = `0x${generateRandomHex(40)}... [${dsaSpecs.sigBytes} bytes: desafio c compactado + resposta z com amostragem de rejeicao]`;
    setDsaState(prev => ({
      ...prev,
      hasSignature: true,
      signature: sigMock,
      verificationStatus: 'idle'
    }));
  };

  const handleDsaVerify = (tamper: boolean = false) => {
    if (!dsaState.hasSignature) return;
    setDsaState(prev => ({
      ...prev,
      verificationStatus: tamper ? 'invalid' : 'valid'
    }));
  };

  // =========================================================================
  // FERRAMENTA 3: INSPETOR SLH-DSA / SPHINCS+ (FIPS 205)
  // =========================================================================
  const [sphincsVariant, setSphincsVariant] = useState<string>('128f-simple');
  const sphincsCatalog: Record<string, {
    name: string;
    securityBits: number;
    hashFunc: string;
    sigSize: number;
    pkSize: number;
    treeHeight: number;
    layers: number;
    forsTrees: number;
    forsLeaves: number;
    targetSpeed: string;
  }> = {
    '128s-simple': { name: 'SLH-DSA-SHAKE-128s', securityBits: 128, hashFunc: 'SHAKE-256', sigSize: 7856, pkSize: 32, treeHeight: 63, layers: 7, forsTrees: 14, forsLeaves: 16, targetSpeed: 'Otimizado para Menor Assinatura (Small)' },
    '128f-simple': { name: 'SLH-DSA-SHAKE-128f', securityBits: 128, hashFunc: 'SHAKE-256', sigSize: 17088, pkSize: 32, treeHeight: 66, layers: 22, forsTrees: 33, forsLeaves: 6, targetSpeed: 'Otimizado para Velocidade (Fast)' },
    '192s-simple': { name: 'SLH-DSA-SHAKE-192s', securityBits: 192, hashFunc: 'SHAKE-256', sigSize: 16224, pkSize: 48, treeHeight: 63, layers: 7, forsTrees: 17, forsLeaves: 16, targetSpeed: 'Otimizado para Menor Assinatura (Small)' },
    '192f-simple': { name: 'SLH-DSA-SHAKE-192f', securityBits: 192, hashFunc: 'SHAKE-256', sigSize: 35664, pkSize: 48, treeHeight: 66, layers: 22, forsTrees: 33, forsLeaves: 8, targetSpeed: 'Otimizado para Velocidade (Fast)' },
    '256s-simple': { name: 'SLH-DSA-SHAKE-256s', securityBits: 256, hashFunc: 'SHAKE-256', sigSize: 29792, pkSize: 64, treeHeight: 64, layers: 8, forsTrees: 22, forsLeaves: 16, targetSpeed: 'Otimizado para Menor Assinatura (Small)' },
    '256f-simple': { name: 'SLH-DSA-SHAKE-256f', securityBits: 256, hashFunc: 'SHAKE-256', sigSize: 49856, pkSize: 64, treeHeight: 68, layers: 17, forsTrees: 35, forsLeaves: 10, targetSpeed: 'Otimizado para Velocidade (Fast)' },
  };

  const activeSphincs = useMemo(() => sphincsCatalog[sphincsVariant] || sphincsCatalog['128f-simple'], [sphincsVariant]);

  // =========================================================================
  // FERRAMENTA 4: COMPARADOR DE OVERHEAD: CLÁSSICA VS PÓS-QUÂNTICA
  // =========================================================================
  const [comparisonMetric, setComparisonMetric] = useState<'pk' | 'sig-ct' | 'mtu'>('sig-ct');

  const algorithmsBenchmark = [
    { name: 'RSA-2048 (Legado)', type: 'Clássico (Fatoração)', pkBytes: 256, ctOrSigBytes: 256, nistSecLevel: 'Legado (112b)', mtuPackets: 1, brokenByQuantum: true },
    { name: 'RSA-4096 (Legado)', type: 'Clássico (Fatoração)', pkBytes: 512, ctOrSigBytes: 512, nistSecLevel: 'Nível 1 (128b)', mtuPackets: 1, brokenByQuantum: true },
    { name: 'ECDSA P-256 (NIST)', type: 'Clássico (ECDLP)', pkBytes: 64, ctOrSigBytes: 64, nistSecLevel: 'Nível 1 (128b)', mtuPackets: 1, brokenByQuantum: true },
    { name: 'Ed25519 (Bernstein)', type: 'Clássico (Edwards Curve)', pkBytes: 32, ctOrSigBytes: 64, nistSecLevel: 'Nível 1 (128b)', mtuPackets: 1, brokenByQuantum: true },
    { name: 'ML-KEM-768 (Kyber)', type: 'PQC (Module-LWE)', pkBytes: 1184, ctOrSigBytes: 1088, nistSecLevel: 'Nível 3 (192b)', mtuPackets: 1, brokenByQuantum: false },
    { name: 'ML-KEM-1024 (Kyber)', type: 'PQC (Module-LWE)', pkBytes: 1568, ctOrSigBytes: 1568, nistSecLevel: 'Nível 5 (256b)', mtuPackets: 2, brokenByQuantum: false },
    { name: 'ML-DSA-65 (Dilithium)', type: 'PQC (Lattice Signature)', pkBytes: 1952, ctOrSigBytes: 3309, nistSecLevel: 'Nível 3 (192b)', mtuPackets: 3, brokenByQuantum: false },
    { name: 'Falcon-512', type: 'PQC (NTRU Lattice)', pkBytes: 897, ctOrSigBytes: 666, nistSecLevel: 'Nível 1 (128b)', mtuPackets: 1, brokenByQuantum: false },
    { name: 'SLH-DSA-128s (SPHINCS+)', type: 'PQC (Stateless Hash)', pkBytes: 32, ctOrSigBytes: 7856, nistSecLevel: 'Nível 1 (128b)', mtuPackets: 6, brokenByQuantum: false },
    { name: 'SLH-DSA-256f (SPHINCS+)', type: 'PQC (Stateless Hash)', pkBytes: 64, ctOrSigBytes: 49856, nistSecLevel: 'Nível 5 (256b)', mtuPackets: 35, brokenByQuantum: false }
  ];

  // =========================================================================
  // FERRAMENTA 5: CALCULADORA DE QUBITS DO ALGORITMO DE SHOR VS CLÁSSICOS
  // =========================================================================
  const [shorTarget, setShorTarget] = useState<'rsa-2048' | 'rsa-4096' | 'ecc-256' | 'ecc-384'>('rsa-2048');
  const [gateErrorRate, setGateErrorRate] = useState<number>(0.001); // 10^-3 física

  const shorAnalysis = useMemo(() => {
    let keyBits = 2048;
    let algoName = 'RSA-2048';
    let mathType = 'Fatoração de Inteiros (N = p * q)';
    let logicalQubits = 4098; // ~2n + 2 qubits lógicos
    let toffoliGates = '1.2 x 10^11 Toffoli Gates';

    if (shorTarget === 'rsa-2048') {
      keyBits = 2048;
      algoName = 'RSA-2048';
      mathType = 'Fatoração de Inteiros (N = p * q)';
      logicalQubits = 4098;
      toffoliGates = '1.2 x 10^11 Gates';
    } else if (shorTarget === 'rsa-4096') {
      keyBits = 4096;
      algoName = 'RSA-4096';
      mathType = 'Fatoração de Inteiros (N = p * q)';
      logicalQubits = 8194;
      toffoliGates = '9.8 x 10^11 Gates';
    } else if (shorTarget === 'ecc-256') {
      keyBits = 256;
      algoName = 'ECC / ECDSA P-256';
      mathType = 'Logaritmo Discreto de Curvas Elípticas (ECDLP)';
      logicalQubits = 2330; // ~9n qubits lógicos para aritmética elíptica de ponto
      toffoliGates = '1.3 x 10^8 Gates';
    } else {
      keyBits = 384;
      algoName = 'ECC / ECDSA P-384';
      mathType = 'Logaritmo Discreto de Curvas Elípticas (ECDLP)';
      logicalQubits = 3490;
      toffoliGates = '4.1 x 10^8 Gates';
    }

    // Modelo de Código de Superfície (Surface Code)
    // d = 27 para p=10^-3; d = 17 para p=10^-4
    const codeDistance = gateErrorRate <= 0.0001 ? 17 : 27;
    const physicalQubitsPerLogical = 2 * (codeDistance ** 2);
    const totalPhysicalQubits = logicalQubits * physicalQubitsPerLogical;
    const estimatedHoursShor = shorTarget.startsWith('ecc') ? '~9.4 Horas' : '~8.2 Horas (com destilação de estados mágicos)';

    return {
      keyBits,
      algoName,
      mathType,
      logicalQubits,
      toffoliGates,
      codeDistance,
      physicalQubitsPerLogical,
      totalPhysicalQubits,
      estimatedHoursShor
    };
  }, [shorTarget, gateErrorRate]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header da Suíte */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                FIPS 203 · 204 · 205 NIST Standards
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-800/80 text-purple-400">
                PQC Sovereign Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                Marco 355 Ferramentas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
              Suíte de Criptografia Pós-Quântica (PQC) & Algoritmos NIST
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Simule e analise a nova geração de padrões mundiais de segurança resistente a computadores quânticos: ML-KEM (Kyber), ML-DSA (Dilithium), SLH-DSA (SPHINCS+), comparador de overhead TCP/MTU e modelagem de recursos quânticos do Algoritmo de Shor.
            </p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800 text-sm scrollbar-thin">
          <button
            onClick={() => setActiveTab('kyber-kem')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'kyber-kem'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Key className="w-4 h-4" />
            1. ML-KEM (CRYSTALS-Kyber)
          </button>
          <button
            onClick={() => setActiveTab('dilithium-dsa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'dilithium-dsa'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-4 h-4" />
            2. ML-DSA (CRYSTALS-Dilithium)
          </button>
          <button
            onClick={() => setActiveTab('sphincs-hash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'sphincs-hash'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Hash className="w-4 h-4" />
            3. SLH-DSA (SPHINCS+)
          </button>
          <button
            onClick={() => setActiveTab('pqc-overhead')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'pqc-overhead'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            4. Overhead Clássico vs PQC
          </button>
          <button
            onClick={() => setActiveTab('shor-threat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'shor-threat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            5. Calculadora Algoritmo de Shor
          </button>
        </div>
      </div>

      {/* ABA 1: ML-KEM (CRYSTALS-KYBER) */}
      {activeTab === 'kyber-kem' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                Simulador ML-KEM (FIPS 203) - Key Encapsulation Mechanism
              </h2>
              <p className="text-slate-400 text-sm">
                Mecanismo baseado em problemas de reticulados algébricos Module-LWE no anel de polinômios R_q = Z_3329[X]/(X^256 + 1).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setKyberVariant('kyber-512')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  kyberVariant === 'kyber-512' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kyber-512 (L1)
              </button>
              <button
                onClick={() => setKyberVariant('kyber-768')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  kyberVariant === 'kyber-768' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kyber-768 (L3 NIST)
              </button>
              <button
                onClick={() => setKyberVariant('kyber-1024')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  kyberVariant === 'kyber-1024' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kyber-1024 (L5)
              </button>
            </div>
          </div>

          {/* Cards de Métricas do Padrão */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Nível de Segurança</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{kyberSpecs.nistLevel}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Chave Pública (pk)</div>
              <div className="text-sm font-semibold text-white mt-1">{kyberSpecs.pkSize} Bytes</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Chave Privada (sk)</div>
              <div className="text-sm font-semibold text-white mt-1">{kyberSpecs.skSize} Bytes</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Ciphertext (ct)</div>
              <div className="text-sm font-semibold text-emerald-400 mt-1">{kyberSpecs.ctSize} Bytes</div>
            </div>
          </div>

          {/* Fluxo de Execução KEM em 3 Etapas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">ETAPA 1: KEYGEN</span>
                {kyberState.hasKeys && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">
                Gera a matriz A e os vetores de segredo/erro com amostragens gaussianas discretas.
              </p>
              <button
                onClick={handleKyberGenerateKeys}
                className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Gerar Par de Chaves KEM
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">ETAPA 2: ENCAPSULATE</span>
                {kyberState.hasCiphertext && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">
                O remetente encapsula uma chave de sessão simétrica aleatória usando apenas a Chave Pública.
              </p>
              <button
                onClick={handleKyberEncapsulate}
                disabled={!kyberState.hasKeys}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                Encapsular Segredo (Ciphertext)
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">ETAPA 3: DECAPSULATE</span>
                {kyberState.verified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">
                O receptor usa a Chave Privada para recuperar a chave de sessão simétrica idêntica.
              </p>
              <button
                onClick={handleKyberDecapsulate}
                disabled={!kyberState.hasCiphertext}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <Key className="w-3.5 h-3.5" />
                Decapsular & Verificar Segredo
              </button>
            </div>
          </div>

          {/* Estado das Chaves & Segredos */}
          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1">
                <span>CHAVE PÚBLICA (pk)</span>
                {kyberState.publicKey && (
                  <button onClick={() => copyToClipboard(kyberState.publicKey, 'kyber-pk')} className="hover:text-white flex items-center gap-1">
                    {copiedKey === 'kyber-pk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                )}
              </div>
              <div className="text-cyan-300 break-all select-all">
                {kyberState.publicKey || 'Chave pública não gerada.'}
              </div>

              {kyberState.ciphertext && (
                <>
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1 pt-2">
                    <span>CIPHERTEXT TRANSMITIDO (ct)</span>
                    <button onClick={() => copyToClipboard(kyberState.ciphertext, 'kyber-ct')} className="hover:text-white flex items-center gap-1">
                      {copiedKey === 'kyber-ct' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copiar
                    </button>
                  </div>
                  <div className="text-amber-300 break-all select-all">
                    {kyberState.ciphertext}
                  </div>
                </>
              )}

              {kyberState.sharedSecretSender && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">CHAVE SIMÉTRICA COMPARTILHADA (SHARED SECRET AES-256):</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-800 text-emerald-400 font-bold">
                      Remetente: {kyberState.sharedSecretSender}
                    </div>
                    <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-800 text-emerald-400 font-bold">
                      Receptor: {kyberState.sharedSecretReceiver || 'Aguardando Decapsulate...'}
                    </div>
                  </div>
                  {kyberState.verified && (
                    <div className="mt-2 text-emerald-400 flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Acordo KEM estabelecido com sucesso! Canal seguro AES-256 pós-quântico ativo.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{kyberState.stepDetails}</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: ML-DSA (CRYSTALS-DILITHIUM) */}
      {activeTab === 'dilithium-dsa' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Simulador ML-DSA (FIPS 204) - Assinatura Digital Pós-Quântica
              </h2>
              <p className="text-slate-400 text-sm">
                Esquema Fiat-Shamir com Amostragem de Rejeição baseado na dificuldade de Module-LWE e Short Integer Solution (SIS).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDsaVariant('dsa-44')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dsaVariant === 'dsa-44' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ML-DSA-44 (L2)
              </button>
              <button
                onClick={() => setDsaVariant('dsa-65')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dsaVariant === 'dsa-65' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ML-DSA-65 (L3 NIST)
              </button>
              <button
                onClick={() => setDsaVariant('dsa-87')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dsaVariant === 'dsa-87' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ML-DSA-87 (L5)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Parâmetro Matriz</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{dsaSpecs.matrix} polinômios</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Chave Pública (pk)</div>
              <div className="text-sm font-semibold text-white mt-1">{dsaSpecs.pkBytes} Bytes</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Chave Privada (sk)</div>
              <div className="text-sm font-semibold text-white mt-1">{dsaSpecs.skBytes} Bytes</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Tamanho Assinatura</div>
              <div className="text-sm font-semibold text-indigo-400 mt-1">{dsaSpecs.sigBytes} Bytes</div>
            </div>
          </div>

          {/* Entrada de Mensagem e Controles */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Mensagem a Assinar Digitalmente (Payload):
              </label>
              <input
                type="text"
                value={dsaMessage}
                onChange={e => setDsaMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDsaKeyGen}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                1. Gerar Chaves Dilithium
              </button>
              <button
                onClick={handleDsaSign}
                disabled={!dsaState.hasKeys}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                2. Assinar Mensagem (ML-DSA)
              </button>
              <button
                onClick={() => handleDsaVerify(false)}
                disabled={!dsaState.hasSignature}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                3. Verificar Assinatura (Válida)
              </button>
              <button
                onClick={() => handleDsaVerify(true)}
                disabled={!dsaState.hasSignature}
                className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 border border-rose-700/60 text-rose-300 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Simular Adulteração (Mensagem Falsificada)
              </button>
            </div>

            {/* Painel de Resultados */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-3">
              <div>
                <span className="text-slate-400 block mb-1">CHAVE PÚBLICA DILITHIUM:</span>
                <span className="text-cyan-300 break-all select-all">{dsaState.publicKey || 'Chaves não geradas.'}</span>
              </div>
              {dsaState.hasSignature && (
                <div>
                  <span className="text-slate-400 block mb-1">ASSINATURA DIGITAL (z, c):</span>
                  <span className="text-indigo-300 break-all select-all">{dsaState.signature}</span>
                </div>
              )}
              {dsaState.verificationStatus !== 'idle' && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
                  dsaState.verificationStatus === 'valid'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800 text-rose-400'
                }`}>
                  {dsaState.verificationStatus === 'valid' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ASSINATURA ML-DSA VÁLIDA: A integridade da mensagem e a identidade da Holding V5 Apollo foram confirmadas com proteção resistente a computadores quânticos!
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      FALHA NA VERIFICAÇÃO: A assinatura não coincide com o hash do documento adulterado ou a chave pública fornecida é inválida!
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: SLH-DSA (SPHINCS+) */}
      {activeTab === 'sphincs-hash' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-cyan-400" />
                Inspetor SLH-DSA (FIPS 205 / SPHINCS+) - Stateless Hash Signatures
              </h2>
              <p className="text-slate-400 text-sm">
                Segurança independente de reticulados algébricos: baseada exclusivamente na resistência a colisões e pré-imagem de funções de hash (SHAKE-256 / SHA-256).
              </p>
            </div>
            <div>
              <select
                value={sphincsVariant}
                onChange={e => setSphincsVariant(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="128s-simple">SLH-DSA-SHAKE-128s (Small - 7.8 KB)</option>
                <option value="128f-simple">SLH-DSA-SHAKE-128f (Fast - 17 KB)</option>
                <option value="192s-simple">SLH-DSA-SHAKE-192s (Small - 16.2 KB)</option>
                <option value="192f-simple">SLH-DSA-SHAKE-192f (Fast - 35.6 KB)</option>
                <option value="256s-simple">SLH-DSA-SHAKE-256s (Small - 29.8 KB)</option>
                <option value="256f-simple">SLH-DSA-SHAKE-256f (Fast - 49.8 KB)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Tamanho da Assinatura</div>
              <div className="text-sm font-semibold text-amber-400 mt-1">{(activeSphincs.sigSize / 1024).toFixed(1)} KB ({activeSphincs.sigSize} Bytes)</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Chave Pública (pk)</div>
              <div className="text-sm font-semibold text-emerald-400 mt-1">{activeSphincs.pkSize} Bytes (Ultra Compacta)</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Altura da Hypertree (h)</div>
              <div className="text-sm font-semibold text-white mt-1">{activeSphincs.treeHeight} níveis ({activeSphincs.layers} camadas)</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Árvores FORS (k x a)</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1">{activeSphincs.forsTrees} árvores de {activeSphincs.forsLeaves} folhas</div>
            </div>
          </div>

          {/* Diagrama da Hypertree SPHINCS+ */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Arquitetura em Camadas da Assinatura SLH-DSA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">1. Raiz & Hypertree (XMSS-MT)</div>
                <p className="text-slate-400 font-sans text-xs">
                  A chave pública contém apenas a raiz da árvore superior e o seed público ({activeSphincs.pkSize}B). As subárvores assinam as raízes inferiores em {activeSphincs.layers} camadas.
                </p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-indigo-400 font-bold mb-1">2. Assinatura One-Time WOTS+</div>
                <p className="text-slate-400 font-sans text-xs">
                  Cadeias de hash de Winternitz (w=16) usadas nas folhas para assinar a raiz da camada subsequente sem armazenar estado no cliente (stateless).
                </p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">3. Few-Time Signatures (FORS)</div>
                <p className="text-slate-400 font-sans text-xs">
                  A mensagem original é digerida e assinada por {activeSphincs.forsTrees} árvores FORS independentes, garantindo segurança estocástica contra falsificações.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Classificação NIST de Desempenho:</span>
              <span className="text-cyan-300 font-bold">{activeSphincs.targetSpeed}</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: COMPARADOR DE OVERHEAD CLÁSSICA VS PQC */}
      {activeTab === 'pqc-overhead' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Matriz Comparativa de Overhead: Criptografia Clássica vs Pós-Quântica
              </h2>
              <p className="text-slate-400 text-sm">
                Avalie o impacto real de largura de banda e fragmentação TCP (MTU padrão de 1500 bytes) na migração para o TLS 1.3 Pós-Quântico.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setComparisonMetric('sig-ct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  comparisonMetric === 'sig-ct' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Assinatura / Ciphertext
              </button>
              <button
                onClick={() => setComparisonMetric('pk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  comparisonMetric === 'pk' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chave Pública (pk)
              </button>
              <button
                onClick={() => setComparisonMetric('mtu')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  comparisonMetric === 'mtu' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pacotes TCP / MTU (1.5KB)
              </button>
            </div>
          </div>

          {/* Tabela Comparativa Completa */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Algoritmo</th>
                  <th className="py-3 px-4">Tipo & Paradigma</th>
                  <th className="py-3 px-4">Chave Pública</th>
                  <th className="py-3 px-4">Ciphertext / Assinatura</th>
                  <th className="py-3 px-4">Pacotes MTU (1500B)</th>
                  <th className="py-3 px-4">Status Quântico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {algorithmsBenchmark.map((algo, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{algo.name}</td>
                    <td className="py-3 px-4 text-slate-400">{algo.type}</td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">{algo.pkBytes} B</td>
                    <td className="py-3 px-4 text-indigo-300 font-semibold">{algo.ctOrSigBytes} B</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        algo.mtuPackets === 1 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        algo.mtuPackets <= 3 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {algo.mtuPackets} {algo.mtuPackets === 1 ? 'pacote' : 'pacotes'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {algo.brokenByQuantum ? (
                        <span className="text-rose-400 flex items-center gap-1 font-sans text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Vulnerável a Shor
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-sans text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resistente NIST
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-cyan-400 font-bold block mb-1">Impacto Prático na Engenharia Web:</span>
            <p>
              • <strong>ML-KEM (Kyber-768):</strong> Cabe em um único pacote MTU no handshake TLS 1.3, adicionando menos de 1ms de latência.
            </p>
            <p>
              • <strong>SPHINCS+ (SLH-DSA):</strong> Exige até 35 pacotes MTU, causando fragmentação TCP e risco de bloqueio em Middleboxes antigas.
            </p>
          </div>
        </div>
      )}

      {/* ABA 5: CALCULADORA DO ALGORITMO DE SHOR */}
      {activeTab === 'shor-threat' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Calculadora de Recursos Quânticos: Algoritmo de Shor
              </h2>
              <p className="text-slate-400 text-sm">
                Modelagem matemática de Qubits Lógicos, Portas Toffoli e Qubits Físicos necessários para quebrar a criptografia assimétrica clássica.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setShorTarget('rsa-2048')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  shorTarget === 'rsa-2048' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                RSA-2048
              </button>
              <button
                onClick={() => setShorTarget('rsa-4096')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  shorTarget === 'rsa-4096' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                RSA-4096
              </button>
              <button
                onClick={() => setShorTarget('ecc-256')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  shorTarget === 'ecc-256' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ECC P-256
              </button>
              <button
                onClick={() => setShorTarget('ecc-384')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  shorTarget === 'ecc-384' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ECC P-384
              </button>
            </div>
          </div>

          {/* Ajuste de Taxa de Erro Físico */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white block">Taxa de Erro de Porta Física (Physical Gate Error Rate):</span>
              <span className="text-xs text-slate-400">Determina a distância do código de superfície (Surface Code Distance d) para correção quântica.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGateErrorRate(0.001)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  gateErrorRate === 0.001 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                p = 10^-3 (Tecnologia Atual/Próxima)
              </button>
              <button
                onClick={() => setGateErrorRate(0.0001)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  gateErrorRate === 0.0001 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                p = 10^-4 (Alta Fidelidade Futura)
              </button>
            </div>
          </div>

          {/* Métricas Estimadas de Fatoração Quântica */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Qubits Lógicos (Coerentes)</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{shorAnalysis.logicalQubits.toLocaleString()} Qubits</div>
              <div className="text-[10px] text-slate-500 mt-1">Sem ruído (Error-free)</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Distância de Código (d)</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">d = {shorAnalysis.codeDistance}</div>
              <div className="text-[10px] text-slate-500 mt-1">{shorAnalysis.physicalQubitsPerLogical} qubits físicos/lógico</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Qubits Físicos Totais</div>
              <div className="text-xl font-bold text-rose-400 mt-1">~{(shorAnalysis.totalPhysicalQubits / 1000000).toFixed(2)} Milhões</div>
              <div className="text-[10px] text-slate-500 mt-1">{shorAnalysis.totalPhysicalQubits.toLocaleString()} físicos</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Tempo Estimado de Execução</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{shorAnalysis.estimatedHoursShor}</div>
              <div className="text-[10px] text-slate-500 mt-1">Com ciclo de clock de 1μs</div>
            </div>
          </div>

          {/* Alerta de Ameaça SNDL (Store Now, Decrypt Later) */}
          <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Ameaça "Store Now, Decrypt Later" (SNDL)
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Agências de inteligência e atores estatais já estão gravando tráfego cifrado na internet hoje (cifrado com RSA ou Curvas Elípticas clássicas). No momento em que um computador quântico de ~4.000 qubits lógicos estiver operacional ("Q-Day"), todo o histórico de dados interceptados será decifrado retroativamente em menos de 10 horas de cálculo pelo Algoritmo de Shor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
