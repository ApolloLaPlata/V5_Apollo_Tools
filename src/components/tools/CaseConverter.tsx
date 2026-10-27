'use client';

import React, { useState } from 'react';
import { Copy, Check, Trash2, CaseSensitive } from 'lucide-react';

export function CaseConverter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const toUpper = () => setText(text.toUpperCase());
  const toLower = () => setText(text.toLowerCase());
  const toTitle = () => {
    setText(text.toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase()));
  };
  const toInvert = () => {
    setText(text.split('').reverse().join(''));
  };
  const toSlug = () => {
    const slug = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setText(slug);
  };

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
            <CaseSensitive className="w-5 h-5 text-purple-400" />
            <span>Transformador de Caixa Alta & Baixa</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Converta maiúsculas, minúsculas, slug de URL e texto invertido em 1 clique.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cole seu texto aqui e clique nos botões abaixo para transformar..."
        rows={5}
        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-sans text-sm resize-y"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toUpper}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-xs font-bold text-white transition cursor-pointer"
        >
          MAIÚSCULAS
        </button>
        <button
          onClick={toLower}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-xs font-bold text-white transition cursor-pointer"
        >
          minúsculas
        </button>
        <button
          onClick={toTitle}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-xs font-bold text-white transition cursor-pointer"
        >
          Primeira Letra Maiúscula
        </button>
        <button
          onClick={toSlug}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-xs font-bold text-white transition cursor-pointer"
        >
          slug-de-url
        </button>
        <button
          onClick={toInvert}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-xs font-bold text-white transition cursor-pointer"
        >
          otxeT retrevnI
        </button>
        <button
          onClick={() => setText('')}
          className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-bold text-red-300 transition cursor-pointer ml-auto"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
