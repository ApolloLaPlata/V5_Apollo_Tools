'use client';

import React, { useState } from 'react';
import { ListFilter, Copy, Check, Trash2, ArrowDownAZ, ArrowUpAZ, Sparkles, Download } from 'lucide-react';

export function LineCleaner() {
  const [inputText, setInputText] = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute processed lines
  const processText = () => {
    if (!inputText) return '';
    let lines = inputText.split(/\r?\n/);

    if (trimWhitespace) {
      lines = lines.map((l) => l.trim());
    }

    if (removeEmptyLines) {
      lines = lines.filter((l) => l.length > 0);
    }

    if (removeDuplicates) {
      lines = Array.from(new Set(lines));
    }

    if (sortOrder === 'asc') {
      lines.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    } else if (sortOrder === 'desc') {
      lines.sort((a, b) => b.localeCompare(a, 'pt-BR', { sensitivity: 'base' }));
    }

    if (prefix || suffix) {
      lines = lines.map((l) => `${prefix}${l}${suffix}`);
    }

    return lines.join('\n');
  };

  const processed = processText();

  const originalCount = inputText ? inputText.split(/\r?\n/).length : 0;
  const processedCount = processed ? processed.split(/\r?\n/).length : 0;
  const removedCount = Math.max(0, originalCount - processedCount);

  const handleCopy = () => {
    if (!processed) return;
    navigator.clipboard.writeText(processed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!processed) return;
    const blob = new Blob([processed], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lista-limpa-v5.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Limpador de Linhas & Duplicatas
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Padrão Invertexto
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Remova duplicatas, elimine linhas em branco, adicione prefixos/sufixos e ordene listas em milissegundos.
            </p>
          </div>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
            Original: <strong className="text-slate-200">{originalCount}</strong>
          </span>
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
            Final: <strong className="text-cyan-400">{processedCount}</strong>
          </span>
          {removedCount > 0 && (
            <span className="px-3 py-1 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300">
              Removidas: <strong>-{removedCount}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Options Toolbar */}
      <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800/60 rounded-xl flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
          <input
            type="checkbox"
            checked={removeDuplicates}
            onChange={(e) => setRemoveDuplicates(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
          />
          Remover Linhas Duplicadas
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
          <input
            type="checkbox"
            checked={removeEmptyLines}
            onChange={(e) => setRemoveEmptyLines(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
          />
          Remover Linhas Vazias
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
          />
          Remover Espaços Extras (Trim)
        </label>

        {/* Sort order buttons */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-4">
          <span className="text-[11px] font-mono text-slate-500 mr-1">Ordem:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1 border transition-all ${
              sortOrder === 'asc'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <ArrowDownAZ className="w-3.5 h-3.5" /> A-Z
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1 border transition-all ${
              sortOrder === 'desc'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <ArrowUpAZ className="w-3.5 h-3.5" /> Z-A
          </button>
        </div>

        {/* Prefix / Suffix inputs */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <input
            type="text"
            placeholder="Prefixo (ex: - )"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <input
            type="text"
            placeholder="Sufixo (ex: ,)"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Inputs / Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between pb-1.5 text-xs font-mono text-slate-400">
            <span>Texto Original:</span>
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Cole aqui sua lista de e-mails, palavras, IDs, linhas com espaços ou duplicatas..."
            className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between pb-1.5 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Resultado Limpo:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!processed}
                className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Baixar .txt
              </button>
              <button
                onClick={handleCopy}
                disabled={!processed}
                className="px-2.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={processed}
            placeholder="O resultado limpo, sem duplicatas e ordenado aparecerá aqui instantaneamente..."
            className="w-full h-64 bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
