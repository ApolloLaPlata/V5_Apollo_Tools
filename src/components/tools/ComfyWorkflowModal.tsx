'use client';

import React, { useState } from 'react';
import { X, Download, Copy, Check, Sparkles, ExternalLink, Cpu, Layers } from 'lucide-react';
import { ToolItem } from '@/lib/data/toolsData';

interface ComfyWorkflowModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

export function ComfyWorkflowModal({ tool, onClose }: ComfyWorkflowModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!tool) return null;

  // Workflow JSON mock estruturado no padrão ComfyUI API
  const sampleWorkflowJson = {
    workflow_name: tool.title,
    engine: "ComfyUI API Backend (V5 Fleet & Modal)",
    model_checkpoint: tool.modelTarget || "Flux1-Dev-Q8.safetensors",
    nodes_count: 14,
    pipeline: [
      { id: "1", type: "CheckpointLoaderSimple", inputs: { ckpt_name: tool.modelTarget } },
      { id: "2", type: "CLIPTextEncode", inputs: { text: "high quality, 8k resolution, detailed" } },
      { id: "3", type: "KSampler", inputs: { steps: 25, cfg: 7.5, sampler_name: "euler", scheduler: "normal" } },
      { id: "4", type: "VAEDecode", inputs: {} },
      { id: "5", type: "SaveImage", inputs: { filename_prefix: "V5_Tools_" + tool.id } }
    ],
    sovereignty: "Custódia Soberana Offline - Padrão ComfyUI / Nordy.ai"
  };

  const jsonStr = JSON.stringify(sampleWorkflowJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow_comfyui_${tool.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30">
                {tool.categoryLabel}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                {tool.modelTarget}
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {tool.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {tool.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inspeção do Grafo / Nós do ComfyUI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grafo de Execução ComfyUI (Padrão API):</span>
            </span>
            <span>{sampleWorkflowJson.nodes_count} Nós Conectados</span>
          </div>

          <pre className="p-4 rounded-2xl bg-black/80 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-60 leading-relaxed select-all">
            {jsonStr}
          </pre>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloaded ? 'Baixado!' : 'Baixar (.JSON)'}</span>
            </button>
          </div>

          <a
            href="https://prisma.v5apollo.com/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>Executar no V5 Prisma</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
