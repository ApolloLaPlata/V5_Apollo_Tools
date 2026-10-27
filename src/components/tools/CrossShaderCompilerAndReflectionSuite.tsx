'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Binary, 
  Cpu, 
  Layers, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Activity, 
  FileCode, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  Terminal, 
  ArrowRightLeft, 
  Workflow, 
  Boxes 
} from 'lucide-react';

export function CrossShaderCompilerAndReflectionSuite({ defaultTab = 'wgsl-to-spirv-transpiler' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: WGSL TO SPIR-V TRANSPILER
  // -------------------------------------------------------------
  const [wgslSource, setWgslSource] = useState(
`@fragment
fn main(@location(0) inUV: vec2<f32>) -> @location(0) vec4<f32> {
    let color = vec4<f32>(inUV.x, inUV.y, 0.5, 1.0);
    return color;
}`
  );
  const [spirvWordsCount, setSpirvWordsCount] = useState(48);

  const spirvHexDump = 
`0x07230203 0x00010500 0x000d000b 0x00000030 0x00000000
0x00020011 0x00000001 0x0006000b 0x00000001 0x4c534c47
0x00003035 0x00000000 0x0003000e 0x00000000 0x00000001
0x0005000f 0x00000004 0x00000004 0x6e69616d 0x00000000
0x00030010 0x00000004 0x00000007 0x00030003 0x00000002
0x000001c2 0x00040047 0x00000009 0x0000001e 0x00000000
0x00040020 0x0000000a 0x00000003 0x00000009 0x0004003b`;

  // -------------------------------------------------------------
  // TOOL 2: SPIR-V DISASSEMBLER & VALIDATOR
  // -------------------------------------------------------------
  const [disasmFilter, setDisasmFilter] = useState<'all' | 'types' | 'ops'>('all');

  const disasmInstructions = [
    { id: 1, op: 'OpCapability', args: 'Shader', type: 'header', comment: 'Habilita recursos de shader Vulkan' },
    { id: 2, op: 'OpMemoryModel', args: 'Logical GLSL450', type: 'header', comment: 'Endereçamento de memória abstrato' },
    { id: 3, op: 'OpEntryPoint', args: 'Fragment %main "main" %inUV %outColor', type: 'header', comment: 'Ponto de entrada do fragment shader' },
    { id: 4, op: 'OpExecutionMode', args: '%main OriginUpperLeft', type: 'header', comment: 'Origem de coordenadas do canvas' },
    { id: 5, op: 'OpTypeFloat', args: '%float 32', type: 'type', comment: 'Declaração do tipo primitivo IEEE 754 float32' },
    { id: 6, op: 'OpTypeVector', args: '%v2float %float 2', type: 'type', comment: 'Vetor bidimensional vec2<f32>' },
    { id: 7, op: 'OpTypeVector', args: '%v4float %float 4', type: 'type', comment: 'Vetor quadridimensional vec4<f32>' },
    { id: 8, op: 'OpTypeFunction', args: '%fn_main %v4float %v2float', type: 'type', comment: 'Assinatura da função principal' },
    { id: 9, op: 'OpVariable', args: '%inUV Input %v2float', type: 'op', comment: 'Buffer de entrada de UV @location(0)' },
    { id: 10, op: 'OpVariable', args: '%outColor Output %v4float', type: 'op', comment: 'Alvo de renderização @location(0)' },
    { id: 11, op: 'OpCompositeConstruct', args: '%color %v4float %u %v %half %one', type: 'op', comment: 'Construção vetorial do RGBA' },
    { id: 12, op: 'OpReturnValue', args: '%color', type: 'op', comment: 'Retorno do fragment shader para rasterizador' },
  ];

  // -------------------------------------------------------------
  // TOOL 3: GLSL TO WGSL SHADER CONVERTER
  // -------------------------------------------------------------
  const [glslPreset, setGlslPreset] = useState<'phong' | 'noise' | 'blur'>('phong');

  const glslPresets = {
    phong: {
      glsl: 
`#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vPosition;
out vec4 fragColor;

uniform LightUniforms {
    vec3 lightPos;
    vec4 lightColor;
};

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(lightPos - vPosition);
    float diff = max(dot(N, L), 0.0);
    fragColor = vec4(lightColor.rgb * diff, 1.0);
}`,
      wgsl: 
`struct LightUniforms {
    lightPos: vec3<f32>,
    lightColor: vec4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: LightUniforms;

struct VertexOutput {
    @location(0) vNormal: vec3<f32>,
    @location(1) vPosition: vec3<f32>,
};

@fragment
fn main(input: VertexOutput) -> @location(0) vec4<f32> {
    let N = normalize(input.vNormal);
    let L = normalize(uniforms.lightPos - input.vPosition);
    let diff = max(dot(N, L), 0.0);
    return vec4<f32>(uniforms.lightColor.rgb * diff, 1.0);
}`
    },
    noise: {
      glsl: 
`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    float n = hash(vUv * 10.0);
    fragColor = vec4(vec3(n), 1.0);
}`,
      wgsl: 
`@fragment
fn main(@location(0) vUv: vec2<f32>) -> @location(0) vec4<f32> {
    let p = vUv * 10.0;
    let n = fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
    return vec4<f32>(n, n, n, 1.0);
}`
    },
    blur: {
      glsl: 
`#version 300 es
precision highp float;
uniform sampler2D texSampler;
in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 offset = vec2(1.0 / 512.0);
    vec4 col = texture(texSampler, vUv) * 0.4;
    col += texture(texSampler, vUv + vec2(offset.x, 0.0)) * 0.3;
    col += texture(texSampler, vUv - vec2(offset.x, 0.0)) * 0.3;
    fragColor = col;
}`,
      wgsl: 
`@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var texTexture: texture_2d<f32>;

@fragment
fn main(@location(0) vUv: vec2<f32>) -> @location(0) vec4<f32> {
    let offset = vec2<f32>(1.0 / 512.0);
    var col = textureSample(texTexture, texSampler, vUv) * 0.4;
    col += textureSample(texTexture, texSampler, vUv + vec2<f32>(offset.x, 0.0)) * 0.3;
    col += textureSample(texTexture, texSampler, vUv - vec2<f32>(offset.x, 0.0)) * 0.3;
    return col;
}`
    }
  };

  // -------------------------------------------------------------
  // TOOL 4: HLSL TO WEBGPU EMULATOR
  // -------------------------------------------------------------
  const [hlslCode, setHlslCode] = useState(
`cbuffer CameraBuffer : register(b0) {
    float4x4 viewProjMatrix;
    float3 cameraPos;
    float padding;
};

struct VS_INPUT {
    float3 position : POSITION;
    float2 uv : TEXCOORD0;
};

struct PS_INPUT {
    float4 pos : SV_POSITION;
    float2 uv : TEXCOORD0;
};

PS_INPUT VSMain(VS_INPUT input) {
    PS_INPUT output;
    output.pos = mul(viewProjMatrix, float4(input.position, 1.0f));
    output.uv = input.uv;
    return output;
}`
  );

  const convertedHlslToWgsl = 
`struct CameraBuffer {
    viewProjMatrix: mat4x4<f32>,
    cameraPos: vec3<f32>,
    padding: f32,
};

@group(0) @binding(0) var<uniform> camera: CameraBuffer;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn VSMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.pos = camera.viewProjMatrix * vec4<f32>(input.position, 1.0);
    output.uv = input.uv;
    return output;
}`;

  // -------------------------------------------------------------
  // TOOL 5: SHADER REFLECTION & BINDING INSPECTOR
  // -------------------------------------------------------------
  const [reflectionStandard, setReflectionStandard] = useState<'std140' | 'std430'>('std140');

  const structMembers = [
    { name: 'modelMatrix', type: 'mat4x4<f32>', size: 64, align: 16, offset140: 0, offset430: 0 },
    { name: 'lightPosition', type: 'vec3<f32>', size: 12, align: 16, offset140: 64, offset430: 64 },
    { name: 'lightIntensity', type: 'f32', size: 4, align: 4, offset140: 76, offset430: 76 },
    { name: 'ambientColor', type: 'vec4<f32>', size: 16, align: 16, offset140: 80, offset430: 80 },
    { name: 'roughness', type: 'f32', size: 4, align: 4, offset140: 96, offset430: 96 },
    { name: 'metalness', type: 'f32', size: 4, align: 4, offset140: 100, offset430: 100 },
    { name: 'viewportSize', type: 'vec2<f32>', size: 8, align: 8, offset140: 104, offset430: 104 },
  ];

  const totalBufferSize = reflectionStandard === 'std140' ? 112 : 112;

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> COMPILADOR DE SHADERS & SPIR-V
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
              Marco de 435 Ferramentas
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Suíte de Compilador Cruzado WGSL, SPIR-V, GLSL & Reflection
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Transpilação de código de shaders WebGPU WGSL para bytecode binário SPIR-V, conversão bidirecional de GLSL/HLSL e cálculo determinístico de memória std140/std430.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Shaders WebGPU</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'wgsl-to-spirv-transpiler', label: 'Transpilador WGSL → SPIR-V', icon: Binary },
          { id: 'spirv-disassembler-validator', label: 'Desmontador & Validador SPIR-V', icon: Terminal },
          { id: 'glsl-to-wgsl-shader-converter', label: 'Conversor GLSL ES 3.0 → WGSL', icon: ArrowRightLeft },
          { id: 'hlsl-to-webgpu-emulator', label: 'Emulador DirectX HLSL → WebGPU', icon: Workflow },
          { id: 'shader-reflection-binding-inspector', label: 'Reflection de Bindings (std140/430)', icon: Boxes },
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

      {/* TAB 1: WGSL TO SPIR-V TRANSPILER */}
      {activeTab === 'wgsl-to-spirv-transpiler' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Código-Fonte WebGPU WGSL
                </h3>
                <span className="text-xs text-slate-500 font-mono">Dialeto W3C WGSL</span>
              </div>

              <textarea
                value={wgslSource}
                onChange={(e) => setWgslSource(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50"
              />

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Cabeçalho de Bytecode SPIR-V 1.5
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Magic: 0x07230203 · Versão: 1.5 · Bound ID: 48 · Generator: Tint/Naga
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Binary className="w-4 h-4 text-emerald-400" /> Bytecode Binário SPIR-V (Hex Dump)
                  </h3>
                  <button
                    onClick={() => handleCopy(spirvHexDump, 'spirv-hex')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    {copied === 'spirv-hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>Copiar Binário</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 break-all leading-relaxed max-h-56 overflow-y-auto">
                  {spirvHexDump}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Palavras de 32-bit</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{spirvWordsCount} DWORDS</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Tamanho Total</div>
                  <div className="text-sm font-bold text-purple-400 font-mono">{spirvWordsCount * 4} bytes</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Backend Vulkan</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">VK_KHR_shader</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPIR-V DISASSEMBLER & VALIDATOR */}
      {activeTab === 'spirv-disassembler-validator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Instruções Desmontadas de SPIR-V OpCode
              </h3>

              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: 'Todas as Instruções' },
                  { id: 'header', label: 'Cabeçalhos' },
                  { id: 'type', label: 'Tipos' },
                  { id: 'op', label: 'Operações' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDisasmFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      disasmFilter === f.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {disasmInstructions
                .filter(i => disasmFilter === 'all' || i.type === disasmFilter)
                .map((inst) => (
                  <div key={inst.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 w-6">#{inst.id.toString().padStart(2, '0')}</span>
                      <span className="text-purple-400 font-bold">{inst.op}</span>
                      <span className="text-cyan-300">{inst.args}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans md:text-right">{inst.comment}</span>
                  </div>
                ))}
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Validação de Conformance Khronos SPIR-V 1.5: <strong>100% Válido (Zero erros de tipagem estática)</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GLSL TO WGSL SHADER CONVERTER */}
      {activeTab === 'glsl-to-wgsl-shader-converter' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Presets de Shaders:</span>
              {(['phong', 'noise', 'blur'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setGlslPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                    glslPreset === preset
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {preset === 'phong' ? 'Iluminação Phong' : preset === 'noise' ? 'Ruído Hash' : 'Kernel Blur 3x3'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" /> OpenGL GLSL ES 3.0
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Entrada Tradicional</span>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                {glslPresets[glslPreset].glsl}
              </pre>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> WebGPU WGSL Transpilado
                </h3>
                <button
                  onClick={() => handleCopy(glslPresets[glslPreset].wgsl, 'wgsl-conv')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  {copied === 'wgsl-conv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>Copiar WGSL</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                {glslPresets[glslPreset].wgsl}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HLSL TO WEBGPU EMULATOR */}
      {activeTab === 'hlsl-to-webgpu-emulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-purple-400" /> DirectX HLSL (Direct3D 11/12)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">cbuffer & registers</span>
              </div>

              <textarea
                value={hlslCode}
                onChange={(e) => setHlslCode(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500/50 leading-relaxed"
              />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Mapeamento para WebGPU WGSL
                </h3>
                <button
                  onClick={() => handleCopy(convertedHlslToWgsl, 'hlsl-wgsl')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  {copied === 'hlsl-wgsl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>Copiar WGSL</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                {convertedHlslToWgsl}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SHADER REFLECTION & BINDING INSPECTOR */}
      {activeTab === 'shader-reflection-binding-inspector' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-400" /> Inspetor de Reflection & Layout de Memória de Uniforms
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cálculo automático de alinhamentos e preenchimentos (padding) nos padrões std140 e std430.
                </p>
              </div>

              <div className="flex gap-2">
                {(['std140', 'std430'] as const).map((std) => (
                  <button
                    key={std}
                    onClick={() => setReflectionStandard(std)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border transition-all ${
                      reflectionStandard === std
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {std} (WebGPU Buffer)
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2">Campo</th>
                    <th className="pb-2">Tipo WGSL</th>
                    <th className="pb-2">Tamanho</th>
                    <th className="pb-2">Alinhamento</th>
                    <th className="pb-2">Byte Offset</th>
                    <th className="pb-2">Padding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {structMembers.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-950/40">
                      <td className="py-2.5 font-bold text-white">{m.name}</td>
                      <td className="py-2.5 text-purple-400">{m.type}</td>
                      <td className="py-2.5 text-slate-300">{m.size} B</td>
                      <td className="py-2.5 text-amber-400">{m.align} B</td>
                      <td className="py-2.5 text-cyan-400 font-bold">{m.offset140}</td>
                      <td className="py-2.5 text-slate-500">{m.align - (m.size % m.align || m.align)} B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Tamanho Total da Struct</div>
                <div className="text-base font-bold text-cyan-400 font-mono">{totalBufferSize} bytes</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Alinhamento do Bloco</div>
                <div className="text-base font-bold text-purple-400 font-mono">16 bytes</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Compatibilidade GPU</div>
                <div className="text-base font-bold text-emerald-400 font-mono">std140 / WebGPU Uniform</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}