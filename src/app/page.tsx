'use client';

import React, { useState, useMemo } from 'react';
import Apollo5RocketLogo from '@/components/ui/Apollo5RocketLogo';
import V5AppActivationBanner from '@/components/ui/V5AppActivationBanner';
import { TOOLS_CATALOG, ToolItem } from '@/lib/data/toolsData';

// Individual Tools
import { CharacterCounter } from '@/components/tools/CharacterCounter';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { PixQrCodeGenerator } from '@/components/tools/PixQrCodeGenerator';
import { CpfCnpjTool } from '@/components/tools/CpfCnpjTool';
import { FakePersonGenerator } from '@/components/tools/FakePersonGenerator';
import { CreditCardValidator } from '@/components/tools/CreditCardValidator';
import { WhatsAppLinkGenerator } from '@/components/tools/WhatsAppLinkGenerator';
import { LineCleaner } from '@/components/tools/LineCleaner';
import { PromptCrafter } from '@/components/tools/PromptCrafter';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { ViralTitleGenerator } from '@/components/tools/ViralTitleGenerator';
import { ComfyWorkflowModal } from '@/components/tools/ComfyWorkflowModal';

// Specialized Power Suites
import { BrazilianDocsSuite } from '@/components/tools/BrazilianDocsSuite';
import { VehiclesAndBanksSuite } from '@/components/tools/VehiclesAndBanksSuite';
import { MathUtilsSuite } from '@/components/tools/MathUtilsSuite';
import { TextManipulatorSuite } from '@/components/tools/TextManipulatorSuite';
import { CryptoWebSuite } from '@/components/tools/CryptoWebSuite';
import { ApolloLaPlataSuite } from '@/components/tools/ApolloLaPlataSuite';
import { GeometrySuite } from '@/components/tools/GeometrySuite';
import { DevAndCvSuite } from '@/components/tools/DevAndCvSuite';
import { LotteryAndGamesSuite } from '@/components/tools/LotteryAndGamesSuite';
import { TimeAndFocusSuite } from '@/components/tools/TimeAndFocusSuite';
import { CalendarAndAstronomySuite } from '@/components/tools/CalendarAndAstronomySuite';
import { UnitsAndConvertersSuite } from '@/components/tools/UnitsAndConvertersSuite';
import { FinanceAndEconomySuite } from '@/components/tools/FinanceAndEconomySuite';
import { HealthAndEverydaySuite } from '@/components/tools/HealthAndEverydaySuite';
import { MediaAndUtilitySuite } from '@/components/tools/MediaAndUtilitySuite';
import { TextSpecializedSuite } from '@/components/tools/TextSpecializedSuite';
import { V5AiGatewaySuite } from '@/components/tools/V5AiGatewaySuite';
import { CreativeAndSpeedSuite } from '@/components/tools/CreativeAndSpeedSuite';
import { DevWebAndMediaSuite } from '@/components/tools/DevWebAndMediaSuite';
import { SecurityAndInfraSuite } from '@/components/tools/SecurityAndInfraSuite';
import { LegalAndWorkplaceSuite } from '@/components/tools/LegalAndWorkplaceSuite';
import { AudioVideoAndSocialSuite } from '@/components/tools/AudioVideoAndSocialSuite';
import { DataAndDevFormatsSuite } from '@/components/tools/DataAndDevFormatsSuite';
import { DesignAndFrontendSuite } from '@/components/tools/DesignAndFrontendSuite';
import { ProductivityAndTypesSuite } from '@/components/tools/ProductivityAndTypesSuite';
import { NetworkAndIdentifiersSuite } from '@/components/tools/NetworkAndIdentifiersSuite';
import { CryptoTokensAndSecuritySuite } from '@/components/tools/CryptoTokensAndSecuritySuite';
import { WebAssetsAndDiagnosticsSuite } from '@/components/tools/WebAssetsAndDiagnosticsSuite';
import { AiPromptAndViralSuite } from '@/components/tools/AiPromptAndViralSuite';
import { EcommerceTrafficAndConversionSuite } from '@/components/tools/EcommerceTrafficAndConversionSuite';
import { AcademicAndStudySuite } from '@/components/tools/AcademicAndStudySuite';
import { LegalDocumentsA4Suite } from '@/components/tools/LegalDocumentsA4Suite';
import { TaxAndFiscalSuite } from '@/components/tools/TaxAndFiscalSuite';
import { AccessibilityAndWebPerfSuite } from '@/components/tools/AccessibilityAndWebPerfSuite';
import { RegexAndLexicalSuite } from '@/components/tools/RegexAndLexicalSuite';
import { ApiAndNetworkTestingSuite } from '@/components/tools/ApiAndNetworkTestingSuite';
import { DocumentAndOpenSourceSuite } from '@/components/tools/DocumentAndOpenSourceSuite';
import { MediaAndAudioStudioSuite } from '@/components/tools/MediaAndAudioStudioSuite';
import { EmailAndTransactionalSuite } from '@/components/tools/EmailAndTransactionalSuite';
import { DevOpsAndGitSuite } from '@/components/tools/DevOpsAndGitSuite';
import { CryptoHashAndChecksumSuite } from '@/components/tools/CryptoHashAndChecksumSuite';
import { TypographyAndDesignSuite } from '@/components/tools/TypographyAndDesignSuite';
import { InvestmentAndFinanceBrasilSuite } from '@/components/tools/InvestmentAndFinanceBrasilSuite';
import { WebSecurityAndDiagnosticsSuite } from '@/components/tools/WebSecurityAndDiagnosticsSuite';
import { VectorAndPixelOptimizationSuite } from '@/components/tools/VectorAndPixelOptimizationSuite';
import { PerformanceAssetsAndVitalsSuite } from '@/components/tools/PerformanceAssetsAndVitalsSuite';
import { TerminalAndSysAdminSuite } from '@/components/tools/TerminalAndSysAdminSuite';
import { IoTAndHardwareSensorsSuite } from '@/components/tools/IoTAndHardwareSensorsSuite';
import { DatabaseSqlOptimizerSuite } from '@/components/tools/DatabaseSqlOptimizerSuite';
import { ModernCryptoAndSignaturesSuite } from '@/components/tools/ModernCryptoAndSignaturesSuite';
import { NetworkDnsDiagnosticsSuite } from '@/components/tools/NetworkDnsDiagnosticsSuite';
import { BinaryBuffersAndHexDumpSuite } from '@/components/tools/BinaryBuffersAndHexDumpSuite';
import { ApiDocsOpenApiMockSuite } from '@/components/tools/ApiDocsOpenApiMockSuite';
import { DependenciesSbomLicensingSuite } from '@/components/tools/DependenciesSbomLicensingSuite';
import { ServerBenchmarksAndMetricsSuite } from '@/components/tools/ServerBenchmarksAndMetricsSuite';
import { AiTelemetryAndTokenEconomicsSuite } from '@/components/tools/AiTelemetryAndTokenEconomicsSuite';
import { PromptEngineeringReasoningSuite } from '@/components/tools/PromptEngineeringReasoningSuite';
import { SvgVectorAndDesignTokensSuite } from '@/components/tools/SvgVectorAndDesignTokensSuite';
import { ModernImageCompressionWasmSuite } from '@/components/tools/ModernImageCompressionWasmSuite';
import { DataCompressionStreamsSuite } from '@/components/tools/DataCompressionStreamsSuite';
import { V8MemoryAndGarbageCollectionSuite } from '@/components/tools/V8MemoryAndGarbageCollectionSuite';
import { WebCryptoSymmetricAndWebRtcSuite } from '@/components/tools/WebCryptoSymmetricAndWebRtcSuite';
import { WebAssemblyAndAstBytecodeSuite } from '@/components/tools/WebAssemblyAndAstBytecodeSuite';
import { BinarySerializationProtobufSuite } from '@/components/tools/BinarySerializationProtobufSuite';
import { WebRtcMediaAndCodecsSuite } from '@/components/tools/WebRtcMediaAndCodecsSuite';
import { OAuthSecurityAndOidcSuite } from '@/components/tools/OAuthSecurityAndOidcSuite';
import { WebGlAndCanvasDiagnosticsSuite } from '@/components/tools/WebGlAndCanvasDiagnosticsSuite';
import { PostQuantumCryptographySuite } from '@/components/tools/PostQuantumCryptographySuite';
import { WebBluetoothAndHardwareSuite } from '@/components/tools/WebBluetoothAndHardwareSuite';
import { WebTransportAndHttp3Suite } from '@/components/tools/WebTransportAndHttp3Suite';
import { HomomorphicAndZkpSuite } from '@/components/tools/HomomorphicAndZkpSuite';
import { WebGpuComputeShadersSuite } from '@/components/tools/WebGpuComputeShadersSuite';
import { WebCodecsAndMediaMuxerSuite } from '@/components/tools/WebCodecsAndMediaMuxerSuite';
import { WebSpeechAndVoiceSuite } from '@/components/tools/WebSpeechAndVoiceSuite';
import { WebGpuRenderingAndShadersSuite } from '@/components/tools/WebGpuRenderingAndShadersSuite';
import { WebXrSpatialAndSensorsSuite } from '@/components/tools/WebXrSpatialAndSensorsSuite';
import { WebNnAndOnnxGraphSuite } from '@/components/tools/WebNnAndOnnxGraphSuite';
import { WebGpuParallelAlgorithmsSuite } from '@/components/tools/WebGpuParallelAlgorithmsSuite';
import { WebGpuRayTracingAndBvhSuite } from '@/components/tools/WebGpuRayTracingAndBvhSuite';
import { HybridPqcAndStatefulHashSuite } from '@/components/tools/HybridPqcAndStatefulHashSuite';
import { WebGpuPhysicsAndFluidSuite } from '@/components/tools/WebGpuPhysicsAndFluidSuite';

