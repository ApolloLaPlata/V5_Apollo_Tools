'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileCode, 
  Database, 
  Globe, 
  Layers, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Download, 
  RefreshCw, 
  Share2, 
  Sliders, 
  Terminal, 
  Server,
  Zap,
  ExternalLink,
  Tag
} from 'lucide-react';

interface ApiDocsOpenApiMockSuiteProps {
  defaultTab?: 'openapi-viewer' | 'json-mock' | 'status-matrix' | 'graphql-linter' | 'protobuf-inspector';
}

const DEFAULT_OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "V5 Apollo Tools & Compute Fleet API",
    version: "2.4.0",
    description: "API soberana para despacho de workflows ComfyUI em Modal H100, telemetria de proxies e microserviços."
  },
  servers: [
    { url: "https://api.v5apollo.com/v1", description: "Produção Soberana V5" },
    { url: "http://localhost:3009/api", description: "Ambiente Local de Testes" }
  ],
  paths: {
    "/workflows/dispatch": {
      post: {
        summary: "Despacha um workflow ComfyUI na frota Modal GPU",
        tags: ["Workflows"],
        parameters: [
          { name: "x-api-key", in: "header", required: true, schema: { type: "string" }, description: "Chave de autenticação" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  workflowId: { type: "string", example: "flux-2-dev-upscale" },
                  prompt: { type: "string", example: "Cyberpunk astronaut in neon matrix" },
                  steps: { type: "integer", default: 28 },
                  cfg: { type: "number", default: 3.5 }
                },
                required: ["workflowId", "prompt"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Workflow enfileirado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobId: { type: "string" },
                    status: { type: "string", example: "processing" },
                    etaSeconds: { type: "integer", example: 4 }
                  }
                }
              }
            }
          },
          "401": { description: "Credenciais de API inválidas ou ausentes" },
          "429": { description: "Limite de taxa (Rate Limit) excedido" }
        }
      }
    },
    "/tools/catalog": {
      get: {
        summary: "Retorna a lista completa de ferramentas ativas da holding",
        tags: ["Catalogo"],
        parameters: [
          { name: "category", in: "query", required: false, schema: { type: "string" }, description: "Filtro por categoria" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50 }, description: "Limite de itens" }
        ],
        responses: {
          "200": {
            description: "Lista de ferramentas recuperada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total: { type: "integer", example: 275 },
                    items: { type: "array", items: { type: "object" } }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const HTTP_STATUS_LIST = [
  { code: 100, name: "Continue", cat: "1xx", idemp: true, safe: true, cache: false, desc: "O servidor recebeu os cabeçalhos da requisição e o cliente pode continuar enviando o corpo." },
  { code: 101, name: "Switching Protocols", cat: "1xx", idemp: false, safe: false, cache: false, desc: "O solicitante pediu a troca de protocolo e o servidor aceitou (ex: Upgrade para WebSocket)." },
  { code: 200, name: "OK", cat: "2xx", idemp: true, safe: true, cache: true, desc: "A requisição foi bem-sucedida. O resultado varia com o método HTTP (GET retorna entidade, POST retorna ação)." },
  { code: 201, name: "Created", cat: "2xx", idemp: false, safe: false, cache: true, desc: "Um novo recurso foi criado com sucesso. O cabeçalho Location geralmente aponta para o novo URI." },
  { code: 204, name: "No Content", cat: "2xx", idemp: true, safe: false, cache: true, desc: "Ação executada com sucesso, mas não há corpo na resposta (ex: exclusão bem-sucedida via DELETE)." },
  { code: 301, name: "Moved Permanently", cat: "3xx", idemp: true, safe: true, cache: true, desc: "O recurso foi movido definitivamente para o URI indicado no cabeçalho Location. Navegadores guardam em cache." },
  { code: 302, name: "Found (Temporary Redirect)", cat: "3xx", idemp: false, safe: false, cache: false, desc: "Redirecionamento temporário. Clientes antigos podiam trocar POST para GET incorretamente." },
  { code: 304, name: "Not Modified", cat: "3xx", idemp: true, safe: true, cache: true, desc: "O recurso não sofreu alterações desde a última consulta (validado via If-None-Match ETag ou If-Modified-Since)." },
  { code: 307, name: "Temporary Redirect", cat: "3xx", idemp: false, safe: false, cache: false, desc: "Redirecionamento temporário estrito da RFC 7231: o método original (ex: POST) DEVE ser preservado." },
  { code: 308, name: "Permanent Redirect", cat: "3xx", idemp: true, safe: true, cache: true, desc: "Redirecionamento permanente estrito da RFC 7538: método e corpo originais NÃO podem ser alterados." },
  { code: 400, name: "Bad Request", cat: "4xx", idemp: false, safe: false, cache: false, desc: "Sintaxe da requisição malformada, enquadramento inválido ou roteamento de requisição enganosa." },
  { code: 401, name: "Unauthorized", cat: "4xx", idemp: false, safe: false, cache: false, desc: "Autenticação necessária. O cabeçalho WWW-Authenticate deve indicar o esquema exigido (Bearer, Basic)." },
  { code: 403, name: "Forbidden", cat: "4xx", idemp: false, safe: false, cache: false, desc: "O servidor compreendeu a requisição, mas se recusa a autorizá-la (o usuário está autenticado, mas não tem permissão)." },
  { code: 404, name: "Not Found", cat: "4xx", idemp: true, safe: true, cache: true, desc: "O servidor de origem não encontrou uma representação atual para o recurso solicitado." },
  { code: 405, name: "Method Not Allowed", cat: "4xx", idemp: true, safe: true, cache: false, desc: "O método de requisição não é suportado para o recurso. O cabeçalho Allow lista os métodos válidos." },
  { code: 409, name: "Conflict", cat: "4xx", idemp: false, safe: false, cache: false, desc: "A requisição não pôde ser concluída devido a um conflito com o estado atual do recurso (ex: e-mail duplicado)." },
  { code: 422, name: "Unprocessable Entity", cat: "4xx", idemp: false, safe: false, cache: false, desc: "Sintaxe correta, mas instruções semânticas inválidas (ex: falha de validação em campos de formulário)." },
  { code: 429, name: "Too Many Requests", cat: "4xx", idemp: false, safe: false, cache: false, desc: "O cliente atingiu o limite de taxa (Rate Limit). O cabeçalho Retry-After pode indicar quando tentar novamente." },
  { code: 500, name: "Internal Server Error", cat: "5xx", idemp: false, safe: false, cache: false, desc: "O servidor encontrou uma condição inesperada que o impediu de atender à solicitação." },
  { code: 502, name: "Bad Gateway", cat: "5xx", idemp: false, safe: false, cache: false, desc: "O servidor, agindo como gateway ou proxy, recebeu uma resposta inválida do servidor upstream." },
  { code: 503, name: "Service Unavailable", cat: "5xx", idemp: false, safe: false, cache: false, desc: "Servidor temporariamente incapaz de atender devido a sobrecarga ou manutenção programada." },
  { code: 504, name: "Gateway Timeout", cat: "5xx", idemp: false, safe: false, cache: false, desc: "O servidor proxy não recebeu uma resposta em tempo hábil do servidor upstream necessário." }
];

export const ApiDocsOpenApiMockSuite: React.FC<ApiDocsOpenApiMockSuiteProps> = ({ defaultTab = 'openapi-viewer' }) => {
  const [activeTab, setActiveTab] = useState<'openapi-viewer' | 'json-mock' | 'status-matrix' | 'graphql-linter' | 'protobuf-inspector'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: VISUALIZADOR OPENAPI / SWAGGER
  // ==========================================
  const [openApiInput, setOpenApiInput] = useState<string>(JSON.stringify(DEFAULT_OPENAPI_SPEC, null, 2));
  const [selectedEndpointMethod, setSelectedEndpointMethod] = useState<string | null>(null);

  const parsedOpenApi = useMemo(() => {
    try {
      const parsed = JSON.parse(openApiInput);
      const paths: Array<{
        path: string;
        method: string;
        summary: string;
        tags: string[];
        parameters: any[];
        requestBody?: any;
        responses: any;
      }> = [];

      if (parsed.paths) {
        Object.keys(parsed.paths).forEach(p => {
          const methods = parsed.paths[p];
          Object.keys(methods).forEach(m => {
            if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(m.toLowerCase())) {
              const op = methods[m];
              paths.push({
                path: p,
                method: m.toUpperCase(),
                summary: op.summary || 'Sem descrição',
                tags: op.tags || ['Geral'],
                parameters: op.parameters || [],
                requestBody: op.requestBody,
                responses: op.responses || {}
              });
            }
          });
        });
      }

      return {
        isValid: true,
        title: parsed.info?.title || 'API sem título',
        version: parsed.info?.version || '1.0.0',
        description: parsed.info?.description || '',
        servers: parsed.servers || [],
        paths
      };
    } catch (e: any) {
      return {
        isValid: false,
        error: e.message,
        title: '',
        version: '',
        description: '',
        servers: [],
        paths: []
      };
    }
  }, [openApiInput]);

  // ==========================================
  // FERRAMENTA 2: GERADOR DE DADOS JSON MOCK
  // ==========================================
  const [mockCount, setMockCount] = useState<number>(5);
  const [includeCpf, setIncludeCpf] = useState<boolean>(true);
  const [includeEmail, setIncludeEmail] = useState<boolean>(true);
  const [includePhone, setIncludePhone] = useState<boolean>(true);
  const [includeAddress, setIncludeAddress] = useState<boolean>(true);
  const [includeFinance, setIncludeFinance] = useState<boolean>(true);
  const [mockSeed, setMockSeed] = useState<number>(1);

  const generatedMockData = useMemo(() => {
    const firstNames = ['Carlos', 'Mariana', 'Vinicius', 'Beatriz', 'Lucas', 'Fernanda', 'Rodrigo', 'Juliana', 'Gabriel', 'Camila', 'Thiago', 'Larissa'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro'];
    const cities = [
      { city: 'São Paulo', uf: 'SP', ddd: '11' },
      { city: 'Rio de Janeiro', uf: 'RJ', ddd: '21' },
      { city: 'Belo Horizonte', uf: 'MG', ddd: '31' },
      { city: 'Curitiba', uf: 'PR', ddd: '41' },
      { city: 'Porto Alegre', uf: 'RS', ddd: '51' },
      { city: 'Salvador', uf: 'BA', ddd: '71' }
    ];

    const generateCpf = (idx: number) => {
      const base = 100000000 + (idx * 314159) % 899999999;
      const s = base.toString().padStart(9, '0');
      return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${(idx % 89 + 10)}`;
    };

    const items = [];
    for (let i = 0; i < mockCount; i++) {
      const fn = firstNames[(i + mockSeed) % firstNames.length];
      const ln = lastNames[(i * 3 + mockSeed) % lastNames.length];
      const loc = cities[(i + mockSeed) % cities.length];
      const name = `${fn} ${ln}`;
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@v5holding.com.br`;

      const obj: any = {
        id: `usr_${(1000 + i + mockSeed * 10).toString(16)}`,
        name,
        role: i === 0 ? 'admin' : (i % 3 === 0 ? 'manager' : 'customer'),
        active: i % 4 !== 0
      };

      if (includeEmail) obj.email = email;
      if (includeCpf) obj.cpf = generateCpf(i + mockSeed);
      if (includePhone) obj.phone = `+55 (${loc.ddd}) 9${8000 + (i * 123) % 1999}-${1000 + (i * 321) % 8999}`;
      if (includeAddress) {
        obj.address = {
          street: `Avenida Paulista, ${100 + i * 25}`,
          city: loc.city,
          state: loc.uf,
          zipCode: `${1000 + (i * 50) % 8000}-000`
        };
      }
      if (includeFinance) {
        const balance = (1500 + (i * 876.54) % 15000).toFixed(2);
        obj.wallet = {
          balanceBRL: parseFloat(balance),
          currency: 'BRL',
          tier: i % 2 === 0 ? 'PRO_ANNUAL' : 'ENTERPRISE'
        };
      }
      obj.createdAt = new Date(Date.now() - i * 86400000 * 3).toISOString();

      items.push(obj);
    }

    const jsonStr = JSON.stringify(items, null, 2);

    // Converte para CSV plano simples
    const flatCsv = () => {
      if (items.length === 0) return '';
      const headers = ['id', 'name', 'role', 'active'];
      if (includeEmail) headers.push('email');
      if (includeCpf) headers.push('cpf');
      if (includePhone) headers.push('phone');
      
      const rows = items.map(it => {
        return headers.map(h => `"${it[h] || ''}"`).join(',');
      });
      return [headers.join(','), ...rows].join('\n');
    };

    return {
      items,
      jsonStr,
      csvStr: flatCsv()
    };
  }, [mockCount, includeCpf, includeEmail, includePhone, includeAddress, includeFinance, mockSeed]);

  // ==========================================
  // FERRAMENTA 3: MATRIZ DE STATUS CODES HTTP RFC 9110
  // ==========================================
  const [statusFilterCat, setStatusFilterCat] = useState<'all' | '1xx' | '2xx' | '3xx' | '4xx' | '5xx'>('all');
  const [statusSearch, setStatusSearch] = useState<string>('');

  const filteredStatuses = useMemo(() => {
    return HTTP_STATUS_LIST.filter(s => {
      if (statusFilterCat !== 'all' && s.cat !== statusFilterCat) return false;
      if (!statusSearch.trim()) return true;
      const q = statusSearch.toLowerCase();
      return (
        s.code.toString().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q)
      );
    });
  }, [statusFilterCat, statusSearch]);

  // ==========================================
  // FERRAMENTA 4: FORMATADOR & LINTER GRAPHQL
  // ==========================================
  const [graphqlInput, setGraphqlInput] = useState<string>(`query GetApolloFleetStats($fleetId: ID!, $includeNodes: Boolean = true) {
apolloFleet(id: $fleetId) {
id
totalGpus
modalH100Instances {
nodeId
status
temperatureCelsius
vramUsageGb
activeWorkflow
}
lastHeartbeat
}
}`);

  const formattedGraphql = useMemo(() => {
    let raw = graphqlInput.trim();
    if (!raw) return { formatted: '', minified: '', isValid: true, error: null };

    // Verificação de balanceamento de chaves
    let openBraces = 0;
    let openParens = 0;
    for (const char of raw) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '(') openParens++;
      if (char === ')') openParens--;
    }

    if (openBraces !== 0) {
      return {
        formatted: raw,
        minified: '',
        isValid: false,
        error: `Chaves desbalanceadas: ${openBraces > 0 ? `${openBraces} chave(s) aberta(s) sem fechamento` : `${Math.abs(openBraces)} chave(s) fechada(s) a mais`}.`
      };
    }
    if (openParens !== 0) {
      return {
        formatted: raw,
        minified: '',
        isValid: false,
        error: `Parênteses desbalanceados: ${openParens > 0 ? `${openParens} aberto(s)` : `${Math.abs(openParens)} fechado(s)`}.`
      };
    }

    // Formatador básico de indentação 2 espaços
    const lines = raw.split('\n');
    let indentLevel = 0;
    const formattedLines: string[] = [];

    lines.forEach(l => {
      const clean = l.trim();
      if (!clean) return;

      if (clean.startsWith('}') || clean.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      formattedLines.push('  '.repeat(indentLevel) + clean);

      if (clean.endsWith('{') || (clean.endsWith('(') && !clean.includes(')'))) {
        indentLevel++;
      }
    });

    const formatted = formattedLines.join('\n');
    // Minificação (remove quebras e espaços desnecessários)
    const minified = raw
      .replace(/#.*$/gm, '') // remove comentários
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}():,=])\s*/g, '$1')
      .trim();

    return {
      formatted,
      minified,
      isValid: true,
      error: null
    };
  }, [graphqlInput]);

  // ==========================================
  // FERRAMENTA 5: INSPETOR PROTOBUF PROTO3 -> TYPESCRIPT
  // ==========================================
  const [protoInput, setProtoInput] = useState<string>(`syntax = "proto3";

package v5.apollo.compute;

enum NodeState {
  STATE_UNKNOWN = 0;
  STATE_IDLE = 1;
  STATE_BUSY = 2;
  STATE_DRAINING = 3;
}

message ComputeNodeRequest {
  string fleet_id = 1;
  int32 gpu_count = 2;
  repeated string required_tags = 3;
  bool prefer_h100 = 4;
}

message ComputeNodeResponse {
  string node_id = 1;
  NodeState state = 2;
  double vram_gb = 3;
  int64 allocated_at = 4;
  map<string, string> metadata = 5;
}

service GpuOrchestrator {
  rpc RequestComputeNode (ComputeNodeRequest) returns (ComputeNodeResponse);
}`);

  const generatedTypeScriptFromProto = useMemo(() => {
    const lines = protoInput.split('\n');
    const tsOutput: string[] = [
      '// ========================================================',
      '// Interfaces TypeScript Geradas a partir do Esquema Proto3',
      '// V5 Apollo Architecture Protocol Buffer Compiler (Client-Side)',
      '// ========================================================\n'
    ];

    let currentInterface: string | null = null;
    let currentEnum: string | null = null;
    let serviceRpcList: Array<{ rpcName: string; req: string; res: string }> = [];

    const mapProtoTypeToTs = (pt: string): string => {
      switch (pt) {
        case 'string': return 'string';
        case 'bool': return 'boolean';
        case 'int32':
        case 'uint32':
        case 'sint32':
        case 'fixed32':
        case 'sfixed32':
        case 'float':
        case 'double': return 'number';
        case 'int64':
        case 'uint64':
        case 'sint64':
        case 'fixed64':
        case 'sfixed64': return 'string | bigint';
        case 'bytes': return 'Uint8Array';
        default: return pt;
      }
    };

    lines.forEach(rawLine => {
      const line = rawLine.trim();

      // Enums
      if (line.startsWith('enum ') && line.includes('{')) {
        const enumName = line.replace('enum ', '').replace('{', '').trim();
        currentEnum = enumName;
        tsOutput.push(`export enum ${enumName} {`);
        return;
      }
      if (currentEnum && line === '}') {
        tsOutput.push('}\n');
        currentEnum = null;
        return;
      }
      if (currentEnum) {
        const match = line.match(/^([A-Z0-9_]+)\s*=\s*([0-9]+);/);
        if (match) {
          tsOutput.push(`  ${match[1]} = ${match[2]},`);
        }
        return;
      }

      // Messages -> Interfaces
      if (line.startsWith('message ') && line.includes('{')) {
        const msgName = line.replace('message ', '').replace('{', '').trim();
        currentInterface = msgName;
        tsOutput.push(`export interface ${msgName} {`);
        return;
      }
      if (currentInterface && line === '}') {
        tsOutput.push('}\n');
        currentInterface = null;
        return;
      }
      if (currentInterface) {
        // repeated field
        const repMatch = line.match(/^repeated\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*=\s*[0-9]+;/);
        if (repMatch) {
          tsOutput.push(`  ${repMatch[2]}: Array<${mapProtoTypeToTs(repMatch[1])}>;`);
          return;
        }

        // map<K, V> field
        const mapMatch = line.match(/^map<([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)>\s+([a-zA-Z0-9_]+)\s*=\s*[0-9]+;/);
        if (mapMatch) {
          tsOutput.push(`  ${mapMatch[3]}: Record<${mapProtoTypeToTs(mapMatch[1])}, ${mapProtoTypeToTs(mapMatch[2])}>;`);
          return;
        }

        // standard scalar / message field
        const fieldMatch = line.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*=\s*[0-9]+;/);
        if (fieldMatch) {
          tsOutput.push(`  ${fieldMatch[2]}: ${mapProtoTypeToTs(fieldMatch[1])};`);
          return;
        }
      }

      // Services & RPCs
      const rpcMatch = line.match(/rpc\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*returns\s*\(([^)]+)\);/);
      if (rpcMatch) {
        serviceRpcList.push({
          rpcName: rpcMatch[1],
          req: rpcMatch[2].trim(),
          res: rpcMatch[3].trim()
        });
      }
    });

    if (serviceRpcList.length > 0) {
      tsOutput.push('// Interface de Cliente gRPC');
      tsOutput.push('export interface GpuOrchestratorClient {');
      serviceRpcList.forEach(s => {
        tsOutput.push(`  ${s.rpcName}(request: ${s.req}): Promise<${s.res}>;`);
      });
      tsOutput.push('}\n');
    }

    return tsOutput.join('\n');
  }, [protoInput]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Cabeçalho da Bancada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCode className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Documentação Técnica, OpenAPI & Mocking
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  API & Architecture
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Visualizador OpenAPI/Swagger 3.0, gerador de massa de dados JSON mock, matriz de status codes RFC 9110, formatador GraphQL e compilador Protobuf.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Soberania */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
            <Server className="w-3.5 h-3.5" />
            Zero Server Cost
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            OpenAPI & Proto3
          </span>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('openapi-viewer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'openapi-viewer'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Visualizador OpenAPI / Swagger</span>
        </button>

        <button
          onClick={() => setActiveTab('json-mock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'json-mock'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Gerador de Dados JSON Mock</span>
        </button>

        <button
          onClick={() => setActiveTab('status-matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'status-matrix'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Status Codes RFC</span>
        </button>

        <button
          onClick={() => setActiveTab('graphql-linter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'graphql-linter'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Formatador GraphQL</span>
        </button>

        <button
          onClick={() => setActiveTab('protobuf-inspector')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'protobuf-inspector'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Inspetor Protobuf (Proto3)</span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: VISUALIZADOR OPENAPI / SWAGGER
      ======================================================== */}
      {activeTab === 'openapi-viewer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor de Especificação */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> OpenAPI Spec (JSON)
                </h3>
                <button
                  onClick={() => setOpenApiInput(JSON.stringify(DEFAULT_OPENAPI_SPEC, null, 2))}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 font-mono"
                >
                  Restaurar Preset
                </button>
              </div>

              <textarea
                rows={16}
                value={openApiInput}
                onChange={(e) => setOpenApiInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
              />

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Compatibilidade:</p>
                <p>Suporta especificações OpenAPI 3.0.x e 3.1.x em formato JSON puro, renderizando endpoints, cabeçalhos, schemas de request e responses.</p>
              </div>
            </div>

            {/* Renderização Interativa da Documentação */}
            <div className="lg:col-span-2 space-y-4">
              {parsedOpenApi.isValid ? (
                <div className="space-y-4">
                  {/* Cabeçalho da API */}
                  <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{parsedOpenApi.title}</h3>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        v{parsedOpenApi.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{parsedOpenApi.description}</p>
                    {parsedOpenApi.servers.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                        <span className="text-slate-500">Servidores:</span>
                        {parsedOpenApi.servers.map((s: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                            {s.url}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lista de Endpoints */}
                  <div className="space-y-3">
                    {parsedOpenApi.paths.map((item, idx) => {
                      const methodColors: Record<string, string> = {
                        GET: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
                        POST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
                        PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
                        DELETE: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
                        PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      };

                      return (
                        <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${methodColors[item.method] || 'bg-slate-800 text-slate-300'}`}>
                                {item.method}
                              </span>
                              <span className="text-sm font-mono font-semibold text-white">{item.path}</span>
                            </div>
                            <span className="text-xs text-slate-400">{item.summary}</span>
                          </div>

                          {/* Parâmetros */}
                          {item.parameters.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/60 space-y-1">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Parâmetros:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                                {item.parameters.map((p, pIdx) => (
                                  <div key={pIdx} className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between">
                                    <span className="text-slate-200">
                                      {p.name} <span className="text-slate-500 text-[10px]">({p.in})</span>
                                    </span>
                                    {p.required && (
                                      <span className="text-[10px] text-amber-400">obrigatório</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Responses */}
                          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Respostas:</span>
                            {Object.keys(item.responses).map(code => (
                              <span
                                key={code}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  code.startsWith('2')
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950/60 border border-rose-800/50 rounded-xl text-xs text-rose-400">
                  <span className="font-bold block mb-1">Erro de Sintaxe no JSON:</span>
                  {parsedOpenApi.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: GERADOR DE DADOS JSON MOCK
      ======================================================== */}
      {activeTab === 'json-mock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Geração */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Parâmetros do Mock
              </h3>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Quantidade de Registros</label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{mockCount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={mockCount}
                  onChange={(e) => setMockCount(parseInt(e.target.value) || 1)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Campos a Incluir:</span>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeEmail}
                    onChange={(e) => setIncludeEmail(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>E-mail Corporativo (@v5holding)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeCpf}
                    onChange={(e) => setIncludeCpf(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>CPF Formatado (Massa de QA)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includePhone}
                    onChange={(e) => setIncludePhone(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Telefone com DDD Regional</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeAddress}
                    onChange={(e) => setIncludeAddress(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Endereço Completo (Rua, Cidade, UF, CEP)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeFinance}
                    onChange={(e) => setIncludeFinance(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Carteira & Saldo Financeiro (BRL)</span>
                </label>
              </div>

              <button
                onClick={() => setMockSeed(prev => prev + 1)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Gerar Nova Amostra (Re-seed)</span>
              </button>
            </div>

            {/* Saída de Dados */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">JSON Gerado ({generatedMockData.items.length} objetos)</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedMockData.jsonStr, 'mock-json')}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                    >
                      {copiedKey === 'mock-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar JSON</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedMockData.csvStr, 'mock-csv')}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                    >
                      {copiedKey === 'mock-csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar CSV</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 max-h-[460px] overflow-y-auto select-all">
                  <pre>{generatedMockData.jsonStr}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: MATRIZ DE STATUS CODES HTTP RFC 9110
      ======================================================== */}
      {activeTab === 'status-matrix' && (
        <div className="space-y-6">
          {/* Barra de Filtros */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar código (ex: 404, 301, conflict)..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['all', '1xx', '2xx', '3xx', '4xx', '5xx'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setStatusFilterCat(cat)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    statusFilterCat === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Cards da Matriz */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStatuses.map(item => {
              const catColors: Record<string, string> = {
                '1xx': 'text-slate-400 border-slate-700 bg-slate-800/40',
                '2xx': 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
                '3xx': 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
                '4xx': 'text-amber-400 border-amber-500/40 bg-amber-950/20',
                '5xx': 'text-rose-400 border-rose-500/40 bg-rose-950/20'
              };

              return (
                <div key={item.code} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${catColors[item.cat]}`}>
                        {item.code}
                      </span>
                      <span className="text-sm font-semibold text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {item.idemp && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Idempotente
                        </span>
                      )}
                      {item.cache && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Cacheable
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: FORMATADOR & LINTER GRAPHQL
      ======================================================== */}
      {activeTab === 'graphql-linter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor de Entrada */}
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Entrada de Query / Mutation GraphQL:</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  formattedGraphql.isValid
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {formattedGraphql.isValid ? 'Sintaxe Válida' : 'Erro de Chaves'}
                </span>
              </div>

              <textarea
                rows={14}
                value={graphqlInput}
                onChange={(e) => setGraphqlInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
              />

              {formattedGraphql.error && (
                <div className="p-3 bg-rose-950/20 border border-rose-800/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formattedGraphql.error}</span>
                </div>
              )}
            </div>

            {/* Saída Formatada / Minificada */}
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saída Formatada (2 Espaços):</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(formattedGraphql.formatted, 'gql-fmt')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedKey === 'gql-fmt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Formatado</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(formattedGraphql.minified, 'gql-min')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'gql-min' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Minificado</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 max-h-[340px] overflow-y-auto select-all">
                <pre>{formattedGraphql.formatted}</pre>
              </div>

              {formattedGraphql.minified && (
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-400 overflow-x-auto truncate">
                  Minificado: <span className="text-slate-200">{formattedGraphql.minified}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: INSPETOR PROTOBUF PROTO3 -> TYPESCRIPT
      ======================================================== */}
      {activeTab === 'protobuf-inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entrada .proto */}
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                Arquivo de Esquema Google Protobuf (.proto):
              </span>
              <textarea
                rows={16}
                value={protoInput}
                onChange={(e) => setProtoInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Saída TypeScript */}
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Interfaces TypeScript Geradas:
                </span>
                <button
                  onClick={() => copyToClipboard(generatedTypeScriptFromProto, 'proto-ts')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedKey === 'proto-ts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar TypeScript</span>
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 max-h-[380px] overflow-y-auto select-all">
                <pre>{generatedTypeScriptFromProto}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
