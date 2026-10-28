'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { SpatialAudioAndAmbisonicsSuite } from '@/components/tools/SpatialAudioAndAmbisonicsSuite';
import { PairingCryptoAndThresholdSuite } from '@/components/tools/PairingCryptoAndThresholdSuite';
import { CrossShaderCompilerAndReflectionSuite } from '@/components/tools/CrossShaderCompilerAndReflectionSuite';
import { QuantumCircuitAndBlochSphereSuite } from '@/components/tools/QuantumCircuitAndBlochSphereSuite';
import { GeospatialAndCartographySuite } from '@/components/tools/GeospatialAndCartographySuite';
import { NextGenVideoAndHdrColorSuite } from '@/components/tools/NextGenVideoAndHdrColorSuite';
import { OrbitalMechanicsAndAstrophysicsSuite } from '@/components/tools/OrbitalMechanicsAndAstrophysicsSuite';
import { PlasmaPhysicsAndFusionSuite } from '@/components/tools/PlasmaPhysicsAndFusionSuite';
import { BioinformaticsAndStructuralGenomicsSuite } from '@/components/tools/BioinformaticsAndStructuralGenomicsSuite';
import { ParticlePhysicsAndRelativisticKinematicsSuite } from '@/components/tools/ParticlePhysicsAndRelativisticKinematicsSuite';
import { GeneralRelativityAndGravitationalWavesSuite } from '@/components/tools/GeneralRelativityAndGravitationalWavesSuite';
import { CosmologyAndFlrwCosmicExpansionSuite } from '@/components/tools/CosmologyAndFlrwCosmicExpansionSuite';
import { QuantumElectrodynamicsAndVacuumSuite } from '@/components/tools/QuantumElectrodynamicsAndVacuumSuite';
import { QuantumChromodynamicsAndQuarkGluonSuite } from '@/components/tools/QuantumChromodynamicsAndQuarkGluonSuite';
import { StringTheoryAndQuantumGravitySuite } from '@/components/tools/StringTheoryAndQuantumGravitySuite';
import { TheoryOfEverythingAndSupersymmetrySuite } from '@/components/tools/TheoryOfEverythingAndSupersymmetrySuite';
import { HighEnergyAstrophysicsAndCosmicRaysSuite } from '@/components/tools/HighEnergyAstrophysicsAndCosmicRaysSuite';
import { AstrobiologyExoplanetsAndHabitabilitySuite } from '@/components/tools/AstrobiologyExoplanetsAndHabitabilitySuite';
import { BiologicalNeuralNetworksAndElectrophysiologySuite } from '@/components/tools/BiologicalNeuralNetworksAndElectrophysiologySuite';
import { QuantitativePharmacologyAndPbpkSuite } from '@/components/tools/QuantitativePharmacologyAndPbpkSuite';
import { SystemsImmunologyAndViralDynamicsSuite } from '@/components/tools/SystemsImmunologyAndViralDynamicsSuite';

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
  X,
  Archive,
  Atom,
  Battery,
  BatteryCharging,
  Bluetooth,
  Box,
  Boxes,
  Copy,
  Crop,
  Crosshair,
  Dna,
  Droplets,
  FileCheck,
  FileCheck2,
  Focus,
  FolderTree,
  GitBranch,
  GitMerge,
  Glasses,
  Grid,
  HardDrive,
  Headphones,
  Languages,
  Map,
  Mic,
  Move3d,
  Navigation,
  Orbit,
  Package,
  Rocket,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Smartphone,
  Telescope,
  Thermometer,
  TreeDeciduous,
  TrendingDown,
  Volume2,
  Waves,
  Workflow,
  LayoutGrid,
  PanelLeft
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
  Filter,
  Archive,
  Atom,
  Battery,
  BatteryCharging,
  Bluetooth,
  Box,
  Boxes,
  Copy,
  Crop,
  Crosshair,
  Dna,
  Droplets,
  FileCheck,
  FileCheck2,
  Focus,
  FolderTree,
  GitBranch,
  GitMerge,
  Glasses,
  Grid,
  HardDrive,
  Headphones,
  ImageIcon,
  Languages,
  Map,
  Mic,
  Move3d,
  Navigation,
  Orbit,
  Package,
  Rocket,
  RotateCcw,
  Search,
  Share2,
  ShieldAlert,
  Sliders,
  Smartphone,
  Sparkles,
  Telescope,
  Thermometer,
  TreeDeciduous,
  TrendingDown,
  Volume2,
  Waves,
  Workflow,
  LayoutGrid,
  PanelLeft
};

