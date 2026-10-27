'use client';

import React, { useState, useMemo } from 'react';
import { 
  Type, 
  KeyRound, 
  Smile, 
  ListOrdered, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Sliders,
  AlignLeft
} from 'lucide-react';

export type TextSpecializedTab = 'letras-estilizadas' | 'prefixo-sufixo' | 'cifra-cripto' | 'simbolos-emojis';

// Mapa de caracteres de cabeça para baixo
const FLIP_MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
  k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ',
  K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Q', R: 'ɹ', S: 'S', T: '┴',
  U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
  '.': '˙', ',': '\'', '?': '¿', '!': '¡', '\'': ',', '"': '„', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾'
};

export function TextSpecializedSuite({ defaultTab = 'letras-estilizadas' }: { defaultTab?: TextSpecializedTab }) {
  const [activeTab, setActiveTab] = useState<TextSpecializedTab>(defaultTab);
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

  // ==========================================
  // TAB 1: LETRAS ESTILIZADAS & MODIFICADORES STATE
  // ==========================================
  const [styleInput, setStyleInput] = useState<string>('Apollo Holding 5');

  const styledVariations = useMemo(() => {
    const text = styleInput;

    // Sublinhado (combining underline U+0332)
    const underlined = text.split('').map(c => c + '\u0332').join('');

    // Tachado (combining strikethrough U+0336)
    const strikethrough = text.split('').map(c => c + '\u0336').join('');

    // Letras empilhadas (combining small letter)
    const stacked = text.split('').map(c => c + '\u0364').join('');

    // Invertido / De cabeça para baixo
    const flipped = text.split('').reverse().map(c => FLIP_MAP[c] || c).join('');

    // Monoespaçado (Fullwidth)
    const fullwidth = text.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(code + 65248);
      }
      return c;
    }).join('');

    return [
      { id: 'sub', label: 'Texto Sublinhado', result: underlined },
      { id: 'str', label: 'Texto Tachado (Riscado)', result: strikethrough },
      { id: 'stk', label: 'Letras Empilhadas', result: stacked },
      { id: 'flp', label: 'De Cabeça para Baixo (Invertido)', result: flipped },
      { id: 'ful', label: 'Estilo Vaporwave / Fullwidth', result: fullwidth }
    ];
  }, [styleInput]);

  // ==========================================
  // TAB 2: PREFIXO E SUFIXO STATE
  // ==========================================
  const [linesInput, setLinesInput] = useState<string>('Item Alfa\nItem Beta\nItem Gama\nItem Delta');
  const [prefixText, setPrefixText] = useState<string>('-> ');
  const [suffixText, setSuffixText] = useState<string>(' [OK]');
  const [includeLineNumbers, setIncludeLineNumbers] = useState<boolean>(false);
  const [ignoreEmptyLines, setIgnoreEmptyLines] = useState<boolean>(true);

  const processedLines = useMemo(() => {
    const lines = linesInput.split('\n');
    let lineCounter = 1;

    const result = lines.map((line) => {
      if (ignoreEmptyLines && line.trim() === '') {
        return '';
      }
      const numPrefix = includeLineNumbers ? `${lineCounter}. ` : '';
      if (!ignoreEmptyLines || line.trim() !== '') {
        lineCounter++;
      }
      return `${numPrefix}${prefixText}${line}${suffixText}`;
    }).filter(l => !ignoreEmptyLines || l !== '');

    return result.join('\n');
  }, [linesInput, prefixText, suffixText, includeLineNumbers, ignoreEmptyLines]);

  // ==========================================
  // TAB 3: CIFRA CRIPTOGRÁFICA COM CHAVE STATE
  // ==========================================
  const [cryptoMode, setCryptoMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [cryptoText, setCryptoText] = useState<string>('Mensagem secreta para a Holding V5 Apollo');
  const [cryptoKey, setCryptoKey] = useState<string>('chave-secreta-2026');
  const [cipherResult, setCipherResult] = useState<string>('');

  // Cifra de Vigenère polialfabética client-side pura com suporte UTF-8 via Base64
  const handleRunCipher = () => {
    if (!cryptoText || !cryptoKey) return;

    if (cryptoMode === 'encrypt') {
      try {
        let out = '';
        const key = cryptoKey;
        for (let i = 0; i < cryptoText.length; i++) {
          const charCode = cryptoText.charCodeAt(i);
          const keyChar = key.charCodeAt(i % key.length);
          out += String.fromCharCode(charCode ^ keyChar);
        }
        // Converte para Base64 seguro
        const b64 = btoa(unescape(encodeURIComponent(out)));
        setCipherResult(b64);
      } catch {
        setCipherResult('Erro ao encriptar texto.');
      }
    } else {
      try {
        const decoded = decodeURIComponent(escape(atob(cryptoText.trim())));
        let out = '';
        const key = cryptoKey;
        for (let i = 0; i < decoded.length; i++) {
          const charCode = decoded.charCodeAt(i);
          const keyChar = key.charCodeAt(i % key.length);
          out += String.fromCharCode(charCode ^ keyChar);
        }
        setCipherResult(out);
      } catch {
        setCipherResult('Chave incorreta ou texto cifrado corrompido.');
      }
    }
  };

  // ==========================================
  // TAB 4: SÍMBOLOS & EMOJIS STATE
  // ==========================================
  const emojiCategories = [
    {
      name: 'Setas & Ponteiros',
      items: ['→', '←', '↑', '↓', '↔', '↕', '➔', '➜', '➤', '➥', '⇒', '▲', '▼', '►', '◄']
    },
    {
      name: 'Símbolos Matemáticos & Moeda',
      items: ['$', '€', '£', '¥', '₽', '₿', '±', '×', '÷', '≈', '≠', '≤', '≥', '∞', '√', 'π', '∑', '∆']
    },
    {
      name: 'Estrelas & Formas',
      items: ['★', '☆', '✦', '✧', '✪', '✫', '✬', '✭', '✮', '✯', '■', '□', '▲', '△', '◆', '◇', '○', '●']
    },
    {
      name: 'Checkmarks & Status',
      items: ['✓', '✔', '✕', '✖', '✗', '✘', '⚡', '⚠', '⛔', '⭕', '🔴', '🟢', '🟡', '🔵', '🟣', '⚫', '⚪']
    },
    {
      name: 'Emojis Populares',
      items: ['🚀', '🔥', '💡', '🧠', '💰', '🎯', '✨', '💎', '👑', '🦾', '🪐', '🛡️', '📊', '📈', '⚙️', '🛠️']
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Cyberpunk de Fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider">
              Benchmark Invertexto · Manipulação & Cripto
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              100% Client-Side
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Type className="w-6 h-6 text-purple-400" />
            Texto Especializado, Cifra Secreta & Símbolos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Letras empilhadas, prefixo/sufixo por linha, criptografia com senha e acervo de símbolos e emojis.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('letras-estilizadas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'letras-estilizadas'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Letras Estilizadas
          </button>
          <button
            onClick={() => setActiveTab('prefixo-sufixo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'prefixo-sufixo'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Prefixo & Sufixo
          </button>
          <button
            onClick={() => setActiveTab('cifra-cripto')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'cifra-cripto'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Cifra com Chave
          </button>
          <button
            onClick={() => setActiveTab('simbolos-emojis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'simbolos-emojis'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            Símbolos & Emojis
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="relative z-10 pt-6">

        {/* ========================================================= */}
        {/* TAB 1: LETRAS ESTILIZADAS & MODIFICADORES */}
        {/* ========================================================= */}
        {activeTab === 'letras-estilizadas' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <label className="block text-xs font-mono text-purple-400 font-bold mb-1.5">
                Digite o Texto para Transformação:
              </label>
              <input
                type="text"
                value={styleInput}
                onChange={(e) => setStyleInput(e.target.value)}
                placeholder="Ex: Apollo Holding 5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Variações Geradas */}
            <div className="space-y-3">
              {styledVariations.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 block">{item.label}</span>
                    <strong className="text-base sm:text-lg font-mono text-slate-100 mt-0.5 block break-all">
                      {item.result}
                    </strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.result, item.id)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 transition flex-shrink-0 cursor-pointer"
                  >
                    {copiedKey === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PREFIXO E SUFIXO POR LINHA */}
        {/* ========================================================= */}
        {activeTab === 'prefixo-sufixo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                  Texto de Prefixo (início da linha)
                </label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-purple-400 font-bold mb-1.5">
                  Texto de Sufixo (final da linha)
                </label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLineNumbers}
                    onChange={(e) => setIncludeLineNumbers(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-purple-500"
                  />
                  <span>Adicionar Numeração (1., 2., 3.)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreEmptyLines}
                    onChange={(e) => setIgnoreEmptyLines(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-purple-500"
                  />
                  <span>Ignorar Linhas Vazias</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                  Texto Original (Linha por Linha):
                </label>
                <textarea
                  value={linesInput}
                  onChange={(e) => setLinesInput(e.target.value)}
                  className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-emerald-400 font-bold">
                    Resultado Formatado:
                  </label>
                  <button
                    onClick={() => copyToClipboard(processedLines, 'pre-suf-lines')}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    {copiedKey === 'pre-suf-lines' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar
                  </button>
                </div>
                <textarea
                  readOnly
                  value={processedLines}
                  className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CIFRA CRIPTOGRÁFICA COM CHAVE */}
        {/* ========================================================= */}
        {activeTab === 'cifra-cripto' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCryptoMode('encrypt')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    cryptoMode === 'encrypt' ? 'bg-purple-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Cifrar (Encriptar)
                </button>
                <button
                  onClick={() => setCryptoMode('decrypt')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    cryptoMode === 'decrypt' ? 'bg-purple-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Decifrar (Desencriptar)
                </button>
              </div>

              <button
                onClick={handleRunCipher}
                className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{cryptoMode === 'encrypt' ? 'Executar Cifragem' : 'Executar Decifragem'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-amber-400 font-bold mb-1.5">
                    Chave Secreta (Senha de Cifragem):
                  </label>
                  <input
                    type="text"
                    value={cryptoKey}
                    onChange={(e) => setCryptoKey(e.target.value)}
                    placeholder="Digite sua senha secreta..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                    {cryptoMode === 'encrypt' ? 'Texto Original para Cifrar:' : 'Texto Cifrado (Base64) para Decifrar:'}
                  </label>
                  <textarea
                    value={cryptoText}
                    onChange={(e) => setCryptoText(e.target.value)}
                    placeholder={cryptoMode === 'encrypt' ? 'Digite a mensagem secreta...' : 'Cole o código cifrado aqui...'}
                    className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-emerald-400 font-bold">
                    Resultado da Operação:
                  </label>
                  {cipherResult && (
                    <button
                      onClick={() => copyToClipboard(cipherResult, 'cipher-res')}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedKey === 'cipher-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                  )}
                </div>
                <div className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 overflow-auto break-all">
                  {cipherResult || <span className="text-slate-600">Clique em &quot;Executar Cifragem&quot; para gerar o resultado...</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CATÁLOGO DE SÍMBOLOS & EMOJIS */}
        {/* ========================================================= */}
        {activeTab === 'simbolos-emojis' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <p className="text-xs font-mono text-slate-400">
                Clique sobre qualquer símbolo ou emoji para copiar instantaneamente para a área de transferência.
              </p>
              {copiedKey && (
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copiado: {copiedKey}
                </span>
              )}
            </div>

            <div className="space-y-6">
              {emojiCategories.map((cat, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider block mb-3">
                    {cat.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(item, item)}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 text-lg flex items-center justify-center transition cursor-pointer select-none active:scale-95"
                        title={`Copiar ${item}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
