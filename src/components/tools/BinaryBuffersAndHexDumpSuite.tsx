'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Binary, 
  FileCode, 
  Cpu, 
  Layers, 
  Table, 
  Copy, 
  Check, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Search, 
  ArrowRightLeft,
  FileCheck,
  ShieldAlert,
  Sliders,
  Code
} from 'lucide-react';

interface BinaryBuffersAndHexDumpSuiteProps {
  defaultTab?: 'hex-dump' | 'endianness' | 'magic-bytes' | 'bitwise-calc' | 'ascii-inspector';
}

interface FileSignature {
  name: string;
  category: string;
  ext: string[];
  magicHex: string;
  offset?: number;
  description: string;
}

const COMMON_SIGNATURES: FileSignature[] = [
  { name: 'PNG Image', category: 'Imagem', ext: ['png'], magicHex: '89 50 4e 47 0d 0a 1a 0a', description: 'Portable Network Graphics (W3C standard)' },
  { name: 'JPEG / JFIF Image', category: 'Imagem', ext: ['jpg', 'jpeg'], magicHex: 'ff d8 ff', description: 'Joint Photographic Experts Group' },
  { name: 'PDF Document', category: 'Documento', ext: ['pdf'], magicHex: '25 50 44 46', description: 'Adobe Portable Document Format (%PDF)' },
  { name: 'ZIP Archive / Office Open XML', category: 'Arquivo Comprimido', ext: ['zip', 'docx', 'xlsx', 'pptx', 'jar', 'apk'], magicHex: '50 4b 03 04', description: 'PKZIP standard (usado em pacotes Office, JAR e APK)' },
  { name: 'GZIP Compressed Archive', category: 'Arquivo Comprimido', ext: ['gz', 'tgz'], magicHex: '1f 8b', description: 'GNU Zip compression stream' },
  { name: 'WebP Image', category: 'Imagem', ext: ['webp'], magicHex: '52 49 46 46', description: 'RIFF container com cabeçalho WebP' },
  { name: 'ELF Linux Binary', category: 'Executável', ext: ['bin', 'so', 'elf'], magicHex: '7f 45 4c 46', description: 'Executable and Linkable Format (Linux / Android)' },
  { name: 'Windows PE / EXE / DLL', category: 'Executável', ext: ['exe', 'dll', 'sys', 'ocx'], magicHex: '4d 5a', description: 'DOS MZ executable header (Mark Zbikowski)' },
  { name: 'WebAssembly Binary', category: 'Bytecode', ext: ['wasm'], magicHex: '00 61 73 6d', description: 'Wasm binary bytecode (\x00asm)' },
  { name: 'SQLite 3 Database', category: 'Banco de Dados', ext: ['sqlite', 'db', 'sqlite3'], magicHex: '53 51 4c 69 74 65 20 66 6f 72 6d 61 74 20 33 00', description: 'Formato nativo de arquivo SQLite 3' },
  { name: 'MP3 Audio (ID3v2)', category: 'Áudio', ext: ['mp3'], magicHex: '49 44 33', description: 'MPEG Audio Layer 3 com metadados ID3' },
  { name: 'OGG Vorbis Container', category: 'Áudio/Vídeo', ext: ['ogg', 'oga', 'ogv'], magicHex: '4f 67 67 53', description: 'Xiph.Org Ogg bitstream' },
  { name: 'Matroska / WebM Video', category: 'Vídeo', ext: ['mkv', 'webm'], magicHex: '1a 45 df a3', description: 'EBML (Extensible Binary Meta Language) container' }
];

