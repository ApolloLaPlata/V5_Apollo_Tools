'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  FileCheck, 
  Binary, 
  CreditCard, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  Clock,
  Cpu,
  Lock
} from 'lucide-react';

interface CryptoHashAndChecksumSuiteProps {
  defaultTab?: 'file-checksum' | 'hash-estimator' | 'jwt-forge' | 'base58-codec' | 'bin-lookup';
}

export const CryptoHashAndChecksumSuite: React.FC<CryptoHashAndChecksumSuiteProps> = ({ defaultTab = 'file-checksum' }) => {
  const [activeTab, setActiveTab] = useState<'file-checksum' | 'hash-estimator' | 'jwt-forge' | 'base58-codec' | 'bin-lookup'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CALCULADOR DE CHECKSUM DE ARQUIVOS (WEB CRYPTO API)
  // ==========================================
  const [fileName, setFileName] = useState<string>('exemplo-documento.pdf');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(1048576); // 1 MB
  const [sha256Hash, setSha256Hash] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [sha512Hash, setSha512Hash] = useState<string>('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e');
  const [sha1Hash, setSha1Hash] = useState<string>('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSizeBytes(file.size);
    setIsHashing(true);

    try {
      const buffer = await file.arrayBuffer();

      // SHA-256
      const hashBuffer256 = await crypto.subtle.digest('SHA-256', buffer);
      const hash256 = Array.from(new Uint8Array(hashBuffer256)).map(b => b.toString(16).padStart(2, '0')).join('');
      setSha256Hash(hash256);

      // SHA-512
      const hashBuffer512 = await crypto.subtle.digest('SHA-512', buffer);
      const hash512 = Array.from(new Uint8Array(hashBuffer512)).map(b => b.toString(16).padStart(2, '0')).join('');
      setSha512Hash(hash512);

      // SHA-1
      const hashBuffer1 = await crypto.subtle.digest('SHA-1', buffer);
      const hash1 = Array.from(new Uint8Array(hashBuffer1)).map(b => b.toString(16).padStart(2, '0')).join('');
      setSha1Hash(hash1);
    } catch {
      // Fallback
    } finally {
      setIsHashing(false);
    }
  };

  const hashMatchStatus = useMemo(() => {
    if (!expectedHash.trim()) return null;
    const cleanExpected = expectedHash.trim().toLowerCase();
    if (cleanExpected === sha256Hash.toLowerCase()) return { match: true, algo: 'SHA-256' };
    if (cleanExpected === sha512Hash.toLowerCase()) return { match: true, algo: 'SHA-512' };
    if (cleanExpected === sha1Hash.toLowerCase()) return { match: true, algo: 'SHA-1' };
    return { match: false };
  }, [expectedHash, sha256Hash, sha512Hash, sha1Hash]);

  // ==========================================
  // FERRAMENTA 2: ESTIMADOR DE CUSTO BCRYPT / ARGON2 / PBKDF2
  // ==========================================
  const [bcryptCost, setBcryptCost] = useState<number>(12); // Padrão indústria 2026
  const [argon2MemoryMb, setArgon2MemoryMb] = useState<number>(64);
  const [argon2Iterations, setArgon2Iterations] = useState<number>(3);
  const [pbkdf2Iterations, setPbkdf2Iterations] = useState<number>(600000); // Recomendação OWASP 2026

  const hashMetrics = useMemo(() => {
    // Estimativa de tempo para Bcrypt (2^cost iterações)
    // Cost 10 ~ 80ms, Cost 12 ~ 320ms, Cost 14 ~ 1280ms
    const bcryptTimeMs = Math.round(80 * Math.pow(2, bcryptCost - 10));
    const bcryptHashesPerSec = Math.max(1, Math.round(1000 / bcryptTimeMs));

    // Argon2id estimativa
    const argon2TimeMs = Math.round(argon2Iterations * (argon2MemoryMb * 0.9));
    const argon2HashesPerSec = Math.max(1, Math.round(1000 / argon2TimeMs));

    // PBKDF2 estimativa (SHA-256)
    const pbkdf2TimeMs = Math.round(pbkdf2Iterations * 0.0004);

    return {
      bcryptTimeMs,
      bcryptHashesPerSec,
      argon2TimeMs,
      argon2HashesPerSec,
      pbkdf2TimeMs
    };
  }, [bcryptCost, argon2MemoryMb, argon2Iterations, pbkdf2Iterations]);

  // ==========================================
  // FERRAMENTA 3: CONSTRUTOR & DEBUGGER DE JWT (HMAC-SHA256)
  // ==========================================
  const [jwtHeader, setJwtHeader] = useState<string>(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [jwtPayload, setJwtPayload] = useState<string>(JSON.stringify({
    sub: 'v5-apollo-user-8841',
    name: 'Apollo La Plata',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  }, null, 2));
  const [jwtSecret, setJwtSecret] = useState<string>('super_secret_v5_apollo_signing_key');
  const [fullJwtToken, setFullJwtToken] = useState<string>('');

  const base64UrlEncode = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  useEffect(() => {
    let isMounted = true;
    async function signJwt() {
      try {
        const hEnc = base64UrlEncode(jwtHeader);
        const pEnc = base64UrlEncode(jwtPayload);
        const dataToSign = `${hEnc}.${pEnc}`;

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          enc.encode(jwtSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
        const sigBytes = new Uint8Array(signatureBuffer);
        let sigBinary = '';
        sigBytes.forEach(b => { sigBinary += String.fromCharCode(b); });
        const sigEnc = btoa(sigBinary)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        if (isMounted) {
          setFullJwtToken(`${dataToSign}.${sigEnc}`);
        }
      } catch {
        if (isMounted) setFullJwtToken('Erro ao assinar JWT');
      }
    }
    signJwt();
    return () => { isMounted = false; };
  }, [jwtHeader, jwtPayload, jwtSecret]);

  const jwtExpirationStatus = useMemo(() => {
    try {
      const parsed = JSON.parse(jwtPayload);
      if (parsed.exp) {
        const expTime = parsed.exp * 1000;
        const now = Date.now();
        const isExpired = now > expTime;
        return { hasExp: true, isExpired, expDate: new Date(expTime).toLocaleString('pt-BR') };
      }
    } catch {}
    return { hasExp: false };
  }, [jwtPayload]);

  // ==========================================
  // FERRAMENTA 4: CODIFICADOR & DECODIFICADOR BASE58 (BITCOIN)
  // ==========================================
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  const [base58InputText, setBase58InputText] = useState<string>('Holding V5 Apollo · Soberania Total');

  const base58Encoded = useMemo(() => {
    try {
      const bytes = new TextEncoder().encode(base58InputText);
      const digits: number[] = [0];
      for (let i = 0; i < bytes.length; i++) {
        let carry = bytes[i];
        for (let j = 0; j < digits.length; j++) {
          carry += digits[j] << 8;
          digits[j] = carry % 58;
          carry = (carry / 58) | 0;
        }
        while (carry > 0) {
          digits.push(carry % 58);
          carry = (carry / 58) | 0;
        }
      }
      let result = '';
      for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        result += BASE58_ALPHABET[0];
      }
      for (let i = digits.length - 1; i >= 0; i--) {
        result += BASE58_ALPHABET[digits[i]];
      }
      return result;
    } catch {
      return '';
    }
  }, [base58InputText]);

  // ==========================================
  // FERRAMENTA 5: INSPETOR & IDENTIFICADOR DE BIN / IIN DE CARTÕES
  // ==========================================
  const [binNumber, setBinNumber] = useState<string>('453211'); // Exemplo Visa Platinum

  const binDetails = useMemo(() => {
    const clean = binNumber.replace(/\D/g, '');
    let brand = 'Desconhecida';
    let type = 'Crédito / Débito';
    let country = 'Brasil (BR)';
    let level = 'Standard / Internacional';

    if (clean.startsWith('4')) {
      brand = 'Visa';
      level = clean.startsWith('4532') ? 'Platinum' : 'Classic / Gold';
    } else if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) {
      brand = 'Mastercard';
      level = clean.startsWith('54') ? 'Black' : 'Standard / Gold';
    } else if (/^(4011|4389|4514|4576|5041|5066|5090|6277|6362|6363)/.test(clean)) {
      brand = 'Elo';
      level = 'Nanquim / Mais';
    } else if (/^3[47]/.test(clean)) {
      brand = 'American Express';
      level = clean.startsWith('37') ? 'The Platinum Card' : 'Green / Gold';
    } else if (/^606282/.test(clean)) {
      brand = 'Hipercard';
      level = 'Nacional';
    }

    return {
      bin: clean.slice(0, 8),
      brand,
      level,
      type,
      country,
      validLength: clean.length >= 6
    };
  }, [binNumber]);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Criptografia Web & Hashing
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Web Crypto</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            Suíte de Criptografia Web & Hashing de Integridade
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Checksum de arquivos SHA-256/512, estimador Bcrypt/Argon2, construtor de JWT assinado, codificador Base58 e inspetor BIN de cartões.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('file-checksum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'file-checksum'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Checksum de Arquivos (SHA-256/512)
        </button>

        <button
          onClick={() => setActiveTab('hash-estimator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'hash-estimator'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Estimador Bcrypt / Argon2 / PBKDF2
        </button>

        <button
          onClick={() => setActiveTab('jwt-forge')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'jwt-forge'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Construtor & Assinador de JWT (HS256)
        </button>

        <button
          onClick={() => setActiveTab('base58-codec')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'base58-codec'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Binary className="w-4 h-4" />
          Codificador Base58 (Bitcoin/IPFS)
        </button>

        <button
          onClick={() => setActiveTab('bin-lookup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'bin-lookup'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Inspetor de BIN / IIN de Cartões
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: CHECKSUM DE ARQUIVOS (SHA-256 / SHA-512) */}
        {activeTab === 'file-checksum' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-medium transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  Selecionar Arquivo Local
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                <div>
                  <span className="text-xs font-mono text-white block">{fileName}</span>
                  <span className="text-[11px] text-slate-500">{(fileSizeBytes / 1024).toFixed(1)} KB ({fileSizeBytes.toLocaleString('pt-BR')} bytes)</span>
                </div>
              </div>

              {isHashing && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  Calculando hashes na CPU local via Web Crypto...
                </div>
              )}
            </div>

            {/* Verificador de Integridade */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Comparar com Hash Esperado (Opcional):
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Cole o hash SHA-256 ou SHA-512 fornecido pelo autor para verificação..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500"
              />

              {hashMatchStatus && (
                <div className={`mt-2 p-3 rounded-xl border flex items-center gap-2 text-xs ${
                  hashMatchStatus.match ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'
                }`}>
                  {hashMatchStatus.match ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <strong>INTEGRIDADE VERIFICADA!</strong> O hash coincide com o padrão {hashMatchStatus.algo}.
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <strong>DIVERGÊNCIA DE HASH!</strong> O arquivo pode estar corrompido ou adulterado.
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hashes Calculados */}
            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-cyan-400">SHA-256 (Padrão mais usado):</span>
                  <button
                    onClick={() => copyToClipboard(sha256Hash, 'hash-256')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400"
                  >
                    {copiedKey === 'hash-256' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-200 overflow-x-auto select-all leading-relaxed">
                  {sha256Hash}
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-cyan-400">SHA-512 (Máxima segurança):</span>
                  <button
                    onClick={() => copyToClipboard(sha512Hash, 'hash-512')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400"
                  >
                    {copiedKey === 'hash-512' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-200 overflow-x-auto select-all leading-relaxed">
                  {sha512Hash}
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-400">SHA-1 (Legado / Git commit hash):</span>
                  <button
                    onClick={() => copyToClipboard(sha1Hash, 'hash-1')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400"
                  >
                    {copiedKey === 'hash-1' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-400 overflow-x-auto select-all leading-relaxed">
                  {sha1Hash}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ESTIMADOR BCRYPT / ARGON2 / PBKDF2 */}
        {activeTab === 'hash-estimator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bcrypt */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-blue-400" /> Bcrypt
                  </span>
                  <span className="text-xs font-mono text-blue-400">Cost: {bcryptCost}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fator de Custo (Work Factor 10-14):</label>
                  <input
                    type="range"
                    min={10}
                    max={14}
                    value={bcryptCost}
                    onChange={(e) => setBcryptCost(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tempo por Hash:</span>
                    <strong className="text-blue-300">~{hashMetrics.bcryptTimeMs} ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Throughput:</span>
                    <span className="text-slate-200">~{hashMetrics.bcryptHashesPerSec} logins/s/core</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Padrão clássico comprovado. Resistência moderada a GPUs modernas. Recomendado cost 12 em 2026.
                </p>
              </div>

              {/* Argon2id */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Argon2id
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Vencedor PHC</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Memória Alocada: {argon2MemoryMb} MB</label>
                  <input
                    type="range"
                    min={16}
                    max={256}
                    step={16}
                    value={argon2MemoryMb}
                    onChange={(e) => setArgon2MemoryMb(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tempo por Hash:</span>
                    <strong className="text-emerald-300">~{hashMetrics.argon2TimeMs} ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resistência GPU/ASIC:</span>
                    <span className="text-emerald-400 font-bold">Máxima (Memory-hard)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Padrão moderno superior do Password Hashing Competition. Imune a ataques de quebra massiva por GPU.
                </p>
              </div>

              {/* PBKDF2 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" /> PBKDF2
                  </span>
                  <span className="text-xs font-mono text-purple-400">{pbkdf2Iterations.toLocaleString('pt-BR')} iter</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Iterações (OWASP: &gt;= 600.000):</label>
                  <input
                    type="range"
                    min={100000}
                    max={1000000}
                    step={50000}
                    value={pbkdf2Iterations}
                    onChange={(e) => setPbkdf2Iterations(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tempo por Hash:</span>
                    <strong className="text-purple-300">~{hashMetrics.pbkdf2TimeMs} ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conformidade FIPS:</span>
                    <span className="text-slate-200">Totalmente Homologado</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Padrão NIST/FIPS governamental obrigatório para sistemas bancários que exigem conformidade regulatória.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: CONSTRUTOR & DEBUGGER DE JWT (HS256) */}
        {activeTab === 'jwt-forge' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-red-400 block mb-1 font-mono">HEADER: Algoritmo & Tipo</label>
                  <textarea
                    value={jwtHeader}
                    onChange={(e) => setJwtHeader(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-red-300 focus:border-red-500 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">CHAVE SECRETA (Secret Key):</label>
                  <input
                    type="text"
                    value={jwtSecret}
                    onChange={(e) => setJwtSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500"
                  />
                </div>

                {jwtExpirationStatus.hasExp && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    jwtExpirationStatus.isExpired ? 'bg-red-950/20 border-red-500/30 text-red-300' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>{jwtExpirationStatus.isExpired ? 'TOKEN EXPIRADO' : 'TOKEN VÁLIDO'}</strong>
                      <span className="block text-[11px] opacity-80 mt-0.5">Expiração: {jwtExpirationStatus.expDate}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 space-y-3">
                <div>
                  <label className="text-xs font-medium text-purple-400 block mb-1 font-mono">PAYLOAD: Claims de Dados</label>
                  <textarea
                    value={jwtPayload}
                    onChange={(e) => setJwtPayload(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-purple-300 focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 pb-1">
                    <span className="text-xs font-medium text-emerald-400 font-mono">TOKEN JWT COMPLETO CODIFICADO (Assinado via HS256):</span>
                    <button
                      onClick={() => copyToClipboard(fullJwtToken, 'full-jwt')}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      {copiedKey === 'full-jwt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Token
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 break-all whitespace-pre-wrap select-all">
                    {fullJwtToken}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: CODIFICADOR BASE58 (BITCOIN) */}
        {activeTab === 'base58-codec' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                Texto Puro para Codificar em Base58:
              </label>
              <textarea
                value={base58InputText}
                onChange={(e) => setBase58InputText(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
              />
            </div>

            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-300 font-mono">Saída Codificada em Base58:</span>
                <button
                  onClick={() => copyToClipboard(base58Encoded, 'base58-text')}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  {copiedKey === 'base58-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Base58
                </button>
              </div>
              <textarea
                value={base58Encoded}
                readOnly
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none select-all resize-y leading-relaxed"
              />

              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs text-slate-400">
                <strong className="text-amber-300">Alfabeto Base58 Bitcoin:</strong> Remove caracteres ambíguos visualmente (<code className="text-white">0</code>, <code className="text-white">O</code>, <code className="text-white">I</code>, <code className="text-white">l</code>) e símbolos de pontuação (<code className="text-white">+</code>, <code className="text-white">/</code>), tornando-o ideal para endereços criptográficos e hashes IPFS.
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: INSPETOR DE BIN / IIN DE CARTÕES */}
        {activeTab === 'bin-lookup' && (
          <div className="space-y-6">
            <div className="max-w-md">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Primeiros 6 a 8 dígitos do Cartão (BIN / IIN):
              </label>
              <input
                type="text"
                maxLength={8}
                value={binNumber}
                onChange={(e) => setBinNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-cyan-300 focus:border-purple-500 tracking-wider"
                placeholder="453211"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Apenas os dígitos de identificação institucional da bandeira.</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Bandeira (Network)</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{binDetails.brand}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Categoria / Nível</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{binDetails.level}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Tipo de Cartão</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{binDetails.type}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">País Emissor</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{binDetails.country}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
