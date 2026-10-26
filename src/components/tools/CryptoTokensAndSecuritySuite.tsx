'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Key, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Binary, 
  Fingerprint, 
  Sliders, 
  Download, 
  FileText,
  AlertTriangle,
  Code
} from 'lucide-react';

export type CryptoSecurityTab = 'rsa-keys' | 'hmac-signatures' | 'api-keys' | 'pem-inspector' | 'password-entropy';

export function CryptoTokensAndSecuritySuite({ defaultTab = 'rsa-keys' }: { defaultTab?: CryptoSecurityTab }) {
  const [activeTab, setActiveTab] = useState<CryptoSecurityTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: GERADOR DE PAR DE CHAVES RSA / ECDSA
  // ==========================================
  const [keyAlgo, setKeyAlgo] = useState<'rsa-2048' | 'rsa-4096' | 'ecdsa-p256'>('rsa-2048');
  const [publicKeyPem, setPublicKeyPem] = useState<string>('');
  const [privateKeyPem, setPrivateKeyPem] = useState<string>('');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState<boolean>(false);

  // Helper para converter ArrayBuffer para PEM
  const arrayBufferToPem = (buffer: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
  };

  const handleGenerateKeyPair = async () => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) return;
    setIsGeneratingKeys(true);

    try {
      if (keyAlgo === 'rsa-2048' || keyAlgo === 'rsa-4096') {
        const modulusLength = keyAlgo === 'rsa-4096' ? 4096 : 2048;
        const keyPair = await window.crypto.subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength,
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: 'SHA-256'
          },
          true,
          ['encrypt', 'decrypt']
        );

        const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        setPublicKeyPem(arrayBufferToPem(exportedPublic, 'PUBLIC KEY'));
        setPrivateKeyPem(arrayBufferToPem(exportedPrivate, 'PRIVATE KEY'));
      } else {
        // ECDSA P-256
        const keyPair = await window.crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: 'P-256'
          },
          true,
          ['sign', 'verify']
        );

        const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        setPublicKeyPem(arrayBufferToPem(exportedPublic, 'PUBLIC KEY'));
        setPrivateKeyPem(arrayBufferToPem(exportedPrivate, 'PRIVATE KEY'));
      }
    } catch (err) {
      console.error('Erro na geracao de chaves:', err);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  useEffect(() => {
    if (!publicKeyPem) {
      handleGenerateKeyPair();
    }
  }, [keyAlgo]);

  // ==========================================
  // TAB 2: GERADOR & VALIDADOR HMAC
  // ==========================================
  const [hmacPayload, setHmacPayload] = useState<string>('{"event":"job.completed","id":"job_7721","status":"success"}');
  const [hmacSecret, setHmacSecret] = useState<string>('v5_webhook_secret_x899');
  const [hmacAlgo, setHmacAlgo] = useState<'SHA-256' | 'SHA-512'>('SHA-256');
  const [hmacHexResult, setHmacHexResult] = useState<string>('');
  const [hmacBase64Result, setHmacBase64Result] = useState<string>('');

  const computeHmac = async (text: string, secret: string, algo: string) => {
    if (!text || !secret || typeof window === 'undefined' || !window.crypto.subtle) return;
    try {
      const enc = new TextEncoder();
      const keyData = enc.encode(secret);
      const messageData = enc.encode(text);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: algo } },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const base64 = btoa(String.fromCharCode.apply(null, hashArray));

      setHmacHexResult(hex);
      setHmacBase64Result(base64);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    computeHmac(hmacPayload, hmacSecret, hmacAlgo);
  }, [hmacPayload, hmacSecret, hmacAlgo]);

  // ==========================================
  // TAB 3: GERADOR DE API KEYS & SECRETS
  // ==========================================
  const [apiKeyPrefix, setApiKeyPrefix] = useState<string>('v5_live_');
  const [apiKeyEntropyBytes, setApiKeyEntropyBytes] = useState<number>(32);
  const [apiKeyList, setApiKeyList] = useState<string[]>([]);

  const generateApiKeys = () => {
    const list: string[] = [];
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < 4; i++) {
      const bytes = new Uint8Array(apiKeyEntropyBytes);
      crypto.getRandomValues(bytes);
      let randStr = '';
      for (let j = 0; j < bytes.length; j++) {
        randStr += alphabet[bytes[j] % alphabet.length];
      }
      list.push(`${apiKeyPrefix}${randStr}`);
    }
    setApiKeyList(list);
  };

  useEffect(() => {
    generateApiKeys();
  }, [apiKeyPrefix, apiKeyEntropyBytes]);

  // ==========================================
  // TAB 4: INSPETOR & DECODIFICADOR PEM (X.509)
  // ==========================================
  const [pemInput, setPemInput] = useState<string>(
`-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJALe2kO... (Cole seu certificado ou chave PEM aqui)
-----END CERTIFICATE-----`
  );

  const inspectPem = (pem: string) => {
    const trimmed = pem.trim();
    let type = 'Desconhecido';
    if (trimmed.includes('BEGIN CERTIFICATE')) type = 'Certificado X.509';
    else if (trimmed.includes('BEGIN PUBLIC KEY')) type = 'Chave Pública SPKI (X.509)';
    else if (trimmed.includes('BEGIN PRIVATE KEY')) type = 'Chave Privada PKCS#8';
    else if (trimmed.includes('BEGIN RSA PRIVATE KEY')) type = 'Chave Privada RSA (PKCS#1)';
    else if (trimmed.includes('BEGIN EC PRIVATE KEY')) type = 'Chave Privada Curva Elíptica (SEC1)';

    const bodyClean = trimmed
      .replace(/-----BEGIN [A-Z0-9 ]+-----/g, '')
      .replace(/-----END [A-Z0-9 ]+-----/g, '')
      .replace(/\s+/g, '');

    const byteLength = Math.floor((bodyClean.length * 3) / 4);

    return {
      type,
      lengthChars: bodyClean.length,
      estimatedBytes: byteLength,
      estimatedBits: byteLength * 8,
      isValidBase64: /^[A-Za-z0-9+/=]+$/.test(bodyClean)
    };
  };

  const pemInspection = inspectPem(pemInput);

  // ==========================================
  // TAB 5: CALCULADORA DE ENTROPIA DE SENHAS
  // ==========================================
  const [passwordInput, setPasswordInput] = useState<string>('V5Apollo!Modal2026#Secure');

  const calculateEntropy = (pwd: string) => {
    if (!pwd) return { entropy: 0, poolSize: 0, rating: 'Vazio', timeToCrack: 'Instantâneo' };

    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33; // Símbolos comuns

    if (poolSize === 0) poolSize = 26;

    // Fórmula de Shannon: E = L * log2(R)
    const entropy = pwd.length * Math.log2(poolSize);

    let rating = 'Muito Fraca';
    let timeToCrack = 'Menos de 1 segundo';

    if (entropy < 28) {
      rating = 'Muito Fraca';
      timeToCrack = 'Instantâneo (&lt; 1 ms)';
    } else if (entropy < 45) {
      rating = 'Fraca';
      timeToCrack = 'Alguns segundos';
    } else if (entropy < 60) {
      rating = 'Razoável';
      timeToCrack = 'Alguns dias a meses';
    } else if (entropy < 80) {
      rating = 'Forte';
      timeToCrack = 'Várias décadas';
    } else {
      rating = 'Militar / Altamente Segura';
      timeToCrack = 'Centenas de milênios (Inviolável)';
    }

    return {
      entropy: Math.round(entropy),
      poolSize,
      length: pwd.length,
      rating,
      timeToCrack
    };
  };

  const entropyResult = calculateEntropy(passwordInput);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de Criptografia Moderna, Assinatura & Tokens
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Client-Side · Etapa 28
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Par de Chaves RSA/ECDSA, Assinaturas HMAC Webhook, Gerador de API Keys, Inspetor PEM e Entropia de Shannon.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('rsa-keys')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'rsa-keys'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>RSA / ECDSA</span>
          </button>
          <button
            onClick={() => setActiveTab('hmac-signatures')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'hmac-signatures'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HMAC Webhooks</span>
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'api-keys'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>API Keys</span>
          </button>
          <button
            onClick={() => setActiveTab('pem-inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'pem-inspector'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inspetor PEM</span>
          </button>
          <button
            onClick={() => setActiveTab('password-entropy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'password-entropy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Entropia de Senhas</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: GERADOR DE PAR DE CHAVES RSA / ECDSA */}
        {/* ========================================== */}
        {activeTab === 'rsa-keys' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Algoritmo Criptográfico:
                </span>
                <select
                  value={keyAlgo}
                  onChange={(e) => setKeyAlgo(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
                >
                  <option value="rsa-2048">RSA 2048 bits (Padrão)</option>
                  <option value="rsa-4096">RSA 4096 bits (Alta Segurança)</option>
                  <option value="ecdsa-p256">ECDSA P-256 (Curva Elíptica)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateKeyPair}
                disabled={isGeneratingKeys}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingKeys ? 'animate-spin' : ''}`} />
                {isGeneratingKeys ? 'Gerando Chaves...' : 'Gerar Novo Par de Chaves'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chave Pública */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Unlock className="w-4 h-4" />
                    Chave Pública (Public Key · SPKI)
                  </span>
                  <button
                    onClick={() => copyToClipboard(publicKeyPem, 'pub-key')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1"
                  >
                    {copiedKey === 'pub-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
                  {publicKeyPem || 'Gerando chave pública...'}
                </pre>
              </div>

              {/* Chave Privada */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Chave Privada (Private Key · PKCS#8)
                  </span>
                  <button
                    onClick={() => copyToClipboard(privateKeyPem, 'priv-key')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1"
                  >
                    {copiedKey === 'priv-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
                  {privateKeyPem || 'Gerando chave privada...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: GERADOR & VALIDADOR HMAC */}
        {/* ========================================== */}
        {activeTab === 'hmac-signatures' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entradas */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Payload & Chave Secreta
                    </span>
                    <select
                      value={hmacAlgo}
                      onChange={(e) => setHmacAlgo(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-cyan-300"
                    >
                      <option value="SHA-256">HMAC-SHA256</option>
                      <option value="SHA-512">HMAC-SHA512</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Payload da Requisição (Corpo do Webhook)</label>
                    <textarea
                      rows={6}
                      value={hmacPayload}
                      onChange={(e) => setHmacPayload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Secret Key (Chave Secreta)</label>
                    <input
                      type="text"
                      value={hmacSecret}
                      onChange={(e) => setHmacSecret(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Saídas da Assinatura */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Assinatura Criptográfica HMAC
                  </div>

                  {/* Hexadecimal */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Formato Hexadecimal:</span>
                      <button
                        onClick={() => copyToClipboard(hmacHexResult, 'hex-hmac')}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'hex-hmac' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copiar
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all">
                      {hmacHexResult}
                    </div>
                  </div>

                  {/* Base64 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Formato Base64:</span>
                      <button
                        onClick={() => copyToClipboard(hmacBase64Result, 'b64-hmac')}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'b64-hmac' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copiar
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                      {hmacBase64Result}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: GERADOR DE API KEYS */}
        {/* ========================================== */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles de Configuração */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Configuração de API Keys
                  </div>

                  {/* Prefixo */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Prefixo do Token</label>
                    <input
                      type="text"
                      value={apiKeyPrefix}
                      onChange={(e) => setApiKeyPrefix(e.target.value)}
                      placeholder="v5_live_"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
                    />
                  </div>

                  {/* Entropia */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Bytes de Entropia</span>
                      <span className="font-mono text-cyan-400">{apiKeyEntropyBytes} bytes ({apiKeyEntropyBytes * 8} bits)</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={64}
                      step={8}
                      value={apiKeyEntropyBytes}
                      onChange={(e) => setApiKeyEntropyBytes(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={generateApiKeys}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Gerar Novas Chaves
                  </button>
                </div>
              </div>

              {/* Lista de Chaves Geradas */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-mono text-slate-400">
                  Chaves Criptograficamente Seguras Geradas:
                </div>

                <div className="space-y-2">
                  {apiKeyList.map((key, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition"
                    >
                      <span className="font-mono text-xs text-cyan-300 select-all truncate mr-2">
                        {key}
                      </span>
                      <button
                        onClick={() => copyToClipboard(key, `key-${idx}`)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                      >
                        {copiedKey === `key-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: INSPETOR DE CERTIFICADOS & PEM */}
        {/* ========================================== */}
        {activeTab === 'pem-inspector' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada PEM */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Cole o Bloco PEM (X.509 ou Chave)
                  </span>
                  <textarea
                    rows={10}
                    value={pemInput}
                    onChange={(e) => setPemInput(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-y"
                  />
                </div>
              </div>

              {/* Diagnóstico PEM */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
                    Diagnóstico do Envelope PEM
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Tipo de Conteúdo Detectado:</span>
                    <span className="font-mono text-cyan-400 font-bold">{pemInspection.type}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Tamanho Estimado da Carga:</span>
                    <span className="font-mono text-slate-200">{pemInspection.estimatedBytes} bytes ({pemInspection.estimatedBits} bits)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Integridade do Base64:</span>
                    <span className={`font-mono font-bold ${pemInspection.isValidBase64 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pemInspection.isValidBase64 ? 'VÁLIDO' : 'CORROMPIDO / INVÁLIDO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: CALCULADORA DE ENTROPIA DE SENHAS */}
        {/* ========================================== */}
        {activeTab === 'password-entropy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada de Senha */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Teste de Entropia de Senha
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Digite ou cole a senha a analisar</label>
                    <input
                      type="text"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300">Como funciona a Entropia de Shannon?</div>
                    <p>
                      Mede a quantidade de incerteza em bits ($E = L \times \log_2(R)$). Senhas acima de 60 bits exigem trilhões de cálculos por segundo e são altamente resistentes a ataques de dicionário e quebra por GPU.
                    </p>
                  </div>
                </div>
              </div>

              {/* Painel de Resultados */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 space-y-5">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Entropia Total Calculada</span>
                    <div className="text-4xl font-extrabold font-mono text-cyan-400 mt-1 flex items-baseline gap-2">
                      <span>{entropyResult.entropy} Bits</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                        entropyResult.entropy >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                        entropyResult.entropy >= 60 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' :
                        entropyResult.entropy >= 45 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}>
                        {entropyResult.rating}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Tempo para Quebra por Força Bruta</span>
                      <span className="text-xs font-bold font-mono text-slate-200 mt-0.5 block">
                        {entropyResult.timeToCrack}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Conjunto de Caracteres</span>
                      <span className="text-xs font-bold font-mono text-slate-200 mt-0.5 block">
                        {entropyResult.poolSize} símbolos ({entropyResult.length} caracteres)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
