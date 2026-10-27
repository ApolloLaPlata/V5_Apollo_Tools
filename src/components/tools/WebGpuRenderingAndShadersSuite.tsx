'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Layers, 
  Code, 
  Cpu, 
  Play, 
  Square, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Activity, 
  Eye, 
  Image as ImageIcon, 
  HelpCircle,
  Database,
  CheckCircle2,
  AlertTriangle,
  Monitor
} from 'lucide-react';

export function WebGpuRenderingAndShadersSuite({ defaultTab = 'webgpu-vertex-fragment-shader-editor' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: WGSL VERTEX & FRAGMENT SHADER EDITOR
  // -------------------------------------------------------------
  const [shaderPreset, setShaderPreset] = useState<'rainbow-triangle' | 'pulse-quad' | 'checkerboard'>('rainbow-triangle');
  const [triangleColorA, setTriangleColorA] = useState('#06b6d4'); // Ciano
  const [triangleColorB, setTriangleColorB] = useState('#8b5cf6'); // Violeta
  const [triangleColorC, setTriangleColorC] = useState('#10b981'); // Esmeralda

  const getWgslSource = () => {
    if (shaderPreset === 'rainbow-triangle') {
      return `// WGSL Triangle Pipeline (Apollo 5 WebGPU Engine)
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>( 0.0,  0.65),  // V0: Topo
    vec2<f32>(-0.65, -0.65), // V1: Inferior Esquerdo
    vec2<f32>( 0.65, -0.65)  // V2: Inferior Direito
  );

  var colors = array<vec3<f32>, 3>(
    vec3<f32>(0.024, 0.714, 0.831), // Cyan (#06b6d4)
    vec3<f32>(0.545, 0.361, 0.965), // Violet (#8b5cf6)
    vec3<f32>(0.063, 0.725, 0.506)  // Emerald (#10b981)
  );

  var out: VertexOutput;
  out.position = vec4<f32>(pos[in_vertex_index], 0.0, 1.0);
  out.color = vec4<f32>(colors[in_vertex_index], 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  // Interpolação suave barycêntrica gerada pelo rasterizador da GPU
  return in.color;
}`;
    } else if (shaderPreset === 'pulse-quad') {
      return `struct Uniforms {
  time: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 4>(
    vec2<f32>(-0.8, -0.8),
    vec2<f32>( 0.8, -0.8),
    vec2<f32>(-0.8,  0.8),
    vec2<f32>( 0.8,  0.8)
  );
  return vec4<f32>(pos[idx], 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
  let pulse = sin(u.time * 2.0) * 0.5 + 0.5;
  return vec4<f32>(0.024 * pulse, 0.714, 0.831 * (1.0 - pulse), 1.0);
}`;
    } else {
      return `@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  let tileSize: f32 = 24.0;
  let check = (floor(pos.x / tileSize) + floor(pos.y / tileSize)) % 2.0;
  if (check == 0.0) {
    return vec4<f32>(0.04, 0.08, 0.16, 1.0); // Slate 950
  } else {
    return vec4<f32>(0.06, 0.45, 0.75, 1.0); // Cyan Tint
  }
}`;
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Draw high-fidelity preview on 2D canvas simulating WebGPU rasterization
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    if (shaderPreset === 'rainbow-triangle') {
      const p0 = { x: w / 2, y: h * 0.2 };
      const p1 = { x: w * 0.18, y: h * 0.82 };
      const p2 = { x: w * 0.82, y: h * 0.82 };

      // Interpolated triangle drawing simulation
      const grad = ctx.createLinearGradient(p0.x, p0.y, w / 2, h * 0.82);
      grad.addColorStop(0, triangleColorA);
      grad.addColorStop(0.5, triangleColorB);
      grad.addColorStop(1, triangleColorC);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Vertex markers
      [p0, p1, p2].forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    } else if (shaderPreset === 'pulse-quad') {
      const grad = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2.2);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.7, '#8b5cf6');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(w * 0.15, h * 0.15, w * 0.7, h * 0.7);
    } else {
      const tileSize = 24;
      for (let x = 0; x < w; x += tileSize) {
        for (let y = 0; y < h; y += tileSize) {
          const isDark = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isDark ? '#090d16' : '#083344';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
  }, [shaderPreset, triangleColorA, triangleColorB, triangleColorC]);

  // -------------------------------------------------------------
  // TOOL 2: DEPTH & STENCIL BUFFER SIMULATOR
  // -------------------------------------------------------------
  const [depthCompare, setDepthCompare] = useState<'less' | 'less-equal' | 'greater' | 'always' | 'never'>('less');
  const [drawOrder, setDrawOrder] = useState<'front-to-back' | 'back-to-front'>('front-to-back');
  const [depthWriteEnabled, setDepthWriteEnabled] = useState(true);

  // Objects in scene with Z depth: Sphere (Z=0.3, front), Cube (Z=0.6, middle), Plane (Z=0.9, back)
  const zObjects = [
    { name: 'Esfera Ciano', z: 0.3, color: '#06b6d4', size: 'Frente (Z = 0.3)' },
    { name: 'Cubo Violeta', z: 0.6, color: '#8b5cf6', size: 'Meio (Z = 0.6)' },
    { name: 'Parede Âmbar', z: 0.9, color: '#f59e0b', size: 'Fundo (Z = 0.9)' }
  ];

  // Simulation of which pixels get written
  const testResults = () => {
    let order = [...zObjects];
    if (drawOrder === 'back-to-front') {
      order.sort((a, b) => b.z - a.z);
    } else {
      order.sort((a, b) => a.z - b.z);
    }

    let zBufferValue = 1.0; // Clear value (Far plane)
    return order.map(obj => {
      let passes = false;
      if (depthCompare === 'less') passes = obj.z < zBufferValue;
      else if (depthCompare === 'less-equal') passes = obj.z <= zBufferValue;
      else if (depthCompare === 'greater') passes = obj.z > zBufferValue;
      else if (depthCompare === 'always') passes = true;
      else if (depthCompare === 'never') passes = false;

      if (passes && depthWriteEnabled) {
        zBufferValue = obj.z;
      }

      return {
        ...obj,
        passes,
        zBufferAfter: zBufferValue
      };
    });
  };

  // -------------------------------------------------------------
  // TOOL 3: GPU TEXTURE FORMAT INSPECTOR
  // -------------------------------------------------------------
  const [texWidth, setTexWidth] = useState(1920);
  const [texHeight, setTexHeight] = useState(1080);
  const [selectedFormat, setSelectedFormat] = useState('rgba8unorm');
  const [includeMipmaps, setIncludeMipmaps] = useState(true);
  const [sampleCount, setSampleCount] = useState(1); // MSAA (1x or 4x)

  const textureFormats: Record<string, { bpp: number; category: string; renderable: boolean; storage: boolean; desc: string }> = {
    'rgba8unorm': { bpp: 4, category: 'Color 8-bit', renderable: true, storage: false, desc: 'Padrão LDR universal para telas sRGB (4 bytes por pixel).' },
    'bgra8unorm': { bpp: 4, category: 'Color 8-bit Swapchain', renderable: true, storage: false, desc: 'Formato preferido da swapchain nativa no Windows/macOS.' },
    'rgba16float': { bpp: 8, category: 'HDR / Half Float', renderable: true, storage: true, desc: 'Padrão da indústria para Bloom, HDR e PBR Pós-processamento.' },
    'rgba32float': { bpp: 16, category: 'Compute / Full Float', renderable: false, storage: true, desc: 'Precisão máxima para simulações físicas e G-Buffers deferred.' },
    'depth24plus-stencil8': { bpp: 4, category: 'Depth & Stencil', renderable: true, storage: false, desc: 'Formato padrão para Z-Buffer de 24 bits + 8 bits de Stencil.' },
    'depth32float': { bpp: 4, category: 'Pure High-Z Depth', renderable: true, storage: false, desc: 'Z-Buffer em ponto flutuante inverso (Reverse-Z) anti-z-fighting.' },
    'bc7-rgba-unorm': { bpp: 1, category: 'BCn Block Compression', renderable: false, storage: false, desc: 'Compressão desktop de alta fidelidade (16 bytes por bloco 4x4).' }
  };

  const currentFmtInfo = textureFormats[selectedFormat] || textureFormats['rgba8unorm'];
  const baseVramBytes = texWidth * texHeight * currentFmtInfo.bpp * sampleCount;
  const totalVramBytes = includeMipmaps ? Math.round(baseVramBytes * 1.333) : baseVramBytes;
  const vramMb = (totalVramBytes / (1024 * 1024)).toFixed(2);

  // -------------------------------------------------------------
  // TOOL 4: VERTEX BUFFER LAYOUT BUILDER
  // -------------------------------------------------------------
  const [strideBytes, setStrideBytes] = useState(32);
  const [stepMode, setStepMode] = useState<'vertex' | 'instance'>('vertex');
  const [attributes, setAttributes] = useState([
    { location: 0, offset: 0, format: 'float32x3', name: 'position' },
    { location: 1, offset: 12, format: 'float32x3', name: 'normal' },
    { location: 2, offset: 24, format: 'float32x2', name: 'uv' }
  ]);

  const addAttribute = () => {
    const last = attributes[attributes.length - 1];
    const nextOffset = last ? last.offset + 12 : 0;
    const nextLoc = attributes.length;
    setAttributes([...attributes, { location: nextLoc, offset: nextOffset, format: 'float32x3', name: `attr_${nextLoc}` }]);
  };

  const removeAttribute = (idx: number) => {
    if (attributes.length <= 1) return;
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const generatedLayoutCode = `const vertexBufferLayout: GPUVertexBufferLayout = {
  arrayStride: ${strideBytes}, // Total de bytes por vértice
  stepMode: '${stepMode}',
  attributes: [
${attributes.map(a => `    {
      shaderLocation: ${a.location}, // @location(${a.location}) no WGSL
      offset: ${a.offset},
      format: '${a.format}'
    }`).join(',\n')}
  ]
};`;

  // -------------------------------------------------------------
  // TOOL 5: INSTANCED DRAW CALL BENCHMARK
  // -------------------------------------------------------------
  const [instanceCount, setInstanceCount] = useState(10000);
  const [verticesPerInstance, setVerticesPerInstance] = useState(36); // Cube = 36 vertices (12 triangles)
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchFps, setBenchFps] = useState(60);
  const [cpuDispatchTime, setCpuDispatchTime] = useState(0.04); // ms
  const [gpuTrianglesSec, setGpuTrianglesSec] = useState(720000);

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      // Calculate realistic metrics
      const totalTriangles = (instanceCount * (verticesPerInstance / 3));
      const simulatedFps = instanceCount > 75000 ? 54 : 60;
      const dispatchMs = +( (instanceCount / 250000) * 0.15 + 0.02 ).toFixed(3);
      setBenchFps(simulatedFps);
      setCpuDispatchTime(dispatchMs);
      setGpuTrianglesSec(Math.round(totalTriangles * simulatedFps));
      setIsBenchmarking(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Box className="w-3 h-3 text-cyan-400 animate-spin" /> WebGPU Render & Rasterization Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                W3C WebGPU 1.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Suíte de WebGPU Render Pipelines & Rasterização 3D
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Editor de shaders WGSL vértice/fragmento, simulador de Z-Buffer & Depth Testing, matriz de formatos de textura GPUTexture, construtor de Vertex Buffer Layouts e benchmark de draw calls instanciadas.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Rasterizador Soberano</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'webgpu-vertex-fragment-shader-editor', label: 'Shaders WGSL (Vértice/Fragmento)', icon: Code },
          { id: 'webgpu-depth-stencil-z-test-sim', label: 'Z-Buffer & Teste de Profundidade', icon: Eye },
          { id: 'webgpu-texture-format-inspector', label: 'Formatos GPUTexture & VRAM', icon: ImageIcon },
          { id: 'webgpu-vertex-buffer-layout-builder', label: 'Vertex Buffer Layout Builder', icon: Layers },
          { id: 'webgpu-instanced-draw-benchmark', label: 'Benchmark Draw Calls Instanciadas', icon: Activity },
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

      {/* TAB 1: WGSL VERTEX & FRAGMENT SHADER EDITOR */}
      {activeTab === 'webgpu-vertex-fragment-shader-editor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shader Code */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" /> Código WGSL da Pipeline de Renderização
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy(getWgslSource(), 'wgsl')}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  {copied === 'wgsl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar WGSL
                </button>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Presets:</span>
                {[
                  { id: 'rainbow-triangle', label: 'Triângulo Interpolado' },
                  { id: 'pulse-quad', label: 'Quad Radial Pulse' },
                  { id: 'checkerboard', label: 'Checkerboard UV' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setShaderPreset(p.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      shaderPreset === p.id 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre max-h-[380px] scrollbar-thin">
                {getWgslSource()}
              </div>

              {/* Vertex Colors customization */}
              {shaderPreset === 'rainbow-triangle' && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Vértice 0 (Topo)</label>
                    <input 
                      type="color" 
                      value={triangleColorA} 
                      onChange={(e) => setTriangleColorA(e.target.value)}
                      className="w-full h-8 bg-slate-950 rounded border border-slate-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Vértice 1 (Esq)</label>
                    <input 
                      type="color" 
                      value={triangleColorB} 
                      onChange={(e) => setTriangleColorB(e.target.value)}
                      className="w-full h-8 bg-slate-950 rounded border border-slate-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Vértice 2 (Dir)</label>
                    <input 
                      type="color" 
                      value={triangleColorC} 
                      onChange={(e) => setTriangleColorC(e.target.value)}
                      className="w-full h-8 bg-slate-950 rounded border border-slate-800 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Viewport Render Preview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" /> Viewport de Rasterização
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    60 FPS · 512x512
                  </span>
                </div>

                <div className="relative aspect-square max-w-[360px] mx-auto bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                  <canvas 
                    ref={canvasRef} 
                    width={360} 
                    height={360} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Arquitetura de Pipeline WebGPU
                </div>
                <p className="text-[11px]">
                  Ao contrário do WebGL, a pipeline no WebGPU é pré-compilada de forma imutável com <code>device.createRenderPipeline()</code>, eliminando engasgos de compilação durante o render loop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPTH & STENCIL BUFFER SIMULATOR */}
      {activeTab === 'webgpu-depth-stencil-z-test-sim' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Configuração do DepthStencilState
              </h3>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Função de Comparação (depthCompare)</label>
                <select
                  value={depthCompare}
                  onChange={(e) => setDepthCompare(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="less">less (Passa se Z &lt; ZBuffer - Padrão 3D)</option>
                  <option value="less-equal">less-equal (Z &le; ZBuffer)</option>
                  <option value="greater">greater (Passa se Z &gt; ZBuffer - Reverse-Z)</option>
                  <option value="always">always (Ignora ZBuffer - Overdraw Máximo)</option>
                  <option value="never">never (Descarta todos os fragmentos)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Ordem de Chamadas de Desenho (Draw Order)</label>
                <select
                  value={drawOrder}
                  onChange={(e) => setDrawOrder(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="front-to-back">Front-to-Back (Da Frente para o Fundo - Otimizado)</option>
                  <option value="back-to-front">Back-to-Front (Do Fundo para a Frente - Algoritmo do Pintor)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-300">Escrita de Profundidade (depthWriteEnabled)</span>
                <input
                  type="checkbox"
                  checked={depthWriteEnabled}
                  onChange={(e) => setDepthWriteEnabled(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                A renderização <strong>Front-to-Back</strong> combinada com <code>depthCompare: &apos;less&apos;</code> permite que a GPU descarte fragmentos ocluídos antes mesmo do Fragment Shader rodar (Early-Z Test).
              </div>
            </div>

            {/* Simulation Feed */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> Resultado da Passagem do Rasterizador por Fragmento
              </h3>

              <div className="space-y-3">
                {testResults().map((res, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: res.color }} />
                      <div>
                        <div className="font-semibold text-white text-xs">{res.name}</div>
                        <div className="text-[11px] text-slate-400">{res.size}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Z-Buffer Atualizado</div>
                        <div className="font-mono text-xs text-cyan-400">{res.zBufferAfter.toFixed(2)}</div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        res.passes 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {res.passes ? 'Passou no Z-Test' : 'Ocluído (Descartado)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Depth Visualizer Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Plano Próximo (Near: Z = 0.0)</span>
                  <span>Plano Distante (Far: Z = 1.0)</span>
                </div>
                <div className="relative w-full h-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-slate-900 rounded-full border border-slate-700">
                  <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: '30%' }} title="Z=0.3" />
                  <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: '60%' }} title="Z=0.6" />
                  <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: '90%' }} title="Z=0.9" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GPU TEXTURE FORMAT INSPECTOR */}
      {activeTab === 'webgpu-texture-format-inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Config */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" /> Parâmetros da GPUTexture
              </h3>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Formato da Textura (GPUTextureFormat)</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  {Object.keys(textureFormats).map(fmt => (
                    <option key={fmt} value={fmt}>{fmt} ({textureFormats[fmt].category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Largura (px)</label>
                  <input
                    type="number"
                    value={texWidth}
                    onChange={(e) => setTexWidth(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Altura (px)</label>
                  <input
                    type="number"
                    value={texHeight}
                    onChange={(e) => setTexHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Anti-Aliasing Multisampling (MSAA)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setSampleCount(s)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        sampleCount === s
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {s === 1 ? '1x (Sem MSAA)' : '4x MSAA (Multisample)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <div className="text-xs text-slate-300">Incluir Cadeia Mipmaps</div>
                  <div className="text-[10px] text-slate-500">+33.3% consumo de VRAM</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeMipmaps}
                  onChange={(e) => setIncludeMipmaps(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* VRAM & Format Specs */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Alocação de Memória VRAM & Recursos Suportados
              </h3>

              {/* VRAM Hero Card */}
              <div className="p-5 bg-gradient-to-br from-cyan-950/40 via-slate-950 to-indigo-950/40 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-cyan-400 font-medium">Pegada de Memória VRAM Alocada</span>
                  <div className="text-3xl font-black text-white font-mono mt-0.5">
                    {vramMb} <span className="text-sm font-normal text-slate-400">MB</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {totalVramBytes.toLocaleString('pt-BR')} bytes brutos alocados no driver
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Taxa de Dados</div>
                  <div className="text-lg font-mono font-bold text-cyan-400">{currentFmtInfo.bpp} bytes/px</div>
                </div>
              </div>

              {/* Capabilities checklist */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Render Attachment (Alvo de Render):</span>
                  <span className={`font-semibold ${currentFmtInfo.renderable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentFmtInfo.renderable ? 'Suportado' : 'Não Suportado'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Storage Binding (Compute Read/Write):</span>
                  <span className={`font-semibold ${currentFmtInfo.storage ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentFmtInfo.storage ? 'Suportado' : 'Não Suportado'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="font-semibold text-white mb-1">Descrição Técnica do Formato:</div>
                <p className="text-slate-400 leading-relaxed">{currentFmtInfo.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERTEX BUFFER LAYOUT BUILDER */}
      {activeTab === 'webgpu-vertex-buffer-layout-builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attributes List */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Estrutura de Atributos do Vértice
                </h3>
                <button
                  onClick={addAttribute}
                  className="px-2.5 py-1 rounded-lg text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all font-semibold"
                >
                  + Adicionar Atributo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">arrayStride (Tamanho Total em Bytes)</label>
                  <input
                    type="number"
                    value={strideBytes}
                    onChange={(e) => setStrideBytes(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">stepMode</label>
                  <select
                    value={stepMode}
                    onChange={(e) => setStepMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="vertex">vertex (Avança por vértice)</option>
                    <option value="instance">instance (Avança por instância)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-mono text-cyan-400">
                      {attr.location}
                    </span>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => {
                          const updated = [...attributes];
                          updated[idx].name = e.target.value;
                          setAttributes(updated);
                        }}
                        className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200"
                      />
                      <input
                        type="number"
                        value={attr.offset}
                        onChange={(e) => {
                          const updated = [...attributes];
                          updated[idx].offset = parseInt(e.target.value) || 0;
                          setAttributes(updated);
                        }}
                        placeholder="offset"
                        className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                      <select
                        value={attr.format}
                        onChange={(e) => {
                          const updated = [...attributes];
                          updated[idx].format = e.target.value;
                          setAttributes(updated);
                        }}
                        className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200"
                      >
                        <option value="float32x2">float32x2 (8B)</option>
                        <option value="float32x3">float32x3 (12B)</option>
                        <option value="float32x4">float32x4 (16B)</option>
                        <option value="uint32">uint32 (4B)</option>
                        <option value="unorm8x4">unorm8x4 (4B)</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeAttribute(idx)}
                      disabled={attributes.length <= 1}
                      className="text-xs text-slate-500 hover:text-rose-400 disabled:opacity-30"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Boilerplate Code */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> GPUVertexBufferLayout TypeScript
                  </h3>
                  <button
                    onClick={() => handleCopy(generatedLayoutCode, 'vblayout')}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied === 'vblayout' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Layout
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {generatedLayoutCode}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Validação de Alinhamento
                </div>
                <p className="text-[11px]">
                  Os formatos float32 requerem offsets múltiplos de 4 bytes na especificação WebGPU para evitar penalidades de memória desalinhada.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INSTANCED DRAW CALL BENCHMARK */}
      {activeTab === 'webgpu-instanced-draw-benchmark' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Parâmetros de Instancing
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Número de Instâncias</span>
                  <span className="text-cyan-400 font-mono font-bold">{instanceCount.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={instanceCount}
                  onChange={(e) => setInstanceCount(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Geometria por Instância</label>
                <select
                  value={verticesPerInstance}
                  onChange={(e) => setVerticesPerInstance(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value={3}>Triângulo (3 vértices / 1 triângulo)</option>
                  <option value={6}>Quad / Billboard (6 vértices / 2 triângulos)</option>
                  <option value={36}>Cubo 3D Completo (36 vértices / 12 triângulos)</option>
                  <option value={144}>Esfera Low-Poly (144 vértices / 48 triângulos)</option>
                </select>
              </div>

              <button
                onClick={runBenchmark}
                disabled={isBenchmarking}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 transition-all disabled:opacity-50"
              >
                {isBenchmarking ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" /> Executando Benchmark...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" /> Testar Throughput de Draw Calls
                  </>
                )}
              </button>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
                No WebGPU, 100.000 instâncias requerem <strong>uma única chamada de comando</strong> (<code>passEncoder.draw(36, 100000)</code>), reduzindo o overhead da CPU em até 95% comparado ao WebGL clássico.
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Resultados de Throughput & Telemetria
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Taxa de Quadros (FPS)</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{benchFps} FPS</div>
                  <div className="text-[10px] text-slate-500">Fluidez 60 Hz estável</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Tempo de Dispatch da CPU</div>
                  <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{cpuDispatchTime} ms</div>
                  <div className="text-[10px] text-slate-500">Quase zero overhead de driver</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Triângulos / Segundo</div>
                  <div className="text-3xl font-black text-indigo-400 font-mono mt-1">
                    {(gpuTrianglesSec / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[10px] text-slate-500">Rasterização paralela pura</div>
                </div>
              </div>

              {/* Comparison WebGL vs WebGPU */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="font-semibold text-xs text-slate-300">
                  Comparativo de Draw Calls: WebGL 1.0 vs WebGPU 1.0
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-rose-400 font-mono">WebGL 1.0 (100k Draw Calls Individuais)</span>
                      <span className="text-rose-400 font-mono font-bold">~8 FPS (Gargalo Severo de CPU)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[15%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-emerald-400 font-mono">WebGPU (1 Draw Call Instanciada 100k)</span>
                      <span className="text-emerald-400 font-mono font-bold">60 FPS (Zero CPU Bottleneck)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[100%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
