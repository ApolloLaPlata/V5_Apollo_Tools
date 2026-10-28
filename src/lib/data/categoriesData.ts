export interface MacroCategory {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  badge: string;
  subcategories: {
    id: string;
    name: string;
    description: string;
  }[];
  featuredTools: string[];
}

export const MACRO_CATEGORIES: MacroCategory[] = [
  {
    id: 'imagem-ia',
    name: 'Edição de Imagem & IA Visual',
    shortName: '🖼️ Imagem & IA',
    icon: 'ImageIcon',
    description: 'Workflows ComfyUI de geração, remoção de fundo, upscale 4K, troca de rosto (Face Swap) e fotografia de produto.',
    color: 'purple',
    gradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent border-purple-200 hover:border-purple-400',
    badge: 'ComfyUI & IA',
    subcategories: [
      { id: 'all', name: 'Todas em Imagem', description: 'Todos os utilitários visuais' },
      { id: 'comfyui-workflows', name: 'Workflows ComfyUI', description: 'Nós e grafos de IA generativa' },
      { id: 'upscale-restore', name: 'Upscale 4K & Restauração', description: 'Super-resolução e nitidez' },
      { id: 'face-portrait', name: 'Troca de Rosto & Animação', description: 'Face Swap ReActor e LivePortrait' },
      { id: 'vector-optimization', name: 'Vetores, SVG & Compressão', description: 'Otimização e conversão de formatos' }
    ],
    featuredTools: [
      'face-swap-reactor',
      'ultrasharp-4k-upscale',
      'idm-vton-try-on',
      'product-photography-comfy',
      'ic-light-relighting',
      'vector-pixel-suite'
    ]
  },
  {
    id: 'video-audio',
    name: 'Vídeo, Áudio & Multimídia',
    shortName: '🎬 Vídeo & Áudio',
    icon: 'Video',
    description: 'Geradores de vídeo cinemático, animação de retratos, estúdio de som, equalizador, ruído de foco e gravação.',
    color: 'rose',
    gradient: 'from-rose-500/10 via-pink-500/5 to-transparent border-rose-200 hover:border-rose-400',
    badge: 'Estúdio Multimídia',
    subcategories: [
      { id: 'all', name: 'Todas em Vídeo/Áudio', description: 'Todos os utilitários audiovisuais' },
      { id: 'video-gen', name: 'Geração & Animação de Vídeo', description: 'Wan 2.1, CogVideoX e LivePortrait' },
      { id: 'audio-studio', name: 'Áudio, Voz & Som', description: 'Síntese de voz, filtros e ruído de foco' },
      { id: 'media-codecs', name: 'Codecs & Streaming WebRTC', description: 'Processamento e conversão' }
    ],
    featuredTools: [
      'wan-video-generator',
      'liveportrait-animation',
      'media-audio-studio-suite',
      'audio-video-social-suite',
      'spatial-audio-ambisonics-suite'
    ]
  },
  {
    id: 'documentos-fiscal',
    name: 'Documentos, Cadastros & Fiscal',
    shortName: '📄 Documentos & Fiscal',
    icon: 'FileText',
    description: 'Geradores e validadores de CPF, CNPJ, dados para testes, cálculos de tributos (MEI/Simples), contratos e declarações A4.',
    color: 'emerald',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200 hover:border-emerald-400',
    badge: 'Oficial Brasil',
    subcategories: [
      { id: 'all', name: 'Todos em Documentos', description: 'Todos os documentos e validadores' },
      { id: 'docs-pessoais', name: 'Documentos Pessoais', description: 'CPF, RG, CNH, PIS, Título' },
      { id: 'empresas-tributos', name: 'Empresas & Tributos', description: 'CNPJ, Inscrição Estadual, DAS-MEI, DIFAL' },
      { id: 'contratos-a4', name: 'Contratos & Declarações A4', description: 'Modelos prontos para impressão' },
      { id: 'bancos-contas', name: 'Bancos & Validação de Cartões', description: 'Contas bancárias e cartão Luhn' }
    ],
    featuredTools: [
      'cpf-cnpj-tool',
      'fake-person-generator',
      'luhn-card-validator',
      'brazilian-docs',
      'tax-fiscal-suite',
      'legal-documents-a4-suite'
    ]
  },
  {
    id: 'dia-a-dia',
    name: 'Utilidades Rápidas & Dia a Dia',
    shortName: '⚡ Dia a Dia & Web',
    icon: 'Zap',
    description: 'Gerador Pix oficial BACEN, link de WhatsApp, calculadoras de porcentagem e regra de três, gerador de senhas e tempo.',
    color: 'blue',
    gradient: 'from-blue-500/10 via-sky-500/5 to-transparent border-blue-200 hover:border-blue-400',
    badge: 'Alta Frequência',
    subcategories: [
      { id: 'all', name: 'Todas do Dia a Dia', description: 'Utilitários imediatos' },
      { id: 'comunicacao-pix', name: 'Comunicação & Pix', description: 'QR Code Pix e links WhatsApp wa.me' },
      { id: 'calculadoras-cotidiano', name: 'Calculadoras Básicas', description: 'Regra de 3, porcentagem e frações' },
      { id: 'tempo-organizacao', name: 'Tempo & Datas', description: 'Diferença entre datas, cronômetro e fuso' },
      { id: 'saude-conversores', name: 'Saúde & Conversores', description: 'IMC, calorias e medidas' }
    ],
    featuredTools: [
      'pix-qr-generator',
      'whatsapp-link-gen',
      'password-generator',
      'math-utils',
      'time-focus-suite',
      'health-everyday-suite'
    ]
  },
  {
    id: 'texto-redacao',
    name: 'Texto, Redação & Normas ABNT',
    shortName: '📝 Texto & ABNT',
    icon: 'Type',
    description: 'Contador de palavras/caracteres, conversor de maiúsculas/minúsculas, formatador oficial ABNT NBR 6023 e limpador de texto.',
    color: 'amber',
    gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent border-amber-200 hover:border-amber-400',
    badge: 'Produção Textual',
    subcategories: [
      { id: 'all', name: 'Todas de Texto', description: 'Manipulação e redação' },
      { id: 'manipulacao-basica', name: 'Contagem & Limpeza', description: 'Caracteres, linhas duplicadas e caixas' },
      { id: 'abnt-academico', name: 'ABNT & Citações NBR', description: 'Livros, artigos, TCC e periódicos' },
      { id: 'formatos-web', name: 'HTML, Slugs & Cifras', description: 'Conversão para web e codificação' }
    ],
    featuredTools: [
      'char-counter',
      'case-converter',
      'line-cleaner',
      'academic-study-suite',
      'text-manipulator',
      'text-specialized-suite'
    ]
  },
  {
    id: 'ia-prompts',
    name: 'IA Criativa, Prompts & Roteiros',
    shortName: '💡 IA & Prompts',
    icon: 'Sparkles',
    description: 'Refinador de prompts para Midjourney/Flux, gerador de títulos virais de alta CTR e roteirista para vídeos curtos de 30-60s.',
    color: 'violet',
    gradient: 'from-violet-500/10 via-purple-500/5 to-transparent border-violet-200 hover:border-violet-400',
    badge: 'Criadores & Roteiristas',
    subcategories: [
      { id: 'all', name: 'Todas de IA & Prompts', description: 'Criação e viralidade' },
      { id: 'prompt-engineering', name: 'Refinamento de Prompts', description: 'Midjourney, Flux, Veo 3 e Sora' },
      { id: 'roteiros-virais', name: 'Roteiros de Vídeo (30-60s)', description: 'Retenção e hooks magnéticos' },
      { id: 'titulos-ctr', name: 'Títulos & Copywriting', description: 'Alta taxa de clique para YouTube/TikTok' }
    ],
    featuredTools: [
      'prompt-expander',
      'viral-title-generator',
      'apollo-suite',
      'ai-prompt-viral-suite',
      'prompt-engineering-suite'
    ]
  },
  {
    id: 'dev-qa',
    name: 'Desenvolvedor, QA & Dados',
    shortName: '💻 Dev & QA',
    icon: 'Terminal',
    description: 'Formatador JSON e SQL, testador de Regex, gerador de hashes criptográficos, decodificador JWT e utilitários de rede.',
    color: 'cyan',
    gradient: 'from-cyan-500/10 via-sky-500/5 to-transparent border-cyan-200 hover:border-cyan-400',
    badge: 'Engenharia de Software',
    subcategories: [
      { id: 'all', name: 'Todas para Devs', description: 'Código e infraestrutura' },
      { id: 'formatadores-dados', name: 'Formatadores JSON / SQL / XML', description: 'Validação e embelezamento' },
      { id: 'cripto-hash', name: 'Criptografia & Hashes SHA', description: 'Assinaturas, chaves e checksums' },
      { id: 'regex-redes', name: 'Regex, DNS & Headers HTTP', description: 'Diagnósticos e testes de rede' }
    ],
    featuredTools: [
      'json-formatter',
      'crypto-hash-suite',
      'regex-lexical-suite',
      'database-sql-suite',
      'network-dns-suite',
      'modern-crypto-suite'
    ]
  }
];

