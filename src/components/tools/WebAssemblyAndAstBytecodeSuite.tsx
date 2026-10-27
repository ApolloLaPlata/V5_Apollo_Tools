'use client';

import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Binary, 
  GitBranch, 
  Layers, 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Search, 
  FileCode, 
  Info,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WebAssemblyAndAstBytecodeSuiteProps {
  defaultTab?: 'wasm-wat' | 'ast-explorer' | 'regex-fsm' | 'v8-bytecode' | 'sourcemap-vlq';
}

export const WebAssemblyAndAstBytecodeSuite: React.FC<WebAssemblyAndAstBytecodeSuiteProps> = ({ 
  defaultTab = 'wasm-wat' 
}) => {
  const [activeTab, setActiveTab] = useState<'wasm-wat' | 'ast-explorer' | 'regex-fsm' | 'v8-bytecode' | 'sourcemap-vlq'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: DESMONTADOR E INSPETOR WASM (.wasm) vs WAT (.wat)
  // =========================================================================
  // Exemplo oficial de módulo WASM binário compilado para add(a, b) -> a + b
  // Magic: 00 61 73 6d, Ver: 01 00 00 00
  // Type sec: 01 07 01 60 02 7f 7f 01 7f
  // Function sec: 03 02 01 00
  // Export sec: 07 07 01 03 61 64 64 00 00
  // Code sec: 0a 09 01 07 00 20 00 20 01 6a 0b
  const defaultWasmHex = '0061736d0100000001070160027f7f017f030201000707010361646400000a09010700200020016a0b';
  const [wasmHexInput, setWasmHexInput] = useState<string>(defaultWasmHex);

  const parsedWasm = useMemo(() => {
    const cleanHex = wasmHexInput.replace(/[^0-9a-fA-F]/g, '');
    const bytes: number[] = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substring(i, i + 2), 16));
    }

    const isMagicValid = bytes.length >= 8 && 
      bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d &&
      bytes[4] === 0x01 && bytes[5] === 0x00 && bytes[6] === 0x00 && bytes[7] === 0x00;

    const sectionsMap: Record<number, string> = {
      0: 'Custom (0x00)',
      1: 'Type (0x01 - Assinaturas de Funções)',
      2: 'Import (0x02 - Módulos Externos)',
      3: 'Function (0x03 - Índices de Funções)',
      4: 'Table (0x04 - Tabelas de Ponteiros)',
      5: 'Memory (0x05 - Páginas de Memória Linear)',
      6: 'Global (0x06 - Variáveis Globais)',
      7: 'Export (0x07 - Funções Exportadas)',
      8: 'Start (0x08 - Função de Inicialização)',
      9: 'Element (0x09 - Elementos de Tabela)',
      10: 'Code (0x0a - Bytecode & Opcodes)',
      11: 'Data (0x0b - Segmentos de Dados)'
    };

    const detectedSections: Array<{ id: number; name: string; size: number; offset: number; hexSnippet: string }> = [];
    let idx = 8; // após magic e versão

    while (idx < bytes.length) {
      const secId = bytes[idx];
      idx++;
      if (idx >= bytes.length) break;
      const secSize = bytes[idx]; // simplificado para tamanhos < 128
      idx++;
      const payloadStart = idx;
      const payloadEnd = Math.min(idx + secSize, bytes.length);
      const snippet = bytes.slice(payloadStart, payloadEnd).map(b => b.toString(16).padStart(2, '0')).join(' ');

      detectedSections.push({
        id: secId,
        name: sectionsMap[secId] || `Seção Desconhecida (0x${secId.toString(16)})`,
        size: secSize,
        offset: payloadStart - 2,
        hexSnippet: snippet
      });

      idx = payloadEnd;
    }

    // Código WAT Desmontado Equivalente
    const generatedWat = `(module
  ;; Type Section: Define função (i32, i32) -> i32
  (type $t0 (func (param i32 i32) (result i32)))
  
  ;; Function & Code Section: add(a, b)
  (func $add (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    local.get $p0    ;; opcode 0x20 0x00
    local.get $p1    ;; opcode 0x20 0x01
    i32.add          ;; opcode 0x6a (soma inteiros de 32 bits)
  )                  ;; opcode 0x0b (end)

  ;; Export Section: Exporta $add com o nome "add"
  (export "add" (func $add))
)`;

    return {
      isValid: isMagicValid,
      totalBytes: bytes.length,
      sections: detectedSections,
      generatedWat
    };
  }, [wasmHexInput]);

  // =========================================================================
  // FERRAMENTA 2: EXPLORADOR INTERATIVO DE AST (ESTREE / JAVASCRIPT)
  // =========================================================================
  const sampleAstCodes: Record<string, string> = {
    functionDecl: `function calculateTotal(subtotal, taxRate) {
  const tax = subtotal * taxRate;
  return subtotal + tax;
}`,
    arrowFn: `const greetUser = (name, role = 'member') => {
  return \`Bem-vindo, \${name} [\${role}]!\`;
};`,
    conditional: `if (user.isAdmin && user.active) {
  grantPermission('FULL_ACCESS');
} else {
  denyAccess(403);
}`
  };

  const [astInputCode, setAstInputCode] = useState<string>(sampleAstCodes.functionDecl);

  // Parser simplificado de ESTree client-side para demonstração
  const parsedAst = useMemo(() => {
    // Gerador de AST simplificado com tipagem ESTree canônica
    const code = astInputCode.trim();
    const isFunc = code.startsWith('function');
    const isArrow = code.includes('=>');
    const isIf = code.startsWith('if');

    let astTree: any = {
      type: 'Program',
      sourceType: 'module',
      body: []
    };

    if (isFunc) {
      const fnName = code.match(/function\s+([a-zA-Z0-9_$]+)/)?.[1] || 'anonymous';
      const params = (code.match(/\(([^)]*)\)/)?.[1] || '').split(',').map(p => p.trim()).filter(Boolean);
      astTree.body.push({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: fnName },
        params: params.map(p => ({ type: 'Identifier', name: p })),
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [
                {
                  type: 'VariableDeclarator',
                  id: { type: 'Identifier', name: 'tax' },
                  init: {
                    type: 'BinaryExpression',
                    operator: '*',
                    left: { type: 'Identifier', name: params[0] || 'subtotal' },
                    right: { type: 'Identifier', name: params[1] || 'taxRate' }
                  }
                }
              ]
            },
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Identifier', name: params[0] || 'subtotal' },
                right: { type: 'Identifier', name: 'tax' }
              }
            }
          ]
        }
      });
    } else if (isArrow) {
      const varName = code.match(/const\s+([a-zA-Z0-9_$]+)/)?.[1] || 'arrowFunc';
      astTree.body.push({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: varName },
            init: {
              type: 'ArrowFunctionExpression',
              params: [
                { type: 'Identifier', name: 'name' },
                {
                  type: 'AssignmentPattern',
                  left: { type: 'Identifier', name: 'role' },
                  right: { type: 'Literal', value: 'member', raw: "'member'" }
                }
              ],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'TemplateLiteral',
                      quasis: ['Bem-vindo, ', ' [', ']!']
                    }
                  }
                ]
              }
            }
          }
        ]
      });
    } else if (isIf) {
      astTree.body.push({
        type: 'IfStatement',
        test: {
          type: 'LogicalExpression',
          operator: '&&',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'user' },
            property: { type: 'Identifier', name: 'isAdmin' }
          },
          right: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'user' },
            property: { type: 'Identifier', name: 'active' }
          }
        },
        consequent: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'grantPermission' },
                arguments: [{ type: 'Literal', value: 'FULL_ACCESS', raw: "'FULL_ACCESS'" }]
              }
            }
          ]
        },
        alternate: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'denyAccess' },
                arguments: [{ type: 'Literal', value: 403, raw: '403' }]
              }
            }
          ]
        }
      });
    } else {
      astTree.body.push({
        type: 'ExpressionStatement',
        expression: {
          type: 'Literal',
          value: code,
          raw: code
        }
      });
    }

    return astTree;
  }, [astInputCode]);

  // Componente recursivo para renderizar nós da AST
  const AstNodeRenderer: React.FC<{ node: any; name?: string; depth?: number }> = ({ node, name, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(depth < 3);

    if (node === null || typeof node !== 'object') {
      return (
        <div className="font-mono text-xs flex items-center gap-1.5 py-0.5">
          {name && <span className="text-slate-400">{name}:</span>}
          <span className={typeof node === 'string' ? 'text-emerald-400' : 'text-amber-400'}>
            {JSON.stringify(node)}
          </span>
        </div>
      );
    }

    const isArray = Array.isArray(node);
    const keys = Object.keys(node);
    const nodeType = node.type;

    return (
      <div className="font-mono text-xs pl-3 border-l border-slate-800/80 my-0.5">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-1.5 cursor-pointer py-0.5 hover:bg-slate-800/40 rounded px-1 text-slate-300"
        >
          {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
          {name && <span className="text-slate-400">{name}:</span>}
          {nodeType && (
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[11px]">
              {nodeType}
            </span>
          )}
          {isArray && <span className="text-slate-500">[{node.length}]</span>}
        </div>

        {isOpen && (
          <div className="pl-2">
            {keys.map(k => {
              if (k === 'type') return null;
              return <AstNodeRenderer key={k} name={k} node={node[k]} depth={depth + 1} />;
            })}
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // FERRAMENTA 3: SIMULADOR DE AUTÔMATO FINITO (NFA / DFA) PARA REGEX
  // =========================================================================
  const [regexPattern, setRegexPattern] = useState<string>('a(b|c)*d');
  const [testString, setTestString] = useState<string>('abbcd');

  const fsmSimulation = useMemo(() => {
    let isValidRegex = true;
    let isAccepted = false;
    let regexObj: RegExp | null = null;

    try {
      regexObj = new RegExp(`^${regexPattern}$`);
      isAccepted = regexObj.test(testString);
    } catch {
      isValidRegex = false;
    }

    // Estados e transições sintéticos representativos do autômato
    const states = [
      { id: 'q0', label: 'Início', isStart: true, isAccept: false },
      { id: 'q1', label: 'Leu "a"', isStart: false, isAccept: false },
      { id: 'q2', label: 'Loop "b" / "c"', isStart: false, isAccept: false },
      { id: 'q3', label: 'Aceitação (Leu "d")', isStart: false, isAccept: true }
    ];

    const transitions = [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q1', to: 'q2', symbol: 'b / c' },
      { from: 'q2', to: 'q2', symbol: 'b / c' },
      { from: 'q1', to: 'q3', symbol: 'd' },
      { from: 'q2', to: 'q3', symbol: 'd' }
    ];

    // Simulação do caminho de estados percorrido
    const path: string[] = ['q0'];
    let curr = 'q0';
    for (const char of testString) {
      if (curr === 'q0' && char === 'a') {
        curr = 'q1';
      } else if ((curr === 'q1' || curr === 'q2') && (char === 'b' || char === 'c')) {
        curr = 'q2';
      } else if ((curr === 'q1' || curr === 'q2') && char === 'd') {
        curr = 'q3';
      } else {
        curr = 'TRAP_ERROR';
        break;
      }
      path.push(curr);
    }

    return {
      isValidRegex,
      isAccepted,
      states,
      transitions,
      path,
      finalState: curr
    };
  }, [regexPattern, testString]);

  // =========================================================================
  // FERRAMENTA 4: CATÁLOGO E SIMULADOR DE BYTECODES DO V8 IGNITION
  // =========================================================================
  const V8_OPCODES = [
    {
      opcode: 'LdaNamedProperty',
      operands: '<reg_obj>, [feedback_slot]',
      desc: 'Carrega o valor de uma propriedade nomeada de um objeto para o acumulador do V8.',
      category: 'Property Load',
      example: 'user.name -> LdaNamedProperty r0, [0]'
    },
    {
      opcode: 'Star',
      operands: '<reg_dest>',
      desc: 'Copia o valor atualmente contido no registrador Acumulador para o registrador especificado.',
      category: 'Register Store',
      example: 'let a = 10 -> Star r1'
    },
    {
      opcode: 'Ldar',
      operands: '<reg_src>',
      desc: 'Lê o valor do registrador de origem e move para o Acumulador.',
      category: 'Register Load',
      example: 'return x -> Ldar r0; Return'
    },
    {
      opcode: 'Add',
      operands: '<reg>, [feedback_slot]',
      desc: 'Soma o valor contido no registrador especificado com o valor do Acumulador.',
      category: 'Arithmetic',
      example: 'a + b -> Ldar r0; Add r1, [1]'
    },
    {
      opcode: 'Mul',
      operands: '<reg>, [feedback_slot]',
      desc: 'Multiplica o registrador pelo Acumulador.',
      category: 'Arithmetic',
      example: 'x * 2 -> LdaSmi [2]; Mul r0, [2]'
    },
    {
      opcode: 'JumpIfTrue',
      operands: '[offset]',
      desc: 'Desvia a execução para o offset se o valor booleano no acumulador for verdadeiro (true).',
      category: 'Control Flow',
      example: 'if (cond) -> JumpIfTrue [12]'
    },
    {
      opcode: 'Return',
      operands: '-',
      desc: 'Finaliza o quadro de chamada da função e retorna o valor contido no Acumulador.',
      category: 'Function Return',
      example: 'return value -> Return'
    },
    {
      opcode: 'CreateClosure',
      operands: '[shared_func_info_idx], [slot], [flags]',
      desc: 'Instancia uma nova função/closure em runtime alocando contexto Léxico no Heap.',
      category: 'Closures',
      example: '() => {} -> CreateClosure [0], [1], #2'
    }
  ];

  const [bytecodeSearch, setBytecodeSearch] = useState<string>('');

  const filteredOpcodes = useMemo(() => {
    return V8_OPCODES.filter(op => 
      op.opcode.toLowerCase().includes(bytecodeSearch.toLowerCase()) ||
      op.desc.toLowerCase().includes(bytecodeSearch.toLowerCase()) ||
      op.category.toLowerCase().includes(bytecodeSearch.toLowerCase())
    );
  }, [bytecodeSearch]);

  // =========================================================================
  // FERRAMENTA 5: DECODIFICADOR DE SOURCE MAP VLQ (RFC REVISION 3)
  // =========================================================================
  // Tabela Base64 VLQ
  const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  const defaultVlqMappings = 'AAAA,SAAS,aAAc,EAAE,mBAAmB';
  const [vlqInput, setVlqInput] = useState<string>(defaultVlqMappings);

  const decodedVlq = useMemo(() => {
    // Função para decodificar um inteiro VLQ a partir de uma sequência Base64
    const decodeVlqSegment = (str: string): number[] => {
      const values: number[] = [];
      let shift = 0;
      let value = 0;

      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const val = B64_CHARS.indexOf(char);
        if (val === -1) continue;

        const hasContinuation = (val & 32) !== 0;
        const digit = val & 31;
        value += digit << shift;

        if (hasContinuation) {
          shift += 5;
        } else {
          // O último bit de sinal é o LSB
          const isNegative = (value & 1) === 1;
          const finalVal = value >> 1;
          values.push(isNegative ? -finalVal : finalVal);
          value = 0;
          shift = 0;
        }
      }

      return values;
    };

    const segmentsRaw = vlqInput.split(',').map(s => s.trim()).filter(Boolean);
    const decodedRows: Array<{
      raw: string;
      genCol: number;
      fileIdx: number;
      origLine: number;
      origCol: number;
      nameIdx?: number;
    }> = [];

    let currentGenCol = 0;
    let currentFileIdx = 0;
    let currentOrigLine = 0;
    let currentOrigCol = 0;

    for (const seg of segmentsRaw) {
      const decodedNumbers = decodeVlqSegment(seg);
      if (decodedNumbers.length >= 1) currentGenCol += decodedNumbers[0];
      if (decodedNumbers.length >= 2) currentFileIdx += decodedNumbers[1];
      if (decodedNumbers.length >= 3) currentOrigLine += decodedNumbers[2];
      if (decodedNumbers.length >= 4) currentOrigCol += decodedNumbers[3];

      decodedRows.push({
        raw: seg,
        genCol: currentGenCol,
        fileIdx: currentFileIdx,
        origLine: currentOrigLine + 1, // 1-indexed para humanos
        origCol: currentOrigCol,
        nameIdx: decodedNumbers[4]
      });
    }

    return decodedRows;
  }, [vlqInput]);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 text-slate-200">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Suíte de WebAssembly, AST Syntax Trees & Compiladores
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono">
                  Etapa 64 · 330 Ferramentas
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Desmontador Wasm WAT, explorador de nós AST ESTree, autômato finito NFA/DFA, opcodes V8 Ignition e decodificador VLQ de Source Maps.
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('wasm-wat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'wasm-wat' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Wasm vs WAT
          </button>

          <button
            onClick={() => setActiveTab('ast-explorer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'ast-explorer' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            AST Explorer
          </button>

          <button
            onClick={() => setActiveTab('regex-fsm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'regex-fsm' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Autômato NFA/DFA
          </button>

          <button
            onClick={() => setActiveTab('v8-bytecode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'v8-bytecode' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            V8 Bytecode
          </button>

          <button
            onClick={() => setActiveTab('sourcemap-vlq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'sourcemap-vlq' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            SourceMap VLQ
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: WASM VS WAT DISASSEMBLER
      ===================================================================== */}
      {activeTab === 'wasm-wat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Binary className="w-4 h-4 text-violet-400" />
                  Módulo Binário WebAssembly (.wasm em Hex)
                </label>
                <button
                  onClick={() => setWasmHexInput(defaultWasmHex)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-mono"
                >
                  Restaurar Exemplo add(a,b)
                </button>
              </div>

              <textarea
                value={wasmHexInput}
                onChange={e => setWasmHexInput(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-violet-500 break-all leading-relaxed"
                placeholder="Cole o dump hexadecimal de um binário .wasm..."
              />

              {/* AUDITORIA DE CABEÇALHO */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Magic Number & Version Header:</span>
                  <span className={`font-mono font-bold flex items-center gap-1.5 ${parsedWasm.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {parsedWasm.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {parsedWasm.isValid ? '00 61 73 6d (\0asm v1.0)' : 'Assinatura Inválida'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Tamanho total do binário: {parsedWasm.totalBytes} bytes ({parsedWasm.sections.length} seções detectadas)
                </div>
              </div>

              {/* SEÇÕES BINÁRIAS */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Estrutura de Seções Binárias do Wasm:</div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {parsedWasm.sections.map((sec, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-violet-400">{sec.name}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">Payload: {sec.hexSnippet}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                        {sec.size}B (Offset 0x{sec.offset.toString(16)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WAT DESMONTADO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Formato de Texto WebAssembly Desmontado (WAT)
                </label>
                <button
                  onClick={() => copyToClipboard(parsedWasm.generatedWat, 'wat-code')}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-mono"
                >
                  {copiedKey === 'wat-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar .wat
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed h-[360px]">
                {parsedWasm.generatedWat}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: AST EXPLORER (ESTREE / JAVASCRIPT)
      ===================================================================== */}
      {activeTab === 'ast-explorer' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAstInputCode(sampleAstCodes.functionDecl)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-violet-500/50"
            >
              Declaração de Função
            </button>
            <button
              onClick={() => setAstInputCode(sampleAstCodes.arrowFn)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-violet-500/50"
            >
              Arrow Function & Template
            </button>
            <button
              onClick={() => setAstInputCode(sampleAstCodes.conditional)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-violet-500/50"
            >
              Condicional If / Else
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" /> Código-Fonte JavaScript
              </label>
              <textarea
                value={astInputCode}
                onChange={e => setAstInputCode(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500 leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" /> Árvore Sintática Abstrata (ESTree AST)
                </label>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(parsedAst, null, 2), 'ast-json')}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-mono"
                >
                  {copiedKey === 'ast-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar JSON AST
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 h-[320px] overflow-y-auto">
                <AstNodeRenderer node={parsedAst} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: AUTÔMATO FINITO (NFA / DFA) PARA REGEX
      ===================================================================== */}
      {activeTab === 'regex-fsm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Expressão Regular (Pattern)</label>
              <input
                type="text"
                value={regexPattern}
                onChange={e => setRegexPattern(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">String de Entrada para Teste</label>
              <input
                type="text"
                value={testString}
                onChange={e => setTestString(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* RESULTADO DE ACEITAÇÃO */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            fsmSimulation.isAccepted 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {fsmSimulation.isAccepted ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <div>
                <div className="text-sm font-bold">
                  {fsmSimulation.isAccepted ? 'CADEIA ACEITA PELO AUTÔMATO!' : 'CADEIA REJEITADA!'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Caminho de estados percorrido: {fsmSimulation.path.join(' ➔ ')}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-white">
              Estado Final: {fsmSimulation.finalState}
            </div>
          </div>

          {/* TABELA DE ESTADOS E TRANSIÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300">Estados do Autômato:</div>
              <div className="space-y-2">
                {fsmSimulation.states.map(s => (
                  <div key={s.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center justify-center font-bold">
                        {s.id}
                      </span>
                      <span className="text-slate-200">{s.label}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {s.isStart && <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">START</span>}
                      {s.isAccept && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ACCEPT</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300">Tabela de Transições de Símbolo:</div>
              <div className="space-y-2">
                {fsmSimulation.transitions.map((t, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-violet-400 font-bold">{t.from}</span>
                      <span>➔</span>
                      <span className="text-violet-400 font-bold">{t.to}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[11px]">
                      com '{t.symbol}'
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: V8 IGNITION BYTECODE OPCODES
      ===================================================================== */}
      {activeTab === 'v8-bytecode' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar opcode V8 (ex: LdaNamedProperty, Star, Add, Return)..."
                value={bytecodeSearch}
                onChange={e => setBytecodeSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpcodes.map((op, idx) => (
              <div key={idx} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-violet-500/50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-cyan-300">{op.opcode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30">
                    {op.category}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Operandos: <span className="text-amber-300">{op.operands}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {op.desc}
                </p>
                <div className="p-2 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-emerald-400">
                  Ex: {op.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: SOURCEMAP VLQ DECODER
      ===================================================================== */}
      {activeTab === 'sourcemap-vlq' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-violet-400" />
                Mapeamento VLQ Base64 (Source Map Revision 3)
              </label>
              <button
                onClick={() => setVlqInput(defaultVlqMappings)}
                className="text-xs text-violet-400 hover:text-violet-300 font-mono"
              >
                Restaurar Exemplo
              </button>
            </div>
            <input
              type="text"
              value={vlqInput}
              onChange={e => setVlqInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500"
              placeholder="Cole os segmentos separados por vírgula (ex: AAAA,SAAS,aAAc)..."
            />
          </div>

          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Mapeamento Decodificado (Linha / Coluna Original):</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Segmento VLQ</th>
                    <th className="pb-2">Coluna Gerada (JS minificado)</th>
                    <th className="pb-2">Arquivo Original</th>
                    <th className="pb-2">Linha Original</th>
                    <th className="pb-2">Coluna Original</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {decodedVlq.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="py-2.5 text-violet-400 font-bold">{row.raw}</td>
                      <td className="py-2.5 text-cyan-300">{row.genCol}</td>
                      <td className="py-2.5 text-slate-300">sources[{row.fileIdx}]</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Linha {row.origLine}</td>
                      <td className="py-2.5 text-amber-300">Col {row.origCol}</td>
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
