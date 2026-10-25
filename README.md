# 🛠️ V5 Apollo Tools (Capitania #11)
**Holding V5 Apollo · Canivete Suíço de Utilidades, Dev & Workflows ComfyUI**

---

## 📖 Visão Geral
O **V5 Apollo Tools** é a plataforma de micro-ferramentas e utilitários da Holding V5 Apollo, modelada na **Tríade Sagrada de Benchmarks da Internet**:
1. **🇧🇷 4Devs (`4devs.com.br`):** Geradores e Validadores de Testes Técnicos e QA (CPF, CNPJ, Pessoas Fictícias, Validador de Cartão de Crédito, Senhas Seguras, CEP/Endereço).
2. **⚡ Invertexto (`invertexto.com`):** Micro-Ferramentas de Manipulação de Texto e Utilidades Rápidas (Contador de Caracteres, Conversor de Caixa, Gerador Pix QR oficial BACEN, Link WhatsApp, Limpador de Linhas).
3. **🎨 Nordy.ai (`nordy.ai`):** Catálogo Soberano de Workflows ComfyUI (Face Swap, Virtual Try-On IDM-VTON, IC-Light Relighting, UltraSharp 4K, Wan 2.1 Video) com download de JSON de API sem lock-in.
4. **💡 APOLLO La PLATA Ferramentas:** Utilitários de Prompts Criativos de IA, Títulos de Alto CTR e Roteiros Curtos.

- **Porta Local:** `http://localhost:3009`
- **Ambiente:** Next.js 14.2.35 (App Router) + Tailwind CSS + Lucide Icons + TypeScript
- **Filosofia:** Client-side first (R$ 0,00 de custo de servidor para ferramentas de texto/utilidades), Soberania de Dados (Zero Lock-in) e visual espacial Dark Obsidian.

---

## 🚀 Como Iniciar Localmente

```bash
# Entrar na pasta do projeto
cd "E:\MEUS PROGRAMAS\V5_APOLLO_SITES\V5_Apollo_Tools"

# Instalar dependências (se necessário)
npm install

# Iniciar servidor local na porta 3009
npm run dev -- -p 3009
```

Acesse no seu navegador: [http://localhost:3009](http://localhost:3009).

---

## 🏗️ Estrutura do Projeto

```
V5_Apollo_Tools/
├── AGENTS.md                   # Diretrizes mestras e leis invioláveis para agentes
├── MEMORIA_ATIVA_TOOLS.md      # Memória contínua, Tríade de Benchmarks e roadmap
├── Pesquisa e Conhecimento/    # Benchmarks, PDFs e capturas de tela de referência
├── APOLLO La PLATA Ferramentas/# Acervo original de 12 ferramentas de IA para portabilidade
├── src/
│   ├── app/
│   │   ├── globals.css         # Estilização global com paleta Cyber Obsidian
│   │   ├── layout.tsx          # Layout com metadados e banner Apollo 5
│   │   └── page.tsx            # Hub principal com busca e catálogo dinâmico
│   ├── components/
│   │   ├── tools/              # Ferramentas interativas (Contador, Caixa, Pix, CPF/CNPJ, ComfyUI)
│   │   └── ui/                 # Componentes de marca e identidade Apollo 5
│   └── lib/
│       └── data/
│           └── toolsData.ts    # Catálogo e metadados de todas as ferramentas
├── package.json
└── tsconfig.json
```

---

## 🔒 Regras Críticas de Operação
1. **Segregação do PixDrop:** O PixDrop (`pixdrop.com.br`) opera no mercado cinza em domínio próprio. **Nunca** crie links, banners ou menções ao PixDrop dentro do V5 Apollo Tools.
2. **Fines / Finders Intocado:** O Fines é a central de ofertas e afiliados. Não crie ferramentas que canibalizem suas funções.
3. **V5 Academy Intocado:** Não faça alterações na pasta `V5_Apollo_Academy`.
4. **Git Commit:** Commits devem sempre utilizar a assinatura da holding:
   `git -c user.name="Apollo La Plata" -c user.email="v5estudio@hotmail.com" commit -m "..."`
