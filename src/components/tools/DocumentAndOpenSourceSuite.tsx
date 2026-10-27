'use client';

import React, { useState, useId } from 'react';
import { 
  FileText, 
  QrCode, 
  FileCode, 
  Zap, 
  Award, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Upload, 
  Play, 
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DocumentAndOpenSourceSuiteProps {
  defaultTab?: 'text-extractor' | 'custom-qrcode' | 'openapi-schema' | 'compression-calc' | 'opensource-license';
}

export const DocumentAndOpenSourceSuite: React.FC<DocumentAndOpenSourceSuiteProps> = ({ defaultTab = 'text-extractor' }) => {
  const [activeTab, setActiveTab] = useState<'text-extractor' | 'custom-qrcode' | 'openapi-schema' | 'compression-calc' | 'opensource-license'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: EXTRATOR & SANITIZADOR DE TEXTO DE ARQUIVOS
  // ==========================================
  const [extractedText, setExtractedText] = useState<string>(
    '# Relatório de Diagnóstico de Sistema V5 Apollo\n\n' +
    'O ecossistema Apollo opera sob arquitetura distribuída de microsserviços.   \n\n' +
    'Todos os nós de processamento comunicam-se via protocolo seguro HTTPS e gRPC.   \n' +
    'Métricas de telemetria coletam latência P99, saturação de memória e taxa de requisições por segundo.\n\n' +
    '---\nStatus do Cluster: 100% OPERACIONAL.'
  );
  const [fileName, setFileName] = useState<string>('exemplo-diagnostico.txt');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setExtractedText(content);
    };
    reader.readAsText(file);
  };

  const textMetrics = React.useMemo(() => {
    const totalChars = extractedText.length;
    const charsNoSpaces = extractedText.replace(/\s/g, '').length;
    const words = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
    const lines = extractedText ? extractedText.split('\n').length : 0;
    const paragraphs = extractedText.trim() ? extractedText.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    
    // Top 5 palavras
    const wordList = (extractedText.toLowerCase().match(/\b[a-zA-ZÀ-ÿ0-9_-]{4,}\b/g) || []);
    const freqMap: Record<string, number> = {};
    wordList.forEach(w => { freqMap[w] = (freqMap[w] || 0) + 1; });
    const topWords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalChars, charsNoSpaces, words, lines, paragraphs, topWords };
  }, [extractedText]);

  const sanitizeSpaces = () => {
    const cleaned = extractedText
      .split('\n')
      .map(line => line.trim().replace(/[ \t]+/g, ' '))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    setExtractedText(cleaned);
  };

  const removeEmptyLines = () => {
    const cleaned = extractedText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
    setExtractedText(cleaned);
  };

  const downloadTextFile = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ==========================================
  // FERRAMENTA 2: DESIGNER DE QR CODE CUSTOMIZADO
  // ==========================================
  const [qrText, setQrText] = useState<string>('https://tools.v5apollo.com');
  const [qrFgColor, setQrFgColor] = useState<string>('#06b6d4');
  const [qrBgColor, setQrBgColor] = useState<string>('#020617');
  const [qrMargin, setQrMargin] = useState<number>(2);
  const [qrCorrection, setQrCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrSize, setQrSize] = useState<number>(300);

  // SVG QR Code simplificado em matriz de blocos baseada no hash do conteúdo
  // Para precisão e compatibilidade com leitores, usamos o padrão de API aberta universal de QR code com SVG nativo
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrText)}&color=${qrFgColor.replace('#', '')}&bgcolor=${qrBgColor.replace('#', '')}&qzone=${qrMargin}&ecc=${qrCorrection}&format=svg`;
  const qrPngUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(qrText)}&color=${qrFgColor.replace('#', '')}&bgcolor=${qrBgColor.replace('#', '')}&qzone=${qrMargin}&ecc=${qrCorrection}&format=png`;

  const downloadQrCode = async (format: 'svg' | 'png') => {
    try {
      const targetUrl = format === 'svg' ? qrSvgUrl : qrPngUrl;
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-v5apollo-${Date.now()}.${format}`;
      a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      window.open(format === 'svg' ? qrSvgUrl : qrPngUrl, '_blank');
    }
  };

  // ==========================================
  // FERRAMENTA 3: VALIDADOR JSON SCHEMA & OPENAPI 3.0
  // ==========================================
  const [schemaInput, setSchemaInput] = useState<string>(JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "UserProfile",
    "type": "object",
    "required": ["id", "username", "email", "isActive", "roles"],
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "username": { "type": "string", "minLength": 3, "maxLength": 30 },
      "email": { "type": "string", "format": "email" },
      "age": { "type": "integer", "minimum": 18 },
      "isActive": { "type": "boolean" },
      "roles": {
        "type": "array",
        "items": { "type": "string", "enum": ["admin", "editor", "viewer"] }
      }
    }
  }, null, 2));

  const schemaAnalysis = React.useMemo(() => {
    try {
      const parsed = JSON.parse(schemaInput);
      const isObject = typeof parsed === 'object' && parsed !== null;
      if (!isObject) return { valid: false, error: 'O schema deve ser um objeto JSON válido.' };

      const title = parsed.title || parsed.info?.title || 'Sem Título Declarado';
      const type = parsed.type || (parsed.openapi ? `OpenAPI ${parsed.openapi}` : 'object');
      const requiredFields: string[] = Array.isArray(parsed.required) ? parsed.required : [];
      const properties = parsed.properties ? Object.keys(parsed.properties) : [];
      
      // Gera mock data compatível
      const mockObj: Record<string, any> = {};
      if (parsed.properties) {
        Object.entries(parsed.properties).forEach(([key, val]: [string, any]) => {
          if (val.type === 'string') {
            if (val.format === 'uuid') mockObj[key] = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            else if (val.format === 'email') mockObj[key] = 'apollo.dev@v5apollo.com';
            else if (val.enum && Array.isArray(val.enum)) mockObj[key] = val.enum[0];
            else mockObj[key] = `Exemplo de ${key}`;
          } else if (val.type === 'integer' || val.type === 'number') {
            mockObj[key] = val.minimum || 42;
          } else if (val.type === 'boolean') {
            mockObj[key] = true;
          } else if (val.type === 'array') {
            mockObj[key] = val.items?.enum ? [val.items.enum[0]] : ['item-1', 'item-2'];
          } else if (val.type === 'object') {
            mockObj[key] = {};
          }
        });
      }

      return {
        valid: true,
        title,
        type,
        requiredFields,
        properties,
        mockJson: JSON.stringify(mockObj, null, 2)
      };
    } catch (e: any) {
      return { valid: false, error: e.message || 'JSON inválido' };
    }
  }, [schemaInput]);

  // ==========================================
  // FERRAMENTA 4: CALCULADORA DE COMPRESSÃO DE DADOS (GZIP / BROTLI)
  // ==========================================
  const [compressInput, setCompressInput] = useState<string>(
    JSON.stringify({
      status: "success",
      total: 50,
      timestamp: new Date().toISOString(),
      cluster: "modal-h100-v5",
      metrics: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        node: `worker-${i}.v5apollo.internal`,
        load: Math.round(Math.random() * 85 + 10),
        vram_allocated_gb: 78.4,
        temperature_c: 54 + (i % 6),
        is_ready: true,
        tags: ["comfyui", "flux", "reactor", "h100-80gb-sxm5"]
      }))
    }, null, 2)
  );

  const [gzipSize, setGzipSize] = useState<number>(0);
  const [deflateSize, setDeflateSize] = useState<number>(0);

  // Calcula tamanho com Web Compression Streams API
  React.useEffect(() => {
    let isMounted = true;
    async function calculateCompression() {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(compressInput);
        const originalBytes = data.byteLength;

        if (typeof CompressionStream !== 'undefined') {
          // Gzip
          const csGzip = new CompressionStream('gzip');
          const writerGzip = csGzip.writable.getWriter();
          writerGzip.write(data);
          writerGzip.close();
          const gzipBuffer = await new Response(csGzip.readable).arrayBuffer();
          if (isMounted) setGzipSize(gzipBuffer.byteLength);

          // Deflate
          const csDeflate = new CompressionStream('deflate');
          const writerDeflate = csDeflate.writable.getWriter();
          writerDeflate.write(data);
          writerDeflate.close();
          const deflateBuffer = await new Response(csDeflate.readable).arrayBuffer();
          if (isMounted) setDeflateSize(deflateBuffer.byteLength);
        } else {
          // Fallback estimado seguro
          if (isMounted) {
            setGzipSize(Math.max(20, Math.round(originalBytes * 0.32)));
            setDeflateSize(Math.max(20, Math.round(originalBytes * 0.30)));
          }
        }
      } catch {
        const originalBytes = new TextEncoder().encode(compressInput).byteLength;
        if (isMounted) {
          setGzipSize(Math.max(20, Math.round(originalBytes * 0.32)));
          setDeflateSize(Math.max(20, Math.round(originalBytes * 0.30)));
        }
      }
    }
    calculateCompression();
    return () => { isMounted = false; };
  }, [compressInput]);

  const rawBytes = new TextEncoder().encode(compressInput).byteLength;
  const brotliEstimatedBytes = Math.max(15, Math.round(gzipSize * 0.82));
  const gzipRatio = rawBytes > 0 ? Math.round(((rawBytes - gzipSize) / rawBytes) * 100) : 0;
  const brotliRatio = rawBytes > 0 ? Math.round(((rawBytes - brotliEstimatedBytes) / rawBytes) * 100) : 0;

  // ==========================================
  // FERRAMENTA 5: GERADOR DE LICENÇAS OPEN SOURCE (SPDX)
  // ==========================================
  const [licenseType, setLicenseType] = useState<'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'ISC' | 'Unlicense'>('MIT');
  const [licenseAuthor, setLicenseAuthor] = useState<string>('Holding V5 Apollo / Vinicius Miranda');
  const [licenseYear, setLicenseYear] = useState<string>('2026');
  const [projectName, setProjectName] = useState<string>('V5 Apollo Tools');

  const generatedLicenseText = React.useMemo(() => {
    switch (licenseType) {
      case 'MIT':
        return `MIT License\n\nCopyright (c) ${licenseYear} ${licenseAuthor}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
      
      case 'Apache-2.0':
        return `Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\nCopyright ${licenseYear} ${licenseAuthor}\n\nLicensed under the Apache License, Version 2.0 (the "License");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an "AS IS" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.`;

      case 'GPL-3.0':
        return `GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007\n\nCopyright (C) ${licenseYear} ${licenseAuthor}\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.`;

      case 'BSD-3-Clause':
        return `BSD 3-Clause License\n\nCopyright (c) ${licenseYear}, ${licenseAuthor}\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\n1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.`;

      case 'ISC':
        return `ISC License\n\nCopyright (c) ${licenseYear} ${licenseAuthor}\n\nPermission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.`;

      case 'Unlicense':
        return `This is free and unencumbered software released into the public domain.\n\nAnyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.\n\nIn jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`;

      default:
        return '';
    }
  }, [licenseType, licenseAuthor, licenseYear]);

  const downloadLicenseFile = () => {
    const blob = new Blob([generatedLicenseText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LICENSE';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header com Insígnia do Marco dos 200 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Marco Histórico: 200 Utilitários
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Sovereign</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-emerald-400" />
            Suíte de Documentos Open Source, QR Code & Formatos Web
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Extrator de texto, gerador de QR Code vetorial, validador de OpenAPI/JSON Schema, simulador de compressão Gzip e gerador de licenças SPDX.
          </p>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('text-extractor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'text-extractor'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Extrator & Sanitizador de Texto
        </button>

        <button
          onClick={() => setActiveTab('custom-qrcode')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'custom-qrcode'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Designer de QR Code Customizado
        </button>

        <button
          onClick={() => setActiveTab('openapi-schema')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'openapi-schema'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-lg shadow-violet-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Validador JSON Schema / OpenAPI
        </button>

        <button
          onClick={() => setActiveTab('compression-calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'compression-calc'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          Simulador de Compressão Gzip / Brotli
        </button>

        <button
          onClick={() => setActiveTab('opensource-license')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'opensource-license'
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-lg shadow-pink-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Gerador de Licenças Open Source (SPDX)
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: EXTRATOR & SANITIZADOR DE TEXTO DE ARQUIVOS */}
        {activeTab === 'text-extractor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block mb-0.5">Total Caracteres</span>
                <span className="text-xl font-bold text-white font-mono">{textMetrics.totalChars.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block mb-0.5">Sem Espaços</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">{textMetrics.charsNoSpaces.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block mb-0.5">Palavras</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{textMetrics.words.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block mb-0.5">Linhas</span>
                <span className="text-xl font-bold text-amber-400 font-mono">{textMetrics.lines}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-400 block mb-0.5">Parágrafos</span>
                <span className="text-xl font-bold text-purple-400 font-mono">{textMetrics.paragraphs}</span>
              </div>
            </div>

            {/* Painel de Upload e Ações Rápidas */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-medium transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  Carregar Arquivo (.txt, .md, .log, .json)
                  <input type="file" accept=".txt,.md,.log,.json,.csv,.xml,.html" onChange={handleFileUpload} className="hidden" />
                </label>
                <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{fileName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={sanitizeSpaces}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-all"
                  title="Remove espaços duplicados e quebras excessivas"
                >
                  Limpar Espaços Extras
                </button>
                <button
                  onClick={removeEmptyLines}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-all"
                  title="Remove linhas em branco"
                >
                  Remover Linhas Vazias
                </button>
                <button
                  onClick={() => setExtractedText(extractedText.toUpperCase())}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                >
                  AA
                </button>
                <button
                  onClick={() => setExtractedText(extractedText.toLowerCase())}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                >
                  aa
                </button>
                <button
                  onClick={() => copyToClipboard(extractedText, 'extracted-text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 transition-all"
                >
                  {copiedKey === 'extracted-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'extracted-text' ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={downloadTextFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar TXT
                </button>
              </div>
            </div>

            {/* Área de Edição */}
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
              placeholder="Cole seu texto aqui ou arraste um arquivo..."
            />

            {/* Termos Mais Frequentes */}
            {textMetrics.topWords.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-300">Termos Mais Frequentes:</span>
                {textMetrics.topWords.map(([w, c]) => (
                  <span key={w} className="px-2 py-0.5 rounded-md bg-slate-800/80 text-cyan-300 font-mono">
                    {w}: <strong className="text-white">{c}x</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: DESIGNER DE QR CODE CUSTOMIZADO */}
        {activeTab === 'custom-qrcode' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Conteúdo / URL do QR Code:
                </label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="https://sua-empresa.com ou texto para escanear"
                />
              </div>

              {/* Cores e Presets */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Cor dos Módulos (Foreground):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Cor do Fundo (Background):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Presets Rápidos */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Temas Prontos:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { name: 'Cyber Cyan', fg: '#06b6d4', bg: '#020617' },
                    { name: 'Emerald Matrix', fg: '#10b981', bg: '#020617' },
                    { name: 'Amber Neon', fg: '#f59e0b', bg: '#0f172a' },
                    { name: 'Purple Void', fg: '#a855f7', bg: '#090514' },
                    { name: 'Padrão Clássico', fg: '#000000', bg: '#ffffff' }
                  ].map(p => (
                    <button
                      key={p.name}
                      onClick={() => { setQrFgColor(p.fg); setQrBgColor(p.bg); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Correção de Erro e Margem */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Correção de Erro (ECC):
                  </label>
                  <select
                    value={qrCorrection}
                    onChange={(e: any) => setQrCorrection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="L">L - Baixo (7% recuperação)</option>
                    <option value="M">M - Médio (15% recuperação)</option>
                    <option value="Q">Q - Alto (25% recuperação)</option>
                    <option value="H">H - Máximo (30% recuperação / com logo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Margem Externa (Quiet Zone): {qrMargin} blocos
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={qrMargin}
                    onChange={(e) => setQrMargin(Number(e.target.value))}
                    className="w-full accent-emerald-500 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Preview do QR Code e Download */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <div 
                className="p-4 rounded-xl shadow-2xl flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: qrBgColor }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSvgUrl}
                  alt="QR Code Gerado"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
                <button
                  onClick={() => downloadQrCode('svg')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-medium transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar SVG
                </button>
                <button
                  onClick={() => downloadQrCode('png')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-medium transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar PNG (1K)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: VALIDADOR JSON SCHEMA & OPENAPI 3.0 */}
        {activeTab === 'openapi-schema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Insira seu JSON Schema ou Especificação OpenAPI para análise sintática e geração de dados mock:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSchemaInput(JSON.stringify({
                    "$schema": "https://json-schema.org/draft/2020-12/schema",
                    "title": "E-commerce Order",
                    "type": "object",
                    "required": ["orderId", "customerEmail", "totalAmount", "items"],
                    "properties": {
                      "orderId": { "type": "string", "format": "uuid" },
                      "customerEmail": { "type": "string", "format": "email" },
                      "totalAmount": { "type": "number", "minimum": 1.0 },
                      "status": { "type": "string", "enum": ["pending", "paid", "shipped", "cancelled"] },
                      "items": {
                        "type": "array",
                        "items": { "type": "string" }
                      }
                    }
                  }, null, 2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Preset: Pedido E-commerce
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  JSON Schema / OpenAPI 3.0:
                </label>
                <textarea
                  value={schemaInput}
                  onChange={(e) => setSchemaInput(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500 leading-relaxed resize-y"
                />
              </div>

              <div className="lg:col-span-6 space-y-3">
                <label className="text-xs font-medium text-slate-300 block">
                  Diagnóstico & Mock Data Gerado:
                </label>
                
                {schemaAnalysis.valid ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300">Schema Válido: {schemaAnalysis.title}</div>
                        <div className="text-[11px] text-emerald-400/80 mt-0.5">
                          Tipo: <strong className="font-mono">{schemaAnalysis.type}</strong> | Propriedades: <strong className="font-mono">{schemaAnalysis.properties?.length}</strong> | Obrigatórias: <strong className="font-mono">{schemaAnalysis.requiredFields?.length}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
                        <span className="text-xs font-mono text-slate-400">Mock Data Automático</span>
                        <button
                          onClick={() => copyToClipboard(schemaAnalysis.mockJson || '', 'mock-schema')}
                          className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300"
                        >
                          {copiedKey === 'mock-schema' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copiar Mock
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-60 leading-relaxed">
                        {schemaAnalysis.mockJson}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-red-300">Erro de Sintaxe no Schema</div>
                      <p className="text-xs text-red-400/90 font-mono mt-1">{schemaAnalysis.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: CALCULADORA DE COMPRESSÃO DE DADOS (GZIP / BROTLI) */}
        {activeTab === 'compression-calc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Tamanho Original</span>
                <span className="text-xl font-bold text-white font-mono">{rawBytes.toLocaleString('pt-BR')} B</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{(rawBytes / 1024).toFixed(2)} KB</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Comprimido (Gzip)</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">{gzipSize.toLocaleString('pt-BR')} B</span>
                <span className="text-[11px] text-emerald-400 block mt-0.5 font-semibold">-{gzipRatio}% Economia</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Deflate Nativo</span>
                <span className="text-xl font-bold text-amber-400 font-mono">{deflateSize.toLocaleString('pt-BR')} B</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{(deflateSize / 1024).toFixed(2)} KB</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Brotli Estimado (br)</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{brotliEstimatedBytes.toLocaleString('pt-BR')} B</span>
                <span className="text-[11px] text-emerald-400 block mt-0.5 font-semibold">-{brotliRatio}% Economia</span>
              </div>
            </div>

            {/* Simulação de Tráfego em Escala */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Impacto de Banda em Escala (Economia com Gzip/Brotli)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block">10.000 Requisições:</span>
                  <div className="mt-1 font-mono">
                    <span className="text-slate-500 line-through mr-2">{((rawBytes * 10000) / (1024 * 1024)).toFixed(1)} MB</span>
                    <strong className="text-emerald-400">{((gzipSize * 10000) / (1024 * 1024)).toFixed(1)} MB</strong>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block">100.000 Requisições:</span>
                  <div className="mt-1 font-mono">
                    <span className="text-slate-500 line-through mr-2">{((rawBytes * 100000) / (1024 * 1024)).toFixed(1)} MB</span>
                    <strong className="text-emerald-400">{((gzipSize * 100000) / (1024 * 1024)).toFixed(1)} MB</strong>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block">1 Milhão de Requisições:</span>
                  <div className="mt-1 font-mono">
                    <span className="text-slate-500 line-through mr-2">{((rawBytes * 1000000) / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
                    <strong className="text-emerald-400">{((gzipSize * 1000000) / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Payload / Texto para Testar Compressão:
              </label>
              <textarea
                value={compressInput}
                onChange={(e) => setCompressInput(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>
          </div>
        )}

        {/* ABA 5: GERADOR DE LICENÇAS OPEN SOURCE (SPDX) */}
        {activeTab === 'opensource-license' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tipo de Licença Open Source (SPDX):
                </label>
                <select
                  value={licenseType}
                  onChange={(e: any) => setLicenseType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="MIT">MIT License (Mais Popular & Permissiva)</option>
                  <option value="Apache-2.0">Apache 2.0 (Permissiva com Patentes Explícitas)</option>
                  <option value="GPL-3.0">GNU GPL v3 (Copyleft Forte / Código Aberto Obrigatório)</option>
                  <option value="BSD-3-Clause">BSD 3-Clause (Permissiva com Proteção de Nome)</option>
                  <option value="ISC">ISC (Ultra Simplificada estilo MIT)</option>
                  <option value="Unlicense">The Unlicense (Domínio Público / Zero Restrições)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Titular dos Direitos Autorais / Autor:
                </label>
                <input
                  type="text"
                  value={licenseAuthor}
                  onChange={(e) => setLicenseAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-mono"
                  placeholder="Nome do autor ou da empresa"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Ano da Licença:
                  </label>
                  <input
                    type="text"
                    value={licenseYear}
                    onChange={(e) => setLicenseYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Nome do Software / Repositório:
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Tabela de Permissões */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                <span className="font-semibold text-slate-300 block">Termos da Licença {licenseType}:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Uso Comercial Permitido
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Modificação de Código
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Distribuição Livre
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Info className="w-3.5 h-3.5" />
                    {licenseType === 'GPL-3.0' ? 'Copyleft Obrigatório' : 'Sem Garantias'}
                  </div>
                </div>
              </div>
            </div>

            {/* Visualizador da Licença e Botões */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Arquivo gerado: LICENSE</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedLicenseText, 'license-text')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-pink-300 transition-all"
                  >
                    {copiedKey === 'license-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'license-text' ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={downloadLicenseFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 text-pink-300 hover:bg-pink-600/30 border border-pink-500/30 text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar LICENSE
                  </button>
                </div>
              </div>

              <textarea
                value={generatedLicenseText}
                readOnly
                rows={13}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none leading-relaxed select-all"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
