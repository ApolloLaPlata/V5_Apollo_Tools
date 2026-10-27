'use client';

import React, { useState, useMemo } from 'react';
import { 
  Archive, 
  FileCode2, 
  Binary, 
  Layers, 
  TrendingDown, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sliders, 
  Zap, 
  HardDrive, 
  Play, 
  ShieldCheck,
  Terminal,
  FileText
} from 'lucide-react';

interface DataCompressionStreamsSuiteProps {
  defaultTab?: 'gzip-streams' | 'brotli-simulator' | 'tar-builder' | 'checksums' | 'chunked-http';
}

export const DataCompressionStreamsSuite: React.FC<DataCompressionStreamsSuiteProps> = ({ 
  defaultTab = 'gzip-streams' 
}) => {
  const [activeTab, setActiveTab] = useState<'gzip-streams' | 'brotli-simulator' | 'tar-builder' | 'checksums' | 'chunked-http'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: GZIP / DEFLATE COMPRESSOR & DECOMPRESSOR VIA WEB STREAMS
  // ==========================================
  const sampleJson = JSON.stringify({
    service: "V5 Apollo Tools",
    status: "healthy",
    timestamp: new Date().toISOString(),
    metrics: {
      active_tools: 310,
      client_side_ratio: 1.0,
      gpu_fleet_ready: true,
      nodes: [
        { id: "node-01", latency_ms: 12, region: "br-sa-east-1" },
        { id: "node-02", latency_ms: 18, region: "us-east-1" },
        { id: "node-03", latency_ms: 45, region: "eu-central-1" }
      ]
    },
    system_message: "Processamento puro no cliente sem intermediários. Privacidade total e soberania digital."
  }, null, 2);

  const [inputText, setInputText] = useState<string>(sampleJson);
  const [compressionFormat, setCompressionFormat] = useState<'gzip' | 'deflate'>('gzip');
  const [compressedBytes, setCompressedBytes] = useState<Uint8Array | null>(null);
  const [compressedHexPreview, setCompressedHexPreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionRatio, setCompressionRatio] = useState<string>('0');

  const executeCompression = async () => {
    if (!inputText) return;
    setIsCompressing(true);
    try {
      const rawBytes = new TextEncoder().encode(inputText);
      // Usar a CompressionStream nativa do navegador
      const cs = new CompressionStream(compressionFormat);
      const writer = cs.writable.getWriter();
      writer.write(rawBytes);
      writer.close();

      const response = new Response(cs.readable);
      const buffer = await response.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      setCompressedBytes(uint8);

      // Gerar hex preview dos primeiros 64 bytes
      const slice = uint8.slice(0, 64);
      let hex = '';
      for (let i = 0; i < slice.length; i++) {
        hex += slice[i].toString(16).padStart(2, '0').toUpperCase() + (i % 16 === 15 ? '\n' : ' ');
      }
      setCompressedHexPreview(hex.trim());

      const originalSize = rawBytes.byteLength;
      const compSize = uint8.byteLength;
      const saved = Math.max(0, originalSize - compSize);
      setCompressionRatio(((saved / originalSize) * 100).toFixed(1));
    } catch (err) {
      console.error("Erro na compressão:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Download do blob comprimido
  const downloadCompressedFile = () => {
    if (!compressedBytes) return;
    const blob = new Blob([compressedBytes as any], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payload.${compressionFormat === 'gzip' ? 'gz' : 'deflate'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ==========================================
  // FERRAMENTA 2: SIMULADOR DE TAXAS BROTLI VS GZIP
  // ==========================================
  const [payloadType, setPayloadType] = useState<'json' | 'html' | 'css'>('json');
  const [payloadSizeBytes, setPayloadSizeBytes] = useState<number>(45000); // 45 KB

  const brotliComparison = useMemo(() => {
    // Estimativas analíticas canônicas da IETF / Google Chrome para Brotli vs Gzip
    let gzipRatio = 0.72; // 72% de redução típica em JSON
    let brotliFastRatio = 0.76; // Brotli nível 4
    let brotliMaxRatio = 0.82; // Brotli nível 11

    if (payloadType === 'html') {
      gzipRatio = 0.75;
      brotliFastRatio = 0.79;
      brotliMaxRatio = 0.84;
    } else if (payloadType === 'css') {
      gzipRatio = 0.80;
      brotliFastRatio = 0.83;
      brotliMaxRatio = 0.87;
    }

    const gzipSize = Math.round(payloadSizeBytes * (1 - gzipRatio));
    const brotliFastSize = Math.round(payloadSizeBytes * (1 - brotliFastRatio));
    const brotliMaxSize = Math.round(payloadSizeBytes * (1 - brotliMaxRatio));

    // Estimativas de tempo de transferência em 3G (1.5 Mbps = 187.5 KB/s)
    const speedBytesPerSec3G = 187500;
    const timeRaw3gMs = Math.round((payloadSizeBytes / speedBytesPerSec3G) * 1000);
    const timeGzip3gMs = Math.round((gzipSize / speedBytesPerSec3G) * 1000);
    const timeBrotli3gMs = Math.round((brotliMaxSize / speedBytesPerSec3G) * 1000);

    return {
      rawKb: (payloadSizeBytes / 1024).toFixed(1),
      gzipKb: (gzipSize / 1024).toFixed(1),
      brotliFastKb: (brotliFastSize / 1024).toFixed(1),
      brotliMaxKb: (brotliMaxSize / 1024).toFixed(1),
      brotliExtraSavingsPercent: (((gzipSize - brotliMaxSize) / gzipSize) * 100).toFixed(1),
      timeRaw3gMs,
      timeGzip3gMs,
      timeBrotli3gMs
    };
  }, [payloadType, payloadSizeBytes]);

  // ==========================================
  // FERRAMENTA 3: CONSTRUTOR DE TARBALL (.TAR) CLIENT-SIDE
  // ==========================================
  const [tarFiles, setTarFiles] = useState<{ name: string; content: string }[]>([
    { name: 'config.json', content: '{\n  "version": "1.0",\n  "environment": "production"\n}' },
    { name: 'README.md', content: '# V5 Apollo Sovereign Archive\nArquivos empacotados client-side.' },
    { name: 'script.js', content: 'console.log("Executando dentro do pacote tar.");' }
  ]);

  const addTarFile = () => {
    setTarFiles([...tarFiles, { name: `documento_${tarFiles.length + 1}.txt`, content: 'Novo arquivo.' }]);
  };

  const removeTarFile = (index: number) => {
    setTarFiles(tarFiles.filter((_, idx) => idx !== index));
  };

  const updateTarFile = (index: number, field: 'name' | 'content', value: string) => {
    setTarFiles(tarFiles.map((f, idx) => (idx === index ? { ...f, [field]: value } : f)));
  };

  // Construir Tarball UStar em binário puro
  const generateAndDownloadTar = () => {
    const blocks: Uint8Array[] = [];

    tarFiles.forEach((file) => {
      const contentBytes = new TextEncoder().encode(file.content);
      const header = new Uint8Array(512);

      // 1. Nome do arquivo (0 a 99)
      const nameBytes = new TextEncoder().encode(file.name.slice(0, 99));
      header.set(nameBytes, 0);

      // 2. File Mode: 0000644 (100 a 107)
      header.set(new TextEncoder().encode('0000644'), 100);
      header[107] = 0;

      // 3. UID / GID (108 a 123)
      header.set(new TextEncoder().encode('0000000'), 108);
      header[115] = 0;
      header.set(new TextEncoder().encode('0000000'), 116);
      header[123] = 0;

      // 4. Tamanho em octal 11 chars + null (124 a 135)
      const sizeOctal = contentBytes.byteLength.toString(8).padStart(11, '0');
      header.set(new TextEncoder().encode(sizeOctal), 124);
      header[135] = 0;

      // 5. Mtime em octal (136 a 147)
      const mtimeOctal = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0');
      header.set(new TextEncoder().encode(mtimeOctal), 136);
      header[147] = 0;

      // 6. Checksum provisório com 8 espaços (148 a 155)
      for (let i = 148; i < 156; i++) header[i] = 32;

      // 7. Typeflag: '0' (156)
      header[156] = 48; // '0'

      // 8. Magic "ustar\0" (257 a 262) e versão "00" (263 a 264)
      header.set(new TextEncoder().encode('ustar'), 257);
      header[262] = 0;
      header[263] = 48; // '0'
      header[264] = 48; // '0'

      // Calcular Checksum real (soma de todos os 512 bytes tratando espaços em 148-155)
      let checksum = 0;
      for (let i = 0; i < 512; i++) checksum += header[i];
      const checksumOctal = checksum.toString(8).padStart(6, '0');
      header.set(new TextEncoder().encode(checksumOctal), 148);
      header[154] = 0;
      header[155] = 32;

      // Adicionar Header
      blocks.push(header);

      // Adicionar Conteúdo alinhado em múltiplos de 512 bytes
      blocks.push(contentBytes);
      const remainder = contentBytes.byteLength % 512;
      if (remainder !== 0) {
        const padding = new Uint8Array(512 - remainder);
        blocks.push(padding);
      }
    });

    // Finalizar com dois blocos nulos de 512 bytes
    blocks.push(new Uint8Array(512));
    blocks.push(new Uint8Array(512));

    // Juntar todos os blocos
    const totalLength = blocks.reduce((acc, b) => acc + b.byteLength, 0);
    const tarBuffer = new Uint8Array(totalLength);
    let offset = 0;
    blocks.forEach((b) => {
      tarBuffer.set(b, offset);
      offset += b.byteLength;
    });

    // Download do .tar
    const blob = new Blob([tarBuffer], { type: 'application/x-tar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pacote-v5-tools.tar';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ==========================================
  // FERRAMENTA 4: CALCULADORA DE CHECKSUMS CRC-32 & ADLER-32
  // ==========================================
  const [checksumInput, setChecksumInput] = useState<string>('Holding V5 Apollo 2026 - Soberania e Performance');

  const checksumResults = useMemo(() => {
    const bytes = new TextEncoder().encode(checksumInput);

    // 1. Tabela CRC-32 (IEEE 802.3)
    const makeCrcTable = () => {
      let c;
      const crcTable: number[] = [];
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        crcTable[n] = c;
      }
      return crcTable;
    };

    const crcTable = makeCrcTable();
    let crc = 0 ^ -1;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
    }
    const crc32Unsigned = (crc ^ -1) >>> 0;
    const crc32Hex = '0x' + crc32Unsigned.toString(16).toUpperCase().padStart(8, '0');

    // 2. Adler-32 (RFC 1950)
    const MOD_ADLER = 65521;
    let a = 1;
    let b = 0;
    for (let i = 0; i < bytes.length; i++) {
      a = (a + bytes[i]) % MOD_ADLER;
      b = (b + a) % MOD_ADLER;
    }
    const adler32Unsigned = ((b << 16) | a) >>> 0;
    const adler32Hex = '0x' + adler32Unsigned.toString(16).toUpperCase().padStart(8, '0');

    return {
      bytesLength: bytes.length,
      crc32Hex,
      crc32Decimal: crc32Unsigned,
      adler32Hex,
      adler32Decimal: adler32Unsigned
    };
  }, [checksumInput]);

  // ==========================================
  // FERRAMENTA 5: SIMULADOR DE CHUNKED TRANSFER ENCODING
  // ==========================================
  const [chunkText, setChunkText] = useState<string>(
    'Linha 1: Inicializando stream de telemetria.\nLinha 2: Conectando aos nós de processamento.\nLinha 3: Transmitindo blocos parciais sem Content-Length.\nLinha 4: Finalizando fluxo de dados.'
  );
  const [chunkSizeChars, setChunkSizeChars] = useState<number>(32);

  const chunkedSimulation = useMemo(() => {
    const text = chunkText;
    const chunks: { hexSize: string; data: string; byteCount: number }[] = [];
    let offset = 0;

    while (offset < text.length) {
      const slice = text.slice(offset, offset + chunkSizeChars);
      const byteCount = new TextEncoder().encode(slice).length;
      chunks.push({
        hexSize: byteCount.toString(16).toUpperCase(),
        data: slice,
        byteCount
      });
      offset += chunkSizeChars;
    }

    // Formatado HTTP Chunked exato
    let rawHttp = '';
    chunks.forEach((c) => {
      rawHttp += `${c.hexSize}\r\n${c.data}\r\n`;
    });
    rawHttp += '0\r\n\r\n'; // Delimitador final

    const rawPayloadBytes = new TextEncoder().encode(text).length;
    const chunkedHttpBytes = new TextEncoder().encode(rawHttp).length;
    const framingOverheadBytes = chunkedHttpBytes - rawPayloadBytes;

    return {
      totalChunks: chunks.length,
      rawPayloadBytes,
      chunkedHttpBytes,
      framingOverheadBytes,
      rawHttp,
      chunks
    };
  }, [chunkText, chunkSizeChars]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HEADER DA SUÍTE */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
              <Archive className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Compressão de Dados, Algoritmos & Web Streams
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                  Etapa 61 · 315 Ferramentas!
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Gzip/Deflate via CompressionStream nativo, comparativo Brotli vs Gzip, tarball .tar, checksums CRC32/Adler32 e Chunked HTTP.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gzip-streams')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'gzip-streams'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Gzip / Deflate Streams
          </button>
          <button
            onClick={() => setActiveTab('brotli-simulator')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'brotli-simulator'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Brotli vs Gzip
          </button>
          <button
            onClick={() => setActiveTab('tar-builder')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'tar-builder'
                ? 'bg-indigo-500 text-slate-950 shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Gerador Tarball (.tar)
          </button>
          <button
            onClick={() => setActiveTab('checksums')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'checksums'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            CRC-32 & Adler-32
          </button>
          <button
            onClick={() => setActiveTab('chunked-http')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'chunked-http'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            HTTP Chunked
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ========================================================= */}
        {/* TAB 1: GZIP / DEFLATE COMPRESSOR & DECOMPRESSOR          */}
        {/* ========================================================= */}
        {activeTab === 'gzip-streams' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ENTRADA DE TEXTO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Payload de Entrada para Compressão
                  </h3>
                  <button
                    onClick={() => setInputText(sampleJson)}
                    className="text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                  >
                    Restaurar Exemplo
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="Cole aqui o texto ou JSON a ser comprimido..."
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Algoritmo:</span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="fmt"
                        checked={compressionFormat === 'gzip'}
                        onChange={() => setCompressionFormat('gzip')}
                        className="accent-blue-500"
                      />
                      gzip (RFC 1952)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="fmt"
                        checked={compressionFormat === 'deflate'}
                        onChange={() => setCompressionFormat('deflate')}
                        className="accent-blue-500"
                      />
                      deflate (zlib)
                    </label>
                  </div>

                  <button
                    onClick={executeCompression}
                    disabled={isCompressing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isCompressing ? 'Comprimindo...' : 'Comprimir Payload'}
                  </button>
                </div>
              </div>

              {/* RESULTADO E HEX DUMP */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Binary className="w-4 h-4 text-blue-400" /> Resultado dos Bytes Comprimidos
                    </span>

                    {compressedBytes && (
                      <button
                        onClick={downloadCompressedFile}
                        className="text-xs text-slate-950 bg-blue-400 hover:bg-blue-300 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar .{compressionFormat}
                      </button>
                    )}
                  </div>

                  {/* CARDS DE ESTATÍSTICA */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Tamanho Original</span>
                      <span className="text-xs font-bold text-slate-300">
                        {new TextEncoder().encode(inputText).length} B
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Comprimido</span>
                      <span className="text-xs font-bold text-blue-400">
                        {compressedBytes ? `${compressedBytes.byteLength} B` : '-'}
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">Economia</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {compressedBytes ? `-${compressionRatio}%` : '-'}
                      </span>
                    </div>
                  </div>

                  {/* HEX PREVIEW */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <span className="text-[10px] text-slate-500 block mb-1">
                      Hex Dump dos Primeiros Bytes (Magic Bytes Gzip: 1F 8B):
                    </span>
                    <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap">
                      {compressedHexPreview || 'Clique em "Comprimir Payload" para processar no navegador.'}
                    </pre>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Executado 100% no cliente via API padrão W3C <code>CompressionStream</code>, sem envio de dados para servidores externos.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SIMULADOR DE TAXAS BROTLI VS GZIP                 */}
        {/* ========================================================= */}
        {activeTab === 'brotli-simulator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CONTROLES DA SIMULAÇÃO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> Parâmetros de Carga & Tipo de Conteúdo
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Tipo de Conteúdo Web:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPayloadType('json')}
                      className={`py-1.5 rounded text-xs font-semibold border ${
                        payloadType === 'json' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      JSON (APIs REST)
                    </button>
                    <button
                      onClick={() => setPayloadType('html')}
                      className={`py-1.5 rounded text-xs font-semibold border ${
                        payloadType === 'html' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      HTML (SSR DOM)
                    </button>
                    <button
                      onClick={() => setPayloadType('css')}
                      className={`py-1.5 rounded text-xs font-semibold border ${
                        payloadType === 'css' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      CSS (Estilos)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Tamanho do Payload Não Comprimido:</span>
                    <span className="text-cyan-400 font-bold">{brotliComparison.rawKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={250000}
                    step={5000}
                    value={payloadSizeBytes}
                    onChange={(e) => setPayloadSizeBytes(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>5 KB (Micro API)</span>
                    <span>45 KB (Padrão)</span>
                    <span>250 KB (Bundle grande)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-400">
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Vantagem Arquitetural do Brotli:
                  </div>
                  <p>
                    O Brotli incorpora um dicionário estático pré-computado de 120 KB com mais de 13.000 palavras comuns da web (HTML tags, CSS properties e strings comuns), gerando arquivos <strong>{brotliComparison.brotliExtraSavingsPercent}% menores</strong> do que o Gzip com o mesmo tempo de descompressão.
                  </p>
                </div>
              </div>

              {/* COMPARATIVO VISUAL */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Comparação de Peso de Download
                </span>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Original (Sem Compressão)</span>
                      <span className="text-slate-300 font-bold">{brotliComparison.rawKb} KB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400 font-semibold">Gzip Nível 6 (Padrão Nginx)</span>
                      <span className="text-blue-300 font-bold">{brotliComparison.gzipKb} KB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(parseFloat(brotliComparison.gzipKb) / parseFloat(brotliComparison.rawKb)) * 100}%` }}
                        className="bg-blue-500 h-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyan-400 font-semibold">Brotli Nível 4 (Dinâmico / CDN)</span>
                      <span className="text-cyan-300 font-bold">{brotliComparison.brotliFastKb} KB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(parseFloat(brotliComparison.brotliFastKb) / parseFloat(brotliComparison.rawKb)) * 100}%` }}
                        className="bg-cyan-500 h-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-semibold">Brotli Nível 11 (Estático / Next.js Build)</span>
                      <span className="text-emerald-300 font-bold">{brotliComparison.brotliMaxKb} KB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(parseFloat(brotliComparison.brotliMaxKb) / parseFloat(brotliComparison.rawKb)) * 100}%` }}
                        className="bg-emerald-500 h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* TEMPO DE TRANSFERÊNCIA 3G */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                    Tempo Estimado de Download em Conexão 3G (1.5 Mbps):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Sem Comp.</span>
                      <span className="font-bold text-slate-300">{brotliComparison.timeRaw3gMs} ms</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Gzip</span>
                      <span className="font-bold text-blue-400">{brotliComparison.timeGzip3gMs} ms</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Brotli 11</span>
                      <span className="font-bold text-emerald-400">{brotliComparison.timeBrotli3gMs} ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GERADOR DE TARBALL (.TAR) CLIENT-SIDE              */}
        {/* ========================================================= */}
        {activeTab === 'tar-builder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LISTA DE ARQUIVOS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                    <Archive className="w-4 h-4" /> Arquivos no Pacote Tarball
                  </h3>
                  <button
                    onClick={addTarFile}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    + Adicionar Arquivo
                  </button>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {tarFiles.map((file, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={file.name}
                          onChange={(e) => updateTarFile(idx, 'name', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono flex-1 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => removeTarFile(idx)}
                          className="text-slate-500 hover:text-rose-400 text-xs px-1"
                        >
                          Remover
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={file.content}
                        onChange={(e) => updateTarFile(idx, 'content', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTÃO E ESTRUTURA POSIX */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Especificação POSIX UStar 512-Byte Alignment
                  </h4>
                  <p className="text-xs text-slate-300 mb-4">
                    O formato <code>.tar</code> (Tape Archive) organiza múltiplos arquivos em blocos contínuos de 512 bytes, contendo cabeçalho octal de metadados, permissões POSIX (0644) e checksums.
                  </p>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2 mb-4 font-mono text-[11px] text-indigo-300">
                    <div>Total de Arquivos: {tarFiles.length}</div>
                    <div>Formato: POSIX ustar standard compliant</div>
                    <div>Compatibilidade: WinRAR, 7-Zip, Linux `tar -xvf`</div>
                  </div>
                </div>

                <button
                  onClick={generateAndDownloadTar}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Gerar e Baixar Arquivo .tar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CALCULADORA DE CHECKSUMS CRC-32 & ADLER-32         */}
        {/* ========================================================= */}
        {activeTab === 'checksums' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ENTRADA DE DADOS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Binary className="w-4 h-4" /> Dados para Verificação de Integridade
                </h3>

                <textarea
                  rows={6}
                  value={checksumInput}
                  onChange={(e) => setChecksumInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Digite qualquer texto para calcular os checksums..."
                />

                <div className="text-[11px] text-slate-400">
                  Total de bytes codificados em UTF-8: <strong>{checksumResults.bytesLength} bytes</strong>.
                </div>
              </div>

              {/* RESULTADOS DOS CHECKSUMS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                {/* CRC-32 */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      CRC-32 (IEEE 802.3 / Ethernet / Gzip)
                    </span>
                    <button
                      onClick={() => copyToClipboard(checksumResults.crc32Hex, 'crc32-hex')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'crc32-hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Hex
                    </button>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {checksumResults.crc32Hex}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Decimal: {checksumResults.crc32Decimal}
                  </div>
                </div>

                {/* ADLER-32 */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Adler-32 (RFC 1950 / Zlib Checksum)
                    </span>
                    <button
                      onClick={() => copyToClipboard(checksumResults.adler32Hex, 'adler32-hex')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'adler32-hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Hex
                    </button>
                  </div>
                  <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                    {checksumResults.adler32Hex}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Decimal: {checksumResults.adler32Decimal}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SIMULADOR DE CHUNKED TRANSFER ENCODING             */}
        {/* ========================================================= */}
        {activeTab === 'chunked-http' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ENTRADAS DO STREAM */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Fluxo de Dados Não Fragmentado
                </h3>

                <textarea
                  rows={5}
                  value={chunkText}
                  onChange={(e) => setChunkText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Tamanho do Chunk (Caracteres por Bloco):</span>
                    <span className="text-amber-400 font-bold">{chunkSizeChars} chars</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={128}
                    step={8}
                    value={chunkSizeChars}
                    onChange={(e) => setChunkSizeChars(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Total Chunks</span>
                    <span className="font-bold text-amber-400">{chunkedSimulation.totalChunks}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Payload Puro</span>
                    <span className="font-bold text-slate-300">{chunkedSimulation.rawPayloadBytes} B</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Overhead Hex</span>
                    <span className="font-bold text-slate-300">+{chunkedSimulation.framingOverheadBytes} B</span>
                  </div>
                </div>
              </div>

              {/* SAÍDA DO PROTOCOLO HTTP */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      Payload HTTP/1.1 Transfer-Encoding: chunked
                    </span>
                    <button
                      onClick={() => copyToClipboard(chunkedSimulation.rawHttp, 'chunked-http-code')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'chunked-http-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Raw
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-amber-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[300px]">
                    {chunkedSimulation.rawHttp}
                  </pre>
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  Cada chunk é precedido pelo seu tamanho em hexadecimal seguido de <code>\r\n</code>, e o fluxo é encerrado com um chunk vazio <code>0\r\n\r\n</code>.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
