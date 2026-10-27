'use client';

import { normalizeStr } from '@/lib/utils/stringUtils';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Network, 
  Fingerprint, 
  Globe, 
  CreditCard, 
  Clock, 
  Server, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  Info,
  Calendar,
  Layers,
  DollarSign
} from 'lucide-react';

export type NetworkIdentifiersTab = 'uuid-nanoid' | 'http-headers' | 'gateway-calc' | 'cron-tester' | 'dns-records';

export function NetworkAndIdentifiersSuite({ defaultTab = 'uuid-nanoid' }: { defaultTab?: NetworkIdentifiersTab }) {
  const [activeTab, setActiveTab] = useState<NetworkIdentifiersTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: GERADOR DE UUID V7, V4 & NANOID
  // ==========================================
  const [idType, setIdType] = useState<'uuid-v7' | 'uuid-v4' | 'nanoid'>('uuid-v7');
  const [nanoidLength, setNanoidLength] = useState<number>(21);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);

  // Implementação UUID v7 (RFC 9562: 48-bit timestamp + 74-bit random)
  const generateUuidV7 = (): string => {
    const now = Date.now();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // 48-bit timestamp
    bytes[0] = (now / 0x10000000000) & 0xff;
    bytes[1] = (now / 0x100000000) & 0xff;
    bytes[2] = (now / 0x1000000) & 0xff;
    bytes[3] = (now / 0x10000) & 0xff;
    bytes[4] = (now / 0x100) & 0xff;
    bytes[5] = now & 0xff;

    // Version 7: 0111
    bytes[6] = 0x70 | (bytes[6] & 0x0f);
    // Variant 1 (RFC 4122/9562): 10xx
    bytes[8] = 0x80 | (bytes[8] & 0x3f);

    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  // UUID v4 Padrão
  const generateUuidV4 = (): string => {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Versão 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variante
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  // Nanoid Criptográfico
  const generateNanoid = (len: number): string => {
    const alphabet = 'useandom-26T1983_40ST75fiLHAzGXqbKLnoprkMNOtuvwxyZ';
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    let id = '';
    for (let i = 0; i < len; i++) {
      id += alphabet[bytes[i] % alphabet.length];
    }
    return id;
  };

  const handleGenerateIds = () => {
    const list: string[] = [];
    for (let i = 0; i < batchCount; i++) {
      if (idType === 'uuid-v7') list.push(generateUuidV7());
      else if (idType === 'uuid-v4') list.push(generateUuidV4());
      else list.push(generateNanoid(nanoidLength));
    }
    setGeneratedIds(list);
  };

  useEffect(() => {
    handleGenerateIds();
  }, [idType, nanoidLength, batchCount]);

  // ==========================================
  // TAB 2: INSPETOR DE HEADERS HTTP & STATUS CODES
  // ==========================================
  const [statusCodeSearch, setStatusCodeSearch] = useState<string>('');

  const HTTP_STATUS_LIST = [
    { code: 200, name: 'OK', cat: '2xx Sucesso', desc: 'Requisição executada com sucesso. Resposta padrão para GET/POST.' },
    { code: 201, name: 'Created', cat: '2xx Sucesso', desc: 'Recurso criado com sucesso no servidor (comum após POST).' },
    { code: 204, name: 'No Content', cat: '2xx Sucesso', desc: 'Ação executada, mas o corpo da resposta está vazio (comum em DELETE).' },
    { code: 301, name: 'Moved Permanently', cat: '3xx Redirecionamento', desc: 'Redirecionamento permanente. O novo link deve ser cacheado pelo navegador/SEO.' },
    { code: 302, name: 'Found (Temporary)', cat: '3xx Redirecionamento', desc: 'Redirecionamento temporário para outra URI.' },
    { code: 304, name: 'Not Modified', cat: '3xx Redirecionamento', desc: 'O cliente pode usar a versão em cache local (ETag / If-Modified-Since).' },
    { code: 400, name: 'Bad Request', cat: '4xx Erro do Cliente', desc: 'Sintaxe inválida no payload JSON ou parâmetros ausentes.' },
    { code: 401, name: 'Unauthorized', cat: '4xx Erro do Cliente', desc: 'Autenticação necessária (Bearer Token ausente ou expirado).' },
    { code: 403, name: 'Forbidden', cat: '4xx Erro do Cliente', desc: 'O servidor entendeu a identidade, mas recusa conceder permissão de acesso.' },
    { code: 404, name: 'Not Found', cat: '4xx Erro do Cliente', desc: 'Recurso ou rota não encontrada no servidor.' },
    { code: 409, name: 'Conflict', cat: '4xx Erro do Cliente', desc: 'Conflito de estado (ex: tentativa de cadastrar usuário com e-mail já existente).' },
    { code: 422, name: 'Unprocessable Entity', cat: '4xx Erro do Cliente', desc: 'A sintaxe é válida, mas há erros de validação semântica nos campos.' },
    { code: 429, name: 'Too Many Requests', cat: '4xx Erro do Cliente', desc: 'Rate limit atingido. O cliente excedeu a cota de requisições por minuto.' },
    { code: 500, name: 'Internal Server Error', cat: '5xx Erro do Servidor', desc: 'Falha inesperada no código do servidor ou exceção não tratada.' },
    { code: 502, name: 'Bad Gateway', cat: '5xx Erro do Servidor', desc: 'O gateway reverso (Nginx/Cloudflare) recebeu resposta inválida do backend.' },
    { code: 503, name: 'Service Unavailable', cat: '5xx Erro do Servidor', desc: 'Servidor sobrecarregado ou temporariamente em manutenção programada.' },
    { code: 504, name: 'Gateway Timeout', cat: '5xx Erro do Servidor', desc: 'O servidor upstream demorou mais que o tempo limite configurado para responder.' }
  ];

  const filteredStatusCodes = HTTP_STATUS_LIST.filter(item => {
    const q = normalizeStr(statusCodeSearch);
    return !q || item.code.toString().includes(q) || normalizeStr(item.name).includes(q) || normalizeStr(item.desc).includes(q);
  });

  const SECURITY_HEADERS_SNIPPET = `# Headers de Segurança Recomendados (Nginx / Next.js)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';`;

  // ==========================================
  // TAB 3: CALCULADORA DE TAXAS DE GATEWAY DE PAGAMENTO
  // ==========================================
  const [saleAmount, setSaleAmount] = useState<number>(100.00);
  const [installments, setInstallments] = useState<number>(1);

  // Parâmetros de Gateways Brasil
  const GATEWAYS = [
    {
      name: 'Stripe Brasil',
      pixFee: { percent: 0.99, fixed: 0.00 },
      creditFee1x: { percent: 3.99, fixed: 0.39 },
      installmentPerMonth: 0.40, // spread parcelado
      color: 'text-indigo-400'
    },
    {
      name: 'Mercado Pago',
      pixFee: { percent: 0.99, fixed: 0.00 },
      creditFee1x: { percent: 4.98, fixed: 0.00 },
      installmentPerMonth: 0.50,
      color: 'text-sky-400'
    },
    {
      name: 'Pagar.me / Stone',
      pixFee: { percent: 0.85, fixed: 0.00 },
      creditFee1x: { percent: 3.49, fixed: 0.49 },
      installmentPerMonth: 0.35,
      color: 'text-emerald-400'
    }
  ];

  // ==========================================
  // TAB 4: DECODIFICADOR & TESTADOR CRON
  // ==========================================
  const [cronExpression, setCronExpression] = useState<string>('0 */2 * * *');

  const parseCronExpression = (cron: string): string => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      return 'Expressão Cron inválida. Deve conter exatamente 5 campos (minuto hora dia mês dia-da-semana).';
    }

    const [min, hour, dom, month, dow] = parts;

    // Casos especiais comuns
    if (cron === '0 */2 * * *') return 'A cada 2 horas em ponto, no minuto 0 (Padrão Hive Cron Job V5 Apollo).';
    if (cron === '*/5 * * * *') return 'A cada 5 minutos ininterruptamente.';
    if (cron === '0 0 * * *') return 'Todos os dias exatamente à meia-noite (00:00).';
    if (cron === '0 9 * * 1-5') return 'De segunda a sexta-feira às 09:00 da manhã.';
    if (cron === '0 0 1 * *') return 'No dia 1º de cada mês à meia-noite.';
    if (cron === '0 12 * * *') return 'Todos os dias ao meio-dia (12:00).';

    return `Minuto: [${min}] · Hora: [${hour}] · Dia do Mês: [${dom}] · Mês: [${month}] · Dia da Semana: [${dow}]`;
  };

  const cronExplanation = parseCronExpression(cronExpression);

  // ==========================================
  // TAB 5: SIMULADOR DE REGISTROS DNS
  // ==========================================
  const [domainName, setDomainName] = useState<string>('tools.v5apollo.com');
  const [serverIp, setServerIp] = useState<string>('142.250.190.46');

  const DNS_RECORDS_OUTPUT = `; Zona DNS Gerada para ${domainName}
; Formato BIND / Cloudflare Zone File

$ORIGIN ${domainName}.
$TTL 3600

; Registro A (Apontamento IPv4 Principal)
@               IN  A       ${serverIp}

; Subdomínio WWW CNAME
www             IN  CNAME   ${domainName}.

; Registros MX (Google Workspace)
@               IN  MX  1   aspmx.l.google.com.
@               IN  MX  5   alt1.aspmx.l.google.com.
@               IN  MX  5   alt2.aspmx.l.google.com.

; Registro TXT para Autenticação SPF
@               IN  TXT     "v=spf1 include:_spf.google.com ~all"

; Registro DMARC
_dmarc          IN  TXT     "v=DMARC1; p=quarantine; rua=mailto:dmarc@v5apollo.com"`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de Rede, Headers HTTP & Identificadores
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Client-Side · Etapa 27
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                UUID v7 Time-Ordered & Nanoid, Catálogo RFC 9110, Calculadora de Gateways, Cron Tester e Gerador de Zona DNS.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('uuid-nanoid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'uuid-nanoid'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>UUID v7 / Nanoid</span>
          </button>
          <button
            onClick={() => setActiveTab('http-headers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'http-headers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Headers & Status</span>
          </button>
          <button
            onClick={() => setActiveTab('gateway-calc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'gateway-calc'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Taxas Gateways</span>
          </button>
          <button
            onClick={() => setActiveTab('cron-tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'cron-tester'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Cron Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('dns-records')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'dns-records'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Zona DNS</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: GERADOR DE UUID V7, V4 & NANOID */}
        {/* ========================================== */}
        {activeTab === 'uuid-nanoid' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Configuração do Identificador
                  </div>

                  {/* Tipo de ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block">Algoritmo</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => setIdType('uuid-v7')}
                        className={`px-3 py-2 rounded-lg font-medium border text-center transition ${
                          idType === 'uuid-v7'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        UUID v7 (Time)
                      </button>
                      <button
                        onClick={() => setIdType('uuid-v4')}
                        className={`px-3 py-2 rounded-lg font-medium border text-center transition ${
                          idType === 'uuid-v4'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        UUID v4 (Random)
                      </button>
                      <button
                        onClick={() => setIdType('nanoid')}
                        className={`px-3 py-2 rounded-lg font-medium border text-center transition ${
                          idType === 'nanoid'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        Nanoid
                      </button>
                    </div>
                  </div>

                  {/* Comprimento Nanoid */}
                  {idType === 'nanoid' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Comprimento (Chars)</span>
                        <span className="font-mono text-cyan-400">{nanoidLength} caracteres</span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={48}
                        value={nanoidLength}
                        onChange={(e) => setNanoidLength(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Quantidade em Lote */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block">Quantidade em Lote</label>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[1, 5, 10, 20].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBatchCount(num)}
                          className={`py-1.5 rounded-lg font-mono border text-center transition ${
                            batchCount === num
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateIds}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Gerar Novos Identificadores
                  </button>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300">Por que usar UUID v7?</div>
                    <p>
                      O UUID v7 incorpora um timestamp Unix de 48 bits na primeira metade. Isso permite ordenação natural cronológica, acelerando inserções em bancos de dados (B-Tree) e evitando a fragmentação que ocorre com o UUID v4 aleatório.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de IDs Gerados */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-mono text-slate-400">
                    {generatedIds.length} IDs gerados ({idType.toUpperCase()})
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedIds.join('\n'), 'all-ids')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                  >
                    {copiedKey === 'all-ids' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Todos
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {generatedIds.map((id, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition"
                    >
                      <span className="font-mono text-xs text-cyan-300 select-all truncate mr-2">
                        {id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(id, `id-${idx}`)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                      >
                        {copiedKey === `id-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: INSPETOR DE HEADERS HTTP & STATUS CODES */}
        {/* ========================================== */}
        {activeTab === 'http-headers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Catálogo de Status Codes RFC 9110 */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Códigos de Status HTTP (RFC 9110)
                    </span>
                    <input
                      type="text"
                      placeholder="Filtrar por código ou nome..."
                      value={statusCodeSearch}
                      onChange={(e) => setStatusCodeSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono w-48 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredStatusCodes.map((st) => (
                      <div
                        key={st.code}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3"
                      >
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs shrink-0 ${
                          st.code < 300 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          st.code < 400 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          st.code < 500 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {st.code}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            <span>{st.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal font-mono">({st.cat})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Snippet de Headers de Segurança */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Security Headers Recomendados
                    </span>
                    <button
                      onClick={() => copyToClipboard(SECURITY_HEADERS_SNIPPET, 'sec-headers')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1"
                    >
                      {copiedKey === 'sec-headers' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  </div>

                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
                    {SECURITY_HEADERS_SNIPPET}
                  </pre>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Proteja sua aplicação contra Clickjacking, MIME-type sniffing e force HTTPS obrigatório no navegador do usuário.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: CALCULADORA DE GATEWAYS DE PAGAMENTO */}
        {/* ========================================== */}
        {activeTab === 'gateway-calc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Valor da Venda */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Simulação de Venda
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Valor Bruto da Venda (R$)</label>
                    <input
                      type="number"
                      step="5.00"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Número de Parcelas</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
                    >
                      <option value={1}>À Vista (1x)</option>
                      <option value={2}>Parcelado em 2x</option>
                      <option value={3}>Parcelado em 3x</option>
                      <option value={6}>Parcelado em 6x</option>
                      <option value={10}>Parcelado em 10x</option>
                      <option value={12}>Parcelado em 12x</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Comparativo de Gateways */}
              <div className="lg:col-span-8 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {GATEWAYS.map((gw) => {
                    // Cálculo Pix
                    const pixCost = (saleAmount * (gw.pixFee.percent / 100)) + gw.pixFee.fixed;
                    const pixNet = Math.max(0, saleAmount - pixCost);

                    // Cálculo Cartão
                    const rateTotal = gw.creditFee1x.percent + ((installments - 1) * gw.installmentPerMonth);
                    const cardCost = (saleAmount * (rateTotal / 100)) + gw.creditFee1x.fixed;
                    const cardNet = Math.max(0, saleAmount - cardCost);

                    return (
                      <div
                        key={gw.name}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className={`text-xs font-bold ${gw.color}`}>{gw.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{installments}x</span>
                        </div>

                        {/* Pix */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] text-slate-400 font-mono">Recebimento Pix</div>
                          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                            R$ {pixNet.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Taxa: -R$ {pixCost.toFixed(2)} ({gw.pixFee.percent}%)
                          </div>
                        </div>

                        {/* Cartão de Crédito */}
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] text-slate-400 font-mono">Cartão de Crédito ({installments}x)</div>
                          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                            R$ {cardNet.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Taxa: -R$ {cardCost.toFixed(2)} ({rateTotal.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: DECODIFICADOR & TESTADOR CRON */}
        {/* ========================================== */}
        {activeTab === 'cron-tester' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada Cron & Presets */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Expressão Cron (5 Campos Padrão)
                  </div>

                  <input
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    placeholder="* * * * *"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50"
                  />

                  {/* Presets Rápidos */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Presets Recomendados:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setCronExpression('0 */2 * * *')}
                        className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 transition text-left"
                      >
                        A cada 2 horas (Colmeia)
                      </button>
                      <button
                        onClick={() => setCronExpression('*/5 * * * *')}
                        className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition text-left"
                      >
                        A cada 5 minutos (Health)
                      </button>
                      <button
                        onClick={() => setCronExpression('0 0 * * *')}
                        className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition text-left"
                      >
                        Diário à meia-noite (00:00)
                      </button>
                      <button
                        onClick={() => setCronExpression('0 9 * * 1-5')}
                        className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition text-left"
                      >
                        Seg a Sex às 09:00
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explicação & Tradução */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Tradução em Linguagem Natural</span>
                    <div className="text-base font-bold text-slate-100 mt-1">
                      {cronExplanation}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px] pt-3 border-t border-slate-800">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      <div>Minuto</div>
                      <div className="text-slate-400 mt-0.5">0-59</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      <div>Hora</div>
                      <div className="text-slate-400 mt-0.5">0-23</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      <div>Dia Mês</div>
                      <div className="text-slate-400 mt-0.5">1-31</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      <div>Mês</div>
                      <div className="text-slate-400 mt-0.5">1-12</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      <div>Dia Sem</div>
                      <div className="text-slate-400 mt-0.5">0-6 (Dom)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: SIMULADOR DE REGISTROS DNS */}
        {/* ========================================== */}
        {activeTab === 'dns-records' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Parâmetros de Domínio */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Parâmetros de Zona DNS
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">Nome do Domínio</label>
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">IP do Servidor / VPS (IPv4)</label>
                    <input
                      type="text"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Zona BIND / Cloudflare Gerada */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-cyan-400" />
                      Arquivo de Zona BIND / Cloudflare
                    </span>
                    <button
                      onClick={() => copyToClipboard(DNS_RECORDS_OUTPUT, 'dns')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'dns' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Zona DNS
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                    {DNS_RECORDS_OUTPUT}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
