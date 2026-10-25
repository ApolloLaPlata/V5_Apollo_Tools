'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Copy, Check, Sparkles, RefreshCw, Flame, Eye, Target, TrendingUp, Layers } from 'lucide-react';

interface GeneratedTitle {
  title: string;
  ctrScore: number;
  trigger: string;
}

const TEMPLATES: Record<string, string[]> = {
  curiosidade: [
    'O Que Acontece Quando Você {TEMA}? O Resultado Chocou Todos',
    'Você Nunca Vai Acreditar No Que Aconteceu Com {TEMA}',
    'Descobri a Verdade Oculta Sobre {TEMA} (E Não É o Que Você Pensa)',
    'O Segredo Por Trás de {TEMA} Que Ninguém Te Conta',
    'Fiz {TEMA} Por 30 Dias e Isso Mudou Completamente Minha Rotina'
  ],
  controversia: [
    'Por Que 99% das Pessoas Fazem {TEMA} Errado (Pare Agora!)',
    'A Verdade Que Ninguém Tem Coragem de Falar Sobre {TEMA}',
    'Por Que Eu Não Recomendo {TEMA} Em 2026',
    'Parem de Te Enganar: {TEMA} Não Funciona Como Dizem',
    'O Maior Erro Que Destrói Seus Resultados Com {TEMA}'
  ],
  autoridade: [
    'Especialista Revela o Método Definitivo Para Dominar {TEMA}',
    'Como os Melhores do Mundo Executam {TEMA} Sem Erros',
    'A Estratégia Comprovada de {TEMA} Que Gerou Milhões',
    'O Guia Passo a Passo de {TEMA} Que os Profissionais Escondem',
    'Método Oficial: Como Criar {TEMA} Com Alta Performance'
  ],
  tutorial: [
    'Como Dominar {TEMA} Em Apenas 5 Passos Rápidos',
    'Tutorial Completo de {TEMA} Para Iniciantes (Do Zero)',
    'A Forma Mais Fácil e Rápida de Começar Com {TEMA} Hoje',
    'Como Eu Fiz {TEMA} Sem Gastar Nada (Passo a Passo Prático)',
    'Guia Definitivo: {TEMA} Explicado de Forma Simples'
  ],
  lista: [
    '7 Segredos de {TEMA} Que Vão Te Colocar na Frente de Todos',
    '5 Erros Fatais Que Você Comete Com {TEMA} Sem Perceber',
    '10 Ferramentas Indispensáveis Para Quem Trabalha Com {TEMA}',
    '3 Lições Que Aprendi Com {TEMA} Que Mudaram Meu Jogo',
    '5 Motivos Pelos Quais {TEMA} É a Maior Oportunidade Agora'
  ],
  urgencia: [
    'Faça Isso Com {TEMA} Antes Que Seja Tarde Demais',
    'Última Chance Para Dominar {TEMA} Desta Forma',
    'O Que Você Precisa Fazer Imediatamente Com {TEMA}',
    'Se Você Não Usar {TEMA} Agora, Vai Ficar Para Trás',
    'A Janela de Oportunidade Com {TEMA} Está Fechando'
  ]
};

export function ViralTitleGenerator() {
  const [topic, setTopic] = useState('Inteligência Artificial para E-commerce');
  const [platform, setPlatform] = useState<'youtube' | 'reels' | 'tiktok' | 'blog'>('youtube');
  const [trigger, setTrigger] = useState<'all' | 'curiosidade' | 'controversia' | 'autoridade' | 'tutorial' | 'lista' | 'urgencia'>('all');
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const calculateCtrScore = (titleText: string): number => {
    let score = 70;
    if (/\d+/.test(titleText)) score += 8; // Contains numbers
    if (/[()\[\]]/.test(titleText)) score += 7; // Contains brackets
    if (titleText.length >= 40 && titleText.length <= 65) score += 9; // Sweet spot length
    if (/Segredo|Verdade|Erro|Método|Definitivo|Nunca|Agora|Passo a Passo/i.test(titleText)) score += 6;
    return Math.min(99, score);
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;

    const cleanTopic = topic.trim();
    const generated: GeneratedTitle[] = [];

    const categoriesToUse = trigger === 'all' 
      ? ['curiosidade', 'controversia', 'autoridade', 'tutorial', 'lista', 'urgencia']
      : [trigger];

    categoriesToUse.forEach((cat) => {
      const catTemplates = TEMPLATES[cat] || [];
      catTemplates.forEach((tpl) => {
        let t = tpl.replace('{TEMA}', cleanTopic);
        if (platform === 'reels' || platform === 'tiktok') {
          // Add emoji for short video hooks
          const emojis = ['🔥', '🚨', '😱', '👀', '💡', '⚠️'];
          const randEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          t = `${randEmoji} ${t}`;
        }
        generated.push({
          title: t,
          ctrScore: calculateCtrScore(t),
          trigger: cat.toUpperCase()
        });
      });
    });

    // Sort by highest CTR score
    generated.sort((a, b) => b.ctrScore - a.ctrScore);
    setTitles(generated.slice(0, 12));
  };

  React.useEffect(() => {
    handleGenerate();
  }, [trigger, platform]);

  const copySingleTitle = (title: string, idx: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllTitles = () => {
    if (titles.length === 0) return;
    const text = titles.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Amber Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gerador de Títulos Virais & Ganchos de Alta CTR
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              APOLLO LA PLATA ACERVO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Fórmulas psicológicas comprovadas de retenção e clique para YouTube, Reels e TikTok com pontuação estimada de CTR.
          </p>
        </div>

        {/* Plataforma Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setPlatform('youtube')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              platform === 'youtube'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            YouTube
          </button>
          <button
            onClick={() => setPlatform('reels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              platform === 'reels'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shorts / Reels
          </button>
          <button
            onClick={() => setPlatform('tiktok')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              platform === 'tiktok'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setPlatform('blog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              platform === 'blog'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Blog / SEO
          </button>
        </div>
      </div>

      {/* Inputs & Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        {/* Assunto / Tema */}
        <div className="md:col-span-8">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tema ou Nicho do Conteúdo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Ex: Marketing Digital, Como Investir, Criação com IA..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
            />
            <button
              onClick={handleGenerate}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Gerar
            </button>
          </div>
        </div>

        {/* Gatilho Mental */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Gatilho Mental Predominante
          </label>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as any)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Todos os Gatilhos (Mix de Alta CTR)</option>
            <option value="curiosidade">Curiosidade Extrema</option>
            <option value="controversia">Controvérsia & Erro Comum</option>
            <option value="autoridade">Autoridade & Especialista</option>
            <option value="tutorial">Tutorial Passo a Passo</option>
            <option value="lista">Lista & Números Específicos</option>
            <option value="urgencia">Urgência & Escassez</option>
          </select>
        </div>
      </div>

      {/* Lista de Títulos Gerados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            {titles.length} Títulos Otimizados para Alta Taxa de Clique (CTR)
          </span>

          <button
            onClick={copyAllTitles}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1.5"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'Todos Copiados!' : 'Copiar Todos'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {titles.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 group transition"
            >
              <div className="space-y-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                    CTR ~{item.ctrScore}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {item.trigger}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-200 truncate select-all">
                  {item.title}
                </p>
              </div>

              <button
                onClick={() => copySingleTitle(item.title, idx)}
                className="p-2 rounded-xl bg-slate-900 group-hover:bg-slate-800 text-slate-400 group-hover:text-white transition shrink-0 cursor-pointer"
                title="Copiar título"
              >
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