import { 
  Search, 
  Sparkles, 
  Type, 
  CaseSensitive, 
  QrCode, 
  MessageSquare, 
  ListFilter, 
  FileText, 
  Smile, 
  Shirt, 
  Sun, 
  Maximize2, 
  ShoppingBag, 
  Video, 
  Film, 
  Wand2, 
  Hash, 
  ArrowRight, 
  ShieldCheck,
  Users,
  CreditCard,
  KeyRound,
  FileCode,
  Layers,
  Terminal,
  Cpu,
  BookmarkCheck,
  Award,
  Car,
  Landmark,
  Building2,
  Calculator,
  Percent,
  Divide,
  Calendar,
  Barcode,
  Wifi,
  Binary,
  Dices,
  ArrowRightLeft,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Shapes,
  Compass,
  BarChart2,
  Scissors,
  Split,
  Table,
  Briefcase,
  Gamepad2,
  UserPlus,
  Image as ImageIcon,
  CircleDot,
  Shuffle,
  Trophy,
  Timer,
  Clock,
  Hourglass,
  Brain,
  Moon,
  CalendarDays,
  Ruler,
  Fingerprint,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Fuel,
  Heart,
  Baby,
  Flame,
  Scale,
  Keyboard,
  Monitor,
  FileEdit,
  ListOrdered,
  Lock,
  Unlock,
  Activity,
  Server,
  Zap,
  Play,
  Send,
  Palette,
  Globe,
  BookOpen,
  Star,
  Share2,
  Check,
  FileImage,
  Pipette,
  Key,
  Shield,
  Network,
  Code2,
  Database,
  Stethoscope,
  ShoppingCart,
  FileSpreadsheet,
  Radio,
  Music,
  Maximize,
  FileCode2,
  GitCompare,
  Eye,
  Link2,
  Code,
  Target,
  UserCheck,
  Tag,
  GraduationCap,
  Feather,
  Home,
  AlertTriangle,
  Truck,
  Gauge,
  EyeOff,
  Filter,
  X
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Type,
  CaseSensitive,
  QrCode,
  MessageSquare,
  ListFilter,
  FileText,
  Smile,
  Shirt,
  Sun,
  Maximize2,
  ShoppingBag,
  Video,
  Film,
  Wand2,
  Hash,
  ShieldCheck,
  Users,
  CreditCard,
  KeyRound,
  FileCode,
  Award,
  Car,
  Landmark,
  Building2,
  Calculator,
  Percent,
  Divide,
  Calendar,
  Barcode,
  Wifi,
  Binary,
  Dices,
  ArrowRightLeft,
  Layers,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Shapes,
  Compass,
  BarChart2,
  Scissors,
  Split,
  Table,
  Briefcase,
  Gamepad2,
  UserPlus,
  Image: ImageIcon,
  CircleDot,
  Shuffle,
  Trophy,
  Timer,
  Clock,
  Hourglass,
  Brain,
  Moon,
  CalendarDays,
  Ruler,
  Fingerprint,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Fuel,
  Heart,
  Baby,
  Flame,
  Scale,
  Keyboard,
  Monitor,
  FileEdit,
  ListOrdered,
  Lock,
  Unlock,
  Activity,
  Server,
  Zap,
  Play,
  Send,
  Palette,
  Globe,
  BookOpen,
  FileImage,
  Pipette,
  Key,
  Shield,
  Network,
  Code2,
  Database,
  Stethoscope,
  ShoppingCart,
  FileSpreadsheet,
  Radio,
  Music,
  Maximize,
  FileCode2,
  GitCompare,
  Eye,
  Link2,
  Code,
  Target,
  UserCheck,
  Tag,
  GraduationCap,
  Feather,
  Home,
  AlertTriangle,
  Truck,
  Gauge,
  EyeOff,
  Filter
};

