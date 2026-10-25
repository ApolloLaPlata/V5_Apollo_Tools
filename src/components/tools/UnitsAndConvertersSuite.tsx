'use client';

import React, { useState, useMemo } from 'react';
import { 
  Binary, 
  Ruler, 
  Percent, 
  Clock, 
  Fingerprint, 
  Copy, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Hash, 
  Layers, 
  RefreshCw,
  Calculator
} from 'lucide-react';

export type UnitsConvertersTab = 'base-numerica' | 'medidas-unidades' | 'fracoes' | 'timestamp-uuid';

// ==========================================
// ALGORITMOS DE CONVERSÃO & CÁLCULO MATEMÁTICO
// ==========================================

// MDC para frações
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function UnitsAndConvertersSuite({ defaultTab = 'base-numerica' }: { defaultTab?: UnitsConvertersTab }) {
  const [activeTab, setActiveTab] = useState<UnitsConvertersTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // TAB 1: CONVERSOR DE BASE NUMÉRICA STATE
  // ==========================================
  const [decInput, setDecInput] = useState<string>('255');
  const [binInput, setBinInput] = useState<string>('11111111');
  const [octInput, setOctInput] = useState<string>('377');
  const [hexInput, setHexInput] = useState<string>('FF');

  const updateFromDecimal = (val: string) => {
    setDecInput(val);
    const clean = val.trim();
    if (!clean || isNaN(Number(clean))) {
      setBinInput('');
      setOctInput('');
      setHexInput('');
      return;
    }
    try {
      const num = BigInt(clean);
      setBinInput(num.toString(2));
      setOctInput(num.toString(8));
      setHexInput(num.toString(16).toUpperCase());
    } catch {
      // Ignora erro para números inválidos em digitação
    }
  };

  const updateFromBinary = (val: string) => {
    setBinInput(val);
    const clean = val.replace(/[^01]/g, '');
    if (!clean) {
      setDecInput('');
      setOctInput('');
      setHexInput('');
      return;
    }
    try {
      const num = BigInt('0b' + clean);
      setDecInput(num.toString(10));
      setOctInput(num.toString(8));
      setHexInput(num.toString(16).toUpperCase());
    } catch {}
  };

  const updateFromOctal = (val: string) => {
    setOctInput(val);
    const clean = val.replace(/[^0-7]/g, '');
    if (!clean) {
      setDecInput('');
      setBinInput('');
      setHexInput('');
      return;
    }
    try {
      const num = BigInt('0o' + clean);
      setDecInput(num.toString(10));
      setBinInput(num.toString(2));
      setHexInput(num.toString(16).toUpperCase());
    } catch {}
  };

  const updateFromHex = (val: string) => {
    setHexInput(val);
    const clean = val.replace(/[^0-9a-fA-F]/g, '');
    if (!clean) {
      setDecInput('');
      setBinInput('');
      setOctInput('');
      return;
    }
    try {
      const num = BigInt('0x' + clean);
      setDecInput(num.toString(10));
      setBinInput(num.toString(2));
      setOctInput(num.toString(8));
    } catch {}
  };

  // ==========================================
  // TAB 2: MEDIDAS FÍSICAS & UNIDADES STATE
  // ==========================================
  type UnitCategory = 'comprimento' | 'massa' | 'temperatura' | 'velocidade' | 'area' | 'volume';
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('comprimento');
  const [unitValue, setUnitValue] = useState<number>(100);
  const [unitFrom, setUnitFrom] = useState<string>('m');

  const unitConfigs: Record<UnitCategory, { label: string; units: { id: string; label: string; factorToSi?: number }[] }> = {
    comprimento: {
      label: 'Comprimento & Distância',
      units: [
        { id: 'km', label: 'Quilômetros (km)', factorToSi: 1000 },
        { id: 'm', label: 'Metros (m)', factorToSi: 1 },
        { id: 'cm', label: 'Centímetros (cm)', factorToSi: 0.01 },
        { id: 'mm', label: 'Milímetros (mm)', factorToSi: 0.001 },
        { id: 'mi', label: 'Milhas (mi)', factorToSi: 1609.344 },
        { id: 'yd', label: 'Jardas (yd)', factorToSi: 0.9144 },
        { id: 'ft', label: 'Pés (ft)', factorToSi: 0.3048 },
        { id: 'in', label: 'Polegadas (in)', factorToSi: 0.0254 }
      ]
    },
    massa: {
      label: 'Massa & Peso',
      units: [
        { id: 't', label: 'Toneladas (t)', factorToSi: 1000 },
        { id: 'kg', label: 'Quilogramas (kg)', factorToSi: 1 },
        { id: 'g', label: 'Gramas (g)', factorToSi: 0.001 },
        { id: 'mg', label: 'Miligramas (mg)', factorToSi: 0.000001 },
        { id: 'lb', label: 'Libras (lb)', factorToSi: 0.45359237 },
        { id: 'oz', label: 'Onças (oz)', factorToSi: 0.02834952 }
      ]
    },
    temperatura: {
      label: 'Temperatura',
      units: [
        { id: 'c', label: 'Celsius (°C)' },
        { id: 'f', label: 'Fahrenheit (°F)' },
        { id: 'k', label: 'Kelvin (K)' }
      ]
    },
    velocidade: {
      label: 'Velocidade',
      units: [
        { id: 'kmh', label: 'Km por Hora (km/h)', factorToSi: 1 / 3.6 },
        { id: 'ms', label: 'Metros por Segundo (m/s)', factorToSi: 1 },
        { id: 'mph', label: 'Milhas por Hora (mph)', factorToSi: 0.44704 },
        { id: 'knot', label: 'Nós Náuticos (kt)', factorToSi: 0.514444 }
      ]
    },
    area: {
      label: 'Área & Superfície',
      units: [
        { id: 'km2', label: 'Quilômetros Quadrados (km²)', factorToSi: 1000000 },
        { id: 'ha', label: 'Hectares (ha)', factorToSi: 10000 },
        { id: 'm2', label: 'Metros Quadrados (m²)', factorToSi: 1 },
        { id: 'cm2', label: 'Centímetros Quadrados (cm²)', factorToSi: 0.0001 },
        { id: 'ac', label: 'Acres (ac)', factorToSi: 4046.85642 },
        { id: 'ft2', label: 'Pés Quadrados (ft²)', factorToSi: 0.092903 }
      ]
    },
    volume: {
      label: 'Volume & Capacidade',
      units: [
        { id: 'm3', label: 'Metros Cúbicos (m³)', factorToSi: 1000 },
        { id: 'l', label: 'Litros (L)', factorToSi: 1 },
        { id: 'ml', label: 'Mililitros (mL)', factorToSi: 0.001 },
        { id: 'gal', label: 'Galões US (gal)', factorToSi: 3.78541 },
        { id: 'pt', label: 'Pintas US (pt)', factorToSi: 0.473176 }
      ]
    }
  };

  const convertedUnitsList = useMemo(() => {
    const config = unitConfigs[unitCategory];
    if (unitCategory === 'temperatura') {
      let cVal = unitValue;
      if (unitFrom === 'f') cVal = (unitValue - 32) * (5 / 9);
      else if (unitFrom === 'k') cVal = unitValue - 273.15;

      return [
        { id: 'c', label: 'Celsius (°C)', value: cVal.toFixed(2) },
        { id: 'f', label: 'Fahrenheit (°F)', value: (cVal * (9 / 5) + 32).toFixed(2) },
        { id: 'k', label: 'Kelvin (K)', value: (cVal + 273.15).toFixed(2) }
      ];
    } else {
      const currentUnit = config.units.find(u => u.id === unitFrom) || config.units[0];
      const siBase = unitValue * (currentUnit.factorToSi || 1);

      return config.units.map(u => {
        const factor = u.factorToSi || 1;
        const res = siBase / factor;
        const displayVal = Math.abs(res) < 0.000001 || Math.abs(res) > 100000000 
          ? res.toExponential(4) 
          : Number(res.toFixed(6)).toString();
        return {
          id: u.id,
          label: u.label,
          value: displayVal
        };
      });
    }
  }, [unitCategory, unitValue, unitFrom]);

  // ==========================================
  // TAB 3: CALCULADORA DE FRAÇÕES STATE
  // ==========================================
  const [num1, setNum1] = useState<number>(3);
  const [den1, setDen1] = useState<number>(4);
  const [fracOp, setFracOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [num2, setNum2] = useState<number>(2);
  const [den2, setDen2] = useState<number>(5);

  const fractionResult = useMemo(() => {
    if (den1 === 0 || den2 === 0) {
      return { error: 'O denominador não pode ser zero.' };
    }

    let resNum = 0;
    let resDen = 1;

    if (fracOp === '+') {
      resNum = num1 * den2 + num2 * den1;
      resDen = den1 * den2;
    } else if (fracOp === '-') {
      resNum = num1 * den2 - num2 * den1;
      resDen = den1 * den2;
    } else if (fracOp === '*') {
      resNum = num1 * num2;
      resDen = den1 * den2;
    } else if (fracOp === '/') {
      if (num2 === 0) return { error: 'Divisão por fração zero impossível.' };
      resNum = num1 * den2;
      resDen = den1 * num2;
    }

    // Simplificação
    const divisor = gcd(resNum, resDen);
    let simpNum = resNum / divisor;
    let simpDen = resDen / divisor;

    if (simpDen < 0) {
      simpNum = -simpNum;
      simpDen = -simpDen;
    }

    const decimalVal = (simpNum / simpDen);
    
    // Fração mista se imprópria
    let mixedStr = '';
    if (Math.abs(simpNum) >= simpDen && simpDen !== 1) {
      const whole = Math.trunc(simpNum / simpDen);
      const rem = Math.abs(simpNum % simpDen);
      if (rem > 0) {
        mixedStr = `${whole} e ${rem}/${simpDen}`;
      }
    }

    return {
      rawNum: resNum,
      rawDen: resDen,
      simpNum,
      simpDen,
      decimalVal: Number(decimalVal.toFixed(6)),
      mixedStr,
      error: null
    };
  }, [num1, den1, fracOp, num2, den2]);

  // ==========================================
  // TAB 4: TIMESTAMP UNIX & UUID V4 STATE
  // ==========================================
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 16));

  // UUID generator state
  const [uuidQuantity, setUuidQuantity] = useState<number>(5);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  const generateUuidV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidQuantity; i++) {
      let u = generateUuidV4();
      if (!uuidHyphens) u = u.replace(/-/g, '');
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setGeneratedUuids(list);
  };

  React.useEffect(() => {
    generateUuids();
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tsDateDetails = useMemo(() => {
    const tsNum = Number(tsInput);
    if (isNaN(tsNum) || tsNum <= 0) return null;
    const isMillis = tsInput.length > 11;
    const d = new Date(isMillis ? tsNum : tsNum * 1000);
    if (isNaN(d.getTime())) return null;

    return {
      utc: d.toUTCString(),
      local: d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      iso: d.toISOString(),
      isMillis
    };
  }, [tsInput]);

  const dateToTsResult = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return {
      seconds: Math.floor(d.getTime() / 1000),
      millis: d.getTime()
    };
  }, [dateInput]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Cyberpunk de Fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
              Benchmark Invertexto · Conversores & Matemática
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              100% Client-Side
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Binary className="w-6 h-6 text-cyan-400" />
            Conversores de Base, Medidas Físicas, Frações & UUID
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Conversão instantânea de sistemas numéricos, unidades internacionais, frações simplificadas e identificadores UUID v4.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('base-numerica')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'base-numerica'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Base Numérica
          </button>
          <button
            onClick={() => setActiveTab('medidas-unidades')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'medidas-unidades'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Medidas Físicas
          </button>
          <button
            onClick={() => setActiveTab('fracoes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'fracoes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Frações
          </button>
          <button
            onClick={() => setActiveTab('timestamp-uuid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'timestamp-uuid'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Timestamp & UUID
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="relative z-10 pt-6">

        {/* ========================================================= */}
        {/* TAB 1: CONVERSOR DE BASE NUMÉRICA */}
        {/* ========================================================= */}
        {activeTab === 'base-numerica' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Decimal */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 focus-within:border-cyan-500/50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                    <Hash className="w-4 h-4" /> Decimal (Base 10)
                  </label>
                  <button
                    onClick={() => copyToClipboard(decInput, 'dec')}
                    className="text-slate-500 hover:text-cyan-400 transition"
                  >
                    {copiedKey === 'dec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type="text"
                  value={decInput}
                  onChange={(e) => updateFromDecimal(e.target.value)}
                  placeholder="Ex: 255"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Binário */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 focus-within:border-cyan-500/50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Binary className="w-4 h-4" /> Binário (Base 2)
                  </label>
                  <button
                    onClick={() => copyToClipboard(binInput, 'bin')}
                    className="text-slate-500 hover:text-emerald-400 transition"
                  >
                    {copiedKey === 'bin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type="text"
                  value={binInput}
                  onChange={(e) => updateFromBinary(e.target.value)}
                  placeholder="Ex: 11111111"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Octal */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 focus-within:border-cyan-500/50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Octal (Base 8)
                  </label>
                  <button
                    onClick={() => copyToClipboard(octInput, 'oct')}
                    className="text-slate-500 hover:text-amber-400 transition"
                  >
                    {copiedKey === 'oct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type="text"
                  value={octInput}
                  onChange={(e) => updateFromOctal(e.target.value)}
                  placeholder="Ex: 377"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Hexadecimal */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 focus-within:border-cyan-500/50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-purple-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Hexadecimal (Base 16)
                  </label>
                  <button
                    onClick={() => copyToClipboard(hexInput, 'hex')}
                    className="text-slate-500 hover:text-purple-400 transition"
                  >
                    {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => updateFromHex(e.target.value)}
                  placeholder="Ex: FF"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono uppercase focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Visualizador de Bytes e Bits */}
            {binInput && (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-mono text-slate-400 block mb-2 font-bold">
                  Representação de Bits (Agrupados por Nibbles de 4 bits):
                </span>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {binInput.padStart(Math.ceil(binInput.length / 4) * 4, '0').match(/.{1,4}/g)?.map((chunk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MEDIDAS FÍSICAS & UNIDADES */}
        {/* ========================================================= */}
        {activeTab === 'medidas-unidades' && (
          <div className="space-y-6">
            {/* Seletor de Categoria de Medida */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(Object.keys(unitConfigs) as UnitCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat);
                    setUnitFrom(unitConfigs[cat].units[0].id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
                    unitCategory === cat
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {unitConfigs[cat].label}
                </button>
              ))}
            </div>

            {/* Inputs de Conversão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                  Valor a Converter
                </label>
                <input
                  type="number"
                  value={unitValue}
                  onChange={(e) => setUnitValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5">
                  Unidade de Origem
                </label>
                <select
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {unitConfigs[unitCategory].units.map(u => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid de Resultados Convertidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {convertedUnitsList.map(u => (
                <div key={u.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 block">{u.label}</span>
                    <strong className="text-base font-mono text-slate-200 mt-0.5 block truncate max-w-[180px]">
                      {u.value}
                    </strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(u.value, `unit-${u.id}`)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition"
                  >
                    {copiedKey === `unit-${u.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CALCULADORA DE FRAÇÕES */}
        {/* ========================================================= */}
        {activeTab === 'fracoes' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Fração 1 */}
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  value={num1}
                  onChange={(e) => setNum1(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <div className="w-24 h-0.5 bg-cyan-500/50 rounded" />
                <input
                  type="number"
                  value={den1}
                  onChange={(e) => setDen1(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Operador */}
              <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                {(['+', '-', '*', '/'] as const).map(op => (
                  <button
                    key={op}
                    onClick={() => setFracOp(op)}
                    className={`w-10 h-10 rounded-xl font-mono text-base font-bold transition ${
                      fracOp === op ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                  </button>
                ))}
              </div>

              {/* Fração 2 */}
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  value={num2}
                  onChange={(e) => setNum2(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <div className="w-24 h-0.5 bg-cyan-500/50 rounded" />
                <input
                  type="number"
                  value={den2}
                  onChange={(e) => setDen2(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Resultado da Fração */}
            {fractionResult.error ? (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
                {fractionResult.error}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    Fração Irredutível (Simplificada por MDC)
                  </span>
                  <div className="text-3xl sm:text-5xl font-black text-white mt-1 flex items-center gap-3">
                    <span>{fractionResult.simpNum}/{fractionResult.simpDen}</span>
                    <span className="text-xl font-normal text-slate-400">≈ {fractionResult.decimalVal}</span>
                  </div>
                  {fractionResult.mixedStr && (
                    <p className="text-xs text-amber-300 font-mono mt-2">
                      Fração Mista: <strong>{fractionResult.mixedStr}</strong>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => copyToClipboard(`${fractionResult.simpNum}/${fractionResult.simpDen}`, 'frac-res')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  {copiedKey === 'frac-res' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>Copiar Fração</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TIMESTAMP UNIX & GERADOR DE UUID V4 */}
        {/* ========================================================= */}
        {activeTab === 'timestamp-uuid' && (
          <div className="space-y-6">
            {/* Timestamp Atual em Tempo Real */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Timestamp UNIX Atual (Segundos)
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-100 mt-1">
                  {currentTimestamp}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(currentTimestamp.toString(), 'ts-now')}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
              >
                {copiedKey === 'ts-now' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>Copiar Timestamp</span>
              </button>
            </div>

            {/* Conversor Bidirecional: Timestamp <-> Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Timestamp para Data */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5">
                  Timestamp UNIX (Segundos ou Milissegundos)
                </label>
                <input
                  type="text"
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                  placeholder="Ex: 1700000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />

                {tsDateDetails && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">Horário de Brasília (Local):</span>
                      <strong className="text-slate-200">{tsDateDetails.local}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Horário Universal (UTC):</span>
                      <strong className="text-cyan-300">{tsDateDetails.utc}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Data para Timestamp */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <label className="block text-xs font-mono text-amber-400 font-bold mb-1.5">
                  Data e Hora para Timestamp
                </label>
                <input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />

                {dateToTsResult && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">Timestamp em Segundos:</span>
                      <strong className="text-amber-300">{dateToTsResult.seconds}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Timestamp em Milissegundos:</span>
                      <strong className="text-slate-200">{dateToTsResult.millis}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gerador de UUID v4 RFC 4122 */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4" /> Gerador de UUID v4 (RFC 4122)
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gere identificadores únicos universais criptograficamente pseudo-aleatórios.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={generateUuids}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Gerar Novos
                  </button>
                  <button
                    onClick={() => copyToClipboard(generatedUuids.join('\n'), 'all-uuids')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === 'all-uuids' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Todos
                  </button>
                </div>
              </div>

              {/* Opções de Formato de UUID */}
              <div className="flex items-center gap-4 py-3 text-xs font-mono text-slate-400 flex-wrap">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uuidHyphens}
                    onChange={(e) => setUuidHyphens(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Com hífens</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uuidUppercase}
                    onChange={(e) => setUuidUppercase(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Maiúsculas</span>
                </label>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span>Quantidade:</span>
                  <select
                    value={uuidQuantity}
                    onChange={(e) => setUuidQuantity(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                  >
                    <option value={1}>1</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              {/* Lista de UUIDs Gerados */}
              <div className="space-y-1.5 font-mono text-xs">
                {generatedUuids.map((uuid, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                    <span className="text-slate-200">{uuid}</span>
                    <button
                      onClick={() => copyToClipboard(uuid, `uuid-${i}`)}
                      className="text-slate-500 hover:text-emerald-400 transition"
                    >
                      {copiedKey === `uuid-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
