'use client';

import React, { useState, useMemo } from 'react';
import { Wand2, Copy, Check, Sparkles, Sliders, RefreshCw, Layers, Camera, Sun, Palette, Film } from 'lucide-react';

interface PromptOption {
  label: string;
  value: string;
}

const STYLES: PromptOption[] = [
  { label: 'Cinemático Hollywood', value: 'cinematic film still, 35mm photograph, shot on Arri Alexa, cinematic lighting, color graded' },
  { label: 'Hiper-Realista 8K', value: 'hyperrealistic, photorealistic, 8k resolution, extremely detailed, lifelike textures, sharp focus' },
  { label: 'Fotografia de Produto Comercial', value: 'commercial product photography, clean white and subtle gray studio backdrop, soft studio lighting, ultra crisp' },
  { label: 'Retrato de Estúdio (Studio Portrait)', value: 'studio portrait, 85mm lens f/1.4, shallow depth of field, natural skin texture, catchlight in eyes' },
  { label: 'Cyberpunk Futurista', value: 'cyberpunk aesthetic, vibrant neon reflections, night city atmosphere, rainy reflections, moody atmospheric fog' },
  { label: 'Anime Makoto Shinkai', value: 'Makoto Shinkai anime style, beautiful vibrant sky, volumetric clouds, emotional atmospheric lighting, high anime detail' },
  { label: 'Dark Fantasy Épico', value: 'dark fantasy style, eerie atmosphere, gothic architecture, dramatic chiaroscuro, intricate ornate details' }
];

const LIGHTINGS: PromptOption[] = [
  { label: 'Golden Hour (Luz Dourada)', value: 'golden hour warm lighting, sun flare, long soft shadows' },
  { label: 'Softbox Difusa de Estúdio', value: 'soft diffused studio lighting, multi-point lighting, no harsh shadows' },
  { label: 'Chiaroscuro / Luz Dramática', value: 'dramatic chiaroscuro lighting, deep shadows, high contrast rim light' },
  { label: 'Luz Volumétrica (God Rays)', value: 'volumetric god rays, atmospheric haze, dust motes in light' },
  { label: 'Bioluminescente / Neon', value: 'bioluminescent glow, vibrant purple and cyan neon accents' }
];

const CAMERAS: PromptOption[] = [
  { label: '85mm f/1.4 (Retrato / Bokeh)', value: 'shot on 85mm prime lens f/1.4, smooth creamy bokeh background' },
  { label: '35mm Street Photography', value: 'shot on 35mm lens, natural perspective, documentary depth' },
  { label: 'Grande Angular 16mm (Wide)', value: 'ultra-wide 16mm angle lens, dynamic perspective, epic scale' },
  { label: 'Macro 100mm (Ultra Close-up)', value: 'macro lens extreme close-up, microscopic textures, precise focus' },
  { label: 'Drone Aéreo (Top-Down)', value: 'drone aerial top-down establishing shot, majestic wide angle' }
];

const ENGINES = [
  { id: 'flux', name: 'Flux 1 / Flux 2 Dev', tip: 'Excelente para texto e coerência realista' },
  { id: 'midjourney', name: 'Midjourney v6.1', tip: 'Estética cinematográfica apurada' },
  { id: 'sdxl', name: 'Stable Diffusion XL', tip: 'Controle de nós no ComfyUI' },
  { id: 'video', name: 'Veo 3 / Sora / Kling', tip: 'Movimento de câmera e continuidade de cena' }
];

export function PromptCrafter() {
  const [engine, setEngine] = useState('flux');
  const [subject, setSubject] = useState('um guerreiro cibernético observando a metrópole chuvosa do topo de um arranha-céu');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].value);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTINGS[0].value);
  const [selectedCamera, setSelectedCamera] = useState(CAMERAS[0].value);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [addQualityTags, setAddQualityTags] = useState(true);
  const [copied, setCopied] = useState(false);

  // Assembling Final Prompt
  const { positivePrompt, negativePrompt } = useMemo(() => {
    let p = subject.trim();
    if (selectedStyle) p += `, ${selectedStyle}`;
    if (selectedLighting) p += `, ${selectedLighting}`;
    if (selectedCamera) p += `, ${selectedCamera}`;
    if (addQualityTags) {
      if (engine === 'flux') {
        p += ', masterpiece, highly detailed, photorealistic render, 8k resolution, raw photo';
      } else if (engine === 'midjourney') {
        p += ' --ar ' + aspectRatio + ' --v 6.1 --style raw';
      } else if (engine === 'video') {
        p += ', continuous motion, smooth cinematic camera pan, steady frame, realistic physical dynamics';
      } else {
        p += ', best quality, masterpiece, ultra-detailed, 8k';
      }
    }

    const n = 'blurry, low resolution, bad anatomy, deformed limbs, extra fingers, watermark, signature, oversaturated, amateur, ugly';
    return { positivePrompt: p, negativePrompt: n };
  }, [subject, selectedStyle, selectedLighting, selectedCamera, aspectRatio, addQualityTags, engine]);

  const copyPrompt = () => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(positivePrompt).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Violet Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Refinador & Engenheiro de Prompts Cinematográficos
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              APOLLO LA PLATA ACERVO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Estrutura descrições simples em comandos técnicos de iluminação, lentes, estilo visual e composição para Flux, Midjourney e Veo/Sora.
          </p>
        </div>

        {/* Engine Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-2xl shrink-0 overflow-x-auto">
          {ENGINES.map((eng) => (
            <button
              key={eng.id}
              onClick={() => setEngine(eng.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                engine === eng.id
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {eng.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Form Controls */}
      <div className="space-y-4">
        {/* Ideia Principal (Assunto) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Ideia Central / Assunto da Cena
          </label>
          <textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Descreva o que deseja ver na imagem ou vídeo..."
            className="w-full h-20 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition"
          />
        </div>

        {/* Seletor Triplo: Estilo, Luz e Câmera */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Estilo Visual */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-purple-400" /> Estilo Visual
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {STYLES.map((s, idx) => (
                <option key={idx} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Iluminação */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> Iluminação
            </label>
            <select
              value={selectedLighting}
              onChange={(e) => setSelectedLighting(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {LIGHTINGS.map((l, idx) => (
                <option key={idx} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Lente & Enquadramento */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Camera className="w-3 h-3 text-cyan-400" /> Lente & Ângulo
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {CAMERAS.map((c, idx) => (
                <option key={idx} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Extras & Aspect Ratio */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Proporção:</span>
            {['16:9', '9:16', '1:1', '4:5'].map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  aspectRatio === ar
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addQualityTags}
              onChange={(e) => setAddQualityTags(e.target.checked)}
              className="w-4 h-4 rounded text-purple-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span>Injetar Tags Técnicas de Qualidade & Render</span>
          </label>
        </div>

        {/* Saída do Prompt Refinado */}
        <div className="mt-4 p-4 bg-slate-950/80 border border-purple-500/30 rounded-2xl relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Prompt Técnico Otimizado
            </span>
            <button
              onClick={copyPrompt}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Prompt'}
            </button>
          </div>

          <p className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 select-all">
            {positivePrompt}
          </p>

          {/* Negative Prompt */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Prompt Negativo Recomendado (ComfyUI / SDXL)
            </span>
            <p className="text-[11px] font-mono text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/40 select-all">
              {negativePrompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
