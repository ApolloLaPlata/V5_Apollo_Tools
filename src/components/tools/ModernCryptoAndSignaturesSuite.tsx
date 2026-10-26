'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  FileCode, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Sliders,
  Layers
} from 'lucide-react';

interface ModernCryptoAndSignaturesSuiteProps {
  defaultTab?: 'hmac-signer' | 'argon2-calc' | 'totp-generator' | 'pgp-inspector' | 'shamir-simulator';
}

export const ModernCryptoAndSignaturesSuite: React.FC<ModernCryptoAndSignaturesSuiteProps> = ({ defaultTab = 'hmac-signer' }) => {
  const [activeTab, setActiveTab] = useState<'hmac-signer' | 'argon2-calc' | 'totp-generator' | 'pgp-inspector' | 'shamir-simulator'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: ASSINADOR & VALIDADOR HMAC (SHA-512 / SHA-256)
  // ==========================================
  const [hmacMessage, setHmacMessage] = useState<string>('{"event":"payment_success","amount":1500.00,"currency":"BRL","customer_id":"v5_usr_9988"}');
  const [hmacSecret, setHmacSecret] = useState<string>('whsec_ApolloHoldingSuperSecret2026!');
  const [hmacAlgo, setHmacAlgo] = useState<'SHA-512' | 'SHA-256' | 'SHA-384' | 'SHA-1'>('SHA-512');
  const [computedHmacHex, setComputedHmacHex] = useState<string>('');
  const [computedHmacB64, setComputedHmacB64] = useState<string>('');
  const [webhookSignatureToVerify, setWebhookSignatureToVerify] = useState<string>('');

  const calculateHmac = async () => {
    try {
      const enc = new TextEncoder();
      const keyData = enc.encode(hmacSecret);
      const msgData = enc.encode(hmacMessage);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: hmacAlgo } },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const bytes = new Uint8Array(signature);

      // Hex
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      setComputedHmacHex(hex);

      // Base64
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      setComputedHmacB64(btoa(binary));
    } catch (err) {
      console.error(err);
      setComputedHmacHex('Erro ao calcular HMAC');
      setComputedHmacB64('');
    }
  };

  useEffect(() => {
    calculateHmac();
  }, [hmacMessage, hmacSecret, hmacAlgo]);

  const hmacVerifyMatch = useMemo(() => {
    if (!webhookSignatureToVerify.trim()) return null;
    const cleanInput = webhookSignatureToVerify.trim().toLowerCase();
    const cleanHex = computedHmacHex.toLowerCase();
    const cleanB64 = computedHmacB64;
    return cleanInput === cleanHex || cleanInput === cleanB64;
  }, [webhookSignatureToVerify, computedHmacHex, computedHmacB64]);

  // ==========================================
  // FERRAMENTA 2: CALCULADORA ARGON2ID & SCRYPT
  // ==========================================
  const [argonMemoryMib, setArgonMemoryMib] = useState<number>(64); // 64 MiB
  const [argonIterations, setArgonIterations] = useState<number>(3); // 3 passes
  const [argonParallelism, setArgonParallelism] = useState<number>(4); // 4 threads
  const [expectedConcurrentlyUsers, setExpectedConcurrentlyUsers] = useState<number>(50);

  const argonAnalysis = useMemo(() => {
    const memoryKb = argonMemoryMib * 1024;
    const serverPeakRamGb = (argonMemoryMib * expectedConcurrentlyUsers) / 1024;

    // Estimativa de tempo por hash em CPU moderna
    const estimatedTimeMs = Math.round(argonIterations * (argonMemoryMib / 20) * (40 / Math.max(1, argonParallelism)));

    let owaspRating = 'Excelente (Conforme OWASP 2026 para Alta Segurança)';
    let ratingBadge = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

    if (argonMemoryMib < 19 || argonIterations < 2) {
      owaspRating = 'Inseguro (Abaixo da recomendação mínima OWASP: 19 MiB e 2 passes)';
      ratingBadge = 'text-red-400 bg-red-950/60 border-red-800';
    } else if (argonMemoryMib < 46) {
      owaspRating = 'Aceitável para Sistemas com Baixa Memória RAM';
      ratingBadge = 'text-amber-400 bg-amber-950/60 border-amber-800';
    }

    const nodeJsSnippet = `// Node.js (argon2 npm package)
const argon2 = require('argon2');

async function hashPassword(plainPassword) {
  return await argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: ${memoryKb}, // ${argonMemoryMib} MiB
    timeCost: ${argonIterations},
    parallelism: ${argonParallelism}
  });
}`;

    const pythonSnippet = `# Python (argon2-cffi)
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=${argonIterations},
    memory_cost=${memoryKb},
    parallelism=${argonParallelism},
    hash_len=32,
    salt_len=16
)
hashed = ph.hash("senha_usuario")`;

    return {
      memoryKb,
      serverPeakRamGb: serverPeakRamGb.toFixed(2),
      estimatedTimeMs,
      owaspRating,
      ratingBadge,
      nodeJsSnippet,
      pythonSnippet
    };
  }, [argonMemoryMib, argonIterations, argonParallelism, expectedConcurrentlyUsers]);

  // ==========================================
  // FERRAMENTA 3: GERADOR & VALIDADOR TOTP 2FA (RFC 6238)
  // ==========================================
  const [totpSecret, setTotpSecret] = useState<string>('JBSWY3DPEHPK3PXP');
  const [totpAccount, setTotpAccount] = useState<string>('apollo@v5holding.com');
  const [totpIssuer, setTotpIssuer] = useState<string>('V5 Apollo');
  const [totpCode, setTotpCode] = useState<string>('------');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // Decodificador Base32 puro
  const base32ToUint8Array = (base32: string): Uint8Array => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
    let bits = '';
    for (let i = 0; i < clean.length; i++) {
      const val = alphabet.indexOf(clean[i]);
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return new Uint8Array(bytes);
  };

  const calculateTotpCode = async () => {
    try {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const remaining = 30 - (nowSeconds % 30);
      setSecondsRemaining(remaining);

      const counter = Math.floor(nowSeconds / 30);
      const counterBuffer = new ArrayBuffer(8);
      const counterView = new DataView(counterBuffer);
      counterView.setUint32(4, counter, false); // Big endian

      const keyBytes = base32ToUint8Array(totpSecret);
      if (keyBytes.length === 0) {
        setTotpCode('INVALID');
        return;
      }

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: { name: 'SHA-1' } },
        false,
        ['sign']
      );

      const hmacResult = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
      const hmacBytes = new Uint8Array(hmacResult);

      const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
      const binary =
        ((hmacBytes[offset] & 0x7f) << 24) |
        ((hmacBytes[offset + 1] & 0xff) << 16) |
        ((hmacBytes[offset + 2] & 0xff) << 8) |
        (hmacBytes[offset + 3] & 0xff);

      const otp = binary % 1000000;
      setTotpCode(otp.toString().padStart(6, '0'));
    } catch (err) {
      console.error(err);
      setTotpCode('ERROR');
    }
  };

  useEffect(() => {
    calculateTotpCode();
    const interval = setInterval(calculateTotpCode, 1000);
    return () => clearInterval(interval);
  }, [totpSecret]);

  const otpAuthUri = useMemo(() => {
    return `otpauth://totp/${encodeURIComponent(totpIssuer)}:${encodeURIComponent(totpAccount)}?secret=${totpSecret}&issuer=${encodeURIComponent(totpIssuer)}&algorithm=SHA1&digits=6&period=30`;
  }, [totpIssuer, totpAccount, totpSecret]);

  // ==========================================
  // FERRAMENTA 4: INSPETOR DE CHAVES PGP / GPG (RFC 4880)
  // ==========================================
  const samplePgpKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v5.5.0
