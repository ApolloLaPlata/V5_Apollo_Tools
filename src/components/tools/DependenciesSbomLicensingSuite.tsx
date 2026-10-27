'use client';

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  ShieldCheck, 
  FileText, 
  Layers, 
  GitBranch, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Download, 
  Code, 
  Sliders, 
  FileCode, 
  Terminal, 
  CheckSquare, 
  XCircle,
  ExternalLink,
  Cpu,
  Zap,
  Box
} from 'lucide-react';

interface DependenciesSbomLicensingSuiteProps {
  defaultTab?: 'pkg-auditor' | 'spdx-matrix' | 'sbom-generator' | 'semver-resolver' | 'dockerfile-optimizer';
}

const SAMPLE_PACKAGE_JSON = {
  name: "v5-apollo-microservice",
  version: "1.4.0",
  private: true,
  description: "Microserviço de alto desempenho da Capitania V5",
  license: "MIT",
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    postinstall: "echo 'Setup completed successfully'"
  },
  dependencies: {
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.475.0",
    "clsx": "2.1.1",
    "lodash": "*",
    "@types/node": "^20.11.0"
  },
  devDependencies: {
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.57.0"
  }
};

const SAMPLE_DOCKERFILE = `FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

const LICENSES_DATA = [
  { id: 'MIT', name: 'MIT License', type: 'Permissiva', commercial: true, saasSafe: true, patentGrant: false, copyleft: false, desc: 'Extremamente permissiva. Permite qualquer uso comercial ou privado com apenas a preservação do copyright original.' },
  { id: 'Apache-2.0', name: 'Apache License 2.0', type: 'Permissiva', commercial: true, saasSafe: true, patentGrant: true, copyleft: false, desc: 'Permissiva com concessão explícita de patentes e proteção contra processos de propriedade intelectual.' },
  { id: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised"', type: 'Permissiva', commercial: true, saasSafe: true, patentGrant: false, copyleft: false, desc: 'Permissiva semelhante ao MIT, com cláusula proibindo o uso do nome dos autores para endosso de produtos.' },
  { id: 'MPL-2.0', name: 'Mozilla Public License 2.0', type: 'Copyleft Fraco', commercial: true, saasSafe: true, patentGrant: true, copyleft: true, desc: 'Copyleft por arquivo: apenas os arquivos sob MPL modificados devem ser abertos, sem contaminar o resto do projeto.' },
  { id: 'LGPL-3.0', name: 'GNU Lesser General Public License 3.0', type: 'Copyleft Fraco', commercial: true, saasSafe: true, patentGrant: true, copyleft: true, desc: 'Permite linkagem dinâmica (DLL/so) em código proprietário, mas modificações na própria biblioteca devem ser públicas.' },
  { id: 'GPL-3.0', name: 'GNU General Public License 3.0', type: 'Copyleft Forte', commercial: true, saasSafe: true, patentGrant: true, copyleft: true, desc: 'Viral para distribuição de binários: qualquer software distribuído compilado com código GPL deve ter todo o seu código aberto.' },
  { id: 'AGPL-3.0', name: 'GNU Affero General Public License 3.0', type: 'Copyleft de Rede', commercial: true, saasSafe: false, patentGrant: true, copyleft: true, desc: 'Super-viral para SaaS: mesmo rodando na nuvem sem distribuir binários, você É OBRIGADO a disponibilizar todo o código-fonte aos usuários web.' }
];

export const DependenciesSbomLicensingSuite: React.FC<DependenciesSbomLicensingSuiteProps> = ({ defaultTab = 'pkg-auditor' }) => {
  const [activeTab, setActiveTab] = useState<'pkg-auditor' | 'spdx-matrix' | 'sbom-generator' | 'semver-resolver' | 'dockerfile-optimizer'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: AUDITOR DE PACKAGE.JSON
  // ==========================================
  const [pkgInput, setPkgInput] = useState<string>(JSON.stringify(SAMPLE_PACKAGE_JSON, null, 2));

  const pkgAuditReport = useMemo(() => {
    try {
      const parsed = JSON.parse(pkgInput);
      const warnings: Array<{ level: 'danger' | 'warning' | 'info'; title: string; desc: string }> = [];
      let score = 100;

      // 1. Verificação de scripts de ciclo de vida (postinstall, preinstall)
      const scripts = parsed.scripts || {};
      if (scripts.postinstall) {
        score -= 15;
        warnings.push({
          level: 'warning',
          title: 'Script de postinstall detectado',
          desc: `O script 'postinstall: "${scripts.postinstall}"' é executado automaticamente após instalações. Em dependências de terceiros, este é o vetor nº 1 de ataques à cadeia de suprimentos.`
        });
      }
      if (scripts.preinstall) {
        score -= 20;
        warnings.push({
          level: 'danger',
          title: 'Script de preinstall ativo',
          desc: 'Scripts de preinstall rodam antes de checagens de integridade completas do package-lock.'
        });
      }

      // 2. Dependências de produção vs tipos/desenvolvimento
      const deps = parsed.dependencies || {};
      const devDeps = parsed.devDependencies || {};
      const misplacedTypes: string[] = [];

      Object.keys(deps).forEach(pkg => {
        if (pkg.startsWith('@types/')) {
          misplacedTypes.push(pkg);
        }
        const ver = deps[pkg];
        if (ver === '*' || ver === 'latest' || ver.startsWith('>')) {
          score -= 10;
          warnings.push({
            level: 'warning',
            title: `Versão não determinística em "${pkg}"`,
            desc: `A versão está configurada como "${ver}". Isso impede builds reproduzíveis e pode quebrar deploys de produção automaticamente.`
          });
        }
      });

      if (misplacedTypes.length > 0) {
        score -= 10;
        warnings.push({
          level: 'warning',
          title: 'Pacotes de Tipagem em Dependências de Produção',
          desc: `Os pacotes [${misplacedTypes.join(', ')}] deveriam estar em 'devDependencies' para não inflar o bundle final da imagem de produção.`
        });
      }

      // 3. Metadados do pacote
      if (!parsed.license) {
        score -= 5;
        warnings.push({
          level: 'info',
          title: 'Licença não especificada',
          desc: 'O campo "license" está ausente. Recomenda-se adicionar "MIT", "Apache-2.0" ou "UNLICENSED".'
        });
      }

      const totalDeps = Object.keys(deps).length;
      const totalDevDeps = Object.keys(devDeps).length;

      return {
        isValid: true,
        score: Math.max(0, score),
        totalDeps,
        totalDevDeps,
        warnings,
        name: parsed.name || 'sem-nome',
        version: parsed.version || '0.0.0'
      };
    } catch (e: any) {
      return {
        isValid: false,
        score: 0,
        totalDeps: 0,
        totalDevDeps: 0,
        warnings: [{ level: 'danger' as const, title: 'JSON Inválido', desc: e.message }],
        name: '',
        version: ''
      };
    }
  }, [pkgInput]);

  // ==========================================
  // FERRAMENTA 2: MATRIZ DE LICENÇAS OPEN SOURCE SPDX
  // ==========================================
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>('MIT');
  const [projectModel, setProjectModel] = useState<'saas' | 'binary' | 'opensource'>('saas');

  const selectedLicense = useMemo(() => {
    return LICENSES_DATA.find(l => l.id === selectedLicenseId) || LICENSES_DATA[0];
  }, [selectedLicenseId]);

  const licenseCompatibilityVerdict = useMemo(() => {
    if (projectModel === 'saas') {
      if (selectedLicense.id === 'AGPL-3.0') {
        return {
          safe: false,
          badge: 'ALTO RISCO (Copyleft de Rede)',
          color: 'text-rose-400 bg-rose-950/20 border-rose-800/60',
          desc: 'A licença AGPL-3.0 exige que você forneça o código-fonte completo da sua aplicação para qualquer usuário que a acesse via rede (SaaS).'
        };
      }
      return {
        safe: true,
        badge: 'SEGURO PARA SAAS FECHADO',
        color: 'text-emerald-400 bg-emerald-950/20 border-emerald-800/60',
        desc: 'Esta licença permite a execução do software como serviço na nuvem (SaaS) sem exigir que o código proprietário da sua plataforma seja aberto.'
      };
    }

    if (projectModel === 'binary') {
      if (selectedLicense.copyleft) {
        return {
          safe: false,
          badge: 'CONTAMINAÇÃO DE CÓDIGO (Copyleft)',
          color: 'text-rose-400 bg-rose-950/20 border-rose-800/60',
          desc: 'Distribuir executáveis compilados com código GPL/AGPL força a abertura de todo o código-fonte da aplicação proprietária.'
        };
      }
      return {
        safe: true,
        badge: 'COMPATÍVEL COM BINÁRIO FECHADO',
        color: 'text-emerald-400 bg-emerald-950/20 border-emerald-800/60',
        desc: 'Permite compilar e distribuir instaladores comerciais (Windows .exe, Mac .dmg, Android .apk) mantendo seu código privado.'
      };
    }

    return {
      safe: true,
      badge: 'TOTALMENTE COMPATÍVEL',
      color: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/60',
      desc: 'Projetos de código aberto podem incorporar esta biblioteca seguindo os termos originais de atribuição.'
    };
  }, [selectedLicense, projectModel]);

  // ==========================================
  // FERRAMENTA 3: GERADOR SBOM CYCLONEDX / SPDX
  // ==========================================
  const [sbomFormat, setSbomFormat] = useState<'cyclonedx' | 'spdx'>('cyclonedx');
  const [sbomAuthor, setSbomAuthor] = useState<string>('Holding V5 Apollo');

  const generatedSbom = useMemo(() => {
    let depsList: Array<{ name: string; version: string; license: string }> = [];
    try {
      const parsed = JSON.parse(pkgInput);
      const deps = parsed.dependencies || {};
      depsList = Object.keys(deps).map(name => ({
        name,
        version: deps[name].replace(/[\^~]/g, ''),
        license: 'MIT' // default fallback
      }));
    } catch {
      depsList = [
        { name: 'next', version: '14.2.35', license: 'MIT' },
        { name: 'react', version: '18.3.1', license: 'MIT' },
        { name: 'lucide-react', version: '0.475.0', license: 'ISC' }
      ];
    }

    if (sbomFormat === 'cyclonedx') {
      const cyclone = {
        bomFormat: "CycloneDX",
        specVersion: "1.5",
        serialNumber: "urn:uuid:v5-sbom-77889900-aabb-ccdd",
        version: 1,
        metadata: {
          timestamp: new Date().toISOString(),
          tools: [{ vendor: "V5 Apollo Tools", name: "SBOM Engine", version: "1.0.0" }],
          authors: [{ name: sbomAuthor, email: "devops@v5apollo.com" }],
          component: {
            type: "application",
            name: "v5-apollo-app",
            version: "1.0.0",
            purl: "pkg:npm/v5-apollo-app@1.0.0"
          }
        },
        components: depsList.map(d => ({
          type: "library",
          name: d.name,
          version: d.version,
          purl: `pkg:npm/${d.name}@${d.version}`,
          licenses: [{ license: { id: d.license } }]
        }))
      };
      return JSON.stringify(cyclone, null, 2);
    } else {
      const spdx = {
        spdxVersion: "SPDX-2.3",
        dataLicense: "CC0-1.0",
        SPDXID: "SPDXRef-DOCUMENT",
        name: "V5-Apollo-App-SBOM",
        documentNamespace: "https://v5apollo.com/spdxdocs/v5-app-2026",
        creationInfo: {
          created: new Date().toISOString(),
          creators: [`Organization: ${sbomAuthor}`]
        },
        packages: depsList.map(d => ({
          name: d.name,
          SPDXID: `SPDXRef-Package-${d.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
          versionInfo: d.version,
          downloadLocation: "NOASSERTION",
          licenseConcluded: d.license,
          licenseDeclared: d.license
        }))
      };
      return JSON.stringify(spdx, null, 2);
    }
  }, [pkgInput, sbomFormat, sbomAuthor]);

  // ==========================================
  // FERRAMENTA 4: RESOLVADOR DE INTERVALOS SEMVER 2.0.0
  // ==========================================
  const [semverRangeInput, setSemverRangeInput] = useState<string>('^1.4.2');
  const [testVersionInput, setTestVersionInput] = useState<string>('1.4.5');

  const semverEvaluation = useMemo(() => {
    const range = semverRangeInput.trim();
    const test = testVersionInput.trim();

    // Parse de versão de teste
    const parseVer = (v: string) => {
      const clean = v.replace(/^[vV]/, '');
      const parts = clean.split('.');
      return {
        major: parseInt(parts[0]) || 0,
        minor: parseInt(parts[1]) || 0,
        patch: parseInt(parts[2]) || 0
      };
    };

    const target = parseVer(test);

    // Amostra de versões para teste na matriz
    const sampleVersions = ['1.4.1', '1.4.2', '1.4.9', '1.5.0', '1.9.0', '2.0.0'];

    const checkMatch = (r: string, vStr: string) => {
      const v = parseVer(vStr);
      if (r === '*' || r === 'latest') return true;

      if (r.startsWith('^')) {
        const base = parseVer(r.slice(1));
        if (base.major > 0) {
          return v.major === base.major && (v.minor > base.minor || (v.minor === base.minor && v.patch >= base.patch));
        } else if (base.minor > 0) {
          return v.major === 0 && v.minor === base.minor && v.patch >= base.patch;
        } else {
          return v.major === 0 && v.minor === 0 && v.patch === base.patch;
        }
      }

      if (r.startsWith('~')) {
        const base = parseVer(r.slice(1));
        return v.major === base.major && v.minor === base.minor && v.patch >= base.patch;
      }

      if (r.endsWith('.x')) {
        const basePrefix = r.replace('.x', '');
        return vStr.startsWith(basePrefix);
      }

      return vStr === r;
    };

    const isTestMatch = checkMatch(range, test);

    let explanation = '';
    if (range.startsWith('^')) {
      explanation = 'Caret (^): Permite versões que não alteram o dígito mais à esquerda diferente de zero. Permite novas funcionalidades compatíveis (Minor) e correções (Patch).';
    } else if (range.startsWith('~')) {
      explanation = 'Tilde (~): Permite apenas correções de bugs (Patch releases), mantendo a versão Minor e Major estritamente fixas.';
    } else {
      explanation = 'Versão exata ou range customizado.';
    }

    return {
      isTestMatch,
      explanation,
      matrixResults: sampleVersions.map(v => ({
        version: v,
        match: checkMatch(range, v)
      }))
    };
  }, [semverRangeInput, testVersionInput]);

  // ==========================================
  // FERRAMENTA 5: OTIMIZADOR DE DOCKERFILE MULTI-STAGE
  // ==========================================
  const [dockerInput, setDockerInput] = useState<string>(SAMPLE_DOCKERFILE);
  const [targetStack, setTargetStack] = useState<'node-next' | 'python-fastapi'>('node-next');

  const optimizedDockerfile = useMemo(() => {
    if (targetStack === 'node-next') {
      return `# ========================================================
# Dockerfile Multi-Stage de Produção para Next.js 14+ (Soberano)
# Redução de tamanho de ~1.2GB para ~130MB (Node Alpine)
# ========================================================

# ESTÁGIO 1: Dependências Base com Cache Agressivo de Layers
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia APENAS os manifestos para aproveitar o cache do Docker
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# ESTÁGIO 2: Build da Aplicação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa telemetria para velocidade máxima
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ESTÁGIO 3: Imagem Final de Produção (Non-Root Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criação de usuário sem privilégios root para compliance CIS Benchmark
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs

# Copia artefatos essenciais com permissões restritas
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3009
ENV PORT=3009
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]`;
    } else {
      return `# ========================================================
# Dockerfile Multi-Stage de Produção para Python FastAPI
# ========================================================

FROM python:3.12-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app

# Usuário não-root
RUN useradd -m -u 1000 appuser
COPY --from=builder /root/.local /home/appuser/.local
COPY . .

USER appuser
ENV PATH=/home/appuser/.local/bin:$PATH

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`;
    }
  }, [targetStack]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Cabeçalho da Bancada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Dependências, Licenças & SBOM
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  DevOps & Governance
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Auditor de package.json, matriz de contaminação viral SPDX, gerador SBOM CycloneDX, simulador SemVer e otimizador de Dockerfile.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Soberania */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            SOC 2 / ISO 27001 Ready
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            CycloneDX v1.5
          </span>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pkg-auditor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'pkg-auditor'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Auditor de Package.json</span>
        </button>

        <button
          onClick={() => setActiveTab('spdx-matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'spdx-matrix'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriz de Licenças SPDX</span>
        </button>

        <button
          onClick={() => setActiveTab('sbom-generator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'sbom-generator'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Gerador SBOM CycloneDX</span>
        </button>

        <button
          onClick={() => setActiveTab('semver-resolver')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'semver-resolver'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Resolvador SemVer 2.0</span>
        </button>

        <button
          onClick={() => setActiveTab('dockerfile-optimizer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'dockerfile-optimizer'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Otimizador Dockerfile</span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: AUDITOR DE PACKAGE.JSON
      ======================================================== */}
      {activeTab === 'pkg-auditor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor de Entrada */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Conteúdo do package.json
                </h3>
                <button
                  onClick={() => setPkgInput(JSON.stringify(SAMPLE_PACKAGE_JSON, null, 2))}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 font-mono"
                >
                  Restaurar Exemplo
                </button>
              </div>

              <textarea
                rows={16}
                value={pkgInput}
                onChange={(e) => setPkgInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Diagnóstico e Score */}
            <div className="lg:col-span-2 space-y-4">
              {/* Score Geral */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Score de Conformidade</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold font-mono ${
                      pkgAuditReport.score >= 80 ? 'text-emerald-400' : (pkgAuditReport.score >= 60 ? 'text-amber-400' : 'text-rose-400')
                    }`}>
                      {pkgAuditReport.score}/100
                    </span>
                    <span className="text-xs text-slate-500">qualidade</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Dependências Prod</span>
                  <span className="text-3xl font-extrabold font-mono text-cyan-400">{pkgAuditReport.totalDeps}</span>
                  <span className="text-xs text-slate-500 ml-1">pacotes</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Dependências Dev</span>
                  <span className="text-3xl font-extrabold font-mono text-purple-400">{pkgAuditReport.totalDevDeps}</span>
                  <span className="text-xs text-slate-500 ml-1">pacotes</span>
                </div>
              </div>

              {/* Lista de Alertas e Boas Práticas */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Auditoria de Segurança & Melhores Práticas
                </h4>

                {pkgAuditReport.warnings.length > 0 ? (
                  <div className="space-y-2.5">
                    {pkgAuditReport.warnings.map((w, idx) => {
                      const levelStyles: Record<string, string> = {
                        danger: 'bg-rose-950/20 border-rose-800/60 text-rose-300',
                        warning: 'bg-amber-950/20 border-amber-800/60 text-amber-300',
                        info: 'bg-sky-950/20 border-sky-800/60 text-sky-300'
                      };

                      return (
                        <div key={idx} className={`p-3 rounded-lg border text-xs space-y-1 ${levelStyles[w.level]}`}>
                          <div className="font-semibold flex items-center gap-2">
                            {w.level === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                            {w.level === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            {w.level === 'info' && <Info className="w-4 h-4 text-sky-400" />}
                            <span>{w.title}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed pl-6">{w.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Nenhum risco detectado. O arquivo package.json segue as melhores práticas da indústria.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: MATRIZ DE LICENÇAS OPEN SOURCE SPDX
      ======================================================== */}
      {activeTab === 'spdx-matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Escolha da Licença */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Licenças Populares
              </h3>

              <div className="space-y-2">
                {LICENSES_DATA.map(lic => (
                  <button
                    key={lic.id}
                    onClick={() => setSelectedLicenseId(lic.id)}
                    className={`w-full p-3 rounded-lg text-left text-xs transition cursor-pointer border ${
                      selectedLicenseId === lic.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{lic.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {lic.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{lic.name}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Modelo de Distribuição do Seu Software
                </label>
                <select
                  value={projectModel}
                  onChange={(e) => setProjectModel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="saas">SaaS Proprietário na Nuvem (Acesso Web)</option>
                  <option value="binary">Binário Compilado Fechado (Desktop / Mobile)</option>
                  <option value="opensource">Projeto de Código Aberto (Open Source)</option>
                </select>
              </div>
            </div>

            {/* Veredito e Matriz de Permissões */}
            <div className="lg:col-span-2 space-y-4">
              {/* Card de Veredito */}
              <div className={`p-5 rounded-xl border ${licenseCompatibilityVerdict.color} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-current">
                    {licenseCompatibilityVerdict.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Licença: {selectedLicense.id}</span>
                </div>
                <h4 className="text-base font-bold text-white">{selectedLicense.name}</h4>
                <p className="text-xs leading-relaxed opacity-90">{licenseCompatibilityVerdict.desc}</p>
              </div>

              {/* Tabela de Direitos & Obrigações */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Direitos, Obrigações e Restrições Legais
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Uso Comercial Permitido</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Concessão Explícita de Patente</span>
                    {selectedLicense.patentGrant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">Não explícito</span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Obrigação de Revelar Código (Copyleft)</span>
                    {selectedLicense.copyleft ? (
                      <span className="text-rose-400 font-bold text-[11px]">Sim (Viral)</span>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[11px]">Não (Livre)</span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Preservação de Direitos Autorais</span>
                    <span className="text-cyan-400 font-bold text-[11px]">Obrigatória</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                  {selectedLicense.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: GERADOR SBOM CYCLONEDX / SPDX
      ======================================================== */}
      {activeTab === 'sbom-generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Configuração */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Formato de Exportação
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Padrão SBOM
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSbomFormat('cyclonedx')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      sbomFormat === 'cyclonedx'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    CycloneDX v1.5 (OWASP)
                  </button>
                  <button
                    onClick={() => setSbomFormat('spdx')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      sbomFormat === 'spdx'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    SPDX v2.3 (Linux Fdn)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Organização Responsável (Vendor)
                </label>
                <input
                  type="text"
                  value={sbomAuthor}
                  onChange={(e) => setSbomAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Requisito Regulatório:</p>
                <p className="leading-relaxed">
                  O padrão <strong>CycloneDX</strong> é o formato oficial recomendado pelo OWASP e exigido por auditorias de segurança SOC 2 e contratações federais internacionais (Executive Order 14028) para inventário de bibliotecas de terceiros.
                </p>
              </div>
            </div>

            {/* Visualizador de SBOM */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Manifesto SBOM Gerado ({sbomFormat.toUpperCase()})
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedSbom, 'sbom-copy')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                  >
                    {copiedKey === 'sbom-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar SBOM JSON</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 max-h-[460px] overflow-y-auto select-all">
                  <pre>{generatedSbom}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: RESOLVADOR DE INTERVALOS SEMVER 2.0.0
      ======================================================== */}
      {activeTab === 'semver-resolver' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles SemVer */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Expressão de Range
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Intervalo / Operador de Versão
                </label>
                <input
                  type="text"
                  value={semverRangeInput}
                  onChange={(e) => setSemverRangeInput(e.target.value)}
                  placeholder="^1.4.2 ou ~1.4.2"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Versão Específica para Testar
                </label>
                <input
                  type="text"
                  value={testVersionInput}
                  onChange={(e) => setTestVersionInput(e.target.value)}
                  placeholder="1.4.5"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => setSemverRangeInput('^1.4.2')}
                  className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  ^1.4.2 (Caret)
                </button>
                <button
                  onClick={() => setSemverRangeInput('~1.4.2')}
                  className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  ~1.4.2 (Tilde)
                </button>
                <button
                  onClick={() => setSemverRangeInput('1.4.x')}
                  className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  1.4.x (Wildcard)
                </button>
              </div>
            </div>

            {/* Avaliação & Matriz Visual */}
            <div className="lg:col-span-2 space-y-4">
              {/* Veredito da Versão Específica */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                semverEvaluation.isTestMatch
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-800/60 text-rose-300'
              }`}>
                <div className="flex items-center gap-3">
                  {semverEvaluation.isTestMatch ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <div>
                    <span className="font-bold text-white text-sm">
                      Versão {testVersionInput} {semverEvaluation.isTestMatch ? 'SATISFAZ' : 'NÃO SATISFAZ'} o range "{semverRangeInput}"
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{semverEvaluation.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Matriz de Resolução de Versões de Exemplo */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  Simulação de Resolução de Pacotes
                </h4>

                <div className="space-y-2">
                  {semverEvaluation.matrixResults.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-200">Release v{item.version}</span>
                      {item.match ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Aceita
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          Rejeitada
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: OTIMIZADOR DE DOCKERFILE MULTI-STAGE
      ======================================================== */}
      {activeTab === 'dockerfile-optimizer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entrada */}
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Dockerfile Original (Ingênuo):
                </span>
                <select
                  value={targetStack}
                  onChange={(e) => setTargetStack(e.target.value as any)}
                  className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                >
                  <option value="node-next">Node.js / Next.js 14</option>
                  <option value="python-fastapi">Python / FastAPI</option>
                </select>
              </div>

              <textarea
                rows={16}
                value={dockerInput}
                onChange={(e) => setDockerInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
              />

              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs text-amber-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Problemas do Dockerfile Original:
                </p>
                <p className="text-amber-400/90 leading-relaxed">
                  A linha <code>COPY . .</code> antes de <code>RUN npm install</code> invalida todo o cache de camadas do Docker a cada mudança de linha de código, forçando downloads repetidos e gerando contêineres gigantes (&gt; 1GB).
                </p>
              </div>
            </div>

            {/* Dockerfile Otimizado */}
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Dockerfile Otimizado (Multi-Stage Production):
                </span>
                <button
                  onClick={() => copyToClipboard(optimizedDockerfile, 'docker-opt')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedKey === 'docker-opt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Otimizado</span>
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 max-h-[440px] overflow-y-auto select-all">
                <pre>{optimizedDockerfile}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
