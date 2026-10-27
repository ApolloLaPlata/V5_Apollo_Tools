'use client';

import React, { useState } from 'react';
import { 
  Sun, 
  Box, 
  Layers, 
  Activity, 
  Sliders, 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  Eye, 
  CheckCircle2, 
  Workflow, 
  Focus,
  Maximize2
} from 'lucide-react';

export function WebGpuRayTracingAndBvhSuite({ defaultTab = 'bvh-tree-builder-visualizer' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: BVH TREE BUILDER & VISUALIZER
  // -------------------------------------------------------------
  const [bvhTrianglesCount, setBvhTrianglesCount] = useState<number>(24);
  const bvhDepth = Math.ceil(Math.log2(bvhTrianglesCount));
  const bvhNodesCount = bvhTrianglesCount * 2 - 1;

  // -------------------------------------------------------------
  // TOOL 2: MÖLLER-TRUMBORE RAY-TRIANGLE INTERSECTION
  // -------------------------------------------------------------
  const [rayOriginX, setRayOriginX] = useState(0.0);
  const [rayOriginY, setRayOriginY] = useState(0.0);
  const [rayOriginZ, setRayOriginZ] = useState(-5.0);

  const [rayDirX, setRayDirX] = useState(0.0);
  const [rayDirY, setRayDirY] = useState(0.0);
  const [rayDirZ, setRayDirZ] = useState(1.0);

  // Triangle vertices: V0(-1, -1, 0), V1(1, -1, 0), V2(0, 1, 0)
  const v0 = [-1.0, -1.0, 0.0];
  const v1 = [1.0, -1.0, 0.0];
  const v2 = [0.0, 1.0, 0.0];

  // Möller-Trumbore Calculation
  const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
  const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

  // h = rayDir cross edge2
  const h = [
    rayDirY * edge2[2] - rayDirZ * edge2[1],
    rayDirZ * edge2[0] - rayDirX * edge2[2],
    rayDirX * edge2[1] - rayDirY * edge2[0]
  ];

  // a = edge1 dot h
  const a = edge1[0] * h[0] + edge1[1] * h[1] + edge1[2] * h[2];
  const isParallel = Math.abs(a) < 0.00001;

  const f = isParallel ? 0 : 1.0 / a;
  const s = [rayOriginX - v0[0], rayOriginY - v0[1], rayOriginZ - v0[2]];
  const u = isParallel ? 0 : f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]);

  // q = s cross edge1
  const q = [
    s[1] * edge1[2] - s[2] * edge1[1],
    s[2] * edge1[0] - s[0] * edge1[2],
    s[0] * edge1[1] - s[1] * edge1[0]
  ];
  const v = isParallel ? 0 : f * (rayDirX * q[0] + rayDirY * q[1] + rayDirZ * q[2]);
  const t = isParallel ? 0 : f * (edge2[0] * q[0] + edge2[1] * q[1] + edge2[2] * q[2]);

  const hasIntersection = !isParallel && u >= 0.0 && u <= 1.0 && v >= 0.0 && (u + v) <= 1.0 && t > 0.0;

  const mollerWgslSnippet = `// WGSL Möller-Trumbore Ray-Triangle Test
fn intersect_triangle(ray_orig: vec3<f32>, ray_dir: vec3<f32>, v0: vec3<f32>, v1: vec3<f32>, v2: vec3<f32>, hit: ptr<function, HitInfo>) -> bool {
  let e1 = v1 - v0;
  let e2 = v2 - v0;
  let h = cross(ray_dir, e2);
  let a = dot(e1, h);
  if (abs(a) < 1e-6) { return false; } // Raio paralelo

  let f = 1.0 / a;
  let s = ray_orig - v0;
  let u = f * dot(s, h);
  if (u < 0.0 || u > 1.0) { return false; }

  let q = cross(s, e1);
  let v = f * dot(ray_dir, q);
  if (v < 0.0 || (u + v) > 1.0) { return false; }

  let t = f * dot(e2, q);
  if (t > 1e-4 && t < (*hit).dist) {
    (*hit).dist = t;
    (*hit).uv = vec2<f32>(u, v);
    return true;
  }
  return false;
}`;

  // -------------------------------------------------------------
  // TOOL 3: MONTE CARLO PATH TRACER SIMULATOR
  // -------------------------------------------------------------
  const [bounces, setBounces] = useState<number>(3);
  const [samplesPerPixel, setSamplesPerPixel] = useState<number>(64);
  const [indirectIntensity, setIndirectIntensity] = useState<number>(1.0);

  const estimatedRayCount = 512 * 512 * samplesPerPixel * bounces;

  // -------------------------------------------------------------
  // TOOL 4: PBR GGX MICROFACET BUILDER
  // -------------------------------------------------------------
  const [roughness, setRoughness] = useState<number>(0.35);
  const [metalness, setMetalness] = useState<number>(0.8);
  const [albedoHex, setAlbedoHex] = useState<string>('#06b6d4'); // Ciano metálico

  // GGX Normal Distribution D(h) at normal angle
  const alpha = roughness * roughness;
  const alpha2 = alpha * alpha;
  const normalD = +(1.0 / (Math.PI * Math.max(0.0001, alpha2))).toFixed(3);

  // Fresnel-Schlick F0 (Dielectric 0.04 vs Metallic Albedo)
  const f0Dielectric = 0.04;
  const f0Effective = +(f0Dielectric * (1 - metalness) + 0.95 * metalness).toFixed(3);

  // -------------------------------------------------------------
  // TOOL 5: SPATIAL BILATERAL DENOISER (SVGF)
  // -------------------------------------------------------------
  const [denoiseRadius, setDenoiseRadius] = useState<number>(5);
  const [sigmaColor, setSigmaColor] = useState<number>(0.25);
  const [sigmaDepth, setSigmaDepth] = useState<number>(0.08);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Sun className="w-3 h-3 text-cyan-400 animate-spin" /> Hardware-Accelerated Path Tracing
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                WebGPU Ray Tracing 1.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Suíte de Ray Tracing em Tempo Real, BVH & PBR Shaders
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Construtor de árvores BVH com aceleração AABB/SAH, simulador de interseção Möller-Trumbore em WGSL, path tracer Monte Carlo com múltiplos rebatimentos, modelo microfaceta PBR GGX e denoiser bilateral SVGF.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Iluminação Global</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'bvh-tree-builder-visualizer', label: 'Árvore BVH (AABB & SAH)', icon: Box },
          { id: 'moller-trumbore-ray-intersection', label: 'Möller-Trumbore Ray-Triangle', icon: Focus },
          { id: 'monte-carlo-path-tracer', label: 'Monte Carlo Path Tracer', icon: Sun },
          { id: 'pbr-ggx-microfacet-builder', label: 'PBR GGX Microfacet (BRDF)', icon: Layers },
          { id: 'spatial-bilateral-denoiser', label: 'Denoiser Bilateral (SVGF)', icon: Maximize2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BVH TREE BUILDER & VISUALIZER */}
      {activeTab === 'bvh-tree-builder-visualizer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" /> Estrutura da Geometria da Cena
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total de Triângulos na Cena</span>
                  <span className="font-mono text-cyan-400 font-bold">{bvhTrianglesCount} Triângulos</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="128"
                  step="4"
                  value={bvhTrianglesCount}
                  onChange={(e) => setBvhTrianglesCount(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Profundidade da Árvore:</span>
                  <span className="font-mono text-white font-bold">{bvhDepth} níveis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total de Nós AABB:</span>
                  <span className="font-mono text-cyan-400 font-bold">{bvhNodesCount} nós</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heurística de Divisão:</span>
                  <span className="font-mono text-emerald-400">SAH (Surface Area)</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                A aceleração BVH reduz os testes de interseção de <strong>{bvhTrianglesCount} testes lineares</strong> para apenas <strong>{bvhDepth * 2} testes em caixas envolventes</strong>.
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" /> Hierarquia de Caixas AABB (Axis-Aligned Bounding Boxes)
              </h3>

              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                <div className="text-cyan-400 font-bold">&bull; Nó Raiz AABB [Level 0] (Min: [-5, -5, -5], Max: [5, 5, 5])</div>
                <div className="pl-4 text-indigo-400">&boxur; Sub-árvore Esquerda AABB [Level 1] ({Math.floor(bvhTrianglesCount/2)} triângulos)</div>
                <div className="pl-8 text-slate-400">&boxur; Folha Esquerda ({Math.floor(bvhTrianglesCount/4)} triângulos primitivos)</div>
                <div className="pl-8 text-slate-400">&boxur; Folha Direita ({Math.floor(bvhTrianglesCount/4)} triângulos primitivos)</div>
                <div className="pl-4 text-indigo-400">&boxur; Sub-árvore Direita AABB [Level 1] ({Math.ceil(bvhTrianglesCount/2)} triângulos)</div>
                <div className="pl-8 text-slate-400">&boxur; Folha Esquerda ({Math.ceil(bvhTrianglesCount/4)} triângulos primitivos)</div>
                <div className="pl-8 text-slate-400">&boxur; Folha Direita ({Math.ceil(bvhTrianglesCount/4)} triângulos primitivos)</div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                No WebGPU, o array linear de nós BVH é compactado e transmitido via <code>StorageBuffer</code>, permitindo que os compute shaders naveguem pela árvore sem recursão (usando pilha local na GPU).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MÖLLER-TRUMBORE RAY-TRIANGLE INTERSECTION */}
      {activeTab === 'moller-trumbore-ray-intersection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Focus className="w-4 h-4 text-cyan-400" /> Origem e Direção do Raio
              </h3>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400">Origem do Raio (Ray Origin):</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Origem X</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rayOriginX}
                      onChange={(e) => setRayOriginX(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Origem Y</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rayOriginY}
                      onChange={(e) => setRayOriginY(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Origem Z</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rayOriginZ}
                      onChange={(e) => setRayOriginZ(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                hasIntersection 
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              }`}>
                <div>
                  <div className="font-bold text-sm">
                    {hasIntersection ? 'HIT: Raio Intersectou o Triângulo!' : 'MISS: Raio Não Intersectou'}
                  </div>
                  <div className="text-xs opacity-80">
                    {hasIntersection ? `Distância t = ${t.toFixed(3)} | Baricêntricas u = ${u.toFixed(3)}, v = ${v.toFixed(3)}` : 'Nenhum ponto de impacto registrado'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                O teste Möller-Trumbore não exige a equação do plano do triângulo, economizando memória de GPU e 4 operações de multiplicação por teste de raio.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" /> Shader WGSL Möller-Trumbore
                  </h3>
                  <button
                    onClick={() => handleCopy(mollerWgslSnippet, 'moller')}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied === 'moller' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar WGSL
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre max-h-[300px] scrollbar-thin">
                  {mollerWgslSnippet}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                As coordenadas baricêntricas resultantes <code>(u, v)</code> permitem interpolar texturas UV e vetores normais da malha sem leituras adicionais.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTE CARLO PATH TRACER */}
      {activeTab === 'monte-carlo-path-tracer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Amostragem de Luz Indireta
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rebatimentos Máximos (Bounces)</span>
                  <span className="font-mono text-cyan-400 font-bold">{bounces} Rebatimentos</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={bounces}
                  onChange={(e) => setBounces(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Amostras por Pixel (SPP)</span>
                  <span className="font-mono text-indigo-400 font-bold">{samplesPerPixel} SPP</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="256"
                  step="4"
                  value={samplesPerPixel}
                  onChange={(e) => setSamplesPerPixel(parseInt(e.target.value) || 0)}
                  className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Volume de Raios Estocásticos Disparados na GPU
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-xs text-slate-400">Raios Totais Traçados (Resolução 512x512)</div>
                <div className="text-3xl font-black text-cyan-400 font-mono">
                  {(estimatedRayCount / 1000000).toFixed(1)}M Raios
                </div>
                <div className="text-[11px] text-slate-500">
                  {samplesPerPixel} amostras &times; {bounces} rebatimentos &times; 262.144 pixels
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Color Bleeding:</span>
                  <span className="font-semibold text-emerald-400">Ativado (Difuso Indireto)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Amostragem Hemisférica:</span>
                  <span className="font-semibold text-cyan-400">Cosine-Weighted Cos(theta)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PBR GGX MICROFACET BUILDER */}
      {activeTab === 'pbr-ggx-microfacet-builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Parâmetros do Material Físico (BRDF)
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rugosidade da Superfície (Roughness)</span>
                  <span className="font-mono text-cyan-400 font-bold">{roughness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="1.0"
                  step="0.02"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value) || 0)}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Metalicidade (Metalness)</span>
                  <span className="font-mono text-indigo-400 font-bold">{metalness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Cor do Albedo Base</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={albedoHex}
                    onChange={(e) => setAlbedoHex(e.target.value)}
                    className="w-10 h-8 bg-slate-950 rounded border border-slate-800 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-300">{albedoHex}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Equações de Cook-Torrance Avaliadas
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-slate-400">Distribuição Normal D(h) GGX:</div>
                    <div className="text-[10px] text-slate-500">Concentração de microfacetas alinhadas</div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold text-sm">{normalD}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-slate-400">Refletância de Fresnel F0:</div>
                    <div className="text-[10px] text-slate-500">Reflexão em ângulo normal de incidência</div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-sm">{f0Effective}</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                O modelo GGX simula reflexões especulares suaves com caudas longas de brilho, correspondendo ao comportamento de metais e plásticos reais na renderização física moderna.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SPATIAL BILATERAL DENOISER (SVGF) */}
      {activeTab === 'spatial-bilateral-denoiser' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Parâmetros do Filtro Bilateral SVGF
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Raio do Kernel Espacial</span>
                  <span className="font-mono text-cyan-400 font-bold">{denoiseRadius} px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="11"
                  step="2"
                  value={denoiseRadius}
                  onChange={(e) => setDenoiseRadius(parseInt(e.target.value) || 0)}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Limiar de Profundidade (Sigma Z)</span>
                  <span className="font-mono text-indigo-400 font-bold">{sigmaDepth}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.30"
                  step="0.01"
                  value={sigmaDepth}
                  onChange={(e) => setSigmaDepth(parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Preservação de Bordas Geométricas
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-white">Guia de Filtragem Multimodal:</div>
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>&bull; <strong>Peso de Cor (Color Distance):</strong> Suaviza variações estocásticas de radiação.</div>
                  <div>&bull; <strong>Peso de Normal (Normal Angle):</strong> Bloqueia vazamento de luz através de quinas 3D.</div>
                  <div>&bull; <strong>Peso de Profundidade (Depth Delta):</strong> Impede desfoque entre silhuetas e o fundo da cena.</div>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                O filtro bilateral permite que cenas renderizadas com apenas 4 amostras por pixel (4 SPP) apresentem qualidade visual equivalente a 1024 SPP em tempo real a 60 FPS.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
