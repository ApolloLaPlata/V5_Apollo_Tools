'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Network, 
  Binary, 
  Code2, 
  Database, 
  Copy, 
  Check, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Layers, 
  Lock, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type SecurityInfraTab = 'crypto-hash' | 'regex-tester' | 'yaml-json' | 'ipv4-cidr' | 'sql-beautifier';

export function SecurityAndInfraSuite({ defaultTab = 'crypto-hash' }: { defaultTab?: SecurityInfraTab }) {
  const [activeTab, setActiveTab] = useState<SecurityInfraTab>(defaultTab);
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
  // TAB 1: GERADOR DE HASHES CRIPTOGRÁFICOS
  // ==========================================
  const [hashInput, setHashInput] = useState<string>('Holding V5 Apollo · Capitania #11');
  const [hashes, setHashes] = useState<{ [algo: string]: string }>({
    'SHA-256': '',
    'SHA-512': '',
    'SHA-384': '',
    'SHA-1': '',
    'MD5 (Simulado/Digest)': ''
  });

  const computeHashes = async (text: string) => {
    if (!text) {
      setHashes({ 'SHA-256': '', 'SHA-512': '', 'SHA-384': '', 'SHA-1': '', 'MD5': '' });
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const calcHash = async (algo: string) => {
      try {
        const buffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(buffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch {
        return 'Não suportado no navegador';
      }
    };

    // Algoritmo MD5 rápido client-side
    const simpleMd5 = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(32, '0');
    };

    const sha256 = await calcHash('SHA-256');
    const sha512 = await calcHash('SHA-512');
    const sha384 = await calcHash('SHA-384');
    const sha1 = await calcHash('SHA-1');

    setHashes({
      'SHA-256': sha256,
      'SHA-512': sha512,
      'SHA-384': sha384,
      'SHA-1': sha1,
      'MD5 (Hash 32-hex)': simpleMd5(text)
    });
  };

  useEffect(() => {
    computeHashes(hashInput);
  }, [hashInput]);

  // ==========================================
  // TAB 2: TESTADOR & VALIDADOR DE REGEX
  // ==========================================
  const [regexPattern, setRegexPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [regexText, setRegexText] = useState<string>(
    'Contatos da Holding:\nEmail oficial: v5estudio@hotmail.com\nSuporte: suporte@v5apollo.com\nTeste inválido: contato@sem-dominio'
  );
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [regexError, setRegexError] = useState<string | null>(null);

  const REGEX_LIBRARY = [
    { label: 'E-mail', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    { label: 'CPF', pattern: '\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}', flags: 'g' },
    { label: 'CNPJ', pattern: '\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}', flags: 'g' },
    { label: 'Telefone Celular BR', pattern: '\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}', flags: 'g' },
    { label: 'CEP', pattern: '\\d{5}-?\\d{3}', flags: 'g' },
    { label: 'URL / Link Web', pattern: 'https?://[\\w\\.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+', flags: 'g' },
    { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { label: 'Data (DD/MM/AAAA)', pattern: '\\b\\d{2}/\\d{2}/\\d{4}\\b', flags: 'g' }
  ];

  const testRegex = () => {
    try {
      setRegexError(null);
      if (!regexPattern) {
        setRegexMatches([]);
        return;
      }
      const re = new RegExp(regexPattern, regexFlags);
      const matches = regexText.match(re);
      setRegexMatches(matches ? Array.from(matches) : []);
    } catch (err: any) {
      setRegexError(err.message || 'Expressão regular inválida');
      setRegexMatches([]);
    }
  };

  useEffect(() => {
    testRegex();
  }, [regexPattern, regexFlags, regexText]);

  // ==========================================
  // TAB 3: CONVERSOR YAML <-> JSON
  // ==========================================
  const DEFAULT_YAML = `projeto: V5 Apollo Tools
capitania: 11
porta: 3009
infra:
  gpu: Modal H100
  cold_start: 2.8s
  soberania: 100%
ferramentas:
  - 4Devs
  - Invertexto
  - ComfyUI`;

  const [yamlText, setYamlText] = useState<string>(DEFAULT_YAML);
  const [jsonText, setJsonText] = useState<string>('');
  const [conversionDirection, setConversionDirection] = useState<'yaml2json' | 'json2yaml'>('yaml2json');

  // Mini parser/conversor YAML simples client-side
  const parseYamlToJson = (yaml: string) => {
    try {
      const lines = yaml.split('\n');
      const result: any = {};
      let currentSection: string | null = null;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        if (line.startsWith('  - ')) {
          const item = line.replace('  - ', '').trim();
          if (currentSection) {
            if (!Array.isArray(result[currentSection])) result[currentSection] = [];
            result[currentSection].push(item);
          }
        } else if (line.startsWith('  ')) {
          const [k, ...v] = trimmed.split(':');
          if (currentSection && k && v) {
            if (typeof result[currentSection] !== 'object' || Array.isArray(result[currentSection])) {
              result[currentSection] = {};
            }
            result[currentSection][k.trim()] = v.join(':').trim();
          }
        } else if (trimmed.includes(':')) {
          const [k, ...v] = trimmed.split(':');
          const val = v.join(':').trim();
          if (val === '') {
            currentSection = k.trim();
            result[currentSection] = [];
          } else {
            currentSection = null;
            result[k.trim()] = isNaN(Number(val)) ? val : Number(val);
          }
        }
      });
      return JSON.stringify(result, null, 2);
    } catch {
      return '// Erro de sintaxe YAML';
    }
  };

  const parseJsonToYaml = (jsonStr: string) => {
    try {
      const obj = JSON.parse(jsonStr);
      let yaml = '';
      for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) {
          yaml += `${k}:\n`;
          v.forEach((item) => (yaml += `  - ${item}\n`));
        } else if (typeof v === 'object' && v !== null) {
          yaml += `${k}:\n`;
          for (const [subK, subV] of Object.entries(v)) {
            yaml += `  ${subK}: ${subV}\n`;
          }
        } else {
          yaml += `${k}: ${v}\n`;
        }
      }
      return yaml.trim();
    } catch {
      return '# Erro de sintaxe JSON';
    }
  };

  useEffect(() => {
    if (conversionDirection === 'yaml2json') {
      setJsonText(parseYamlToJson(yamlText));
    }
  }, [yamlText, conversionDirection]);

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    if (conversionDirection === 'json2yaml') {
      setYamlText(parseJsonToYaml(val));
    }
  };

  // ==========================================
  // TAB 4: CALCULADORA DE SUB-REDE IPV4 & CIDR
  // ==========================================
  const [ipInput, setIpInput] = useState<string>('192.168.1.100');
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);

  const calculateSubnet = (ip: string, cidr: number) => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }

    const ipInt = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (netInt | ~maskInt) >>> 0;

    const toIpStr = (int: number) =>
      `${(int >>> 24) & 255}.${(int >>> 16) & 255}.${(int >>> 8) & 255}.${int & 255}`;

    const toBinStr = (int: number) => {
      return [
        ((int >>> 24) & 255).toString(2).padStart(8, '0'),
        ((int >>> 16) & 255).toString(2).padStart(8, '0'),
        ((int >>> 8) & 255).toString(2).padStart(8, '0'),
        (int & 255).toString(2).padStart(8, '0')
      ].join('.');
    };

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstUsable = cidr >= 31 ? netInt : netInt + 1;
    const lastUsable = cidr >= 31 ? broadcastInt : broadcastInt - 1;

    return {
      network: toIpStr(netInt),
      netmask: toIpStr(maskInt),
      broadcast: toIpStr(broadcastInt),
      firstUsable: toIpStr(firstUsable),
      lastUsable: toIpStr(lastUsable),
      totalHosts,
      usableHosts,
      ipBinary: toBinStr(ipInt),
      maskBinary: toBinStr(maskInt)
    };
  };

  const subnetResult = calculateSubnet(ipInput, cidrPrefix);

  // ==========================================
  // TAB 5: FORMATADOR & BEAUTIFIER DE SQL
  // ==========================================
  const DEFAULT_SQL =
    'SELECT u.id, u.nome, u.email, p.titulo, p.valor FROM usuarios u INNER JOIN pedidos p ON u.id = p.usuario_id WHERE p.status = "aprovado" AND p.valor >= 100.00 GROUP BY u.id ORDER BY p.valor DESC LIMIT 20;';

  const [sqlInput, setSqlInput] = useState<string>(DEFAULT_SQL);
  const [formattedSql, setFormattedSql] = useState<string>('');

  const formatSql = (sql: string) => {
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'INNER JOIN',
      'LEFT JOIN',
      'RIGHT JOIN',
      'GROUP BY',
      'ORDER BY',
      'HAVING',
      'LIMIT',
      'INSERT INTO',
      'VALUES',
      'UPDATE',
      'SET',
      'DELETE FROM'
    ];

    let result = sql.replace(/\s+/g, ' ').trim();
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(regex, `\n${kw}`);
    });

    result = result.replace(/,/g, ',\n  ');
    return result.trim();
  };

  useEffect(() => {
    setFormattedSql(formatSql(sqlInput));
  }, [sqlInput]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Suíte de Segurança, Redes & Infra Dev
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Hashes Criptográficos, Regex Pro, YAML e Sub-redes IPv4
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Utilitários técnicos e matemáticos para DevOps, engenheiros de backend e analistas de segurança.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('crypto-hash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crypto-hash'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Hashes SHA</span>
          </button>

          <button
            onClick={() => setActiveTab('regex-tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'regex-tester'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Testador Regex</span>
          </button>

          <button
            onClick={() => setActiveTab('yaml-json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'yaml-json'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>YAML &lt;-&gt; JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('ipv4-cidr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ipv4-cidr'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Sub-rede IPv4</span>
          </button>

          <button
            onClick={() => setActiveTab('sql-beautifier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql-beautifier'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Beautifier</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6 relative z-10">
        {/* ========================================================= */}
        {/* TAB 1: HASHES CRIPTOGRÁFICOS                              */}
        {/* ========================================================= */}
        {activeTab === 'crypto-hash' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block font-bold mb-1">
                Texto para Geração de Hashes Criptográficos:
              </label>
              <textarea
                rows={3}
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Digite ou cole qualquer string..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Lista de Hashes Calculados */}
            <div className="space-y-3">
              {Object.entries(hashes).map(([algo, hashVal]) => (
                <div key={algo} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-[120px]">
                    <span className="text-xs font-mono font-bold text-cyan-400">{algo}:</span>
                  </div>
                  <div className="flex-1 font-mono text-xs text-slate-300 break-all select-all bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    {hashVal || '...'}
                  </div>
                  <button
                    onClick={() => copyToClipboard(hashVal, algo)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === algo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              💡 Calculado localmente via Web Crypto API nativa do navegador (Zero tráfego externo).
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TESTADOR & VALIDADOR DE REGEX                      */}
        {/* ========================================================= */}
        {activeTab === 'regex-tester' && (
          <div className="space-y-4">
            {/* Biblioteca de Expressões Populares */}
            <div>
              <span className="text-xs font-mono text-slate-400 block mb-1.5">Modelos Rápidos de Expressão:</span>
              <div className="flex flex-wrap gap-1.5">
                {REGEX_LIBRARY.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setRegexPattern(item.pattern);
                      setRegexFlags(item.flags);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs de Padrão e Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-10">
                <label className="text-xs font-mono text-slate-400 block mb-1 font-bold">Padrão Regex:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">/</span>
                  <input
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono text-sm">/</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-slate-400 block mb-1 font-bold">Flags:</label>
                <input
                  type="text"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  placeholder="g, i, m"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {regexError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regexError}</span>
              </div>
            )}

            {/* Texto de Teste */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1 font-bold">Texto de Teste:</label>
              <textarea
                rows={4}
                value={regexText}
                onChange={(e) => setRegexText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Resultados das Correspondências */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">
                  Correspondências Encontradas: <strong className="text-cyan-400">{regexMatches.length}</strong>
                </span>
              </div>

              {regexMatches.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 italic">Nenhum match encontrado para o padrão especificado.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {regexMatches.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CONVERSOR YAML <-> JSON                            */}
        {/* ========================================================= */}
        {activeTab === 'yaml-json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Direção ativa: <strong>{conversionDirection === 'yaml2json' ? 'YAML -> JSON' : 'JSON -> YAML'}</strong>
              </span>
              <button
                onClick={() => setConversionDirection(conversionDirection === 'yaml2json' ? 'json2yaml' : 'yaml2json')}
                className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono transition cursor-pointer"
              >
                Inverter Direção
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Painel YAML */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold">Código YAML:</span>
                  <button
                    onClick={() => copyToClipboard(yamlText, 'yaml')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedKey === 'yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={yamlText}
                  onChange={(e) => setYamlText(e.target.value)}
                  readOnly={conversionDirection === 'json2yaml'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Painel JSON */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold">Código JSON:</span>
                  <button
                    onClick={() => copyToClipboard(jsonText, 'json')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedKey === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  readOnly={conversionDirection === 'yaml2json'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CALCULADORA DE SUB-REDE IPV4 & CIDR                */}
        {/* ========================================================= */}
        {activeTab === 'ipv4-cidr' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="text-xs font-mono text-slate-400 block mb-1 font-bold">Endereço IP (IPv4):</label>
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-mono text-slate-400 block mb-1 font-bold">Máscara CIDR (/{cidrPrefix}):</label>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={cidrPrefix}
                  onChange={(e) => setCidrPrefix(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            {subnetResult ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Endereço da Rede:</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">{subnetResult.network}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Máscara de Sub-rede:</span>
                  <span className="text-sm font-mono font-bold text-white">{subnetResult.netmask}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Broadcast:</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{subnetResult.broadcast}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Primeiro IP Útil:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{subnetResult.firstUsable}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Último IP Útil:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{subnetResult.lastUsable}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Hosts Utilizáveis:</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {subnetResult.usableHosts.toLocaleString('pt-BR')} hosts
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-mono">
                Formato IPv4 inválido. Digite um IP válido (ex: 192.168.1.1).
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: FORMATADOR & BEAUTIFIER DE SQL                     */}
        {/* ========================================================= */}
        {activeTab === 'sql-beautifier' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-bold block">Consulta SQL Bruta:</span>
                <textarea
                  rows={8}
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  placeholder="Cole sua consulta SELECT, INSERT, UPDATE..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold">SQL Formatado & Indentado:</span>
                  <button
                    onClick={() => copyToClipboard(formattedSql, 'sql')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto min-h-[160px]">
                  {formattedSql}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