/**
 * Função inteligente de classificação de qualquer ToolItem em sua Macro Categoria
 */
export function getToolMacroCategory(tool: { id: string; category?: string; suiteTarget?: string; tags?: string[]; title?: string }): string {
  const id = tool.id.toLowerCase();
  const suite = (tool.suiteTarget || '').toLowerCase();
  const title = (tool.title || '').toLowerCase();
  const tags = (tool.tags || []).map(t => t.toLowerCase());

  // 1. Edição de Imagem & IA Visual
  if (
    tool.category === 'comfyui' ||
    suite.includes('image') ||
    suite.includes('pixel') ||
    suite.includes('svg') ||
    suite.includes('canvas') ||
    id.includes('face-swap') ||
    id.includes('vton') ||
    id.includes('ic-light') ||
    id.includes('upscale') ||
    id.includes('photography') ||
    id.includes('layerdiffusion') ||
    tags.some(t => ['comfyui', 'imagem', 'upscale', 'pixel', 'svg', 'foto'].includes(t))
  ) {
    // Se for explicitamente vídeo, roteia para vídeo
    if (id.includes('video') || id.includes('liveportrait') || id.includes('animatediff')) {
      return 'video-audio';
    }
    return 'imagem-ia';
  }

  // 2. Vídeo, Áudio & Multimídia
  if (
    id.includes('video') ||
    id.includes('liveportrait') ||
    id.includes('animatediff') ||
    suite.includes('video') ||
    suite.includes('audio') ||
    suite.includes('speech') ||
    suite.includes('webrtc') ||
    suite.includes('codecs') ||
    tags.some(t => ['video', 'audio', 'som', 'voz', 'foco', 'webrtc'].includes(t))
  ) {
    return 'video-audio';
  }

  // 3. Documentos, Cadastros & Fiscal
  if (
    id.includes('cpf') ||
    id.includes('cnpj') ||
    id.includes('person') ||
    id.includes('luhn') ||
    suite.includes('brazilian-docs') ||
    suite.includes('tax') ||
    suite.includes('fiscal') ||
    suite.includes('legal') ||
    suite.includes('investment') ||
    suite.includes('vehicles-banks') ||
    tags.some(t => ['cpf', 'cnpj', 'tributos', 'imposto', 'contrato', 'rg', 'cnh', 'banco', 'cartao'].includes(t))
  ) {
    return 'documentos-fiscal';
  }

  // 4. IA Criativa, Prompts & Roteiros
  if (
    tool.category === 'prompts' ||
    id.includes('prompt') ||
    id.includes('viral-title') ||
    suite.includes('apollo') ||
    suite.includes('ai-prompt') ||
    suite.includes('prompt-engineering') ||
    suite.includes('ai-telemetry') ||
    suite.includes('ecommerce-traffic') ||
    tags.some(t => ['prompt', 'viral', 'roteiro', 'copywriting', 'midjourney', 'sora'].includes(t))
  ) {
    return 'ia-prompts';
  }

  // 5. Texto, Redação & Normas ABNT
  if (
    id.includes('char-counter') ||
    id.includes('case-converter') ||
    id.includes('line-cleaner') ||
    suite.includes('academic-study') ||
    suite.includes('text-manipulator') ||
    suite.includes('text-specialized') ||
    suite.includes('typography') ||
    tags.some(t => ['texto', 'caracteres', 'abnt', 'palavras', 'linhas', 'maiusculas'].includes(t))
  ) {
    return 'texto-redacao';
  }

  // 6. Utilidades do Dia a Dia & Web
  if (
    id.includes('pix') ||
    id.includes('whatsapp') ||
    id.includes('password') ||
    suite.includes('math-utils') ||
    suite.includes('time-focus') ||
    suite.includes('calendar') ||
    suite.includes('health') ||
    suite.includes('units') ||
    suite.includes('lottery') ||
    suite.includes('media-utility') ||
    tags.some(t => ['pix', 'whatsapp', 'senha', 'calculadora', 'porcentagem', 'regra de 3', 'imc', 'relogio'].includes(t))
  ) {
    return 'dia-a-dia';
  }

  // 7. Todo o resto técnico pertence a Desenvolvedor, QA & Infraestrutura
  return 'dev-qa';
}
