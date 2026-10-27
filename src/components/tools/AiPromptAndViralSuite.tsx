'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Wand2, 
  Flame, 
  Target, 
  UserCheck, 
  Tag, 
  Sliders, 
  Video, 
  TrendingUp, 
  Lightbulb, 
  Film, 
  Layers, 
  Award,
  ArrowRight
} from 'lucide-react';

export type AiPromptTab = 'prompt-optimizer' | 'viral-hooks' | 'cta-matrix' | 'character-bible' | 'youtube-tags';

export function AiPromptAndViralSuite({ defaultTab = 'prompt-optimizer' }: { defaultTab?: AiPromptTab }) {
  const [activeTab, setActiveTab] = useState<AiPromptTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
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
  // TAB 1: OTIMIZADOR UNIVERSAL DE PROMPTS (FRAMEWORKS)
  // ==========================================
  const [rawIdea, setRawIdea] = useState<string>('Quero um roteiro para vender um curso online de inteligência artificial');
  const [framework, setFramework] = useState<'RTF' | 'RISEN' | 'CoT' | 'STAR' | 'CLEAR'>('RTF');
  const [optimizedPromptOutput, setOptimizedPromptOutput] = useState<string>('');

  const generateFrameworkPrompt = (idea: string, fw: string) => {
    if (!idea.trim()) {
      setOptimizedPromptOutput('');
      return;
    }

    if (fw === 'RTF') {
      setOptimizedPromptOutput(
`[PAPEL / ROLE]
Você é um estrategista de conteúdo de elite e copywriter de resposta direta especializado em conversão para produtos digitais de alta tecnologia.

[TAREFA / TASK]
Com base na seguinte premissa: "${idea}", elabore uma estrutura completa de roteiro persuasivo aplicando gatilhos de autoridade, dor, solução e chamada para ação.

[FORMATO / FORMAT]
- Entregue a resposta dividida estritamente nas seções:
  1. Gancho Inicial (0-3s)
  2. Identificação da Dor Latente (4-15s)
  3. Apresentação da Oportunidade / Mecanismo Único (16-40s)
  4. Chamada para Ação Irresistível (41-60s)
- Mantenha tom enérgico, linguagem acessível e sem jargões corporativos vazios.`
      );
    } else if (fw === 'RISEN') {
      setOptimizedPromptOutput(
`[ROLE - PAPEL]
Atue como um arquiteto sênior de inteligência artificial e consultor sênior de negócios.

[INSTRUCTIONS - INSTRUÇÕES]
Analise e desenvolva a seguinte solicitação: "${idea}".

[STEPS - PASSOS]
1. Identifique o público-alvo prioritário e o nível de sofisticação de mercado.
2. Formule 3 ângulos únicos de diferenciação contra soluções concorrentes.
3. Elabore um plano de execução tático com cronograma sugerido.
4. Liste 3 armadilhas comuns e como evitá-las.

[END GOAL - OBJETIVO FINAL]
Criar uma estratégia à prova de falhas com alta clareza operacional e retorno mensurável.

[NARROWING - RESTRIÇÕES]
Não utilize generalismos. Cada recomendação deve ser prática, acionável e fundamentada em dados reais.`
      );
    } else if (fw === 'CoT') {
      setOptimizedPromptOutput(
`Resolva o seguinte desafio de forma metódica e passo a passo: "${idea}".

Pense em voz alta antes de apresentar o resultado final. Siga a estrutura analítica abaixo:
Passo 1: Decomponha o problema central em suas partes fundamentais.
Passo 2: Avalie as premissas e variáveis ocultas que podem influenciar o resultado.
Passo 3: Explore pelo menos duas abordagens alternativas antes de escolher a solução ideal.
Passo 4: Sintetize a solução final recomendada acompanhada de uma justificativa lógica rigorosa.`
      );
    } else if (fw === 'STAR') {
      setOptimizedPromptOutput(
`Com base no tema: "${idea}", formule um estudo de caso persuasivo no framework STAR:

- SITUAÇÃO (Situation): O cenário desafiador inicial enfrentado pelo mercado ou cliente.
- TAREFA (Task): A meta crítica que precisava ser atingida para reverter o quadro.
- AÇÃO (Action): A metodologia exata, ferramentas e decisões estratégicas implementadas.
- RESULTADO (Result): Os números, métricas de crescimento e impacto tangível alcançado.`
      );
    } else {
      // CLEAR
      setOptimizedPromptOutput(
`[CLEAR FRAMEWORK PROMPT]
Tema: "${idea}"

Diretrizes de Execução:
- Conciso (Concise): Resposta direta, sem introduções vazias ou agradecimentos.
- Lógico (Logical): Argumentação em tópicos ordenados por relevância e impacto.
- Explícito (Explicit): Detalhe exatamente o que fazer, como fazer e quais métricas acompanhar.
- Adaptável (Adaptive): Estruture a solução para fácil aplicação em diferentes nichos.
- Reflexivo (Reflective): Inclua um checklist de validação rápida para o usuário.`
      );
    }
  };

  useEffect(() => {
    generateFrameworkPrompt(rawIdea, framework);
  }, [rawIdea, framework]);

  // ==========================================
  // TAB 2: GERADOR DE GANCHOS VIRAIS
  // ==========================================
  const [hookTopic, setHookTopic] = useState<string>('Inteligência Artificial');
  const [generatedHooks, setGeneratedHooks] = useState<{ hook: string; score: string; type: string }[]>([]);

  const generateViralHooks = (topic: string) => {
    const list = [
      { hook: `Pare de gastar horas com ${topic}. O que eu vou te mostrar em 30 segundos muda tudo.`, score: '9.9/10', type: 'Quebra de Padrão' },
      { hook: `99% das pessoas que tentam aprender ${topic} estão cometendo esse erro fatal sem saber.`, score: '9.8/10', type: 'Alerta de Perda' },
      { hook: `Esta ferramenta secreta de ${topic} é tão poderosa que parece até ilegal.`, score: '9.7/10', type: 'Curiosidade Proibida' },
      { hook: `Eu testei as 5 maiores ferramentas de ${topic} por 30 dias e esse foi o resultado chocante.`, score: '9.6/10', type: 'Estudo de Caso' },
      { hook: `Se você não dominar ${topic} até o final deste ano, sua profissão corre sério perigo.`, score: '9.5/10', type: 'Urgência Futura' },
      { hook: `O segredo de ${topic} que as grandes empresas guardam a sete chaves... revelado agora.`, score: '9.4/10', type: 'Segredo Revelado' },
      { hook: `Como eu saí do zero absoluto em ${topic} até faturar com isso em apenas 3 semanas.`, score: '9.3/10', type: 'Transformação Pessoal' },
      { hook: `Nunca mais pague por softwares caros: esse método gratuito de ${topic} faz exatamente o mesmo.`, score: '9.2/10', type: 'Economia Radical' }
    ];
    setGeneratedHooks(list);
  };

  useEffect(() => {
    generateViralHooks(hookTopic);
  }, [hookTopic]);

  // ==========================================
  // TAB 3: MATRIZ DE CTAs PERSUASIVAS
  // ==========================================
  const [ctaGoal, setCtaGoal] = useState<'comments' | 'shares' | 'sales' | 'leads'>('comments');

  const getCtaList = (goal: string) => {
    if (goal === 'comments') {
      return [
        { text: 'Comente "EU QUERO" que eu te envio o link direto e o material completo no seu direct agora mesmo!', trigger: 'Automação ManyChat' },
        { text: 'Você concorda ou discorda? Deixa sua opinião sincera aqui nos comentários pra gente debater.', trigger: 'Polarização Saudável' },
        { text: 'Qual dessas opções você escolheria? Digite 1 ou 2 aqui embaixo.', trigger: 'Micro-Compromisso' },
        { text: 'Comente a palavra "FERRAMENTA" para receber a lista secreta das melhores plataformas.', trigger: 'Gatilho de Acesso Exclusivo' }
      ];
    }
    if (goal === 'shares') {
      return [
        { text: 'Manda esse vídeo para aquele amigo que passa horas sofrendo com isso e precisa dessa solução!', trigger: 'Ajuda a um Amigo' },
        { text: 'Compartilhe nos seus stories se você concorda que o mercado precisa mudar.', trigger: 'Afirmação de Identidade' },
        { text: 'Salva este post agora mesmo porque o algoritmo não vai te mostrar isso de novo amanhã.', trigger: 'Escassez Algorítmica' }
      ];
    }
    if (goal === 'sales') {
      return [
        { text: 'Toque no link da bio para garantir sua vaga com 50% de desconto antes que o lote vire hoje à meia-noite!', trigger: 'Urgência Cronológica' },
        { text: 'As primeiras 20 pessoas ganham mentoria individual gratuita. Clique no link agora!', trigger: 'Bônus Limitado' },
        { text: 'Acesse o site oficial e comece hoje com 7 dias de garantia incondicional e risco zero.', trigger: 'Inversão Total de Risco' }
      ];
    }
    return [
      { text: 'Baixe o checklist gratuito em PDF no link da bio e comece a aplicar imediatamente.', trigger: 'Lead Magnet Imediato' },
      { text: 'Entre no nosso grupo VIP silencioso no WhatsApp para receber alertas em primeira mão.', trigger: 'Comunidade Exclusiva' },
      { text: 'Cadastre seu e-mail para receber a análise técnica completa toda segunda-feira de manhã.', trigger: 'Hábito de Valor' }
    ];
  };

  const currentCtas = getCtaList(ctaGoal);

  // ==========================================
  // TAB 4: BÍBLIA DE PERSONAGEM & CONSISTÊNCIA IA
  // ==========================================
  const [charName, setCharName] = useState<string>('Aria Vance');
  const [charArchetype, setCharArchetype] = useState<string>('Engenheira Cyberpunk / Hacker Ética');
  const [charFeatures, setCharFeatures] = useState<string>('Mulher de 26 anos, olhos amendoados castanho-claros, cabelo curto assimétrico roxo elétrico, leve cicatriz na sobrancelha esquerda, pele bronzeada natural');
  const [charWardrobe, setCharWardrobe] = useState<string>('Jaqueta tática preta de couro sintético com detalhes em ciano luminoso, gola alta, luvas sem dedos');
  const [charCamera, setCharCamera] = useState<string>('85mm portrait lens, f/1.4 aperture, cinematic rim lighting, volumetric dust particles, shallow depth of field, 8k resolution');

  const masterSeedPrompt = `Master Portrait of ${charName}, ${charArchetype}. ${charFeatures}. Wearing ${charWardrobe}. Shot on ${charCamera}, photorealistic, award winning cinematic photography, unreal engine 5 render, highly detailed skin texture, master composition.`;

  // ==========================================
  // TAB 5: AGRUPADOR DE TAGS YOUTUBE SEO
  // ==========================================
  const [ytMainKeyword, setYtMainKeyword] = useState<string>('ComfyUI Tutorial');
  const [ytTagsOutput, setYtTagsOutput] = useState<string>('');

  const generateYtTags = (kw: string) => {
    if (!kw.trim()) {
      setYtTagsOutput('');
      return;
    }
    const clean = kw.trim();
    const tags = [
      clean,
      `${clean} tutorial`,
      `${clean} passo a passo`,
      `como usar ${clean}`,
      `${clean} para iniciantes`,
      `${clean} 2026`,
      `${clean} workflow`,
      `melhores nós ${clean}`,
      `dicas ${clean}`,
      `${clean} inteligência artificial`,
      `guia completo ${clean}`,
      `${clean} gratis`,
      `${clean} curso`
    ];
    setYtTagsOutput(tags.join(', '));
  };

  useEffect(() => {
    generateYtTags(ytMainKeyword);
  }, [ytMainKeyword]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de Engenharia de Prompt & Roteirização Viral
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Apollo La Plata · Etapa 30
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Frameworks de Elite (RTF, RISEN, CoT), Ganchos Virais para Reels/Shorts, Matriz de CTAs, Bíblia de Personagem e Tags YouTube.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('prompt-optimizer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'prompt-optimizer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompt Frameworks</span>
          </button>
          <button
            onClick={() => setActiveTab('viral-hooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'viral-hooks'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Ganchos Virais</span>
          </button>
          <button
            onClick={() => setActiveTab('cta-matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'cta-matrix'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Matriz de CTAs</span>
          </button>
          <button
            onClick={() => setActiveTab('character-bible')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'character-bible'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Bíblia de Personagem</span>
          </button>
          <button
            onClick={() => setActiveTab('youtube-tags')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'youtube-tags'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Tags YouTube</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: PROMPT FRAMEWORKS */}
        {/* ========================================== */}
        {activeTab === 'prompt-optimizer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Ideia Base / Intenção
                  </div>

                  <textarea
                    rows={4}
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    placeholder="Digite sua ideia crua..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />

                  {/* Seleção de Framework */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-xs text-slate-400 block font-mono">Framework de Engenharia:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {(['RTF', 'RISEN', 'CoT', 'STAR', 'CLEAR'] as const).map((fw) => (
                        <button
                          key={fw}
                          onClick={() => setFramework(fw)}
                          className={`p-2 rounded-lg font-mono text-center border transition ${
                            framework === fw
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {fw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Saída Otimizada */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Prompt Estruturado ({framework})
                    </span>
                    <button
                      onClick={() => copyToClipboard(optimizedPromptOutput, 'fw-prompt')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'fw-prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Prompt
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {optimizedPromptOutput}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: GANCHOS VIRAIS */}
        {/* ========================================== */}
        {activeTab === 'viral-hooks' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Tema do Vídeo / Nicho:
                  </span>
                  <input
                    type="text"
                    value={hookTopic}
                    onChange={(e) => setHookTopic(e.target.value)}
                    placeholder="Ex: IA, Programação, E-commerce..."
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lista de Ganchos */}
              <div className="space-y-2.5 pt-2">
                {generatedHooks.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {item.type}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          Score CTR: {item.score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        "{item.hook}"
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(item.hook, `hook-${idx}`)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 mt-1"
                    >
                      {copiedKey === `hook-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: MATRIZ DE CTAs */}
        {/* ========================================== */}
        {activeTab === 'cta-matrix' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Objetivo Central de Conversão:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['comments', 'shares', 'sales', 'leads'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setCtaGoal(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                        ctaGoal === g ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {g === 'comments' ? 'Comentários' : g === 'shares' ? 'Compartilhamentos' : g === 'sales' ? 'Venda Direta' : 'Leads'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de CTAs */}
              <div className="space-y-2.5 pt-2">
                {currentCtas.map((cta, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                        Gatilho: {cta.trigger}
                      </span>
                      <p className="text-xs text-slate-200 font-medium">
                        "{cta.text}"
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cta.text, `cta-${idx}`)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedKey === `cta-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: BÍBLIA DE PERSONAGEM */}
        {/* ========================================== */}
        {activeTab === 'character-bible' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Ficha Cadastral */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-1">
                    Ficha Canônica do Personagem
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Nome do Personagem</label>
                      <input
                        type="text"
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-cyan-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Arquétipo / Papel</label>
                      <input
                        type="text"
                        value={charArchetype}
                        onChange={(e) => setCharArchetype(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Traços Físicos & Rosto</label>
                    <textarea
                      rows={2}
                      value={charFeatures}
                      onChange={(e) => setCharFeatures(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Vestuário Padrão</label>
                    <textarea
                      rows={2}
                      value={charWardrobe}
                      onChange={(e) => setCharWardrobe(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Master Seed Prompt */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Master Seed Prompt (ComfyUI / FLUX)
                    </span>
                    <button
                      onClick={() => copyToClipboard(masterSeedPrompt, 'master-seed')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'master-seed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Seed
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {masterSeedPrompt}
                  </pre>
                  <p className="text-[10px] text-slate-500">
                    Mantenha essa semente fixa em todas as gerações de cena para preservar a identidade visual do personagem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: TAGS YOUTUBE SEO */}
        {/* ========================================== */}
        {activeTab === 'youtube-tags' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Palavra-Chave Principal:
                  </span>
                  <input
                    type="text"
                    value={ytMainKeyword}
                    onChange={(e) => setYtMainKeyword(e.target.value)}
                    placeholder="Ex: Next.js Tutorial..."
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => copyToClipboard(ytTagsOutput, 'yt-tags')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition self-start sm:self-auto"
                >
                  {copiedKey === 'yt-tags' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Todas as Tags ({ytTagsOutput.length} Chars)
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={ytTagsOutput}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none select-all resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Pronto para colar diretamente no campo de tags do YouTube Studio.</span>
                <span className={ytTagsOutput.length <= 500 ? 'text-emerald-400' : 'text-rose-400'}>
                  {ytTagsOutput.length} / 500 caracteres
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
