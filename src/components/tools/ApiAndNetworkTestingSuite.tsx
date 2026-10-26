'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Code2, 
  Key, 
  Send, 
  Server, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Lock,
  Globe,
  Sliders,
  Terminal,
  Activity
} from 'lucide-react';

interface ApiAndNetworkTestingSuiteProps {
  defaultTab?: 'curl-to-code' | 'http-auth' | 'query-params' | 'webhook-sim' | 'ports-catalog';
}

interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface PortInfo {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  service: string;
  category: 'Web' | 'Database' | 'Email' | 'Infra' | 'Dev';
  description: string;
  isEncrypted: boolean;
}

const PORTS_DATA: PortInfo[] = [
  { port: 20, protocol: 'TCP', service: 'FTP Data', category: 'Infra', description: 'Canal de transferência de dados do FTP', isEncrypted: false },
  { port: 21, protocol: 'TCP', service: 'FTP Control', category: 'Infra', description: 'Canal de comandos e controle do FTP', isEncrypted: false },
  { port: 22, protocol: 'TCP', service: 'SSH / SFTP', category: 'Infra', description: 'Acesso remoto seguro e túneis criptografados', isEncrypted: true },
  { port: 25, protocol: 'TCP', service: 'SMTP', category: 'Email', description: 'Transferência de correio eletrônico entre servidores', isEncrypted: false },
  { port: 53, protocol: 'TCP/UDP', service: 'DNS', category: 'Infra', description: 'Resolução de nomes de domínio da Internet', isEncrypted: false },
  { port: 80, protocol: 'TCP', service: 'HTTP', category: 'Web', description: 'Protocolo de hipertexto não criptografado', isEncrypted: false },
  { port: 110, protocol: 'TCP', service: 'POP3', category: 'Email', description: 'Download de mensagens de caixas postais', isEncrypted: false },
  { port: 143, protocol: 'TCP', service: 'IMAP', category: 'Email', description: 'Sincronização de pastas e e-mails no servidor', isEncrypted: false },
  { port: 443, protocol: 'TCP', service: 'HTTPS', category: 'Web', description: 'Navegação web criptografada com TLS/SSL', isEncrypted: true },
  { port: 465, protocol: 'TCP', service: 'SMTPS', category: 'Email', description: 'Envio seguro de e-mails com criptografia implícita', isEncrypted: true },
  { port: 587, protocol: 'TCP', service: 'SMTP Submission', category: 'Email', description: 'Submissão de e-mails de clientes com STARTTLS', isEncrypted: true },
  { port: 993, protocol: 'TCP', service: 'IMAPS', category: 'Email', description: 'IMAP sobre túnel TLS/SSL criptografado', isEncrypted: true },
  { port: 995, protocol: 'TCP', service: 'POP3S', category: 'Email', description: 'POP3 sobre túnel TLS/SSL criptografado', isEncrypted: true },
  { port: 3000, protocol: 'TCP', service: 'Node.js / Dev', category: 'Dev', description: 'Porta padrão de servidores de dev React/Next.js', isEncrypted: false },
  { port: 3009, protocol: 'TCP', service: 'V5 Apollo Tools', category: 'Dev', description: 'Porta local soberana da Capitania #11 Apollo', isEncrypted: false },
  { port: 3306, protocol: 'TCP', service: 'MySQL / MariaDB', category: 'Database', description: 'Banco de dados relacional líder de mercado', isEncrypted: false },
  { port: 5432, protocol: 'TCP', service: 'PostgreSQL', category: 'Database', description: 'Banco de dados objeto-relacional enterprise', isEncrypted: true },
  { port: 6379, protocol: 'TCP', service: 'Redis', category: 'Database', description: 'Cache em memória chave-valor de altíssima velocidade', isEncrypted: false },
  { port: 8080, protocol: 'TCP', service: 'HTTP-Alt / Proxy', category: 'Web', description: 'Porta alternativa para web servers e proxies reversos', isEncrypted: false },
  { port: 8188, protocol: 'TCP', service: 'ComfyUI Server', category: 'Dev', description: 'Servidor local do ComfyUI para workflows generativos', isEncrypted: false },
  { port: 27017, protocol: 'TCP', service: 'MongoDB', category: 'Database', description: 'Banco de dados NoSQL orientado a documentos JSON', isEncrypted: false },
];