export const BinaryBuffersAndHexDumpSuite: React.FC<BinaryBuffersAndHexDumpSuiteProps> = ({ defaultTab = 'hex-dump' }) => {
  const [activeTab, setActiveTab] = useState<'hex-dump' | 'endianness' | 'magic-bytes' | 'bitwise-calc' | 'ascii-inspector'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: VISUALIZADOR & EDITOR HEX DUMP
  // ==========================================
  const [hexInputType, setHexInputType] = useState<'text' | 'hex' | 'file'>('text');
  const [hexTextInput, setHexTextInput] = useState<string>('Hello World! 🚀 Apollo Holding Cyber Systems 2026\x00\x01\x02\xFF');
  const [hexRawInput, setHexRawInput] = useState<string>('48 65 6c 6c 6f 20 57 6f 72 6c 64 21 20 f0 9f 9a 80 20 41 70 6f 6c 6c 6f');
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedByteOffset, setSelectedByteOffset] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      // Limita a 64KB para renderização fluida no client-side
      const maxSlice = arrayBuffer.slice(0, 65536);
      setFileBuffer(new Uint8Array(maxSlice));
    };
    reader.readAsArrayBuffer(file);
  };

  const hexBytes = useMemo<Uint8Array>(() => {
    if (hexInputType === 'file' && fileBuffer) {
      return fileBuffer;
    }
    if (hexInputType === 'text') {
      return new TextEncoder().encode(hexTextInput);
    }
    if (hexInputType === 'hex') {
      const cleaned = hexRawInput.replace(/[^0-9a-fA-F]/g, '');
      const bytes: number[] = [];
      for (let i = 0; i < cleaned.length; i += 2) {
        const hex = cleaned.substring(i, i + 2);
        if (hex.length === 2) {
          bytes.push(parseInt(hex, 16));
        }
      }
      return new Uint8Array(bytes);
    }
    return new Uint8Array();
  }, [hexInputType, hexTextInput, hexRawInput, fileBuffer]);

  // Formatação em linhas de 16 bytes
  const hexDumpRows = useMemo(() => {
    const rows = [];
    const len = hexBytes.length;
    for (let i = 0; i < len; i += 16) {
      const offset = i.toString(16).padStart(8, '0');
      const chunk = hexBytes.slice(i, i + 16);
      
      const hexParts1: string[] = [];
      const hexParts2: string[] = [];
      let ascii = '';

      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const byte = chunk[j];
          const hex = byte.toString(16).padStart(2, '0');
          if (j < 8) hexParts1.push(hex);
          else hexParts2.push(hex);
          
          // Caracteres imprimíveis ASCII (32 a 126)
          if (byte >= 32 && byte <= 126) {
            ascii += String.fromCharCode(byte);
          } else {
            ascii += '.';
          }
        } else {
          if (j < 8) hexParts1.push('  ');
          else hexParts2.push('  ');
          ascii += ' ';
        }
      }

      rows.push({
        offset,
        baseIndex: i,
        chunk,
        hexGroup1: hexParts1.join(' '),
        hexGroup2: hexParts2.join(' '),
        ascii
      });
    }
    return rows;
  }, [hexBytes]);

  const rawHexDumpText = useMemo(() => {
    return hexDumpRows.map(r => `${r.offset}  ${r.hexGroup1}  ${r.hexGroup2}  |${r.ascii}|`).join('\n');
  }, [hexDumpRows]);

  const selectedByteDetails = useMemo(() => {
    if (selectedByteOffset === null || selectedByteOffset >= hexBytes.length) return null;
    const b = hexBytes[selectedByteOffset];
    return {
      offsetHex: '0x' + selectedByteOffset.toString(16).padStart(6, '0'),
      offsetDec: selectedByteOffset,
      hex: '0x' + b.toString(16).padStart(2, '0').toUpperCase(),
      dec: b,
      bin: b.toString(2).padStart(8, '0'),
      char: (b >= 32 && b <= 126) ? String.fromCharCode(b) : 'Não imprimível (código de controle ou binário)'
    };
  }, [selectedByteOffset, hexBytes]);

  // ==========================================
  // FERRAMENTA 2: CONVERSOR DE ENDIANNESS & TIPOS PRIMITIVOS
  // ==========================================
  const [endianInputMode, setEndianInputMode] = useState<'hex' | 'decimal'>('hex');
  const [endianHexInput, setEndianHexInput] = useState<string>('0x12345678');
  const [endianDecInput, setEndianDecInput] = useState<number>(305419896);

  const endianDecodedValues = useMemo(() => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);

    let val32 = 0;
    try {
      if (endianInputMode === 'hex') {
        const clean = endianHexInput.trim().replace(/^0x/i, '');
        val32 = parseInt(clean || '0', 16) || 0;
      } else {
        val32 = endianDecInput;
      }
    } catch {
      val32 = 0;
    }

    // Escreve em Big Endian
    view.setUint32(0, val32, false);

    const bytes = new Uint8Array(buffer, 0, 4);
    const bigEndianHex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
    const littleEndianHex = Array.from(bytes).reverse().map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();

    // Interpretações
    return {
      val32,
      bigEndianHex,
      littleEndianHex,
      int8: view.getInt8(0),
      uint8: view.getUint8(0),
      int16BE: view.getInt16(0, false),
      int16LE: view.getInt16(0, true),
      uint16BE: view.getUint16(0, false),
      uint16LE: view.getUint16(0, true),
      int32BE: view.getInt32(0, false),
      int32LE: view.getInt32(0, true),
      uint32BE: view.getUint32(0, false),
      uint32LE: view.getUint32(0, true),
      float32BE: view.getFloat32(0, false),
      float32LE: view.getFloat32(0, true)
    };
  }, [endianInputMode, endianHexInput, endianDecInput]);

  // ==========================================
  // FERRAMENTA 3: DETECTOR DE MAGIC BYTES & ASSINATURAS
  // ==========================================
  const [magicHexInput, setMagicHexInput] = useState<string>('89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52');
  const [magicTestFileName, setMagicTestFileName] = useState<string>('foto_perfil.png');
  const [magicDetectedFile, setMagicDetectedFile] = useState<{ name: string; buffer: Uint8Array } | null>(null);

  const handleMagicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMagicTestFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer);
      setMagicDetectedFile({ name: file.name, buffer: arr });
      const first16 = Array.from(arr.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
      setMagicHexInput(first16);
    };
    reader.readAsArrayBuffer(file.slice(0, 32));
  };

  const detectedSignatures = useMemo(() => {
    const cleanHex = magicHexInput.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
    const matched: FileSignature[] = [];

    COMMON_SIGNATURES.forEach(sig => {
      const sigClean = sig.magicHex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      if (cleanHex.startsWith(sigClean)) {
        matched.push(sig);
      }
    });

    const fileExt = magicTestFileName.split('.').pop()?.toLowerCase() || '';
    const hasExtensionMismatch = matched.length > 0 && !matched.some(s => s.ext.includes(fileExt));

    return {
      matched,
      fileExt,
      hasExtensionMismatch
    };
  }, [magicHexInput, magicTestFileName]);

  // ==========================================
  // FERRAMENTA 4: CALCULADORA BITWISE & OPERAÇÕES LÓGICAS EM BUFFERS
  // ==========================================
  const [bitOpA, setBitOpA] = useState<string>('0x00FF00AA');
  const [bitOpB, setBitOpB] = useState<string>('0x000F55AA');
  const [bitShiftAmount, setBitShiftAmount] = useState<number>(4);

  const bitwiseResults = useMemo(() => {
    const parse = (val: string) => {
      const clean = val.trim();
      if (clean.startsWith('0x') || clean.startsWith('0X')) return parseInt(clean, 16) || 0;
      return parseInt(clean, 10) || 0;
    };

    const numA = parse(bitOpA) >>> 0;
    const numB = parse(bitOpB) >>> 0;

    const and = (numA & numB) >>> 0;
    const or = (numA | numB) >>> 0;
    const xor = (numA ^ numB) >>> 0;
    const notA = (~numA) >>> 0;
    const shiftLeft = (numA << bitShiftAmount) >>> 0;
    const shiftRight = (numA >> bitShiftAmount) >>> 0;
    const shiftZeroFill = (numA >>> bitShiftAmount) >>> 0;

    const toBin32 = (n: number) => {
      const b = n.toString(2).padStart(32, '0');
      // Divide em grupos de 4 bits
      return b.match(/.{1,4}/g)?.join(' ') || b;
    };

    const toHex32 = (n: number) => '0x' + n.toString(16).padStart(8, '0').toUpperCase();

    // Contagem de bits setados (Hamming Weight)
    const hamming = (n: number) => {
      let count = 0;
      let temp = n;
      while (temp > 0) {
        count += temp & 1;
        temp = temp >>> 1;
      }
      return count;
    };

    return {
      numA,
      numB,
      binA: toBin32(numA),
      binB: toBin32(numB),
      hexA: toHex32(numA),
      hexB: toHex32(numB),
      hammingA: hamming(numA),
      hammingB: hamming(numB),
      and: { val: and, hex: toHex32(and), bin: toBin32(and) },
      or: { val: or, hex: toHex32(or), bin: toBin32(or) },
      xor: { val: xor, hex: toHex32(xor), bin: toBin32(xor) },
      notA: { val: notA, hex: toHex32(notA), bin: toBin32(notA) },
      shiftLeft: { val: shiftLeft, hex: toHex32(shiftLeft), bin: toBin32(shiftLeft) },
      shiftRight: { val: shiftRight, hex: toHex32(shiftRight), bin: toBin32(shiftRight) }
    };
  }, [bitOpA, bitOpB, bitShiftAmount]);

  // ==========================================
  // FERRAMENTA 5: TABELA E INSPETOR DE CARACTERES ASCII / ANSI
  // ==========================================
  const [asciiSearchQuery, setAsciiSearchQuery] = useState<string>('');
  const [selectedAsciiCategory, setSelectedAsciiCategory] = useState<'all' | 'control' | 'printable'>('all');

  const asciiTable = useMemo(() => {
    const list = [];
    const controlDescriptions: Record<number, { name: string; desc: string }> = {
      0: { name: 'NUL', desc: 'Null character (terminador de string C)' },
      1: { name: 'SOH', desc: 'Start of Heading' },
      2: { name: 'STX', desc: 'Start of Text' },
      3: { name: 'ETX', desc: 'End of Text' },
      4: { name: 'EOT', desc: 'End of Transmission (Ctrl+D)' },
      5: { name: 'ENQ', desc: 'Enquiry' },
      6: { name: 'ACK', desc: 'Acknowledge' },
      7: { name: 'BEL', desc: 'Bell / Alert (sinal sonoro)' },
      8: { name: 'BS', desc: 'Backspace (\b)' },
      9: { name: 'HT', desc: 'Horizontal Tab (\t)' },
      10: { name: 'LF', desc: 'Line Feed (\n - Nova linha Unix)' },
      11: { name: 'VT', desc: 'Vertical Tab' },
      12: { name: 'FF', desc: 'Form Feed (quebra de página)' },
      13: { name: 'CR', desc: 'Carriage Return (\r - Retorno de carro)' },
      14: { name: 'SO', desc: 'Shift Out' },
      15: { name: 'SI', desc: 'Shift In' },
      16: { name: 'DLE', desc: 'Data Link Escape' },
      17: { name: 'DC1', desc: 'Device Control 1 (XON)' },
      18: { name: 'DC2', desc: 'Device Control 2' },
      19: { name: 'DC3', desc: 'Device Control 3 (XOFF)' },
      20: { name: 'DC4', desc: 'Device Control 4' },
      21: { name: 'NAK', desc: 'Negative Acknowledge' },
      22: { name: 'SYN', desc: 'Synchronous Idle' },
      23: { name: 'ETB', desc: 'End of Transmission Block' },
      24: { name: 'CAN', desc: 'Cancel' },
      25: { name: 'EM', desc: 'End of Medium' },
      26: { name: 'SUB', desc: 'Substitute (Ctrl+Z)' },
      27: { name: 'ESC', desc: 'Escape (início de sequências ANSI)' },
      28: { name: 'FS', desc: 'File Separator' },
      29: { name: 'GS', desc: 'Group Separator' },
      30: { name: 'RS', desc: 'Record Separator' },
      31: { name: 'US', desc: 'Unit Separator' },
      32: { name: 'SP', desc: 'Space (Espaço simples)' },
      127: { name: 'DEL', desc: 'Delete' }
    };

    for (let i = 0; i < 128; i++) {
      const isControl = i < 32 || i === 127;
      const char = isControl ? (controlDescriptions[i]?.name || 'CTL') : String.fromCharCode(i);
      const desc = controlDescriptions[i]?.desc || `Caractere ASCII "${char}"`;

      list.push({
        dec: i,
        hex: '0x' + i.toString(16).padStart(2, '0').toUpperCase(),
        oct: i.toString(8).padStart(3, '0'),
        bin: i.toString(2).padStart(8, '0'),
        char,
        isControl,
        desc
      });
    }

    return list;
  }, []);

  const filteredAscii = useMemo(() => {
    return asciiTable.filter(item => {
      if (selectedAsciiCategory === 'control' && !item.isControl) return false;
      if (selectedAsciiCategory === 'printable' && item.isControl) return false;
      if (!asciiSearchQuery.trim()) return true;

      const q = asciiSearchQuery.toLowerCase();
      return (
        item.char.toLowerCase().includes(q) ||
        item.dec.toString().includes(q) ||
        item.hex.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    });
  }, [asciiTable, selectedAsciiCategory, asciiSearchQuery]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Cabeçalho da Bancada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Binary className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Análise de Arquivos Binários, Buffers & Hex Dump
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  Low-Level & Forensic
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Visualizador Hex Dump com inspeção de offset, conversor Little/Big Endian, detector de Magic Bytes e tabela de controle ASCII.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Soberania */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
            <Binary className="w-3.5 h-3.5" />
            100% Client-Side Memory
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Zero Server Upload
          </span>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('hex-dump')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'hex-dump'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Hex Dump & Offset</span>
        </button>

        <button
          onClick={() => setActiveTab('endianness')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'endianness'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Little vs Big Endian</span>
        </button>

        <button
          onClick={() => setActiveTab('magic-bytes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'magic-bytes'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Magic Bytes & Assinaturas</span>
        </button>

        <button
          onClick={() => setActiveTab('bitwise-calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'bitwise-calc'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Calculadora Bitwise</span>
        </button>

        <button
          onClick={() => setActiveTab('ascii-inspector')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'ascii-inspector'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Tabela ASCII & Controles</span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: VISUALIZADOR & EDITOR HEX DUMP
      ======================================================== */}
      {activeTab === 'hex-dump' && (
        <div className="space-y-6">
          {/* Controles de Entrada */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modo de Entrada:</span>
                <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                  <button
                    onClick={() => setHexInputType('text')}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                      hexInputType === 'text' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Texto UTF-8
                  </button>
                  <button
                    onClick={() => setHexInputType('hex')}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                      hexInputType === 'hex' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    String Hexadecimal
                  </button>
                  <button
                    onClick={() => setHexInputType('file')}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                      hexInputType === 'file' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Arquivo Local
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>Total: <strong>{hexBytes.length} bytes</strong></span>
                <span>•</span>
                <span>{hexDumpRows.length} linhas</span>
              </div>
            </div>

            {hexInputType === 'text' && (
              <div>
                <textarea
                  rows={3}
                  value={hexTextInput}
                  onChange={(e) => setHexTextInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
                  placeholder="Insira o texto para visualizar em hexadecimal..."
                />
              </div>
            )}

            {hexInputType === 'hex' && (
              <div>
                <textarea
                  rows={3}
                  value={hexRawInput}
                  onChange={(e) => setHexRawInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
                  placeholder="Insira bytes hexadecimais (ex: 48 65 6c 6c 6f)..."
                />
              </div>
            )}

            {hexInputType === 'file' && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/60">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo do Computador</span>
                </button>
                <div className="text-xs text-slate-400">
                  {fileName ? (
                    <span className="text-cyan-300 font-mono">Arquivo: {fileName} ({hexBytes.length} bytes carregados na RAM)</span>
                  ) : (
                    <span>Processamento 100% seguro na memória local do navegador (até 64KB)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Área de Visualização Hex Dump */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Offset (8 hex) | Bytes (0-7 e 8-15) | ASCII Preview (Clique em qualquer byte para inspecionar)
              </span>
              <button
                onClick={() => copyToClipboard(rawHexDumpText, 'hex-dump-copy')}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
              >
                {copiedKey === 'hex-dump-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Hex Dump</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs overflow-x-auto select-all max-h-[460px] overflow-y-auto space-y-1">
              <div className="text-slate-500 pb-1 border-b border-slate-800 select-none">
                Offset    00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  |ASCII Output----|
              </div>
              {hexDumpRows.map((row, idx) => (
                <div key={idx} className="flex hover:bg-slate-800/40 py-0.5 rounded px-1 transition">
                  <span className="text-slate-500 select-none w-20">{row.offset}</span>
                  <div className="text-cyan-300 w-56 flex gap-1">
                    {Array.from(row.chunk.slice(0, 8)).map((b, bIdx) => (
                      <span
                        key={bIdx}
                        onClick={() => setSelectedByteOffset(row.baseIndex + bIdx)}
                        className={`hover:bg-cyan-500/30 cursor-pointer rounded px-0.5 ${
                          selectedByteOffset === row.baseIndex + bIdx ? 'bg-cyan-500 text-slate-950 font-bold' : ''
                        }`}
                      >
                        {b.toString(16).padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-600 select-none mx-1.5"> </span>
                  <div className="text-cyan-300 w-56 flex gap-1">
                    {Array.from(row.chunk.slice(8, 16)).map((b, bIdx) => (
                      <span
                        key={bIdx}
                        onClick={() => setSelectedByteOffset(row.baseIndex + 8 + bIdx)}
                        className={`hover:bg-cyan-500/30 cursor-pointer rounded px-0.5 ${
                          selectedByteOffset === row.baseIndex + 8 + bIdx ? 'bg-cyan-500 text-slate-950 font-bold' : ''
                        }`}
                      >
                        {b.toString(16).padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-600 select-none mx-2">|</span>
                  <span className="text-emerald-400 font-mono tracking-widest">{row.ascii}</span>
                  <span className="text-slate-600 select-none ml-2">|</span>
                </div>
              ))}
            </div>

            {/* Painel de Inspeção do Byte Selecionado */}
            {selectedByteDetails && (
              <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Detalhes do Byte no Offset {selectedByteDetails.offsetHex} ({selectedByteDetails.offsetDec})
                  </span>
                  <button
                    onClick={() => setSelectedByteOffset(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    Fechar
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">HEXADECIMAL</span>
                    <span className="text-cyan-300 font-bold">{selectedByteDetails.hex}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DECIMAL (UINT8)</span>
                    <span className="text-emerald-400 font-bold">{selectedByteDetails.dec}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">BINÁRIO (8 BITS)</span>
                    <span className="text-amber-400 font-bold">{selectedByteDetails.bin}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ASCII CHAR</span>
                    <span className="text-purple-400 font-bold">{selectedByteDetails.char}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: CONVERSOR DE ENDIANNESS & TIPOS PRIMITIVOS
      ======================================================== */}
      {activeTab === 'endianness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Entrada */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Entrada de Dados (32-bit)
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => setEndianInputMode('hex')}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                    endianInputMode === 'hex'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Hexadecimal
                </button>
                <button
                  onClick={() => setEndianInputMode('decimal')}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                    endianInputMode === 'decimal'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Decimal
                </button>
              </div>

              {endianInputMode === 'hex' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor Hexadecimal</label>
                  <input
                    type="text"
                    value={endianHexInput}
                    onChange={(e) => setEndianHexInput(e.target.value)}
                    placeholder="0x12345678"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor Decimal (Uint32)</label>
                  <input
                    type="number"
                    value={endianDecInput}
                    onChange={(e) => setEndianDecInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-200">Convenções de Arquitetura:</p>
                <p>• <strong>Little Endian:</strong> Intel x86/x64, ARM (Apple Silicon, Snapdragon). O byte menos significativo (LSB) fica no menor endereço de memória.</p>
                <p>• <strong>Big Endian:</strong> Protocolos de Rede TCP/IP (Network Byte Order), mainframes IBM e antigos chips Motorola 68k.</p>
              </div>
            </div>

            {/* Comparativo de Byte Orders & Primitivos */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cards Big Endian vs Little Endian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-400">BIG ENDIAN (Network Order)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">MSB Primeiro</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white tracking-widest">
                    {endianDecodedValues.bigEndianHex}
                  </div>
                  <span className="text-xs text-slate-500 block">Ordem natural de leitura humana: bytes mais pesados à esquerda</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">LITTLE ENDIAN (x86/ARM)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">LSB Primeiro</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white tracking-widest">
                    {endianDecodedValues.littleEndianHex}
                  </div>
                  <span className="text-xs text-slate-500 block">Padrão da CPU do seu computador ao alocar em registradores</span>
                </div>
              </div>

              {/* Tabela de Decodificação Primitiva via DataView */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Valores Decodificados em Tipos C / Web (DataView)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Tipo de Dado</th>
                        <th className="p-2.5">Tamanho</th>
                        <th className="p-2.5 text-cyan-400">Big Endian</th>
                        <th className="p-2.5 text-emerald-400">Little Endian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      <tr>
                        <td className="p-2.5 text-slate-400">Int16 (com sinal)</td>
                        <td className="p-2.5 text-slate-500">2 bytes</td>
                        <td className="p-2.5">{endianDecodedValues.int16BE}</td>
                        <td className="p-2.5">{endianDecodedValues.int16LE}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Uint16 (sem sinal)</td>
                        <td className="p-2.5 text-slate-500">2 bytes</td>
                        <td className="p-2.5">{endianDecodedValues.uint16BE}</td>
                        <td className="p-2.5">{endianDecodedValues.uint16LE}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Int32 (com sinal)</td>
                        <td className="p-2.5 text-slate-500">4 bytes</td>
                        <td className="p-2.5">{endianDecodedValues.int32BE}</td>
                        <td className="p-2.5">{endianDecodedValues.int32LE}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Uint32 (sem sinal)</td>
                        <td className="p-2.5 text-slate-500">4 bytes</td>
                        <td className="p-2.5 text-cyan-300 font-bold">{endianDecodedValues.uint32BE}</td>
                        <td className="p-2.5 text-emerald-300 font-bold">{endianDecodedValues.uint32LE}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Float32 (IEEE 754)</td>
                        <td className="p-2.5 text-slate-500">4 bytes</td>
                        <td className="p-2.5">{endianDecodedValues.float32BE.toExponential(4)}</td>
                        <td className="p-2.5">{endianDecodedValues.float32LE.toExponential(4)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: DETECTOR DE MAGIC BYTES & ASSINATURAS
      ======================================================== */}
      {activeTab === 'magic-bytes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Inspeção */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Inspeção Forense de Cabeçalho
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome do Arquivo (com extensão)
                </label>
                <input
                  type="text"
                  value={magicTestFileName}
                  onChange={(e) => setMagicTestFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primeiros Bytes Hex (Magic Number)
                </label>
                <textarea
                  rows={3}
                  value={magicHexInput}
                  onChange={(e) => setMagicHexInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono resize-none"
                  placeholder="ex: 89 50 4E 47 0D 0A 1A 0A"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Ou selecione um arquivo real para inspecionar:
                </label>
                <input
                  type="file"
                  onChange={handleMagicFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Importância de Segurança:</p>
                <p className="leading-relaxed">
                  Extensões de arquivos podem ser renomeadas livremente por atacantes (ex: um vírus <code>.exe</code> renomeado para <code>.jpg</code>). Somente a validação dos <strong>Magic Bytes</strong> no cabeçalho binário garante a real identidade do arquivo.
                </p>
              </div>
            </div>

            {/* Resultados da Detecção & Alertas */}
            <div className="lg:col-span-2 space-y-4">
              {/* Alerta de Discrepância de Extensão (Spoofing) */}
              {detectedSignatures.hasExtensionMismatch && (
                <div className="bg-rose-950/20 border border-rose-800/60 p-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">Alerta de Discrepância / Falsificação Detectada!</h4>
                    <p className="text-xs text-rose-400/90 mt-1 leading-relaxed">
                      O arquivo possui a extensão <code>.{detectedSignatures.fileExt}</code>, mas a assinatura binária de cabeçalho corresponde a <strong>{detectedSignatures.matched.map(m => m.name).join(', ')}</strong>. Este padrão é comumente empregado em técnicas de evasão de antivírus ou uploads maliciosos.
                    </p>
                  </div>
                </div>
              )}

              {/* Assinaturas Reconhecidas */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Assinaturas Binárias Identificadas ({detectedSignatures.matched.length})
                </h4>

                {detectedSignatures.matched.length > 0 ? (
                  <div className="space-y-3">
                    {detectedSignatures.matched.map((sig, idx) => (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-cyan-300">{sig.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {sig.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{sig.description}</p>
                        <div className="flex items-center gap-4 text-xs font-mono pt-1 border-t border-slate-800/60">
                          <span className="text-slate-500">Magic Hex: <strong className="text-cyan-400">{sig.magicHex.toUpperCase()}</strong></span>
                          <span className="text-slate-500">Extensões Válidas: <strong className="text-emerald-400">{sig.ext.map(e => `.${e}`).join(', ')}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    Nenhuma assinatura padrão reconhecida para a sequência fornecida.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: CALCULADORA BITWISE & OPERAÇÕES LÓGICAS EM BUFFERS
      ======================================================== */}
      {activeTab === 'bitwise-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Entradas dos Operandos */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Operandos (32-bit Integers)
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operando A (Hex ou Decimal)
                </label>
                <input
                  type="text"
                  value={bitOpA}
                  onChange={(e) => setBitOpA(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                  Dec: {bitwiseResults.numA} • 1s (Hamming): {bitwiseResults.hammingA}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operando B (Hex ou Decimal)
                </label>
                <input
                  type="text"
                  value={bitOpB}
                  onChange={(e) => setBitOpB(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                  Dec: {bitwiseResults.numB} • 1s (Hamming): {bitwiseResults.hammingB}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bits de Deslocamento (Shift Amount N)
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={bitShiftAmount}
                  onChange={(e) => setBitShiftAmount(Math.min(31, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Tabela de Resultados Bitwise */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Operações Lógicas Bit a Bit
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  {/* AND */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">A AND B (&amp;)</span>
                      <span className="text-slate-400">{bitwiseResults.and.hex}</span>
                    </div>
                    <div className="text-slate-300 break-all">{bitwiseResults.and.bin}</div>
                  </div>

                  {/* OR */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">A OR B (|)</span>
                      <span className="text-slate-400">{bitwiseResults.or.hex}</span>
                    </div>
                    <div className="text-slate-300 break-all">{bitwiseResults.or.bin}</div>
                  </div>

                  {/* XOR */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">A XOR B (^)</span>
                      <span className="text-slate-400">{bitwiseResults.xor.hex}</span>
                    </div>
                    <div className="text-slate-300 break-all">{bitwiseResults.xor.bin}</div>
                  </div>

                  {/* NOT A */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">NOT A (~)</span>
                      <span className="text-slate-400">{bitwiseResults.notA.hex}</span>
                    </div>
                    <div className="text-slate-300 break-all">{bitwiseResults.notA.bin}</div>
                  </div>

                  {/* Shift Left */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold">A &lt;&lt; {bitShiftAmount} (Shift Left)</span>
                      <span className="text-slate-400">{bitwiseResults.shiftLeft.hex}</span>
                    </div>
                    <div className="text-slate-300 break-all">{bitwiseResults.shiftLeft.bin}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: TABELA E INSPETOR DE CARACTERES ASCII / ANSI
      ======================================================== */}
      {activeTab === 'ascii-inspector' && (
        <div className="space-y-6">
          {/* Controles e Filtros */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por char, dec ou hex..."
                value={asciiSearchQuery}
                onChange={(e) => setAsciiSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedAsciiCategory('all')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  selectedAsciiCategory === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Todos (0-127)
              </button>
              <button
                onClick={() => setSelectedAsciiCategory('control')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  selectedAsciiCategory === 'control' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Códigos de Controle
              </button>
              <button
                onClick={() => setSelectedAsciiCategory('printable')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  selectedAsciiCategory === 'printable' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Imprimíveis (32-126)
              </button>
            </div>
          </div>

          {/* Tabela ASCII */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Dec</th>
                    <th className="p-2.5">Hex</th>
                    <th className="p-2.5">Oct</th>
                    <th className="p-2.5">Binário</th>
                    <th className="p-2.5">Caractere / Código</th>
                    <th className="p-2.5">Significado / Uso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredAscii.map((item) => (
                    <tr key={item.dec} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-400">{item.dec}</td>
                      <td className="p-2.5 text-cyan-400">{item.hex}</td>
                      <td className="p-2.5 text-slate-500">{item.oct}</td>
                      <td className="p-2.5 text-slate-500">{item.bin}</td>
                      <td className="p-2.5">
                        {item.isControl ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.char}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-sm px-1">
                            {item.char}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400 text-[11px]">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