const normalize = (str: string) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function ApolloToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'favorites' | 'dev-4devs' | 'invertexto' | 'comfyui' | 'prompts'>('all');
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<string | null>('cpf-cnpj-tool');
  const [viewMode, setViewMode] = useState<'workbench' | 'catalog'>('workbench');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarCategory, setSidebarCategory] = useState<'all' | 'favorites' | 'dev-4devs' | 'invertexto' | 'comfyui' | 'prompts'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeComfyModal, setActiveComfyModal] = useState<ToolItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [copiedLinkToolId, setCopiedLinkToolId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const workbenchRef = useRef<HTMLDivElement>(null);

  // Inicialização no client: ler favoritos, recentes e query param ?tool=...
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('v5_tools_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
      const savedRecents = localStorage.getItem('v5_tools_recents');
      if (savedRecents) {
        const parsed = JSON.parse(savedRecents);
        if (Array.isArray(parsed)) setRecentTools(parsed);
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
        setActiveComfyModal(null);
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
              if (workbenchRef.current) {
                workbenchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }
            }, 150);
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
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(shareUrl).catch(() => {});
        }
      } catch {}
      setCopiedLinkToolId(toolId);
      setTimeout(() => setCopiedLinkToolId(null), 2000);
    }
  };

  const selectedToolItem = useMemo(() => {
    return TOOLS_CATALOG.find((t) => t.id === activeInteractiveTool) || null;
  }, [activeInteractiveTool]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dev-4devs': return '4Devs & QA';
      case 'invertexto': return 'Invertexto & Web';
      case 'comfyui': return 'ComfyUI & IA Visual';
      case 'prompts': return 'Apollo La Plata Prompts';
      default: return 'Geral';
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'dev-4devs': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'invertexto': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'comfyui': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'prompts': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const sidebarTools = useMemo(() => {
    const q = normalize(sidebarSearch);
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCat =
        sidebarCategory === 'all'
          ? true
          : sidebarCategory === 'favorites'
          ? favorites.includes(tool.id)
          : tool.category === sidebarCategory;

      if (!q) return matchesCat;

      const titleNorm = normalize(tool.title);
      const descNorm = normalize(tool.description);
      const tagsNorm = tool.tags.map(normalize);

      return (
        matchesCat &&
        (titleNorm.includes(q) || descNorm.includes(q) || tagsNorm.some((t) => t.includes(q)))
      );
    });
  }, [sidebarSearch, sidebarCategory, favorites]);

  const relatedTools = useMemo(() => {
    if (!selectedToolItem) return [];
    return TOOLS_CATALOG.filter(
      (t) => t.category === selectedToolItem.category && t.id !== selectedToolItem.id
    ).slice(0, 4);
  }, [selectedToolItem]);


  const filteredTools = useMemo(() => {
    const q = normalize(searchTerm);
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'favorites'
          ? favorites.includes(tool.id)
          : tool.category === selectedCategory;

      if (!q) return matchesCategory;

      const titleNorm = normalize(tool.title);
      const descNorm = normalize(tool.description);
      const tagsNorm = tool.tags.map(normalize);

      const matchesSearch =
        titleNorm.includes(q) ||
        descNorm.includes(q) ||
        tagsNorm.some((t) => t.includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, favorites]);

  const commandResults = useMemo(() => {
    const q = normalize(commandQuery);
    if (!q) return TOOLS_CATALOG.slice(0, 10);
    return TOOLS_CATALOG.filter((tool) => {
      const titleNorm = normalize(tool.title);
      const descNorm = normalize(tool.description);
      const tagsNorm = tool.tags.map(normalize);
      return (
        titleNorm.includes(q) ||
        descNorm.includes(q) ||
        tagsNorm.some((t) => t.includes(q))
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
      setViewMode('workbench');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    setIsCommandOpen(false);
    setCommandQuery('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner de Ativação Apollo 5 */}
      <V5AppActivationBanner />

      {/* Header Soberano Branco (Padrão 4Devs / Invertexto) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Esquerda: Botão Menu Mobile + Logo + Identidade */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Abrir menu de ferramentas"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <Apollo5RocketLogo size="sm" showText={false} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    V5 Apollo Tools
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Capitania #11
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium hidden md:block">
                  Padrão 4Devs · Invertexto · Apollo La Plata · Nordy.ai ComfyUI
                </div>
              </div>
            </div>
          </div>

          {/* Centro: Barra de Busca Rápida (Estilo 4Devs / Invertexto) */}
          <div className="flex-1 max-w-md sm:max-w-lg mx-2">
            <div
              onClick={() => setIsCommandOpen(true)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 transition shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Buscar ferramenta (ex: CPF, JSON, Pix, Hash, ComfyUI)...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-xs shrink-0">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Direita: Ações Rápidas (Favoritos) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSidebarCategory(sidebarCategory === 'favorites' ? 'all' : 'favorites');
                setIsSidebarOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                sidebarCategory === 'favorites'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
              title="Filtrar Favoritos na barra lateral"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Favoritos</span>
              <span className="text-[11px] font-mono">({favorites.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout Master-Detail: Barra Lateral à Esquerda + Conteúdo à Direita */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative bg-[#f8fafc]">
        {/* Backdrop Mobile para a Sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ============================================================== */}
        {/* BARRA LATERAL MINIMIZADA (TEXTO PURO - PADRÃO 4DEVS / INVERTEXTO) */}
        {/* ============================================================== */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-16 inset-y-0 left-0 z-50 lg:z-10 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col h-full lg:h-[calc(100vh-4rem)] transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Header da Barra Lateral */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PanelLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Navegação de Ferramentas</span>
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                aria-label="Fechar barra lateral"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input de Filtro Rápido na Barra Lateral */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar ferramentas pelo nome..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Limpar filtro"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtros Rápidos de Categoria em Texto */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={() => setSidebarCategory('all')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  sidebarCategory === 'all'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todas ({TOOLS_CATALOG.length})
              </button>
              <button
                onClick={() => setSidebarCategory('dev-4devs')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  sidebarCategory === 'dev-4devs'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🇧🇷 4Devs
              </button>
              <button
                onClick={() => setSidebarCategory('invertexto')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  sidebarCategory === 'invertexto'
                    ? 'bg-cyan-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ⚡ Invertexto
              </button>
              <button
                onClick={() => setSidebarCategory('comfyui')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  sidebarCategory === 'comfyui'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🎨 ComfyUI
              </button>
              <button
                onClick={() => setSidebarCategory('prompts')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  sidebarCategory === 'prompts'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                💡 IA
              </button>
            </div>
          </div>

          {/* Lista de Ferramentas (TEXTO PURO, CLIQUE INSTANTÂNEO, SEM CARDS) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 divide-y divide-slate-100">
            {sidebarTools.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-sans">
                <p>Nenhuma ferramenta encontrada para "{sidebarSearch}".</p>
                <button
                  onClick={() => { setSidebarSearch(''); setSidebarCategory('all'); }}
                  className="mt-2 text-blue-600 font-semibold hover:underline text-xs"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              sidebarTools.map((tool) => {
                const isSelected = activeInteractiveTool === tool.id;
                const isFav = favorites.includes(tool.id);

                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      handleToolClick(tool);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-800 font-bold border-l-4 border-blue-600 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
                    }`}
                  >
                    <span className="truncate pr-2">{tool.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isFav && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                      {tool.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold text-slate-500 bg-slate-100 group-hover:bg-slate-200">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Rodapé da Barra Lateral */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>{sidebarTools.length} de {TOOLS_CATALOG.length}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 100% Client-Side
            </span>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* ÁREA DE CONTEÚDO PRINCIPAL (A FERRAMENTA ATIVA À DIREITA)       */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          {selectedToolItem ? (
            <div ref={workbenchRef} className="space-y-6 max-w-6xl w-full mx-auto">
              {/* Header da Ferramenta Ativa (Breadcrumbs + Título + Ações) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-2">
                  <span className="hover:text-blue-600 cursor-pointer" onClick={() => setActiveInteractiveTool('cpf-cnpj-tool')}>Início</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-600 font-medium">{getCategoryLabel(selectedToolItem.category)}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-600 font-bold truncate">{selectedToolItem.title}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {selectedToolItem.title}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                      {selectedToolItem.description}
                    </p>
                  </div>

                  {/* Botões de Ação da Ferramenta */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => copyShareLink(selectedToolItem.id, e)}
                      title="Copiar Link Direto da Ferramenta"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
                    >
                      {copiedLinkToolId === selectedToolItem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Compartilhar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => toggleFavorite(selectedToolItem.id, e)}
                      title={favorites.includes(selectedToolItem.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        favorites.includes(selectedToolItem.id)
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          favorites.includes(selectedToolItem.id) ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                        }`}
                      />
                      <span>{favorites.includes(selectedToolItem.id) ? 'Favorito' : 'Favoritar'}</span>
                    </button>
                  </div>
                </div>

                {/* Badges de Garantia Soberana */}
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 flex-wrap text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> 100% Client-Side
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-blue-600" /> Privacidade Absoluta (Zero Envio de Dados)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-600" /> Execução Instantânea
                  </span>
                </div>
              </div>

              {/* Bancada da Ferramenta (Container com Estilo Branco .workbench-light) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm workbench-light">
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
            {selectedToolItem?.suiteTarget === 'spatial-audio-ambisonics-suite' && (
              <SpatialAudioAndAmbisonicsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'pairing-crypto-threshold-suite' && (
              <PairingCryptoAndThresholdSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'cross-shader-reflection-suite' && (
              <CrossShaderCompilerAndReflectionSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'quantum-circuit-bloch-suite' && (
              <QuantumCircuitAndBlochSphereSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'geospatial-cartography-suite' && (
              <GeospatialAndCartographySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'nextgen-video-hdr-suite' && (
              <NextGenVideoAndHdrColorSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'orbital-mechanics-astrophysics-suite' && (
              <OrbitalMechanicsAndAstrophysicsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'plasma-physics-fusion-suite' && (
              <PlasmaPhysicsAndFusionSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'bioinformatics-structural-genomics-suite' && (
              <BioinformaticsAndStructuralGenomicsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'particle-physics-relativistic-suite' && (
              <ParticlePhysicsAndRelativisticKinematicsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'general-relativity-gravitational-waves-suite' && (
              <GeneralRelativityAndGravitationalWavesSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'cosmology-flrw-expansion-suite' && (
              <CosmologyAndFlrwCosmicExpansionSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'qed-vacuum-electroweak-suite' && (
              <QuantumElectrodynamicsAndVacuumSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'qcd-quark-gluon-suite' && (
              <QuantumChromodynamicsAndQuarkGluonSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'string-theory-quantum-gravity-suite' && (
              <StringTheoryAndQuantumGravitySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'theory-of-everything-susy-suite' && (
              <TheoryOfEverythingAndSupersymmetrySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'high-energy-astrophysics-suite' && (
              <HighEnergyAstrophysicsAndCosmicRaysSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'astrobiology-exoplanets-suite' && (
              <AstrobiologyExoplanetsAndHabitabilitySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'biological-neural-networks-suite' && (
              <BiologicalNeuralNetworksAndElectrophysiologySuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'quantitative-pharmacology-pbpk-suite' && (
              <QuantitativePharmacologyAndPbpkSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
            )}
            {selectedToolItem?.suiteTarget === 'systems-immunology' && (
              <SystemsImmunologyAndViralDynamicsSuite key={activeInteractiveTool} defaultTab={selectedToolItem.suiteTab as any} />
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
                {Boolean(activeInteractiveTool && ![
                  'cpf-cnpj-tool', 'fake-person-generator', 'luhn-card-validator', 
                  'whatsapp-link-gen', 'line-cleaner', 'password-generator', 
                  'json-formatter', 'prompt-expander', 'viral-title-generator', 
                  'char-counter', 'case-converter', 'pix-qr-generator'
                ].includes(activeInteractiveTool)) && (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm font-mono">
                    Ferramenta {activeInteractiveTool} ativa e pronta para execução segura.
                  </div>
                )}
              </>
            )}
              </div>

              {/* Ferramentas Relacionadas (Padrão Invertexto / 4Devs) */}
              {relatedTools.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Ferramentas Relacionadas que Você Pode Precisar</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Mesma categoria</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {relatedTools.map((relTool) => (
                      <button
                        key={relTool.id}
                        onClick={() => handleToolClick(relTool)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition truncate">
                            {relTool.title}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {relTool.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-blue-600 font-semibold mt-2 pt-1 border-t border-slate-100">
                          <span>Acessar</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Educativo & SEO E-E-A-T (Padrão 4Devs / Invertexto) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2 shadow-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>Sobre esta Ferramenta e Segurança</span>
                </h4>
                <p className="leading-relaxed">
                  Esta utilidade foi projetada para desenvolvedores, analistas de QA, designers e profissionais que necessitam de cálculos e validações instantâneas. Os dados manipulados aqui são processados <strong>exclusivamente na memória do seu navegador</strong> via algoritmos matemáticos soberanos em TypeScript, garantindo confidencialidade e velocidade máxima.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
              Selecione uma ferramenta na barra lateral para começar a usar.
            </div>
          )}

          {/* Footer Limpo e Profissional */}
          <footer className="mt-auto pt-8 pb-4 text-center text-xs text-slate-400 font-mono">
            <p>
              Holding V5 Apollo · Capitania #11 (V5 Tools) · Inspiração: 4Devs & Invertexto · 100% Client-Side
            </p>
          </footer>
        </main>
      </div>

      {/* ComfyUI Workflow Modal */}
      <ComfyWorkflowModal
        tool={activeComfyModal}
        onClose={() => setActiveComfyModal(null)}
      />

      {/* Command Palette (Ctrl+K / Cmd+K) - Estilo Limpo Branco */}
      {isCommandOpen && (
        <div 
          onClick={() => setIsCommandOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header do Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Digite o nome de qualquer ferramenta (ex: CPF, Hash, JSON, Regex, ComfyUI)..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                aria-label="Fechar busca rápida"
                title="Fechar (Esc)"
                className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 bg-white border border-slate-200 text-xs font-mono shadow-xs cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Lista de Resultados */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
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
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {tool.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {tool.badge}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer da Command Palette */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Navegue com o mouse ou clique para executar</span>
              <span>{TOOLS_CATALOG.length} Ferramentas Cadastradas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