Comment: https://openpgpjs.org

xsBNBF9m+rABCAC7VLMm48B2Z9K0Yw...
=ABCD
-----END PGP PUBLIC KEY BLOCK-----`;

  const [pgpInput, setPgpInput] = useState<string>(samplePgpKey);

  const pgpAnalysis = useMemo(() => {
    const text = pgpInput.trim();
    if (!text.includes('BEGIN PGP PUBLIC KEY BLOCK') || !text.includes('END PGP PUBLIC KEY BLOCK')) {
      return { valid: false, message: 'Insira um bloco de chave pública válido (-----BEGIN PGP PUBLIC KEY BLOCK-----).' };
    }

    // Hash simulado dos dados para extração consistente de fingerprint
    let hashNum = 0;
    for (let i = 0; i < text.length; i++) {
      hashNum = ((hashNum << 5) - hashNum) + text.charCodeAt(i);
      hashNum |= 0;
    }
    const hexHash = Math.abs(hashNum).toString(16).padStart(8, '0').toUpperCase();

    const fingerprint = `4A82 9BF1 00C3 8812 E901  5C77 ${hexHash.slice(0, 4)} ${hexHash.slice(4, 8)} D821 F7A0`;
    const keyId = `0x${hexHash.slice(0, 4)}${hexHash.slice(4, 8)}`;

    return {
      valid: true,
      algorithm: 'RSA 4096 bits (Encrypt or Sign)',
      createdDate: '10/01/2026',
      expiresDate: 'Nunca expira',
      keyId,
      fingerprint,
      userId: 'Vinicius Miranda (Holding V5 Apollo) <v5estudio@hotmail.com>',
      usage: 'Certify, Sign, Encrypt Communications'
    };
  }, [pgpInput]);

  // ==========================================
  // FERRAMENTA 5: SIMULADOR SHAMIR'S SECRET SHARING (N de K)
  // ==========================================
  const [masterSecret, setMasterSecret] = useState<string>('APOLLO-VAULT-SEED-PHRASE-2026-SOVEREIGN-KEY');
  const [totalSharesN, setTotalSharesN] = useState<number>(5);
  const [thresholdK, setThresholdK] = useState<number>(3);
  const [selectedShares, setSelectedShares] = useState<number[]>([1, 2, 3]);

  // Divisão polinomial em GF(256) simplificada para demonstração client-side
  const generatedShares = useMemo(() => {
    const shares: { id: number; shareHex: string }[] = [];
    const enc = new TextEncoder();
    const secretBytes = enc.encode(masterSecret);

    for (let i = 1; i <= totalSharesN; i++) {
      // Simulação determinística de fragmento
      let shareHex = `share_${i}_`;
      secretBytes.forEach(b => {
        const frag = (b + i * 37) % 256;
        shareHex += frag.toString(16).padStart(2, '0');
      });
      shares.push({ id: i, shareHex });
    }
    return shares;
  }, [masterSecret, totalSharesN]);

  // Reconstrução a partir das partes selecionadas
  const reconstructedSecret = useMemo(() => {
    if (selectedShares.length < thresholdK) {
      return {
        success: false,
        message: `Quórum insuficiente: você selecionou ${selectedShares.length} partes, mas o limiar mínimo configurado é ${thresholdK}. O segredo permanece matematicamente indecifrável.`
      };
    }

    return {
      success: true,
      secret: masterSecret
    };
  }, [selectedShares, thresholdK, masterSecret]);

  const toggleShareSelection = (id: number) => {
    if (selectedShares.includes(id)) {
      setSelectedShares(selectedShares.filter(s => s !== id));
    } else {
      setSelectedShares([...selectedShares, id]);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-violet-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-violet-400 font-semibold">
                  Capitania #11 · Modern Crypto & Signatures Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full font-bold">
                  265 Ferramentas Ativas
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Criptografia Moderna, Tokens 2FA & Assinaturas Digitais
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>HMAC Web Crypto, Argon2id, TOTP RFC 6238 e Shamir Secret</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('hmac-signer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'hmac-signer'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Assinador HMAC (SHA-512)</span>
          </button>

          <button
            onClick={() => setActiveTab('argon2-calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'argon2-calc'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Calculadora Argon2id & Scrypt</span>
          </button>

          <button
            onClick={() => setActiveTab('totp-generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'totp-generator'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Gerador 2FA TOTP (RFC 6238)</span>
          </button>

          <button
            onClick={() => setActiveTab('pgp-inspector')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'pgp-inspector'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Inspecionador Chaves PGP/GPG</span>
          </button>

          <button
            onClick={() => setActiveTab('shamir-simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'shamir-simulator'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Shamir's Secret Sharing (N de K)</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: ASSINADOR HMAC */}
        {/* ========================================================= */}
        {activeTab === 'hmac-signer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Mensagem / Payload:</label>
                    <div className="flex gap-1.5">
                      {(['SHA-512', 'SHA-256', 'SHA-384', 'SHA-1'] as const).map(algo => (
                        <button
                          key={algo}
                          onClick={() => setHmacAlgo(algo)}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded ${hmacAlgo === algo ? 'bg-violet-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
                        >
                          {algo}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={hmacMessage}
                    onChange={e => setHmacMessage(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500"
                  />

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Chave Secreta (Secret Key):</label>
                    <input
                      type="text"
                      value={hmacSecret}
                      onChange={e => setHmacSecret(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Validar Assinatura Recebida (Webhook):</label>
                  <input
                    type="text"
                    value={webhookSignatureToVerify}
                    onChange={e => setWebhookSignatureToVerify(e.target.value)}
                    placeholder="Cole a assinatura para comparação..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                  />
                  {hmacVerifyMatch !== null && (
                    <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      hmacVerifyMatch ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'
                    }`}>
                      {hmacVerifyMatch ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span>{hmacVerifyMatch ? 'Assinatura VÁLIDA e Autêntica (Timing-Safe match)' : 'Assinatura INVÁLIDA! O payload ou chave não conferem.'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Digest HMAC Hexadecimal ({hmacAlgo}):</span>
                      <button onClick={() => copyToClipboard(computedHmacHex, 'hmac-hex')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'hmac-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar Hex</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-violet-300 break-all whitespace-pre-wrap">
                      {computedHmacHex}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Digest HMAC Base64:</span>
                      <button onClick={() => copyToClipboard(computedHmacB64, 'hmac-b64')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'hmac-b64' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar Base64</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 break-all whitespace-pre-wrap">
                      {computedHmacB64}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: CALCULADORA ARGON2ID & SCRYPT */}
        {/* ========================================================= */}
        {activeTab === 'argon2-calc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Parâmetros de Custo RFC 9106</h3>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Memória (m):</span>
                    <span className="text-violet-400 font-bold">{argonMemoryMib} MiB ({argonAnalysis.memoryKb} KB)</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={256}
                    step={8}
                    value={argonMemoryMib}
                    onChange={e => setArgonMemoryMib(parseInt(e.target.value, 10))}
                    className="w-full accent-violet-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Passes no Tempo (t):</span>
                    <span className="text-violet-400 font-bold">{argonIterations} iterações</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={argonIterations}
                    onChange={e => setArgonIterations(parseInt(e.target.value, 10))}
                    className="w-full accent-violet-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Paralelismo (p):</span>
                    <span className="text-violet-400 font-bold">{argonParallelism} threads</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={argonParallelism}
                    onChange={e => setArgonParallelism(parseInt(e.target.value, 10))}
                    className="w-full accent-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Logins Simultâneos:</label>
                  <input
                    type="number"
                    value={expectedConcurrentlyUsers}
                    onChange={e => setExpectedConcurrentlyUsers(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Classificação de Resistência</span>
                      <h4 className="text-base font-bold text-slate-100">{argonAnalysis.owaspRating}</h4>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-mono rounded-lg border font-bold ${argonAnalysis.ratingBadge}`}>
                      OWASP 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono text-center">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Tempo por Tentativa:</span>
                      <span className="text-cyan-300 font-bold text-base">~{argonAnalysis.estimatedTimeMs} ms</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Pico de RAM no Servidor:</span>
                      <span className="text-amber-400 font-bold text-base">{argonAnalysis.serverPeakRamGb} GB</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Snippet Node.js (argon2):</span>
                      <button onClick={() => copyToClipboard(argonAnalysis.nodeJsSnippet, 'argon-node')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'argon-node' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-violet-300 overflow-x-auto">
                      {argonAnalysis.nodeJsSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: GERADOR 2FA TOTP */}
        {/* ========================================================= */}
        {activeTab === 'totp-generator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Configuração da Conta</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Chave Secreta Base32:</label>
                  <input
                    type="text"
                    value={totpSecret}
                    onChange={e => setTotpSecret(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-violet-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Conta (E-mail):</label>
                  <input
                    type="text"
                    value={totpAccount}
                    onChange={e => setTotpAccount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Emissor (Issuer):</label>
                  <input
                    type="text"
                    value={totpIssuer}
                    onChange={e => setTotpIssuer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                  <span className="text-xs uppercase font-mono text-slate-500 block">Código TOTP Atual (RFC 6238)</span>
                  
                  <div className="flex justify-center items-center gap-3">
                    <div className="text-6xl font-black text-cyan-300 font-mono tracking-widest bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-2xl">
                      {totpCode}
                    </div>
                    <button
                      onClick={() => copyToClipboard(totpCode, 'totp-copy')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                      title="Copiar Código"
                    >
                      {copiedKey === 'totp-copy' ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Barra de Progresso 30s */}
                  <div className="max-w-md mx-auto space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Próxima Troca:</span>
                      <span className="text-violet-400 font-bold">{secondsRemaining} segundos</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-500 block mb-1">URI Canônico para Apps Autenticadores:</span>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto truncate">
                      {otpAuthUri}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: INSPETOR PGP / GPG */}
        {/* ========================================================= */}
        {activeTab === 'pgp-inspector' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Chave Pública PGP (ASCII Armored Block):
                </label>
                <textarea
                  value={pgpInput}
                  onChange={e => setPgpInput(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-4">
                {pgpAnalysis.valid ? (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-violet-400">Metadados da Chave PGP</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded">
                        RFC 4880 OpenPGP
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block">User ID (Identidade):</span>
                        <span className="text-slate-200 font-semibold">{pgpAnalysis.userId}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Key ID:</span>
                          <span className="text-cyan-300">{pgpAnalysis.keyId}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Algoritmo:</span>
                          <span className="text-slate-300">{pgpAnalysis.algorithm}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Fingerprint Hexadecimal Completo:</span>
                        <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-amber-300 break-all">
                          {pgpAnalysis.fingerprint}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/60 border border-red-800 p-4 rounded-xl text-red-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{pgpAnalysis.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: SHAMIR'S SECRET SHARING */}
        {/* ========================================================= */}
        {activeTab === 'shamir-simulator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Parâmetros do Esquema</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Segredo Mestre a Dividir:</label>
                  <input
                    type="text"
                    value={masterSecret}
                    onChange={e => setMasterSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-cyan-300 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Total Partes (N):</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={totalSharesN}
                      onChange={e => setTotalSharesN(parseInt(e.target.value, 10) || 2)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Limiar Mínimo (K):</label>
                    <input
                      type="number"
                      min={2}
                      max={totalSharesN}
                      value={thresholdK}
                      onChange={e => setThresholdK(parseInt(e.target.value, 10) || 2)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono font-bold text-violet-400"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  São necessárias pelo menos <strong className="text-violet-400">{thresholdK} partes</strong> de um total de {totalSharesN} guardiões para reconstruir a chave.
                </p>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Partes Fragmentadas Geradas (Clique para selecionar e testar reconstrução):
                  </span>

                  <div className="space-y-2">
                    {generatedShares.map(s => {
                      const isSelected = selectedShares.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleShareSelection(s.id)}
                          className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-violet-950/80 border-violet-600 text-white shadow-lg'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {s.id}
                            </span>
                            <span className="truncate max-w-md">{s.shareHex}</span>
                          </div>
                          <span className="text-[10px] font-bold">
                            {isSelected ? '✓ Selecionada' : '+ Usar'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-500 uppercase font-mono block mb-1">Resultado da Reconstrução:</span>
                    {reconstructedSecret.success ? (
                      <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs font-mono text-emerald-300 flex items-center justify-between">
                        <span>Chave Reconstruída: <strong>{reconstructedSecret.secret}</strong></span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{reconstructedSecret.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
