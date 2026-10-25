'use client';

import React, { useState, useMemo } from 'react';
import { 
  Circle, 
  Square, 
  Triangle, 
  Hexagon, 
  Shapes, 
  Copy, 
  Check, 
  Calculator, 
  Compass, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';

export type GeometryShapeType = 
  | 'circulo' 
  | 'quadrado' 
  | 'retangulo' 
  | 'triangulo' 
  | 'losango' 
  | 'trapezio' 
  | 'paralelogramo' 
  | 'pentagono' 
  | 'hexagono' 
  | 'poligono' 
  | 'elipse' 
  | 'coroa' 
  | 'setor';

interface GeometrySuiteProps {
  defaultTab?: GeometryShapeType;
}

export function GeometrySuite({ defaultTab = 'circulo' }: GeometrySuiteProps) {
  const [activeTab, setActiveTab] = useState<GeometryShapeType>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [unit, setUnit] = useState<string>('cm');

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

  // --- INPUT STATES ---
  // Círculo
  const [circRaio, setCircRaio] = useState<string>('5');

  // Quadrado
  const [quadLado, setQuadLado] = useState<string>('8');

  // Retângulo
  const [retBase, setRetBase] = useState<string>('12');
  const [retAltura, setRetAltura] = useState<string>('6');

  // Triângulo
  const [triModo, setTriModo] = useState<'base-altura' | 'heron'>('base-altura');
  const [triBase, setTriBase] = useState<string>('10');
  const [triAltura, setTriAltura] = useState<string>('8');
  const [triLadoA, setTriLadoA] = useState<string>('7');
  const [triLadoB, setTriLadoB] = useState<string>('8');
  const [triLadoC, setTriLadoC] = useState<string>('9');

  // Losango
  const [losDiagMaior, setLosDiagMaior] = useState<string>('16');
  const [losDiagMenor, setLosDiagMenor] = useState<string>('10');

  // Trapézio
  const [trapBaseMaior, setTrapBaseMaior] = useState<string>('14');
  const [trapBaseMenor, setTrapBaseMenor] = useState<string>('8');
  const [trapAltura, setTrapAltura] = useState<string>('6');

  // Paralelogramo
  const [parBase, setParBase] = useState<string>('15');
  const [parAltura, setParAltura] = useState<string>('9');
  const [parLado, setParLado] = useState<string>('10');

  // Pentágono Regular
  const [pentLado, setPentLado] = useState<string>('6');

  // Hexágono Regular
  const [hexLado, setHexLado] = useState<string>('7');

  // Polígono Regular Genérico
  const [polyNumLados, setPolyNumLados] = useState<string>('8');
  const [polyLado, setPolyLado] = useState<string>('5');

  // Elipse
  const [elipseRaioMaior, setElipseRaioMaior] = useState<string>('10');
  const [elipseRaioMenor, setElipseRaioMenor] = useState<string>('6');

  // Coroa Circular
  const [coroaRaioMaior, setCoroaRaioMaior] = useState<string>('10');
  const [coroaRaioMenor, setCoroaRaioMenor] = useState<string>('6');

  // Setor Circular
  const [setorRaio, setSetorRaio] = useState<string>('8');
  const [setorAngulo, setSetorAngulo] = useState<string>('60');

  // --- CÁLCULOS MATEMÁTICOS ---
  const calculations = useMemo(() => {
    const formatNumber = (num: number) => {
      if (isNaN(num) || !isFinite(num)) return '0';
      return num.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
    };

    // 1. Círculo
    const rCirc = parseFloat(circRaio) || 0;
    const circArea = Math.PI * rCirc * rCirc;
    const circPerimetro = 2 * Math.PI * rCirc;
    const circDiametro = 2 * rCirc;

    // 2. Quadrado
    const lQuad = parseFloat(quadLado) || 0;
    const quadArea = lQuad * lQuad;
    const quadPerimetro = 4 * lQuad;
    const quadDiagonal = lQuad * Math.SQRT2;

    // 3. Retângulo
    const bRet = parseFloat(retBase) || 0;
    const hRet = parseFloat(retAltura) || 0;
    const retArea = bRet * hRet;
    const retPerimetro = 2 * (bRet + hRet);
    const retDiagonal = Math.sqrt(bRet * bRet + hRet * hRet);

    // 4. Triângulo
    let triArea = 0;
    let triPerimetro = 0;
    let triValidHeron = true;
    if (triModo === 'base-altura') {
      const bTri = parseFloat(triBase) || 0;
      const hTri = parseFloat(triAltura) || 0;
      triArea = (bTri * hTri) / 2;
      triPerimetro = bTri * 3; // Estimativa equilátero
    } else {
      const a = parseFloat(triLadoA) || 0;
      const b = parseFloat(triLadoB) || 0;
      const c = parseFloat(triLadoC) || 0;
      triPerimetro = a + b + c;
      const s = triPerimetro / 2;
      const insideHeron = s * (s - a) * (s - b) * (s - c);
      if (insideHeron <= 0 || a + b <= c || a + c <= b || b + c <= a) {
        triValidHeron = false;
        triArea = 0;
      } else {
        triArea = Math.sqrt(insideHeron);
      }
    }

    // 5. Losango
    const dMaior = parseFloat(losDiagMaior) || 0;
    const dMenor = parseFloat(losDiagMenor) || 0;
    const losArea = (dMaior * dMenor) / 2;
    const losLado = Math.sqrt(Math.pow(dMaior / 2, 2) + Math.pow(dMenor / 2, 2));
    const losPerimetro = 4 * losLado;

    // 6. Trapézio
    const bTrapM = parseFloat(trapBaseMaior) || 0;
    const bTrapm = parseFloat(trapBaseMenor) || 0;
    const hTrap = parseFloat(trapAltura) || 0;
    const trapArea = ((bTrapM + bTrapm) * hTrap) / 2;
    const trapBaseMedia = (bTrapM + bTrapm) / 2;

    // 7. Paralelogramo
    const bPar = parseFloat(parBase) || 0;
    const hPar = parseFloat(parAltura) || 0;
    const lPar = parseFloat(parLado) || hPar;
    const parArea = bPar * hPar;
    const parPerimetro = 2 * (bPar + lPar);

    // 8. Pentágono Regular
    const lPent = parseFloat(pentLado) || 0;
    // Área = (5 * s^2) / (4 * tan(36deg)) ≈ 1.7204774 * s^2
    const pentApotema = lPent / (2 * Math.tan(Math.PI / 5));
    const pentArea = (5 * lPent * pentApotema) / 2;
    const pentPerimetro = 5 * lPent;

    // 9. Hexágono Regular
    const lHex = parseFloat(hexLado) || 0;
    // Área = (3 * sqrt(3) / 2) * s^2 ≈ 2.5980762 * s^2
    const hexArea = ((3 * Math.sqrt(3)) / 2) * lHex * lHex;
    const hexPerimetro = 6 * lHex;
    const hexApotema = (lHex * Math.sqrt(3)) / 2;

    // 10. Polígono Regular Genérico
    const nPoly = parseInt(polyNumLados) || 3;
    const lPoly = parseFloat(polyLado) || 0;
    const polyApotema = lPoly / (2 * Math.tan(Math.PI / nPoly));
    const polyArea = (nPoly * lPoly * polyApotema) / 2;
    const polyPerimetro = nPoly * lPoly;

    // 11. Elipse
    const aElip = parseFloat(elipseRaioMaior) || 0;
    const bElip = parseFloat(elipseRaioMenor) || 0;
    const elipseArea = Math.PI * aElip * bElip;
    // Ramanujan 1ª aproximação
    const elipsePerimetro = Math.PI * (3 * (aElip + bElip) - Math.sqrt((3 * aElip + bElip) * (aElip + 3 * bElip)));

    // 12. Coroa Circular
    const rCoroaM = parseFloat(coroaRaioMaior) || 0;
    const rCoroam = parseFloat(coroaRaioMenor) || 0;
    const coroaArea = rCoroaM >= rCoroam ? Math.PI * (rCoroaM * rCoroaM - rCoroam * rCoroam) : 0;
    const coroaEspessura = Math.max(0, rCoroaM - rCoroam);

    // 13. Setor Circular
    const rSetor = parseFloat(setorRaio) || 0;
    const angSetor = parseFloat(setorAngulo) || 0;
    const setorArea = (angSetor / 360) * Math.PI * rSetor * rSetor;
    const setorComprimentoArco = (angSetor / 360) * (2 * Math.PI * rSetor);
    const setorPerimetro = setorComprimentoArco + 2 * rSetor;

    return {
      formatNumber,
      circ: { area: circArea, perimetro: circPerimetro, diametro: circDiametro },
      quad: { area: quadArea, perimetro: quadPerimetro, diagonal: quadDiagonal },
      ret: { area: retArea, perimetro: retPerimetro, diagonal: retDiagonal },
      tri: { area: triArea, perimetro: triPerimetro, valid: triValidHeron },
      los: { area: losArea, lado: losLado, perimetro: losPerimetro },
      trap: { area: trapArea, baseMedia: trapBaseMedia },
      par: { area: parArea, perimetro: parPerimetro },
      pent: { area: pentArea, perimetro: pentPerimetro, apotema: pentApotema },
      hex: { area: hexArea, perimetro: hexPerimetro, apotema: hexApotema },
      poly: { area: polyArea, perimetro: polyPerimetro, apotema: polyApotema },
      elip: { area: elipseArea, perimetro: elipsePerimetro },
      coroa: { area: coroaArea, espessura: coroaEspessura, valid: rCoroaM >= rCoroam },
      setor: { area: setorArea, arco: setorComprimentoArco, perimetro: setorPerimetro }
    };
  }, [
    circRaio, quadLado, retBase, retAltura, triModo, triBase, triAltura, triLadoA, triLadoB, triLadoC,
    losDiagMaior, losDiagMenor, trapBaseMaior, trapBaseMenor, trapAltura, parBase, parAltura, parLado,
    pentLado, hexLado, polyNumLados, polyLado, elipseRaioMaior, elipseRaioMenor, coroaRaioMaior, coroaRaioMenor,
    setorRaio, setorAngulo
  ]);

  const shapesList: { id: GeometryShapeType; label: string; icon: any; shortFormula: string }[] = [
    { id: 'circulo', label: 'Círculo', icon: Circle, shortFormula: 'A = π · r²' },
    { id: 'quadrado', label: 'Quadrado', icon: Square, shortFormula: 'A = L²' },
    { id: 'retangulo', label: 'Retângulo', icon: Square, shortFormula: 'A = b · h' },
    { id: 'triangulo', label: 'Triângulo', icon: Triangle, shortFormula: 'A = (b · h)/2' },
    { id: 'losango', label: 'Losango', icon: Shapes, shortFormula: 'A = (D · d)/2' },
    { id: 'trapezio', label: 'Trapézio', icon: Layers, shortFormula: 'A = ((B + b) · h)/2' },
    { id: 'paralelogramo', label: 'Paralelogramo', icon: Shapes, shortFormula: 'A = b · h' },
    { id: 'pentagono', label: 'Pentágono', icon: Shapes, shortFormula: 'A = (5 · L · a)/2' },
    { id: 'hexagono', label: 'Hexágono', icon: Hexagon, shortFormula: 'A = (3√3/2) · L²' },
    { id: 'poligono', label: 'Polígono Regular', icon: Compass, shortFormula: 'A = (n · L · a)/2' },
    { id: 'elipse', label: 'Elipse', icon: Circle, shortFormula: 'A = π · a · b' },
    { id: 'coroa', label: 'Coroa Circular', icon: Circle, shortFormula: 'A = π · (R² - r²)' },
    { id: 'setor', label: 'Setor Circular', icon: Compass, shortFormula: 'A = (α/360) · π · r²' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Geometria Plana & Calculadoras de Área
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              13 FORMAS 4DEVS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cálculo instantâneo de área, perímetro, diagonais e apótemas com visualização gráfica vetorial em tempo real.
          </p>
        </div>

        {/* Seletor de Unidades */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Unidade:</span>
          {(['cm', 'm', 'mm', 'pol'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                unit === u
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Formas (Navegação Horizontal / Grid Responsivo) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-8">
        {shapesList.map((shape) => {
          const Icon = shape.icon;
          const isSelected = activeTab === shape.id;
          return (
            <button
              key={shape.id}
              onClick={() => setActiveTab(shape.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-[11px] font-semibold leading-tight">{shape.label}</span>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">{shape.shortFormula}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Forma Ativa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna 1: Entradas e Controles (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              Parâmetros de Entrada ({unit})
            </h3>

            {/* 1. CÍRCULO */}
            {activeTab === 'circulo' && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Raio do Círculo (r):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={circRaio}
                    onChange={(e) => setCircRaio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: 5"
                  />
                  <span className="px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 text-xs font-mono flex items-center">
                    {unit}
                  </span>
                </div>
              </div>
            )}

            {/* 2. QUADRADO */}
            {activeTab === 'quadrado' && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Comprimento do Lado (L):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={quadLado}
                    onChange={(e) => setQuadLado(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: 8"
                  />
                  <span className="px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 text-xs font-mono flex items-center">
                    {unit}
                  </span>
                </div>
              </div>
            )}

            {/* 3. RETÂNGULO */}
            {activeTab === 'retangulo' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Base (b):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={retBase}
                      onChange={(e) => setRetBase(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 text-xs font-mono flex items-center">
                      {unit}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Altura (h):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={retAltura}
                      onChange={(e) => setRetAltura(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 text-xs font-mono flex items-center">
                      {unit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TRIÂNGULO */}
            {activeTab === 'triangulo' && (
              <div className="space-y-3">
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setTriModo('base-altura')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      triModo === 'base-altura' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Base & Altura
                  </button>
                  <button
                    onClick={() => setTriModo('heron')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      triModo === 'heron' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3 Lados (Heron)
                  </button>
                </div>

                {triModo === 'base-altura' ? (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Base (b):</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={triBase}
                        onChange={(e) => setTriBase(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Altura (h):</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={triAltura}
                        onChange={(e) => setTriAltura(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 mb-1 block">Lado A:</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={triLadoA}
                          onChange={(e) => setTriLadoA(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 mb-1 block">Lado B:</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={triLadoB}
                          onChange={(e) => setTriLadoB(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 mb-1 block">Lado C:</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={triLadoC}
                          onChange={(e) => setTriLadoC(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    {!calculations.tri.valid && (
                      <p className="text-[11px] text-amber-400">
                        ⚠️ Violação da desigualdade triangular: a soma de 2 lados deve ser estritamente maior que o terceiro.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 5. LOSANGO */}
            {activeTab === 'losango' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Diagonal Maior (D):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={losDiagMaior}
                    onChange={(e) => setLosDiagMaior(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Diagonal Menor (d):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={losDiagMenor}
                    onChange={(e) => setLosDiagMenor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 6. TRAPÉZIO */}
            {activeTab === 'trapezio' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Base Maior (B):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trapBaseMaior}
                    onChange={(e) => setTrapBaseMaior(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Base Menor (b):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trapBaseMenor}
                    onChange={(e) => setTrapBaseMenor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Altura (h):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trapAltura}
                    onChange={(e) => setTrapAltura(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 7. PARALELOGRAMO */}
            {activeTab === 'paralelogramo' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Base (b):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={parBase}
                    onChange={(e) => setParBase(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Altura (h):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={parAltura}
                    onChange={(e) => setParAltura(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Lado Inclinado (l):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={parLado}
                    onChange={(e) => setParLado(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 8. PENTÁGONO REGULAR */}
            {activeTab === 'pentagono' && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Comprimento do Lado (L):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pentLado}
                  onChange={(e) => setPentLado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* 9. HEXÁGONO REGULAR */}
            {activeTab === 'hexagono' && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Comprimento do Lado (L):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={hexLado}
                  onChange={(e) => setHexLado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* 10. POLÍGONO REGULAR GENÉRICO */}
            {activeTab === 'poligono' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Número de Lados (n ≥ 3):</label>
                  <input
                    type="number"
                    min="3"
                    max="100"
                    value={polyNumLados}
                    onChange={(e) => setPolyNumLados(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Comprimento de Cada Lado (L):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={polyLado}
                    onChange={(e) => setPolyLado(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 11. ELIPSE */}
            {activeTab === 'elipse' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Semi-Eixo Maior (a):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={elipseRaioMaior}
                    onChange={(e) => setElipseRaioMaior(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Semi-Eixo Menor (b):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={elipseRaioMenor}
                    onChange={(e) => setElipseRaioMenor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 12. COROA CIRCULAR */}
            {activeTab === 'coroa' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Raio Externo (R):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={coroaRaioMaior}
                    onChange={(e) => setCoroaRaioMaior(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Raio Interno (r):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={coroaRaioMenor}
                    onChange={(e) => setCoroaRaioMenor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {!calculations.coroa.valid && (
                  <p className="text-[11px] text-amber-400">
                    ⚠️ O raio externo (R) deve ser maior ou igual ao raio interno (r).
                  </p>
                )}
              </div>
            )}

            {/* 13. SETOR CIRCULAR */}
            {activeTab === 'setor' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Raio do Círculo (r):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={setorRaio}
                    onChange={(e) => setSetorRaio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Ângulo Central (α em graus):</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    step="any"
                    value={setorAngulo}
                    onChange={(e) => setSetorAngulo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cartão de Fórmulas e Teoria */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs space-y-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Fórmula Aplicada & Resolução:
            </span>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-emerald-300 text-xs">
              {activeTab === 'circulo' && `Área = π · r² = 3,14159... · (${circRaio})²`}
              {activeTab === 'quadrado' && `Área = L² = (${quadLado})²`}
              {activeTab === 'retangulo' && `Área = base · altura = ${retBase} · ${retAltura}`}
              {activeTab === 'triangulo' && (triModo === 'base-altura' ? `Área = (b · h) / 2 = (${triBase} · ${triAltura}) / 2` : `Heron: √[s(s-a)(s-b)(s-c)], s = perimetro/2`)}
              {activeTab === 'losango' && `Área = (D · d) / 2 = (${losDiagMaior} · ${losDiagMenor}) / 2`}
              {activeTab === 'trapezio' && `Área = ((B + b) · h) / 2 = ((${trapBaseMaior} + ${trapBaseMenor}) · ${trapAltura}) / 2`}
              {activeTab === 'paralelogramo' && `Área = base · altura = ${parBase} · ${parAltura}`}
              {activeTab === 'pentagono' && `Área = (5 · L · apótema) / 2 ≈ 1,720477 · (${pentLado})²`}
              {activeTab === 'hexagono' && `Área = (3 · √3 / 2) · L² ≈ 2,598076 · (${hexLado})²`}
              {activeTab === 'poligono' && `Área = (n · L²)/(4 · tan(180°/n)) [${polyNumLados} lados]`}
              {activeTab === 'elipse' && `Área = π · a · b = π · ${elipseRaioMaior} · ${elipseRaioMenor}`}
              {activeTab === 'coroa' && `Área = π · (R² - r²) = π · ((${coroaRaioMaior})² - (${coroaRaioMenor})²)`}
              {activeTab === 'setor' && `Área = (α / 360°) · π · r² = (${setorAngulo}° / 360°) · π · (${setorRaio})²`}
            </div>
          </div>
        </div>

        {/* Coluna 2: Resultados & Visualização Vetorial SVG (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card Principal de Resultados */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Resultados Calculados
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Precisão Soberana
              </span>
            </div>

            {/* Grid de Valores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* ÁREA */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl relative group">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Área Total:</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-1.5">
                  {activeTab === 'circulo' && calculations.formatNumber(calculations.circ.area)}
                  {activeTab === 'quadrado' && calculations.formatNumber(calculations.quad.area)}
                  {activeTab === 'retangulo' && calculations.formatNumber(calculations.ret.area)}
                  {activeTab === 'triangulo' && calculations.formatNumber(calculations.tri.area)}
                  {activeTab === 'losango' && calculations.formatNumber(calculations.los.area)}
                  {activeTab === 'trapezio' && calculations.formatNumber(calculations.trap.area)}
                  {activeTab === 'paralelogramo' && calculations.formatNumber(calculations.par.area)}
                  {activeTab === 'pentagono' && calculations.formatNumber(calculations.pent.area)}
                  {activeTab === 'hexagono' && calculations.formatNumber(calculations.hex.area)}
                  {activeTab === 'poligono' && calculations.formatNumber(calculations.poly.area)}
                  {activeTab === 'elipse' && calculations.formatNumber(calculations.elip.area)}
                  {activeTab === 'coroa' && calculations.formatNumber(calculations.coroa.area)}
                  {activeTab === 'setor' && calculations.formatNumber(calculations.setor.area)}
                  <span className="text-xs font-normal text-emerald-400 font-mono">{unit}²</span>
                </div>
                <button
                  onClick={() => {
                    let val = '';
                    if (activeTab === 'circulo') val = String(calculations.circ.area);
                    else if (activeTab === 'quadrado') val = String(calculations.quad.area);
                    else if (activeTab === 'retangulo') val = String(calculations.ret.area);
                    else if (activeTab === 'triangulo') val = String(calculations.tri.area);
                    else if (activeTab === 'losango') val = String(calculations.los.area);
                    else if (activeTab === 'trapezio') val = String(calculations.trap.area);
                    else if (activeTab === 'paralelogramo') val = String(calculations.par.area);
                    else if (activeTab === 'pentagono') val = String(calculations.pent.area);
                    else if (activeTab === 'hexagono') val = String(calculations.hex.area);
                    else if (activeTab === 'poligono') val = String(calculations.poly.area);
                    else if (activeTab === 'elipse') val = String(calculations.elip.area);
                    else if (activeTab === 'coroa') val = String(calculations.coroa.area);
                    else if (activeTab === 'setor') val = String(calculations.setor.area);
                    copyToClipboard(val, 'area');
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Copiar Área"
                >
                  {copiedKey === 'area' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* PERÍMETRO / MÉTRICA SECUNDÁRIA */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative group">
                <span className="text-xs text-slate-400 block mb-1 font-medium">
                  {activeTab === 'coroa' ? 'Espessura da Coroa:' : 'Perímetro Total:'}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono tracking-tight flex items-baseline gap-1.5">
                  {activeTab === 'circulo' && calculations.formatNumber(calculations.circ.perimetro)}
                  {activeTab === 'quadrado' && calculations.formatNumber(calculations.quad.perimetro)}
                  {activeTab === 'retangulo' && calculations.formatNumber(calculations.ret.perimetro)}
                  {activeTab === 'triangulo' && calculations.formatNumber(calculations.tri.perimetro)}
                  {activeTab === 'losango' && calculations.formatNumber(calculations.los.perimetro)}
                  {activeTab === 'trapezio' && `Base Média: ${calculations.formatNumber(calculations.trap.baseMedia)}`}
                  {activeTab === 'paralelogramo' && calculations.formatNumber(calculations.par.perimetro)}
                  {activeTab === 'pentagono' && calculations.formatNumber(calculations.pent.perimetro)}
                  {activeTab === 'hexagono' && calculations.formatNumber(calculations.hex.perimetro)}
                  {activeTab === 'poligono' && calculations.formatNumber(calculations.poly.perimetro)}
                  {activeTab === 'elipse' && calculations.formatNumber(calculations.elip.perimetro)}
                  {activeTab === 'coroa' && calculations.formatNumber(calculations.coroa.espessura)}
                  {activeTab === 'setor' && calculations.formatNumber(calculations.setor.perimetro)}
                  <span className="text-xs font-normal text-cyan-400 font-mono">{unit}</span>
                </div>
                <button
                  onClick={() => {
                    let val = '';
                    if (activeTab === 'circulo') val = String(calculations.circ.perimetro);
                    else if (activeTab === 'quadrado') val = String(calculations.quad.perimetro);
                    else if (activeTab === 'retangulo') val = String(calculations.ret.perimetro);
                    else if (activeTab === 'triangulo') val = String(calculations.tri.perimetro);
                    else if (activeTab === 'losango') val = String(calculations.los.perimetro);
                    else if (activeTab === 'trapezio') val = String(calculations.trap.baseMedia);
                    else if (activeTab === 'paralelogramo') val = String(calculations.par.perimetro);
                    else if (activeTab === 'pentagono') val = String(calculations.pent.perimetro);
                    else if (activeTab === 'hexagono') val = String(calculations.hex.perimetro);
                    else if (activeTab === 'poligono') val = String(calculations.poly.perimetro);
                    else if (activeTab === 'elipse') val = String(calculations.elip.perimetro);
                    else if (activeTab === 'coroa') val = String(calculations.coroa.espessura);
                    else if (activeTab === 'setor') val = String(calculations.setor.perimetro);
                    copyToClipboard(val, 'perim');
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Copiar Métrica"
                >
                  {copiedKey === 'perim' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Visualizador Vetorial Interativo SVG */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">
                Representação Vetorial Escalonada
              </span>

              <svg width="220" height="160" viewBox="0 0 220 160" className="overflow-visible">
                {/* 1. Círculo */}
                {activeTab === 'circulo' && (
                  <g>
                    <circle cx="110" cy="80" r="55" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="110" y1="80" x2="165" y2="80" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="110" cy="80" r="3" fill="#06b6d4" />
                    <text x="135" y="73" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">r={circRaio}</text>
                  </g>
                )}

                {/* 2. Quadrado */}
                {activeTab === 'quadrado' && (
                  <g>
                    <rect x="65" y="35" width="90" height="90" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="110" y="140" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">L={quadLado}</text>
                    <text x="50" y="83" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">L={quadLado}</text>
                  </g>
                )}

                {/* 3. Retângulo */}
                {activeTab === 'retangulo' && (
                  <g>
                    <rect x="40" y="45" width="140" height="70" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="110" y="132" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">b={retBase}</text>
                    <text x="25" y="83" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">h={retAltura}</text>
                  </g>
                )}

                {/* 4. Triângulo */}
                {activeTab === 'triangulo' && (
                  <g>
                    <polygon points="110,30 45,130 175,130" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="110" y1="30" x2="110" y2="130" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="110" y="145" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">b={triBase}</text>
                    <text x="122" y="80" fill="#06b6d4" fontSize="10" fontFamily="monospace">h={triAltura}</text>
                  </g>
                )}

                {/* 5. Losango */}
                {activeTab === 'losango' && (
                  <g>
                    <polygon points="110,25 180,80 110,135 40,80" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="40" y1="80" x2="180" y2="80" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="110" y1="25" x2="110" y2="135" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="110" y="74" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">D={losDiagMaior}</text>
                    <text x="120" y="110" fill="#f59e0b" fontSize="10" fontFamily="monospace">d={losDiagMenor}</text>
                  </g>
                )}

                {/* 6. Trapézio */}
                {activeTab === 'trapezio' && (
                  <g>
                    <polygon points="75,45 145,45 185,125 35,125" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="110" y="38" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">b={trapBaseMenor}</text>
                    <text x="110" y="142" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">B={trapBaseMaior}</text>
                    <line x1="75" y1="45" x2="75" y2="125" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="82" y="88" fill="#f59e0b" fontSize="10" fontFamily="monospace">h={trapAltura}</text>
                  </g>
                )}

                {/* 7. Paralelogramo */}
                {activeTab === 'paralelogramo' && (
                  <g>
                    <polygon points="65,45 185,45 155,120 35,120" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="95" y="136" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">b={parBase}</text>
                    <line x1="65" y1="45" x2="65" y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="73" y="85" fill="#f59e0b" fontSize="10" fontFamily="monospace">h={parAltura}</text>
                  </g>
                )}

                {/* 8. Pentágono */}
                {activeTab === 'pentagono' && (
                  <g>
                    <polygon points="110,25 175,65 150,135 70,135 45,65" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="110" y="148" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">L={pentLado}</text>
                  </g>
                )}

                {/* 9. Hexágono */}
                {activeTab === 'hexagono' && (
                  <g>
                    <polygon points="80,30 140,30 175,80 140,130 80,130 45,80" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="110" y="145" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">L={hexLado}</text>
                  </g>
                )}

                {/* 10. Polígono Regular Genérico */}
                {activeTab === 'poligono' && (
                  <g>
                    <polygon points="85,30 135,30 170,65 170,105 135,135 85,135 50,105 50,65" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <text x="110" y="150" fill="#06b6d4" fontSize="10" fontFamily="monospace" textAnchor="middle">n={polyNumLados} lados (L={polyLado})</text>
                  </g>
                )}

                {/* 11. Elipse */}
                {activeTab === 'elipse' && (
                  <g>
                    <ellipse cx="110" cy="80" rx="75" ry="45" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="110" y1="80" x2="185" y2="80" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="110" y1="80" x2="110" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="150" y="75" fill="#06b6d4" fontSize="10" fontFamily="monospace">a={elipseRaioMaior}</text>
                    <text x="115" y="55" fill="#f59e0b" fontSize="10" fontFamily="monospace">b={elipseRaioMenor}</text>
                  </g>
                )}

                {/* 12. Coroa Circular */}
                {activeTab === 'coroa' && (
                  <g>
                    <circle cx="110" cy="80" r="60" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" />
                    <circle cx="110" cy="80" r="35" fill="#020617" stroke="#10b981" strokeWidth="2" />
                    <line x1="110" y1="80" x2="170" y2="80" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="110" y1="80" x2="145" y2="80" stroke="#f59e0b" strokeWidth="2" />
                    <text x="155" y="73" fill="#06b6d4" fontSize="9" fontFamily="monospace">R={coroaRaioMaior}</text>
                    <text x="127" y="93" fill="#f59e0b" fontSize="9" fontFamily="monospace">r={coroaRaioMenor}</text>
                  </g>
                )}

                {/* 13. Setor Circular */}
                {activeTab === 'setor' && (
                  <g>
                    {/* Arco de 60 graus centrado */}
                    <path
                      d="M 110,80 L 165,80 A 55 55 0 0 0 137.5,32.3 Z"
                      fill="rgba(16, 185, 129, 0.25)"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                    <circle cx="110" cy="80" r="3" fill="#06b6d4" />
                    <text x="140" y="94" fill="#06b6d4" fontSize="10" fontFamily="monospace">r={setorRaio}</text>
                    <text x="128" y="65" fill="#f59e0b" fontSize="10" fontFamily="monospace">α={setorAngulo}°</text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
