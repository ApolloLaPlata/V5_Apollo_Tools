'use client';

import React, { useState, useMemo } from 'react';
import { 
  Type, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  Search, 
  Layers, 
  RefreshCw, 
  FileCode, 
  Scissors, 
  Split, 
  Table, 
  BarChart2, 
  Eye, 
  Filter, 
  CheckCircle2 
} from 'lucide-react';

export type TextManipulatorTabType = 
  | 'fontes' 
  | 'flip' 
  | 'diff' 
  | 'replace' 
  | 'acentos' 
  | 'lorem'
  | 'ocorrencia-palavra'
  | 'texto-html'
  | 'cortar-texto'
  | 'dividir-string'
  | 'tabela-ascii';

const STOPWORDS_PT = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 
  'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 
  'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 
  'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 
  'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 
  'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 
  'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele'
]);

export function TextManipulatorSuite({ defaultTab = 'fontes' }: { defaultTab?: TextManipulatorTabType }) {
  const [activeTab, setActiveTab] = useState<TextManipulatorTabType>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Base States
  const [baseText, setBaseText] = useState('Texto de Exemplo para Manipulação Soberana');
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Lorem State
  const [loremType, setLoremType] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs');
  const [loremCount, setLoremCount] = useState(3);

  // Diff state
  const [diffTextA, setDiffTextA] = useState('Primeira linha\nSegunda linha original\nTerceira linha');
  const [diffTextB, setDiffTextB] = useState('Primeira linha\nSegunda linha alterada\nTerceira linha');

  // --- 4DEVS: CONTADOR DE OCORRÊNCIA DE PALAVRAS STATE ---
  const [textOcorrencia, setTextOcorrencia] = useState(
    'O desenvolvimento de software ágil requer testes contínuos. Testes automatizados garantem a qualidade do software. Sem testes, o software falha e os testes manuais demoram muito.'
  );
  const [termoPesquisa, setTermoPesquisa] = useState('testes');
  const [ignorarStopwords, setIgnorarStopwords] = useState(true);

  // --- 4DEVS: CONVERSOR DE TEXTO PARA HTML STATE ---
  const [textToHtmlInput, setTextToHtmlInput] = useState(
    'Primeiro parágrafo do texto com informações importantes.\n\nSegundo parágrafo detalhado com quebras de linha e estrutura.\nLinha seguinte do mesmo bloco.'
  );
  const [htmlMode, setHtmlMode] = useState<'paragraphs' | 'breaks'>('paragraphs');
  const [escapeEntities, setEscapeEntities] = useState(true);

  // --- 4DEVS: CORTADOR DE TEXTOS STATE ---
  const [textToSlice, setTextToSlice] = useState(
    'A plataforma V5 Apollo Tools foi projetada para unificar o melhor acervo de produtividade técnica da internet, combinando algoritmos soberanos client-side e design Cyber Obsidian de alta precisão.'
  );
  const [sliceUnit, setSliceUnit] = useState<'chars' | 'words'>('chars');
  const [sliceLimit, setSliceLimit] = useState(80);
  const [sliceSuffix, setSliceSuffix] = useState('...');
  const [preserveWholeWords, setPreserveWholeWords] = useState(true);

  // --- 4DEVS: DIVISOR DE STRINGS STATE ---
  const [stringToSplit, setStringToSplit] = useState('São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Porto Alegre, Salvador, Brasília');
  const [delimiterPreset, setDelimiterPreset] = useState<',' | ';' | '-' | '/' | '\n' | 'custom'>(',');
  const [customDelimiter, setCustomDelimiter] = useState('|');
  const [trimPieces, setTrimPieces] = useState(true);
  const [ignoreEmptyPieces, setIgnoreEmptyPieces] = useState(true);

  // --- 4DEVS: TABELA ASCII & INSPETOR STATE ---
  const [charInspectorInput, setCharInspectorInput] = useState('Apollo 5');
  const [asciiSearch, setAsciiSearch] = useState('');

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
          if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + (code - 65));
          if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + (code - 97));
          return c;
        }).join('');
      }
    }
  };

  // Flip Text (Upside Down)
  const flipText = useMemo(() => {
    const normalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,;()[]{}';
    const flipChars   = 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z0ƖᄅƐㄣϛ9ㄥ86¡¿˙\'؛)(][}{';
    return baseText
      .split('')
      .reverse()
      .map(c => {
        const idx = normalChars.indexOf(c);
        return idx !== -1 ? flipChars[idx] : c;
      })
      .join('');
  }, [baseText]);

  // Diff Checker
  const diffResult = useMemo(() => {
    const linesA = diffTextA.split('\n');
    const linesB = diffTextB.split('\n');
    const maxLines = Math.max(linesA.length, linesB.length);
    const result: { lineNum: number; left: string; right: string; status: 'same' | 'modified' | 'added' | 'deleted' }[] = [];

    for (let i = 0; i < maxLines; i++) {
      const la = linesA[i] ?? null;
      const lb = linesB[i] ?? null;

      if (la === lb) {
        result.push({ lineNum: i + 1, left: la, right: lb, status: 'same' });
      } else if (la === null) {
        result.push({ lineNum: i + 1, left: '', right: lb, status: 'added' });
      } else if (lb === null) {
        result.push({ lineNum: i + 1, left: la, right: '', status: 'deleted' });
      } else {
        result.push({ lineNum: i + 1, left: la, right: lb, status: 'modified' });
      }
    }
    return result;
  }, [diffTextA, diffTextB]);

  // Replace Text
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

  // Remove Accents
  const textWithoutAccents = useMemo(() => {
    return baseText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }, [baseText]);

  // Lorem Ipsum Generator
  const generatedLorem = useMemo(() => {
    const loremWords = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 'vel',
      'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 'orci', 'gravida',
      'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis'
    ];

    const generateSentence = () => {
      const len = 8 + Math.floor(Math.random() * 8);
      const words = [];
      for (let i = 0; i < len; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      const s = words.join(' ');
      return s.charAt(0).toUpperCase() + s.slice(1) + '.';
    };

    if (loremType === 'words') {
      const words = [];
      for (let i = 0; i < loremCount; i++) {
        words.push(loremWords[i % loremWords.length]);
      }
      return words.join(' ');
    }

    if (loremType === 'sentences') {
      const sentences = [];
      for (let i = 0; i < loremCount; i++) {
        sentences.push(generateSentence());
      }
      return sentences.join(' ');
    }

    // Paragraphs
    const paras = [];
    for (let p = 0; p < loremCount; p++) {
      const sCount = 3 + Math.floor(Math.random() * 3);
      const sentences = [];
      for (let s = 0; s < sCount; s++) {
        sentences.push(generateSentence());
      }
      paras.push(sentences.join(' '));
    }
    return paras.join('\n\n');
  }, [loremType, loremCount]);

  // --- 4DEVS: CONTADOR DE OCORRÊNCIA E FREQUÊNCIA COMPUTED ---
  const ocorrenciaStats = useMemo(() => {
    const rawTokens = textOcorrencia.toLowerCase().match(/[a-záàâãéèêíïóôõöúçñ0-9]+/gi) || [];
    const totalWords = rawTokens.length;

    const freqMap: Record<string, number> = {};
    for (const token of rawTokens) {
      if (ignorarStopwords && STOPWORDS_PT.has(token)) continue;
      freqMap[token] = (freqMap[token] || 0) + 1;
    }

    const sortedList = Object.entries(freqMap)
      .map(([word, count]) => ({
        word,
        count,
        percent: totalWords > 0 ? (count / totalWords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    const termClean = termoPesquisa.trim().toLowerCase();
    const termoMatches = termClean ? rawTokens.filter(t => t === termClean).length : 0;
    const termoPercent = totalWords > 0 ? (termoMatches / totalWords) * 100 : 0;

    return {
      totalWords,
      uniqueWords: Object.keys(freqMap).length,
      ranking: sortedList.slice(0, 15),
      termoMatches,
      termoPercent
    };
  }, [textOcorrencia, termoPesquisa, ignorarStopwords]);

  // --- 4DEVS: CONVERSOR DE TEXTO PARA HTML COMPUTED ---
  const generatedHtml = useMemo(() => {
    let text = textToHtmlInput;
    if (escapeEntities) {
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (htmlMode === 'breaks') {
      return text.replace(/\n/g, '<br />\n');
    }

    // Parágrafos
    const paras = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return paras.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('\n');
  }, [textToHtmlInput, htmlMode, escapeEntities]);

  // --- 4DEVS: CORTADOR DE TEXTO (SLICE) COMPUTED ---
  const slicedResult = useMemo(() => {
    const raw = textToSlice;
    if (!raw) return { text: '', originalLength: 0, finalLength: 0, wasTruncated: false };

    let output = '';
    let wasTruncated = false;

    if (sliceUnit === 'chars') {
      if (raw.length <= sliceLimit) {
        output = raw;
      } else {
        wasTruncated = true;
        if (preserveWholeWords) {
          const cut = raw.slice(0, sliceLimit);
          const lastSpace = cut.lastIndexOf(' ');
          output = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + sliceSuffix;
        } else {
          output = raw.slice(0, sliceLimit) + sliceSuffix;
        }
      }
    } else {
      const words = raw.split(/\s+/).filter(Boolean);
      if (words.length <= sliceLimit) {
        output = raw;
      } else {
        wasTruncated = true;
        output = words.slice(0, sliceLimit).join(' ') + sliceSuffix;
      }
    }

    return {
      text: output,
      originalLength: raw.length,
      finalLength: output.length,
      wasTruncated
    };
  }, [textToSlice, sliceUnit, sliceLimit, sliceSuffix, preserveWholeWords]);

  // --- 4DEVS: DIVISOR DE STRINGS COMPUTED ---
  const splitPieces = useMemo(() => {
    let delim = ',';
    if (delimiterPreset === 'custom') {
      delim = customDelimiter || ',';
    } else {
      delim = delimiterPreset;
    }

    if (!stringToSplit) return [];
    let parts = stringToSplit.split(delim);
    if (trimPieces) parts = parts.map(p => p.trim());
    if (ignoreEmptyPieces) parts = parts.filter(p => p.length > 0);
    return parts;
  }, [stringToSplit, delimiterPreset, customDelimiter, trimPieces, ignoreEmptyPieces]);

  // --- 4DEVS: TABELA ASCII DE REFERÊNCIA ---
  const asciiTableData = useMemo(() => {
    const list: { dec: number; hex: string; bin: string; char: string; desc: string }[] = [];
    for (let i = 32; i <= 126; i++) {
      const char = String.fromCharCode(i);
      const hex = '0x' + i.toString(16).toUpperCase().padStart(2, '0');
      const bin = i.toString(2).padStart(8, '0');
      const desc = i === 32 ? 'Espaço (Space)' : `Caractere imprimível '${char}'`;
      if (!asciiSearch || char.includes(asciiSearch) || String(i).includes(asciiSearch) || hex.toLowerCase().includes(asciiSearch.toLowerCase())) {
        list.push({ dec: i, hex, bin, char, desc });
      }
    }
    return list;
  }, [asciiSearch]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Type className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Manipulação de Strings & Caracteres
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              4DEVS & INVERTEXTO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Frequência de palavras, conversão para HTML, cortador e divisor de strings, tabela ASCII e fontes estilizadas.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'ocorrencia-palavra', label: 'Frequência de Palavras', badge: '4Devs' },
          { id: 'texto-html', label: 'Texto para HTML', badge: '4Devs' },
          { id: 'cortar-texto', label: 'Cortar Textos (Slice)', badge: '4Devs' },
          { id: 'dividir-string', label: 'Dividir String', badge: '4Devs' },
          { id: 'tabela-ascii', label: 'Tabela ASCII & Inspetor', badge: '4Devs' },
          { id: 'fontes', label: 'Fontes Estilizadas' },
          { id: 'flip', label: 'Texto Invertido (Flip)' },
          { id: 'diff', label: 'Comparador Diff' },
          { id: 'replace', label: 'Localizar & Substituir' },
          { id: 'acentos', label: 'Remover Acentos' },
          { id: 'lorem', label: 'Gerador Lorem Ipsum' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === tab.id ? 'bg-slate-950/40 text-slate-900 font-extrabold' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4DEVS: ABA FREQUÊNCIA DE PALAVRAS */}
      {activeTab === 'ocorrencia-palavra' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Texto para Análise Léxica & Frequência
                </label>
                <textarea
                  value={textOcorrencia}
                  onChange={(e) => setTextOcorrencia(e.target.value)}
                  placeholder="Cole aqui seu artigo, redação ou código para analisar a repetição de termos..."
                  className="w-full h-44 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Pesquisar Palavra:</span>
                  <input
                    type="text"
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    placeholder="Ex: testes"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={ignorarStopwords}
                    onChange={(e) => setIgnorarStopwords(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-0"
                  />
                  <span>Ignorar Stopwords (de, a, o, em...)</span>
                </label>
              </div>

              {termoPesquisa && (
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Ocorrências de &quot;{termoPesquisa}&quot;:</span>
                    <div className="text-2xl font-mono font-extrabold text-purple-300">
                      {ocorrenciaStats.termoMatches} vezes
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-0.5">Densidade Relativa:</span>
                    <div className="text-xl font-mono font-bold text-emerald-400">
                      {ocorrenciaStats.termoPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-3 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                  Top 15 Palavras Mais Frequentes
                </span>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {ocorrenciaStats.ranking.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhuma palavra encontrada.</p>
                  ) : (
                    ocorrenciaStats.ranking.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">{item.word}</span>
                          <span className="text-slate-400">{item.count}x ({item.percent.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, item.percent * 4)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4DEVS: ABA CONVERTER TEXTO PARA HTML */}
      {activeTab === 'texto-html' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Texto Puro Original
              </label>
              <textarea
                value={textToHtmlInput}
                onChange={(e) => setTextToHtmlInput(e.target.value)}
                className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Estrutura:</span>
                <button
                  onClick={() => setHtmlMode('paragraphs')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    htmlMode === 'paragraphs' ? 'bg-purple-500 text-slate-950 border-purple-400 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Tags &lt;p&gt;
                </button>
                <button
                  onClick={() => setHtmlMode('breaks')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    htmlMode === 'breaks' ? 'bg-purple-500 text-slate-950 border-purple-400 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Apenas &lt;br /&gt;
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={escapeEntities}
                  onChange={(e) => setEscapeEntities(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-0"
                />
                <span>Escapar Caracteres Especiais</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> Código HTML Gerado
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedHtml, 'htmlCode')}
                    className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === 'htmlCode' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'htmlCode' ? 'Copiado!' : 'Copiar HTML'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-56">
                  {generatedHtml}
                </pre>
              </div>

              {/* Preview Renderizado */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Preview de Renderização Visual:
                </span>
                <div 
                  className="text-xs text-slate-200 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generatedHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4DEVS: ABA CORTAR TEXTOS (SLICE) */}
      {activeTab === 'cortar-texto' && (
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Texto para Truncar / Cortar
              </label>
              <textarea
                value={textToSlice}
                onChange={(e) => setTextToSlice(e.target.value)}
                className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cortar Por:</label>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setSliceUnit('chars')}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                      sliceUnit === 'chars' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Caracteres
                  </button>
                  <button
                    onClick={() => setSliceUnit('words')}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                      sliceUnit === 'words' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Palavras
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Limite Máximo:</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={sliceLimit}
                  onChange={(e) => setSliceLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white text-center font-mono focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sufixo (Elipse):</label>
                <input
                  type="text"
                  value={sliceSuffix}
                  onChange={(e) => setSliceSuffix(e.target.value)}
                  placeholder="Ex: ..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white text-center font-mono focus:border-purple-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 mt-3 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={preserveWholeWords}
                    onChange={(e) => setPreserveWholeWords(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-0"
                  />
                  <span>Preservar palavras completas</span>
                </label>
              </div>
            </div>

            {/* Resultado do Corte */}
            <div className="p-5 bg-slate-950 border border-purple-500/30 rounded-2xl relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" /> Texto Cortado Resultante
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {slicedResult.originalLength} carac. → {slicedResult.finalLength} carac.
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono bg-slate-900/90 p-4 rounded-xl border border-slate-800 select-all whitespace-pre-wrap pr-12">
                {slicedResult.text}
              </p>
              <button
                onClick={() => copyToClipboard(slicedResult.text, 'sliced')}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Copiar Texto Cortado"
              >
                {copiedKey === 'sliced' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4DEVS: ABA DIVIDIR STRINGS */}
      {activeTab === 'dividir-string' && (
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                String / Texto para Divisão
              </label>
              <textarea
                value={stringToSplit}
                onChange={(e) => setStringToSplit(e.target.value)}
                placeholder="Insira itens separados por vírgula, hífen ou quebra de linha..."
                className="w-full h-28 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-mono"
              />
            </div>

            {/* Configurações do Delimitador */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold">Delimitador:</span>
              {[
                { id: ',', label: 'Vírgula (,)' },
                { id: ';', label: 'Ponto e vírgula (;)' },
                { id: '-', label: 'Hífen (-)' },
                { id: '/', label: 'Barra (/)' },
                { id: '\n', label: 'Quebra de Linha' },
                { id: 'custom', label: 'Personalizado' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelimiterPreset(d.id as any)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    delimiterPreset === d.id ? 'bg-purple-500 text-slate-950 border-purple-400 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}

              {delimiterPreset === 'custom' && (
                <input
                  type="text"
                  value={customDelimiter}
                  onChange={(e) => setCustomDelimiter(e.target.value)}
                  placeholder="Delim"
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white text-center font-mono"
                />
              )}

              <div className="flex items-center gap-3 ml-auto">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={trimPieces}
                    onChange={(e) => setTrimPieces(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-purple-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={ignoreEmptyPieces}
                    onChange={(e) => setIgnoreEmptyPieces(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-purple-500"
                  />
                  <span>Sem vazios</span>
                </label>
              </div>
            </div>

            {/* Lista dos Fragmentos Gerados */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Split className="w-3.5 h-3.5 text-purple-400" />
                  Fragmentos Gerados ({splitPieces.length} itens):
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(splitPieces.join('\n'), 'splitList')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Copiar Lista (\n)
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(splitPieces, null, 2), 'splitJson')}
                    className="px-2.5 py-1 rounded-lg bg-purple-500 text-slate-950 text-xs font-bold"
                  >
                    Copiar JSON Array
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {splitPieces.map((piece, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">#{idx + 1}</span>
                    <span className="text-xs font-mono text-slate-200 truncate">{piece}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4DEVS: ABA TABELA ASCII & INSPETOR */}
      {activeTab === 'tabela-ascii' && (
        <div className="space-y-6">
          {/* Inspetor de Caracteres em Tempo Real */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Digite ou Cole Caracteres para Inspecionar
              </label>
              <input
                type="text"
                value={charInspectorInput}
                onChange={(e) => setCharInspectorInput(e.target.value)}
                placeholder="Digite texto para inspecionar cada caractere..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            {charInspectorInput && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-2">
                {charInspectorInput.split('').map((char, idx) => {
                  const code = char.codePointAt(0) || 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-purple-500/20 text-center space-y-1">
                      <div className="text-2xl font-bold text-white font-mono">{char === ' ' ? '␣' : char}</div>
                      <div className="text-[10px] text-purple-400 font-mono">Dec: {code}</div>
                      <div className="text-[9px] text-slate-400 font-mono">Hex: 0x{code.toString(16).toUpperCase()}</div>
                      <div className="text-[8px] text-emerald-400 font-mono">Bin: {code.toString(2).padStart(8, '0')}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabela ASCII de Referência */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-purple-400" />
                Tabela ASCII de Referência Rápida (32 a 126)
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={asciiSearch}
                  onChange={(e) => setAsciiSearch(e.target.value)}
                  placeholder="Filtrar por caractere, dec ou hex..."
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-purple-500 focus:outline-none w-full sm:w-48"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Glifo</th>
                    <th className="p-2.5">Decimal</th>
                    <th className="p-2.5">Hex</th>
                    <th className="p-2.5">Binário</th>
                    <th className="p-2.5">HTML Entity</th>
                    <th className="p-2.5">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                  {asciiTableData.map((row) => (
                    <tr key={row.dec} className="hover:bg-slate-900/60 transition">
                      <td className="p-2.5 text-white font-bold text-sm">{row.char}</td>
                      <td className="p-2.5 text-purple-400">{row.dec}</td>
                      <td className="p-2.5 text-cyan-300">{row.hex}</td>
                      <td className="p-2.5 text-emerald-400 text-[10px]">{row.bin}</td>
                      <td className="p-2.5 text-amber-300">&amp;#{row.dec};</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: FONTES ESTILIZADAS */}
      {activeTab === 'fontes' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 block mb-2">Digite o Texto Original:</label>
            <input
              type="text"
              value={baseText}
              onChange={(e) => setBaseText(e.target.value)}
              placeholder="Digite qualquer frase aqui..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(FONT_MAPS).map(([key, item]) => {
              const transformed = item.transform(baseText);
              return (
                <div key={key} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 relative group">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{item.label}</span>
                  <p className="text-sm text-slate-200 select-all font-sans pr-16">{transformed || 'Digite algo acima...'}</p>
                  <button
                    onClick={() => copyToClipboard(transformed, key)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {copiedKey === key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA: FLIP TEXT */}
      {activeTab === 'flip' && (
        <div className="space-y-4">
          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            placeholder="Digite aqui para virar de ponta-cabeça..."
            className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
          />

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Texto Invertido (Upside-Down)</span>
              <button
                onClick={() => copyToClipboard(flipText, 'flip')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'flip' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'flip' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm font-mono text-purple-300 select-all whitespace-pre-wrap">{flipText}</p>
          </div>
        </div>
      )}

      {/* ABA: DIFF CHECKER */}
      {activeTab === 'diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1.5">Texto A (Original)</span>
              <textarea
                value={diffTextA}
                onChange={(e) => setDiffTextA(e.target.value)}
                className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-white font-mono resize-none focus:border-purple-500"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1.5">Texto B (Modificado)</span>
              <textarea
                value={diffTextB}
                onChange={(e) => setDiffTextB(e.target.value)}
                className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-white font-mono resize-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-400 block">Diferenças Detectadas Linha a Linha:</span>
            <div className="space-y-1 font-mono text-xs">
              {diffResult.map((d) => (
                <div
                  key={d.lineNum}
                  className={`p-2 rounded-xl flex items-center justify-between border ${
                    d.status === 'same'
                      ? 'bg-slate-900/40 border-slate-800/40 text-slate-400'
                      : d.status === 'added'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : d.status === 'deleted'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 w-8">L{d.lineNum}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <span className="truncate">{d.left || <span className="opacity-30">vazio</span>}</span>
                    <span className="truncate">{d.right || <span className="opacity-30">vazio</span>}</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 bg-slate-800">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA: LOCALIZAR E SUBSTITUIR */}
      {activeTab === 'replace' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Localizar:</label>
              <input
                type="text"
                value={findWord}
                onChange={(e) => setFindWord(e.target.value)}
                placeholder="Palavra ou caractere..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Substituir Por:</label>
              <input
                type="text"
                value={replaceWord}
                onChange={(e) => setReplaceWord(e.target.value)}
                placeholder="Novo termo..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="caseSensitive"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded border-slate-800 text-purple-500 focus:ring-0"
            />
            <label htmlFor="caseSensitive" className="text-xs text-slate-400 cursor-pointer">
              Diferenciar maiúsculas e minúsculas (Case Sensitive)
            </label>
          </div>

          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            placeholder="Cole aqui o texto onde as substituições serão aplicadas..."
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
