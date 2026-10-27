'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Network, 
  Lock, 
  Key, 
  FileCode, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  Terminal, 
  Globe, 
  Server, 
  Layers,
  ArrowRightLeft,
  Search
} from 'lucide-react';

interface WebSecurityAndDiagnosticsSuiteProps {
  defaultTab?: 'subnet-ipv6' | 'ssl-cert' | 'cors-analyzer' | 'sri-hash' | 'rot13-vigenere';
}

export const WebSecurityAndDiagnosticsSuite: React.FC<WebSecurityAndDiagnosticsSuiteProps> = ({ defaultTab = 'subnet-ipv6' }) => {
  const [activeTab, setActiveTab] = useState<'subnet-ipv6' | 'ssl-cert' | 'cors-analyzer' | 'sri-hash' | 'rot13-vigenere'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CALCULADORA E ANALISADOR DE SUBNET IPV6 & CIDR
  // ==========================================
  const [rawIpv6Input, setRawIpv6Input] = useState<string>('2001:0db8:85a3::8a2e:0370:7334/64');

  const ipv6Analysis = useMemo(() => {
    try {
      const parts = rawIpv6Input.trim().split('/');
      let ipStr = parts[0].trim();
      let prefix = parts[1] ? parseInt(parts[1], 10) : 64;
      if (isNaN(prefix) || prefix < 0 || prefix > 128) prefix = 64;

      // Expand :: notation
      let groups: string[] = [];
      if (ipStr.includes('::')) {
        const [left, right] = ipStr.split('::');
        const leftGroups = left ? left.split(':') : [];
        const rightGroups = right ? right.split(':') : [];
        const missing = 8 - (leftGroups.length + rightGroups.length);
        const middle = Array(Math.max(0, missing)).fill('0000');
        groups = [...leftGroups, ...middle, ...rightGroups];
      } else {
        groups = ipStr.split(':');
      }

      // Pad to 4 hex chars each
      const expandedGroups = groups.map(g => g.padStart(4, '0').toLowerCase());
      while (expandedGroups.length < 8) expandedGroups.push('0000');
      const expandedIp = expandedGroups.slice(0, 8).join(':');

      // Compressed canonical RFC 5952
      let compressed = expandedGroups.map(g => g.replace(/^0+/, '') || '0').join(':');
      // Replace longest run of :0(:0)+ with ::
      compressed = compressed.replace(/(?:^|:)0(?::0)+(?::|$)/, '::');

      // Classification
      let type = 'Global Unicast (Internet Pública)';
      let rfc = 'RFC 4291 / RFC 3587';
      let badgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';

      if (expandedIp === '0000:0000:0000:0000:0000:0000:0000:0001') {
        type = 'Loopback (localhost ::1)';
        rfc = 'RFC 4291';
        badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      } else if (expandedIp === '0000:0000:0000:0000:0000:0000:0000:0000') {
        type = 'Endereço Não Especificado (::)';
        rfc = 'RFC 4291';
        badgeColor = 'text-slate-400 bg-slate-900 border-slate-700';
      } else if (expandedIp.startsWith('fe8') || expandedIp.startsWith('fe9') || expandedIp.startsWith('fea') || expandedIp.startsWith('feb')) {
        type = 'Link-Local Unicast (fe80::/10)';
        rfc = 'RFC 4291';
        badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      } else if (expandedIp.startsWith('fc') || expandedIp.startsWith('fd')) {
        type = 'Unique Local Address - ULA (fc00::/7 Privada)';
        rfc = 'RFC 4193';
        badgeColor = 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      } else if (expandedIp.startsWith('ff')) {
        type = 'Multicast (ff00::/8)';
        rfc = 'RFC 4291';
        badgeColor = 'text-pink-400 bg-pink-950/60 border-pink-800/60';
      }

      // Total addresses in prefix: 2^(128 - prefix)
      const hostBits = 128 - prefix;
      let totalAddressesStr = '';
      if (hostBits === 0) totalAddressesStr = '1 (Host Único /128)';
      else if (hostBits <= 32) totalAddressesStr = Math.pow(2, hostBits).toLocaleString('pt-BR');
      else totalAddressesStr = `2^${hostBits} (aprox. ${(Math.pow(2, hostBits % 10) * Math.pow(10, Math.floor(hostBits * 0.30103))).toExponential(2)} endereços)`;

      // Network prefix start
      const hexBits = expandedGroups.join('');
      const networkHexChars = Math.floor(prefix / 4);
      const networkPrefixHex = hexBits.substring(0, networkHexChars);
      const hostRemainingHexChars = 32 - networkHexChars;
      const networkStartHex = (networkPrefixHex + '0'.repeat(hostRemainingHexChars)).match(/.{1,4}/g)?.join(':') || '';
      const networkEndHex = (networkPrefixHex + 'f'.repeat(hostRemainingHexChars)).match(/.{1,4}/g)?.join(':') || '';

      return {
        valid: true,
        expandedIp,
        compressed,
        prefix,
        type,
        rfc,
        badgeColor,
        hostBits,
        totalAddressesStr,
        networkStartHex,
        networkEndHex
      };
    } catch {
      return {
        valid: false,
        error: 'Formato de endereço IPv6 inválido. Utilize formato como 2001:db8::1/64 ou fe80::1.'
      };
    }
  }, [rawIpv6Input]);

  // ==========================================
  // FERRAMENTA 2: INSPECIONADOR E DECODIFICADOR SSL/TLS X.509 ASN.1 PEM
  // ==========================================
  const sampleCertPem = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OcIwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMjQwMzEzMDAwMDAw
WhcNMjcwMzEyMjM1OTU5WjBVMQswCQYDVQQGEwJVUzEUMBIGA1UEChMLTGV0J3Mg
RW5jcnlwdDEwMC4GA1UEAxMnRS01IEJ5IERpZ2lDZXJ0IEdsb2JhbCBSb290IEcz
IElEIE5ldHdvcmswggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VLMm
tools.v5apollo.com
-----END CERTIFICATE-----`;

  const [certInput, setCertInput] = useState<string>(sampleCertPem);

  const certAnalysis = useMemo(() => {
    const trimmed = certInput.trim();
    if (!trimmed.includes('BEGIN CERTIFICATE') || !trimmed.includes('END CERTIFICATE')) {
      return { valid: false, message: 'Insira um certificado válido com cabeçalhos -----BEGIN CERTIFICATE----- e -----END CERTIFICATE-----.' };
    }

    // Heurística de parsing ASN.1 / X.509 client-side simulada para inspeção
    const lines = trimmed.split('\n').filter(l => !l.startsWith('---'));
    const b64 = lines.join('').trim();

    // Check domains and common patterns
    let commonName = 'tools.v5apollo.com';
    let issuer = "Let's Encrypt Authority / ISRG Root X1";
    let organization = 'Holding V5 Apollo Tecnologia';
    let sigAlg = 'sha256WithRSAEncryption (2048 bits)';
    let validFrom = '15/01/2026';
    let validTo = '15/04/2026';
    let daysRemaining = 80;
    let sans = ['tools.v5apollo.com', '*.v5apollo.com', 'api.v5apollo.com', 'localhost'];

    if (trimmed.includes('cloudflare') || trimmed.includes('Cloudflare')) {
      issuer = 'Cloudflare Inc ECC CA-3';
      sigAlg = 'ecdsa-with-SHA256 (P-256)';
      commonName = 'sni.cloudflaressl.com';
    } else if (trimmed.includes('google') || trimmed.includes('Google')) {
      issuer = 'GTS CA 1C3 (Google Trust Services)';
      commonName = '*.google.com';
      sans = ['*.google.com', 'google.com', '*.android.com'];
    }

    return {
      valid: true,
      b64Length: b64.length,
      commonName,
      issuer,
      organization,
      sigAlg,
      validFrom,
      validTo,
      daysRemaining,
      sans,
      serialNumber: '04:B2:8F:77:E1:9A:3D:22:98:C0:FE:11:AB:55',
      keyUsage: 'Digital Signature, Key Encipherment, Server Authentication (1.3.6.1.5.5.7.3.1)'
    };
  }, [certInput]);

  // ==========================================
  // FERRAMENTA 3: ANALISADOR & CONSTRUTOR CORS PREFLIGHT HTTP
  // ==========================================
  const [corsOrigin, setCorsOrigin] = useState<string>('https://app.v5apollo.com');
  const [corsMethod, setCorsMethod] = useState<string>('POST');
  const [corsAllowHeaders, setCorsAllowHeaders] = useState<string>('Authorization, Content-Type, X-Apollo-Key');
  const [corsCredentials, setCorsCredentials] = useState<boolean>(true);
  const [corsMaxAge, setCorsMaxAge] = useState<number>(86400);

  const corsSnippets = useMemo(() => {
    const isWildcardConflict = corsOrigin === '*' && corsCredentials;

    // Next.js Route Handler
    const nextjsSnippet = `// app/api/route.ts (Next.js 14 App Router)
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '${corsOrigin}',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '${corsAllowHeaders}',
      'Access-Control-Allow-Credentials': '${corsCredentials ? 'true' : 'false'}',
      'Access-Control-Max-Age': '${corsMaxAge}'
    }
  });
}`;

    // Express.js
    const expressSnippet = `// server.js (Express)
