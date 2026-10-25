# V5 APOLLO TOOLS - DIRETRIZES DO AGENTE (AGENTS.md)
**Holding V5 Apollo · Capitania #11 · Porta Local :3009**

---

## 1. IDENTIDADE E MISSÃO DO SISTEMA
O **V5 Apollo Tools** (`tools.v5apollo.com`, atualmente rodando localmente na porta `:3009`) é o **Canivete Suíço de Produtividade & Ímã de Tráfego Orgânico (SEO)** da Holding V5 Apollo.

Ele foi projetado para absorver e unificar a **Tríade Sagrada de Benchmarks da Internet** + o acervo criativo interno da holding:

### 🌟 A Tríade Sagrada de Benchmarks para Cópia e Adaptação:
1. **🇧🇷 4Devs (`https://www.4devs.com.br`):**
   - **Foco:** Ferramentas para Desenvolvedores, QA e Testadores de Software.
   - **O que absorver:** Gerador de CPF (com/sem pontuação), Validador de CPF, Gerador de CNPJ, Validador de CNPJ, Gerador de Pessoas/Dados Fictícios para Testes, Gerador de CEP/Endereço, Validador de Cartão de Crédito (Luhn), Gerador de Contas Bancárias Fictícias, Gerador de Senhas Fortes, Formatador de JSON/SQL.
   - **Execução:** 100% Client-side (algoritmos matemáticos puros no navegador, zero custo de API).

2. **⚡ Invertexto (`https://www.invertexto.com`):**
   - **Foco:** Micro-Ferramentas de Manipulação de Texto e Utilidades Rápidas do Dia a Dia.
   - **O que absorver:** Contador de Caracteres e Palavras, Conversor de Caixa Alta/Baixa, Gerador de QR Code Pix oficial BACEN, Gerador de Link Direto de WhatsApp (`wa.me`), Removedor de Linhas Duplicadas, Ordenador de Listas (A-Z / Z-A), Inversor de Texto, Gerador de Slugs de URL, Removedor de Espaços Extras.
   - **Execução:** 100% Client-side, instantâneo, privacidade absoluta.

3. **🎨 Nordy.ai (`https://nordy.ai` e `nordy.ai/community/workflows`):**
   - **Foco:** Catálogo de Elite de Workflows ComfyUI e IA Generativa.
   - **O que absorver:** Vitrine técnica de grafos e nós (Face Swap ReActor, IDM-VTON Virtual Try-On, IC-Light Relighting, UltraSharp 4K Upscale, Wan 2.1 Video, LivePortrait Animação Facial, Fotografia de Produto). Visualização de conexões de nós, explicações de parâmetros (CFG, Denoise, Sampler, Steps) e **botão de download soberano de JSON de API do ComfyUI com 1 clique (Zero Lock-in)**.
   - **Execução:** Visualização estática/interativa no frontend; execução remota de GPU despachada futuramente para a `V5_APOLLO_API` na frota Modal H100.

4. **💡 APOLLO La PLATA Ferramentas (Acervo Criativo Interno):**
   - **Foco:** Geradores de Prompts, Roteiros Curtos e CTR Virais.
   - **O que absorver:** As 12 ferramentas de IA prontas da pasta local `APOLLO La PLATA Ferramentas` (Refinador de Prompt Cinematográfico, Gerador de Títulos Virais, Prompts para Veo 3 / Sora / Kling, Gerador de Hashtags, Roteiros Curtos de 30-60s com Gatilhos de Retenção).

---

## 2. LEIS INVIOLÁVEIS DO KERNEL (REGRAS ABSOLUTAS)

### 🔴 LEI 1: SEGREGAÇÃO ABSOLUTA DO MERCADO CINZA (PROIBIDO PIXDROP)
- O **PixDrop** (`pixdrop.com.br`) é uma operação isolada de comércio e mercado cinza com domínio próprio.
- **É TERMINANTEMENTE PROIBIDO** colocar links, banners, menções, scripts ou cross-promoções do PixDrop no **V5 Apollo Tools** ou em qualquer outro site oficial da Holding V5 Apollo (`v5apollo.com`, `prisma.v5apollo.com`, etc.).
- A infraestrutura técnica pode compartilhar métodos seguros de backend no futuro, mas o ecossistema público deve permanecer 100% separado e limpo.

