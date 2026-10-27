'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  FileCode, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  Globe,
  Radio,
  Layers,
  Search
} from 'lucide-react';

interface OAuthSecurityAndOidcSuiteProps {
  defaultTab?: 'pkce-generator' | 'jwt-claims' | 'oauth-scopes' | 'state-nonce' | 'oidc-discovery';
}

export const OAuthSecurityAndOidcSuite: React.FC<OAuthSecurityAndOidcSuiteProps> = ({ 
  defaultTab = 'pkce-generator' 
}) => {
  const [activeTab, setActiveTab] = useState<'pkce-generator' | 'jwt-claims' | 'oauth-scopes' | 'state-nonce' | 'oidc-discovery'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: GERADOR & VALIDADOR PKCE RFC 7636 (S256)
  // =========================================================================
  const [verifierLength, setVerifierLength] = useState<number>(64); // 43 a 128
  const [codeVerifier, setCodeVerifier] = useState<string>('');
  const [codeChallenge, setCodeChallenge] = useState<string>('');
  const [manualVerifierTest, setManualVerifierTest] = useState<string>('');
  const [manualChallengeTest, setManualChallengeTest] = useState<string>('');
  const [pkceMatchStatus, setPkceMatchStatus] = useState<'idle' | 'match' | 'mismatch'>('idle');

  // Converte ArrayBuffer para Base64URL sem padding
  const bufferToBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const generatePkcePair = async () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomBytes = new Uint8Array(verifierLength);
    crypto.getRandomValues(randomBytes);
    let verifier = '';
    for (let i = 0; i < verifierLength; i++) {
      verifier += charset[randomBytes[i] % charset.length];
    }

    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(verifier));
    const challenge = bufferToBase64Url(digest);

    setCodeVerifier(verifier);
    setCodeChallenge(challenge);
  };

  const verifyManualPkce = async () => {
    if (!manualVerifierTest || !manualChallengeTest) return;
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(manualVerifierTest.trim()));
    const calculatedChallenge = bufferToBase64Url(digest);

    if (calculatedChallenge === manualChallengeTest.trim()) {
      setPkceMatchStatus('match');
    } else {
      setPkceMatchStatus('mismatch');
    }
  };

  useEffect(() => {
    generatePkcePair();
  }, [verifierLength]);

  // =========================================================================
  // FERRAMENTA 2: DECODIFICADOR & VALIDADOR DE CLAIMS JWT / OIDC
  // =========================================================================
  // JWT de exemplo com expiração futura
  const defaultJwtSample = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InY1X2Fwb2xsb19rZXlfMDEifQ.eyJpc3MiOiJodHRwczovL2F1dGgudjVhcG9sbG8uY29tIiwic3ViIjoidXNyXzB4OTkxMjhjOWEiLCJhdWQiOiJ2NS1hcG9sbG8tdG9vbHMiLCJleHAiOjE5MjQ5MDU2MDAsIm5iZiI6MTYwOTQ1OTIwMCwiaWF0IjoxNjA5NDU5MjAwLCJlbWFpbCI6ImNvbWFuZGFudGVAdjVhcG9sbG8uY29tIiwibmFtZSI6IkFwb2xsbyBDb21tYW5kZXIiLCJyb2xlcyI6WyJhZG1pbiIsImZsZWV0X3BpbG90Il19.simulated_signature_hash_bytes_for_preview_inspection';

  const [jwtInput, setJwtInput] = useState<string>(defaultJwtSample);
  const [clockSkewSec, setClockSkewSec] = useState<number>(30);

  const parsedJwt = useMemo(() => {
    const parts = jwtInput.trim().split('.');
    if (parts.length < 2) return { error: 'Formato de JWT inválido. Deve possuir 3 partes separadas por ponto (.)' };

    try {
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));

      const nowUnix = Math.floor(Date.now() / 1000);
      let isExpired = false;
      let isNotActiveYet = false;
      let expDiff = 0;

      if (payload.exp) {
        expDiff = payload.exp - nowUnix;
        isExpired = (payload.exp + clockSkewSec) < nowUnix;
      }

      if (payload.nbf) {
        isNotActiveYet = (payload.nbf - clockSkewSec) > nowUnix;
      }

      return {
        header,
        payload,
        hasSignature: parts.length === 3 && parts[2].length > 0,
        signatureSnippet: parts[2] ? parts[2].substring(0, 16) + '...' : 'None',
        isExpired,
        isNotActiveYet,
        expDiff,
        nowUnix
      };
    } catch {
      return { error: 'Falha ao decodificar payload Base64Url ou parsear JSON do token' };
    }
  }, [jwtInput, clockSkewSec]);

  // =========================================================================
  // FERRAMENTA 3: CONSTRUTOR DE MATRIZ DE ESCOPOS OAUTH 2.1 (LEAST PRIVILEGE)
  // =========================================================================
  const PROVIDER_SCOPES: Record<string, Array<{ scope: string; desc: string; risk: 'low' | 'medium' | 'high' | 'critical' }>> = {
    google: [
      { scope: 'openid', desc: 'Identificação OIDC do usuário', risk: 'low' },
      { scope: 'profile', desc: 'Nome, foto de perfil e dados públicos', risk: 'low' },
      { scope: 'email', desc: 'Endereço de e-mail verificado', risk: 'low' },
      { scope: 'https://www.googleapis.com/auth/drive.readonly', desc: 'Leitura de arquivos do Google Drive', risk: 'medium' },
      { scope: 'https://www.googleapis.com/auth/calendar', desc: 'Acesso total e edição na agenda', risk: 'high' }
    ],
    github: [
      { scope: 'read:user', desc: 'Acesso de leitura ao perfil básico', risk: 'low' },
      { scope: 'user:email', desc: 'Leitura de e-mails públicos e privados', risk: 'low' },
      { scope: 'repo', desc: 'Acesso total a repositórios públicos e privados', risk: 'critical' },
      { scope: 'workflow', desc: 'Atualização e execução de GitHub Actions', risk: 'high' },
      { scope: 'gist', desc: 'Criação e edição de gists', risk: 'medium' }
    ],
    microsoft: [
      { scope: 'User.Read', desc: 'Acesso de leitura ao perfil do usuário no Entra ID', risk: 'low' },
      { scope: 'Mail.Read', desc: 'Leitura de mensagens de e-mail do Outlook', risk: 'high' },
      { scope: 'Files.ReadWrite', desc: 'Acesso de leitura e escrita ao OneDrive', risk: 'high' },
      { scope: 'Directory.ReadWrite.All', desc: 'Permissões administrativas de leitura/escrita no diretório', risk: 'critical' }
    ]
  };

  const [selectedProvider, setSelectedProvider] = useState<string>('google');
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set(['openid', 'profile', 'email']));

  const toggleScope = (scope: string) => {
    const next = new Set(selectedScopes);
    if (next.has(scope)) next.delete(scope);
    else next.add(scope);
    setSelectedScopes(next);
  };

  const scopeQueryString = useMemo(() => {
    return Array.from(selectedScopes).join(' ');
  }, [selectedScopes]);

  // =========================================================================
  // FERRAMENTA 4: GERADOR DE STATE & NONCE COM ENTROPIA CRIPTOGRÁFICA
  // =========================================================================
  const [tokenByteSize, setTokenByteSize] = useState<number>(32); // 16, 24, 32, 64 bytes
  const [stateToken, setStateToken] = useState<string>('');
  const [nonceToken, setNonceToken] = useState<string>('');

  const generateStateNonce = () => {
    const bytesState = new Uint8Array(tokenByteSize);
    const bytesNonce = new Uint8Array(tokenByteSize);
    crypto.getRandomValues(bytesState);
    crypto.getRandomValues(bytesNonce);

    setStateToken(bufferToBase64Url(bytesState.buffer));
    setNonceToken(bufferToBase64Url(bytesNonce.buffer));
  };

  useEffect(() => {
    generateStateNonce();
  }, [tokenByteSize]);

  const entropyBits = tokenByteSize * 8;

  // =========================================================================
  // FERRAMENTA 5: INSPETOR DE DESCOBERTA OPENID CONNECT (.well-known)
  // =========================================================================
  const sampleOidcConfig = `{
  "issuer": "https://auth.v5apollo.com",
  "authorization_endpoint": "https://auth.v5apollo.com/oauth/authorize",
  "token_endpoint": "https://auth.v5apollo.com/oauth/token",
  "userinfo_endpoint": "https://auth.v5apollo.com/oauth/userinfo",
  "jwks_uri": "https://auth.v5apollo.com/.well-known/jwks.json",
  "response_types_supported": ["code", "id_token"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256", "EdDSA", "ES256"],
  "scopes_supported": ["openid", "profile", "email", "offline_access"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "private_key_jwt"],
  "code_challenge_methods_supported": ["S256"]
}`;

  const [oidcInputJson, setOidcInputJson] = useState<string>(sampleOidcConfig);

  const parsedOidc = useMemo(() => {
    try {
      const parsed = JSON.parse(oidcInputJson);
      const isPkceS256Supported = parsed.code_challenge_methods_supported?.includes('S256');
      return {
        data: parsed,
        isValid: true,
        isPkceS256Supported
      };
    } catch {
      return { isValid: false, isPkceS256Supported: false };
    }
  }, [oidcInputJson]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 text-slate-200">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Suíte de Web Security, OAuth 2.1 & OpenID Connect
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                  Etapa 67 · 345 Ferramentas
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Gerador PKCE RFC 7636, decodificador de claims JWT/OIDC, matriz de escopos Least Privilege, tokens State/Nonce e auditor OIDC.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('pkce-generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'pkce-generator' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            PKCE RFC 7636
          </button>

          <button
            onClick={() => setActiveTab('jwt-claims')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'jwt-claims' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Claims JWT / OIDC
          </button>

          <button
            onClick={() => setActiveTab('oauth-scopes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'oauth-scopes' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Matriz de Escopos
          </button>

          <button
            onClick={() => setActiveTab('state-nonce')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'state-nonce' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            State & Nonce
          </button>

          <button
            onClick={() => setActiveTab('oidc-discovery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'oidc-discovery' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            OIDC Discovery
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: PKCE RFC 7636 GENERATOR & VALIDATOR (S256)
      ===================================================================== */}
      {activeTab === 'pkce-generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Comprimento do Verifier ({verifierLength} chars)</label>
              <input
                type="range"
                min="43"
                max="128"
                value={verifierLength}
                onChange={e => setVerifierLength(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>43 min</span>
                <span>128 máx RFC</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 col-span-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300">Método de Transformação Obrigatório:</span>
                <div className="text-xs font-mono text-cyan-300 mt-0.5">code_challenge_method = S256 (SHA-256 + Base64URL)</div>
              </div>
              <button
                onClick={generatePkcePair}
                className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Novo Par
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">code_verifier (Armazenado no cliente local):</span>
                  <button
                    onClick={() => copyToClipboard(codeVerifier, 'pkce-verifier')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-xs"
                  >
                    {copiedKey === 'pkce-verifier' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar Verifier
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-white break-all border border-slate-800 select-all">
                  {codeVerifier}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">code_challenge (Enviado na requisição /authorize):</span>
                  <button
                    onClick={() => copyToClipboard(codeChallenge, 'pkce-challenge')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-xs"
                  >
                    {copiedKey === 'pkce-challenge' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar Challenge
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 break-all border border-slate-800 select-all font-bold">
                  {codeChallenge}
                </div>
              </div>
            </div>

            {/* TESTADOR DE MATCH */}
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Validador Cruzado de Par PKCE
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Verifier de Teste</label>
                <input
                  type="text"
                  value={manualVerifierTest}
                  onChange={e => setManualVerifierTest(e.target.value)}
                  placeholder="Cole o code_verifier..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Challenge Esperado</label>
                <input
                  type="text"
                  value={manualChallengeTest}
                  onChange={e => setManualChallengeTest(e.target.value)}
                  placeholder="Cole o code_challenge..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <button
                onClick={verifyManualPkce}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-all"
              >
                Validar Correspondência SHA-256
              </button>

              {pkceMatchStatus === 'match' && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Par PKCE Válido! S256 corresponde perfeitamente.
                </div>
              )}
              {pkceMatchStatus === 'mismatch' && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded text-xs text-rose-300 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> Incompatível! O hash do verifier não bate com o challenge.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CLAIMS JWT / OIDC DECODER & AUDITOR
      ===================================================================== */}
      {activeTab === 'jwt-claims' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Token JWT / ID Token OIDC</label>
            <textarea
              value={jwtInput}
              onChange={e => setJwtInput(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 break-all leading-relaxed"
            />
          </div>

          {'error' in parsedJwt ? (
            <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono">
              {parsedJwt.error}
            </div>
          ) : (
            <div className="space-y-4">
              {/* STATUS DE VALIDADE TEMPORAL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  parsedJwt.isExpired 
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                }`}>
                  {parsedJwt.isExpired ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  <div>
                    <div className="text-xs font-bold font-mono">
                      {parsedJwt.isExpired ? 'TOKEN EXPIRADO' : 'TOKEN ATIVO E VÁLIDO'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      exp: {parsedJwt.payload.exp || 'N/A'} (Delta: {parsedJwt.expDiff}s)
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                  <span className="text-slate-400">Emissor (iss):</span>
                  <div className="text-sm font-bold text-white truncate mt-1">{parsedJwt.payload.iss || 'N/A'}</div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                  <span className="text-slate-400">Audiência Alvo (aud):</span>
                  <div className="text-sm font-bold text-cyan-400 truncate mt-1">{parsedJwt.payload.aud || 'N/A'}</div>
                </div>
              </div>

              {/* PAYLOAD DECODIFICADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Header JOSE:</div>
                  <pre className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                    {JSON.stringify(parsedJwt.header, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Payload Claims:</div>
                  <pre className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                    {JSON.stringify(parsedJwt.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: CONSTRUTOR DE ESCOPOS (LEAST PRIVILEGE)
      ===================================================================== */}
      {activeTab === 'oauth-scopes' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {(['google', 'github', 'microsoft'] as const).map(p => (
              <button
                key={p}
                onClick={() => {
                  setSelectedProvider(p);
                  setSelectedScopes(new Set(PROVIDER_SCOPES[p].slice(0, 2).map(s => s.scope)));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all border capitalize ${
                  selectedProvider === p 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Selecione os escopos necessários:</div>
            <div className="space-y-2">
              {PROVIDER_SCOPES[selectedProvider]?.map(sc => {
                const isChecked = selectedScopes.has(sc.scope);
                return (
                  <div
                    key={sc.scope}
                    onClick={() => toggleScope(sc.scope)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-slate-900 border-cyan-500/50' 
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-white">{sc.scope}</div>
                        <div className="text-[11px] text-slate-400">{sc.desc}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      sc.risk === 'low' ? 'bg-emerald-500/10 text-emerald-400' :
                      sc.risk === 'medium' ? 'bg-cyan-500/10 text-cyan-400' :
                      sc.risk === 'high' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      Risco: {sc.risk}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">String de Escopos Gerada (scope query parameter):</span>
              <button
                onClick={() => copyToClipboard(scopeQueryString, 'scope-str')}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1"
              >
                {copiedKey === 'scope-str' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copiar Escopos
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded font-mono text-xs text-cyan-300 break-all select-all border border-slate-800">
              {scopeQueryString}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: STATE & NONCE ENTROPY GENERATOR
      ===================================================================== */}
      {activeTab === 'state-nonce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Tamanho do Token Criptográfico</label>
              <div className="grid grid-cols-3 gap-2">
                {[16, 32, 64].map(b => (
                  <button
                    key={b}
                    onClick={() => setTokenByteSize(b)}
                    className={`py-1.5 text-xs font-mono rounded border ${
                      tokenByteSize === b 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {b} Bytes
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 col-span-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300">Entropia Total de Shannon:</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {entropyBits} bits de entropia (2^{entropyBits} combinações possíveis)
                </div>
              </div>
              <button
                onClick={generateStateNonce}
                className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Novos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">OAuth 2.1 state Token (Anti-CSRF)</span>
                <button
                  onClick={() => copyToClipboard(stateToken, 'token-state')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                >
                  {copiedKey === 'token-state' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-white break-all border border-slate-800 select-all">
                {stateToken}
              </div>
              <div className="text-[11px] text-slate-500">
                Verificado na rota de callback após redirecionamento do Provedor de Identidade.
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">OIDC nonce Token (Anti-Replay)</span>
                <button
                  onClick={() => copyToClipboard(nonceToken, 'token-nonce')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                >
                  {copiedKey === 'token-nonce' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-300 break-all border border-slate-800 select-all">
                {nonceToken}
              </div>
              <div className="text-[11px] text-slate-500">
                Inserido no ID Token emitido e comparado para mitigar ataques de injeção de sessão.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: OIDC DISCOVERY INSPECTOR (.well-known)
      ===================================================================== */}
      {activeTab === 'oidc-discovery' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Documento de Descoberta (/.well-known/openid-configuration)
            </label>
            <textarea
              value={oidcInputJson}
              onChange={e => setOidcInputJson(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {parsedOidc.isValid && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Emissor Oficial:</span>
                <div className="text-sm font-bold text-white truncate mt-1">{parsedOidc.data.issuer || 'N/A'}</div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Suporte a PKCE S256:</span>
                <div className={`text-sm font-bold mt-1 ${parsedOidc.isPkceS256Supported ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {parsedOidc.isPkceS256Supported ? 'Sim (Em Conformidade)' : 'Não Detectado'}
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Chaves Públicas (JWKS):</span>
                <div className="text-xs font-bold text-cyan-400 truncate mt-1">{parsedOidc.data.jwks_uri || 'N/A'}</div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Algoritmos de Assinatura:</span>
                <div className="text-xs font-bold text-amber-400 truncate mt-1">
                  {parsedOidc.data.id_token_signing_alg_values_supported?.join(', ') || 'RS256'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
