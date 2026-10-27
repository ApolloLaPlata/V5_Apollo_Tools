'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileCode2, 
  GitCompare, 
  Binary, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Upload, 
  Download, 
  Eye, 
  Layers, 
  RotateCcw,
  Table
} from 'lucide-react';

export type DataDevFormatsTab = 'csv-json-sql' | 'markdown-preview' | 'base64-file' | 'xml-beautifier' | 'side-by-side-diff';

export function DataAndDevFormatsSuite({ defaultTab = 'csv-json-sql' }: { defaultTab?: DataDevFormatsTab }) {
  const [activeTab, setActiveTab] = useState<DataDevFormatsTab>(defaultTab);
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
  // TAB 1: CONVERSOR CSV <-> JSON & SQL INSERTS
  // ==========================================
  const DEFAULT_CSV = `id,nome,cargo,cidade,salario
1,Vinicius Miranda,Arquiteto de Software,Goiania,15000.00
2,Apollo La Plata,Lead Criativo & AI,Buenos Aires,14200.00
3,Agente Observer,Engenheiro de RAG,Sao Paulo,12500.00
4,ComfyUI Runner,Especialista em GPU,Modal H100,18000.00`;

  const [csvInput, setCsvInput] = useState<string>(DEFAULT_CSV);
  const [tableName, setTableName] = useState<string>('equipe_v5');
  const [csvOutputMode, setCsvOutputMode] = useState<'json' | 'sql'>('json');
  const [csvResult, setCsvResult] = useState<string>('');

  const processCsv = (csv: string, mode: 'json' | 'sql', table: string) => {
    try {
      const lines = csv.trim().split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) return '// Insira ao menos um cabeçalho e uma linha de dados.';

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows = lines.slice(1).map((line) => {
        return line.split(',').map((val) => val.trim().replace(/^["']|["']$/g, ''));
      });

      if (mode === 'json') {
        const jsonArr = rows.map((row) => {
          const obj: any = {};
          headers.forEach((h, idx) => {
            const rawVal = row[idx] || '';
            obj[h] = !isNaN(Number(rawVal)) && rawVal !== '' ? Number(rawVal) : rawVal;
          });
          return obj;
        });
        return JSON.stringify(jsonArr, null, 2);
      } else {
        const columns = headers.join(', ');
        const inserts = rows.map((row) => {
          const formattedVals = row.map((v) => (!isNaN(Number(v)) && v !== '' ? v : `'${v.replace(/'/g, "''")}'`)).join(', ');
          return `INSERT INTO ${table} (${columns}) VALUES (${formattedVals});`;
        });
        return inserts.join('\n');
      }
    } catch {
      return '// Erro ao processar arquivo CSV.';
    }
  };

  useEffect(() => {
    setCsvResult(processCsv(csvInput, csvOutputMode, tableName));
  }, [csvInput, csvOutputMode, tableName]);

  // ==========================================
  // TAB 2: EDITOR & VISUALIZADOR DE MARKDOWN
  // ==========================================
  const DEFAULT_MD = `# 🚀 Holding V5 Apollo · Capitania #11
## Canivete Suíço de Produtividade & IA

Bem-vindo ao **V5 Apollo Tools**! Este editor suporta visualização em tempo real.

### Principais Pilares:
- **4Devs Benchmark:** Documentos, validações fiscais e dados mock.
- **Invertexto Benchmark:** Utilidades rápidas e manipulação de texto.
- **Nordy.ai ComfyUI:** Grafos e workflows para Modal H100.

> Soberania de dados: 100% de processamento local sem envio externo.

| Módulo | Status | Porta |
| :--- | :---: | :---: |
| V5 Tools | Ativo | 3009 |
| V5 API | Ativo | 8000 |`;

  const [mdInput, setMdInput] = useState<string>(DEFAULT_MD);

  const convertMarkdownToHtml = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-cyan-400 mt-3 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-100 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-white mt-2 mb-3 pb-2 border-b border-slate-800">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-cyan-300 font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-300">$1</em>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-cyan-500 pl-3 italic text-slate-400 my-2">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>');

    return html.replace(/\n/gim, '<br/>');
  };

  // ==========================================
  // TAB 3: CONVERSOR BASE64 DATA URI DE ARQUIVOS
  // ==========================================
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64FileName, setBase64FileName] = useState<string>('');
  const [base64FileSize, setBase64FileSize] = useState<string>('');

  const handleFileUploadBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBase64FileName(file.name);
    setBase64FileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setBase64Output(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // TAB 4: FORMATADOR & MINIFICADOR XML / SVG
  // ==========================================
  const DEFAULT_XML = `<note><to>Holding V5</to><from>Apollo Tools</from><heading>Status</heading><body>Capitania 11 100% Operacional</body></note>`;
  const [xmlInput, setXmlInput] = useState<string>(DEFAULT_XML);
  const [formattedXml, setFormattedXml] = useState<string>('');

  const formatXml = (xml: string) => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    xml = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
    const lines = xml.split('\r\n');

    lines.forEach((line) => {
      let isClosing = line.match(/^<\//);
      let isSelfClosing = line.match(/\/>$/);

      if (isClosing) indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + line + '\n';
      if (!isClosing && !isSelfClosing && line.match(/^<[^?]/)) {
        indent++;
      }
    });

    return formatted.trim();
  };

  useEffect(() => {
    setFormattedXml(formatXml(xmlInput));
  }, [xmlInput]);

  // ==========================================
  // TAB 5: COMPARADOR VISUAL DE CÓDIGO (DIFF)
  // ==========================================
  const DEFAULT_ORIGINAL = `function calcularTotal(preco, qtd) {
  var total = preco * qtd;
  return total;
}`;

  const DEFAULT_MODIFIED = `function calcularTotal(preco, qtd, desconto = 0) {
  const subtotal = preco * qtd;
  const total = subtotal - desconto;
  return Math.max(0, total);
}`;

  const [origCode, setOrigCode] = useState<string>(DEFAULT_ORIGINAL);
  const [modCode, setModCode] = useState<string>(DEFAULT_MODIFIED);

  const getDiffLines = () => {
    const origLines = origCode.split('\n');
    const modLines = modCode.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);
    const diff = [];

    for (let i = 0; i < maxLen; i++) {
      const o = origLines[i] || '';
      const m = modLines[i] || '';
      const isSame = o === m;
      diff.push({ orig: o, mod: m, isSame, lineNum: i + 1 });
    }
    return diff;
  };

  const diffLines = getDiffLines();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Suíte de Dados, Conversão de Formatos & Dev QA
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            CSV para JSON/SQL, Markdown Live, Base64 & Code Diff
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Utilitários rápidos de transformação estruturada de dados, inspeção de código e renderização.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('csv-json-sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'csv-json-sql'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>CSV -&gt; JSON/SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown-preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'markdown-preview'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Live</span>
          </button>

          <button
            onClick={() => setActiveTab('base64-file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'base64-file'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Base64 Data URI</span>
          </button>

          <button
            onClick={() => setActiveTab('xml-beautifier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'xml-beautifier'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>XML Beautifier</span>
          </button>

          <button
            onClick={() => setActiveTab('side-by-side-diff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'side-by-side-diff'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Code Diff</span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6 relative z-10">
        {/* ========================================================= */}
        {/* TAB 1: CSV -> JSON / SQL INSERTS                          */}
        {/* ========================================================= */}
        {activeTab === 'csv-json-sql' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold">Modo de Exportação:</span>
                <button
                  onClick={() => setCsvOutputMode('json')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                    csvOutputMode === 'json'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  JSON Estruturado
                </button>
                <button
                  onClick={() => setCsvOutputMode('sql')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                    csvOutputMode === 'sql'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  SQL INSERTs
                </button>
              </div>

              {csvOutputMode === 'sql' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Tabela SQL:</span>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-bold block">Cole seus Dados em CSV:</span>
                <textarea
                  rows={10}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Resultado ({csvOutputMode.toUpperCase()}):
                  </span>
                  <button
                    onClick={() => copyToClipboard(csvResult, 'csv-out')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'csv-out' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-[220px]">
                  {csvResult}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MARKDOWN LIVE PREVIEW                              */}
        {/* ========================================================= */}
        {activeTab === 'markdown-preview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-bold block">Editor Markdown (.md):</span>
                <textarea
                  rows={12}
                  value={mdInput}
                  onChange={(e) => setMdInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">Pré-visualização Renderizada:</span>
                  <button
                    onClick={() => copyToClipboard(mdInput, 'md')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'md' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Markdown</span>
                  </button>
                </div>
                <div
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 min-h-[260px] max-h-[320px] overflow-y-auto text-xs font-sans leading-relaxed text-slate-200"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(mdInput) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BASE64 DATA URI DE ARQUIVOS                        */}
        {/* ========================================================= */}
        {activeTab === 'base64-file' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-8 text-center bg-slate-950/60 transition-all flex flex-col items-center justify-center">
              <Binary className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-xs font-bold text-slate-200">Selecione uma Imagem ou Arquivo para Codificar em Base64</h3>
              <label className="mt-3 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-xl cursor-pointer transition shadow-lg shadow-cyan-500/20">
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                Upload de Arquivo
                <input type="file" onChange={handleFileUploadBase64} className="hidden" />
              </label>
            </div>

            {base64Output && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    Arquivo: <strong className="text-white">{base64FileName}</strong> ({base64FileSize})
                  </span>
                  <button
                    onClick={() => copyToClipboard(base64Output, 'b64')}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono flex items-center gap-1 transition"
                  >
                    {copiedKey === 'b64' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Data URI</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={base64Output}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-cyan-400 select-all"
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: FORMATADOR XML / SVG                               */}
        {/* ========================================================= */}
        {activeTab === 'xml-beautifier' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-bold block">Código XML / SVG Bruto:</span>
                <textarea
                  rows={10}
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">XML Formatado & Indentado:</span>
                  <button
                    onClick={() => copyToClipboard(formattedXml, 'xml')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'xml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-[220px]">
                  {formattedXml}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SIDE-BY-SIDE CODE DIFF                             */}
        {/* ========================================================= */}
        {activeTab === 'side-by-side-diff' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 font-bold block">Código Original:</span>
                <textarea
                  rows={5}
                  value={origCode}
                  onChange={(e) => setOrigCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-300"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 font-bold block">Código Modificado:</span>
                <textarea
                  rows={5}
                  value={modCode}
                  onChange={(e) => setModCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-300"
                />
              </div>
            </div>

            {/* Visualizador Comparativo Linha a Linha */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-xs font-mono">
              <div className="grid grid-cols-2 bg-slate-900 border-b border-slate-800 p-2 text-slate-400 font-bold text-[11px]">
                <div>Versão Original</div>
                <div>Versão Modificada</div>
              </div>

              <div className="divide-y divide-slate-800/40 max-h-64 overflow-y-auto">
                {diffLines.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2">
                    <div
                      className={`p-1.5 px-3 border-r border-slate-800/60 truncate ${
                        !row.isSame ? 'bg-rose-950/30 text-rose-300' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600 mr-2 text-[10px]">{row.lineNum}</span>
                      {row.orig}
                    </div>
                    <div
                      className={`p-1.5 px-3 truncate ${
                        !row.isSame ? 'bg-emerald-950/30 text-emerald-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600 mr-2 text-[10px]">{row.lineNum}</span>
                      {row.mod}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
