'use client';

import React, { useState } from 'react';
import { 
  Code, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Bot, 
  Cpu, 
  Layers, 
  ArrowRight,
  FileText,
  Sliders,
  DollarSign
} from 'lucide-react';

interface RegexAndLexicalSuiteProps {
  defaultTab?: 'regex-lookaround' | 'ai-token-counter' | 'naming-case-converter' | 'lgpd-data-masker' | 'hidden-char-detector';
}

export function RegexAndLexicalSuite({ defaultTab = 'regex-lookaround' }: RegexAndLexicalSuiteProps) {
  const [activeTab, setActiveTab] = useState<'regex-lookaround' | 'ai-token-counter' | 'naming-case-converter' | 'lgpd-data-masker' | 'hidden-char-detector'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // =========================================================================
  // ABA 1: TESTADOR VISUAL DE REGEX COM LOOKAROUND & GRUPOS
  // =========================================================================
  const [regexPattern, setRegexPattern] = useState<string>('(?<=R\\$\\s?)\\d+([.,]\\d{2})?');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [regexTestText, setRegexTestText] = useState<string>(
    'Comprei o produto por R$ 149,90 e outro por R$25,00 no boleto. Havia também uma taxa de R$ 8,50.'
  );

  const testRegexMatches = () => {
    try {
      if (!regexPattern) return { valid: true, matches: [], count: 0 };
      const re = new RegExp(regexPattern, regexFlags);
      const matches: Array<{ fullMatch: string; index: number; groups: string[] }> = [];

      let match;
      if (regexFlags.includes('g')) {
        while ((match = re.exec(regexTestText)) !== null) {
          matches.push({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === re.lastIndex) re.lastIndex++; // Previne loop infinito em matches de tamanho 0
        }
      } else {
        match = re.exec(regexTestText);
        if (match) {
          matches.push({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      return { valid: true, matches, count: matches.length, error: null };
    } catch (err: any) {
      return { valid: false, matches: [], count: 0, error: err.message };
    }
  };

  const regexResult = testRegexMatches();

  const loadRegexPreset = (pattern: string, flags: string, text: string) => {
    setRegexPattern(pattern);
    setRegexFlags(flags);
    setRegexTestText(text);
  };

  // =========================================================================
  // ABA 2: CONTADOR E ESTIMADOR DE CUSTO DE TOKENS IA
  // =========================================================================
  const [tokenText, setTokenText] = useState<string>(
    'A inteligência artificial generativa revolucionou o desenvolvimento de software e a criação de conteúdo em escala através de redes neurais profundas e orquestração de múltiplos agentes autônomos.'
  );
  const [aiModel, setAiModel] = useState<'gpt4o' | 'claude35' | 'gemini15' | 'llama3'>('gpt4o');

  // Estimador heurístico de tokens para PT-BR / Inglês / Código
  // Em média: 1 token ~ 3.3 caracteres para português/código, 4 chars para inglês
  const charCount = tokenText.length;
  const wordCount = tokenText.trim() ? tokenText.trim().split(/\s+/).length : 0;
  const lineCount = tokenText ? tokenText.split('\n').length : 0;
  const estimatedTokens = Math.ceil(charCount / 3.3);

  // Preços por 1 Milhão de Tokens (Model Pricing 2026 estimado)
  const getModelPricing = () => {
    switch (aiModel) {
      case 'gpt4o':
        return { name: 'OpenAI GPT-4o', inputPerM: 2.50, outputPerM: 10.00, contextWindow: '128k tokens' };
      case 'claude35':
        return { name: 'Claude 3.5 Sonnet', inputPerM: 3.00, outputPerM: 15.00, contextWindow: '200k tokens' };
      case 'gemini15':
        return { name: 'Google Gemini 1.5 Pro', inputPerM: 1.25, outputPerM: 5.00, contextWindow: '2.000k tokens (2M)' };
      case 'llama3':
        return { name: 'Meta Llama 3.1 70B', inputPerM: 0.60, outputPerM: 0.80, contextWindow: '128k tokens' };
    }
  };

  const modelInfo = getModelPricing();
  const inputCostUsd = (estimatedTokens / 1_000_000) * modelInfo.inputPerM;

  // =========================================================================
  // ABA 3: CONVERSOR DE CONVENÇÕES DE NOMENCLATURA (NAMING CASES)
  // =========================================================================
  const [namingInput, setNamingInput] = useState<string>('usuario_autenticado_com_sucesso');

  const splitWords = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase split
      .replace(/[_\-\.\/]+/g, ' ') // delimiters split
      .trim()
      .split(/\s+/);
  };

  const words = splitWords(namingInput);

  const cases = {
    camelCase: words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
    PascalCase: words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
    snake_case: words.map(w => w.toLowerCase()).join('_'),
    kebab_case: words.map(w => w.toLowerCase()).join('-'),
    SCREAMING_SNAKE_CASE: words.map(w => w.toUpperCase()).join('_'),
    dot_case: words.map(w => w.toLowerCase()).join('.'),
    path_case: words.map(w => w.toLowerCase()).join('/'),
    Title_Case: words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  };

  // =========================================================================
  // ABA 4: ANONIMIZADOR E MASCARADOR LGPD/GDPR
  // =========================================================================
  const [lgpdInput, setLgpdInput] = useState<string>(
    'Cliente: Carlos Eduardo Ferreira, CPF: 123.456.789-00, e-mail: carlos.ferreira@gmail.com, Telefone: (11) 98765-4321, Cartão: 4111 2222 3333 4444, IP: 192.168.1.105.'
  );

  const [maskCpf, setMaskCpf] = useState(true);
  const [maskEmail, setMaskEmail] = useState(true);
  const [maskPhone, setMaskPhone] = useState(true);
  const [maskCard, setMaskCard] = useState(true);
  const [maskIp, setMaskIp] = useState(true);

  const maskLgpdData = (text: string) => {
    let result = text;

    if (maskCpf) {
      // CPF: 123.456.789-00 -> ***.456.***-**
      result = result.replace(/(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})/g, '***.$2.***-**');
    }
    if (maskEmail) {
      // E-mail: carlos.ferreira@gmail.com -> c***a@gmail.com
      result = result.replace(/([a-zA-Z0-9_\-\.])[a-zA-Z0-9_\-\.]*([a-zA-Z0-9_\-\.])@([a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,})/g, '$1***$2@$3');
    }
    if (maskPhone) {
      // Celular: (11) 98765-4321 -> (11) 9****-**21
      result = result.replace(/(\(?\d{2}\)?\s?)(\d{1,2})(\d{3,4})-?(\d{2})(\d{2})/g, '$1$2****-**$5');
    }
    if (maskCard) {
      // Cartão: 4111 2222 3333 4444 -> **** **** **** 4444
      result = result.replace(/(\d{4})[\s\-](\d{4})[\s\-](\d{4})[\s\-](\d{4})/g, '**** **** **** $4');
    }
    if (maskIp) {
      // IP: 192.168.1.100 -> 192.168.*.*
      result = result.replace(/(\d{1,3}\.\d{1,3})\.\d{1,3}\.\d{1,3}/g, '$1.*.*');
    }

    return result;
  };

  const maskedLgpdOutput = maskLgpdData(lgpdInput);

  // =========================================================================
  // ABA 5: DETECTOR E LIMPADOR DE CARACTERES OCULTOS / ZERO-WIDTH
  // =========================================================================
  const [hiddenCharText, setHiddenCharText] = useState<string>(
    'Texto com zero-width\u200Bspace oculto e non-breaking\u00A0space inserido aqui.'
  );

  const analyzeHiddenChars = (str: string) => {
    const hiddenList: Array<{ index: number; name: string; unicode: string }> = [];

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code === 0x200B) hiddenList.push({ index: i, name: 'Zero-Width Space', unicode: '\\u200B' });
      else if (code === 0x200C) hiddenList.push({ index: i, name: 'Zero-Width Non-Joiner', unicode: '\\u200C' });
      else if (code === 0x200D) hiddenList.push({ index: i, name: 'Zero-Width Joiner', unicode: '\\u200D' });
      else if (code === 0xFEFF) hiddenList.push({ index: i, name: 'Byte Order Mark (BOM)', unicode: '\\uFEFF' });
      else if (code === 0x00A0) hiddenList.push({ index: i, name: 'Non-Breaking Space (NBSP)', unicode: '\\u00A0' });
      else if (code === 0x202E) hiddenList.push({ index: i, name: 'Right-to-Left Override (RTL)', unicode: '\\u202E' });
    }

    return hiddenList;
  };

  const hiddenCharsFound = analyzeHiddenChars(hiddenCharText);

  const cleanHiddenChars = () => {
    // Remove caracteres zero-width, BOM, RTL overrides e converte NBSP para espaço regular
    const cleaned = hiddenCharText
      .replace(/[\u200B\u200C\u200D\uFEFF\u202E\u202D]/g, '')
      .replace(/\u00A0/g, ' ');
    setHiddenCharText(cleaned);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Code className="w-4 h-4" />
            <span>Capitania #11 · Suíte de Regex, Tokens IA & Manipulação Lexical</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Engenharia Lexical, Regex & Tokens de LLM
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              100% Client-Side
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Testador visual de regex com lookaround, estimador de tokens de LLM e custos, conversor de naming cases, mascarador LGPD e detector de caracteres ocultos.
          </p>
        </div>

        {/* Status / Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>Regex Engine · cl100k</span>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('regex-lookaround')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'regex-lookaround'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Regex & Lookaround</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-token-counter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ai-token-counter'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Contador de Tokens IA & Custos</span>
        </button>

        <button
          onClick={() => setActiveTab('naming-case-converter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'naming-case-converter'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Conversor Naming Cases</span>
        </button>

        <button
          onClick={() => setActiveTab('lgpd-data-masker')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'lgpd-data-masker'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Anonimizador LGPD / Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('hidden-char-detector')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'hidden-char-detector'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Caracteres Ocultos (Zero-Width)</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pt-6">
        {/* =================================================================== */}
        {/* ABA 1: REGEX COM LOOKAROUND & GRUPOS */}
        {/* =================================================================== */}
        {activeTab === 'regex-lookaround' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs de Regex */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Expressão Regular & Flags:
                  </span>
                  {/* Presets Rápidos */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => loadRegexPreset('(?<=R\\$\\s?)\\d+([.,]\\d{2})?', 'g', 'Valor total: R$ 149,90 e desconto de R$ 25,00.')}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white"
                    >
                      Preços (Lookbehind)
                    </button>
                    <button
                      onClick={() => loadRegexPreset('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', '', 'SenhaForte@2026')}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white"
                    >
                      Senha Forte
                    </button>
                    <button
                      onClick={() => loadRegexPreset('\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}', 'g', 'Lista de CPFs: 123.456.789-00 e 98765432100.')}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white"
                    >
                      CPF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-9">
                    <input
                      type="text"
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      placeholder="Digite a expressão regular (ex: (?<=foo)bar)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={regexFlags}
                      onChange={(e) => setRegexFlags(e.target.value)}
                      placeholder="flags (g, i, m)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Texto de Teste:</label>
                  <textarea
                    rows={5}
                    value={regexTestText}
                    onChange={(e) => setRegexTestText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Resultados e Correspondências */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Status da Execução:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${regexResult.valid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {regexResult.valid ? `${regexResult.count} Correspondência(s)` : 'Erro de Sintaxe'}
                    </span>
                  </div>

                  {!regexResult.valid && (
                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs font-mono text-rose-300">
                      {regexResult.error}
                    </div>
                  )}

                  {/* Lista de Matches com Grupos de Captura */}
                  {regexResult.valid && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {regexResult.matches.length === 0 ? (
                        <div className="text-xs font-mono text-slate-500 text-center py-6">
                          Nenhuma correspondência encontrada para o padrão.
                        </div>
                      ) : (
                        regexResult.matches.map((m, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs font-mono">
                            <div className="flex justify-between items-center text-slate-400 text-[11px]">
                              <span>Match #{idx + 1} (Posição {m.index}):</span>
                              <span className="text-emerald-400 font-bold">"{m.fullMatch}"</span>
                            </div>
                            {m.groups.length > 0 && (
                              <div className="pt-1 text-[10px] text-slate-500">
                                Grupos: {m.groups.map((g, gi) => `G${gi + 1}: "${g}"`).join(' | ')}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: CONTADOR DE TOKENS IA & CUSTOS */}
        {/* =================================================================== */}
        {activeTab === 'ai-token-counter' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Texto ou Prompt para Análise:
                </span>

                <textarea
                  rows={7}
                  value={tokenText}
                  onChange={(e) => setTokenText(e.target.value)}
                  placeholder="Cole aqui seu prompt, código-fonte ou texto..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Selecione o Modelo de IA:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAiModel('gpt4o')}
                      className={`p-2 rounded-lg text-xs font-mono transition text-left cursor-pointer border ${
                        aiModel === 'gpt4o' ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>OpenAI GPT-4o</div>
                      <div className="text-[10px] text-slate-500 font-normal">$2.50 / M tokens</div>
                    </button>

                    <button
                      onClick={() => setAiModel('claude35')}
                      className={`p-2 rounded-lg text-xs font-mono transition text-left cursor-pointer border ${
                        aiModel === 'claude35' ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Claude 3.5 Sonnet</div>
                      <div className="text-[10px] text-slate-500 font-normal">$3.00 / M tokens</div>
                    </button>

                    <button
                      onClick={() => setAiModel('gemini15')}
                      className={`p-2 rounded-lg text-xs font-mono transition text-left cursor-pointer border ${
                        aiModel === 'gemini15' ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Gemini 1.5 Pro</div>
                      <div className="text-[10px] text-slate-500 font-normal">$1.25 / M tokens</div>
                    </button>

                    <button
                      onClick={() => setAiModel('llama3')}
                      className={`p-2 rounded-lg text-xs font-mono transition text-left cursor-pointer border ${
                        aiModel === 'llama3' ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>Meta Llama 3.1 70B</div>
                      <div className="text-[10px] text-slate-500 font-normal">$0.60 / M tokens</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Estatísticas e Custos */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Tokens Estimados:</span>
                    <span className="text-cyan-400 font-bold font-mono">{modelInfo.contextWindow}</span>
                  </div>

                  <div className="text-4xl font-black font-mono text-white">
                    {estimatedTokens.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">tokens</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Caracteres:</span>
                      <span className="text-slate-200 font-bold">{charCount.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Palavras:</span>
                      <span className="text-slate-200 font-bold">{wordCount.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Linhas:</span>
                      <span className="text-slate-200 font-bold">{lineCount}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Custo de Entrada (Input Prompt):</span>
                    <span className="text-emerald-400 font-bold">${inputCostUsd.toFixed(6)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: CONVERSOR DE CONVENÇÕES DE NOMENCLATURA */}
        {/* =================================================================== */}
        {activeTab === 'naming-case-converter' && (
          <div className="space-y-6">
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <label className="block text-xs font-mono text-cyan-400 font-bold mb-1">
                Identificador Original:
              </label>
              <input
                type="text"
                value={namingInput}
                onChange={(e) => setNamingInput(e.target.value)}
                placeholder="Digite a variável ou texto em qualquer formato"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Grid de Formatos Gerados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(cases).map(([caseName, value]) => (
                <div key={caseName} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      {caseName.replace('_', ' ')}:
                    </span>
                    <div className="text-xs font-mono text-cyan-300 font-bold break-all mt-1">
                      {value}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value, caseName)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
                  >
                    {copiedId === caseName ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === caseName ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: ANONIMIZADOR LGPD / LOGS */}
        {/* =================================================================== */}
        {activeTab === 'lgpd-data-masker' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Log Original com Dados Sensíveis:
                </span>

                <textarea
                  rows={6}
                  value={lgpdInput}
                  onChange={(e) => setLgpdInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />

                {/* Filtros de Mascaramento */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maskCpf} onChange={(e) => setMaskCpf(e.target.checked)} className="rounded bg-slate-900 text-cyan-500" />
                    <span>Mascarar CPF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maskEmail} onChange={(e) => setMaskEmail(e.target.checked)} className="rounded bg-slate-900 text-cyan-500" />
                    <span>Mascarar E-mail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maskPhone} onChange={(e) => setMaskPhone(e.target.checked)} className="rounded bg-slate-900 text-cyan-500" />
                    <span>Mascarar Celular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maskCard} onChange={(e) => setMaskCard(e.target.checked)} className="rounded bg-slate-900 text-cyan-500" />
                    <span>Mascarar Cartões</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maskIp} onChange={(e) => setMaskIp(e.target.checked)} className="rounded bg-slate-900 text-cyan-500" />
                    <span>Mascarar Endereço IP</span>
                  </label>
                </div>
              </div>

              {/* Resultado Anonimizado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Texto Higienizado (LGPD / GDPR):</span>
                  <button
                    onClick={() => copyToClipboard(maskedLgpdOutput, 'lgpd-copy')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition cursor-pointer"
                  >
                    {copiedId === 'lgpd-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'lgpd-copy' ? 'Copiado!' : 'Copiar Seguro'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 select-all leading-relaxed whitespace-pre-wrap min-h-[160px]">
                  {maskedLgpdOutput}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: DETECTOR DE CARACTERES OCULTOS */}
        {/* =================================================================== */}
        {activeTab === 'hidden-char-detector' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Insira o Código ou Texto com Possíveis Caracteres Ocultos:
                </span>

                <textarea
                  rows={6}
                  value={hiddenCharText}
                  onChange={(e) => setHiddenCharText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />

                <button
                  onClick={cleanHiddenChars}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition cursor-pointer hover:bg-cyan-400 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Higienizar e Remover Todos os Caracteres Invisíveis</span>
                </button>
              </div>

              {/* Diagnóstico de Ocorrências Ocultas */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Diagnóstico Lexical Unicode:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${hiddenCharsFound.length === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {hiddenCharsFound.length === 0 ? 'Texto Limpo (Zero Ocultos)' : `${hiddenCharsFound.length} Caractere(s) Invisível(is)`}
                    </span>
                  </div>

                  {hiddenCharsFound.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {hiddenCharsFound.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-400 font-bold">{item.name}</span>
                          <span className="text-slate-400">{item.unicode} (Índice {item.index})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-500 text-center py-6">
                      Nenhum caractere invisível, BOM ou zero-width detectado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