export default function ApolloToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'favorites' | 'dev-4devs' | 'invertexto' | 'comfyui' | 'prompts'>('all');
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<string | null>('cpf-cnpj-tool');
  const [activeComfyModal, setActiveComfyModal] = useState<ToolItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [copiedLinkToolId, setCopiedLinkToolId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Inicialização no client: ler favoritos, recentes e query param ?tool=...
  React.useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('v5_tools_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedRecents = localStorage.getItem('v5_tools_recents');
      if (savedRecents) {
        setRecentTools(JSON.parse(savedRecents));
      }
    } catch {
      // Ignora erro de storage
    }

    // Atalho global Ctrl+K / Cmd+K e Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Deep linking: se vier com ?tool=id na URL, ativa imediatamente
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTool = params.get('tool');
      if (urlTool) {
        const found = TOOLS_CATALOG.find((t) => t.id === urlTool);
        if (found) {
          if (found.category === 'comfyui') {
            setActiveComfyModal(found);
          } else {
            setActiveInteractiveTool(found.id);
            setTimeout(() => {
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }, 300);
          }
        }
      }
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem('v5_tools_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const copyShareLink = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}${window.location.pathname}?tool=${toolId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLinkToolId(toolId);
      setTimeout(() => setCopiedLinkToolId(null), 2000);
    }
  };

  const selectedToolItem = useMemo(() => {
    return TOOLS_CATALOG.find((t) => t.id === activeInteractiveTool) || null;
  }, [activeInteractiveTool]);

  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'favorites'
          ? favorites.includes(tool.id)
          : tool.category === selectedCategory;
      const matchesSearch =
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, favorites]);

  const commandResults = useMemo(() => {
    if (!commandQuery.trim()) return TOOLS_CATALOG.slice(0, 10);
    return TOOLS_CATALOG.filter((tool) => {
      const q = commandQuery.toLowerCase();
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q))
      );
    }).slice(0, 12);
  }, [commandQuery]);

  const handleToolClick = (tool: ToolItem) => {
    // Registra nos recentes
    setRecentTools((prev) => {
      const updated = [tool.id, ...prev.filter((id) => id !== tool.id)].slice(0, 6);
      try {
        localStorage.setItem('v5_tools_recents', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (tool.category === 'comfyui') {
      setActiveComfyModal(tool);
    } else if (tool.isInteractive) {
      setActiveInteractiveTool(tool.id);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
    setIsCommandOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Banner de Ativação Apollo 5 */}
      <V5AppActivationBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Capitania #11 · Canivete Suíço da Holding V5
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            V5 Apollo Tools
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            A união definitiva das utilidades de desenvolvedor do <span className="text-emerald-400 font-bold">4Devs</span>, a agilidade do <span className="text-cyan-400 font-bold">Invertexto</span> e o poder criativo do <span className="text-amber-400 font-bold">Apollo La Plata</span> com vitrine de workflows do <span className="text-purple-400 font-bold">Nordy.ai ComfyUI</span>.
          </p>

          {/* Benchmarks Badge Row */}
          <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Padrão 4Devs (Dev & QA)
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Padrão Invertexto (Client-Side)
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" /> Apollo La Plata (IA Criativa)
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Padrão Nordy.ai (ComfyUI)
            </span>
          </div>

          {/* Search Box com Atalho Command Palette */}
          <div className="relative max-w-xl mx-auto pt-4">
            <Search className="w-5 h-5 absolute left-4 top-7 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar ferramenta ou pressione ⌘K..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-12 pr-20 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xl transition-all"
            />
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="absolute right-3.5 top-6.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>⌘K</span>
            </button>
          </div>

          {/* Histórico Recente de Ferramentas Usadas */}
          {recentTools.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap text-xs font-mono">
              <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-500" /> Recentes:
              </span>
              {recentTools.map((id) => {
                const tool = TOOLS_CATALOG.find((t) => t.id === id);
                if (!tool) return null;
                return (
                  <button
                    key={id}
                    onClick={() => handleToolClick(tool)}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                  >
                    {tool.title.split(' ')[0]} {tool.title.split(' ')[1] || ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Workbench Ativo (Ferramenta Interativa Selecionada) */}
        {activeInteractiveTool && (
          <div className="mb-10 transition-all duration-300 relative">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Bancada de Execução Ativa: <strong>{selectedToolItem?.title || activeInteractiveTool}</strong></span>
              </div>
              <button
                onClick={() => setActiveInteractiveTool(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fechar Bancada</span>
              </button>
            </div>

            {/* Suítes Especializadas */}
            {selectedToolItem?.suiteTarget === 'brazilian-docs' && (
              <BrazilianDocsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'vehicles-banks' && (
              <VehiclesAndBanksSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'math-utils' && (
              <MathUtilsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'text-manipulator' && (
              <TextManipulatorSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'crypto-web' && (
              <CryptoWebSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'apollo-suite' && (
              <ApolloLaPlataSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'geometry-suite' && (
              <GeometrySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'dev-cv-suite' && (
              <DevAndCvSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'lottery-games-suite' && (
              <LotteryAndGamesSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'time-focus-suite' && (
              <TimeAndFocusSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'calendar-astronomy-suite' && (
              <CalendarAndAstronomySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'units-converters-suite' && (
              <UnitsAndConvertersSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'finance-economy-suite' && (
              <FinanceAndEconomySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'health-everyday-suite' && (
              <HealthAndEverydaySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'media-utility-suite' && (
              <MediaAndUtilitySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'text-specialized-suite' && (
              <TextSpecializedSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'ai-gateway-suite' && (
              <V5AiGatewaySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'creative-speed-suite' && (
              <CreativeAndSpeedSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'dev-web-media-suite' && (
              <DevWebAndMediaSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'security-infra-suite' && (
              <SecurityAndInfraSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'legal-workplace-suite' && (
              <LegalAndWorkplaceSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'audio-video-social-suite' && (
              <AudioVideoAndSocialSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'data-dev-formats-suite' && (
              <DataAndDevFormatsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'design-frontend-suite' && (
              <DesignAndFrontendSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'productivity-types-suite' && (
              <ProductivityAndTypesSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'network-identifiers-suite' && (
              <NetworkAndIdentifiersSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'crypto-security-suite' && (
              <CryptoTokensAndSecuritySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'web-assets-suite' && (
              <WebAssetsAndDiagnosticsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'ai-prompt-viral-suite' && (
              <AiPromptAndViralSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'ecommerce-traffic-suite' && (
              <EcommerceTrafficAndConversionSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'academic-study-suite' && (
              <AcademicAndStudySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'legal-documents-a4-suite' && (
              <LegalDocumentsA4Suite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'tax-fiscal-suite' && (
              <TaxAndFiscalSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'accessibility-perf-suite' && (
              <AccessibilityAndWebPerfSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'regex-lexical-suite' && (
              <RegexAndLexicalSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'api-network-suite' && (
              <ApiAndNetworkTestingSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'document-opensource-suite' && (
              <DocumentAndOpenSourceSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'media-audio-studio-suite' && (
              <MediaAndAudioStudioSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'email-transactional-suite' && (
              <EmailAndTransactionalSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'devops-git-suite' && (
              <DevOpsAndGitSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'crypto-hash-suite' && (
              <CryptoHashAndChecksumSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'typography-design-suite' && (
              <TypographyAndDesignSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'investment-finance-suite' && (
              <InvestmentAndFinanceBrasilSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'web-security-diag-suite' && (
              <WebSecurityAndDiagnosticsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'vector-pixel-suite' && (
              <VectorAndPixelOptimizationSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'performance-vitals-suite' && (
              <PerformanceAssetsAndVitalsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'terminal-sysadmin-suite' && (
              <TerminalAndSysAdminSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'iot-hardware-suite' && (
              <IoTAndHardwareSensorsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'database-sql-suite' && (
              <DatabaseSqlOptimizerSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'modern-crypto-suite' && (
              <ModernCryptoAndSignaturesSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'network-dns-suite' && (
              <NetworkDnsDiagnosticsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'binary-buffers-suite' && (
              <BinaryBuffersAndHexDumpSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'api-docs-mock-suite' && (
              <ApiDocsOpenApiMockSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'dependencies-sbom-suite' && (
              <DependenciesSbomLicensingSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'server-benchmarks-suite' && (
              <ServerBenchmarksAndMetricsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'ai-telemetry-suite' && (
              <AiTelemetryAndTokenEconomicsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'prompt-engineering-suite' && (
              <PromptEngineeringReasoningSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'svg-design-tokens-suite' && (
              <SvgVectorAndDesignTokensSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'modern-images-wasm-suite' && (
              <ModernImageCompressionWasmSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'data-compression-streams-suite' && (
              <DataCompressionStreamsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'v8-memory-suite' && (
              <V8MemoryAndGarbageCollectionSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'web-crypto-webrtc-suite' && (
              <WebCryptoSymmetricAndWebRtcSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'wasm-ast-bytecode-suite' && (
              <WebAssemblyAndAstBytecodeSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'binary-serialization-protobuf-suite' && (
              <BinarySerializationProtobufSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webrtc-media-codecs-suite' && (
              <WebRtcMediaAndCodecsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'oauth-security-oidc-suite' && (
              <OAuthSecurityAndOidcSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webgl-canvas-diagnostics-suite' && (
              <WebGlAndCanvasDiagnosticsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'post-quantum-crypto-suite' && (
              <PostQuantumCryptographySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'web-bluetooth-hardware-suite' && (
              <WebBluetoothAndHardwareSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webtransport-http3-suite' && (
              <WebTransportAndHttp3Suite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'homomorphic-zkp-suite' && (
              <HomomorphicAndZkpSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webgpu-compute-suite' && (
              <WebGpuComputeShadersSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webcodecs-media-muxer-suite' && (
              <WebCodecsAndMediaMuxerSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'web-speech-voice-suite' && (
              <WebSpeechAndVoiceSuite key={activeInteractiveTool} initialTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webgpu-render-shaders-suite' && (
              <WebGpuRenderingAndShadersSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webxr-spatial-sensors-suite' && (
              <WebXrSpatialAndSensorsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webnn-onnx-suite' && (
              <WebNnAndOnnxGraphSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webgpu-parallel-suite' && (
              <WebGpuParallelAlgorithmsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webgpu-raytracing-suite' && (
              <WebGpuRayTracingAndBvhSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'hybrid-pqc-stateful-suite' && (
              <HybridPqcAndStatefulHashSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'webgpu-physics-fluid-suite' && (
              <WebGpuPhysicsAndFluidSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}

            {/* Ferramentas Standalone */}
            {!selectedToolItem?.suiteTarget && (
              <>
                {activeInteractiveTool === 'cpf-cnpj-tool' && <CpfCnpjTool />}
                {activeInteractiveTool === 'fake-person-generator' && <FakePersonGenerator />}
                {activeInteractiveTool === 'luhn-card-validator' && <CreditCardValidator />}
                {activeInteractiveTool === 'whatsapp-link-gen' && <WhatsAppLinkGenerator />}
                {activeInteractiveTool === 'line-cleaner' && <LineCleaner />}
                {activeInteractiveTool === 'password-generator' && <PasswordGenerator />}
                {activeInteractiveTool === 'json-formatter' && <JsonFormatter />}
                {activeInteractiveTool === 'prompt-expander' && <PromptCrafter />}
                {activeInteractiveTool === 'viral-title-generator' && <ViralTitleGenerator />}
                {activeInteractiveTool === 'char-counter' && <CharacterCounter />}
                {activeInteractiveTool === 'case-converter' && <CaseConverter />}
                {activeInteractiveTool === 'pix-qr-generator' && <PixQrCodeGenerator />}
              </>
            )}
          </div>
        )}

        {/* Categories & Catalog Grid */}
        <div className="space-y-6">
          {/* Categoria Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap border-b border-slate-800/80 pb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todas as Ferramentas ({TOOLS_CATALOG.length})
            </button>
            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'favorites'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${selectedCategory === 'favorites' ? 'fill-slate-950 text-slate-950' : 'text-amber-400 fill-amber-400/20'}`} />
              <span>Favoritos ({favorites.length})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('dev-4devs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'dev-4devs'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🇧🇷 Dev & Testes (4Devs) ({TOOLS_CATALOG.filter(t => t.category === 'dev-4devs').length})
            </button>
            <button
              onClick={() => setSelectedCategory('invertexto')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'invertexto'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ⚡ Invertexto & Web ({TOOLS_CATALOG.filter(t => t.category === 'invertexto').length})
            </button>
            <button
              onClick={() => setSelectedCategory('prompts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'prompts'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              💡 Apollo La Plata (IA) ({TOOLS_CATALOG.filter(t => t.category === 'prompts').length})
            </button>
            <button
              onClick={() => setSelectedCategory('comfyui')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'comfyui'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🎨 ComfyUI Workflows ({TOOLS_CATALOG.filter(t => t.category === 'comfyui').length})
            </button>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.icon] || Sparkles;
              const isSelected = activeInteractiveTool === tool.id;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`group relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          tool.category === 'comfyui'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20'
                            : tool.category === 'dev-4devs'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20'
                            : tool.category === 'prompts'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500/20'
                        } transition-colors`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tool.badge && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                              tool.category === 'comfyui'
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                : tool.category === 'dev-4devs'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : tool.category === 'prompts'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            {tool.badge}
                          </span>
                        )}

                        <button
                          onClick={(e) => copyShareLink(tool.id, e)}
                          title="Copiar Link Direto"
                          className="p-1 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          {copiedLinkToolId === tool.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={(e) => toggleFavorite(tool.id, e)}
                          title={favorites.includes(tool.id) ? "Remover dos Favoritos" : "Favoritar Ferramenta"}
                          className="p-1 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              favorites.includes(tool.id) ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      {tool.categoryLabel}
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{tool.category === 'comfyui' ? 'Ver Nós & JSON' : 'Usar Ferramenta'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Apollo5RocketLogo size="sm" showText={false} />
            <span className="font-mono text-slate-400">
              Holding V5 Apollo · Capitania #11 (V5 Tools)
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Inspiração: 4Devs · Invertexto · Apollo La Plata · Nordy.ai · Soberania de Dados & Zero Lock-in
          </p>
        </div>
      </footer>

      {/* ComfyUI Workflow Modal */}
      <ComfyWorkflowModal
        tool={activeComfyModal}
        onClose={() => setActiveComfyModal(null)}
      />

      {/* Command Palette (Ctrl+K / Cmd+K) */}
      {isCommandOpen && (
        <div 
          onClick={() => setIsCommandOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header do Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Digite o nome de qualquer ferramenta (ex: CPF, Hash, JSON, Regex, ComfyUI)..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white bg-slate-800/60 text-xs font-mono"
              >
                ESC
              </button>
            </div>

            {/* Lista de Resultados */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
              {commandResults.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  Nenhuma ferramenta encontrada para "{commandQuery}".
                </div>
              ) : (
                commandResults.map((tool) => {
                  const Icon = ICON_MAP[tool.icon] || Sparkles;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/50 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition">
                            {tool.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                            {tool.badge}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer da Command Palette */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Navegue com o mouse ou clique para executar</span>
              <span>115+ Ferramentas Cadastradas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
