'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  Radio, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  FileCode, 
  Cpu, 
  Layers, 
  Sparkles, 
  Binary, 
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WebCryptoSymmetricAndWebRtcSuiteProps {
  defaultTab?: 'aes-gcm' | 'pbkdf2-hkdf' | 'webrtc-sdp' | 'pkcs7-padding' | 'tls-ciphers';
}

export const WebCryptoSymmetricAndWebRtcSuite: React.FC<WebCryptoSymmetricAndWebRtcSuiteProps> = ({ 
  defaultTab = 'aes-gcm' 
}) => {
  const [activeTab, setActiveTab] = useState<'aes-gcm' | 'pbkdf2-hkdf' | 'webrtc-sdp' | 'pkcs7-padding' | 'tls-ciphers'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: CIFRADOR & DECIFRADOR AES-GCM (128 / 256 BITS)
  // =========================================================================
  const [aesKeyLength, setAesKeyLength] = useState<128 | 256>(256);
  const [aesPassphrase, setAesPassphrase] = useState<string>('apollo_master_key_v5_cyber_2026');
  const [aesPlaintext, setAesPlaintext] = useState<string>('HOLDING V5 APOLLO: Coordenadas de lançamento do Saturn IB confirmadas.');
  const [aesIvHex, setAesIvHex] = useState<string>('a1b2c3d4e5f60718293a4b5c'); // 12 bytes = 96 bits
  const [aesCipherResultHex, setAesCipherResultHex] = useState<string>('');
  const [aesCipherResultB64, setAesCipherResultB64] = useState<string>('');
  const [aesDecryptInput, setAesDecryptInput] = useState<string>('');
  const [aesDecryptedOutput, setAesDecryptedOutput] = useState<string>('');
  const [aesDecryptStatus, setAesDecryptStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aesErrorMsg, setAesErrorMsg] = useState<string>('');

  const generateRandomIv = () => {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const hex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    setAesIvHex(hex);
  };

  // Função para derivar CryptoKey a partir de senha
  const getAesKeyFromPassphrase = async (password: string, length: 128 | 256): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(password));
    const rawKey = hash.slice(0, length / 8);
    return await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  };

  // Cifrar AES-GCM
  const runAesEncrypt = async () => {
    try {
      if (!aesPassphrase || !aesPlaintext) return;
      const key = await getAesKeyFromPassphrase(aesPassphrase, aesKeyLength);
      
      // Parse IV (12 bytes)
      let ivBytes: Uint8Array;
      if (aesIvHex.length === 24) {
        const matches = aesIvHex.match(/.{1,2}/g);
        ivBytes = new Uint8Array(matches ? matches.map(byte => parseInt(byte, 16)) : []);
      } else {
        ivBytes = new Uint8Array(12);
        crypto.getRandomValues(ivBytes);
      }

      const enc = new TextEncoder();
      const ciphertextBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes as any,
          tagLength: 128
        },
        key,
        enc.encode(aesPlaintext)
      );

      const cipherBytes = new Uint8Array(ciphertextBuffer);
      const hex = Array.from(cipherBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      let binary = '';
      for (let i = 0; i < cipherBytes.byteLength; i++) {
        binary += String.fromCharCode(cipherBytes[i]);
      }
      const b64 = btoa(binary);

      setAesCipherResultHex(hex);
      setAesCipherResultB64(b64);
      setAesDecryptInput(hex);
    } catch (err: any) {
      console.error('AES Encrypt error:', err);
    }
  };

  // Decifrar AES-GCM
  const runAesDecrypt = async () => {
    try {
      setAesErrorMsg('');
      if (!aesDecryptInput) return;
      const key = await getAesKeyFromPassphrase(aesPassphrase, aesKeyLength);

      let ivBytes: Uint8Array;
      if (aesIvHex.length === 24) {
        const matches = aesIvHex.match(/.{1,2}/g);
        ivBytes = new Uint8Array(matches ? matches.map(byte => parseInt(byte, 16)) : []);
      } else {
        throw new Error('IV inválido. Deve ter exatamente 24 caracteres hexadecimais (12 bytes).');
      }

      // Detectar se input é hex ou base64
      let cipherBytes: Uint8Array;
      const cleanInput = aesDecryptInput.trim();
      const isHex = /^[0-9a-fA-F]+$/.test(cleanInput) && cleanInput.length % 2 === 0;

      if (isHex) {
        const matches = cleanInput.match(/.{1,2}/g) || [];
        cipherBytes = new Uint8Array(matches.map(b => parseInt(b, 16)));
      } else {
        const binStr = atob(cleanInput);
        cipherBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          cipherBytes[i] = binStr.charCodeAt(i);
        }
      }

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes as any,
          tagLength: 128
        },
        key,
        cipherBytes as any
      );

      const dec = new TextDecoder();
      const plaintext = dec.decode(decryptedBuffer);
      setAesDecryptedOutput(plaintext);
      setAesDecryptStatus('success');
    } catch (err: any) {
      setAesDecryptStatus('error');
      setAesErrorMsg('Falha na autenticação GCM! A senha, o IV ou o ciphertext foram alterados/corrompidos (Auth Tag mismatch).');
      setAesDecryptedOutput('');
    }
  };

  useEffect(() => {
    runAesEncrypt();
  }, [aesKeyLength, aesPassphrase, aesPlaintext, aesIvHex]);

  // =========================================================================
  // FERRAMENTA 2: DERIVAÇÃO DE CHAVES PBKDF2 & HKDF (RFC 5869)
  // =========================================================================
  const [pbkdfPassword, setPbkdfPassword] = useState<string>('segredo_super_forte_v5_apollo');
  const [pbkdfSalt, setPbkdfSalt] = useState<string>('v5_salt_estudio_2026');
  const [pbkdfIterations, setPbkdfIterations] = useState<number>(100000);
  const [pbkdfHashAlgo, setPbkdfHashAlgo] = useState<'SHA-256' | 'SHA-512'>('SHA-256');
  const [pbkdfKeySize, setPbkdfKeySize] = useState<128 | 256 | 512>(256);
  const [pbkdfDerivedHex, setPbkdfDerivedHex] = useState<string>('');
  const [pbkdfDerivedB64, setPbkdfDerivedB64] = useState<string>('');
  const [hkdfInfo, setHkdfInfo] = useState<string>('v5-token-auth-purpose');
  const [hkdfDerivedHex, setHkdfDerivedHex] = useState<string>('');
  const [isDeriving, setIsDeriving] = useState<boolean>(false);

  const runDerivation = async () => {
    setIsDeriving(true);
    try {
      const enc = new TextEncoder();
      const pwKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(pbkdfPassword),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // PBKDF2
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: enc.encode(pbkdfSalt),
          iterations: pbkdfIterations,
          hash: pbkdfHashAlgo
        },
        pwKey,
        pbkdfKeySize
      );

      const pbkdfBytes = new Uint8Array(derivedBits);
      const hex = Array.from(pbkdfBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      let bin = '';
      for (let i = 0; i < pbkdfBytes.byteLength; i++) {
        bin += String.fromCharCode(pbkdfBytes[i]);
      }
      setPbkdfDerivedHex(hex);
      setPbkdfDerivedB64(btoa(bin));

      // HKDF (RFC 5869)
      const hkdfKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(pbkdfPassword),
        { name: 'HKDF' },
        false,
        ['deriveBits']
      );

      const hkdfBits = await crypto.subtle.deriveBits(
        {
          name: 'HKDF',
          hash: pbkdfHashAlgo,
          salt: enc.encode(pbkdfSalt),
          info: enc.encode(hkdfInfo)
        },
        hkdfKey,
        pbkdfKeySize
      );
      const hkdfBytes = new Uint8Array(hkdfBits);
      const hkdfHexStr = Array.from(hkdfBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      setHkdfDerivedHex(hkdfHexStr);
    } catch (e) {
      console.error('Derivation error:', e);
    } finally {
      setIsDeriving(false);
    }
  };

  useEffect(() => {
    runDerivation();
  }, [pbkdfPassword, pbkdfSalt, pbkdfIterations, pbkdfHashAlgo, pbkdfKeySize, hkdfInfo]);

  // =========================================================================
  // FERRAMENTA 3: INSPETOR E PARSER WEBRTC SDP & ICE CANDIDATES (RFC 4566/8445)
  // =========================================================================
  const defaultSdpSample = `v=0
o=- 4611731400431189000 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:v5ApolloWebRtc
a=ice-pwd:9xyzCyberSecret1234567890abcdef
a=fingerprint:sha-256 7B:3F:8D:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A
a=setup:actpass
a=mid:0
a=rtpmap:111 opus/48000/2
m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102 121 127 120 125 107 108 109 124 119 123 118
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=mid:1
a=rtpmap:96 VP8/90000
a=rtpmap:97 rtx/90000
a=rtpmap:98 VP9/90000
a=rtpmap:102 H264/90000
a=candidate:1461317456 1 udp 2122260223 192.168.1.105 58321 typ host generation 0
a=candidate:2128509376 1 udp 1686052607 177.136.24.12 58321 typ srflx raddr 192.168.1.105 rport 58321 generation 0
a=candidate:3344556677 1 udp 41819903 203.0.113.50 3478 typ relay raddr 177.136.24.12 rport 58321 generation 0`;

  const [sdpInput, setSdpInput] = useState<string>(defaultSdpSample);

  const parsedSdp = useMemo(() => {
    const lines = sdpInput.split('\n').map(l => l.trim()).filter(Boolean);
    let ufrag = '';
    let pwd = '';
    let fingerprint = '';
    let bundleGroup = '';
    const mediaSections: Array<{ type: string; port: string; proto: string; payloads: string[]; codecs: string[] }> = [];
    const iceCandidates: Array<{ foundation: string; component: string; transport: string; priority: string; ip: string; port: string; type: string }> = [];

    let currentMedia: { type: string; port: string; proto: string; payloads: string[]; codecs: string[] } | null = null;

    for (const line of lines) {
      if (line.startsWith('a=ice-ufrag:')) ufrag = line.replace('a=ice-ufrag:', '');
      if (line.startsWith('a=ice-pwd:')) pwd = line.replace('a=ice-pwd:', '');
      if (line.startsWith('a=fingerprint:')) fingerprint = line.replace('a=fingerprint:', '');
      if (line.startsWith('a=group:BUNDLE')) bundleGroup = line.replace('a=group:BUNDLE', '').trim();

      if (line.startsWith('m=')) {
        if (currentMedia) mediaSections.push(currentMedia);
        const parts = line.substring(2).split(' ');
        currentMedia = {
          type: parts[0] || 'unknown',
          port: parts[1] || '0',
          proto: parts[2] || 'RTP/SAVPF',
          payloads: parts.slice(3),
          codecs: []
        };
      }

      if (line.startsWith('a=rtpmap:') && currentMedia) {
        const codecPart = line.replace('a=rtpmap:', '').split(' ')[1];
        if (codecPart) currentMedia.codecs.push(codecPart);
      }

      if (line.startsWith('a=candidate:')) {
        const parts = line.replace('a=candidate:', '').split(' ');
        iceCandidates.push({
          foundation: parts[0] || '',
          component: parts[1] === '1' ? 'RTP' : 'RTCP',
          transport: parts[2] || 'UDP',
          priority: parts[3] || '0',
          ip: parts[4] || '',
          port: parts[5] || '',
          type: parts[7] || 'host'
        });
      }
    }

    if (currentMedia) mediaSections.push(currentMedia);

    return { ufrag, pwd, fingerprint, bundleGroup, mediaSections, iceCandidates, lineCount: lines.length };
  }, [sdpInput]);

  // =========================================================================
  // FERRAMENTA 4: CALCULADORA DE PADDING CRIPTOGRÁFICO PKCS#7 & ANSI X9.23
  // =========================================================================
  const [paddingInputText, setPaddingInputText] = useState<string>('APOLLO_TRANSACTION_PAYLOAD_99');
  const [paddingBlockSize, setPaddingBlockSize] = useState<8 | 16>(16); // 16 bytes = AES (128 bits), 8 bytes = DES
  const [paddingStandard, setPaddingStandard] = useState<'pkcs7' | 'ansi-x923' | 'iso-7816-4' | 'zero'>('pkcs7');

  const paddingResult = useMemo(() => {
    const enc = new TextEncoder();
    const inputBytes = enc.encode(paddingInputText);
    const dataLen = inputBytes.length;
    const remainder = dataLen % paddingBlockSize;
    const padCount = paddingBlockSize - remainder; // se remainder 0, adiciona bloco completo
    const totalLen = dataLen + padCount;

    const paddedBuffer = new Uint8Array(totalLen);
    paddedBuffer.set(inputBytes, 0);

    const padBytesArray: number[] = [];
    for (let i = 0; i < padCount; i++) {
      let b = 0;
      if (paddingStandard === 'pkcs7') {
        b = padCount;
      } else if (paddingStandard === 'ansi-x923') {
        b = (i === padCount - 1) ? padCount : 0x00;
      } else if (paddingStandard === 'iso-7816-4') {
        b = (i === 0) ? 0x80 : 0x00;
      } else if (paddingStandard === 'zero') {
        b = 0x00;
      }
      paddedBuffer[dataLen + i] = b;
      padBytesArray.push(b);
    }

    const blocks: Array<{ index: number; bytes: number[]; hex: string; isPaddingOnly: boolean }> = [];
    for (let i = 0; i < totalLen; i += paddingBlockSize) {
      const slice = Array.from(paddedBuffer.slice(i, i + paddingBlockSize));
      const hex = slice.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      blocks.push({
        index: i / paddingBlockSize + 1,
        bytes: slice,
        hex,
        isPaddingOnly: i >= dataLen
      });
    }

    return {
      dataLen,
      padCount,
      totalLen,
      blocksCount: blocks.length,
      padBytesHex: padBytesArray.map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
      blocks
    };
  }, [paddingInputText, paddingBlockSize, paddingStandard]);

  // =========================================================================
  // FERRAMENTA 5: AVALIADOR & COMPARADOR DE CIPHER SUITES TLS 1.3 / 1.2
  // =========================================================================
  const CIPHER_CATALOG = [
    {
      name: 'TLS_AES_256_GCM_SHA384',
      tlsVersion: 'TLS 1.3',
      keyExchange: 'ECDHE (Forward Secrecy nativo)',
      auth: 'Certificado (RSA/ECDSA)',
      encryption: 'AES-256-GCM (AEAD)',
      mac: 'Integrado GCM (128-bit tag)',
      securityRating: 'A+ (Recomendado OWASP 2026)',
      status: 'secure',
      bits: 256
    },
    {
      name: 'TLS_CHACHA20_POLY1305_SHA256',
      tlsVersion: 'TLS 1.3',
      keyExchange: 'ECDHE (Forward Secrecy nativo)',
      auth: 'Certificado (RSA/ECDSA)',
      encryption: 'ChaCha20-Poly1305 (AEAD Mobile Ultra-Fast)',
      mac: 'Integrado Poly1305 (128-bit tag)',
      securityRating: 'A+ (Excelente em CPUs sem AES-NI)',
      status: 'secure',
      bits: 256
    },
    {
      name: 'TLS_AES_128_GCM_SHA256',
      tlsVersion: 'TLS 1.3',
      keyExchange: 'ECDHE (Forward Secrecy nativo)',
      auth: 'Certificado (RSA/ECDSA)',
      encryption: 'AES-128-GCM (AEAD)',
      mac: 'Integrado GCM',
      securityRating: 'A (Rápido e Altamente Seguro)',
      status: 'secure',
      bits: 128
    },
    {
      name: 'ECDHE-ECDSA-AES256-GCM-SHA384',
      tlsVersion: 'TLS 1.2',
      keyExchange: 'ECDHE',
      auth: 'ECDSA',
      encryption: 'AES-256-GCM',
      mac: 'AEAD',
      securityRating: 'A (Padrão Moderno TLS 1.2)',
      status: 'secure',
      bits: 256
    },
    {
      name: 'ECDHE-RSA-AES128-SHA256',
      tlsVersion: 'TLS 1.2',
      keyExchange: 'ECDHE',
      auth: 'RSA',
      encryption: 'AES-128-CBC',
      mac: 'HMAC-SHA256',
      securityRating: 'B (CBC Mode - Vulnerável a Lucky13 se mal implementado)',
      status: 'warning',
      bits: 128
    },
    {
      name: 'AES256-SHA256',
      tlsVersion: 'TLS 1.2',
      keyExchange: 'RSA estático (Sem Forward Secrecy!)',
      auth: 'RSA',
      encryption: 'AES-256-CBC',
      mac: 'HMAC-SHA256',
      securityRating: 'C (Sem PFS - Chave privada comprometida revela tráfego passado)',
      status: 'warning',
      bits: 256
    },
    {
      name: 'DES-CBC3-SHA',
      tlsVersion: 'TLS 1.0 / 1.1',
      keyExchange: 'RSA estático',
      auth: 'RSA',
      encryption: '3DES (Triple-DES 168-bit / Sweet32)',
      mac: 'HMAC-SHA1',
      securityRating: 'F (Inseguro - Ataque Sweet32 RFC 7984)',
      status: 'insecure',
      bits: 112
    },
    {
      name: 'RC4-MD5',
      tlsVersion: 'SSL 3.0 / TLS 1.0',
      keyExchange: 'RSA estático',
      auth: 'RSA',
      encryption: 'RC4 Stream Cipher',
      mac: 'HMAC-MD5',
      securityRating: 'F (Proibido RFC 7465 - Bar Mitzvah Attack)',
      status: 'insecure',
      bits: 128
    }
  ];

  const [cipherSearch, setCipherSearch] = useState<string>('');
  const [cipherFilterTls, setCipherFilterTls] = useState<string>('all');

  const filteredCiphers = useMemo(() => {
    return CIPHER_CATALOG.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(cipherSearch.toLowerCase()) || 
                            c.encryption.toLowerCase().includes(cipherSearch.toLowerCase());
      const matchesTls = cipherFilterTls === 'all' || c.tlsVersion.includes(cipherFilterTls);
      return matchesSearch && matchesTls;
    });
  }, [cipherSearch, cipherFilterTls]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 text-slate-200">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Suíte de Criptografia Simétrica Web Crypto & WebRTC P2P
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                  Etapa 63 · 325 Ferramentas
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Cifrador AES-GCM autenticado, derivação PBKDF2/HKDF, parsing de SDP/ICE WebRTC, padding PKCS#7 e auditor de Ciphersuites TLS 1.3.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('aes-gcm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'aes-gcm' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            AES-GCM 256
          </button>

          <button
            onClick={() => setActiveTab('pbkdf2-hkdf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'pbkdf2-hkdf' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            PBKDF2 & HKDF
          </button>

          <button
            onClick={() => setActiveTab('webrtc-sdp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'webrtc-sdp' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            WebRTC SDP / ICE
          </button>

          <button
            onClick={() => setActiveTab('pkcs7-padding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'pkcs7-padding' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Padding PKCS#7
          </button>

          <button
            onClick={() => setActiveTab('tls-ciphers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'tls-ciphers' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            TLS Ciphersuites
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: AES-GCM 128 / 256 BITS
      ===================================================================== */}
      {activeTab === 'aes-gcm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Comprimento da Chave</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAesKeyLength(128)}
                  className={`py-2 text-xs font-mono rounded-lg transition-all border ${
                    aesKeyLength === 128 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  AES-128 (16B)
                </button>
                <button
                  onClick={() => setAesKeyLength(256)}
                  className={`py-2 text-xs font-mono rounded-lg transition-all border ${
                    aesKeyLength === 256 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  AES-256 (32B)
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">Vetor de Inicialização (IV 12B / 96-bit)</label>
                <button
                  onClick={generateRandomIv}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3 h-3" /> Gerar IV
                </button>
              </div>
              <input
                type="text"
                value={aesIvHex}
                onChange={e => setAesIvHex(e.target.value.toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, 24))}
                placeholder="24 caracteres hex (12 bytes)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Senha / Segredo de Derivação</label>
              <input
                type="text"
                value={aesPassphrase}
                onChange={e => setAesPassphrase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ENCRIPTAR */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <Lock className="w-4 h-4" />
                Cifrador AEAD (Autenticado com Tag 128-bit)
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Texto Claro (Plaintext)</label>
                <textarea
                  value={aesPlaintext}
                  onChange={e => setAesPlaintext(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Resultado Criptografado (Hex + Auth Tag no final)</span>
                  <button 
                    onClick={() => copyToClipboard(aesCipherResultHex, 'aes-hex')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    {copiedKey === 'aes-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar Hex
                  </button>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 break-all select-all max-h-24 overflow-y-auto">
                  {aesCipherResultHex || 'Processando...'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Resultado Base64</span>
                  <button 
                    onClick={() => copyToClipboard(aesCipherResultB64, 'aes-b64')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    {copiedKey === 'aes-b64' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar Base64
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 break-all select-all">
                  {aesCipherResultB64 || 'Processando...'}
                </div>
              </div>
            </div>

            {/* DECIFRAR */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Unlock className="w-4 h-4" />
                Decifrador & Verificador de Integridade GCM
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ciphertext para Decifrar (Hex ou Base64)</label>
                <textarea
                  value={aesDecryptInput}
                  onChange={e => setAesDecryptInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={runAesDecrypt}
                className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Unlock className="w-4 h-4" /> Validar Integridade & Decifrar
              </button>

              {aesDecryptStatus === 'success' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Autenticação GCM Válida! Plaintext Recuperado:
                  </div>
                  <div className="text-xs font-mono text-white p-2 bg-slate-950 rounded border border-emerald-900/50 break-words">
                    {aesDecryptedOutput}
                  </div>
                </div>
              )}

              {aesDecryptStatus === 'error' && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-300 font-mono">
                    {aesErrorMsg}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PBKDF2 & HKDF KEY DERIVATION
      ===================================================================== */}
      {activeTab === 'pbkdf2-hkdf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Senha Mestra (Input Secret)</label>
              <input
                type="text"
                value={pbkdfPassword}
                onChange={e => setPbkdfPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Salt Criptográfico</label>
              <input
                type="text"
                value={pbkdfSalt}
                onChange={e => setPbkdfSalt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Iterações PBKDF2 (Nível OWASP)</label>
              <select
                value={pbkdfIterations}
                onChange={e => setPbkdfIterations(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
              >
                <option value={10000}>10.000 iterações (Legado)</option>
                <option value={100000}>100.000 iterações (Recomendado 2024)</option>
                <option value={310000}>310.000 iterações (OWASP 2026)</option>
                <option value={600000}>600.000 iterações (Alta Resistência GPU)</option>
              </select>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Hash & Tamanho da Chave</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={pbkdfHashAlgo}
                  onChange={e => setPbkdfHashAlgo(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs font-mono text-slate-300"
                >
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
                <select
                  value={pbkdfKeySize}
                  onChange={e => setPbkdfKeySize(Number(e.target.value) as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs font-mono text-cyan-300"
                >
                  <option value={128}>128 bits</option>
                  <option value={256}>256 bits</option>
                  <option value={512}>512 bits</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PBKDF2 OUTPUT */}
            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Key className="w-4 h-4" /> PBKDF2 Chave Derivada ({pbkdfKeySize} bits)
                </div>
                <button
                  onClick={() => copyToClipboard(pbkdfDerivedHex, 'pbkdf-hex')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  {copiedKey === 'pbkdf-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar Hex
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-amber-300 break-all border border-slate-800 select-all">
                {isDeriving ? 'Derivando...' : pbkdfDerivedHex}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Representação Base64:</span>
                <span className="font-mono text-slate-300 break-all text-[11px]">{pbkdfDerivedB64}</span>
              </div>
            </div>

            {/* HKDF OUTPUT */}
            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" /> HKDF (RFC 5869 Extract-and-Expand)
                </div>
                <button
                  onClick={() => copyToClipboard(hkdfDerivedHex, 'hkdf-hex')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  {copiedKey === 'hkdf-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar Hex
                </button>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Contexto de Aplicação (Info string)</label>
                <input
                  type="text"
                  value={hkdfInfo}
                  onChange={e => setHkdfInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-cyan-300 break-all border border-slate-800 select-all">
                {isDeriving ? 'Derivando...' : hkdfDerivedHex}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: WEBRTC SDP & ICE PARSER
      ===================================================================== */}
      {activeTab === 'webrtc-sdp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Sessão SDP / Oferta WebRTC (RFC 4566)
                </label>
                <button
                  onClick={() => setSdpInput(defaultSdpSample)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  Restaurar Exemplo
                </button>
              </div>
              <textarea
                value={sdpInput}
                onChange={e => setSdpInput(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">SEÇÕES DE MÍDIA</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">{parsedSdp.mediaSections.length}</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">CANDIDATOS ICE</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{parsedSdp.iceCandidates.length}</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">BUNDLE GROUP</div>
                  <div className="text-sm font-bold text-white font-mono truncate">{parsedSdp.bundleGroup || 'N/A'}</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">ICE UFRAG</div>
                  <div className="text-sm font-bold text-amber-300 font-mono truncate">{parsedSdp.ufrag || 'N/A'}</div>
                </div>
              </div>

              {/* MÍDIAS E CODECS */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300">Streams de Mídia Detectados:</div>
                <div className="space-y-2">
                  {parsedSdp.mediaSections.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-cyan-400 uppercase font-mono">{m.type}</span>
                        <span className="text-[11px] text-slate-400 ml-2 font-mono">Porta {m.port} ({m.proto})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.codecs.map((c, ci) => (
                          <span key={ci} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABELA DE CANDIDATOS ICE */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Candidatos ICE (RFC 8445):</div>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {parsedSdp.iceCandidates.map((cand, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          cand.type === 'host' ? 'bg-cyan-500/20 text-cyan-300' :
                          cand.type === 'srflx' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {cand.type.toUpperCase()}
                        </span>
                        <span className="text-white">{cand.ip}:{cand.port}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{cand.transport} ({cand.component})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: PADDING PKCS#7 CALCULATOR
      ===================================================================== */}
      {activeTab === 'pkcs7-padding' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Tamanho do Bloco de Cifra</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaddingBlockSize(16)}
                  className={`py-2 text-xs font-mono rounded-lg transition-all border ${
                    paddingBlockSize === 16 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  16 Bytes (AES 128-bit)
                </button>
                <button
                  onClick={() => setPaddingBlockSize(8)}
                  className={`py-2 text-xs font-mono rounded-lg transition-all border ${
                    paddingBlockSize === 8 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  8 Bytes (DES / Blowfish)
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Padrão de Preenchimento (Padding)</label>
              <select
                value={paddingStandard}
                onChange={e => setPaddingStandard(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
              >
                <option value="pkcs7">PKCS#7 (RFC 5652 - Padrão Ouro)</option>
                <option value="ansi-x923">ANSI X9.23 (Zeros + byte de tamanho)</option>
                <option value="iso-7816-4">ISO/IEC 7816-4 (0x80 + zeros)</option>
                <option value="zero">Zero Padding (0x00)</option>
              </select>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Estatísticas do Payload</label>
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <div>Original: <span className="text-white font-bold">{paddingResult.dataLen} bytes</span></div>
                <div>Bytes de Padding: <span className="text-amber-400 font-bold">{paddingResult.padCount} bytes</span> ({paddingResult.padBytesHex})</div>
                <div>Total Alinhado: <span className="text-cyan-400 font-bold">{paddingResult.totalLen} bytes</span> ({paddingResult.blocksCount} blocos)</div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Texto de Entrada para Cifragem em Blocos</label>
            <input
              type="text"
              value={paddingInputText}
              onChange={e => setPaddingInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* VISUALIZAÇÃO DE BLOCOS */}
          <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Alinhamento em Blocos de {paddingBlockSize} Bytes (Hex Dump):</span>
              <span className="text-cyan-400 font-mono text-[11px]">Bytes de Padding destacados em Âmbar</span>
            </div>
            <div className="space-y-2">
              {paddingResult.blocks.map(b => (
                <div key={b.index} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      BLOCO #{b.index}
                    </span>
                    <span className="text-slate-300 tracking-wider font-semibold">
                      {b.hex}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {b.isPaddingOnly ? '(Bloco preenchido exclusivamente com padding)' : `${b.bytes.length} bytes alinhados`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: TLS CIPHER SUITES EVALUATOR
      ===================================================================== */}
      {activeTab === 'tls-ciphers' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Filtrar por nome de cifra (ex: GCM, Poly1305, CBC, 3DES, 256)..."
                value={cipherSearch}
                onChange={e => setCipherSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex gap-2">
              {['all', '1.3', '1.2', '1.0'].map(v => (
                <button
                  key={v}
                  onClick={() => setCipherFilterTls(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    cipherFilterTls === v 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {v === 'all' ? 'Todas Versões' : `TLS ${v}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCiphers.map((cipher, idx) => (
              <div 
                key={idx}
                className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{cipher.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {cipher.tlsVersion}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({cipher.bits} bits)</span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>Key Exchange: <b className="text-slate-300">{cipher.keyExchange}</b></span>
                    <span>Cifra: <b className="text-slate-300">{cipher.encryption}</b></span>
                    <span>MAC: <b className="text-slate-300">{cipher.mac}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                    cipher.status === 'secure' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    cipher.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {cipher.securityRating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
