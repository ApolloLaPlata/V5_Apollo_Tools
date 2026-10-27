'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Palette, 
  Code2, 
  FileCode, 
  Fuel, 
  Link2, 
  FileText, 
  Users, 
  MapPin, 
  DollarSign, 
  Sliders, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export type ProductivityTypesTab = 'color-converter' | 'json-to-ts' | 'fuel-trip' | 'slug-cleaner' | 'lorem-markdown';

export function ProductivityAndTypesSuite({ defaultTab = 'color-converter' }: { defaultTab?: ProductivityTypesTab }) {
  const [activeTab, setActiveTab] = useState<ProductivityTypesTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: CONVERSOR AVANÇADO DE CORES (HEX, RGB, HSL, CMYK, HSV)
  // ==========================================
  const [hexColor, setHexColor] = useState<string>('#06b6d4'); // Ciano V5 Apollo

  // Métodos de conversão
  const hexToRgbValues = (hex: string): [number, number, number] => {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return [6, 182, 212];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const [r, g, b] = hexToRgbValues(hexColor);

  // RGB para HSL
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  // RGB para HSV
  const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  };

  // RGB para CMYK
  const rgbToCmyk = (r: number, g: number, b: number): [number, number, number, number] => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    if (k === 1) return [0, 0, 0, 100];
    const c = (1 - rNorm - k) / (1 - k);
    const m = (1 - gNorm - k) / (1 - k);
    const y = (1 - bNorm - k) / (1 - k);
    return [
      Math.round(c * 100),
      Math.round(m * 100),
      Math.round(y * 100),
      Math.round(k * 100)
    ];
  };

  const [h, s, l] = rgbToHsl(r, g, b);
  const [hsvH, hsvS, hsvV] = rgbToHsv(r, g, b);
  const [c, m, y, k] = rgbToCmyk(r, g, b);

  const rgbString = `rgb(${r}, ${g}, ${b})`;
  const hslString = `hsl(${h}, ${s}%, ${l}%)`;
  const hsvString = `hsv(${hsvH}, ${hsvS}%, ${hsvV}%)`;
  const cmykString = `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;

  // ==========================================
  // TAB 2: GERADOR JSON TO TYPESCRIPT
  // ==========================================
  const DEFAULT_JSON = `{
  "id": 1042,
  "nome": "Vinicius Miranda",
  "ativo": true,
  "saldo": 15450.75,
  "tags": ["frontend", "nextjs", "comfyui"],
  "endereco": {
    "cidade": "Goiania",
    "uf": "GO",
    "cep": "74000-000"
  },
  "criadoEm": "2026-10-25T20:00:00Z"
}`;

  const [jsonInput, setJsonInput] = useState<string>(DEFAULT_JSON);
  const [rootInterfaceName, setRootInterfaceName] = useState<string>('ApiResponse');
  const [useTypeAlias, setUseTypeAlias] = useState<boolean>(false);
  const [optionalProps, setOptionalProps] = useState<boolean>(false);
  const [tsOutput, setTsOutput] = useState<string>('');
  const [tsError, setTsError] = useState<string | null>(null);

  const generateTypeScript = (jsonStr: string, rootName: string, asType: boolean, makeOptional: boolean) => {
    try {
      setTsError(null);
      const parsed = JSON.parse(jsonStr);
      const interfaces: { name: string; body: string }[] = [];

      const toPascalCase = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      const getType = (val: any, key: string): string => {
        if (val === null || val === undefined) return 'any';
        if (typeof val === 'string') {
          // Detecta datas ISO
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) return 'string /* Date */';
          return 'string';
        }
        if (typeof val === 'number') return 'number';
        if (typeof val === 'boolean') return 'boolean';
        if (Array.isArray(val)) {
          if (val.length === 0) return 'any[]';
          const innerType = getType(val[0], `${key}Item`);
          return `${innerType}[]`;
        }
        if (typeof val === 'object') {
          const subInterfaceName = toPascalCase(key);
          parseObject(val, subInterfaceName);
          return subInterfaceName;
        }
        return 'any';
      };

      const parseObject = (obj: any, name: string) => {
        const lines: string[] = [];
        const optMark = makeOptional ? '?' : '';

        for (const key of Object.keys(obj)) {
          const val = obj[key];
          const typeStr = getType(val, key);
          lines.push(`  ${key}${optMark}: ${typeStr};`);
        }

        const body = lines.join('\n');
        interfaces.push({ name, body });
      };

      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object') {
          parseObject(parsed[0], rootName);
        } else {
          setTsOutput(`export type ${rootName} = ${typeof parsed[0] || 'any'}[];`);
          return;
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        parseObject(parsed, rootName);
      } else {
        setTsOutput(`export type ${rootName} = ${typeof parsed};`);
        return;
      }

      // Monta saída de interfaces em ordem reversa para subtipos ficarem antes do Root
      const resultLines: string[] = [];
      const reversed = [...interfaces].reverse();

      for (const item of reversed) {
        if (asType) {
          resultLines.push(`export type ${item.name} = {\n${item.body}\n};`);
        } else {
          resultLines.push(`export interface ${item.name} {\n${item.body}\n}`);
        }
      }

      setTsOutput(resultLines.join('\n\n'));
    } catch (err: any) {
      setTsError('JSON inválido: ' + err.message);
    }
  };

  useEffect(() => {
    generateTypeScript(jsonInput, rootInterfaceName, useTypeAlias, optionalProps);
  }, [jsonInput, rootInterfaceName, useTypeAlias, optionalProps]);

  // ==========================================
  // TAB 3: CALCULADORA DE CUSTO DE COMBUSTÍVEL & VIAGEM
  // ==========================================
  const [distanceKm, setDistanceKm] = useState<number>(380);
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(12.5); // km/l
  const [fuelPrice, setFuelPrice] = useState<number>(5.89); // R$/l
  const [tollsCost, setTollsCost] = useState<number>(42.50); // R$
  const [passengersCount, setPassengersCount] = useState<number>(3); // pessoas

  // Cálculos de viagem
  const litersNeeded = fuelEfficiency > 0 ? distanceKm / fuelEfficiency : 0;
  const totalFuelCost = litersNeeded * fuelPrice;
  const grandTotalCost = totalFuelCost + tollsCost;
  const costPerKm = distanceKm > 0 ? grandTotalCost / distanceKm : 0;
  const costPerPassenger = passengersCount > 0 ? grandTotalCost / passengersCount : grandTotalCost;

  // ==========================================
  // TAB 4: SANITIZADOR & GERADOR DE SLUGS DE URL
  // ==========================================
  const [rawSlugText, setRawSlugText] = useState<string>('🚀 Guia Supremo de Workflows ComfyUI & Inteligência Artificial em 2026!');
  const [slugSeparator, setSlugSeparator] = useState<'-' | '_'>('-');
  const [forceLowercase, setForceLowercase] = useState<boolean>(true);
  const [removeStopwords, setRemoveStopwords] = useState<boolean>(false);

  const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre', 'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'e', 'ou']);

  const generateSlug = (text: string, sep: string, lower: boolean, cleanStopwords: boolean): string => {
    // 1. Normalização Unicode para remover acentos
    let clean = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (lower) clean = clean.toLowerCase();

    // 2. Remove pontuações e caracteres especiais mantendo alfanuméricos e espaços
    clean = clean.replace(/[^a-zA-Z0-9\s]/g, ' ');

    // 3. Divide por espaços
    let words = clean.split(/\s+/).filter(Boolean);

    // 4. Remove stopwords se ativado
    if (cleanStopwords) {
      words = words.filter(w => !STOPWORDS.has(w.toLowerCase()));
    }

    return words.join(sep);
  };

  const generatedSlug = generateSlug(rawSlugText, slugSeparator, forceLowercase, removeStopwords);

  // ==========================================
  // TAB 5: GERADOR DE LOREM MARKDOWN ESTRUTURADO
  // ==========================================
  const [docTemplate, setDocTemplate] = useState<'blog' | 'readme' | 'api-docs'>('blog');

  const getTemplateContent = () => {
    if (docTemplate === 'blog') {
      return `# Como a Inteligência Artificial Acelerou o Frontend em 2026

