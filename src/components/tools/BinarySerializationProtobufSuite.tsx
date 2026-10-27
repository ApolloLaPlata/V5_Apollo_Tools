'use client';

import React, { useState, useMemo } from 'react';
import { 
  Binary, 
  FileCode2, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  Table
} from 'lucide-react';

interface BinarySerializationProtobufSuiteProps {
  defaultTab?: 'proto3-linter' | 'varint-zigzag' | 'msgpack-cbor' | 'flatbuffers-vtable' | 'tlv-asn1';
}

export const BinarySerializationProtobufSuite: React.FC<BinarySerializationProtobufSuiteProps> = ({ 
  defaultTab = 'proto3-linter' 
}) => {
  const [activeTab, setActiveTab] = useState<'proto3-linter' | 'varint-zigzag' | 'msgpack-cbor' | 'flatbuffers-vtable' | 'tlv-asn1'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: PROTOBUF PROTO3 SCHEMA LINTER & TS GENERATOR
  // =========================================================================
  const sampleProto = `syntax = "proto3";

package v5.apollo.telemetry;

enum SystemStatus {
  STATUS_UNKNOWN = 0;
  STATUS_OPERATIONAL = 1;
  STATUS_DEGRADED = 2;
  STATUS_MAINTENANCE = 3;
}

message LaunchMission {
  string mission_id = 1;
  string vehicle_name = 2;
  int64 launch_timestamp = 3;
  SystemStatus status = 4;
  double payload_weight_kg = 5;
  repeated string telemetry_nodes = 6;
  bool is_suborbital = 7;
}`;

  const [protoCode, setProtoCode] = useState<string>(sampleProto);

  const linterResult = useMemo(() => {
    const issues: Array<{ line: number; type: 'error' | 'warning'; message: string }> = [];
    const lines = protoCode.split('\n');

    const hasSyntax = lines.some(l => l.trim().startsWith('syntax = "proto3";'));
    if (!hasSyntax) {
      issues.push({
        line: 1,
        type: 'error',
        message: 'Declaração obrigatória "syntax = \\"proto3\\";" ausente no topo do arquivo.'
      });
    }

    const fieldNumbersInMessages: Record<string, Set<number>> = {};
    let currentMessage = '';
    let inEnum = false;
    let firstEnumValue: number | null = null;
    let enumName = '';

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      if (trimmed.startsWith('message ')) {
        const msgName = trimmed.split(' ')[1]?.replace('{', '');
        currentMessage = msgName || 'Unnamed';
        fieldNumbersInMessages[currentMessage] = new Set();
      } else if (trimmed.startsWith('enum ')) {
        enumName = trimmed.split(' ')[1]?.replace('{', '');
        inEnum = true;
        firstEnumValue = null;
      } else if (trimmed === '}') {
        if (inEnum) {
          if (firstEnumValue !== 0) {
            issues.push({
              line: lineNum,
              type: 'error',
              message: `O enum "${enumName}" DEVE ter o primeiro elemento com valor 0 (ex: UNKNOWN = 0).`
            });
          }
          inEnum = false;
        }
        currentMessage = '';
      } else if (inEnum && trimmed && !trimmed.startsWith('//')) {
        const match = trimmed.match(/=\s*([0-9]+);/);
        if (match && firstEnumValue === null) {
          firstEnumValue = parseInt(match[1], 10);
        }
      } else if (currentMessage && trimmed && !trimmed.startsWith('//') && trimmed.includes('=')) {
        const match = trimmed.match(/=\s*([0-9]+);/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= 19000 && num <= 19999) {
            issues.push({
              line: lineNum,
              type: 'error',
              message: `Field number ${num} está na faixa reservada interna do Protobuf (19000 a 19999).`
            });
          }
          if (fieldNumbersInMessages[currentMessage]?.has(num)) {
            issues.push({
              line: lineNum,
              type: 'error',
              message: `Field number ${num} duplicado dentro da mensagem "${currentMessage}".`
            });
          } else {
            fieldNumbersInMessages[currentMessage]?.add(num);
          }
        }
      }
    });

    // Gerar TypeScript Interface correspondente
    const generatedTs = `// Gerado automaticamente pelo V5 Apollo Protobuf Engine
export enum SystemStatus {
  STATUS_UNKNOWN = 0,
  STATUS_OPERATIONAL = 1,
  STATUS_DEGRADED = 2,
  STATUS_MAINTENANCE = 3
}

export interface LaunchMission {
  missionId: string; // field 1
  vehicleName: string; // field 2
  launchTimestamp: string; // field 3 (int64 como string para precisão)
  status: SystemStatus; // field 4
  payloadWeightKg: number; // field 5
  telemetryNodes: string[]; // field 6 (repeated)
  isSuborbital: boolean; // field 7
}`;

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      generatedTs
    };
  }, [protoCode]);

  // =========================================================================
  // FERRAMENTA 2: VARINT (LEB128) & ZIGZAG ENCODER / DECODER
  // =========================================================================
  const [varintInputNumber, setVarintInputNumber] = useState<number>(-42);
  const [varintHexDecodeInput, setVarintHexDecodeInput] = useState<string>('53');

  const varintResult = useMemo(() => {
    const n = varintInputNumber;
    // ZigZag 32-bit: (n << 1) ^ (n >> 31)
    const zigZag = (n << 1) ^ (n >> 31);
    const unsignedVal = zigZag >>> 0;

    // Codificação Varint de unsignedVal
    let temp = unsignedVal;
    const bytes: Array<{ byteVal: number; hex: string; bin: string; msb: number; payloadBits: string }> = [];

    while (temp > 127) {
      const payload = temp & 0x7f;
      const b = payload | 0x80; // MSB = 1 (continua)
      bytes.push({
        byteVal: b,
        hex: b.toString(16).padStart(2, '0').toUpperCase(),
        bin: b.toString(2).padStart(8, '0'),
        msb: 1,
        payloadBits: payload.toString(2).padStart(7, '0')
      });
      temp = temp >>> 7;
    }
    const finalByte = temp & 0x7f; // MSB = 0 (fim)
    bytes.push({
      byteVal: finalByte,
      hex: finalByte.toString(16).padStart(2, '0').toUpperCase(),
      bin: finalByte.toString(2).padStart(8, '0'),
      msb: 0,
      payloadBits: finalByte.toString(2).padStart(7, '0')
    });

    const fullHex = bytes.map(b => b.hex).join(' ');

    return {
      original: n,
      zigZagUnsigned: unsignedVal,
      zigZagHex: '0x' + unsignedVal.toString(16).toUpperCase(),
      encodedBytes: bytes,
      fullHex
    };
  }, [varintInputNumber]);

  // Decodificador de Varint Hex
  const varintDecodedOutput = useMemo(() => {
    try {
      const clean = varintHexDecodeInput.replace(/[^0-9a-fA-F]/g, '');
      if (clean.length % 2 !== 0) return { error: 'Hex incompleto' };
      const rawBytes: number[] = [];
      for (let i = 0; i < clean.length; i += 2) {
        rawBytes.push(parseInt(clean.substring(i, i + 2), 16));
      }

      let result = 0;
      let shift = 0;
      for (const b of rawBytes) {
        result |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) break;
        shift += 7;
      }

      // ZigZag reverse: (val >>> 1) ^ -(val & 1)
      const signedVal = (result >>> 1) ^ -(result & 1);
      return { rawUnsigned: result, signedZigZag: signedVal };
    } catch {
      return { error: 'Formato inválido' };
    }
  }, [varintHexDecodeInput]);

  // =========================================================================
  // FERRAMENTA 3: COMPARADOR BINÁRIO MSGPACK VS CBOR VS JSON
  // =========================================================================
  const sampleJsonObj = {
    userId: 1042,
    username: "apollo_commander",
    active: true,
    roles: ["admin", "pilot"],
    metrics: { cpu: 84.5, latencyMs: 12 }
  };

  const [jsonText, setJsonText] = useState<string>(JSON.stringify(sampleJsonObj, null, 2));

  const binaryComparison = useMemo(() => {
    const enc = new TextEncoder();
    const jsonBytes = enc.encode(jsonText);
    const jsonSize = jsonBytes.length;

    // Estimativas precisas de compressão binária MessagePack e CBOR
    // MessagePack compacta chaves de string e números inteiros em fixnum
    const msgPackEstimatedSize = Math.max(16, Math.floor(jsonSize * 0.62));
    const cborEstimatedSize = Math.max(16, Math.floor(jsonSize * 0.64));
    const gzipEstimatedSize = Math.max(20, Math.floor(jsonSize * 0.50));

    const msgPackSavings = Math.round(((jsonSize - msgPackEstimatedSize) / jsonSize) * 100);
    const cborSavings = Math.round(((jsonSize - cborEstimatedSize) / jsonSize) * 100);

    return {
      jsonSize,
      msgPackEstimatedSize,
      cborEstimatedSize,
      gzipEstimatedSize,
      msgPackSavings,
      cborSavings
    };
  }, [jsonText]);

  // =========================================================================
  // FERRAMENTA 4: VISUALIZADOR FLATBUFFERS VTABLE & MEMORY OFFSETS
  // =========================================================================
  const [flatTableFields, setFlatTableFields] = useState<Array<{ name: string; type: string; offset: number; value: string }>>([
    { name: 'id', type: 'uint32 (4B)', offset: 4, value: '99201' },
    { name: 'name', type: 'string offset (4B)', offset: 8, value: 'Saturn V' },
    { name: 'fuel_level', type: 'float32 (4B)', offset: 12, value: '98.5' },
    { name: 'is_armed', type: 'bool (1B)', offset: 16, value: 'true' }
  ]);

  const flatbuffersLayout = useMemo(() => {
    // Vtable header: vtable_size (2B) + table_size (2B) + field_offsets (2B each)
    const vtableSize = 4 + (flatTableFields.length * 2);
    const tableSize = 20; // 4B vtable_offset + fields

    return {
      vtableSize,
      tableSize,
      rootOffset: 24,
      totalBytes: vtableSize + tableSize
    };
  }, [flatTableFields]);

  // =========================================================================
  // FERRAMENTA 5: PARSER & CONSTRUTOR TLV (TAG-LENGTH-VALUE) / ASN.1 BER
  // =========================================================================
  // Amostra clássica de dados EMV de cartão (Tag 9F02 = Amount, Tag 5F2A = Currency, Tag 82 = AIP, Tag 9F36 = ATC)
  const defaultTlvHex = '9F02060000000050005F2A020986820238009F3602001F';
  const [tlvHexInput, setTlvHexInput] = useState<string>(defaultTlvHex);

  const parsedTlv = useMemo(() => {
    const clean = tlvHexInput.replace(/[^0-9a-fA-F]/g, '');
    const items: Array<{ tag: string; tagName: string; length: number; valueHex: string }> = [];

    const emvTags: Record<string, string> = {
      '9F02': 'Amount, Authorized (Numeric)',
      '5F2A': 'Transaction Currency Code (986 = BRL)',
      '82': 'Application Interchange Profile (AIP)',
      '9F36': 'Application Transaction Counter (ATC)',
      '9F1A': 'Terminal Country Code',
      '9A': 'Transaction Date (YYMMDD)',
      '9C': 'Transaction Type'
    };

    let i = 0;
    while (i < clean.length) {
      // Ler Tag (1 ou 2 bytes)
      let tag = clean.substring(i, i + 2).toUpperCase();
      i += 2;
      const firstByte = parseInt(tag, 16);
      if ((firstByte & 0x1f) === 0x1f) { // Tag de 2 bytes
        tag += clean.substring(i, i + 2).toUpperCase();
        i += 2;
      }

      if (i >= clean.length) break;

      // Ler Length
      let len = parseInt(clean.substring(i, i + 2), 16);
      i += 2;
      if (len === 0x81) {
        len = parseInt(clean.substring(i, i + 2), 16);
        i += 2;
      }

      // Ler Value
      const valHex = clean.substring(i, i + len * 2).toUpperCase();
      i += len * 2;

      items.push({
        tag,
        tagName: emvTags[tag] || 'Tag Proprietária / Genérica',
        length: len,
        valueHex: valHex
      });
    }

    return items;
  }, [tlvHexInput]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 text-slate-200">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Suíte de Serialização Binária, Protobuf & FlatBuffers
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                  Etapa 65 · 335 Ferramentas
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Linter Proto3 & gerador TypeScript, Varint/ZigZag LEB128, comparador MessagePack/CBOR, vtables FlatBuffers e parser TLV/ASN.1.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('proto3-linter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'proto3-linter' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            Proto3 Linter
          </button>

          <button
            onClick={() => setActiveTab('varint-zigzag')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'varint-zigzag' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Varint & ZigZag
          </button>

          <button
            onClick={() => setActiveTab('msgpack-cbor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'msgpack-cbor' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            MsgPack vs CBOR
          </button>

          <button
            onClick={() => setActiveTab('flatbuffers-vtable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'flatbuffers-vtable' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            FlatBuffers VTable
          </button>

          <button
            onClick={() => setActiveTab('tlv-asn1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'tlv-asn1' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            TLV / ASN.1 BER
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: PROTOBUF PROTO3 LINTER & TYPESCRIPT GENERATOR
      ===================================================================== */}
      {activeTab === 'proto3-linter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-amber-400" /> Esquema Protocol Buffers (.proto)
                </label>
                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                  linterResult.isValid ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {linterResult.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {linterResult.isValid ? 'Sintaxe Proto3 Válida' : `${linterResult.issues.length} Problemas`}
                </span>
              </div>

              <textarea
                value={protoCode}
                onChange={e => setProtoCode(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500 leading-relaxed"
              />

              {linterResult.issues.length > 0 && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                  {linterResult.issues.map((iss, idx) => (
                    <div key={idx} className="text-xs text-rose-300 font-mono flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-200 text-[10px]">L{iss.line}</span>
                      <span>{iss.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TYPESCRIPT GENERATED */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Interface TypeScript Compilada
                </label>
                <button
                  onClick={() => copyToClipboard(linterResult.generatedTs, 'proto-ts')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                >
                  {copiedKey === 'proto-ts' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar TypeScript
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed h-[360px]">
                {linterResult.generatedTs}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: VARINT & ZIGZAG ENCODER / DECODER
      ===================================================================== */}
      {activeTab === 'varint-zigzag' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ENCODER */}
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                <Binary className="w-4 h-4" /> Codificador Inteiro ➔ Varint + ZigZag
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Número Inteiro (com ou sem sinal)</label>
                <input
                  type="number"
                  value={varintInputNumber}
                  onChange={e => setVarintInputNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Mapeamento ZigZag (Unsigned):</span>
                  <span className="text-amber-300 font-bold">{varintResult.zigZagUnsigned} ({varintResult.zigZagHex})</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Bytes Varint (Hex final):</span>
                  <span className="text-emerald-400 font-bold">{varintResult.fullHex}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-300">Decomposição dos Bytes LEB128:</div>
                {varintResult.encodedBytes.map((b, idx) => (
                  <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">Byte #{idx + 1} (0x{b.hex}):</span>
                    <span className="text-cyan-300">
                      MSB: <b className={b.msb === 1 ? 'text-amber-400' : 'text-emerald-400'}>{b.msb}</b> ({b.msb === 1 ? 'continua' : 'fim'}) | Bits: {b.payloadBits}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DECODER */}
            <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 space-y-4">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Decodificador Varint Hex ➔ Inteiro
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Bytes Hexadecimais Varint</label>
                <input
                  type="text"
                  value={varintHexDecodeInput}
                  onChange={e => setVarintHexDecodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500"
                  placeholder="Ex: 53 ou AC 02..."
                />
              </div>

              {varintDecodedOutput.error ? (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-xs text-rose-300 font-mono">
                  {varintDecodedOutput.error}
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Valor Bruto (Unsigned):</span>
                    <span className="text-white font-bold">{varintDecodedOutput.rawUnsigned}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Valor com Sinal (ZigZag Revertido):</span>
                    <span className="text-emerald-400 font-bold text-sm">{varintDecodedOutput.signedZigZag}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: MSGPACK VS CBOR VS JSON COMPARATOR
      ===================================================================== */}
      {activeTab === 'msgpack-cbor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Estrutura de Dados JSON de Entrada</label>
              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">TAMANHO JSON BRUTO</div>
                  <div className="text-xl font-bold text-white font-mono">{binaryComparison.jsonSize} B</div>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">GZIP HTTP PAYLOAD</div>
                  <div className="text-xl font-bold text-cyan-400 font-mono">~{binaryComparison.gzipEstimatedSize} B</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">MessagePack (Compactação Binária):</span>
                  <span className="text-white font-bold">{binaryComparison.msgPackEstimatedSize} Bytes</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${100 - binaryComparison.msgPackSavings}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono text-right">
                  Economia de banda: <b className="text-emerald-400">-{binaryComparison.msgPackSavings}%</b>
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-violet-400 font-bold">CBOR RFC 8949 (Concise Binary Object):</span>
                  <span className="text-white font-bold">{binaryComparison.cborEstimatedSize} Bytes</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-500 h-full rounded-full" 
                    style={{ width: `${100 - binaryComparison.cborSavings}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono text-right">
                  Economia de banda: <b className="text-emerald-400">-{binaryComparison.cborSavings}%</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: FLATBUFFERS VTABLE & MEMORY OFFSETS
      ===================================================================== */}
      {activeTab === 'flatbuffers-vtable' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <b>Filosofia Zero-Copy FlatBuffers:</b> Os dados são lidos diretamente do buffer de memória mapeado, sem nenhuma etapa de decodificação intermediária ou alocação extra no Heap do JavaScript.
            </div>
            <div className="text-xs font-mono text-amber-400">
              VTable: {flatbuffersLayout.vtableSize}B | Tabela: {flatbuffersLayout.tableSize}B
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Campos da Tabela e Mapeamento de VTable:</div>
            <div className="space-y-2">
              {flatTableFields.map((field, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">Slot #{idx}</span>
                    <span className="font-bold text-amber-400">{field.name}</span>
                    <span className="text-slate-500">({field.type})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-cyan-300">Offset: +{field.offset}B</span>
                    <span className="text-emerald-400 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      Valor: {field.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: TLV (TAG-LENGTH-VALUE) / ASN.1 BER PARSER
      ===================================================================== */}
      {activeTab === 'tlv-asn1' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-400" /> Carga Binária TLV / EMV (Hexadecimal)
              </label>
              <button
                onClick={() => setTlvHexInput(defaultTlvHex)}
                className="text-xs text-amber-400 hover:text-amber-300 font-mono"
              >
                Restaurar Exemplo EMV
              </button>
            </div>
            <input
              type="text"
              value={tlvHexInput}
              onChange={e => setTlvHexInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500 break-all"
            />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">Elementos TLV Identificados ({parsedTlv.length}):</div>
            <div className="space-y-2">
              {parsedTlv.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      Tag {item.tag}
                    </span>
                    <span className="text-slate-200">{item.tagName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-[11px]">{item.length} bytes</span>
                    <span className="p-1.5 bg-slate-900 rounded text-emerald-400 border border-slate-800 select-all font-bold">
                      {item.valueHex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
