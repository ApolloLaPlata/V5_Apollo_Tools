'use client';

import React, { useState, useMemo } from 'react';
import { Type, Sparkles, Copy, Check, ArrowRightLeft, Search, Layers, RefreshCw } from 'lucide-react';

export function TextManipulatorSuite({ defaultTab = 'fontes' }: { defaultTab?: 'fontes' | 'flip' | 'diff' | 'replace' | 'acentos' | 'lorem' }) {
  const [activeTab, setActiveTab] = useState<'fontes' | 'flip' | 'diff' | 'replace' | 'acentos' | 'lorem'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // States
  const [baseText, setBaseText] = useState('Texto de Exemplo');
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Lorem State
  const [loremType, setLoremType] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs');
  const [loremCount, setLoremCount] = useState(3);

  // Diff state
  const [diffTextA, setDiffTextA] = useState('Primeira linha\nSegunda linha original\nTerceira linha');
  const [diffTextB, setDiffTextB] = useState('Primeira linha\nSegunda linha alterada\nTerceira linha');

  // --- MAPAS DE CARACTERES UNICODE ---
  const FONT_MAPS: Record<string, { label: string; transform: (s: string) => string }> = {
    bold: {
      label: 'Negrito Serif (𝐁𝐨𝐥𝐝)',
      transform: (text) => {
        const offsetUpper = 0x1D400 - 65;
        const offsetLower = 0x1D41A - 97;
        return text.split('').map(c => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
          if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
          return c;
        }).join('');
      }
    },
    italic: {
      label: 'Itálico (𝘐𝘵𝘢𝘭𝘪𝘤)',
      transform: (text) => {
        const offsetUpper = 0x1D608 - 65;
        const offsetLower = 0x1D622 - 97;
        return text.split('').map(c => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
          if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
          return c;
        }).join('');
      }
    },
    script: {
      label: 'Cursiva Elegante (𝓒𝓾𝓻𝓼𝓲𝓿𝓪)',
      transform: (text) => {
        const scriptUpper = '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩';
        const scriptLower = '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔩';
        return text.split('').map(c => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return scriptUpper[code - 65] || c;
          if (code >= 97 && code <= 122) return scriptLower[code - 97] || c;
          return c;
        }).join('');
      }
    },
    fraktur: {
      label: 'Gótica / Fraktur (𝔊ó𝔱𝔦𝔠𝔞)',
      transform: (text) => {
        const frakturUpper = '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ';
        const frakturLower = '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷';
        return text.split('').map(c => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return frakturUpper[code - 65] || c;
          if (code >= 97 && code <= 122) return frakturLower[code - 97] || c;
          return c;
        }).join('');
      }
    },
    mono: {
      label: 'Monospace Código (𝙼𝚘𝚗𝚘)',
      transform: (text) => {
        const offsetUpper = 0x1D670 - 65;
        const offsetLower = 0x1D68A - 97;
        return text.split('').map(c => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
          if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
          return c;
        }).join('');
      }
    },
    circled: {
      label: 'Letras Circuladas (Ⓒⓘⓡⓒⓛⓔ)',
      transform: (text) => {
        return text.split('').map(c => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x24B6 - 65);
          if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x24D0 - 97);
          return c;
        }).join('');
      }
    }
  };

  // --- UPSIDE DOWN / FLIP MAP ---
  const FLIP_MAP: Record<string, string> = {
    a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
    k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
    u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
    A: '∀', B: '𐐒', C: 'Ɔ', D: '◖', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ',
    K: 'ʞ', L: '⅂', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥',
    U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
    '?': '¿', '!': '¡', '.': '˙', ',': "'", "'": ',', '"': ',,', '(': ')', ')': '(',
    '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾'
  };

  const flippedText = useMemo(() => {
    return baseText
      .split('')
      .reverse()
      .map(char => FLIP_MAP[char] || char)
      .join('');
  }, [baseText]);

  // --- REMOVER ACENTOS ---
  const textWithoutAccents = useMemo(() => {
    return baseText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }, [baseText]);

  // --- LOCALIZAR E SUBSTITUIR ---
  const replacedText = useMemo(() => {
    if (!findWord) return baseText;
    const flags = caseSensitive ? 'g' : 'gi';
    try {
      const regex = new RegExp(findWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      return baseText.replace(regex, replaceWord);
    } catch {
      return baseText;
    }
  }, [baseText, findWord, replaceWord, caseSensitive]);

  // --- DIFF VISUAL COMPUTED ---
  const diffLines = useMemo(() => {
    const linesA = diffTextA.split(/\r?\n/);
    const linesB = diffTextB.split(/\r?\n/);
    const max = Math.max(linesA.length, linesB.length);
    const result: { lineNum: number; textA: string; textB: string; type: 'same' | 'diff' }[] = [];

    for (let i = 0; i < max; i++) {
      const a = linesA[i] || '';
      const b = linesB[i] || '';
      result.push({
        lineNum: i + 1,
        textA: a,
        textB: b,
        type: a === b ? 'same' : 'diff'
      });
    }
    return result;
  }, [diffTextA, diffTextB]);

  // --- LOREM IPSUM GENERATOR ---
  const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
    'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
    'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
    'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
    'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
    'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generatedLorem = useMemo(() => {
    const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    
    if (loremType === 'words') {
      const words = Array.from({ length: loremCount }, getRandomWord);
      return words.join(' ');
    }
    
    const generateSentence = () => {
      const len = Math.floor(Math.random() * 8) + 6;
      const words = Array.from({ length: len }, getRandomWord);
      return capitalize(words.join(' ')) + '.';
    };
    
    if (loremType === 'sentences') {
      return Array.from({ length: loremCount }, generateSentence).join(' ');
    }
    
    const paras: string[] = [];
    for (let p = 0; p < loremCount; p++) {
      const sentCount = Math.floor(Math.random() * 3) + 4;
      const sentences = Array.from({ length: sentCount }, generateSentence);
      if (p === 0) {
        paras.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + sentences.slice(1).join(' '));
      } else {
        paras.push(sentences.join(' '));
      }
    }
    return paras.join('\n\n');
  }, [loremType, loremCount]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Purple Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Type className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Manipulação de Texto & Fontes Especiais
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              INVERTEXTO BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Letras personalizadas para bio, texto de ponta cabeça, comparador de textos (diff) e substituidor em massa.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'fontes', label: 'Letras Diferentes (Fontes)' },
          { id: 'flip', label: 'De Cabeça para Baixo' },
          { id: 'diff', label: 'Comparador de Textos (Diff)' },
          { id: 'replace', label: 'Localizar & Substituir' },
          { id: 'acentos', label: 'Remover Acentos' },
          { id: 'lorem', label: 'Gerador Lorem Ipsum' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: FONTES DIFERENTES */}
      {activeTab === 'fontes' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Digite o texto para transformar:</label>
            <input
              type="text"
              value={baseText}
              onChange={(e) => setBaseText(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {Object.entries(FONT_MAPS).map(([key, item]) => {
              const res = item.transform(baseText || 'Exemplo');
              return (
                <div key={key} className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 transition">
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">{item.label}</span>
                    <span className="text-sm text-slate-100 truncate block select-all">{res}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(res, key)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                  >
                    {copiedKey === key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA: DE CABEÇA PARA BAIXO */}
      {activeTab === 'flip' && (
        <div className="space-y-4">
          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            placeholder="Digite aqui o texto que deseja virar de ponta cabeça..."
            className="w-full h-28 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
          />

          <div className="p-4 bg-slate-950/90 border border-purple-500/30 rounded-2xl relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-400">Texto Invertido de Ponta Cabeça</span>
              <button
                onClick={() => copyToClipboard(flippedText, 'flip')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'flip' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'flip' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-base font-mono text-purple-200 select-all break-all">{flippedText}</p>
          </div>
        </div>
      )}

      {/* ABA: DIFF COMPARADOR */}
      {activeTab === 'diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">Texto Original (A)</span>
              <textarea
                value={diffTextA}
                onChange={(e) => setDiffTextA(e.target.value)}
                className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">Texto Modificado (B)</span>
              <textarea
                value={diffTextB}
                onChange={(e) => setDiffTextB(e.target.value)}
                className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 font-mono text-xs max-h-60 overflow-y-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 font-sans">Resultado da Comparação Linha a Linha:</span>
            {diffLines.map((line, idx) => (
              <div
                key={idx}
                className={`p-1.5 rounded-lg flex items-center justify-between gap-4 ${
                  line.type === 'diff'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                    : 'text-slate-400'
                }`}
              >
                <span className="text-[10px] text-slate-600 font-bold shrink-0">L{line.lineNum}</span>
                <span className="truncate flex-1">{line.textA || '<vazio>'}</span>
                <span className="text-slate-600 shrink-0">➔</span>
                <span className="truncate flex-1 font-bold">{line.textB || '<vazio>'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA: LOCALIZAR E SUBSTITUIR */}
      {activeTab === 'replace' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Localizar Termo:</label>
              <input
                type="text"
                value={findWord}
                onChange={(e) => setFindWord(e.target.value)}
                placeholder="Palavra a ser substituída..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Substituir Por:</label>
              <input
                type="text"
                value={replaceWord}
                onChange={(e) => setReplaceWord(e.target.value)}
                placeholder="Novo termo..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            placeholder="Cole aqui o texto completo para substituição..."
            className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
          />

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Texto Substituído</span>
              <button
                onClick={() => copyToClipboard(replacedText, 'replace')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'replace' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'replace' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-slate-200 select-all whitespace-pre-wrap">{replacedText}</p>
          </div>
        </div>
      )}

      {/* ABA: REMOVER ACENTOS */}
      {activeTab === 'acentos' && (
        <div className="space-y-4">
          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            placeholder="Cole aqui o texto com acentuação e caracteres especiais..."
            className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
          />

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Texto Sem Acentos</span>
              <button
                onClick={() => copyToClipboard(textWithoutAccents, 'sem-acentos')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'sem-acentos' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'sem-acentos' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs font-mono text-slate-200 select-all whitespace-pre-wrap">{textWithoutAccents}</p>
          </div>
        </div>
      )}

      {/* ABA: LOREM IPSUM */}
      {activeTab === 'lorem' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-4 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Gerar por:</span>
              {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLoremType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${
                    loremType === t
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {t === 'paragraphs' ? 'Parágrafos' : t === 'sentences' ? 'Frases' : 'Palavras'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-bold text-slate-400">Quantidade:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={loremCount}
                onChange={(e) => setLoremCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white text-center focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Texto Dummy Gerado</span>
              <button
                onClick={() => copyToClipboard(generatedLorem, 'lorem')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'lorem' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'lorem' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-slate-200 select-all whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-2">
              {generatedLorem}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
