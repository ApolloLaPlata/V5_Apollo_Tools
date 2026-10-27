'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Dices, 
  CircleDot, 
  Shuffle, 
  Sparkles, 
  Trophy, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Users, 
  Play, 
  RotateCcw,
  Layers,
  Award
} from 'lucide-react';

export type LotteryTabType = 'loterias' | 'roleta' | 'embaralhador' | 'palavras';

type ModalidadeLoteria = 'megasena' | 'quina' | 'lotofacil' | 'lotomania' | 'duplasena';

const LOTERIAS_CONFIG: Record<ModalidadeLoteria, {
  nome: string;
  minNum: number;
  maxNum: number;
  totalRange: number;
  defaultNum: number;
  corBg: string;
  corBorder: string;
  corText: string;
}> = {
  megasena: {
    nome: 'Mega-Sena',
    minNum: 6,
    maxNum: 15,
    totalRange: 60,
    defaultNum: 6,
    corBg: 'bg-emerald-500/20',
    corBorder: 'border-emerald-500/40',
    corText: 'text-emerald-400'
  },
  quina: {
    nome: 'Quina',
    minNum: 5,
    maxNum: 15,
    totalRange: 80,
    defaultNum: 5,
    corBg: 'bg-blue-500/20',
    corBorder: 'border-blue-500/40',
    corText: 'text-blue-400'
  },
  lotofacil: {
    nome: 'Lotofácil',
    minNum: 15,
    maxNum: 20,
    totalRange: 25,
    defaultNum: 15,
    corBg: 'bg-purple-500/20',
    corBorder: 'border-purple-500/40',
    corText: 'text-purple-400'
  },
  lotomania: {
    nome: 'Lotomania',
    minNum: 50,
    maxNum: 50,
    totalRange: 100,
    defaultNum: 50,
    corBg: 'bg-amber-500/20',
    corBorder: 'border-amber-500/40',
    corText: 'text-amber-400'
  },
  duplasena: {
    nome: 'Dupla Sena',
    minNum: 6,
    maxNum: 15,
    totalRange: 50,
    defaultNum: 6,
    corBg: 'bg-rose-500/20',
    corBorder: 'border-rose-500/40',
    corText: 'text-rose-400'
  }
};

const PALAVRAS_BASE: Record<string, string[]> = {
  todas: [
    'horizonte', 'liberdade', 'esperança', 'universo', 'harmonia', 'silêncio', 'coragem', 'sabedoria',
    'energia', 'vitória', 'destino', 'aventura', 'mistério', 'natureza', 'galáxia', 'resiliência',
    'fidelidade', 'felicidade', 'tempo', 'amizade', 'aurora', 'prosperidade', 'infinito', 'inspiração',
    'inovação', 'criatividade', 'transformação', 'equilíbrio', 'jornada', 'sonho', 'conquista', 'evolução',
    'oceano', 'estrela', 'cometa', 'fênix', 'oráculo', 'abismo', 'diamante', 'labirinto', 'trovão',
    'relâmpago', 'vórtice', 'cúmplice', 'labareda', 'esplendor', 'serenidade', 'plenitude', 'crepúsculo',
    'alquimia', 'constelação', 'gravidade', 'metamorfose', 'ímpeto', 'visão', 'legado', 'memória', 'luz'
  ],
  letras4: ['amor', 'vida', 'fogo', 'alma', 'ouro', 'onda', 'raio', 'vento', 'céu', 'nave', 'azul', 'viva', 'puro', 'lobo', 'raiz'],
  letras5: ['sonho', 'tempo', 'força', 'visão', 'mundo', 'astro', 'nuvem', 'vigor', 'bravo', 'nobre', 'plena', 'justo', 'farol', 'norte'],
  letras6: ['futuro', 'origem', 'aurora', 'brilho', 'eterno', 'abismo', 'esfera', 'chama', 'portal', 'trovão', 'vértice', 'prisma', 'ápice'],
  letras7mais: ['universo', 'galáxia', 'resiliência', 'harmonia', 'metamorfose', 'constelação', 'liberdade', 'serenidade', 'gravidade']
};

