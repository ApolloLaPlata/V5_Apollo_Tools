# 📋 PLANILHA MESTRE DE EXECUÇÃO POR ETAPAS (V5 APOLLO TOOLS)
**Holding V5 Apollo · Capitania #11 · Protocolo de Roletagem de Prompts**
**Metodologia:** Autonomous Phased Sprints & Deterministic Verification

---

## 🧭 Como Funciona a Roletagem de Prompts:
1. **Ordem do Comandante:** Você envia um prompt simples: `"Inicie a Etapa 1"` (ou `"Siga para a próxima etapa"`).
2. **Execução Soberana:** O Agente executa **exclusivamente a etapa indicada**, mantendo o foco absoluto sem alucinações.
3. **Verificação de Compilação:** Toda etapa é testada via `npm run build` garantindo **Exit Code 0** (0 erros).
4. **Assinatura & Auditoria:** Git commit assinado como `Apollo La Plata <v5estudio@hotmail.com>` e registro no Shadow Logger (ChromaDB).
5. **Passagem de Bastão:** O Agente marca a etapa como concluída no checklist e aguarda o próximo `"Siga para a próxima etapa"`.

---

## 🗺️ MAPA MESTRE DAS ETAPAS (ROADMAP)

### 🇧🇷 FASE 1: 4DEVS TOTAL REVERSE (DOCUMENTOS, GEOMETRIA & DEV TOOLS)

- [x] **Etapa 1: Inscrição Estadual (IE) Completa (4Devs) - CONCLUÍDA**
  * **Objetivo:** Implementar o Gerador e Validador oficial de Inscrição Estadual para os 26 estados + Distrito Federal (algoritmos fiscais e pesos específicos por UF).
  * **Arquivos:** `src/lib/utils/inscricaoEstadual.ts`, `src/components/tools/BrazilianDocsSuite.tsx` (aba `ie`), `src/lib/data/toolsData.ts`.
  * **Status:** 100% Concluído e testado. Build Next.js verde. Commit registrado.
  * **Ferramentas Absorvidas:** `Gerador de Inscrição Estadual` e `Validador de Inscrição Estadual`.

- [ ] **Etapa 2: Massa Veicular Completa & Validador Bancário (4Devs)**
  * **Objetivo:** Gerador de Veículos para QA Mock (Marca, Modelo, Ano, Cor, Combustível, Chassi, Placa Mercosul e RENAVAM) + Validador de Agência e Conta Bancária (DV check).
  * **Arquivo:** `src/components/tools/VehiclesAndBanksSuite.tsx`.
  * **Ferramentas Absorvidas:** `Gerador de Veículos`, `Validador Conta Bancária`.

- [ ] **Etapa 3: Suíte de Geometria Plana & Áreas (13 Formas) (4Devs)**
  * **Objetivo:** Criar a `GeometrySuite.tsx` com cálculo de área, perímetro e fórmulas passo a passo para Círculo, Quadrado, Retângulo, Triângulo, Losango, Trapézio, Paralelogramo, Pentágono, Hexágono, Polígono Regular, Elipse, Coroa Circular e Setor Circular.
  * **Arquivo:** `src/components/tools/GeometrySuite.tsx`.
  * **Ferramentas Absorvidas:** 13 ferramentas de geometria do 4Devs.

- [ ] **Etapa 4: Matemática Avançada & Operações de Datas (4Devs)**
  * **Objetivo:** Fatoração completa de inteiros em números primos, Resto da Divisão (Módulo `%`), e Calculadora de Somar/Subtrair Dias, Semanas e Meses a partir de uma data inicial.
  * **Arquivo:** `src/components/tools/MathUtilsSuite.tsx`.
  * **Ferramentas Absorvidas:** `Fatorar Número`, `Resto da Divisão`, `Somar Dias em Datas`, `Subtrair Dias em Datas`.

- [ ] **Etapa 5: Manipulação Avançada de String & Tabela ASCII (4Devs)**
  * **Objetivo:** Contador de Ocorrência e Frequência de Palavras, Conversor de Texto para HTML (`<p>`/`<br>`), Cortador/Slice de Textos com Elipse, Divisor de Strings por delimitador e Inspetor de Caracteres (Tabela ASCII, Decimal, Hex, Binário e HTML Entity).
  * **Arquivo:** `src/components/tools/TextManipulatorSuite.tsx`.
  * **Ferramentas Absorvidas:** 5 ferramentas de manipulação de texto do 4Devs.

- [ ] **Etapa 6: Gerador de Currículo, Nicks, Nomes & Imagem Dummy (4Devs)**
  * **Objetivo:** Criar a `DevAndCvSuite.tsx` com Gerador de Currículo profissional com layout para impressão, Gerador de Nicks estilizados para games, Gerador de Nomes brasileiros (IBGE) e Placeholder Image Generator (Lorem Pixel SVG).
  * **Arquivo:** `src/components/tools/DevAndCvSuite.tsx`.
  * **Ferramentas Absorvidas:** 4 ferramentas de utilitários do 4Devs.

---

### ⚡ FASE 2: INVERTEXTO TOTAL REVERSE (LOTERIAS, TEMPO, FINANÇAS & SAÚDE)

- [ ] **Etapa 7: Suíte de Loterias, Sorteios & Roleta da Sorte (Invertexto)**
  * **Objetivo:** Gerador de Jogos Oficiais da Caixa (Mega-Sena, Quina, Lotofácil, Lotomania, Dupla Sena), Roleta da Sorte interativa com opções personalizadas, Embaralhador de Listas e Gerador de Palavras Aleatórias.
  * **Arquivo:** `src/components/tools/LotteryAndGamesSuite.tsx`.
  * **Ferramentas Absorvidas:** `NÃºmeros da Megasena`, `Roleta Online`, `Lista AleatÃ³ria`, `Gerador de Palavras AleatÃ³rias`.

