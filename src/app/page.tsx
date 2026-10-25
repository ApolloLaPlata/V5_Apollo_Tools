'use client';

import React, { useState, useMemo } from 'react';
import Apollo5RocketLogo from '@/components/ui/Apollo5RocketLogo';
import V5AppActivationBanner from '@/components/ui/V5AppActivationBanner';
import { TOOLS_CATALOG, ToolItem } from '@/lib/data/toolsData';
import { CharacterCounter } from '@/components/tools/CharacterCounter';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { PixQrCodeGenerator } from '@/components/tools/PixQrCodeGenerator';
import { CpfCnpjTool } from '@/components/tools/CpfCnpjTool';
import { FakePersonGenerator } from '@/components/tools/FakePersonGenerator';
import { CreditCardValidator } from '@/components/tools/CreditCardValidator';
import { WhatsAppLinkGenerator } from '@/components/tools/WhatsAppLinkGenerator';
import { LineCleaner } from '@/components/tools/LineCleaner';
import { PromptCrafter } from '@/components/tools/PromptCrafter';
import { ComfyWorkflowModal } from '@/components/tools/ComfyWorkflowModal';
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
  BookmarkCheck
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
  FileCode
};

export default function ApolloToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dev-4devs' | 'invertexto' | 'comfyui' | 'prompts'>('all');
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<string | null>('cpf-cnpj-tool');
  const [activeComfyModal, setActiveComfyModal] = useState<ToolItem | null>(null);

  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleToolClick = (tool: ToolItem) => {
    if (tool.category === 'comfyui') {
      setActiveComfyModal(tool);
    } else if (tool.isInteractive) {
      setActiveInteractiveTool(tool.id);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
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
            A união definitiva das utilidades de desenvolvedor do <span className="text-emerald-400 font-bold">4Devs</span>, a agilidade do <span className="text-cyan-400 font-bold">Invertexto</span> e o poder dos workflows do <span className="text-purple-400 font-bold">Nordy.ai ComfyUI</span>.
          </p>

          {/* Benchmarks Badge Row */}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Padrão 4Devs (Dev & QA)
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Padrão Invertexto (Client-Side)
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Padrão Nordy.ai (ComfyUI Workflows)
            </span>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto pt-4">
            <Search className="w-5 h-5 absolute left-4 top-7 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por ferramenta (ex: CPF, Pix, ComfyUI, Face Swap, Contador, JSON)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xl transition-all"
            />
          </div>
        </div>

        {/* Workbench Ativo (Ferramenta Interativa Selecionada) */}
        {activeInteractiveTool && (
          <div className="mb-10 transition-all duration-300">
            {activeInteractiveTool === 'cpf-cnpj-tool' && <CpfCnpjTool />}
            {activeInteractiveTool === 'fake-person-generator' && <FakePersonGenerator />}
            {activeInteractiveTool === 'luhn-card-validator' && <CreditCardValidator />}
            {activeInteractiveTool === 'whatsapp-link-gen' && <WhatsAppLinkGenerator />}
            {activeInteractiveTool === 'line-cleaner' && <LineCleaner />}
            {activeInteractiveTool === 'prompt-expander' && <PromptCrafter />}
            {activeInteractiveTool === 'char-counter' && <CharacterCounter />}
            {activeInteractiveTool === 'case-converter' && <CaseConverter />}
            {activeInteractiveTool === 'pix-qr-generator' && <PixQrCodeGenerator />}
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
              Todas ({TOOLS_CATALOG.length})
            </button>
            <button
              onClick={() => setSelectedCategory('dev-4devs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'dev-4devs'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🇧🇷 Dev & Testes (4Devs)
            </button>
            <button
              onClick={() => setSelectedCategory('invertexto')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'invertexto'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ⚡ Invertexto & Web
            </button>
            <button
              onClick={() => setSelectedCategory('comfyui')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'comfyui'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🎨 ComfyUI Workflows (Nordy.ai)
            </button>
            <button
              onClick={() => setSelectedCategory('prompts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'prompts'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              💡 Prompts & IA Criativa
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
            Inspiração: 4Devs · Invertexto · Nordy.ai · Soberania de Dados & Zero Lock-in
          </p>
        </div>
      </footer>

      {/* ComfyUI Workflow Modal */}
      <ComfyWorkflowModal
        tool={activeComfyModal}
        onClose={() => setActiveComfyModal(null)}
      />
    </div>
  );
}
