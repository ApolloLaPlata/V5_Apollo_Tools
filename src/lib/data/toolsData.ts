export interface ToolItem {
  id: string;
  title: string;
  description: string;
  category: 'invertexto' | 'comfyui' | 'prompts' | 'dev-4devs';
  categoryLabel: string;
  icon: string;
  badge?: string;
  isInteractive?: boolean;
  modelTarget?: string;
  popular?: boolean;
  tags: string[];
}

export const TOOLS_CATALOG: ToolItem[] = [
  // ==========================================
  // CATEGORIA 1: 4DEVS & TESTES TÉCNICOS (BENCHMARK 4DEVS.COM.BR)
  // ==========================================
  {
    id: 'cpf-cnpj-tool',
    title: 'Gerador & Validador de CPF / CNPJ',
    description: 'Cálculo de dígitos verificadores oficiais (Módulo 11) da Receita Federal. Geração com/sem máscara e identificação de estado.',
    category: 'dev-4devs',
    categoryLabel: 'Dev & Testes (4Devs)',
    icon: 'ShieldCheck',
    badge: 'Padrão 4Devs',
    isInteractive: true,
    popular: true,
    tags: ['4devs', 'cpf', 'cnpj', 'validador', 'gerador', 'testes', 'qa']
  },
  {
    id: 'fake-person-generator',
    title: 'Gerador de Pessoas para Testes (QA Mock)',
    description: 'Criação de massa de dados fictícios para testes de formulários (nome, idade, endereço, celular e dados cadastrais).',
    category: 'dev-4devs',
    categoryLabel: 'Dev & Testes (4Devs)',
    icon: 'Users',
    badge: 'Padrão 4Devs',
    isInteractive: true,
    popular: true,
    tags: ['4devs', 'pessoas', 'mock', 'dados', 'qa', 'testes', 'cadastro']
  },
  {
    id: 'luhn-card-validator',
    title: 'Validador de Cartão de Crédito (Luhn)',
    description: 'Verificação matemática pelo algoritmo de Luhn (Módulo 10) e identificação de bandeira (Visa, Mastercard, Elo, Amex).',
    category: 'dev-4devs',
    categoryLabel: 'Dev & Testes (4Devs)',
    icon: 'CreditCard',
    badge: 'Padrão 4Devs',
    isInteractive: true,
    popular: true,
    tags: ['4devs', 'cartão', 'luhn', 'validador', 'checkout', 'ecommerce']
  },
  {
    id: 'password-generator',
    title: 'Gerador de Senhas Seguras',
    description: 'Criação de chaves e senhas criptograficamente seguras com ajuste de entropia, símbolos, maiúsculas e números.',
    category: 'dev-4devs',
    categoryLabel: 'Dev & Testes (4Devs)',
    icon: 'KeyRound',
    badge: '100% Local',
    isInteractive: false,
    tags: ['4devs', 'senha', 'segurança', 'hash', 'criptografia']
  },
  {
    id: 'json-formatter',
    title: 'Formatador & Validador de JSON',
    description: 'Indentação customizada (2 ou 4 espaços), minificação e diagnóstico de erros de sintaxe em tempo real.',
    category: 'dev-4devs',
    categoryLabel: 'Dev & Testes (4Devs)',
    icon: 'FileCode',
    badge: 'Client-Side',
    isInteractive: false,
    tags: ['4devs', 'json', 'formatador', 'parser', 'api']
  },

  // ==========================================
  // CATEGORIA 2: INVERTEXTO & UTILITÁRIOS RÁPIDOS (BENCHMARK INVERTEXTO.COM)
  // ==========================================
  {
    id: 'char-counter',
    title: 'Contador de Caracteres & Palavras',
    description: 'Conta caracteres com e sem espaços, palavras, linhas, parágrafos e calcula o tempo estimado de leitura e fala para o V5 Sound.',
    category: 'invertexto',
    categoryLabel: 'Texto (Invertexto)',
    icon: 'Type',
    badge: '100% Client-Side',
    isInteractive: true,
    popular: true,
    tags: ['invertexto', 'texto', 'caracteres', 'palavras', 'leitura', 'redação']
  },
  {
    id: 'case-converter',
    title: 'Transformador de Caixa Alta / Baixa',
    description: 'Converta textos para MAIÚSCULAS, minúsculas, Primeira Letra Maiúscula, Inverter Texto ou Formato URL Slug.',
    category: 'invertexto',
    categoryLabel: 'Texto (Invertexto)',
    icon: 'CaseSensitive',
    badge: '100% Client-Side',
    isInteractive: true,
    popular: true,
    tags: ['invertexto', 'caixa', 'maiúsculas', 'minúsculas', 'slug', 'conversor']
  },
  {
    id: 'pix-qr-generator',
    title: 'Gerador de QR Code Pix Oficial',
    description: 'Gere código QR Pix padrão BACEN (EMVCo) e payload Copia-e-Cola com download em PNG instantâneo.',
    category: 'invertexto',
    categoryLabel: 'Finanças (Invertexto)',
    icon: 'QrCode',
    badge: 'BACEN Oficial',
    isInteractive: true,
    popular: true,
    tags: ['invertexto', 'pix', 'qr code', 'pagamento', 'copia e cola', 'banco central']
  },
  {
    id: 'whatsapp-link-gen',
    title: 'Gerador de Link do WhatsApp',
    description: 'Crie links curtos wa.me/55... com mensagem personalizada pronta para bio do Instagram e anúncios.',
    category: 'invertexto',
    categoryLabel: 'Marketing (Invertexto)',
    icon: 'MessageSquare',
    badge: 'Zero Custo',
    isInteractive: true,
    popular: true,
    tags: ['invertexto', 'whatsapp', 'link', 'bio', 'redes sociais']
  },
  {
    id: 'line-cleaner',
    title: 'Limpador de Linhas & Duplicatas',
    description: 'Remova linhas em branco, apague duplicatas repetidas, ordene alfabeticamente e limpe listas gigantescas.',
    category: 'invertexto',
    categoryLabel: 'Texto (Invertexto)',
    icon: 'ListFilter',
    badge: 'Instantâneo',
    isInteractive: true,
    popular: true,
    tags: ['invertexto', 'linhas', 'duplicatas', 'limpeza', 'ordenação']
  },

  // ==========================================
  // CATEGORIA 3: WORKFLOWS COMFYUI (BENCHMARK NORDY.AI)
  // ==========================================
  {
    id: 'comfy-face-swap',
    title: 'Face Swap Ultra-Realista (ReActor / InsightFace)',
    description: 'Troca de rosto precisa preservando expressão, iluminação e ângulo original sem artefatos.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'Smile',
    badge: 'ReActor Node',
    modelTarget: 'Flux / SDXL',
    popular: true,
    tags: ['nordy', 'comfyui', 'face swap', 'reactor', 'insightface', 'avatar']
  },
  {
    id: 'comfy-virtual-tryon',
    title: 'IDM-VTON Virtual Try-On (Provador de Roupas)',
    description: 'Substituição realista de roupas em modelos fotográficos para catálogos de e-commerce.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'Shirt',
    badge: 'IDM-VTON',
    modelTarget: 'ComfyUI Cloud',
    popular: true,
    tags: ['nordy', 'comfyui', 'try-on', 'moda', 'vton', 'roupas', 'ecommerce']
  },
  {
    id: 'comfy-ic-light',
    title: 'IC-Light Relighting de Estúdio & Cenário',
    description: 'Altere a fonte de iluminação e fundo de personagens com luz consistente e rim lighting.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'Sun',
    badge: 'IC-Light',
    modelTarget: 'SD1.5 / SDXL',
    tags: ['nordy', 'comfyui', 'ic-light', 'relighting', 'iluminação', 'estúdio']
  },
  {
    id: 'comfy-ultrasharp-4k',
    title: 'Flux 2 + UltraSharp 4K Upscale In-Node',
    description: 'Pipeline acelerado com upscale 4K unificado na mesma VRAM em 38 segundos na Modal H100.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'Maximize2',
    badge: '38s Padrão Ouro',
    modelTarget: 'Flux 2 Dev + H100',
    popular: true,
    tags: ['nordy', 'comfyui', 'flux', 'upscale', 'ultrasharp', '4k', 'modal']
  },
  {
    id: 'comfy-wan-video',
    title: 'Wan 2.1 Video Generator (Cinematográfico)',
    description: 'Geração de vídeo de alta fidelidade visual com movimento natural e controle de câmera.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'Film',
    badge: 'Wan 2.1',
    modelTarget: 'Modal H100 Fleet',
    tags: ['nordy', 'comfyui', 'wan2.1', 'video', 'cinemático', 'camera control']
  },
  {
    id: 'comfy-live-portrait',
    title: 'LivePortrait Animação Facial em Tempo Real',
    description: 'Transforma retratos estáticos em vídeos falantes e expressivos usando vídeo guia.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'Video',
    badge: 'LivePortrait',
    modelTarget: 'Fast GPU',
    tags: ['nordy', 'comfyui', 'liveportrait', 'lip-sync', 'animação', 'expressões']
  },
  {
    id: 'comfy-product-photo',
    title: 'Fotografia de Produto Comercial para E-commerce',
    description: 'Isola produtos e gera cenários comerciais realistas de estúdio com sombras perfeitas.',
    category: 'comfyui',
    categoryLabel: 'ComfyUI Workflow (Nordy.ai)',
    icon: 'ShoppingBag',
    badge: 'Comercial',
    modelTarget: 'Flux Inpaint',
    tags: ['nordy', 'comfyui', 'produto', 'marketplace', 'fotografia', 'ecommerce']
  },

  // ==========================================
  // CATEGORIA 4: IA CRIATIVA & PROMPTS (APOLLO La PLATA FERRAMENTAS)
  // ==========================================
  {
    id: 'prompt-expander',
    title: 'Refinador & Expansor de Prompts de IA',
    description: 'Enriquece prompts simples transformando-os em descrições cinematográficas detalhadas com lentes e iluminação.',
    category: 'prompts',
    categoryLabel: 'IA Criativa (Apollo La Plata)',
    icon: 'Wand2',
    badge: 'Apollo La Plata',
    isInteractive: true,
    popular: true,
    tags: ['apollo', 'prompts', 'midjourney', 'flux', 'cinematográfico']
  },
  {
    id: 'veo3-prompter',
    title: 'Gerador de Prompts para Veo 3 / Sora / Kling',
    description: 'Estruturação de prompts em blocos (Câmera, Ação, Atmosfera, Iluminação e Áudio Diegético).',
    category: 'prompts',
    categoryLabel: 'IA Criativa (Apollo La Plata)',
    icon: 'Film',
    badge: 'Veo 3 & Sora',
    isInteractive: false,
    tags: ['apollo', 'veo3', 'sora', 'kling', 'vídeo ia', 'prompt']
  },
  {
    id: 'viral-title-generator',
    title: 'Gerador de Títulos Virais de Alta CTR',
    description: 'Títulos para YouTube, TikTok e Reels utilizando gatilhos mentais de curiosidade e retenção.',
    category: 'prompts',
    categoryLabel: 'IA Criativa (Apollo La Plata)',
    icon: 'FileText',
    badge: 'Alto CTR',
    isInteractive: false,
    tags: ['apollo', 'títulos', 'youtube', 'ctr', 'retenção', 'viral']
  },
  {
    id: 'hashtag-crafter',
    title: 'Gerador de Hashtags Segmentadas',
    description: 'Seleção automática de tags quentes de cauda longa para Instagram Reels e TikTok.',
    category: 'prompts',
    categoryLabel: 'IA Criativa (Apollo La Plata)',
    icon: 'Hash',
    badge: 'SEO Social',
    isInteractive: false,
    tags: ['apollo', 'hashtags', 'instagram', 'tiktok', 'seo']
  }
];
