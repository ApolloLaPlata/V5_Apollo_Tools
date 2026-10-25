'use client';

import React, { useState, useMemo } from 'react';
import { Film, Video, FileText, Hash, Sparkles, Copy, Check, RefreshCw, Layers, Clock, Zap } from 'lucide-react';

export function ApolloLaPlataSuite({ defaultTab = 'roteiro' }: { defaultTab?: 'roteiro' | 'veo3' | 'descricao' | 'hashtags' }) {
  const [activeTab, setActiveTab] = useState<'roteiro' | 'veo3' | 'descricao' | 'hashtags'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // --- ROTEIRO STATE ---
  const [temaRoteiro, setTemaRoteiro] = useState('Como Ganhar Dinheiro com IA em 2026');
  const [duracaoRoteiro, setDuracaoRoteiro] = useState<'30s' | '60s'>('30s');
  const [tomRoteiro, setTomRoteiro] = useState<'dinamico' | 'dramatico' | 'curiosidade'>('dinamico');

  // --- VEO3 STATE ---
  const [cenaDesc, setCenaDesc] = useState('Um astronauta descobrindo ruínas antigas bioluminescentes em Marte');
  const [movimentoCam, setMovimentoCam] = useState('Dolly-in lento e suave em direção ao personagem');
  const [iluminacaoVeo, setIluminacaoVeo] = useState('Luz crepuscular avermelhada com reflexos azuis neon');
  const [somDiegetico, setSomDiegetico] = useState('Respiração no capacete, vento marciano suave, zumbido elétrico');

  // --- DESCRIÇÃO STATE ---
  const [temaDesc, setTemaDesc] = useState('O Fim dos Empregos Tradicionais: Como a IA Mudou Tudo');

  // --- HASHTAGS STATE ---
  const [nichoHashtag, setNichoHashtag] = useState('inteligencia artificial');

  // --- ROTEIRO GENERATOR ---
  const roteiroGerado = useMemo(() => {
    const tema = temaRoteiro.trim() || 'Seu Tema Aqui';
    if (duracaoRoteiro === '30s') {
      return `[00:00 - 00:03] GANCHO (HOOK VIRAL)
Visual: Olhar fixo para a câmera, corte rápido com zoom in.
Locução: "Se você ainda não sabe disso sobre ${tema}, você está perdendo tempo e dinheiro!"

[00:03 - 00:15] O PROBLEMA / CURIOSIDADE
Visual: Tela dividida ou b-roll dinâmico acelerado.
Locução: "A maioria das pessoas tenta fazer isso do jeito antigo e falha miseravelmente. Mas existe um método simples que quase ninguém fala abertamente."

[00:15 - 00:25] A REVELAÇÃO / SOLUÇÃO
Visual: Demonstração prática do resultado na tela.
Locução: "Em vez de se matar trabalhando horas, você só precisa aplicar estes 3 passos práticos para dominar ${tema} ainda hoje."

[00:25 - 00:30] CHAMADA PARA AÇÃO (CTA)
Visual: Texto chamativo na tela com seta para o botão.
Locução: "Comente 'EU QUERO' aqui embaixo que eu te envio o link completo no direct!"`;
    }

    return `[00:00 - 00:05] GANCHO PODEROSO (RETENÇÃO MÁXIMA)
Visual: Cena de impacto ou texto na tela com efeito sonoro de impacto.
Locução: "Pare tudo o que você está fazendo. O que eu vou te mostrar sobre ${tema} vai mudar sua visão completamente."

[00:05 - 00:20] A QUEBRA DE PADRÃO
Visual: B-roll mostrando o erro comum que todos cometem.
Locução: "Por anos nos disseram que para ter sucesso com ${tema} você precisava gastar fortunas ou estudar anos. Mas isso é uma mentira deslavada."

[00:20 - 00:40] O PASSO A PASSO DA SOLUÇÃO
Visual: Três etapas claras numeradas (1, 2, 3) na tela.
Locução: "Passo 1: Identifique a brecha que ninguém está explorando. Passo 2: Use automação simples para acelerar 10x. Passo 3: Coloque para rodar no piloto automático."

[00:40 - 00:55] PROVA & TRANSFORMAÇÃO
Visual: Gráfico ou demonstração rápida de resultado real.
Locução: "Quem aplicou isso nas últimas semanas já viu a diferença brutal na prática, sem complicação."

[00:55 - 01:00] CTA DIRETO
Visual: Apontando para o perfil e botão de seguir.
Locução: "Salva esse vídeo para não esquecer e segue o perfil para não perder a parte 2!"`;
  }, [temaRoteiro, duracaoRoteiro, tomRoteiro]);

  // --- VEO3 PROMPT GENERATOR ---
  const veo3Prompt = useMemo(() => {
    return `[SCENE]: ${cenaDesc}.
[CAMERA MOVEMENT]: ${movimentoCam}, steady cinematic stabilization, 24fps motion cadence.
[LIGHTING & MOOD]: ${iluminacaoVeo}, volumetric atmosphere, photorealistic depth of field.
[DIEGETIC AUDIO]: ${somDiegetico}.
[STYLE]: 8k UHD film still, cinematic anamorphic lens, realistic physics, color graded, photorealism.`;
  }, [cenaDesc, movimentoCam, iluminacaoVeo, somDiegetico]);

  // --- DESCRIÇÃO SEO GENERATOR ---
  const descricaoSeo = useMemo(() => {
    return `📌 ${temaDesc}

Neste vídeo completo, revelamos tudo o que você precisa saber sobre ${temaDesc}. Entenda as estratégias, técnicas e ferramentas mais avançadas para aplicar hoje mesmo e sair na frente da concorrência.

⏱️ CAPÍTULOS DO VÍDEO:
00:00 - Introdução & Gancho
01:15 - O Grande Erro Que Todos Cometem
03:40 - Revelando o Método Passo a Passo
07:20 - Dicas Secretas de Performance
10:00 - Conclusão & Próximos Passos

🚀 LINKS IMPORTANTES:
👉 Conheça a suíte completa no V5 Apollo Tools
👉 Inscreva-se no canal para mais conteúdos exclusivos!

#${temaDesc.toLowerCase().replace(/[^a-z0-9]/g, '')} #tecnologia #inovacao #marketingdigital`;
  }, [temaDesc]);

  // --- HASHTAGS GENERATOR ---
  const hashtagsGeradas = useMemo(() => {
    const clean = nichoHashtag.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return {
      altas: [`#${clean}`, `#${clean}brasil`, `#${clean}2026`, '#tecnologia', '#inovacao', '#viral', '#explore'],
      medias: [`#dicasde${clean}`, `#comofazer${clean}`, `#${clean}parainiciantes`, `#ferramentasde${clean}`, `#produtividade`],
      nicho: [`#${clean}inteligente`, `#segredosde${clean}`, `#hackde${clean}`, `#${clean}pro`, `#holdingv5`]
    };
  }, [nichoHashtag]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte Criativa APOLLO La PLATA (Roteiros & Vídeo IA)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              APOLLO LA PLATA OFICIAL
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Roteiros com hooks de retenção para Shorts/Reels, prompts para Veo 3 / Sora e descrições para SEO.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'roteiro', label: 'Roteiros Virais (30-60s)' },
          { id: 'veo3', label: 'Prompts Veo 3 / Sora' },
          { id: 'descricao', label: 'Descrições para SEO' },
          { id: 'hashtags', label: 'Hashtags Segmentadas' }
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

      {/* ABA: ROTEIROS VIRAIS */}
      {activeTab === 'roteiro' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tema do Roteiro:</label>
              <input
                type="text"
                value={temaRoteiro}
                onChange={(e) => setTemaRoteiro(e.target.value)}
                placeholder="Ex: 3 Ferramentas Secretas de IA..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-4 flex items-end gap-2">
              <button
                onClick={() => setDuracaoRoteiro('30s')}
                className={`w-1/2 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  duracaoRoteiro === '30s' ? 'bg-purple-500 text-slate-950 border-purple-400' : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}
              >
                30 Segundos
              </button>
              <button
                onClick={() => setDuracaoRoteiro('60s')}
                className={`w-1/2 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  duracaoRoteiro === '60s' ? 'bg-purple-500 text-slate-950 border-purple-400' : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}
              >
                60 Segundos
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-400">Roteiro Completo com Gatilhos de Retenção</span>
              <button
                onClick={() => copyToClipboard(roteiroGerado, 'roteiro')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'roteiro' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'roteiro' ? 'Copiado!' : 'Copiar Roteiro'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
              {roteiroGerado}
            </pre>
          </div>
        </div>
      )}

      {/* ABA: PROMPTS VEO 3 / SORA */}
      {activeTab === 'veo3' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Cena Principal:</label>
              <input
                type="text"
                value={cenaDesc}
                onChange={(e) => setCenaDesc(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Movimento de Câmera:</label>
              <input
                type="text"
                value={movimentoCam}
                onChange={(e) => setMovimentoCam(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Iluminação & Atmosfera:</label>
              <input
                type="text"
                value={iluminacaoVeo}
                onChange={(e) => setIluminacaoVeo(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Áudio Diegético & Efeitos Sonoros (SFX):</label>
              <input
                type="text"
                value={somDiegetico}
                onChange={(e) => setSomDiegetico(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-400">Prompt Estruturado para Geração de Vídeo</span>
              <button
                onClick={() => copyToClipboard(veo3Prompt, 'veo3')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'veo3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'veo3' ? 'Copiado!' : 'Copiar Prompt'}
              </button>
            </div>
            <pre className="text-xs font-mono text-purple-200 whitespace-pre-wrap leading-relaxed select-all">
              {veo3Prompt}
            </pre>
          </div>
        </div>
      )}

      {/* ABA: DESCRIÇÃO SEO */}
      {activeTab === 'descricao' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Título / Tema do Vídeo ou Artigo:</label>
            <input
              type="text"
              value={temaDesc}
              onChange={(e) => setTemaDesc(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500"
            />
          </div>

          <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-400">Descrição Otimizada para SEO (YouTube & Blog)</span>
              <button
                onClick={() => copyToClipboard(descricaoSeo, 'desc')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'desc' ? 'Copiado!' : 'Copiar Descrição'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
              {descricaoSeo}
            </pre>
          </div>
        </div>
      )}

      {/* ABA: HASHTAGS */}
      {activeTab === 'hashtags' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Palavra-Chave / Nicho:</label>
            <input
              type="text"
              value={nichoHashtag}
              onChange={(e) => setNichoHashtag(e.target.value)}
              placeholder="Ex: marketing digital, finanças, ComfyUI..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Alto Volume (Alcance)</span>
              <p className="text-xs font-mono text-slate-300 leading-relaxed select-all">{hashtagsGeradas.altas.join(' ')}</p>
              <button
                onClick={() => copyToClipboard(hashtagsGeradas.altas.join(' '), 'hash-altas')}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'hash-altas' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar Tags
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Médio Volume (Engajamento)</span>
              <p className="text-xs font-mono text-slate-300 leading-relaxed select-all">{hashtagsGeradas.medias.join(' ')}</p>
              <button
                onClick={() => copyToClipboard(hashtagsGeradas.medias.join(' '), 'hash-medias')}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'hash-medias' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar Tags
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 block">Foco / Ultra-Nicho</span>
              <p className="text-xs font-mono text-slate-300 leading-relaxed select-all">{hashtagsGeradas.nicho.join(' ')}</p>
              <button
                onClick={() => copyToClipboard(hashtagsGeradas.nicho.join(' '), 'hash-nicho')}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'hash-nicho' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar Tags
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