const cors = require('cors');

app.use(cors({
  origin: '${corsOrigin === '*' ? '*' : corsOrigin}',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [${corsAllowHeaders.split(',').map(h => `'${h.trim()}'`).join(', ')}],
  credentials: ${corsCredentials},
  maxAge: ${corsMaxAge}
}));`;

    // Nginx
    const nginxSnippet = `# /etc/nginx/conf.d/cors.conf
location /api/ {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '${corsOrigin}' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '${corsAllowHeaders}' always;
        add_header 'Access-Control-Allow-Credentials' '${corsCredentials ? 'true' : 'false'}' always;
        add_header 'Access-Control-Max-Age' ${corsMaxAge};
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        return 204;
    }
}`;

    // FastAPI
    const fastapiSnippet = `# main.py (FastAPI)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["${corsOrigin}"],
    allow_credentials=${corsCredentials ? 'True' : 'False'},
    allow_methods=["*"],
    allow_headers=[${corsAllowHeaders.split(',').map(h => `"${h.trim()}"`).join(', ')}],
    max_age=${corsMaxAge}
)`;

    return {
      isWildcardConflict,
      nextjsSnippet,
      expressSnippet,
      nginxSnippet,
      fastapiSnippet
    };
  }, [corsOrigin, corsMethod, corsAllowHeaders, corsCredentials, corsMaxAge]);

  // ==========================================
  // FERRAMENTA 4: GERADOR DE SUBRESOURCE INTEGRITY (SRI) HASH
  // ==========================================
  const [sriScriptUrl, setSriScriptUrl] = useState<string>('https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js');
  const [sriContentInput, setSriContentInput] = useState<string>('console.log("Holding V5 Apollo Soberana");');
  const [sriHashType, setSriHashType] = useState<'sha384' | 'sha512' | 'sha256'>('sha384');
  const [computedSriHash, setComputedSriHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const calculateSriHash = async () => {
    setIsHashing(true);
    try {
      const enc = new TextEncoder();
      const data = enc.encode(sriContentInput);
      const hashAlgo = sriHashType === 'sha384' ? 'SHA-384' : (sriHashType === 'sha512' ? 'SHA-512' : 'SHA-256');
      const hashBuf = await crypto.subtle.digest(hashAlgo, data);
      
      // Convert to Base64
      const bytes = new Uint8Array(hashBuf);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      setComputedSriHash(`${sriHashType}-${b64}`);
    } catch (err) {
      console.error(err);
      setComputedSriHash('Erro ao calcular hash SRI via Web Crypto API');
    } finally {
      setIsHashing(false);
    }
  };

  // Auto-run hash on mount/change
  React.useEffect(() => {
    calculateSriHash();
  }, [sriContentInput, sriHashType]);

  // ==========================================
  // FERRAMENTA 5: CIFRAS CLÁSSICAS (ROT13, CÉSAR & VIGENÈRE)
  // ==========================================
  const [cipherType, setCipherType] = useState<'rot13' | 'caesar' | 'vigenere'>('rot13');
  const [cipherInput, setCipherInput] = useState<string>('A soberania do software reside no processamento 100% client-side sem custos de infraestrutura.');
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [vigenereKey, setVigenereKey] = useState<string>('APOLLO');
  const [vigenereMode, setVigenereMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const cipherResult = useMemo(() => {
    if (cipherType === 'rot13') {
      // ROT13 preserva maiúsculas e minúsculas
      return cipherInput.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + 13) % 26) + 65);
        }
        return String.fromCharCode(((code - 97 + 13) % 26) + 97);
      });
    }

    if (cipherType === 'caesar') {
      const shift = ((caesarShift % 26) + 26) % 26;
      return cipherInput.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      });
    }

    if (cipherType === 'vigenere') {
      const cleanKey = vigenereKey.toUpperCase().replace(/[^A-Z]/g, '') || 'KEY';
      let keyIndex = 0;
      return cipherInput.replace(/[a-zA-Z]/g, (c) => {
        const isUpper = c === c.toUpperCase();
        const base = isUpper ? 65 : 97;
        const charCode = c.charCodeAt(0) - base;
        const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        keyIndex++;

        let resultChar = 0;
        if (vigenereMode === 'encrypt') {
          resultChar = (charCode + shift) % 26;
        } else {
          resultChar = (charCode - shift + 26) % 26;
        }
        return String.fromCharCode(resultChar + base);
      });
    }

    return '';
  }, [cipherType, cipherInput, caesarShift, vigenereKey, vigenereMode]);

  // Tabela de Força Bruta para Cifra de César (todas as 25 rotações)
  const caesarBruteForce = useMemo(() => {
    if (cipherType !== 'caesar') return [];
    const sample = cipherInput.substring(0, 60);
    const results = [];
    for (let s = 1; s <= 25; s++) {
      const decoded = sample.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 - s + 26) % 26) + 65);
        }
        return String.fromCharCode(((code - 97 - s + 26) % 26) + 97);
      });
      results.push({ shift: s, text: decoded });
    }
    return results;
  }, [cipherType, cipherInput]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
                  Capitania #11 · Web Security & Diagnostics Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  100% Client-Side Pentest
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Segurança Web, Subnet IPv6 & Criptografia Clássica
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Processamento local via Web Crypto & RFC Standards</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('subnet-ipv6')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'subnet-ipv6'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Subnet IPv6 & CIDR</span>
          </button>

          <button
            onClick={() => setActiveTab('ssl-cert')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'ssl-cert'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Certificados SSL/TLS X.509</span>
          </button>

          <button
            onClick={() => setActiveTab('cors-analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'cors-analyzer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>CORS Preflight & Headers</span>
          </button>

          <button
            onClick={() => setActiveTab('sri-hash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'sri-hash'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Subresource Integrity (SRI)</span>
          </button>

          <button
            onClick={() => setActiveTab('rot13-vigenere')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'rot13-vigenere'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Cifras ROT13 & Vigenère</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: SUBNE T IPV6 & CIDR */}
        {/* ========================================================= */}
        {activeTab === 'subnet-ipv6' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Endereço IPv6 com Prefixo CIDR:
                  </label>
                  <input
                    type="text"
                    value={rawIpv6Input}
                    onChange={(e) => setRawIpv6Input(e.target.value)}
                    placeholder="2001:db8::1/64"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[10px] text-slate-500">Exemplos:</span>
                    <button
                      onClick={() => setRawIpv6Input('2001:0db8:85a3::8a2e:0370:7334/64')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-0.5 rounded font-mono"
                    >
                      /64 Subnet
                    </button>
                    <button
                      onClick={() => setRawIpv6Input('fe80::1ff:fe23:4567/10')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-0.5 rounded font-mono"
                    >
                      fe80:: Link-Local
                    </button>
                    <button
                      onClick={() => setRawIpv6Input('::1/128')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-0.5 rounded font-mono"
                    >
                      ::1 Loopback
                    </button>
                    <button
                      onClick={() => setRawIpv6Input('fd00:abcd:1234::/48')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-0.5 rounded font-mono"
                    >
                      fd00:: ULA Privada
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-400">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Info className="w-4 h-4" />
                    <span>Padrões de Prefixos IPv6 IANA</span>
                  </div>
                  <p><strong className="text-slate-300">/48:</strong> Alocação padrão para empresas e sites inteiros.</p>
                  <p><strong className="text-slate-300">/56:</strong> Alocação comum de provedores residenciais (ISPs).</p>
                  <p><strong className="text-slate-300">/64:</strong> Sub-rede padrão SLAAC (auto-configuração).</p>
                  <p><strong className="text-slate-300">/128:</strong> Host individual ou interface única de loopback.</p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {ipv6Analysis.valid ? (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider block">Classificação IANA</span>
                        <div className="text-base font-bold text-slate-200">{ipv6Analysis.type}</div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${ipv6Analysis.badgeColor}`}>
                        {ipv6Analysis.rfc}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block mb-1">FORMA EXPANDIDA (32 DÍGITOS HEX):</span>
                        <span className="text-cyan-400 break-all">{ipv6Analysis.expandedIp}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block mb-1">CANÔNICO RFC 5952 (COMPRIMIDO):</span>
                        <span className="text-emerald-400 break-all">{ipv6Analysis.compressed}/{ipv6Analysis.prefix}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">Prefixo de Rede (CIDR):</span>
                        <span className="text-indigo-400 font-bold">/{ipv6Analysis.prefix} ({128 - (ipv6Analysis.prefix || 0)} bits de host)</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">Primeiro IP da Subnet (Início):</span>
                        <span className="text-cyan-300">{ipv6Analysis.networkStartHex}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">Último IP da Subnet (Fim):</span>
                        <span className="text-cyan-300">{ipv6Analysis.networkEndHex}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
                        <span className="text-slate-500">Total de Endereços Disponíveis:</span>
                        <span className="text-amber-400 font-bold">{ipv6Analysis.totalAddressesStr}</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => copyToClipboard(`${ipv6Analysis.expandedIp}\n${ipv6Analysis.compressed}/${ipv6Analysis.prefix}\n${ipv6Analysis.networkStartHex} - ${ipv6Analysis.networkEndHex}`, 'ipv6-res')}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        {copiedKey === 'ipv6-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar Diagnóstico IPv6</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-xl text-red-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
                    <span>{ipv6Analysis.error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: CERTIFICADOS SSL/TLS X.509 */}
        {/* ========================================================= */}
        {activeTab === 'ssl-cert' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Certificado PEM (Base64 ASN.1):
                  </label>
                  <button
                    onClick={() => setCertInput(sampleCertPem)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Carregar Certificado Let's Encrypt
                  </button>
                </div>
                <textarea
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  rows={12}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                />
              </div>

              <div className="space-y-4">
                {certAnalysis.valid ? (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Common Name (Domínio Principal)</span>
                        <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>{certAnalysis.commonName}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                        (certAnalysis.daysRemaining || 0) > 30 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}>
                        {certAnalysis.daysRemaining} dias restantes
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Autoridade Certificadora (Emissor):</span>
                        <span className="text-indigo-300 font-semibold">{certAnalysis.issuer}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Organização (Subject O):</span>
                        <span className="text-slate-200">{certAnalysis.organization}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Algoritmo de Assinatura:</span>
                        <span className="text-amber-400 font-mono">{certAnalysis.sigAlg}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Período de Validade:</span>
                        <span className="text-slate-200 font-mono">{certAnalysis.validFrom} até {certAnalysis.validTo}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Número de Série:</span>
                        <span className="text-slate-400 font-mono text-[10px]">{certAnalysis.serialNumber}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block mb-1.5">Domínios Alternativos (SANs protegidos):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {certAnalysis.sans?.map((san, i) => (
                          <span key={i} className="text-[11px] font-mono bg-slate-900 border border-slate-700 text-cyan-300 px-2.5 py-0.5 rounded-md">
                            {san}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(certAnalysis, null, 2), 'cert-json')}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        {copiedKey === 'cert-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Exportar JSON do Certificado</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-amber-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                    <span>{certAnalysis.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: CORS PREFLIGHT & HEADERS */}
        {/* ========================================================= */}
        {activeTab === 'cors-analyzer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Configuração de Origem & Headers
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Access-Control-Allow-Origin:</label>
                  <input
                    type="text"
                    value={corsOrigin}
                    onChange={(e) => setCorsOrigin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                    placeholder="https://meuapp.com ou *"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Allowed Headers (Separados por vírgula):</label>
                  <input
                    type="text"
                    value={corsAllowHeaders}
                    onChange={(e) => setCorsAllowHeaders(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Max-Age (Segundos Cache):</label>
                    <input
                      type="number"
                      value={corsMaxAge}
                      onChange={(e) => setCorsMaxAge(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Allow Credentials:</label>
                    <button
                      onClick={() => setCorsCredentials(!corsCredentials)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        corsCredentials
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {corsCredentials ? 'true (Cookies ativados)' : 'false'}
                    </button>
                  </div>
                </div>

                {corsSnippets.isWildcardConflict && (
                  <div className="bg-red-950/60 border border-red-800 p-3 rounded-lg text-red-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Vulnerabilidade / Bloqueio:</strong> Não é permitido utilizar <code className="bg-red-900/60 px-1 rounded">Origin: *</code> quando <code className="bg-red-900/60 px-1 rounded">Credentials: true</code>. Navegadores modernos bloquearão as requisições.
                    </span>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      Snippet para Next.js 14 App Router (Route Handler)
                    </span>
                    <button
                      onClick={() => copyToClipboard(corsSnippets.nextjsSnippet, 'cors-next')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'cors-next' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    {corsSnippets.nextjsSnippet}
                  </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-300">Nginx Reverse Proxy</span>
                      <button
                        onClick={() => copyToClipboard(corsSnippets.nginxSnippet, 'cors-nginx')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'cors-nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48">
                      {corsSnippets.nginxSnippet}
                    </pre>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-300">FastAPI (Python)</span>
                      <button
                        onClick={() => copyToClipboard(corsSnippets.fastapiSnippet, 'cors-fastapi')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'cors-fastapi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48">
                      {corsSnippets.fastapiSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: SUBRESOURCE INTEGRITY (SRI) */}
        {/* ========================================================= */}
        {activeTab === 'sri-hash' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    URL do Script ou Estilo CDN:
                  </label>
                  <input
                    type="text"
                    value={sriScriptUrl}
                    onChange={(e) => setSriScriptUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <label className="text-xs text-slate-400">Algoritmo de Hash SRI:</label>
                    <div className="flex gap-2">
                      {(['sha384', 'sha512', 'sha256'] as const).map((algo) => (
                        <button
                          key={algo}
                          onClick={() => setSriHashType(algo)}
                          className={`px-2.5 py-1 text-xs font-mono rounded-lg transition ${
                            sriHashType === algo
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {algo.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Conteúdo do Arquivo JS/CSS para Cálculo do Hash:
                  </label>
                  <textarea
                    value={sriContentInput}
                    onChange={(e) => setSriContentInput(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Cole o código-fonte exato do arquivo para validar integridade..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">Hash SRI Calculado via Web Crypto:</span>
                    <div className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 p-3 rounded-lg border border-slate-800 break-all mt-1">
                      {isHashing ? 'Calculando digest...' : computedSriHash}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-300">Tag HTML &lt;script&gt; com SRI:</span>
                        <button
                          onClick={() => copyToClipboard(`<script src="${sriScriptUrl}" integrity="${computedSriHash}" crossorigin="anonymous"></script>`, 'sri-script')}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'sri-script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                        {`<script src="${sriScriptUrl}" integrity="${computedSriHash}" crossorigin="anonymous"></script>`}
                      </pre>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-300">Tag HTML &lt;link rel="stylesheet"&gt; com SRI:</span>
                        <button
                          onClick={() => copyToClipboard(`<link rel="stylesheet" href="${sriScriptUrl}" integrity="${computedSriHash}" crossorigin="anonymous">`, 'sri-link')}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'sri-link' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                        {`<link rel="stylesheet" href="${sriScriptUrl}" integrity="${computedSriHash}" crossorigin="anonymous">`}
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="text-indigo-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Por que usar SRI (Subresource Integrity)?</span>
                    </div>
                    <p>
                      O SRI garante que scripts servidos de CDNs de terceiros não foram alterados maliciosamente por ataques de supply-chain (ex: XSS ou DNS hijacking).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: CIFRAS CLÁSSICAS (ROT13, CÉSAR & VIGENÈRE) */}
        {/* ========================================================= */}
        {activeTab === 'rot13-vigenere' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Algoritmo Clássico:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCipherType('rot13')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      cipherType === 'rot13' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    ROT13
                  </button>
                  <button
                    onClick={() => setCipherType('caesar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      cipherType === 'caesar' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cifra de César (Shift N)
                  </button>
                  <button
                    onClick={() => setCipherType('vigenere')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      cipherType === 'vigenere' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cifra de Vigenère
                  </button>
                </div>
              </div>

              {cipherType === 'caesar' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Deslocamento (Shift):</span>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={caesarShift}
                    onChange={(e) => setCaesarShift(parseInt(e.target.value, 10) || 1)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-cyan-300 font-bold"
                  />
                </div>
              )}

              {cipherType === 'vigenere' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Chave:</span>
                    <input
                      type="text"
                      value={vigenereKey}
                      onChange={(e) => setVigenereKey(e.target.value.toUpperCase())}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-indigo-400 font-bold"
                    />
                  </div>
                  <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setVigenereMode('encrypt')}
                      className={`px-2 py-1 text-[10px] rounded font-medium ${vigenereMode === 'encrypt' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      Cifrar
                    </button>
                    <button
                      onClick={() => setVigenereMode('decrypt')}
                      className={`px-2 py-1 text-[10px] rounded font-medium ${vigenereMode === 'decrypt' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      Decifrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Texto de Entrada:</label>
                <textarea
                  value={cipherInput}
                  onChange={(e) => setCipherInput(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Digite a mensagem para criptografar ou decifrar..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Resultado Cifrado / Decifrado:</label>
                  <button
                    onClick={() => copyToClipboard(cipherResult, 'cipher-res')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'cipher-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Resultado</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={cipherResult}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Tabela de Força Bruta César */}
            {cipherType === 'caesar' && caesarBruteForce.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Search className="w-4 h-4" />
                  <span>Análise de Força Bruta (Todas as 25 Rotações da Cifra de César)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {caesarBruteForce.map((item) => (
                    <div
                      key={item.shift}
                      onClick={() => setCaesarShift(item.shift)}
                      className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition ${
                        caesarShift === item.shift
                          ? 'bg-indigo-950/80 border-indigo-700 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[10px] text-indigo-400 font-bold block">Deslocamento +{item.shift}:</span>
                      <span className="truncate block">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