### 🛡️ LEI 2: FINES / FINDERS É O MEGAZORD SAGRADO
- O **Fines / Finders** é a central suprema da holding para garimpo de ofertas de afiliados, rastreamento de tendências de e-commerce e divulgação em massa.
- **NÃO crie** ferramentas que tentem dissolver, canibalizar ou concorrer com o papel central do Fines. O Tools fornece utilitários gerais e suporte de IA; a inteligência e orquestração de ofertas pertence exclusivamente ao Fines.

### 🚫 LEI 3: PROIBIDO TOCAR NO V5 ACADEMY
- A pasta `E:\MEUS PROGRAMAS\V5_APOLLO_SITES\V5_Apollo_Academy` está sob operação autônoma de outro agente. Não leia, não edite e não faça alterações nessa pasta.

### 💻 LEI 4: DESENVOLVIMENTO LOCAL SOBERANO (PORTA 3009)
- O projeto deve ser desenvolvido e testado **100% em ambiente local** (`http://localhost:3009`).
- **NÃO crie** instâncias no Vercel ou projetos no Supabase antes da ordem explícita do Comandante. O banco de dados para ferramentas client-side deve utilizar `localStorage` ou memória do navegador, preservando a soberania do usuário.

### ⚡ LEI 5: FILOSOFIA CLIENT-SIDE FIRST (ZERO GPU COST)
- Todas as ferramentas dos padrões 4Devs e Invertexto devem ser implementadas usando TypeScript/React puro rodando no cliente.
- Nenhuma ferramenta simples (contador de caracteres, conversor de caixa, gerador Pix, gerador de CPF/CNPJ, limpador de texto) deve fazer chamadas de backend ou gerar consumo de servidor.

### 🚀 LEI 6: ARQUITETURA DE GPU VIA V5_APOLLO_API
- O V5 Tools exibe e inspeciona workflows ComfyUI de forma estática e interativa com visualização de grafos e exportação de JSON de API.
- Quando a execução real de GPU for habilitada, ela **NÃO será processada dentro do Next.js**. Ela será despachada para a `V5_APOLLO_API` (`https://sitesviniciusmiranda--apollo-api-...`), que roteia as cargas para a frota Modal H100 ou instâncias RunPod dedicadas.

### 🎨 LEI 7: IDENTIDADE VISUAL APOLLO 5
- Todo o design system segue o tema espacial Cyber Obsidian:
  - Fundo: Slate 950 (`#020617`) e Slate 900 (`#0f172a`).
  - Destaques: Ciano elétrico (`#06b6d4`), Verde Esmeralda 4Devs (`#10b981`), Violeta IA ComfyUI (`#8b5cf6`) e Âmbar de combustão (`#f59e0b`).
  - Logo oficial: `Apollo5RocketLogo.tsx` (Foguete Saturn IB com a insígnia clássica "V5" em vermelho e branco e propulsores energizados).
  - Componente de ativação: `V5AppActivationBanner.tsx` identificando a Capitania #11.

### ✍️ LEI 8: PROTOCOLO DE COMMITS GIT
- Sempre realize commits com a identidade oficial da Holding:
  `git -c user.name="Apollo La Plata" -c user.email="v5estudio@hotmail.com" commit -m "feat(tools): sua mensagem aqui"`

---

## 3. PROTOCOLO COLMEIA E SINCRONIZAÇÃO
1. **Primeira Ação ao Iniciar:** Verifique se o Cron Job (`0 */2 * * *`) está ativo usando `manage_task(Action='list')`. Se ausente, ative-o.
2. **Leitura Obrigatória:** Leia sempre `MEMORIA_ATIVA_TOOLS.md` para entender o estado atual do catálogo de ferramentas.
3. **Hive Bus Central:** Leia `antigravity_hive_bus.md` em `C:\Users\v5est\.gemini\antigravity\brain\9270dd65-160e-47e8-aea2-6a92fd50cfc6\antigravity_hive_bus.md` para estar ciente dos passos dos outros agentes.
4. **Shadow Logger Mandatório:** Antes de finalizar qualquer resposta ao usuário, registre suas ações executando o script:
   `& "E:\MEUS PROGRAMAS\ANTIGRAVITY_OBSERVER\venv_rag\Scripts\python.exe" "E:\MEUS PROGRAMAS\ANTIGRAVITY_OBSERVER\memory_rag\shadow_logger.py" --author "AGENT" --action "Sua acao aqui" --details "Detalhes aqui"`
