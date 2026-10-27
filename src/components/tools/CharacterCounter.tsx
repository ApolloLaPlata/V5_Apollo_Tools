'use client';

import React, { useState } from 'react';
import { Copy, Check, Trash2, Clock, Volume2, Type } from 'lucide-react';

export function CharacterCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lineCount = text === '' ? 0 : text.split('\n').length;
  const paragraphCount = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(Boolean).length;

  // Média de leitura: 200 palavras por minuto
  const readingTimeMin = Math.ceil(wordCount / 200) || 1;
  // Média de fala/locução: 130 palavras por minuto (~2.1 palavras por segundo)
  const speechTimeSec = Math.round((wordCount / 130) * 60);

  const handleCopy = () => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-cyan-400" />
            <span>Contador de Caracteres & Palavras</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Estatísticas instantâneas em tempo real sem envio para nenhum servidor externo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setText('')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Limpar texto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cole ou digite seu texto aqui para calcular caracteres, palavras e tempo de locução..."
        rows={6}
        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans text-sm resize-y"
      />

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Caracteres</span>
          <span className="text-xl font-black text-cyan-400 mt-0.5 block">{charCount.toLocaleString('pt-BR')}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Sem Espaços</span>
          <span className="text-xl font-black text-white mt-0.5 block">{charNoSpaces.toLocaleString('pt-BR')}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Palavras</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5 block">{wordCount.toLocaleString('pt-BR')}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Linhas</span>
          <span className="text-xl font-black text-white mt-0.5 block">{lineCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Leitura
          </span>
          <span className="text-sm font-bold text-slate-200 mt-1 block">~{wordCount === 0 ? 0 : readingTimeMin} min</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-amber-400" /> Fala (V5 Sound)
          </span>
          <span className="text-sm font-bold text-amber-300 mt-1 block">~{speechTimeSec}s</span>
        </div>
      </div>
    </div>
  );
}
