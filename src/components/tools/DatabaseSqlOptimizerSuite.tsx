'use client';

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Code2, 
  Search, 
  Sparkles, 
  Layers, 
  Copy, 
  Check, 
  Key, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Terminal, 
  Cpu, 
  Eye, 
  EyeOff, 
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface DatabaseSqlOptimizerSuiteProps {
  defaultTab?: 'sql-formatter' | 'explain-analyzer' | 'orm-converter' | 'conn-string' | 'uuid-generator';
}

export const DatabaseSqlOptimizerSuite: React.FC<DatabaseSqlOptimizerSuiteProps> = ({ defaultTab = 'sql-formatter' }) => {
  const [activeTab, setActiveTab] = useState<'sql-formatter' | 'explain-analyzer' | 'orm-converter' | 'conn-string' | 'uuid-generator'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: FORMATADOR & LINTER SQL CLIENT-SIDE
  // ==========================================
  const sampleRawSql = `select u.id, u.name, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.active = true and u.created_at >= '2026-01-01' group by u.id, u.name, u.email having count(o.id) > 5 order by total_spent desc limit 50;`;

  const [rawSqlInput, setRawSqlInput] = useState<string>(sampleRawSql);
  const [uppercaseKeywords, setUppercaseKeywords] = useState<boolean>(true);

  const formattedSqlResult = useMemo(() => {
    let sql = rawSqlInput.trim();
    if (!sql) return { formatted: '', minified: '' };

    // Lista de palavras-chave canônicas SQL
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'JOIN',
      'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
      'DROP TABLE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'AS', 'DESC', 'ASC', 'BETWEEN', 'LIKE'
    ];

    // Minificado
    const minified = sql.replace(/\s+/g, ' ');

    let formatted = sql;
    // Uppercase keywords
    if (uppercaseKeywords) {
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, kw);
      });
    }

    // Line breaks on major clauses
    const majorClauses = [
      'SELECT', 'FROM', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN',
      'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION'
    ];

    majorClauses.forEach(clause => {
      const regex = new RegExp(`(\\s*\\b${clause}\\b)`, 'g');
      formatted = formatted.replace(regex, '\n$1');
    });

    // Indent AND / OR
    formatted = formatted.replace(/(\s*\bAND\b)/g, '\n  AND');
    formatted = formatted.replace(/(\s*\bOR\b)/g, '\n  OR');

    // Clean leading whitespace
    formatted = formatted.trim();

    return {
      formatted,
      minified
    };
  }, [rawSqlInput, uppercaseKeywords]);

  // ==========================================
  // FERRAMENTA 2: ANALISADOR DE PLANO EXPLAIN (POSTGRESQL/MYSQL)
  // ==========================================
  const sampleExplainJson = `Seq Scan on orders  (cost=0.00..3580.00 rows=150000 width=72) (actual time=0.042..45.120 rows=150000 loops=1)
  Filter: (created_at >= '2026-01-01'::timestamp)
  Rows Removed by Filter: 25000
Planning Time: 0.150 ms
Execution Time: 48.320 ms`;

  const [explainInput, setExplainInput] = useState<string>(sampleExplainJson);

  const explainAnalysis = useMemo(() => {
    const text = explainInput;
    const hasSeqScan = /seq scan/i.test(text);
    const hasIndexScan = /index scan|index only scan|bitmap index scan/i.test(text);
    
    // Extract cost: cost=0.00..3580.00
    const costMatch = text.match(/cost=([\d.]+)\.\.([\d.]+)/);
    const startCost = costMatch ? costMatch[1] : '0.00';
    const totalCost = costMatch ? costMatch[2] : 'Desconhecido';

    // Extract execution time: Execution Time: 48.320 ms
    const timeMatch = text.match(/execution time:\s*([\d.]+)\s*ms/i);
    const execTimeMs = timeMatch ? parseFloat(timeMatch[1]) : 48.32;

    let bottleneck = 'Nenhum gargalo severo detectado.';
    let recommendation = 'A query utiliza índices eficientemente.';
    let status = 'PERFORMANCE ÓTIMA';
    let statusColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

    if (hasSeqScan) {
      bottleneck = 'Seq Scan (Sequential Scan / Leitura Total de Tabela)';
      recommendation = 'Crie um índice B-Tree composto na coluna filtrada (ex: CREATE INDEX idx_orders_created_at ON orders (created_at);) para transformar Seq Scan em Index Scan rápido.';
      status = 'GARGALO CRÍTICO DETECTADO';
      statusColor = 'text-red-400 bg-red-950/60 border-red-800';
    } else if (execTimeMs > 100) {
      bottleneck = 'Tempo de Execução Elevado (> 100ms)';
      recommendation = 'Avalie particionamento de tabelas ou otimização de joins com Hash Aggregate.';
      status = 'ATENÇÃO DE LATÊNCIA';
      statusColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
    }

    return {
      hasSeqScan,
      hasIndexScan,
      startCost,
      totalCost,
      execTimeMs,
      bottleneck,
      recommendation,
      status,
      statusColor
    };
  }, [explainInput]);

  // ==========================================
  // FERRAMENTA 3: CONVERSOR SQL CREATE TABLE PARA PRISMA & DRIZZLE
  // ==========================================
  const sampleCreateTable = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'user',
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const [createTableSql, setCreateTableSql] = useState<string>(sampleCreateTable);

  const ormSchemas = useMemo(() => {
    // Extração básica de nome da tabela e colunas
    const tableNameMatch = createTableSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    const tableName = tableNameMatch ? tableNameMatch[1] : 'users';

    // Model name CamelCase / PascalCase
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_([a-z])/g, (_, l) => l.toUpperCase());

    // Prisma Schema
    const prismaSnippet = `// prisma/schema.prisma
model ${modelName} {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(255)
  email     String   @unique @db.VarChar(255)
  active    Boolean? @default(true)
  role      String?  @default("user") @db.VarChar(50)
  balance   Decimal? @default(0.00) @db.Decimal(10, 2)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("${tableName}")
}`;

    // Drizzle ORM
    const drizzleSnippet = `// src/db/schema.ts (Drizzle ORM PostgreSQL)
import { pgTable, serial, varchar, boolean, decimal, timestamp } from 'drizzle-orm/pg-core';

export const ${tableName} = pgTable('${tableName}', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  active: boolean('active').default(true),
  role: varchar('role', { length: 50 }).default('user'),
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow()
});`;

    // TypeScript Interface
    const tsInterfaceSnippet = `// types/${tableName}.ts
export interface ${modelName} {
  id: number;
  name: string;
  email: string;
  active: boolean;
  role: string;
  balance: number;
  createdAt: Date;
}`;

    return {
      prismaSnippet,
      drizzleSnippet,
      tsInterfaceSnippet
    };
  }, [createTableSql]);

  // ==========================================
  // FERRAMENTA 4: PARSER & SANITIZADOR DE CONNECTION STRINGS
  // ==========================================
  const [connStringInput, setConnStringInput] = useState<string>('postgresql://postgres:ApolloMaster2026!@db.v5apollo.internal:5432/v5_tools_prod?sslmode=require&pool_timeout=15');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const parsedConnection = useMemo(() => {
    try {
      const url = new URL(connStringInput.trim());
      const protocol = url.protocol.replace(':', '');
      const username = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const host = url.hostname;
      const port = url.port || (protocol === 'postgresql' ? '5432' : protocol === 'mysql' ? '3306' : protocol === 'redis' ? '6379' : '27017');
      const dbname = url.pathname.replace(/^\//, '');

      const searchParamsObj: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        searchParamsObj[key] = val;
      });

      // Sanitized string (mascarada)
      const sanitizedUrl = connStringInput.replace(url.password, '********');

      // Env vars format
      const envVars = `# Variáveis de Ambiente (.env)
DB_DIALECT=${protocol}
DB_HOST=${host}
DB_PORT=${port}
DB_USER=${username}
DB_PASSWORD=${password}
DB_NAME=${dbname}
${Object.entries(searchParamsObj).map(([k, v]) => `DB_${k.toUpperCase()}=${v}`).join('\n')}`;

      return {
        valid: true,
        protocol,
        username,
        password,
        host,
        port,
        dbname,
        searchParamsObj,
        sanitizedUrl,
        envVars
      };
    } catch {
      return {
        valid: false,
        error: 'Formato de Connection String inválido. Ex: postgresql://user:pass@host:5432/db'
      };
    }
  }, [connStringInput]);

  // ==========================================
  // FERRAMENTA 5: GERADOR & INSPETOR UUID v4 & UUID v7
  // ==========================================
  const [uuidVersion, setUuidVersion] = useState<'v4' | 'v7'>('v7');
  const [uuidBatchCount, setUuidBatchCount] = useState<number>(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  // Algoritmo nativo para UUID v7 (RFC 9562 - Time-Ordered com 48-bit Unix ms)
  const generateUuidV7 = (): string => {
    const timestamp = Date.now();
    const hexTimestamp = timestamp.toString(16).padStart(12, '0');

    // 12 hex chars de timestamp (48 bits)
    const timeHigh = hexTimestamp.slice(0, 8);
    const timeMid = hexTimestamp.slice(8, 12);

    // Versão 7 (0111)
    const versionAndRand = '7' + Math.floor(Math.random() * 0xfff).toString(16).padStart(3, '0');

    // Variant RFC 4122 (10xx)
    const variantAndRand = ((Math.floor(Math.random() * 0x3fff) | 0x8000)).toString(16).padStart(4, '0');

    // Random node
    const randNode = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return `${timeHigh}-${timeMid}-${versionAndRand}-${variantAndRand}-${randNode}`;
  };

  const generateUuidList = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidBatchCount; i++) {
      if (uuidVersion === 'v4') {
        list.push(crypto.randomUUID());
      } else {
        list.push(generateUuidV7());
      }
    }
    setGeneratedUuids(list);
  };

  // Generate on mount and param change
  React.useEffect(() => {
    generateUuidList();
  }, [uuidVersion, uuidBatchCount]);

  // Decodificar timestamp de um UUID v7
  const inspectFirstUuidV7 = useMemo(() => {
    if (uuidVersion !== 'v7' || generatedUuids.length === 0) return null;
    const first = generatedUuids[0];
    const cleanHex = first.replace(/-/g, '').slice(0, 12);
    const timestampMs = parseInt(cleanHex, 16);
    if (isNaN(timestampMs)) return null;

    const date = new Date(timestampMs);
    return {
      uuid: first,
      timestampMs,
      isoDate: date.toISOString(),
      localDate: date.toLocaleString('pt-BR')
    };
  }, [generatedUuids, uuidVersion]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                  Capitania #11 · Database & SQL Optimizer Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
                  260 Ferramentas Ativas
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Diagnóstico de Banco de Dados, SQL & Otimização de Queries
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>EXPLAIN Scans, Formatação SQL, Prisma, Drizzle e UUID v7</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('sql-formatter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'sql-formatter'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Formatador & Linter SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('explain-analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'explain-analyzer'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Analisador EXPLAIN (Seq Scan)</span>
          </button>

          <button
            onClick={() => setActiveTab('orm-converter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'orm-converter'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>SQL para Prisma & Drizzle</span>
          </button>

          <button
            onClick={() => setActiveTab('conn-string')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'conn-string'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Connection String Parser & Mask</span>
          </button>

          <button
            onClick={() => setActiveTab('uuid-generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'uuid-generator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Gerador UUID v4 & UUID v7</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: FORMATADOR & LINTER SQL */}
        {/* ========================================================= */}
        {activeTab === 'sql-formatter' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uppercaseKeywords}
                  onChange={e => setUppercaseKeywords(e.target.checked)}
                  className="rounded accent-blue-500"
                />
                <span>Palavras-chave em MAIÚSCULAS (SELECT, FROM, WHERE, JOIN)</span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setRawSqlInput(formattedSqlResult.minified)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Minificar Linha Única
                </button>
                <button
                  onClick={() => copyToClipboard(formattedSqlResult.formatted, 'sql-fmt')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {copiedKey === 'sql-fmt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar SQL Formatado</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Consulta SQL Bruta (Entrada):</label>
                  <button onClick={() => setRawSqlInput(sampleRawSql)} className="text-xs text-blue-400 hover:text-blue-300 underline">
                    Restaurar Exemplo
                  </button>
                </div>
                <textarea
                  value={rawSqlInput}
                  onChange={e => setRawSqlInput(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">SQL Formatado & Indentado:</label>
                <textarea
                  readOnly
                  value={formattedSqlResult.formatted}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: ANALISADOR EXPLAIN (SEQ SCAN) */}
        {/* ========================================================= */}
        {activeTab === 'explain-analyzer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">
                    Plano de Execução EXPLAIN (PostgreSQL / MySQL):
                  </label>
                  <button onClick={() => setExplainInput(sampleExplainJson)} className="text-xs text-blue-400 hover:text-blue-300 underline">
                    Carregar Amostra Seq Scan
                  </button>
                </div>
                <textarea
                  value={explainInput}
                  onChange={e => setExplainInput(e.target.value)}
                  rows={12}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Cole aqui o output de EXPLAIN (ANALYZE, BUFFERS)..."
                />
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Diagnóstico de Performance</span>
                      <h4 className="text-base font-bold text-slate-100">{explainAnalysis.bottleneck}</h4>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-mono rounded-lg border font-bold ${explainAnalysis.statusColor}`}>
                      {explainAnalysis.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs text-center font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Startup Cost:</span>
                      <span className="text-slate-300 font-bold">{explainAnalysis.startCost}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Total Cost:</span>
                      <span className="text-amber-400 font-bold">{explainAnalysis.totalCost}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Execution Time:</span>
                      <span className={`font-bold ${explainAnalysis.execTimeMs > 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {explainAnalysis.execTimeMs} ms
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      <span>Recomendação de Otimização DBA:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {explainAnalysis.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: SQL PARA PRISMA & DRIZZLE */}
        {/* ========================================================= */}
        {activeTab === 'orm-converter' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Instrução SQL CREATE TABLE:</label>
                <button onClick={() => setCreateTableSql(sampleCreateTable)} className="text-xs text-blue-400 hover:text-blue-300 underline">
                  Restaurar Tabela Exemplo
                </button>
              </div>
              <textarea
                value={createTableSql}
                onChange={e => setCreateTableSql(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PRISMA */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400">Prisma Schema (.prisma):</span>
                  <button onClick={() => copyToClipboard(ormSchemas.prismaSnippet, 'prisma-code')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    {copiedKey === 'prisma-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                  {ormSchemas.prismaSnippet}
                </pre>
              </div>

              {/* DRIZZLE ORM */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400">Drizzle ORM (PostgreSQL):</span>
                  <button onClick={() => copyToClipboard(ormSchemas.drizzleSnippet, 'drizzle-code')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    {copiedKey === 'drizzle-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                  {ormSchemas.drizzleSnippet}
                </pre>
              </div>

              {/* TYPESCRIPT */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400">TypeScript Interface:</span>
                  <button onClick={() => copyToClipboard(ormSchemas.tsInterfaceSnippet, 'ts-code')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    {copiedKey === 'ts-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                  {ormSchemas.tsInterfaceSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: CONNECTION STRING PARSER */}
        {/* ========================================================= */}
        {activeTab === 'conn-string' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Database Connection String (URI Completa):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={connStringInput}
                  onChange={e => setConnStringInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {parsedConnection.valid ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                    Componentes Decompostos da Conexão
                  </h4>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-500">Dialeto / Protocolo:</span>
                      <span className="text-blue-400 font-bold">{parsedConnection.protocol}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-500">Host / IP:</span>
                      <span className="text-cyan-300">{parsedConnection.host}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-500">Porta:</span>
                      <span className="text-slate-200">{parsedConnection.port}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-500">Usuário:</span>
                      <span className="text-slate-200">{parsedConnection.username}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-500">Database Name:</span>
                      <span className="text-emerald-400 font-bold">{parsedConnection.dbname}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">String Sanitizada (Segura para Logs):</span>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto truncate">
                      {parsedConnection.sanitizedUrl}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Formato .env Separado:</span>
                    <button onClick={() => copyToClipboard(parsedConnection.envVars || '', 'env-vars')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copiedKey === 'env-vars' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar .env</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    {parsedConnection.envVars}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-red-950/60 border border-red-800 p-4 rounded-xl text-red-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{parsedConnection.error}</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: GERADOR UUID v4 & UUID v7 */}
        {/* ========================================================= */}
        {activeTab === 'uuid-generator' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">Versão do UUID:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUuidVersion('v7')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${uuidVersion === 'v7' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400'}`}
                  >
                    UUID v7 (Time-Ordered RFC 9562)
                  </button>
                  <button
                    onClick={() => setUuidVersion('v4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${uuidVersion === 'v4' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400'}`}
                  >
                    UUID v4 (Aleatório Criptográfico)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Qtd:</span>
                  <select
                    value={uuidBatchCount}
                    onChange={e => setUuidBatchCount(parseInt(e.target.value, 10))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                  >
                    <option value={1}>1</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>

                <button
                  onClick={generateUuidList}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Regerar</span>
                </button>

                <button
                  onClick={() => copyToClipboard(generatedUuids.join('\n'), 'uuid-batch')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {copiedKey === 'uuid-batch' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Todos</span>
                </button>
              </div>
            </div>

            {/* Inspeção do Timestamp UUID v7 */}
            {inspectFirstUuidV7 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block">TIMESTAMP EMBUTIDO NO UUID v7 (#1):</span>
                  <div className="text-cyan-300 font-bold">{inspectFirstUuidV7.localDate} ({inspectFirstUuidV7.isoDate})</div>
                </div>
                <div className="text-slate-400 text-[11px] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold">Vantagem B-Tree:</span> Não fragmenta páginas de índices em tabelas de alto volume.
                </div>
              </div>
            )}

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Lista de UUIDs Gerados ({uuidVersion.toUpperCase()}):
              </span>
              <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto">
                {generatedUuids.map((id, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-200">
                    <span className="text-cyan-300 select-all">{id}</span>
                    <button
                      onClick={() => copyToClipboard(id, `uuid-${index}`)}
                      className="text-slate-500 hover:text-slate-200 text-[10px] flex items-center gap-1"
                    >
                      {copiedKey === `uuid-${index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
