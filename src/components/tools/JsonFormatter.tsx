'use client';

import React, { useState } from 'react';
import { FileCode, Copy, Check, Trash2, Download, Minimize2, Maximize2, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

export function JsonFormatter() {
  const [inputJson, setInputJson] = useState('');
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ originalSize: number; currentSize: number } | null>(null);

  const sampleJson = {
    projeto: 'V5 Apollo Tools',
    capitania: 11,
    status: 'operacional',
    features: [
      'Validador CPF/CNPJ',
      'Mock QA Pessoas',
      'Formatador JSON',
      'Workflows ComfyUI'
    ],
    config: {
      clientSideFirst: true,
      portaLocal: 3009,
      gpuBackend: 'V5_APOLLO_API'
    }
  };

  const handleFormat = (spaces: 2 | 4) => {
    setIndentSize(spaces);
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, spaces);
      setInputJson(formatted);
      setError(null);
      setStats({
        originalSize: new Blob([inputJson]).size,
        currentSize: new Blob([formatted]).size
      });
    } catch (err: any) {
      setError(err.message || 'JSON inválido');
    }
  };

  const handleMinify = () => {
    if (!inputJson.trim()) return;
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setInputJson(minified);
      setError(null);
      setStats({
        originalSize: new Blob([inputJson]).size,
        currentSize: new Blob([minified]).size
      });
    } catch (err: any) {
      setError(err.message || 'JSON inválido');
    }
  };

  const handleLoadSample = () => {
    const formatted = JSON.stringify(sampleJson, null, indentSize);
    setInputJson(formatted);
    setError(null);
    setStats({
      originalSize: new Blob([formatted]).size,
      currentSize: new Blob([formatted]).size
    });
  };

  const handleCopy = () => {
    if (!inputJson) return;
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(inputJson).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!inputJson) return;
    const blob = new Blob([inputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payload_${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Emerald Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Formatador, Validador & Minificador de JSON
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              4DEVS BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Validação sintática estrita com apontamento de erros, indentação padrão e minificação de payloads para APIs.
          </p>
        </div>

        {/* Toolbar de Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSample}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:text-white text-slate-400 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Exemplo
          </button>
          <button
            onClick={() => handleFormat(2)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            2 Espaços
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            4 Espaços
          </button>
          <button
            onClick={handleMinify}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minificar
          </button>
          <button
            onClick={handleDownload}
            disabled={!inputJson}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 disabled:opacity-30 transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
          <button
            onClick={handleCopy}
            disabled={!inputJson}
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-30 shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Alerta de Validação / Erro */}
      {error && (
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Erro de Sintaxe no JSON:</strong>
            <span className="font-mono text-[11px]">{error}</span>
          </div>
        </div>
      )}

      {stats && !error && (
        <div className="mb-4 flex items-center justify-between px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            JSON Válido & Estruturado
          </span>
          <span className="font-mono text-slate-300 text-[11px]">
            Tamanho: <strong className="text-white">{stats.currentSize} bytes</strong>
            {stats.originalSize !== stats.currentSize && (
              <span className="text-cyan-400 ml-1">
                ({Math.round(((stats.currentSize - stats.originalSize) / stats.originalSize) * 100)}%)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Editor Principal */}
      <div className="relative">
        <textarea
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            try {
              if (e.target.value.trim()) {
                JSON.parse(e.target.value);
                setError(null);
              }
            } catch (err: any) {
              setError(err.message);
            }
          }}
          placeholder="Cole aqui seu JSON para validar, formatar ou minificar..."
          className="w-full h-80 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition"
        />

        {inputJson && (
          <button
            onClick={() => {
              setInputJson('');
              setError(null);
              setStats(null);
            }}
            className="absolute bottom-4 right-4 text-xs text-rose-400 hover:text-rose-300 p-2 rounded-xl bg-slate-900/80 border border-slate-800 transition cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
      </div>
    </div>
  );
}
