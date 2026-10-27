'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck, ShieldAlert, Sliders, Lock, Zap } from 'lucide-react';

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    const uppercase = excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = excludeAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    const numbers = excludeAmbiguous ? '23456789' : '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      setPassword('');
      return;
    }

    // Cryptographically strong random generation
    let result = '';
    const cryptoObj = window.crypto || (window as any).msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      const randomValues = new Uint32Array(length);
      cryptoObj.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    }

    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous]);

  // Entropy Calculation (bits)
  const calculateEntropy = () => {
    let poolSize = 0;
    if (includeUppercase) poolSize += 26;
    if (includeLowercase) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 28;
    if (poolSize === 0) return 0;

    const entropy = length * Math.log2(poolSize);
    return Math.round(entropy);
  };

  const entropy = calculateEntropy();

  // Strength classification
  const getStrength = () => {
    if (entropy < 40) return { label: 'Muito Fraca', color: 'text-rose-400', bar: 'bg-rose-500', width: '25%', time: 'Poucos segundos' };
    if (entropy < 60) return { label: 'Razoável', color: 'text-amber-400', bar: 'bg-amber-500', width: '50%', time: 'Alguns dias' };
    if (entropy < 80) return { label: 'Forte', color: 'text-emerald-400', bar: 'bg-emerald-500', width: '75%', time: 'Vários séculos' };
    return { label: 'Ultra Segura (Militar)', color: 'text-cyan-400', bar: 'bg-cyan-400', width: '100%', time: 'Bilhões de anos' };
  };

  const strength = getStrength();

  const handleCopy = () => {
    if (!password) return;
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(password).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Cyan Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gerador de Senhas Seguras & Entropia
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              4DEVS BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Geração com entropia criptográfica nativa (<code className="text-cyan-400">crypto.getRandomValues</code>) no navegador. Zero envio a servidores.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 p-2 rounded-2xl shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Entropia</span>
            <span className="text-sm font-mono font-bold text-cyan-300">{entropy} bits</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Força</span>
            <span className={`text-sm font-bold ${strength.color}`}>{strength.label}</span>
          </div>
        </div>
      </div>

      {/* Visor da Senha com Botão de Cópia Gigante */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6 relative">
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-base sm:text-xl font-bold text-white tracking-wider break-all select-all">
            {password || 'Selecione pelo menos uma opção'}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={generatePassword}
              aria-label="Gerar nova senha"
              title="Gerar nova senha"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              disabled={!password}
              aria-label="Copiar Senha Gerada"
              className={`px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer ${!password ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Senha'}
            </button>
          </div>
        </div>

        {/* Barra de Força Dinâmica */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400">Resistência a Ataques de Força Bruta:</span>
            <span className="text-slate-300 font-medium">Tempo estimado de quebra: <strong className="text-cyan-300">{strength.time}</strong></span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${strength.bar} transition-all duration-300`} style={{ width: strength.width }} />
          </div>
        </div>
      </div>

      {/* Configurações & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Slider de Tamanho (5 colunas) */}
        <div className="lg:col-span-5 space-y-3 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Tamanho da Senha
            </label>
            <span className="font-mono text-sm font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              {length} caracteres
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>6 (Mínimo)</span>
            <span>16 (Recomendado)</span>
            <span>32 (Alto)</span>
            <span>64 (Paranóico)</span>
          </div>
        </div>

        {/* Checkboxes de Conjunto de Caracteres (7 colunas) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span>Letras Maiúsculas (A-Z)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span>Letras Minúsculas (a-z)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span>Números (0-9)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span>Símbolos (!@#$%...)</span>
          </label>

          <label className="col-span-1 sm:col-span-2 flex items-center gap-2.5 text-xs font-semibold text-slate-300 p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer select-none border-t border-slate-800/80 mt-1">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span>Evitar Caracteres Ambíguos (exclui: <code className="text-cyan-400 font-mono">l, 1, I, O, 0</code>)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