- [ ] **Etapa 8: Suíte de Tempo, Foco & Produtividade (Invertexto)**
  * **Objetivo:** Cronômetro Online com voltas (Laps), Pomodoro Timer (25/5 com alerta sonoro e notificações), Calculadora de Horas/Ponto (`hh:mm` para horas extras) e Contagem Regressiva para Eventos.
  * **Arquivo:** `src/components/tools/TimeAndFocusSuite.tsx`.
  * **Ferramentas Absorvidas:** `CronÃ´metro`, `Pomodoro Timer`, `Calculadora de Horas`, `Contagem Regressiva`.

- [ ] **Etapa 9: Calendário, Idade, Signos & Astronomia (Invertexto)**
  * **Objetivo:** Calculadora de Idade Exata & Signos do Zodíaco, Calendário Anual Interativo com Feriados Nacionais Brasileiros, Fases da Lua, Estações do Ano, Dia do Ano (1-365) e Semana do Ano (1-52).
  * **Arquivo:** `src/components/tools/CalendarAndAstronomySuite.tsx`.
  * **Ferramentas Absorvidas:** 7 ferramentas temporais do Invertexto.

- [ ] **Etapa 10: Conversor de Bases, Medidas Físicas, UUID & Timestamp (Invertexto)**
  * **Objetivo:** Conversão de Base Numérica (Dec, Bin, Oct, Hex), Conversor de Medidas Físicas (Massa, Comprimento, Temperatura, Velocidade, Volume, Área), Calculadora de Frações, Conversor de Timestamp UNIX e Gerador de UUID v4.
  * **Arquivo:** `src/components/tools/UnitsAndConvertersSuite.tsx`.
  * **Ferramentas Absorvidas:** 5 ferramentas de conversão e cálculo do Invertexto.

- [ ] **Etapa 11: Finanças Pessoais, Juros Compostos & Combustível (Invertexto)**
  * **Objetivo:** Simulador de Juros Compostos / Poupança com projeção gráfica, Calculadora do Primeiro Milhão, Simulador de Financiamento (Price e SAC), Comparador Gasolina vs Etanol (regra 70%) e Calculadora de Viagem/Combustível.
  * **Arquivo:** `src/components/tools/FinanceAndEconomySuite.tsx`.
  * **Ferramentas Absorvidas:** 5 ferramentas financeiras do Invertexto.

- [ ] **Etapa 12: Saúde, Churrasco & Documentos Legais para Impressão (Invertexto)**
  * **Objetivo:** Calculadora de IMC (classificação OMS), Calculadora Gestacional & Período Fértil, Calculadora de Churrasco por pessoa, Emissor de Recibo de Pagamento e Nota Promissória Online formatados para A4/impressão.
  * **Arquivo:** `src/components/tools/HealthAndEverydaySuite.tsx`.
  * **Ferramentas Absorvidas:** 5 ferramentas de saúde e documentos do Invertexto.

- [ ] **Etapa 13: Mídia Canvas, WPM Typing Test, Monitor Tester & Notepad (Invertexto)**
  * **Objetivo:** Redimensionar e Cortar Imagens (HTML5 Canvas), Filtro Preto e Branco, Teste de Digitação WPM em tempo real, Leitura Rápida RSVP, Tela Branca/Dead Pixel Tester e Notepad Online (com auto-save no `localStorage`).
  * **Arquivo:** `src/components/tools/MediaAndUtilitySuite.tsx`.
  * **Ferramentas Absorvidas:** 7 ferramentas de mídia e utilitários do Invertexto.

- [ ] **Etapa 14: Texto Especializado, Cifra Secreta & Símbolos/Emojis (Invertexto)**
  * **Objetivo:** Letras Empilhadas (`sͩuͨpͬeͬrͥ`), Prefixo e Sufixo por Linha, Criptografia de Texto com Chave Secreta (Cifra simétrica), Nuvem de Palavras interativa e Catálogo de Emojis/Símbolos para copiar com 1 clique.
  * **Arquivo:** `src/components/tools/TextSpecializedSuite.tsx`.
  * **Ferramentas Absorvidas:** 5 ferramentas de texto e códigos do Invertexto.

---

### 🎨 FASE 3: NORDY.AI WORKFLOWS & CONEXÃO DE GPU (V5 APOLLO API)

- [ ] **Etapa 15: Catálogo Expandido de Workflows ComfyUI (Nordy.ai Clone)**
  * **Objetivo:** Catalogar 25+ workflows top-tier de comunidade do Nordy.ai com grafos visuais, especificação técnica de nós (CFG, Denoise, Sampler, Steps) e download soberano de JSON de API (Zero Lock-in).
  * **Arquivo:** `src/lib/data/toolsData.ts` & `src/components/tools/ComfyWorkflowModal.tsx`.

- [ ] **Etapa 16: Conexão Soberana com V5 Apollo API (GPU Modal Dispatcher)**
  * **Objetivo:** Integrar o cliente oficial `v5_apollo_client.ts` ao V5 Tools, conectando à rota universal `/api/v1/generate` da holding para receber despachos em instâncias Modal H100 com cold-start snapshot acelerado.
  * **Arquivo:** `src/lib/api/v5ApolloClient.ts` e handlers de despacho.
