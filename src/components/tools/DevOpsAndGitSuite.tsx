'use client';

import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  Terminal, 
  Container, 
  FileLock, 
  Tag, 
  Copy, 
  Check, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';

interface DevOpsAndGitSuiteProps {
  defaultTab?: 'gitignore-gen' | 'commit-builder' | 'dockerfile-audit' | 'env-sanitizer' | 'semver-calc';
}

export const DevOpsAndGitSuite: React.FC<DevOpsAndGitSuiteProps> = ({ defaultTab = 'gitignore-gen' }) => {
  const [activeTab, setActiveTab] = useState<'gitignore-gen' | 'commit-builder' | 'dockerfile-audit' | 'env-sanitizer' | 'semver-calc'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: GERADOR INTELIGENTE DE .GITIGNORE
  // ==========================================
  const gitignorePresets: Record<string, string> = {
    'Node.js': `# Node.js\nnode_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.pnpm-debug.log*\n.env*.local\n.env\n`,
    'Next.js': `# Next.js\n.next/\nout/\nbuild/\n.vercel\nnext-env.d.ts\n`,
    'Python': `# Python\n__pycache__/\n*.py[cod]\n*$py.class\n*.so\n.Python\nenv/\nvenv/\nENV/\n.venv/\n*.egg-info/\ndist/\nbuild/\n`,
    'Go': `# Go\n*.exe\n*.exe~\n*.dll\n*.so\n*.dylib\n*.test\n*.out\nvendor/\n`,
    'Rust': `# Rust / Cargo\ntarget/\n**/*.rs.bk\nCargo.lock\n`,
    'VS Code': `# Visual Studio Code\n.vscode/*\n!.vscode/settings.json\n!.vscode/tasks.json\n!.vscode/launch.json\n!.vscode/extensions.json\n*.code-workspace\n`,
    'macOS': `# macOS System\n.DS_Store\n.AppleDouble\n.LSOverride\nIcon\r\r\n._*\n.Spotlight-V100\n.Trashes\n`,
    'Windows': `# Windows System\nThumbs.db\nThumbs.db:encryptable\nehthumbs.db\nehthumbs_vista.db\n*.stackdump\n[Dd]esktop.ini\n$RECYCLE.BIN/\n`,
    'Docker': `# Docker\n*.log\n.dockerignore\n`
  };

  const [selectedPresets, setSelectedPresets] = useState<string[]>(['Node.js', 'Next.js', 'VS Code', 'macOS', 'Windows']);

  const togglePreset = (preset: string) => {
    if (selectedPresets.includes(preset)) {
      setSelectedPresets(selectedPresets.filter(p => p !== preset));
    } else {
      setSelectedPresets([...selectedPresets, preset]);
    }
  };

  const generatedGitignore = useMemo(() => {
    let output = `# ==========================================\n# .gitignore gerado soberanamente por V5 Apollo Tools\n# Capitania #11 · Porta :3009\n# ==========================================\n\n`;
    selectedPresets.forEach(preset => {
      if (gitignorePresets[preset]) {
        output += gitignorePresets[preset] + '\n';
      }
    });
    return output.trim();
  }, [selectedPresets]);

  const downloadGitignore = () => {
    const blob = new Blob([generatedGitignore], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ==========================================
  // FERRAMENTA 2: CONSTRUTOR DE CONVENTIONAL COMMITS
  // ==========================================
  const [commitType, setCommitType] = useState<string>('feat');
  const [commitScope, setCommitScope] = useState<string>('tools');
  const [isBreakingChange, setIsBreakingChange] = useState<boolean>(false);
  const [commitDescription, setCommitDescription] = useState<string>('adiciona nova suite de devops e git');
  const [commitBody, setCommitBody] = useState<string>('Implementa gerador de gitignore, linter de commits, auditor de dockerfile e comparador de env.');

  const commitTypesList = [
    { type: 'feat', desc: 'Nova funcionalidade para o usuário' },
    { type: 'fix', desc: 'Correção de bug no sistema' },
    { type: 'docs', desc: 'Alterações apenas na documentação' },
    { type: 'style', desc: 'Formatação, ponto-e-vírgula (sem mudança em lógica)' },
    { type: 'refactor', desc: 'Refatoração de código sem mudar comportamento' },
    { type: 'perf', desc: 'Melhoria de desempenho ou performance' },
    { type: 'test', desc: 'Adição ou correção de testes automatizados' },
    { type: 'build', desc: 'Mudanças no sistema de build ou dependências' },
    { type: 'ci', desc: 'Configuração de CI/CD (GitHub Actions, etc.)' },
    { type: 'chore', desc: 'Tarefas de manutenção que não tocam no código principal' },
    { type: 'revert', desc: 'Reversão de commit anterior' }
  ];

  const fullCommitMessage = useMemo(() => {
    const scopePart = commitScope.trim() ? `(${commitScope.trim()})` : '';
    const breakingPart = isBreakingChange ? '!' : '';
    const header = `${commitType}${scopePart}${breakingPart}: ${commitDescription.trim()}`;
    if (commitBody.trim()) {
      return `${header}\n\n${commitBody.trim()}`;
    }
    return header;
  }, [commitType, commitScope, isBreakingChange, commitDescription, commitBody]);

  const gitCommandSnippet = `git commit -m "${fullCommitMessage.replace(/"/g, '\\"')}"`;
  const headerLength = `${commitType}${commitScope ? `(${commitScope})` : ''}${isBreakingChange ? '!' : ''}: ${commitDescription}`.length;

  // ==========================================
  // FERRAMENTA 3: AUDITOR & VALIDADOR DE DOCKERFILE
  // ==========================================
  const [dockerfileContent, setDockerfileContent] = useState<string>(`# Exemplo de Dockerfile para Node.js / Next.js
FROM node:20-alpine AS base

WORKDIR /app

# Otimização de camadas de cache
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Usuário não-root para segurança
USER node
EXPOSE 3009

CMD ["npm", "start"]`);

  const dockerfileAudit = useMemo(() => {
    const text = dockerfileContent;
    const checks: { rule: string; passed: boolean; tip: string; severity: 'high' | 'medium' | 'low' }[] = [];

    // Checagem 1: Uso de tag latest (não recomendado)
    const usesLatest = /FROM\s+[a-zA-Z0-9_\-\.\/]+:latest/i.test(text);
    checks.push({
      rule: 'Tags Específicas de Imagem Base',
      passed: !usesLatest,
      tip: usesLatest ? 'Evite usar :latest em produção. Especifique a versão exata (ex: node:20-alpine).' : 'Imagem base possui tag fixada ou segura.',
      severity: 'medium'
    });

    // Checagem 2: Multi-stage build
    const fromCount = (text.match(/FROM\s+/gi) || []).length;
    checks.push({
      rule: 'Estratégia Multi-Stage Build',
      passed: fromCount > 1,
      tip: fromCount > 1 ? 'Excelente! Multi-stage builds reduzem o tamanho final da imagem.' : 'Considere utilizar multi-stage builds (ex: AS builder / AS runner) para isolar ferramentas de build.',
      severity: 'low'
    });

    // Checagem 3: Cache de dependências (COPY package antes de RUN npm)
    const hasPackageCopyBefore = /COPY\s+.*package.*\.json/i.test(text);
    checks.push({
      rule: 'Aproveitamento de Cache de Camadas (Layers)',
      passed: hasPackageCopyBefore,
      tip: hasPackageCopyBefore ? 'Arquivos de dependências copiados antes do código-fonte para aproveitar cache do Docker.' : 'Copie apenas package.json e rode npm install antes de copiar o resto do código.',
      severity: 'high'
    });

    // Checagem 4: Usuário não-root
    const hasNonRootUser = /USER\s+[a-zA-Z0-9_\-]+/i.test(text);
    checks.push({
      rule: 'Execução com Usuário Não-Root',
      passed: hasNonRootUser,
      tip: hasNonRootUser ? 'Container configurado para rodar com usuário de privilégios reduzidos.' : 'Adicione "USER node" ou usuário dedicado para evitar riscos de segurança caso o container seja violado.',
      severity: 'high'
    });

    // Checagem 5: Imagem Alpine ou Slim
    const usesAlpineOrSlim = /alpine|slim/i.test(text);
    checks.push({
      rule: 'Base Leve (Alpine / Slim / Distroless)',
      passed: usesAlpineOrSlim,
      tip: usesAlpineOrSlim ? 'Utilizando imagem base reduzida, economizando espaço em disco e tráfego.' : 'Imagens Debian completas podem ultrapassar 1GB. Considere variantes Alpine ou Slim.',
      severity: 'medium'
    });

    const passedCount = checks.filter(c => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return { checks, score };
  }, [dockerfileContent]);

  // ==========================================
  // FERRAMENTA 4: SANITIZADOR & COMPARADOR .ENV VS .ENV.EXAMPLE
  // ==========================================
  const [actualEnv, setActualEnv] = useState<string>(
    `PORT=3009\nDATABASE_URL=postgres://apollo:secretpassword@localhost:5432/v5_tools\nJWT_SECRET=super_secret_encryption_key_v5\nMODAL_API_KEY=ak-live-9874162534\nPUBLIC_APP_NAME="V5 Apollo Tools"\n`
  );

  const [compareExampleEnv, setCompareExampleEnv] = useState<string>(
    `PORT=3009\nDATABASE_URL=\nJWT_SECRET=\nPUBLIC_APP_NAME="V5 Apollo Tools"\n`
  );

  const envAudit = useMemo(() => {
    const parseKeys = (text: string) => {
      const keys: string[] = [];
      text.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            keys.push(trimmed.substring(0, eqIdx).trim());
          }
        }
      });
      return keys;
    };

    const actualKeys = parseKeys(actualEnv);
    const exampleKeys = parseKeys(compareExampleEnv);

    const missingInExample = actualKeys.filter(k => !exampleKeys.includes(k));
    const unusedInActual = exampleKeys.filter(k => !actualKeys.includes(k));

    // Sanitiza gerando um .env.example automático limpo
    const sanitizedExample = actualEnv
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          return `${key}=your_${key.toLowerCase()}_here`;
        }
        return line;
      })
      .join('\n');

    return {
      actualKeyCount: actualKeys.length,
      exampleKeyCount: exampleKeys.length,
      missingInExample,
      unusedInActual,
      sanitizedExample
    };
  }, [actualEnv, compareExampleEnv]);

  // ==========================================
  // FERRAMENTA 5: CALCULADORA SEMVER 2.0.0
  // ==========================================
  const [semverCurrent, setSemverCurrent] = useState<string>('1.4.2');
  const [preReleaseTag, setPreReleaseTag] = useState<string>('beta');
  const [preReleaseNum, setPreReleaseNum] = useState<number>(1);

  const semverCalculations = useMemo(() => {
    const parts = semverCurrent.split('.').map(n => parseInt(n, 10));
    const major = isNaN(parts[0]) ? 1 : parts[0];
    const minor = isNaN(parts[1]) ? 0 : parts[1];
    const patch = isNaN(parts[2]) ? 0 : parts[2];

    const nextPatch = `${major}.${minor}.${patch + 1}`;
    const nextMinor = `${major}.${minor + 1}.0`;
    const nextMajor = `${major + 1}.0.0`;
    const nextPreRelease = `${nextMinor}-${preReleaseTag}.${preReleaseNum}`;

    return {
      major,
      minor,
      patch,
      nextPatch,
      nextMinor,
      nextMajor,
      nextPreRelease
    };
  }, [semverCurrent, preReleaseTag, preReleaseNum]);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              DevOps, Git & Infraestrutura
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-7 h-7 text-cyan-400" />
            Suíte de DevOps, Git & Ambientes de Infraestrutura
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Gerador inteligente de .gitignore, construtor Conventional Commits, auditor de Dockerfile, sanitizador .env e calculadora SemVer.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('gitignore-gen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'gitignore-gen'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Gerador Inteligente de .gitignore
        </button>

        <button
          onClick={() => setActiveTab('commit-builder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'commit-builder'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Conventional Commits Builder
        </button>

        <button
          onClick={() => setActiveTab('dockerfile-audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'dockerfile-audit'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Container className="w-4 h-4" />
          Auditor de Boas Práticas Dockerfile
        </button>

        <button
          onClick={() => setActiveTab('env-sanitizer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'env-sanitizer'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileLock className="w-4 h-4" />
          Sanitizador & Comparador .env
        </button>

        <button
          onClick={() => setActiveTab('semver-calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'semver-calc'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          Calculadora SemVer 2.0.0
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: GERADOR INTELIGENTE DE .GITIGNORE */}
        {activeTab === 'gitignore-gen' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Selecione as tecnologias e ambientes do seu projeto:
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(gitignorePresets).map(preset => {
                  const isSelected = selectedPresets.includes(preset);
                  return (
                    <button
                      key={preset}
                      onClick={() => togglePreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : null}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-400">Arquivo gerado: .gitignore</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedGitignore, 'gitignore-text')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 transition-all"
                  >
                    {copiedKey === 'gitignore-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'gitignore-text' ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={downloadGitignore}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar .gitignore
                  </button>
                </div>
              </div>
              <textarea
                value={generatedGitignore}
                readOnly
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-300 focus:outline-none leading-relaxed select-all"
              />
            </div>
          </div>
        )}

        {/* ABA 2: CONVENTIONAL COMMITS BUILDER */}
        {activeTab === 'commit-builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tipo do Commit (Type):
                </label>
                <select
                  value={commitType}
                  onChange={(e) => setCommitType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500 font-mono"
                >
                  {commitTypesList.map(t => (
                    <option key={t.type} value={t.type}>
                      {t.type} - {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Escopo (Scope opcional):
                  </label>
                  <input
                    type="text"
                    value={commitScope}
                    onChange={(e) => setCommitScope(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500"
                    placeholder="auth, api, ui, db"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={isBreakingChange}
                      onChange={(e) => setIsBreakingChange(e.target.checked)}
                      className="rounded accent-red-500 w-4 h-4"
                    />
                    <span className="font-semibold text-red-400">Breaking Change (!)</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Descrição Curta (imperativo):
                  </label>
                  <span className={`text-[11px] font-mono ${headerLength > 72 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {headerLength}/72 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={commitDescription}
                  onChange={(e) => setCommitDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                  placeholder="corrige falha na autenticação do token JWT"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Corpo Explicativo (Body opcional):
                </label>
                <textarea
                  value={commitBody}
                  onChange={(e) => setCommitBody(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-blue-500 resize-y"
                  placeholder="Detalhes adicionais sobre a motivação da alteração..."
                />
              </div>
            </div>

            {/* Pré-visualização do Commit e Comando Git */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-blue-300">Mensagem Formatada:</span>
                  <button
                    onClick={() => copyToClipboard(fullCommitMessage, 'commit-msg')}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    {copiedKey === 'commit-msg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Mensagem
                  </button>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                  {fullCommitMessage}
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-blue-300">Comando Git Executável:</span>
                  <button
                    onClick={() => copyToClipboard(gitCommandSnippet, 'git-cmd')}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    {copiedKey === 'git-cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Comando
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-400 bg-slate-900/60 p-3 rounded-lg overflow-x-auto select-all leading-relaxed">
                  {gitCommandSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: AUDITOR DE BOAS PRÁTICAS DOCKERFILE */}
        {activeTab === 'dockerfile-audit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Conteúdo do Dockerfile:
              </label>
              <textarea
                value={dockerfileContent}
                onChange={(e) => setDockerfileContent(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Pontuação de Boas Práticas:</span>
                  <span className={`text-2xl font-black font-mono ${
                    dockerfileAudit.score >= 80 ? 'text-emerald-400' : dockerfileAudit.score >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {dockerfileAudit.score}/100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-0.5">Regras Aprovadas:</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">
                    {dockerfileAudit.checks.filter(c => c.passed).length} de {dockerfileAudit.checks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {dockerfileAudit.checks.map(check => (
                  <div 
                    key={check.rule} 
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      check.passed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'
                    }`}
                  >
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`text-xs font-semibold ${check.passed ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {check.rule}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{check.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: SANITIZADOR & COMPARADOR .ENV */}
        {activeTab === 'env-sanitizer' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Seu Arquivo .env (com valores reais):
                </label>
                <textarea
                  value={actualEnv}
                  onChange={(e) => setActualEnv(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="lg:col-span-6">
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Arquivo .env.example Existente (para comparação):
                </label>
                <textarea
                  value={compareExampleEnv}
                  onChange={(e) => setCompareExampleEnv(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Diagnóstico de Variáveis Faltantes */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-200 mb-2">Auditoria de Variáveis de Ambiente:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-2.5 rounded-lg border ${
                  envAudit.missingInExample.length > 0 ? 'bg-red-950/20 border-red-500/30 text-red-300' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  <strong className="block mb-1">Chaves ausentes no .env.example ({envAudit.missingInExample.length}):</strong>
                  {envAudit.missingInExample.length > 0 ? (
                    <span className="font-mono text-[11px] block">{envAudit.missingInExample.join(', ')}</span>
                  ) : (
                    <span>Todas as variáveis do .env constam no example.</span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg border bg-slate-900/60 border-slate-800 text-slate-400">
                  <strong className="block mb-1 text-slate-300">Variáveis em excesso no example ({envAudit.unusedInActual.length}):</strong>
                  {envAudit.unusedInActual.length > 0 ? (
                    <span className="font-mono text-[11px] block text-amber-400">{envAudit.unusedInActual.join(', ')}</span>
                  ) : (
                    <span>Nenhuma variável obsoleta no example.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Template .env.example Gerado com Valores Sanitizados */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-amber-300">Template .env.example Sanitizado Automático:</span>
                <button
                  onClick={() => copyToClipboard(envAudit.sanitizedExample, 'sanitized-env')}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                >
                  {copiedKey === 'sanitized-env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Template Limpo
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-400 bg-slate-900/60 p-3 rounded-lg overflow-x-auto select-all leading-relaxed">
                {envAudit.sanitizedExample}
              </pre>
            </div>
          </div>
        )}

        {/* ABA 5: CALCULADORA SEMVER 2.0.0 */}
        {activeTab === 'semver-calc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Versão Atual (Major.Minor.Patch):
                </label>
                <input
                  type="text"
                  value={semverCurrent}
                  onChange={(e) => setSemverCurrent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tag de Pre-Release:
                </label>
                <select
                  value={preReleaseTag}
                  onChange={(e) => setPreReleaseTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 font-mono"
                >
                  <option value="alpha">alpha (Desenvolvimento inicial)</option>
                  <option value="beta">beta (Testes com usuários)</option>
                  <option value="rc">rc (Release Candidate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Número da Pre-Release:
                </label>
                <input
                  type="number"
                  min={1}
                  value={preReleaseNum}
                  onChange={(e) => setPreReleaseNum(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500"
                />
              </div>
            </div>

            {/* Próximas Versões Calculadas */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Próximo Patch (Bug Fix)</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">{semverCalculations.nextPatch}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Correções retrocompatíveis</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Próximo Minor (Feature)</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{semverCalculations.nextMinor}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Novas features sem quebra</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Próximo Major (Breaking)</span>
                <span className="text-xl font-bold text-red-400 font-mono">{semverCalculations.nextMajor}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Incompatível com versões anteriores</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Pre-Release Tag</span>
                <span className="text-xl font-bold text-purple-400 font-mono">{semverCalculations.nextPreRelease}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Canal de pré-lançamento</span>
              </div>
            </div>

            {/* Dica da RFC SemVer */}
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-purple-300 block mb-0.5">Regra Fundamental da Especificação SemVer 2.0.0:</strong>
                Versões do tipo <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">0.y.z</code> são consideradas instáveis de desenvolvimento inicial — a API pública pode sofrer alterações a qualquer momento sem incremento de MAJOR. A partir do momento em que a versão <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">1.0.0</code> é lançada, a API pública é considerada estável e toda alteração com quebra de contrato exige incremento de MAJOR.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