export function ApiAndNetworkTestingSuite({ defaultTab = 'curl-to-code' }: ApiAndNetworkTestingSuiteProps) {
  const [activeTab, setActiveTab] = useState<'curl-to-code' | 'http-auth' | 'query-params' | 'webhook-sim' | 'ports-catalog'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // =========================================================================
  // ABA 1: CONVERSOR cURL PARA CÓDIGO
  // =========================================================================
  const [curlInput, setCurlInput] = useState<string>(
    `curl -X POST https://api.v5apollo.com/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer v5_live_sk982734" \\
  -d '{"prompt": "Saturn IB Rocket Apollo 5", "steps": 30, "cfg": 7.5}'`
  );
  const [targetLang, setTargetLang] = useState<'fetch' | 'axios' | 'python' | 'go' | 'php'>('fetch');

  // Parser simplificado de cURL
  const parseCurl = (cmd: string) => {
    const cleanCmd = cmd.replace(/\\\n/g, ' ').replace(/\n/g, ' ').trim();

    // URL
    const urlMatch = cleanCmd.match(/curl\s+(?:-[A-Za-z]\s+[^\s]+\s+)*(?:'|")?(https?:\/\/[^\s'"]+)(?:'|")?/);
    const url = urlMatch ? urlMatch[1] : 'https://api.v5apollo.com/v1/endpoint';

    // Método
    const methodMatch = cleanCmd.match(/-X\s+([A-Z]+)/i);
    const hasData = cleanCmd.includes('-d ') || cleanCmd.includes('--data');
    const method = methodMatch ? methodMatch[1].toUpperCase() : (hasData ? 'POST' : 'GET');

    // Headers
    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+["']([^"']+)["']/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(cleanCmd)) !== null) {
      const parts = hMatch[1].split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }

    // Body
    const dataMatch = cleanCmd.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s+-|$)/);
    const data = dataMatch ? dataMatch[1] : (cleanCmd.match(/(?:-d|--data)\s+([^{][^\s]+)/)?.[1] || null);

    return { url, method, headers, data };
  };

  const parsedCurl = parseCurl(curlInput);

  const generateClientCode = () => {
    const { url, method, headers, data } = parsedCurl;
    const headerLines = Object.entries(headers).map(([k, v]) => `    '${k}': '${v}',`).join('\n');

    if (targetLang === 'fetch') {
      return `// JavaScript / TypeScript Fetch API
const response = await fetch('${url}', {
  method: '${method}',
  headers: {
${headerLines}
  },${data ? `\n  body: JSON.stringify(${data}),` : ''}
});

const data = await response.json();
console.log(data);`;
    }

    if (targetLang === 'axios') {
      return `// JavaScript / TypeScript Axios
import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: {
${headerLines}
  },${data ? `\n  data: ${data},` : ''}
});

console.log(response.data);`;
    }

    if (targetLang === 'python') {
      const pyHeaders = Object.entries(headers).map(([k, v]) => `    "${k}": "${v}",`).join('\n');
      return `# Python Requests
import requests

url = "${url}"
headers = {
${pyHeaders}
}
${data ? `payload = ${data}\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;
    }

    if (targetLang === 'go') {
      return `// Go (net/http)
package main

import (
    "fmt"
    "net/http"
    "io"${data ? '\n    "strings"' : ''}
)

func main() {
    url := "${url}"${data ? `\n    payload := strings.NewReader(\`${data}\`)` : ''}
    req, _ := http.NewRequest("${method}", url, ${data ? 'payload' : 'nil'})
${Object.entries(headers).map(([k, v]) => `    req.Header.Add("${k}", "${v}")`).join('\n')}

    res, _ := http.DefaultClient.Do(req)
    defer res.Body.Close()
    body, _ := io.ReadAll(res.Body)
    fmt.Println(string(body))
}`;
    }

    // PHP
    return `<?php
// PHP cURL
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${method}",${data ? `\n  CURLOPT_POSTFIELDS => '${data}',` : ''}
  CURLOPT_HTTPHEADER => [
${Object.entries(headers).map(([k, v]) => `    "${k}: ${v}",`).join('\n')}
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
  };

  // =========================================================================
  // ABA 2: GERADOR DE AUTENTICAÇÃO HTTP
  // =========================================================================
  const [authType, setAuthType] = useState<'bearer' | 'basic' | 'apikey'>('bearer');
  const [basicUser, setBasicUser] = useState('admin_apollo');
  const [basicPass, setBasicPass] = useState('V5Pass#2026!');
  const [bearerToken, setBearerToken] = useState('v5_live_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tK1');
  const [apiKeyHeaderName, setApiKeyHeaderName] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('v5_sec_99a8b7c6d5e4f3');

  const getBasicAuthBase64 = () => {
    try {
      return btoa(`${basicUser}:${basicPass}`);
    } catch {
      return '';
    }
  };

  const getAuthHeaderString = () => {
    if (authType === 'basic') return `Authorization: Basic ${getBasicAuthBase64()}`;
    if (authType === 'bearer') return `Authorization: Bearer ${bearerToken}`;
    return `${apiKeyHeaderName}: ${apiKeyValue}`;
  };

  // =========================================================================
  // ABA 3: INSPETOR E CONSTRUTOR DE QUERY PARAMS
  // =========================================================================
  const [fullUrlInput, setFullUrlInput] = useState('https://tools.v5apollo.com/search?category=dev-4devs&page=1&tags=cpf%2Ccnpj&sort=popular');
  const [queryParams, setQueryParams] = useState<QueryParamItem[]>([
    { id: '1', key: 'category', value: 'dev-4devs', enabled: true },
    { id: '2', key: 'page', value: '1', enabled: true },
    { id: '3', key: 'tags', value: 'cpf,cnpj', enabled: true },
    { id: '4', key: 'sort', value: 'popular', enabled: true },
  ]);

  const baseUrl = fullUrlInput.split('?')[0] || 'https://tools.v5apollo.com/search';

  const addQueryParam = () => {
    setQueryParams(prev => [
      ...prev,
      { id: Date.now().toString(), key: '', value: '', enabled: true }
    ]);
  };

  const removeQueryParam = (id: string) => {
    setQueryParams(prev => prev.filter(p => p.id !== id));
  };

  const updateQueryParam = (id: string, field: keyof QueryParamItem, val: any) => {
    setQueryParams(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const getGeneratedQueryString = () => {
    const activeParams = queryParams.filter(p => p.enabled && p.key.trim().length > 0);
    if (activeParams.length === 0) return '';
    return '?' + activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  };

  const getGeneratedFullUrl = () => {
    return `${baseUrl}${getGeneratedQueryString()}`;
  };

  // =========================================================================
  // ABA 4: SIMULADOR DE WEBHOOKS & ASSINATURA HMAC
  // =========================================================================
  const [webhookProvider, setWebhookProvider] = useState<'stripe' | 'github' | 'mercadopago'>('stripe');
  const [webhookSecret, setWebhookSecret] = useState('whsec_v5apollo_secret_key_8899');
  const [webhookPayload, setWebhookPayload] = useState<string>(
    JSON.stringify({
      id: "evt_3MvY8kLkdIwHu7ix0ABCDE",
      object: "event",
      type: "payment_intent.succeeded",
      created: 1729890000,
      data: {
        object: {
          id: "pi_3MvY8kLkdIwHu7ix0FGH",
          amount: 14990,
          currency: "brl",
          status: "succeeded"
        }
      }
    }, null, 2)
  );

  const [generatedHmacSignature, setGeneratedHmacSignature] = useState<string>('Calculando...');

  useEffect(() => {
    const computeHmac = async () => {
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(webhookSecret);
        const msgData = encoder.encode(webhookPayload);

        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (webhookProvider === 'stripe') {
          const timestamp = Math.floor(Date.now() / 1000);
          setGeneratedHmacSignature(`t=${timestamp},v1=${hexHash}`);
        } else if (webhookProvider === 'github') {
          setGeneratedHmacSignature(`sha256=${hexHash}`);
        } else {
          setGeneratedHmacSignature(hexHash);
        }
      } catch (e) {
        setGeneratedHmacSignature('Erro ao gerar assinatura HMAC');
      }
    };

    computeHmac();
  }, [webhookPayload, webhookSecret, webhookProvider]);

  // =========================================================================
  // ABA 5: CATÁLOGO DE PORTAS TCP/UDP
  // =========================================================================
  const [portSearch, setPortSearch] = useState('');
  const [portCategoryFilter, setPortCategoryFilter] = useState<'All' | 'Web' | 'Database' | 'Email' | 'Infra' | 'Dev'>('All');

  const filteredPorts = PORTS_DATA.filter(p => {
    const matchesSearch = p.port.toString().includes(portSearch) || 
      p.service.toLowerCase().includes(portSearch.toLowerCase()) || 
      p.description.toLowerCase().includes(portSearch.toLowerCase());
    const matchesCategory = portCategoryFilter === 'All' || p.category === portCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Network className="w-4 h-4" />
            <span>Capitania #11 · Suíte de APIs REST, Webhooks & Rede HTTP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            APIs REST, Webhooks & Ferramentas de Rede
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              100% Client-Side
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conversor cURL para Fetch/Axios/Python/Go/PHP, gerador de autenticação HTTP Basic/Bearer, construtor de Query Strings, simulador de assinaturas HMAC de Webhooks e catálogo de portas.
          </p>
        </div>

        {/* Status / Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>RFC 7230 · RFC 7617</span>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('curl-to-code')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'curl-to-code'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>cURL para Código</span>
        </button>

        <button
          onClick={() => setActiveTab('http-auth')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'http-auth'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Autenticação HTTP (Basic/Bearer)</span>
        </button>

        <button
          onClick={() => setActiveTab('query-params')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'query-params'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Query String & Params</span>
        </button>

        <button
          onClick={() => setActiveTab('webhook-sim')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'webhook-sim'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Webhooks & Assinatura HMAC</span>
        </button>

        <button
          onClick={() => setActiveTab('ports-catalog')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ports-catalog'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Catálogo de Portas TCP/UDP</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pt-6">
        {/* =================================================================== */}
        {/* ABA 1: cURL PARA CÓDIGO */}
        {/* =================================================================== */}
        {activeTab === 'curl-to-code' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input cURL */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Cole o Comando cURL:
                </span>

                <textarea
                  rows={8}
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />

                {/* Seleção de Linguagem */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Converter Para:</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      onClick={() => setTargetLang('fetch')}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center border ${
                        targetLang === 'fetch' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Fetch
                    </button>
                    <button
                      onClick={() => setTargetLang('axios')}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center border ${
                        targetLang === 'axios' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Axios
                    </button>
                    <button
                      onClick={() => setTargetLang('python')}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center border ${
                        targetLang === 'python' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setTargetLang('go')}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center border ${
                        targetLang === 'go' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Go
                    </button>
                    <button
                      onClick={() => setTargetLang('php')}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center border ${
                        targetLang === 'php' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      PHP
                    </button>
                  </div>
                </div>
              </div>

              {/* Código Gerado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Código Cliente HTTP ({targetLang.toUpperCase()}):</span>
                  <button
                    onClick={() => copyToClipboard(generateClientCode(), 'client-code')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                  >
                    {copiedId === 'client-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'client-code' ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all min-h-[220px]">
                  {generateClientCode()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: AUTENTICAÇÃO HTTP (BASIC/BEARER) */}
        {/* =================================================================== */}
        {activeTab === 'http-auth' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Padrão de Autenticação:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAuthType('bearer')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                      authType === 'bearer' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Bearer Token
                  </button>
                  <button
                    onClick={() => setAuthType('basic')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                      authType === 'basic' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Basic Auth
                  </button>
                  <button
                    onClick={() => setAuthType('apikey')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                      authType === 'apikey' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    API Key Header
                  </button>
                </div>

                {authType === 'basic' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Usuário:</label>
                      <input
                        type="text"
                        value={basicUser}
                        onChange={(e) => setBasicUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Senha:</label>
                      <input
                        type="text"
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                )}

                {authType === 'bearer' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Token JWT / Bearer:</label>
                    <textarea
                      rows={3}
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                )}

                {authType === 'apikey' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Cabeçalho:</label>
                      <input
                        type="text"
                        value={apiKeyHeaderName}
                        onChange={(e) => setApiKeyHeaderName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Valor da Chave:</label>
                      <input
                        type="text"
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Header Gerado */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Cabeçalho HTTP Formatado:</span>
                    <button
                      onClick={() => copyToClipboard(getAuthHeaderString(), 'auth-header')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                    >
                      {copiedId === 'auth-header' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'auth-header' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 break-all select-all leading-relaxed">
                    {getAuthHeaderString()}
                  </div>

                  {authType === 'basic' && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                      String codificada: <code className="text-slate-300">base64("{basicUser}:{basicPass}")</code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: QUERY STRING & PARAMS */}
        {/* =================================================================== */}
        {activeTab === 'query-params' && (
          <div className="space-y-6">
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Parâmetros de URL (SearchParams):
                </span>
                <button
                  onClick={addQueryParam}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Parâmetro</span>
                </button>
              </div>

              {/* Tabela de Parâmetros */}
              <div className="space-y-2">
                {queryParams.map((param) => (
                  <div key={param.id} className="grid grid-cols-12 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => updateQueryParam(param.id, 'enabled', e.target.checked)}
                        className="rounded bg-slate-950 text-cyan-500 cursor-pointer"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                        placeholder="Chave (key)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}
                        placeholder="Valor (value)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeQueryParam(param.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* URL Completa Gerada */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">URL Serializada (RFC 3986):</span>
                <button
                  onClick={() => copyToClipboard(getGeneratedFullUrl(), 'full-url')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                >
                  {copiedId === 'full-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'full-url' ? 'Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 break-all select-all">
                {getGeneratedFullUrl()}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: SIMULADOR DE WEBHOOKS & ASSINATURA HMAC */}
        {/* =================================================================== */}
        {activeTab === 'webhook-sim' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Provedor & Chave Secreta:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setWebhookProvider('stripe')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                      webhookProvider === 'stripe' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Stripe
                  </button>
                  <button
                    onClick={() => setWebhookProvider('github')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                      webhookProvider === 'github' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    GitHub
                  </button>
                  <button
                    onClick={() => setWebhookProvider('mercadopago')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                      webhookProvider === 'mercadopago' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Mercado Pago
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Webhook Secret (Chave HMAC):</label>
                  <input
                    type="text"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Payload JSON (Raw Body):</label>
                  <textarea
                    rows={6}
                    value={webhookPayload}
                    onChange={(e) => setWebhookPayload(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Assinatura Gerada */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Assinatura HMAC-SHA256 Oficial:</span>
                    <button
                      onClick={() => copyToClipboard(generatedHmacSignature, 'webhook-sig')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                    >
                      {copiedId === 'webhook-sig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'webhook-sig' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all leading-relaxed">
                    {generatedHmacSignature}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <span className="text-slate-300 font-bold block">Cabeçalho de Validação:</span>
                    {webhookProvider === 'stripe' && <code>Stripe-Signature: {generatedHmacSignature}</code>}
                    {webhookProvider === 'github' && <code>X-Hub-Signature-256: {generatedHmacSignature}</code>}
                    {webhookProvider === 'mercadopago' && <code>x-signature: ts=...,v1={generatedHmacSignature}</code>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: CATÁLOGO DE PORTAS TCP/UDP */}
        {/* =================================================================== */}
        {activeTab === 'ports-catalog' && (
          <div className="space-y-4">
            {/* Barra de Filtros */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por porta ou serviço (ex: 3009, SSH)..."
                  value={portSearch}
                  onChange={(e) => setPortSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full no-scrollbar">
                {(['All', 'Web', 'Database', 'Email', 'Infra', 'Dev'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap border ${
                      portCategoryFilter === cat ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabela de Portas */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPorts.map((p) => (
                <div key={p.port} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-center py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono font-black text-cyan-400">
                      {p.port}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{p.service}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {p.protocol}
                        </span>
                        {p.isEncrypted && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                            TLS/Cripto
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.description}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                    {p.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
