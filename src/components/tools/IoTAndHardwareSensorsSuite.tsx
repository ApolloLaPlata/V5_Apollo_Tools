'use client';

import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Thermometer, 
  Gauge, 
  BatteryCharging, 
  Radio, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Zap, 
  Code2, 
  Sliders, 
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

interface IoTAndHardwareSensorsSuiteProps {
  defaultTab?: 'thermo-temp' | 'pressure-calc' | 'resistor-calc' | 'uart-baud' | 'battery-life';
}

export const IoTAndHardwareSensorsSuite: React.FC<IoTAndHardwareSensorsSuiteProps> = ({ defaultTab = 'thermo-temp' }) => {
  const [activeTab, setActiveTab] = useState<'thermo-temp' | 'pressure-calc' | 'resistor-calc' | 'uart-baud' | 'battery-life'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CONVERSOR TERMODINÂMICO & SNIPPETS ARDUINO/ESP32
  // ==========================================
  const [tempCelsius, setTempCelsius] = useState<number>(25);

  const tempConversions = useMemo(() => {
    const c = tempCelsius;
    const f = (c * 9/5) + 32;
    const k = c + 273.15;
    const r = (c + 273.15) * 9/5;

    const isBelowAbsoluteZero = k < 0;

    const arduinoSnippet = `// Leitura de Temperatura ESP32 / Arduino (BME280 / DHT22)
float tempC = ${c.toFixed(2)};
float tempF = (tempC * 1.8) + 32.0;
float tempK = tempC + 273.15;

Serial.print("Temperatura: ");
Serial.print(tempC);
Serial.println(" °C");`;

    return {
      c: c.toFixed(2),
      f: f.toFixed(2),
      k: k.toFixed(2),
      r: r.toFixed(2),
      isBelowAbsoluteZero,
      arduinoSnippet
    };
  }, [tempCelsius]);

  // ==========================================
  // FERRAMENTA 2: CALCULADORA DE PRESSÃO BAROMÉTRICA & ALTITUDE ICAO
  // ==========================================
  const [pressureHpa, setPressureHpa] = useState<number>(1013.25); // Nível do mar padrão

  const pressureConversions = useMemo(() => {
    const hpa = pressureHpa;
    const bar = hpa / 1000;
    const psi = hpa * 0.0145037738;
    const atm = hpa / 1013.25;
    const mmhg = hpa * 0.750062;

    // Fórmula barométrica internacional ICAO para altitude aproximada em metros:
    // h = 44330 * (1 - (p / 1013.25)^(1 / 5.255))
    const altitudeMeters = 44330 * (1 - Math.pow(Math.max(0.001, hpa) / 1013.25, 1 / 5.255));
    const altitudeFeet = altitudeMeters * 3.28084;

    let weatherTendency = 'Pressão Padrão ao Nível do Mar (Estável)';
    let weatherBadgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800';

    if (hpa > 1020) {
      weatherTendency = 'Alta Pressão Barométrica (Tempo Firme, Céu Limpo)';
      weatherBadgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    } else if (hpa < 1005) {
      weatherTendency = 'Baixa Pressão Barométrica (Instabilidade, Chuvas / Tempestade)';
      weatherBadgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
    }

    return {
      bar: bar.toFixed(4),
      psi: psi.toFixed(3),
      atm: atm.toFixed(4),
      mmhg: mmhg.toFixed(2),
      altitudeMeters: Math.round(altitudeMeters),
      altitudeFeet: Math.round(altitudeFeet),
      weatherTendency,
      weatherBadgeColor
    };
  }, [pressureHpa]);

  // ==========================================
  // FERRAMENTA 3: CÓDIGO DE CORES DE RESISTORES (4 / 5 FAIXAS)
  // ==========================================
  const [resistorBandsCount, setResistorBandsCount] = useState<4 | 5>(4);
  const [band1, setBand1] = useState<number>(1); // Marrom = 1
  const [band2, setBand2] = useState<number>(0); // Preto = 0
  const [band3, setBand3] = useState<number>(0); // Preto = 0 (para 5 faixas)
  const [bandMultiplier, setBandMultiplier] = useState<number>(2); // Vermelho = 10^2 = 100
  const [bandTolerance, setBandTolerance] = useState<number>(5); // Ouro = 5%

  const colorCodes = [
    { name: 'Preto', val: 0, mult: 1, hex: '#000000', text: '#ffffff' },
    { name: 'Marrom', val: 1, mult: 10, hex: '#8b4513', text: '#ffffff' },
    { name: 'Vermelho', val: 2, mult: 100, hex: '#ef4444', text: '#ffffff' },
    { name: 'Laranja', val: 3, mult: 1000, hex: '#f97316', text: '#000000' },
    { name: 'Amarelo', val: 4, mult: 10000, hex: '#eab308', text: '#000000' },
    { name: 'Verde', val: 5, mult: 100000, hex: '#22c55e', text: '#000000' },
    { name: 'Azul', val: 6, mult: 1000000, hex: '#3b82f6', text: '#ffffff' },
    { name: 'Violeta', val: 7, mult: 10000000, hex: '#a855f7', text: '#ffffff' },
    { name: 'Cinza', val: 8, mult: 100000000, hex: '#64748b', text: '#ffffff' },
    { name: 'Branco', val: 9, mult: 1000000000, hex: '#f8fafc', text: '#000000' }
  ];

  const toleranceOptions = [
    { name: 'Ouro (±5%)', tol: 5, hex: '#d4af37' },
    { name: 'Prata (±10%)', tol: 10, hex: '#c0c0c0' },
    { name: 'Marrom (±1%)', tol: 1, hex: '#8b4513' },
    { name: 'Vermelho (±2%)', tol: 2, hex: '#ef4444' }
  ];

  const resistorResult = useMemo(() => {
    let baseDigits = 0;
    if (resistorBandsCount === 4) {
      baseDigits = band1 * 10 + band2;
    } else {
      baseDigits = band1 * 100 + band2 * 10 + band3;
    }

    const multiplierVal = Math.pow(10, bandMultiplier);
    const ohms = baseDigits * multiplierVal;

    let formattedOhms = `${ohms} Ω`;
    if (ohms >= 1000000) {
      formattedOhms = `${(ohms / 1000000).toFixed(2).replace(/\.00$/, '')} MΩ (Megaohms)`;
    } else if (ohms >= 1000) {
      formattedOhms = `${(ohms / 1000).toFixed(2).replace(/\.00$/, '')} kΩ (Kilohms)`;
    }

    const minOhms = ohms * (1 - bandTolerance / 100);
    const maxOhms = ohms * (1 + bandTolerance / 100);

    return {
      ohms,
      formattedOhms,
      tolerance: `±${bandTolerance}%`,
      minOhms: minOhms.toLocaleString('pt-BR'),
      maxOhms: maxOhms.toLocaleString('pt-BR')
    };
  }, [resistorBandsCount, band1, band2, band3, bandMultiplier, bandTolerance]);

  // ==========================================
  // FERRAMENTA 4: TAXAS UART / SERIAL & LATÊNCIA DE BUFFER
  // ==========================================
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [dataBits, setDataBits] = useState<number>(8);
  const [stopBits, setStopBits] = useState<number>(1);
  const [hasParity, setHasParity] = useState<boolean>(false);
  const [payloadBytes, setPayloadBytes] = useState<number>(256);

  const uartCalculations = useMemo(() => {
    // Total bits por caractere: 1 start + data + parity + stop
    const bitsPerChar = 1 + dataBits + (hasParity ? 1 : 0) + stopBits;
    
    // Caracteres (Bytes) transferidos por segundo
    const bytesPerSecond = baudRate / bitsPerChar;
    const kilobytesPerSecond = (bytesPerSecond / 1024).toFixed(2);

    // Tempo para transmitir o payload
    const totalBits = payloadBytes * bitsPerChar;
    const timeSeconds = totalBits / baudRate;
    const timeMs = (timeSeconds * 1000).toFixed(3);

    return {
      bitsPerChar,
      bytesPerSecond: Math.round(bytesPerSecond).toLocaleString('pt-BR'),
      kilobytesPerSecond,
      timeMs
    };
  }, [baudRate, dataBits, stopBits, hasParity, payloadBytes]);

  // ==========================================
  // FERRAMENTA 5: ESTIMADOR DE AUTONOMIA DE BATERIA IOT
  // ==========================================
  const [batteryCapacityMah, setBatteryCapacityMah] = useState<number>(2000); // 2000 mAh
  const [activeCurrentMa, setActiveCurrentMa] = useState<number>(80); // 80 mA (Wi-Fi TX)
  const [activeDurationSec, setActiveDurationSec] = useState<number>(2); // 2s
  const [sleepCurrentUa, setSleepCurrentUa] = useState<number>(15); // 15 uA (Deep sleep)
  const [sleepDurationMin, setSleepDurationMin] = useState<number>(10); // 10 min

  const batteryLifeResult = useMemo(() => {
    const sleepDurationSec = sleepDurationMin * 60;
    const totalCycleSec = activeDurationSec + sleepDurationSec;

    const sleepCurrentMa = sleepCurrentUa / 1000; // converter uA para mA

    // Consumo médio ponderado em mA
    const avgCurrentMa = (
      (activeCurrentMa * activeDurationSec) + 
      (sleepCurrentMa * sleepDurationSec)
    ) / totalCycleSec;

    // Fator de segurança de descarregamento (85% aproveitável)
    const usableCapacity = batteryCapacityMah * 0.85;

    const totalHours = usableCapacity / avgCurrentMa;
    const totalDays = totalHours / 24;
    const totalMonths = totalDays / 30.41;
    const totalYears = totalDays / 365.25;

    return {
      avgCurrentMa: avgCurrentMa.toFixed(4),
      totalHours: Math.round(totalHours).toLocaleString('pt-BR'),
      totalDays: Math.round(totalDays).toLocaleString('pt-BR'),
      totalMonths: totalMonths.toFixed(1),
      totalYears: totalYears.toFixed(2)
    };
  }, [batteryCapacityMah, activeCurrentMa, activeDurationSec, sleepCurrentUa, sleepDurationMin]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
                  Capitania #11 · IoT, Hardware & Sensors Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full font-bold">
                  255 Ferramentas Ativas
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Sensores de Hardware, Eletrônica & Engenharia IoT
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Fórmulas Termodinâmicas, Barometria, Resistores e UART</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('thermo-temp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'thermo-temp'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span>Termodinâmica & Código C++</span>
          </button>

          <button
            onClick={() => setActiveTab('pressure-calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'pressure-calc'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Pressão Barométrica & Altitude ICAO</span>
          </button>

          <button
            onClick={() => setActiveTab('resistor-calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'resistor-calc'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Código de Cores de Resistores</span>
          </button>

          <button
            onClick={() => setActiveTab('uart-baud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'uart-baud'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Baud Rate UART & Throughput</span>
          </button>

          <button
            onClick={() => setActiveTab('battery-life')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'battery-life'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Autonomia de Bateria IoT</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: TERMODINÂMICA & CÓDIGO C++ */}
        {/* ========================================================= */}
        {activeTab === 'thermo-temp' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Temperatura de Entrada</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Graus Celsius (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempCelsius}
                    onChange={e => setTempCelsius(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono text-rose-300 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block w-full mb-1">Pontos Notáveis:</span>
                  <button onClick={() => setTempCelsius(0)} className="px-2 py-1 text-xs bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">
                    0 °C (Fusão Gelo)
                  </button>
                  <button onClick={() => setTempCelsius(25)} className="px-2 py-1 text-xs bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">
                    25 °C (Ambiente)
                  </button>
                  <button onClick={() => setTempCelsius(37)} className="px-2 py-1 text-xs bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">
                    37 °C (Corpo Humano)
                  </button>
                  <button onClick={() => setTempCelsius(100)} className="px-2 py-1 text-xs bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">
                    100 °C (Ebulição Água)
                  </button>
                  <button onClick={() => setTempCelsius(-273.15)} className="px-2 py-1 text-xs bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-cyan-300 font-mono">
                    -273.15 °C (Zero Absoluto)
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Celsius</span>
                    <div className="text-xl font-bold text-slate-200">{tempConversions.c} °C</div>
                    <span className="text-[10px] text-slate-500 block mt-1">Escala Centígrada</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-amber-500 block mb-1">Fahrenheit</span>
                    <div className="text-xl font-bold text-amber-300">{tempConversions.f} °F</div>
                    <span className="text-[10px] text-slate-500 block mt-1">Sistema Imperial</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-cyan-900/60">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-1">Kelvin</span>
                    <div className="text-xl font-bold text-cyan-300">{tempConversions.k} K</div>
                    <span className="text-[10px] text-slate-500 block mt-1">Escala Absoluta SI</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Rankine</span>
                    <div className="text-xl font-bold text-slate-300">{tempConversions.r} °R</div>
                    <span className="text-[10px] text-slate-500 block mt-1">Absoluta Imperial</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">Snippet de Firmware C++ (Arduino / ESP32):</span>
                    <button onClick={() => copyToClipboard(tempConversions.arduinoSnippet, 'cpp-snip')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copiedKey === 'cpp-snip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar C++</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    {tempConversions.arduinoSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: PRESSÃO BAROMÉTRICA & ALTITUDE ICAO */}
        {/* ========================================================= */}
        {activeTab === 'pressure-calc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Leitura do Sensor Barométrico</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pressão em Hectopascais (hPa / mbar):</label>
                  <input
                    type="number"
                    step="0.25"
                    value={pressureHpa}
                    onChange={e => setPressureHpa(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono text-rose-300 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 text-[10px] block">Tendência Meteorológica:</span>
                  <div className={`p-2 rounded font-semibold border text-center text-xs ${pressureConversions.weatherBadgeColor}`}>
                    {pressureConversions.weatherTendency}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Bar</span>
                    <span className="text-lg font-bold text-slate-200">{pressureConversions.bar}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">PSI (lb/in²)</span>
                    <span className="text-lg font-bold text-amber-300">{pressureConversions.psi}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Atmosferas (atm)</span>
                    <span className="text-lg font-bold text-cyan-300">{pressureConversions.atm}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Torr / mmHg</span>
                    <span className="text-lg font-bold text-slate-200">{pressureConversions.mmhg}</span>
                  </div>
                </div>

                {/* Altitude ICAO Calculada */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Altitude Barométrica Estimada (Fórmula ICAO)</span>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {pressureConversions.altitudeMeters} metros ({pressureConversions.altitudeFeet} pés)
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded-lg">
                      P₀ = 1013.25 hPa
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Utilizada por altímetros aeronáuticos e sensores de drones (BMP280 / MS5611 / DPS310) para determinação de elevação sobre o nível médio do mar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: CÓDIGO DE CORES DE RESISTORES */}
        {/* ========================================================= */}
        {activeTab === 'resistor-calc' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">Número de Faixas:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResistorBandsCount(4)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${resistorBandsCount === 4 ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    4 Faixas (Padrão 5%)
                  </button>
                  <button
                    onClick={() => setResistorBandsCount(5)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${resistorBandsCount === 5 ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    5 Faixas (Precisão 1%)
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono block">VALOR RESISTIVO NOMINAL</span>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {resistorResult.formattedOhms}
                </div>
              </div>
            </div>

            {/* Visualizador do Resistor Físico */}
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex justify-center items-center">
              <div className="relative flex items-center">
                {/* Terminal Esquerdo */}
                <div className="w-16 h-2 bg-slate-600 rounded-l" />

                {/* Corpo do Resistor */}
                <div className="w-80 h-20 bg-amber-200/90 rounded-2xl shadow-2xl flex items-center justify-around px-6 border-4 border-amber-300">
                  <div className="w-4 h-full shadow" style={{ backgroundColor: colorCodes[band1].hex }} />
                  <div className="w-4 h-full shadow" style={{ backgroundColor: colorCodes[band2].hex }} />
                  {resistorBandsCount === 5 && (
                    <div className="w-4 h-full shadow" style={{ backgroundColor: colorCodes[band3].hex }} />
                  )}
                  <div className="w-4 h-full shadow" style={{ backgroundColor: colorCodes[bandMultiplier].hex }} />
                  <div className="w-4 h-full shadow" style={{ backgroundColor: bandTolerance === 5 ? '#d4af37' : '#c0c0c0' }} />
                </div>

                {/* Terminal Direito */}
                <div className="w-16 h-2 bg-slate-600 rounded-r" />
              </div>
            </div>

            {/* Controles das Faixas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block">1ª Faixa (1º Dígito):</span>
                <select value={band1} onChange={e => setBand1(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200">
                  {colorCodes.slice(1).map(c => (
                    <option key={c.val} value={c.val}>{c.val} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block">2ª Faixa (2º Dígito):</span>
                <select value={band2} onChange={e => setBand2(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200">
                  {colorCodes.map(c => (
                    <option key={c.val} value={c.val}>{c.val} - {c.name}</option>
                  ))}
                </select>
              </div>

              {resistorBandsCount === 5 && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-semibold block">3ª Faixa (3º Dígito):</span>
                  <select value={band3} onChange={e => setBand3(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200">
                    {colorCodes.map(c => (
                      <option key={c.val} value={c.val}>{c.val} - {c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block">Multiplicador:</span>
                <select value={bandMultiplier} onChange={e => setBandMultiplier(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200">
                  {colorCodes.map(c => (
                    <option key={c.val} value={c.val}>×10^{c.val} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block">Tolerância:</span>
                <select value={bandTolerance} onChange={e => setBandTolerance(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200">
                  {toleranceOptions.map(t => (
                    <option key={t.tol} value={t.tol}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: BAUD RATE UART & THROUGHPUT */}
        {/* ========================================================= */}
        {activeTab === 'uart-baud' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Parâmetros da UART</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Baud Rate (Bps):</label>
                  <select
                    value={baudRate}
                    onChange={e => setBaudRate(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 font-bold"
                  >
                    {[9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600].map(b => (
                      <option key={b} value={b}>{b} baud</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Data Bits:</label>
                    <select value={dataBits} onChange={e => setDataBits(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono">
                      <option value={8}>8 bits (Padrão)</option>
                      <option value={7}>7 bits</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Stop Bits:</label>
                    <select value={stopBits} onChange={e => setStopBits(parseInt(e.target.value, 10))} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono">
                      <option value={1}>1 bit</option>
                      <option value={2}>2 bits</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tamanho do Pacote (Bytes):</label>
                  <input
                    type="number"
                    value={payloadBytes}
                    onChange={e => setPayloadBytes(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Throughput Máximo</span>
                    <div className="text-2xl font-bold text-slate-200">{uartCalculations.bytesPerSecond} B/s</div>
                    <span className="text-xs text-cyan-400 mt-1 block">{uartCalculations.kilobytesPerSecond} KB/s</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Bits por Caractere</span>
                    <div className="text-2xl font-bold text-amber-400">{uartCalculations.bitsPerChar} bits</div>
                    <span className="text-xs text-slate-500 mt-1 block">1 Start + 8 Data + 1 Stop</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60">
                    <span className="text-[10px] uppercase font-mono text-rose-400 block mb-1">Latência do Payload</span>
                    <div className="text-2xl font-bold text-rose-300">{uartCalculations.timeMs} ms</div>
                    <span className="text-xs text-emerald-400 mt-1 block">Para {payloadBytes} Bytes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: AUTONOMIA DE BATERIA IOT */}
        {/* ========================================================= */}
        {activeTab === 'battery-life' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Perfil Energético do Dispositivo</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Capacidade da Bateria (mAh):</label>
                  <input
                    type="number"
                    value={batteryCapacityMah}
                    onChange={e => setBatteryCapacityMah(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-rose-300 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Corrente Ativa (mA):</label>
                    <input
                      type="number"
                      value={activeCurrentMa}
                      onChange={e => setActiveCurrentMa(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Duração Ativa (s):</label>
                    <input
                      type="number"
                      value={activeDurationSec}
                      onChange={e => setActiveDurationSec(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Deep Sleep (µA):</label>
                    <input
                      type="number"
                      value={sleepCurrentUa}
                      onChange={e => setSleepCurrentUa(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Intervalo Sleep (min):</label>
                    <input
                      type="number"
                      value={sleepDurationMin}
                      onChange={e => setSleepDurationMin(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Consumo Médio Ponderado</span>
                      <div className="text-xl font-bold text-cyan-300 font-mono">{batteryLifeResult.avgCurrentMa} mA contínuos</div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded-lg">
                      85% Eficiência Real
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-mono">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Horas Totais:</span>
                      <span className="text-slate-200 font-bold">{batteryLifeResult.totalHours} h</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Dias de Operação:</span>
                      <span className="text-cyan-400 font-bold">{batteryLifeResult.totalDays} dias</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Meses:</span>
                      <span className="text-amber-400 font-bold">{batteryLifeResult.totalMonths} meses</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-emerald-900/60">
                      <span className="text-slate-500 text-[10px] block">Vida Útil Estimada:</span>
                      <span className="text-emerald-400 font-bold text-base">{batteryLifeResult.totalYears} anos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
