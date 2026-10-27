'use client';

import React, { useState, useMemo } from 'react';
import { Lock, QrCode, Barcode, Dices, Copy, Check, RefreshCw, KeyRound, Wifi, Sparkles, Binary } from 'lucide-react';

export function CryptoWebSuite({ defaultTab = 'barcode' }: { defaultTab?: 'barcode' | 'wifi' | 'cripto' | 'sorteio' }) {
  const [activeTab, setActiveTab] = useState<'barcode' | 'wifi' | 'cripto' | 'sorteio'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // --- BARCODE STATE ---
  const [barcodeValue, setBarcodeValue] = useState('789123456789');
  const [barcodeType, setBarcodeType] = useState<'ean13' | 'code128'>('ean13');

  // --- WI-FI STATE ---
  const [wifiSsid, setWifiSsid] = useState('MinhaRede_5G');
  const [wifiPass, setWifiPass] = useState('SenhaForte123');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // --- CRIPTO STATE ---
  const [criptoInput, setCriptoInput] = useState('Holding V5 Apollo 2026');
  const [criptoMode, setCriptoMode] = useState<'base64' | 'url' | 'binary' | 'morse'>('base64');
  const [isDecode, setIsDecode] = useState(false);

  // --- SORTEIO STATE ---
  const [sorteioTipo, setSorteioTipo] = useState<'nomes' | 'numeros' | 'dado'>('nomes');
  const [listaNomes, setListaNomes] = useState('Carlos\nAna Paula\nBruno\nMariana\nLucas\nBeatriz');
  const [ganhador, setGanhador] = useState<string | null>(null);
  const [numMin, setNumMin] = useState('1');
  const [numMax, setNumMax] = useState('100');
  const [numSorteado, setNumSorteado] = useState<number | null>(null);
  const [dadoFace, setDadoFace] = useState<number>(6);

  // --- EAN-13 CALCULATE CHECKSUM ---
  const ean13Full = useMemo(() => {
    const raw = barcodeValue.replace(/\D/g, '').slice(0, 12);
    if (raw.length < 12) return raw;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(raw[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const check = (10 - (sum % 10)) % 10;
    return `${raw}${check}`;
  }, [barcodeValue]);

  // --- WI-FI PAYLOAD ---
  const wifiPayload = useMemo(() => {
    return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPass};;`;
  }, [wifiAuth, wifiSsid, wifiPass]);

  // --- CRIPTO LOGIC ---
  const MORSE_MAP: Record<string, string> = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    ' ': '/'
  };

  const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
    Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
  );

  const criptoResult = useMemo(() => {
    if (!criptoInput) return '';

    try {
      if (criptoMode === 'base64') {
        return isDecode ? decodeURIComponent(escape(atob(criptoInput))) : btoa(unescape(encodeURIComponent(criptoInput)));
      }
      if (criptoMode === 'url') {
        return isDecode ? decodeURIComponent(criptoInput) : encodeURIComponent(criptoInput);
      }
      if (criptoMode === 'binary') {
        if (isDecode) {
          return criptoInput.trim().split(/\s+/).map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
        } else {
          return criptoInput.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        }
      }
      if (criptoMode === 'morse') {
        if (isDecode) {
          return criptoInput.trim().split(/\s+/).map(m => REVERSE_MORSE[m] || m).join('');
        } else {
          return criptoInput.toUpperCase().split('').map(c => MORSE_MAP[c] || c).join(' ');
        }
      }
    } catch {
      return isDecode ? 'Erro ao decodificar payload inválido' : 'Erro no processamento';
    }
    return '';
  }, [criptoInput, criptoMode, isDecode]);

  // --- SORTEIOS ACTIONS ---
  const sortearNome = () => {
    const nomes = listaNomes.split(/\r?\n/).map(n => n.trim()).filter(Boolean);
    if (nomes.length === 0) return;
    const escolhido = nomes[Math.floor(Math.random() * nomes.length)];
    setGanhador(escolhido);
  };

  const sortearNumero = () => {
    const min = parseInt(numMin, 10) || 1;
    const max = parseInt(numMax, 10) || 100;
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    setNumSorteado(res);
  };

  const rolarDado = () => {
    const face = Math.floor(Math.random() * 6) + 1;
    setDadoFace(face);
  };

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Cyan/Amber Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Códigos de Barras, Wi-Fi & Sorteios
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              INVERTEXTO BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gerador de Código de Barras EAN-13, QR Code para conexão Wi-Fi direta, codificadores Base64/Morse e sorteador de nomes.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'barcode', label: 'Código de Barras (EAN-13)' },
          { id: 'wifi', label: 'QR Code Wi-Fi' },
          { id: 'cripto', label: 'Base64, URL & Morse' },
          { id: 'sorteio', label: 'Sorteador de Nomes & Números' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: CÓDIGO DE BARRAS */}
      {activeTab === 'barcode' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Número do Produto (12 dígitos para calcular o 13º DV):
              </label>
              <input
                type="text"
                maxLength={12}
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Padrão EAN-13 oficial de supermercados e e-commerce (GS1 Brasil).
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-400">Código EAN-13 Completo:</span>
              <span className="font-mono text-base font-bold text-cyan-300">{ean13Full}</span>
            </div>

            <button
              onClick={() => copyToClipboard(ean13Full, 'ean')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedKey === 'ean' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey === 'ean' ? 'Copiado!' : 'Copiar EAN-13'}
            </button>
          </div>

          {/* Renderização Visual do Código de Barras */}
          <div className="p-6 bg-white rounded-2xl shadow-xl text-center space-y-2 max-w-sm mx-auto">
            {/* Visual Barcode SVG Simulation */}
            <div className="flex items-center justify-center gap-1 h-24 overflow-hidden px-4">
              {ean13Full.split('').map((digit, i) => (
                <div key={i} className="flex gap-0.5 h-full items-end">
                  <div className={`w-${(parseInt(digit, 10) % 3) + 1} bg-black h-full`} style={{ width: `${(parseInt(digit, 10) % 3) + 1.5}px` }} />
                  <div className="w-1 bg-transparent h-full" style={{ width: '2px' }} />
                  <div className={`w-${((parseInt(digit, 10) + 1) % 2) + 1} bg-black h-full`} style={{ width: `${((parseInt(digit, 10) + 1) % 2) + 1}px` }} />
                </div>
              ))}
            </div>
            <div className="font-mono font-bold tracking-widest text-slate-950 text-sm">
              {ean13Full}
            </div>
          </div>
        </div>
      )}

      {/* ABA: WI-FI QR CODE */}
      {activeTab === 'wifi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome da Rede Wi-Fi (SSID):</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Senha do Wi-Fi:</label>
              <input
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Segurança:</label>
              <select
                value={wifiAuth}
                onChange={(e) => setWifiAuth(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              >
                <option value="WPA">WPA / WPA2 (Padrão)</option>
                <option value="WEP">WEP (Antigo)</option>
                <option value="nopass">Rede Aberta (Sem Senha)</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl text-center space-y-3">
            <div className="p-3 bg-white rounded-2xl shadow-xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(wifiPayload)}&margin=4`}
                alt="QR Code Wi-Fi"
                className="w-40 h-40 object-contain mx-auto"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Conectar Automaticamente</span>
              <p className="text-[11px] text-slate-400">
                Aponte a câmera do celular no QR Code para conectar na rede <strong className="text-cyan-300">{wifiSsid}</strong> sem digitar senha.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA: CRIPTO & MORSE */}
      {activeTab === 'cripto' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
              {(['base64', 'url', 'binary', 'morse'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCriptoMode(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                    criptoMode === m ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsDecode(!isDecode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isDecode ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-cyan-300'
              }`}
            >
              {isDecode ? 'Modo: Decodificar (Decode)' : 'Modo: Codificar (Encode)'}
            </button>
          </div>

          <textarea
            value={criptoInput}
            onChange={(e) => setCriptoInput(e.target.value)}
            placeholder="Digite o texto para processar..."
            className="w-full h-24 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 resize-none"
          />

          <div className="p-4 bg-slate-950/90 border border-cyan-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400">Resultado ({criptoMode.toUpperCase()})</span>
              <button
                onClick={() => copyToClipboard(criptoResult, 'cripto')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'cripto' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'cripto' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs font-mono text-cyan-200 select-all break-all">{criptoResult}</p>
          </div>
        </div>
      )}

      {/* ABA: SORTEIOS */}
      {activeTab === 'sorteio' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'nomes', label: 'Sorteio de Nomes' },
              { id: 'numeros', label: 'Sorteio de Números' },
              { id: 'dado', label: 'Dado Virtual' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSorteioTipo(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  sorteioTipo === t.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {sorteioTipo === 'nomes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cole os nomes (1 por linha):</label>
                <textarea
                  value={listaNomes}
                  onChange={(e) => setListaNomes(e.target.value)}
                  className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
                <button
                  onClick={sortearNome}
                  className="mt-2 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Sortear Nome Agora
                </button>
              </div>

              <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nome Sorteado</span>
                <span className="text-2xl font-black text-cyan-300 block">{ganhador || 'Aguardando Sorteio...'}</span>
              </div>
            </div>
          )}

          {sorteioTipo === 'numeros' && (
            <div className="max-w-md mx-auto p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4 text-center">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-24">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Mínimo</label>
                  <input
                    type="number"
                    value={numMin}
                    onChange={(e) => setNumMin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-sm font-mono text-white text-center"
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Máximo</label>
                  <input
                    type="number"
                    value={numMax}
                    onChange={(e) => setNumMax(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-sm font-mono text-white text-center"
                  />
                </div>
              </div>

              <button
                onClick={sortearNumero}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Sortear Número
              </button>

              {numSorteado !== null && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Número Sorteado</span>
                  <span className="text-4xl font-mono font-black text-emerald-400">{numSorteado}</span>
                </div>
              )}
            </div>
          )}

          {sorteioTipo === 'dado' && (
            <div className="max-w-xs mx-auto p-6 bg-slate-950/70 border border-slate-800 rounded-2xl text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 border border-cyan-500/40 shadow-2xl flex items-center justify-center">
                <span className="text-5xl font-black text-cyan-300 font-mono">{dadoFace}</span>
              </div>
              <button
                onClick={rolarDado}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Dices className="w-4 h-4" /> Rolar Dado (1 a 6)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