export function LotteryAndGamesSuite({ defaultTab = 'loterias' }: { defaultTab?: LotteryTabType }) {
  const [activeTab, setActiveTab] = useState<LotteryTabType>(defaultTab);
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
  // 1. LOTERIAS DA CAIXA STATE
  // ==========================================
  const [modalidade, setModalidade] = useState<ModalidadeLoteria>('megasena');
  const [qtdDezenas, setQtdDezenas] = useState<number>(6);
  const [qtdJogos, setQtdJogos] = useState<number>(1);
  const [jogosGerados, setJogosGerados] = useState<number[][]>([]);

  const handleMudarModalidade = (mod: ModalidadeLoteria) => {
    setModalidade(mod);
    setQtdDezenas(LOTERIAS_CONFIG[mod].defaultNum);
  };

  const gerarJogosLoterias = () => {
    const config = LOTERIAS_CONFIG[modalidade];
    const novosJogos: number[][] = [];

    for (let j = 0; j < qtdJogos; j++) {
      const numbersSet = new Set<number>();
      while (numbersSet.size < qtdDezenas) {
        if (modalidade === 'lotomania') {
          // Lotomania vai de 00 a 99
          numbersSet.add(Math.floor(Math.random() * 100));
        } else {
          // As outras começam em 1
          numbersSet.add(Math.floor(Math.random() * config.totalRange) + 1);
        }
      }
      const arr = Array.from(numbersSet).sort((a, b) => a - b);
      novosJogos.push(arr);
    }
    setJogosGerados(novosJogos);
  };

  React.useEffect(() => {
    gerarJogosLoterias();
  }, [modalidade, qtdDezenas, qtdJogos]);

  // ==========================================
  // 2. ROLETA DA SORTE STATE
  // ==========================================
  const [roletaItens, setRoletaItens] = useState<string[]>([
    'Prêmio Especial', 'Tente Outra Vez', 'Bônus 50%', 'Passou a Vez', 'Super Sorte', 'Prêmio Ouro', 'Desconto 20%', 'Gire Novamente'
  ]);
  const [novoItemRoleta, setNovoItemRoleta] = useState('');
  const [roletaRotation, setRoletaRotation] = useState(0);
  const [roletaSpinning, setRoletaSpinning] = useState(false);
  const [roletaVencedor, setRoletaVencedor] = useState<string | null>(null);

  const CORES_ROLETA = [
    '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'
  ];

  const handleAdicionarItemRoleta = () => {
    if (novoItemRoleta.trim()) {
      setRoletaItens([...roletaItens, novoItemRoleta.trim()]);
      setNovoItemRoleta('');
    }
  };

  const handleRemoverItemRoleta = (idx: number) => {
    if (roletaItens.length > 2) {
      setRoletaItens(roletaItens.filter((_, i) => i !== idx));
    }
  };

  const girarRoleta = () => {
    if (roletaSpinning || roletaItens.length < 2) return;
    setRoletaSpinning(true);
    setRoletaVencedor(null);

    // Giro completo: entre 5 e 8 voltas extras (1800 a 2880 graus) + fração aleatória
    const voltasExtras = 5 + Math.floor(Math.random() * 4);
    const anguloAleatorio = Math.floor(Math.random() * 360);
    const novoAnguloTotal = roletaRotation + voltasExtras * 360 + anguloAleatorio;
    setRoletaRotation(novoAnguloTotal);

    setTimeout(() => {
      setRoletaSpinning(false);
      // Calcular quem parou no ponteiro superior (topo = 270 graus ou 90 invertido)
      const sliceDeg = 360 / roletaItens.length;
      const normalizedAngle = (novoAnguloTotal % 360);
      // O ponteiro aponta no topo (270 graus). Ângulo sob o ponteiro:
      const winningIndex = Math.floor((360 - (normalizedAngle % 360) + 270) % 360 / sliceDeg) % roletaItens.length;
      setRoletaVencedor(roletaItens[winningIndex]);
    }, 4000);
  };

  // ==========================================
  // 3. EMBARALHADOR DE LISTAS STATE
  // ==========================================
  const [listaInput, setListaInput] = useState(
    'Vinícius Miranda\nGabriel Santos\nLucas Oliveira\nArthur Souza\nBernardo Lima\nMatheus Costa\nPedro Ferreira\nRafael Almeida'
  );
  const [modoEmbaralhar, setModoEmbaralhar] = useState<'shuffle' | 'sortear-um' | 'times'>('shuffle');
  const [qtdTimes, setQtdTimes] = useState(2);
  const [resultadoEmbaralhado, setResultadoEmbaralhado] = useState<string[]>([]);
  const [timesGerados, setTimesGerados] = useState<string[][]>([]);
  const [itemSorteadoUnico, setItemSorteadoUnico] = useState<string | null>(null);

  const processarLista = () => {
    const lines = listaInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // Fisher-Yates
    const shuffled = [...lines];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (modoEmbaralhar === 'shuffle') {
      setResultadoEmbaralhado(shuffled);
      setItemSorteadoUnico(null);
      setTimesGerados([]);
    } else if (modoEmbaralhar === 'sortear-um') {
      setItemSorteadoUnico(shuffled[0]);
      setResultadoEmbaralhado([]);
      setTimesGerados([]);
    } else if (modoEmbaralhar === 'times') {
      const teams: string[][] = Array.from({ length: qtdTimes }, () => []);
      shuffled.forEach((item, idx) => {
        teams[idx % qtdTimes].push(item);
      });
      setTimesGerados(teams);
      setResultadoEmbaralhado([]);
      setItemSorteadoUnico(null);
    }
  };

  React.useEffect(() => {
    processarLista();
  }, [modoEmbaralhar, qtdTimes]);

  // ==========================================
  // 4. PALAVRAS ALEATÓRIAS STATE
  // ==========================================
  const [filtroTamanhoPalavra, setFiltroTamanhoPalavra] = useState<'todas' | 'letras4' | 'letras5' | 'letras6' | 'letras7mais'>('todas');
  const [qtdPalavras, setQtdPalavras] = useState(5);
  const [palavrasGeradas, setPalavrasGeradas] = useState<string[]>([]);

  const gerarPalavras = () => {
    const pool = PALAVRAS_BASE[filtroTamanhoPalavra] || PALAVRAS_BASE.todas;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setPalavrasGeradas(shuffled.slice(0, qtdPalavras));
  };

  React.useEffect(() => {
    gerarPalavras();
  }, [filtroTamanhoPalavra, qtdPalavras]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Dices className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Loterias, Sorteios & Roleta da Sorte
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              INVERTEXTO SOBERANO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gerador de jogos oficiais da Caixa com visual de dezenas, roleta da sorte interativa, embaralhador e palavras aleatórias.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'loterias', label: 'Loterias da Caixa', icon: Award },
          { id: 'roleta', label: 'Roleta da Sorte Online', icon: CircleDot },
          { id: 'embaralhador', label: 'Embaralhador & Sorteador', icon: Shuffle },
          { id: 'palavras', label: 'Palavras Aleatórias', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          ABA 1: LOTERIAS DA CAIXA
      ========================================== */}
      {activeTab === 'loterias' && (
        <div className="space-y-6">
          {/* Seletor de Modalidade da Caixa */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LOTERIAS_CONFIG) as ModalidadeLoteria[]).map((mod) => {
              const cfg = LOTERIAS_CONFIG[mod];
              const isSelected = modalidade === mod;
              return (
                <button
                  key={mod}
                  onClick={() => handleMudarModalidade(mod)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? `${cfg.corBg} ${cfg.corBorder} ${cfg.corText} shadow-lg ring-1 ring-emerald-500/30`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cfg.nome}
                </button>
              );
            })}
          </div>

          {/* Configurações do Jogo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Quantidade de Dezenas ({LOTERIAS_CONFIG[modalidade].minNum} a {LOTERIAS_CONFIG[modalidade].maxNum}):
              </label>
              <input
                type="number"
                min={LOTERIAS_CONFIG[modalidade].minNum}
                max={LOTERIAS_CONFIG[modalidade].maxNum}
                value={qtdDezenas}
                onChange={(e) => setQtdDezenas(Math.max(LOTERIAS_CONFIG[modalidade].minNum, Math.min(LOTERIAS_CONFIG[modalidade].maxNum, parseInt(e.target.value) || LOTERIAS_CONFIG[modalidade].minNum)))}
                disabled={LOTERIAS_CONFIG[modalidade].minNum === LOTERIAS_CONFIG[modalidade].maxNum}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Quantidade de Jogos (1 a 10):
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={qtdJogos}
                onChange={(e) => setQtdJogos(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:border-emerald-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={gerarJogosLoterias}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" /> Gerar Palpites da Sorte
              </button>
            </div>
          </div>

          {/* Jogos Gerados com Bolas Oficiais */}
          <div className="space-y-4">
            {jogosGerados.map((jogo, jIdx) => (
              <div
                key={jIdx}
                className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    Jogo #{jIdx + 1} - {LOTERIAS_CONFIG[modalidade].nome} ({jogo.length} dezenas)
                  </span>
                  <button
                    onClick={() => copyToClipboard(jogo.map(n => String(n).padStart(2, '0')).join(' - '), `jogo-${jIdx}`)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
                    title="Copiar Dezenas"
                  >
                    {copiedKey === `jogo-${jIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === `jogo-${jIdx}` ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {jogo.map((num, nIdx) => (
                    <div
                      key={nIdx}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-black font-mono text-sm flex items-center justify-center shadow-md shadow-emerald-500/20 border-2 border-white/20 select-all"
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 2: ROLETA DA SORTE INTERATIVA
      ========================================== */}
      {activeTab === 'roleta' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Visualizador da Roleta (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-slate-800 rounded-3xl relative min-h-[460px]">
            {/* Ponteiro Superior */}
            <div className="absolute top-6 z-20 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.6)]" />
            </div>

            {/* Disco Circular da Roleta SVG */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 320 320"
                style={{
                  transform: `rotate(${roletaRotation}deg)`,
                  transition: roletaSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
                }}
                className="w-full h-full drop-shadow-2xl"
              >
                {roletaItens.map((item, idx) => {
                  const sliceAngle = 360 / roletaItens.length;
                  const startAngle = idx * sliceAngle;
                  const endAngle = startAngle + sliceAngle;

                  // SVG Arc Math
                  const toRad = (deg: number) => (deg * Math.PI) / 180;
                  const x1 = 160 + 150 * Math.cos(toRad(startAngle));
                  const y1 = 160 + 150 * Math.sin(toRad(startAngle));
                  const x2 = 160 + 150 * Math.cos(toRad(endAngle));
                  const y2 = 160 + 150 * Math.sin(toRad(endAngle));
                  const largeArc = sliceAngle > 180 ? 1 : 0;

                  const color = CORES_ROLETA[idx % CORES_ROLETA.length];

                  // Posição do texto no meio da fatia
                  const midAngle = startAngle + sliceAngle / 2;
                  const textRad = toRad(midAngle);
                  const tx = 160 + 95 * Math.cos(textRad);
                  const ty = 160 + 95 * Math.sin(textRad);

                  return (
                    <g key={idx}>
                      <path
                        d={`M 160 160 L ${x1} ${y1} A 150 150 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill="#ffffff"
                        fontSize={roletaItens.length > 8 ? '9' : '11'}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                        className="select-none pointer-events-none drop-shadow"
                      >
                        {item.length > 14 ? item.slice(0, 12) + '...' : item}
                      </text>
                    </g>
                  );
                })}

                {/* Centro Decorativo */}
                <circle cx="160" cy="160" r="28" fill="#020617" stroke="#38bdf8" strokeWidth="4" />
                <circle cx="160" cy="160" r="10" fill="#f59e0b" />
              </svg>
            </div>

            {/* Botão de Giro */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={girarRoleta}
                disabled={roletaSpinning || roletaItens.length < 2}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide uppercase transition shadow-xl shadow-amber-500/25 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                {roletaSpinning ? 'Girando a Sorte...' : 'GIRAR ROLETA!'}
              </button>

              {roletaVencedor && (
                <div className="p-3.5 px-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-bounce">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Opção Sorteada:</span>
                  <span className="text-lg font-black text-white">{roletaVencedor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gerenciamento de Opções da Roleta (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-2">
                Personalizar Opções da Roleta ({roletaItens.length})
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoItemRoleta}
                  onChange={(e) => setNovoItemRoleta(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdicionarItemRoleta()}
                  placeholder="Novo item da roleta..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                />
                <button
                  onClick={handleAdicionarItemRoleta}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {roletaItens.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CORES_ROLETA[idx % CORES_ROLETA.length] }}
                      />
                      <span className="text-xs text-slate-200">{item}</span>
                    </div>
                    {roletaItens.length > 2 && (
                      <button
                        onClick={() => handleRemoverItemRoleta(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remover Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 3: EMBARALHADOR DE LISTAS & TIMES
      ========================================== */}
      {activeTab === 'embaralhador' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Lista de Nomes ou Itens (1 por linha)
                </label>
                <textarea
                  value={listaInput}
                  onChange={(e) => setListaInput(e.target.value)}
                  className="w-full h-56 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />
              </div>

              {/* Modos de Sorteio */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'shuffle', label: 'Embaralhar' },
                  { id: 'sortear-um', label: 'Sortear 1 Item' },
                  { id: 'times', label: 'Dividir em Times' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModoEmbaralhar(m.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      modoEmbaralhar === m.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {modoEmbaralhar === 'times' && (
                <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 font-semibold">Número de Grupos / Times:</span>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={qtdTimes}
                    onChange={(e) => setQtdTimes(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white text-center font-mono"
                  />
                </div>
              )}

              <button
                onClick={processarLista}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Shuffle className="w-4 h-4" /> Executar Sorteio / Embaralhamento
              </button>
            </div>

            {/* Resultados (6 colunas) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Resultado: 1 Sorteado */}
              {itemSorteadoUnico && (
                <div className="p-6 bg-slate-950 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                  <span className="text-xs uppercase font-bold text-emerald-400 block">Item Sorteado:</span>
                  <div className="text-2xl font-black text-white font-mono">{itemSorteadoUnico}</div>
                </div>
              )}

              {/* Resultado: Embaralhado */}
              {resultadoEmbaralhado.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Lista Embaralhada ({resultadoEmbaralhado.length} itens):
                    </span>
                    <button
                      onClick={() => copyToClipboard(resultadoEmbaralhado.join('\n'), 'shuffleCopy')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Copiar Lista
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {resultadoEmbaralhado.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">#{idx + 1}</span>
                        <span className="text-xs text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultado: Times / Grupos */}
              {timesGerados.length > 0 && (
                <div className="space-y-3">
                  {timesGerados.map((time, tIdx) => (
                    <div key={tIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Time {tIdx + 1} ({time.length} membros)
                        </span>
                        <button
                          onClick={() => copyToClipboard(time.join(', '), `time-${tIdx}`)}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Copiar time
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {time.map((m, mIdx) => (
                          <span key={mIdx} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 text-xs border border-slate-800">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 4: PALAVRAS ALEATÓRIAS
      ========================================== */}
      {activeTab === 'palavras' && (
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Tamanho / Quantidade de Letras:
                </label>
                <select
                  value={filtroTamanhoPalavra}
                  onChange={(e) => setFiltroTamanhoPalavra(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  <option value="todas">Qualquer Tamanho</option>
                  <option value="letras4">4 Letras</option>
                  <option value="letras5">5 Letras</option>
                  <option value="letras6">6 Letras</option>
                  <option value="letras7mais">7 ou Mais Letras</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Quantidade de Palavras (1 a 20):
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={qtdPalavras}
                  onChange={(e) => setQtdPalavras(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={gerarPalavras}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Novas Palavras
              </button>
            </div>

            {/* Grid de Palavras */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Palavras Geradas ({palavrasGeradas.length}):
                </span>
                <button
                  onClick={() => copyToClipboard(palavrasGeradas.join(', '), 'copyPalavras')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Copiar Todas
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {palavrasGeradas.map((palavra, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between group hover:border-emerald-500/40 transition"
                  >
                    <span className="text-sm font-bold text-white capitalize">{palavra}</span>
                    <button
                      onClick={() => copyToClipboard(palavra, `pal-${idx}`)}
                      className="p-1 text-slate-500 group-hover:text-emerald-400 transition"
                      title="Copiar Palavra"
                    >
                      {copiedKey === `pal-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