A evolução dos modelos de linguagem e a computação visual soberana transformaram drasticamente a arquitetura de software moderno.

## 1. Arquitetura Client-Side First

Ao processar operações matemáticas diretamente no navegador do usuário, eliminamos custos de nuvem desnecessários:

- **Zero Latência:** Respostas instantâneas a menos de 5ms.
- **Privacidade Soberana:** Dados sensíveis nunca tocam os servidores centrais.
- **Escalabilidade Infinita:** O poder computacional cresce linearmente com os usuários.

### Exemplo de Implementação

\`\`\`typescript
export function calculateContrast(c1: string, c2: string): number {
  const l1 = getLuminance(c1);
  const l2 = getLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
\`\`\`

## 2. Comparativo de Performance

| Métrica | Tradicional (API) | Soberano (Client-Side) |
| :--- | :--- | :--- |
| Latência Média | 450ms | **1ms** |
| Custo de Servidor | Alto (\$ / req) | **\$0.00** |
| Disponibilidade Offline | ❌ Não | **✅ Sim (PWA)** |

> "A melhor API é aquela que você não precisa chamar." — Holding V5 Apollo

---
*Publicado por Equipe V5 Apollo · 2026*`;
    }

    if (docTemplate === 'readme') {
      return `# 🚀 V5 Apollo Tools — Capitania #11

> O Canivete Suíço de Produtividade, Workflows ComfyUI e Testes Técnicos da Holding V5 Apollo.

[![Build Status](https://img.shields.io/badge/Build-100%25%20Green-emerald)](http://localhost:3009)
[![License](https://img.shields.io/badge/License-Proprietary-cyan)](https://v5apollo.com)
[![Port](https://img.shields.io/badge/Port-3009-amber)](http://localhost:3009)

## 📦 Funcionalidades Principais

- **4Devs Total Reverse:** CPF, CNPJ, Cartões Luhn, Inscrição Estadual, SUS e Massa QA.
- **Invertexto Total Reverse:** Manipulação de texto, códigos de barras, QR Code Pix e conversores.
- **Nordy.ai Workflows:** Visualização técnica de grafos ComfyUI e download de JSON de API.
- **V5 AI Gateway:** Playground LLM e despacho de execuções na frota Modal H100.

## 🛠️ Instalação & Execução Local

\`\`\`bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento soberano na porta 3009
npm run dev -- -p 3009
\`\`\`

## 📄 Protocolo de Commits
Sempre realizar commits assinados oficialmente:
\`git -c user.name="Apollo La Plata" -c user.email="v5estudio@hotmail.com" commit -m "feat(...)"\``;
    }

    return `# 📡 V5 Apollo API — Documentação do Endpoint

## \`POST /api/v1/generate\`

Despacha requisições de geração de imagem ou vídeo diretamente para instâncias aceleradas Modal H100.

### Cabeçalhos da Requisição (Headers)

\`\`\`http
Content-Type: application/json
Authorization: Bearer v5_live_key_9981x
\`\`\`

### Corpo da Requisição (Body JSON)

\`\`\`json
{
  "workflow_id": "face-swap-reactor-v2",
  "client_id": "v5-tools-capitania-11",
  "parameters": {
    "steps": 28,
    "cfg": 6.5,
    "denoise": 0.75,
    "sampler": "euler_ancestral"
  }
}
\`\`\`

### Resposta de Sucesso (\`200 OK\`)

\`\`\`json
{
  "status": "completed",
  "job_id": "job_modal_h100_7721",
  "cold_start_ms": 2810,
  "inference_time_ms": 4200,
  "outputs": [
    "https://cdn.v5apollo.com/renders/job_modal_h100_7721.png"
  ]
}
\`\`\``;
  };

  const activeMarkdownContent = getTemplateContent();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header da Suíte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Suíte de Produtividade, Utilidades & Tipagem
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Client-Side · Etapa 26
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Conversor de Cores Universal, JSON para TypeScript, Custo de Viagem & Pedágios, Sanitizador de Slugs e Mockdown.
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('color-converter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'color-converter'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cores Pro</span>
          </button>
          <button
            onClick={() => setActiveTab('json-to-ts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'json-to-ts'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON to TS</span>
          </button>
          <button
            onClick={() => setActiveTab('fuel-trip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'fuel-trip'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Custo de Viagem</span>
          </button>
          <button
            onClick={() => setActiveTab('slug-cleaner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'slug-cleaner'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Slug SEO</span>
          </button>
          <button
            onClick={() => setActiveTab('lorem-markdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'lorem-markdown'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lorem MD</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-6">
        {/* ========================================== */}
        {/* ABA 1: CONVERSOR AVANÇADO DE CORES */}
        {/* ========================================== */}
        {activeTab === 'color-converter' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Seletor & Amostra */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Entrada de Cor
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={hexColor}
                      onChange={(e) => setHexColor(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700"
                    />
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400 block mb-1">Código HEX</label>
                      <input
                        type="text"
                        value={hexColor}
                        onChange={(e) => setHexColor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* Amostra Visual com Efeito Gradiente */}
                  <div 
                    style={{ backgroundColor: hexColor }}
                    className="h-28 rounded-xl border border-slate-700 shadow-inner flex items-end p-3 transition-colors duration-200"
                  >
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white font-mono text-xs">
                      {hexColor.toUpperCase()}
                    </span>
                  </div>

                  {/* Gerador de Gradiente CSS */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 block font-mono">Gradiente Linear CSS:</span>
                    <div 
                      style={{ background: `linear-gradient(135deg, ${hexColor}, #020617)` }}
                      className="h-12 rounded-lg border border-slate-800 flex items-center justify-end px-3"
                    >
                      <button
                        onClick={() => copyToClipboard(`background: linear-gradient(135deg, ${hexColor}, #020617);`, 'grad')}
                        className="px-2 py-1 rounded bg-black/70 hover:bg-black text-[11px] font-mono text-white flex items-center gap-1 border border-white/20"
                      >
                        {copiedKey === 'grad' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copiar Gradiente
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Formatos Convertidos */}
              <div className="lg:col-span-7 space-y-3">
                {/* HEX */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">HEX (Hexadecimal Web)</span>
                    <span className="text-sm font-bold font-mono text-cyan-400 mt-0.5 block">{hexColor.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hexColor.toUpperCase(), 'hex')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'hex' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* RGB */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">RGB (Red, Green, Blue)</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">{rgbString}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(rgbString, 'rgb')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'rgb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* HSL */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">HSL (Hue, Saturation, Lightness)</span>
                    <span className="text-sm font-bold font-mono text-purple-400 mt-0.5 block">{hslString}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hslString, 'hsl')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'hsl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* CMYK */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">CMYK (Impressão Gráfica)</span>
                    <span className="text-sm font-bold font-mono text-amber-400 mt-0.5 block">{cmykString}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cmykString, 'cmyk')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'cmyk' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* HSV */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">HSV / HSB (Hue, Saturation, Value)</span>
                    <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">{hsvString}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hsvString, 'hsv')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'hsv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: GERADOR JSON TO TYPESCRIPT */}
        {/* ========================================== */}
        {activeTab === 'json-to-ts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Painel de Entrada JSON */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Cole seu JSON Bruto
                    </span>
                    <button
                      onClick={() => setJsonInput(DEFAULT_JSON)}
                      className="text-[11px] text-cyan-400 hover:underline font-mono"
                    >
                      Restaurar Exemplo
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Cole aqui seu JSON..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-y"
                  />

                  {/* Configurações de Tipagem */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Nome Raiz</label>
                      <input
                        type="text"
                        value={rootInterfaceName}
                        onChange={(e) => setRootInterfaceName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-cyan-300"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="useType"
                        checked={useTypeAlias}
                        onChange={(e) => setUseTypeAlias(e.target.checked)}
                        className="accent-cyan-400"
                      />
                      <label htmlFor="useType" className="text-slate-300 text-xs cursor-pointer">
                        Usar `type` em vez de `interface`
                      </label>
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="optProps"
                        checked={optionalProps}
                        onChange={(e) => setOptionalProps(e.target.checked)}
                        className="accent-cyan-400"
                      />
                      <label htmlFor="optProps" className="text-slate-300 text-xs cursor-pointer">
                        Campos Opcionais (`?`)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel de Saída TypeScript */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      Interfaces TypeScript Geradas
                    </span>
                    <button
                      onClick={() => copyToClipboard(tsOutput, 'ts')}
                      disabled={!tsOutput || !!tsError}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'ts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar TypeScript
                    </button>
                  </div>

                  {tsError ? (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs">
                      {tsError}
                    </div>
                  ) : (
                    <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[380px] overflow-y-auto">
                      {tsOutput}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: CALCULADORA DE CUSTO DE VIAGEM */}
        {/* ========================================== */}
        {activeTab === 'fuel-trip' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entradas da Viagem */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Dados do Trajeto & Veículo
                  </div>

                  {/* Distância */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Distância Total (Km)</span>
                      <span className="font-mono text-cyan-400">{distanceKm} km</span>
                    </label>
                    <input
                      type="number"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  {/* Consumo */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Consumo Médio do Veículo (Km / Litro)</span>
                      <span className="font-mono text-cyan-400">{fuelEfficiency} km/l</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fuelEfficiency}
                      onChange={(e) => setFuelEfficiency(Number(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  {/* Preço do Combustível */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                      <span>Preço do Litro do Combustível (R$)</span>
                      <span className="font-mono text-cyan-400">R$ {fuelPrice.toFixed(2)}</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(Number(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  {/* Pedágios & Passageiros */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block">Total Pedágios (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        value={tollsCost}
                        onChange={(e) => setTollsCost(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 block">Nº Passageiros (Rateio)</label>
                      <input
                        type="number"
                        min="1"
                        value={passengersCount}
                        onChange={(e) => setPassengersCount(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro da Viagem */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 space-y-5">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Custo Total da Viagem</span>
                    <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
                      R$ {grandTotalCost.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Combustível Estimado</span>
                      <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">
                        {litersNeeded.toFixed(1)} Litros
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        R$ {totalFuelCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Custo por Km Rodado</span>
                      <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                        R$ {costPerKm.toFixed(2)} / km
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Incluindo pedágios
                      </span>
                    </div>
                  </div>

                  {/* Rateio por Pessoa */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-cyan-300">Rateio Justo por Pessoa</div>
                      <div className="text-[11px] text-slate-400">Dividido igualmente entre {passengersCount} passageiros</div>
                    </div>
                    <div className="text-xl font-bold font-mono text-cyan-400">
                      R$ {costPerPassenger.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: SANITIZADOR & GERADOR DE SLUGS DE URL */}
        {/* ========================================== */}
        {activeTab === 'slug-cleaner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Entrada de Título */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Título ou Frase Original
                  </div>

                  <textarea
                    rows={4}
                    value={rawSlugText}
                    onChange={(e) => setRawSlugText(e.target.value)}
                    placeholder="Digite ou cole o título do post ou produto..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />

                  {/* Controles de Formatação */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Separador</label>
                      <select
                        value={slugSeparator}
                        onChange={(e) => setSlugSeparator(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-cyan-300"
                      >
                        <option value="-">Hífen (-)</option>
                        <option value="_">Underscore (_)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="forceLower"
                        checked={forceLowercase}
                        onChange={(e) => setForceLowercase(e.target.checked)}
                        className="accent-cyan-400"
                      />
                      <label htmlFor="forceLower" className="text-slate-300 text-xs cursor-pointer">
                        Forçar Minúsculas
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="cleanStop"
                        checked={removeStopwords}
                        onChange={(e) => setRemoveStopwords(e.target.checked)}
                        className="accent-cyan-400"
                      />
                      <label htmlFor="cleanStop" className="text-slate-300 text-xs cursor-pointer">
                        Remover Stopwords
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado do Slug & URL Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-cyan-400" />
                      Slug Amigável Gerado
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedSlug, 'slug')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      {copiedKey === 'slug' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Slug
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                    {generatedSlug || 'seu-slug-aqui'}
                  </div>

                  {/* Preview de URL Completa */}
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-mono">Exemplo de URL Final no Navegador:</span>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 truncate">
                      https://v5apollo.com/artigo/<strong className="text-cyan-400">{generatedSlug || 'slug'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: GERADOR DE LOREM MARKDOWN ESTRUTURADO */}
        {/* ========================================== */}
        {activeTab === 'lorem-markdown' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Modelo de Documento Markdown:
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setDocTemplate('blog')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        docTemplate === 'blog' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Artigo Técnico
                    </button>
                    <button
                      onClick={() => setDocTemplate('readme')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        docTemplate === 'readme' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      README Repositório
                    </button>
                    <button
                      onClick={() => setDocTemplate('api-docs')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        docTemplate === 'api-docs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Documentação API
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(activeMarkdownContent, 'md')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition self-start sm:self-auto"
                >
                  {copiedKey === 'md' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Markdown Completo
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed">
                {activeMarkdownContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
